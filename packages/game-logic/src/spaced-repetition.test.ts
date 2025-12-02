import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeSkillReview,
  calculateNextReview,
  getStudySchedule,
  getDailyStudyList,
  estimateRetention,
  getSkillMasteryLevel,
  calculateOverallMastery,
  getStudyStats,
  quizScoreToPerformance,
  exportReviewData,
  importReviewData,
  SkillReviewData,
} from './spaced-repetition';

describe('Spaced Repetition System', () => {
  describe('quizScoreToPerformance', () => {
    it('should convert 100% to performance 5', () => {
      expect(quizScoreToPerformance(100)).toBe(5);
    });

    it('should convert 90% to performance 4', () => {
      expect(quizScoreToPerformance(90)).toBe(4);
    });

    it('should convert 70% to performance 3', () => {
      expect(quizScoreToPerformance(70)).toBe(3);
    });

    it('should convert 50% to performance 2', () => {
      expect(quizScoreToPerformance(50)).toBe(2);
    });

    it('should convert 25% to performance 1', () => {
      expect(quizScoreToPerformance(25)).toBe(1);
    });

    it('should convert 0% to performance 0', () => {
      expect(quizScoreToPerformance(0)).toBe(0);
    });
  });

  describe('initializeSkillReview', () => {
    it('should create initial review data with default values', () => {
      const data = initializeSkillReview('skill-1');

      expect(data.skillId).toBe('skill-1');
      expect(data.easeFactor).toBe(2.5);
      expect(data.interval).toBe(1);
      expect(data.repetitions).toBe(0);
      expect(data.totalReviews).toBe(0);
      expect(data.averagePerformance).toBe(0);
      expect(data.lastReviewDate).toBeNull();
    });

    it('should set nextReviewDate to today', () => {
      const data = initializeSkillReview('skill-1');
      const today = new Date().toISOString().split('T')[0];

      expect(data.nextReviewDate).toBe(today);
    });
  });

  describe('calculateNextReview', () => {
    let initialData: SkillReviewData;

    beforeEach(() => {
      initialData = initializeSkillReview('skill-1');
    });

    it('should reset on failed review (performance < 3)', () => {
      const result = calculateNextReview(initialData, 2);

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.lastPerformance).toBe(2);
    });

    it('should increase repetitions on successful review', () => {
      const result = calculateNextReview(initialData, 4);

      expect(result.repetitions).toBe(1);
      expect(result.totalReviews).toBe(1);
    });

    it('should set interval to 1 on first successful review', () => {
      const result = calculateNextReview(initialData, 5);

      expect(result.interval).toBe(1);
    });

    it('should set interval to 6 on second successful review', () => {
      let data = calculateNextReview(initialData, 5);
      data = calculateNextReview(data, 5);

      expect(data.interval).toBe(6);
    });

    it('should multiply interval by ease factor on subsequent reviews', () => {
      let data = calculateNextReview(initialData, 5);
      data = calculateNextReview(data, 5);
      const thirdReview = calculateNextReview(data, 5);

      // interval = round(6 * easeFactor)
      expect(thirdReview.interval).toBeGreaterThan(6);
    });

    it('should update average performance correctly', () => {
      let data = calculateNextReview(initialData, 5);
      expect(data.averagePerformance).toBe(5);

      data = calculateNextReview(data, 3);
      expect(data.averagePerformance).toBe(4); // (5 + 3) / 2
    });

    it('should decrease ease factor on poor performance', () => {
      const result = calculateNextReview(initialData, 3);

      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should increase ease factor on perfect performance', () => {
      const result = calculateNextReview(initialData, 5);

      expect(result.easeFactor).toBeGreaterThanOrEqual(2.5);
    });

    it('should not go below minimum ease factor', () => {
      let data = initialData;
      // Multiple poor reviews
      for (let i = 0; i < 20; i++) {
        data = calculateNextReview(data, 0);
      }

      expect(data.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('getStudySchedule', () => {
    it('should identify new skills', () => {
      const reviewData = new Map<string, SkillReviewData>();
      const allSkillIds = ['skill-1', 'skill-2', 'skill-3'];

      const schedule = getStudySchedule(reviewData, allSkillIds);

      expect(schedule.newSkills).toHaveLength(3);
      expect(schedule.newSkills).toContain('skill-1');
    });

    it('should identify due today skills', () => {
      const reviewData = new Map<string, SkillReviewData>();
      const today = new Date().toISOString().split('T')[0];

      reviewData.set('skill-1', {
        ...initializeSkillReview('skill-1'),
        nextReviewDate: today,
        totalReviews: 1,
      });

      const schedule = getStudySchedule(reviewData, ['skill-1', 'skill-2']);

      expect(schedule.dueToday).toHaveLength(1);
      expect(schedule.dueToday[0].skillId).toBe('skill-1');
      expect(schedule.newSkills).toContain('skill-2');
    });

    it('should identify overdue skills', () => {
      const reviewData = new Map<string, SkillReviewData>();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      reviewData.set('skill-1', {
        ...initializeSkillReview('skill-1'),
        nextReviewDate: yesterday.toISOString().split('T')[0],
        totalReviews: 1,
      });

      const schedule = getStudySchedule(reviewData, ['skill-1']);

      expect(schedule.overdue).toHaveLength(1);
    });

    it('should identify upcoming skills', () => {
      const reviewData = new Map<string, SkillReviewData>();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      reviewData.set('skill-1', {
        ...initializeSkillReview('skill-1'),
        nextReviewDate: tomorrow.toISOString().split('T')[0],
        totalReviews: 1,
      });

      const schedule = getStudySchedule(reviewData, ['skill-1']);

      expect(schedule.upcoming).toHaveLength(1);
    });
  });

  describe('getDailyStudyList', () => {
    it('should prioritize overdue items', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const schedule = {
        overdue: [
          { ...initializeSkillReview('overdue-1'), nextReviewDate: yesterday.toISOString().split('T')[0] },
        ],
        dueToday: [
          { ...initializeSkillReview('today-1') },
        ],
        upcoming: [],
        newSkills: ['new-1'],
      };

      const list = getDailyStudyList(schedule as any, 10);

      expect(list[0]).toBe('overdue-1');
    });

    it('should respect max items limit', () => {
      const schedule = {
        overdue: [],
        dueToday: [],
        upcoming: [],
        newSkills: ['new-1', 'new-2', 'new-3', 'new-4', 'new-5'],
      };

      const list = getDailyStudyList(schedule as any, 3);

      expect(list).toHaveLength(3);
    });

    it('should limit new skills to 3 by default', () => {
      const schedule = {
        overdue: [],
        dueToday: [],
        upcoming: [],
        newSkills: ['new-1', 'new-2', 'new-3', 'new-4', 'new-5'],
      };

      const list = getDailyStudyList(schedule as any, 20);

      expect(list).toHaveLength(3);
    });
  });

  describe('estimateRetention', () => {
    it('should return 0 for skills never reviewed', () => {
      const data = initializeSkillReview('skill-1');

      expect(estimateRetention(data)).toBe(0);
    });

    it('should return high retention for recently reviewed skills', () => {
      const today = new Date().toISOString().split('T')[0];
      const data: SkillReviewData = {
        ...initializeSkillReview('skill-1'),
        lastReviewDate: today,
        interval: 7,
        easeFactor: 2.5,
      };

      const retention = estimateRetention(data);
      expect(retention).toBeGreaterThan(80);
    });
  });

  describe('getSkillMasteryLevel', () => {
    it('should return "new" for skills with no reviews', () => {
      const data = initializeSkillReview('skill-1');
      expect(getSkillMasteryLevel(data)).toBe('new');
    });

    it('should return "learning" for skills with < 2 repetitions', () => {
      const data: SkillReviewData = {
        ...initializeSkillReview('skill-1'),
        totalReviews: 1,
        repetitions: 1,
      };
      expect(getSkillMasteryLevel(data)).toBe('learning');
    });

    it('should return "reviewing" for skills with short intervals', () => {
      const data: SkillReviewData = {
        ...initializeSkillReview('skill-1'),
        totalReviews: 5,
        repetitions: 3,
        interval: 14,
      };
      expect(getSkillMasteryLevel(data)).toBe('reviewing');
    });

    it('should return "mastered" for skills with long intervals', () => {
      const data: SkillReviewData = {
        ...initializeSkillReview('skill-1'),
        totalReviews: 10,
        repetitions: 5,
        interval: 30,
      };
      expect(getSkillMasteryLevel(data)).toBe('mastered');
    });
  });

  describe('calculateOverallMastery', () => {
    it('should return 0 for empty skill list', () => {
      const reviewData = new Map<string, SkillReviewData>();
      expect(calculateOverallMastery(reviewData, [])).toBe(0);
    });

    it('should calculate weighted mastery', () => {
      const reviewData = new Map<string, SkillReviewData>();

      // One mastered skill
      reviewData.set('skill-1', {
        ...initializeSkillReview('skill-1'),
        totalReviews: 10,
        repetitions: 5,
        interval: 30,
      });

      // One new skill
      reviewData.set('skill-2', initializeSkillReview('skill-2'));

      const mastery = calculateOverallMastery(reviewData, ['skill-1', 'skill-2']);
      expect(mastery).toBe(50); // (100 + 0) / 2
    });
  });

  describe('getStudyStats', () => {
    it('should calculate statistics correctly', () => {
      const reviewData = new Map<string, SkillReviewData>();

      reviewData.set('skill-1', {
        ...initializeSkillReview('skill-1'),
        totalReviews: 10,
        repetitions: 5,
        interval: 30,
        easeFactor: 2.6,
      });

      reviewData.set('skill-2', {
        ...initializeSkillReview('skill-2'),
        totalReviews: 3,
        repetitions: 2,
        interval: 10,
        easeFactor: 2.4,
      });

      const stats = getStudyStats(reviewData);

      expect(stats.totalSkills).toBe(2);
      expect(stats.masteredSkills).toBe(1);
      expect(stats.reviewingSkills).toBe(1);
      expect(stats.totalReviews).toBe(13);
      expect(stats.averageEaseFactor).toBe(2.5);
    });
  });

  describe('exportReviewData / importReviewData', () => {
    it('should export and import data correctly', () => {
      const reviewData = new Map<string, SkillReviewData>();
      reviewData.set('skill-1', initializeSkillReview('skill-1'));
      reviewData.set('skill-2', initializeSkillReview('skill-2'));

      const exported = exportReviewData(reviewData);
      const imported = importReviewData(exported);

      expect(imported.size).toBe(2);
      expect(imported.get('skill-1')).toBeDefined();
      expect(imported.get('skill-2')).toBeDefined();
    });
  });
});
