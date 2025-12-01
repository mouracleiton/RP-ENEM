import { describe, it, expect } from 'vitest';
import { AchievementSystem, ALL_ACHIEVEMENTS } from './achievement-system';
import { PlayerState, Achievement, GameEvent } from '@ita-rp/shared-types';
import { AERONAUTICS_RANKS } from './rank-system';

// Helper para criar um player de teste
const createMockPlayer = (
  overrides: Partial<PlayerState> = {}
): PlayerState => ({
  id: 'test-player',
  name: 'Test Player',
  level: 1,
  xp: 0,
  currentRank: AERONAUTICS_RANKS[AERONAUTICS_RANKS.length - 1], // Recruta
  completedSkills: [],
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  totalStudyTime: 0,
  achievements: [],
  settings: {
    theme: 'neonBlue',
    soundEnabled: true,
    notificationsEnabled: true,
    language: 'pt-BR',
    studyReminders: true,
  },
  ...overrides,
});

// Helper para criar eventos de jogo
const createSkillCompletedEvent = (
  skillId: string,
  performance: number = 0.8,
  timeSpent?: number,
  expectedTime?: number
): GameEvent => ({
  type: 'skill_completed',
  payload: {
    skillId,
    performance,
    timeSpent,
    expectedTime,
    xpEarned: 50,
    timestamp: new Date(),
  },
  timestamp: new Date(),
});

const createStreakUpdatedEvent = (newStreak: number): GameEvent => ({
  type: 'streak_updated',
  payload: { newStreak, timestamp: new Date() },
  timestamp: new Date(),
});

const createLevelUpEvent = (newLevel: number): GameEvent => ({
  type: 'level_up',
  payload: { newLevel, timestamp: new Date() },
  timestamp: new Date(),
});

describe('AchievementSystem', () => {
  describe('ALL_ACHIEVEMENTS', () => {
    it('should have at least 20 achievements defined', () => {
      expect(ALL_ACHIEVEMENTS.length).toBeGreaterThanOrEqual(20);
    });

    it('should have unique IDs for all achievements', () => {
      const ids = ALL_ACHIEVEMENTS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required properties for each achievement', () => {
      for (const achievement of ALL_ACHIEVEMENTS) {
        expect(achievement.id).toBeDefined();
        expect(achievement.name).toBeDefined();
        expect(achievement.description).toBeDefined();
        expect(achievement.icon).toBeDefined();
        expect(achievement.category).toBeDefined();
        expect(['study', 'streak', 'completion', 'social']).toContain(
          achievement.category
        );
      }
    });

    it('should have achievements in all categories', () => {
      const categories = new Set(ALL_ACHIEVEMENTS.map(a => a.category));
      expect(categories.has('study')).toBe(true);
      expect(categories.has('streak')).toBe(true);
      expect(categories.has('completion')).toBe(true);
      expect(categories.has('social')).toBe(true);
    });
  });

  describe('checkAchievements', () => {
    describe('skill_completed events', () => {
      it('should unlock "first_steps" when completing first skill', () => {
        const player = createMockPlayer({
          completedSkills: ['skill1'], // Just completed first skill
        });
        const event = createSkillCompletedEvent('skill1');

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'first_steps')).toBe(true);
      });

      it('should unlock "apprentice" when completing 10th skill', () => {
        const player = createMockPlayer({
          completedSkills: Array.from({ length: 10 }, (_, i) => `skill${i}`),
        });
        const event = createSkillCompletedEvent('skill9');

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'apprentice')).toBe(true);
      });

      it('should unlock "dedicated_student" when completing 50th skill', () => {
        const player = createMockPlayer({
          completedSkills: Array.from({ length: 50 }, (_, i) => `skill${i}`),
        });
        const event = createSkillCompletedEvent('skill49');

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'dedicated_student')).toBe(true);
      });

      it('should unlock "master" when completing 100th skill', () => {
        const player = createMockPlayer({
          completedSkills: Array.from({ length: 100 }, (_, i) => `skill${i}`),
        });
        const event = createSkillCompletedEvent('skill99');

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'master')).toBe(true);
      });

      it('should unlock "speed_learner" when completing skill in less than half expected time', () => {
        const player = createMockPlayer({
          completedSkills: ['skill1'],
        });
        const event = createSkillCompletedEvent('skill1', 0.9, 25, 60); // 25 min of 60 expected

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'speed_learner')).toBe(true);
      });

      it('should NOT unlock "speed_learner" when completing skill in more than half expected time', () => {
        const player = createMockPlayer({
          completedSkills: ['skill1'],
        });
        const event = createSkillCompletedEvent('skill1', 0.9, 35, 60); // 35 min of 60 expected

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'speed_learner')).toBe(false);
      });

      it('should not unlock already unlocked achievements', () => {
        const existingAchievement = ALL_ACHIEVEMENTS.find(
          a => a.id === 'first_steps'
        )!;
        const player = createMockPlayer({
          completedSkills: ['skill1'],
          achievements: [existingAchievement],
        });
        const event = createSkillCompletedEvent('skill1');

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'first_steps')).toBe(false);
      });
    });

    describe('streak_updated events', () => {
      it('should unlock "first_week" at 7-day streak', () => {
        const player = createMockPlayer({ currentStreak: 7 });
        const event = createStreakUpdatedEvent(7);

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'first_week')).toBe(true);
      });

      it('should unlock "dedicated_month" at 30-day streak', () => {
        const player = createMockPlayer({ currentStreak: 30 });
        const event = createStreakUpdatedEvent(30);

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'dedicated_month')).toBe(true);
      });

      it('should unlock "warrior" at 90-day streak', () => {
        const player = createMockPlayer({ currentStreak: 90 });
        const event = createStreakUpdatedEvent(90);

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'warrior')).toBe(true);
      });

      it('should unlock "legendary" at 365-day streak', () => {
        const player = createMockPlayer({ currentStreak: 365 });
        const event = createStreakUpdatedEvent(365);

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'legendary')).toBe(true);
      });

      it('should NOT unlock streak achievements at wrong milestones', () => {
        const player = createMockPlayer({ currentStreak: 8 });
        const event = createStreakUpdatedEvent(8);

        const unlocked = AchievementSystem.checkAchievements(player, event);

        expect(unlocked.some(a => a.id === 'first_week')).toBe(false);
        expect(unlocked.some(a => a.id === 'dedicated_month')).toBe(false);
      });
    });

    describe('level_up events', () => {
      it('should not crash on level_up event', () => {
        const player = createMockPlayer({ level: 5 });
        const event = createLevelUpEvent(5);

        expect(() => {
          AchievementSystem.checkAchievements(player, event);
        }).not.toThrow();
      });
    });
  });

  describe('unlockAchievement', () => {
    it('should return achievement with updated unlock date', () => {
      const before = new Date();
      const achievement = AchievementSystem.unlockAchievement(
        'player1',
        'first_steps'
      );
      const after = new Date();

      expect(achievement.id).toBe('first_steps');
      expect(achievement.unlockedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(achievement.unlockedAt.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });

    it('should throw error for invalid achievement ID', () => {
      expect(() => {
        AchievementSystem.unlockAchievement('player1', 'invalid_achievement');
      }).toThrow("Achievement with id 'invalid_achievement' not found");
    });
  });

  describe('getAchievementsByCategory', () => {
    it('should return only study achievements for study category', () => {
      const studyAchievements =
        AchievementSystem.getAchievementsByCategory('study');

      expect(studyAchievements.length).toBeGreaterThan(0);
      expect(studyAchievements.every(a => a.category === 'study')).toBe(true);
    });

    it('should return only streak achievements for streak category', () => {
      const streakAchievements =
        AchievementSystem.getAchievementsByCategory('streak');

      expect(streakAchievements.length).toBeGreaterThan(0);
      expect(streakAchievements.every(a => a.category === 'streak')).toBe(true);
    });

    it('should return only completion achievements for completion category', () => {
      const completionAchievements =
        AchievementSystem.getAchievementsByCategory('completion');

      expect(completionAchievements.length).toBeGreaterThan(0);
      expect(
        completionAchievements.every(a => a.category === 'completion')
      ).toBe(true);
    });

    it('should return only social achievements for social category', () => {
      const socialAchievements =
        AchievementSystem.getAchievementsByCategory('social');

      expect(socialAchievements.length).toBeGreaterThan(0);
      expect(socialAchievements.every(a => a.category === 'social')).toBe(true);
    });
  });

  describe('getAllAchievements', () => {
    it('should return all achievements', () => {
      const all = AchievementSystem.getAllAchievements();
      expect(all.length).toBe(ALL_ACHIEVEMENTS.length);
    });

    it('should return a copy, not the original array', () => {
      const all = AchievementSystem.getAllAchievements();
      all.pop();
      expect(AchievementSystem.getAllAchievements().length).toBe(
        ALL_ACHIEVEMENTS.length
      );
    });
  });

  describe('calculateAchievementProgress', () => {
    it('should return 0 for first_steps with no completed skills', () => {
      const player = createMockPlayer({ completedSkills: [] });
      const progress = AchievementSystem.calculateAchievementProgress(
        'first_steps',
        player
      );
      expect(progress).toBe(0);
    });

    it('should return 1.0 for first_steps with 1+ completed skills', () => {
      const player = createMockPlayer({ completedSkills: ['skill1'] });
      const progress = AchievementSystem.calculateAchievementProgress(
        'first_steps',
        player
      );
      expect(progress).toBe(1.0);
    });

    it('should return 0.5 for apprentice with 5 completed skills', () => {
      const player = createMockPlayer({
        completedSkills: Array.from({ length: 5 }, (_, i) => `skill${i}`),
      });
      const progress = AchievementSystem.calculateAchievementProgress(
        'apprentice',
        player
      );
      expect(progress).toBe(0.5);
    });

    it('should return 1.0 for apprentice with 10+ completed skills', () => {
      const player = createMockPlayer({
        completedSkills: Array.from({ length: 15 }, (_, i) => `skill${i}`),
      });
      const progress = AchievementSystem.calculateAchievementProgress(
        'apprentice',
        player
      );
      expect(progress).toBe(1.0);
    });

    it('should return correct progress for streak achievements', () => {
      const player = createMockPlayer({ currentStreak: 15 });

      expect(
        AchievementSystem.calculateAchievementProgress('first_week', player)
      ).toBe(1.0); // 15/7 capped at 1.0

      expect(
        AchievementSystem.calculateAchievementProgress('dedicated_month', player)
      ).toBe(0.5); // 15/30
    });

    it('should return 0 for unknown achievements', () => {
      const player = createMockPlayer();
      const progress = AchievementSystem.calculateAchievementProgress(
        'unknown_achievement',
        player
      );
      expect(progress).toBe(0);
    });
  });

  describe('getProgressDescription', () => {
    it('should return correct description for skill achievements', () => {
      const player = createMockPlayer({
        completedSkills: ['skill1', 'skill2', 'skill3'],
      });

      expect(
        AchievementSystem.getProgressDescription('first_steps', player)
      ).toBe('3/1 habilidades');
      expect(
        AchievementSystem.getProgressDescription('apprentice', player)
      ).toBe('3/10 habilidades');
      expect(
        AchievementSystem.getProgressDescription('dedicated_student', player)
      ).toBe('3/50 habilidades');
      expect(AchievementSystem.getProgressDescription('master', player)).toBe(
        '3/100 habilidades'
      );
    });

    it('should return correct description for streak achievements', () => {
      const player = createMockPlayer({ currentStreak: 15 });

      expect(
        AchievementSystem.getProgressDescription('first_week', player)
      ).toBe('15/7 dias');
      expect(
        AchievementSystem.getProgressDescription('dedicated_month', player)
      ).toBe('15/30 dias');
      expect(AchievementSystem.getProgressDescription('warrior', player)).toBe(
        '15/90 dias'
      );
      expect(
        AchievementSystem.getProgressDescription('legendary', player)
      ).toBe('15/365 dias');
    });

    it('should throw error for unknown achievements', () => {
      const player = createMockPlayer();
      expect(() =>
        AchievementSystem.getProgressDescription('unknown_achievement', player)
      ).toThrow("Achievement with id 'unknown_achievement' not found");
    });
  });

  describe('isAchievementUnlocked', () => {
    it('should return false for locked achievement', () => {
      const player = createMockPlayer({ achievements: [] });
      expect(
        AchievementSystem.isAchievementUnlocked('first_steps', player)
      ).toBe(false);
    });

    it('should return true for unlocked achievement', () => {
      const firstSteps = ALL_ACHIEVEMENTS.find(a => a.id === 'first_steps')!;
      const player = createMockPlayer({ achievements: [firstSteps] });
      expect(
        AchievementSystem.isAchievementUnlocked('first_steps', player)
      ).toBe(true);
    });
  });

  describe('getUnlockedAchievements', () => {
    it('should return empty array for player with no achievements', () => {
      const player = createMockPlayer({ achievements: [] });
      expect(AchievementSystem.getUnlockedAchievements(player)).toHaveLength(0);
    });

    it('should return player achievements', () => {
      const firstSteps = ALL_ACHIEVEMENTS.find(a => a.id === 'first_steps')!;
      const apprentice = ALL_ACHIEVEMENTS.find(a => a.id === 'apprentice')!;
      const player = createMockPlayer({
        achievements: [firstSteps, apprentice],
      });

      const unlocked = AchievementSystem.getUnlockedAchievements(player);

      expect(unlocked).toHaveLength(2);
      expect(unlocked.some(a => a.id === 'first_steps')).toBe(true);
      expect(unlocked.some(a => a.id === 'apprentice')).toBe(true);
    });
  });

  describe('getLockedAchievements', () => {
    it('should return all achievements for new player', () => {
      const player = createMockPlayer({ achievements: [] });
      const locked = AchievementSystem.getLockedAchievements(player);
      expect(locked.length).toBe(ALL_ACHIEVEMENTS.length);
    });

    it('should exclude unlocked achievements', () => {
      const firstSteps = ALL_ACHIEVEMENTS.find(a => a.id === 'first_steps')!;
      const player = createMockPlayer({ achievements: [firstSteps] });

      const locked = AchievementSystem.getLockedAchievements(player);

      expect(locked.length).toBe(ALL_ACHIEVEMENTS.length - 1);
      expect(locked.some(a => a.id === 'first_steps')).toBe(false);
    });
  });

  describe('getAchievementStats', () => {
    it('should return correct stats for new player', () => {
      const player = createMockPlayer({ achievements: [] });
      const stats = AchievementSystem.getAchievementStats(player);

      expect(stats.total).toBe(ALL_ACHIEVEMENTS.length);
      expect(stats.unlocked).toBe(0);
      expect(stats.locked).toBe(ALL_ACHIEVEMENTS.length);
      expect(stats.completionRate).toBe(0);
    });

    it('should calculate completion rate correctly', () => {
      const firstSteps = ALL_ACHIEVEMENTS.find(a => a.id === 'first_steps')!;
      const apprentice = ALL_ACHIEVEMENTS.find(a => a.id === 'apprentice')!;
      const player = createMockPlayer({
        achievements: [firstSteps, apprentice],
      });

      const stats = AchievementSystem.getAchievementStats(player);

      expect(stats.unlocked).toBe(2);
      expect(stats.locked).toBe(ALL_ACHIEVEMENTS.length - 2);
      expect(stats.completionRate).toBeCloseTo(2 / ALL_ACHIEVEMENTS.length, 4);
    });

    it('should provide category stats', () => {
      const firstSteps = ALL_ACHIEVEMENTS.find(a => a.id === 'first_steps')!;
      const firstWeek = ALL_ACHIEVEMENTS.find(a => a.id === 'first_week')!;
      const player = createMockPlayer({
        achievements: [firstSteps, firstWeek],
      });

      const stats = AchievementSystem.getAchievementStats(player);

      expect(stats.categoryStats.study).toBeDefined();
      expect(stats.categoryStats.streak).toBeDefined();
      expect(stats.categoryStats.completion).toBeDefined();
      expect(stats.categoryStats.social).toBeDefined();

      expect(stats.categoryStats.study.unlocked).toBe(1);
      expect(stats.categoryStats.streak.unlocked).toBe(1);
    });
  });
});
