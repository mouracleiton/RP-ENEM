/**
 * Study Session Hook
 * Manages study session state with persistence to prevent progress loss
 */

import { useState, useEffect, useCallback } from 'react';

interface StudySessionStep {
  id: string;
  title: string;
  completed: boolean;
  timeSpent: number; // seconds
  score?: number;
}

interface StudySessionData {
  skillId: string;
  disciplineId: string;
  skillName: string;
  startTime: number;
  lastActiveTime: number;
  currentStepIndex: number;
  steps: StudySessionStep[];
  quizAnswers: Record<string, string>;
  quizScore: number;
  totalTimeSpent: number; // seconds
  status: 'active' | 'paused' | 'completed' | 'abandoned';
}

interface UseStudySessionOptions {
  autoSaveInterval?: number; // ms, default 10000
  maxInactiveTime?: number; // ms, default 30 min
  onSessionRestore?: (session: StudySessionData) => void;
  onSessionExpire?: (session: StudySessionData) => void;
}

const STORAGE_KEY = 'ita-rp-active-study-session';
const DEFAULT_AUTO_SAVE_INTERVAL = 10000; // 10 seconds
const DEFAULT_MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 minutes

export function useStudySession(options: UseStudySessionOptions = {}) {
  const {
    autoSaveInterval = DEFAULT_AUTO_SAVE_INTERVAL,
    maxInactiveTime = DEFAULT_MAX_INACTIVE_TIME,
    onSessionRestore,
    onSessionExpire,
  } = options;

  const [session, setSession] = useState<StudySessionData | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = loadSession();
    if (savedSession) {
      const inactiveTime = Date.now() - savedSession.lastActiveTime;

      if (inactiveTime > maxInactiveTime) {
        // Session expired
        if (onSessionExpire) {
          onSessionExpire(savedSession);
        }
        clearSession();
      } else if (savedSession.status === 'active' || savedSession.status === 'paused') {
        // Restore session
        setSession(savedSession);
        setHasRestoredSession(true);
        if (onSessionRestore) {
          onSessionRestore(savedSession);
        }
      }
    }
  }, []);

  // Auto-save session periodically
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const interval = setInterval(() => {
      saveSession({
        ...session,
        lastActiveTime: Date.now(),
      });
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [session, autoSaveInterval]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session && session.status === 'active') {
        saveSession({
          ...session,
          status: 'paused',
          lastActiveTime: Date.now(),
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session]);

  const loadSession = (): StudySessionData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading study session:', error);
    }
    return null;
  };

  const saveSession = (data: StudySessionData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving study session:', error);
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing study session:', error);
    }
  };

  const startSession = useCallback((
    skillId: string,
    disciplineId: string,
    skillName: string,
    steps: Array<{ id: string; title: string }>
  ) => {
    const newSession: StudySessionData = {
      skillId,
      disciplineId,
      skillName,
      startTime: Date.now(),
      lastActiveTime: Date.now(),
      currentStepIndex: 0,
      steps: steps.map(step => ({
        id: step.id,
        title: step.title,
        completed: false,
        timeSpent: 0,
      })),
      quizAnswers: {},
      quizScore: 0,
      totalTimeSpent: 0,
      status: 'active',
    };

    setSession(newSession);
    saveSession(newSession);
    setHasRestoredSession(false);
  }, []);

  const updateStep = useCallback((stepIndex: number, updates: Partial<StudySessionStep>) => {
    setSession(prev => {
      if (!prev) return prev;

      const newSteps = [...prev.steps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates };

      const updated: StudySessionData = {
        ...prev,
        steps: newSteps,
        lastActiveTime: Date.now(),
      };

      saveSession(updated);
      return updated;
    });
  }, []);

  const completeStep = useCallback((stepIndex: number, score?: number) => {
    setSession(prev => {
      if (!prev) return prev;

      const newSteps = [...prev.steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        completed: true,
        score,
      };

      const updated: StudySessionData = {
        ...prev,
        steps: newSteps,
        currentStepIndex: Math.min(stepIndex + 1, newSteps.length - 1),
        lastActiveTime: Date.now(),
      };

      saveSession(updated);
      return updated;
    });
  }, []);

  const setCurrentStep = useCallback((stepIndex: number) => {
    setSession(prev => {
      if (!prev) return prev;

      const updated: StudySessionData = {
        ...prev,
        currentStepIndex: stepIndex,
        lastActiveTime: Date.now(),
      };

      saveSession(updated);
      return updated;
    });
  }, []);

  const saveQuizAnswer = useCallback((questionId: string, answer: string) => {
    setSession(prev => {
      if (!prev) return prev;

      const updated: StudySessionData = {
        ...prev,
        quizAnswers: {
          ...prev.quizAnswers,
          [questionId]: answer,
        },
        lastActiveTime: Date.now(),
      };

      saveSession(updated);
      return updated;
    });
  }, []);

  const updateQuizScore = useCallback((score: number) => {
    setSession(prev => {
      if (!prev) return prev;

      const updated: StudySessionData = {
        ...prev,
        quizScore: score,
        lastActiveTime: Date.now(),
      };

      saveSession(updated);
      return updated;
    });
  }, []);

  const addTimeSpent = useCallback((seconds: number) => {
    setSession(prev => {
      if (!prev) return prev;

      const updated: StudySessionData = {
        ...prev,
        totalTimeSpent: prev.totalTimeSpent + seconds,
        lastActiveTime: Date.now(),
      };

      saveSession(updated);
      return updated;
    });
  }, []);

  const pauseSession = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;

      const updated: StudySessionData = {
        ...prev,
        status: 'paused',
        lastActiveTime: Date.now(),
      };

      saveSession(updated);
      return updated;
    });
  }, []);

  const resumeSession = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;

      const updated: StudySessionData = {
        ...prev,
        status: 'active',
        lastActiveTime: Date.now(),
      };

      saveSession(updated);
      return updated;
    });
  }, []);

  const completeSession = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;

      const updated: StudySessionData = {
        ...prev,
        status: 'completed',
        lastActiveTime: Date.now(),
      };

      // Save to history before clearing
      saveSessionToHistory(updated);
      clearSession();

      return null;
    });
  }, []);

  const abandonSession = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;

      const updated: StudySessionData = {
        ...prev,
        status: 'abandoned',
        lastActiveTime: Date.now(),
      };

      // Save to history as abandoned
      saveSessionToHistory(updated);
      clearSession();

      return null;
    });
  }, []);

  const dismissRestoredSession = useCallback(() => {
    clearSession();
    setSession(null);
    setHasRestoredSession(false);
  }, []);

  return {
    session,
    hasRestoredSession,
    startSession,
    updateStep,
    completeStep,
    setCurrentStep,
    saveQuizAnswer,
    updateQuizScore,
    addTimeSpent,
    pauseSession,
    resumeSession,
    completeSession,
    abandonSession,
    dismissRestoredSession,
  };
}

// Save completed sessions to history
const HISTORY_KEY = 'ita-rp-study-history';
const MAX_HISTORY_ITEMS = 50;

function saveSessionToHistory(session: StudySessionData) {
  try {
    const historyData = localStorage.getItem(HISTORY_KEY);
    const history: StudySessionData[] = historyData ? JSON.parse(historyData) : [];

    // Add to beginning of array
    history.unshift(session);

    // Keep only the last N items
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving session to history:', error);
  }
}

export function getStudyHistory(): StudySessionData[] {
  try {
    const historyData = localStorage.getItem(HISTORY_KEY);
    return historyData ? JSON.parse(historyData) : [];
  } catch (error) {
    console.error('Error loading study history:', error);
    return [];
  }
}

export function getSkillPerformanceHistory(skillId: string): StudySessionData[] {
  const history = getStudyHistory();
  return history.filter(session => session.skillId === skillId);
}

export function getAveragePerformance(skillId?: string): number {
  const history = skillId
    ? getSkillPerformanceHistory(skillId)
    : getStudyHistory();

  const completedSessions = history.filter(s => s.status === 'completed' && s.quizScore > 0);

  if (completedSessions.length === 0) return 0;

  const totalScore = completedSessions.reduce((sum, s) => sum + s.quizScore, 0);
  return totalScore / completedSessions.length;
}

export type { StudySessionData, StudySessionStep };
