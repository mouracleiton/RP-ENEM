/**
 * React hook for Spaced Repetition System
 * Manages skill review scheduling and persistence
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SkillReviewData,
  StudySchedule,
  initializeSkillReview,
  calculateNextReview,
  getStudySchedule,
  getDailyStudyList,
  estimateRetention,
  getSkillMasteryLevel,
  calculateOverallMastery,
  getStudyStats,
  quizScoreToPerformance,
} from './spaced-repetition';

const STORAGE_KEY = 'ita-rp-srs-data';

export interface UseSpacedRepetitionOptions {
  autoSave?: boolean;
  maxDailyItems?: number;
}

export interface SpacedRepetitionState {
  reviewData: Map<string, SkillReviewData>;
  schedule: StudySchedule | null;
  dailyStudyList: string[];
  isLoading: boolean;
  lastSyncTime: Date | null;
}

export function useSpacedRepetition(
  allSkillIds: string[],
  options: UseSpacedRepetitionOptions = {}
) {
  const { autoSave = true, maxDailyItems = 20 } = options;

  const [state, setState] = useState<SpacedRepetitionState>({
    reviewData: new Map(),
    schedule: null,
    dailyStudyList: [],
    isLoading: true,
    lastSyncTime: null,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const reviewData = new Map<string, SkillReviewData>(
            Object.entries(parsed.reviewData || {})
          );
          setState((prev) => ({
            ...prev,
            reviewData,
            lastSyncTime: parsed.lastSyncTime ? new Date(parsed.lastSyncTime) : null,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading SRS data:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadData();
  }, []);

  // Update schedule when reviewData or allSkillIds change
  useEffect(() => {
    if (state.isLoading) return;

    const schedule = getStudySchedule(state.reviewData, allSkillIds);
    const dailyStudyList = getDailyStudyList(schedule, maxDailyItems);

    setState((prev) => ({
      ...prev,
      schedule,
      dailyStudyList,
    }));
  }, [state.reviewData, state.isLoading, allSkillIds, maxDailyItems]);

  // Save data to localStorage
  const saveData = useCallback(() => {
    try {
      const data = {
        reviewData: Object.fromEntries(state.reviewData),
        lastSyncTime: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setState((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
      }));
    } catch (error) {
      console.error('Error saving SRS data:', error);
    }
  }, [state.reviewData]);

  // Auto-save when data changes
  useEffect(() => {
    if (autoSave && !state.isLoading && state.reviewData.size > 0) {
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [state.reviewData, autoSave, state.isLoading, saveData]);

  // Start learning a new skill
  const startSkill = useCallback((skillId: string) => {
    setState((prev) => {
      if (prev.reviewData.has(skillId)) {
        return prev;
      }

      const newReviewData = new Map(prev.reviewData);
      newReviewData.set(skillId, initializeSkillReview(skillId));

      return { ...prev, reviewData: newReviewData };
    });
  }, []);

  // Record a review session
  const recordReview = useCallback((
    skillId: string,
    performance: number // 0-5
  ) => {
    setState((prev) => {
      const newReviewData = new Map(prev.reviewData);
      const current = newReviewData.get(skillId) || initializeSkillReview(skillId);
      const updated = calculateNextReview(current, performance);
      newReviewData.set(skillId, updated);

      return { ...prev, reviewData: newReviewData };
    });
  }, []);

  // Record quiz result as review
  const recordQuizResult = useCallback((
    skillId: string,
    quizPercentage: number
  ) => {
    const performance = quizScoreToPerformance(quizPercentage);
    recordReview(skillId, performance);
  }, [recordReview]);

  // Get data for a specific skill
  const getSkillData = useCallback((skillId: string): SkillReviewData | null => {
    return state.reviewData.get(skillId) || null;
  }, [state.reviewData]);

  // Get retention estimate for a skill
  const getRetention = useCallback((skillId: string): number => {
    const data = state.reviewData.get(skillId);
    if (!data) return 0;
    return estimateRetention(data);
  }, [state.reviewData]);

  // Get mastery level for a skill
  const getMasteryLevel = useCallback((skillId: string) => {
    const data = state.reviewData.get(skillId);
    if (!data) return 'new' as const;
    return getSkillMasteryLevel(data);
  }, [state.reviewData]);

  // Calculate overall mastery for given skills
  const getOverallMastery = useCallback((skillIds: string[]) => {
    return calculateOverallMastery(state.reviewData, skillIds);
  }, [state.reviewData]);

  // Get study statistics
  const stats = useMemo(() => {
    return getStudyStats(state.reviewData);
  }, [state.reviewData]);

  // Check if skill is due for review
  const isDue = useCallback((skillId: string): boolean => {
    if (!state.schedule) return false;
    return (
      state.schedule.dueToday.some((s) => s.skillId === skillId) ||
      state.schedule.overdue.some((s) => s.skillId === skillId)
    );
  }, [state.schedule]);

  // Get next review date for a skill
  const getNextReviewDate = useCallback((skillId: string): string | null => {
    const data = state.reviewData.get(skillId);
    return data?.nextReviewDate || null;
  }, [state.reviewData]);

  // Reset all data
  const resetAllData = useCallback(() => {
    setState({
      reviewData: new Map(),
      schedule: null,
      dailyStudyList: [],
      isLoading: false,
      lastSyncTime: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Reset specific skill
  const resetSkill = useCallback((skillId: string) => {
    setState((prev) => {
      const newReviewData = new Map(prev.reviewData);
      newReviewData.delete(skillId);
      return { ...prev, reviewData: newReviewData };
    });
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    schedule: state.schedule,
    dailyStudyList: state.dailyStudyList,
    lastSyncTime: state.lastSyncTime,
    stats,

    // Actions
    startSkill,
    recordReview,
    recordQuizResult,
    saveData,
    resetAllData,
    resetSkill,

    // Getters
    getSkillData,
    getRetention,
    getMasteryLevel,
    getOverallMastery,
    isDue,
    getNextReviewDate,
  };
}

export default useSpacedRepetition;
