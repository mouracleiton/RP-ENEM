import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DailyChallengeSystem, DailyChallenge } from './daily-challenges';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window for browser environment detection
Object.defineProperty(global, 'window', {
  value: {},
});

describe('DailyChallengeSystem', () => {
  let system: DailyChallengeSystem;

  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    system = new DailyChallengeSystem();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateDailyChallenges', () => {
    it('should generate 5 challenges', () => {
      const challenges = system.generateDailyChallenges();
      expect(challenges).toHaveLength(5);
    });

    it('should include 2 easy, 2 medium, and 1 hard challenge', () => {
      const challenges = system.generateDailyChallenges();

      const easy = challenges.filter(c => c.difficulty === 'easy');
      const medium = challenges.filter(c => c.difficulty === 'medium');
      const hard = challenges.filter(c => c.difficulty === 'hard');

      expect(easy.length).toBe(2);
      expect(medium.length).toBe(2);
      expect(hard.length).toBe(1);
    });

    it('should always include login bonus as one of the easy challenges', () => {
      const challenges = system.generateDailyChallenges();
      const loginBonus = challenges.find(c => c.type === 'login_bonus');

      expect(loginBonus).toBeDefined();
      expect(loginBonus?.difficulty).toBe('easy');
      expect(loginBonus?.completed).toBe(true); // Auto-completed on load
    });

    it('should return same challenges when called multiple times on same day', () => {
      const first = system.generateDailyChallenges();
      const second = system.generateDailyChallenges();

      expect(first).toEqual(second);
    });

    it('should set expiration to end of current day', () => {
      const challenges = system.generateDailyChallenges();
      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );

      for (const challenge of challenges) {
        expect(challenge.expiresAt.getDate()).toBe(endOfDay.getDate());
        expect(challenge.expiresAt.getHours()).toBe(23);
        expect(challenge.expiresAt.getMinutes()).toBe(59);
      }
    });

    it('should give hard challenges bonus rewards', () => {
      const challenges = system.generateDailyChallenges();
      const hard = challenges.find(c => c.difficulty === 'hard');

      expect(hard?.bonusReward).toBeDefined();
      expect(['streak_protection', 'xp_multiplier']).toContain(
        hard?.bonusReward?.type
      );
    });

    it('should have unique IDs for all challenges', () => {
      const challenges = system.generateDailyChallenges();
      const ids = challenges.map(c => c.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should round XP rewards to nearest 5', () => {
      const challenges = system.generateDailyChallenges();

      for (const challenge of challenges) {
        expect(challenge.xpReward % 5).toBe(0);
      }
    });
  });

  describe('getChallenges', () => {
    it('should return challenges (generating if needed)', () => {
      const challenges = system.getChallenges();
      expect(challenges.length).toBeGreaterThan(0);
    });
  });

  describe('updateProgress', () => {
    it('should update progress for matching challenge type', () => {
      system.generateDailyChallenges();
      const updated = system.updateProgress('complete_skills', 1);

      expect(updated.length).toBeGreaterThanOrEqual(0);

      const challenges = system.getChallenges();
      const skillChallenge = challenges.find(
        c => c.type === 'complete_skills' && !c.completed
      );

      if (skillChallenge) {
        expect(skillChallenge.current).toBeGreaterThanOrEqual(1);
      }
    });

    it('should mark challenge as completed when target is reached', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const skillChallenge = challenges.find(
        c => c.type === 'complete_skills' && !c.completed
      );

      if (skillChallenge) {
        // Update progress to reach target
        system.updateProgress('complete_skills', skillChallenge.target);

        const updated = system.getChallenges();
        const updatedChallenge = updated.find(c => c.id === skillChallenge.id);

        expect(updatedChallenge?.completed).toBe(true);
      }
    });

    it('should not exceed target when updating progress', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const skillChallenge = challenges.find(
        c => c.type === 'complete_skills'
      );

      if (skillChallenge) {
        system.updateProgress('complete_skills', 100); // Way over target

        const updated = system.getChallenges();
        const updatedChallenge = updated.find(c => c.id === skillChallenge.id);

        expect(updatedChallenge?.current).toBeLessThanOrEqual(
          updatedChallenge?.target || 0
        );
      }
    });

    it('should not update already completed challenges', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const loginBonus = challenges.find(c => c.type === 'login_bonus');

      expect(loginBonus?.completed).toBe(true);

      const updated = system.updateProgress('login_bonus', 1);

      // Should not return login_bonus in updated since it's already complete
      expect(updated.some(c => c.type === 'login_bonus')).toBe(false);
    });

    it('should save to storage after update', () => {
      system.generateDailyChallenges();
      mockLocalStorage.setItem.mockClear();

      system.updateProgress('complete_skills', 1);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('claimReward', () => {
    it('should return reward for completed unclaimed challenge', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const loginBonus = challenges.find(c => c.type === 'login_bonus');

      expect(loginBonus).toBeDefined();
      expect(loginBonus?.completed).toBe(true);
      expect(loginBonus?.claimed).toBe(false);

      const reward = system.claimReward(loginBonus!.id);

      expect(reward).not.toBeNull();
      expect(reward?.xp).toBe(loginBonus?.xpReward);
    });

    it('should mark challenge as claimed after claiming', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const loginBonus = challenges.find(c => c.type === 'login_bonus');

      system.claimReward(loginBonus!.id);

      const updated = system.getChallenges();
      const updatedBonus = updated.find(c => c.id === loginBonus?.id);

      expect(updatedBonus?.claimed).toBe(true);
    });

    it('should return null for already claimed challenge', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const loginBonus = challenges.find(c => c.type === 'login_bonus');

      system.claimReward(loginBonus!.id); // First claim
      const secondClaim = system.claimReward(loginBonus!.id); // Second attempt

      expect(secondClaim).toBeNull();
    });

    it('should return null for incomplete challenge', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const incomplete = challenges.find(c => !c.completed);

      if (incomplete) {
        const reward = system.claimReward(incomplete.id);
        expect(reward).toBeNull();
      }
    });

    it('should return null for non-existent challenge', () => {
      system.generateDailyChallenges();
      const reward = system.claimReward('non_existent_id');
      expect(reward).toBeNull();
    });

    it('should include bonus reward for hard challenges', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const hard = challenges.find(c => c.difficulty === 'hard');

      if (hard) {
        // Complete the hard challenge
        system.updateProgress(hard.type, hard.target);
        const reward = system.claimReward(hard.id);

        expect(reward?.bonus).toBeDefined();
      }
    });
  });

  describe('getCompletedCount', () => {
    it('should return count of completed challenges', () => {
      system.generateDailyChallenges();

      // Login bonus should be auto-completed
      expect(system.getCompletedCount()).toBeGreaterThanOrEqual(1);
    });

    it('should increase when challenges are completed', () => {
      system.generateDailyChallenges();
      const initialCount = system.getCompletedCount();

      const challenges = system.getChallenges();
      const incomplete = challenges.find(
        c => c.type === 'complete_skills' && !c.completed
      );

      if (incomplete) {
        system.updateProgress('complete_skills', incomplete.target);
        expect(system.getCompletedCount()).toBeGreaterThan(initialCount);
      }
    });
  });

  describe('getClaimedCount', () => {
    it('should return 0 initially', () => {
      system.generateDailyChallenges();
      expect(system.getClaimedCount()).toBe(0);
    });

    it('should increase when rewards are claimed', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const loginBonus = challenges.find(c => c.type === 'login_bonus');

      system.claimReward(loginBonus!.id);

      expect(system.getClaimedCount()).toBe(1);
    });
  });

  describe('getTotalXPAvailable', () => {
    it('should return XP from completed unclaimed challenges', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const loginBonus = challenges.find(c => c.type === 'login_bonus');

      expect(system.getTotalXPAvailable()).toBe(loginBonus?.xpReward);
    });

    it('should return 0 after all rewards are claimed', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();
      const loginBonus = challenges.find(c => c.type === 'login_bonus');

      system.claimReward(loginBonus!.id);

      expect(system.getTotalXPAvailable()).toBe(0);
    });

    it('should sum multiple completed challenges', () => {
      system.generateDailyChallenges();
      const challenges = system.getChallenges();

      // Complete another challenge
      const skillChallenge = challenges.find(
        c => c.type === 'complete_skills' && !c.completed
      );

      if (skillChallenge) {
        system.updateProgress('complete_skills', skillChallenge.target);

        const completed = system
          .getChallenges()
          .filter(c => c.completed && !c.claimed);
        const expectedXP = completed.reduce((sum, c) => sum + c.xpReward, 0);

        expect(system.getTotalXPAvailable()).toBe(expectedXP);
      }
    });
  });

  describe('getTimeRemaining', () => {
    it('should return hours, minutes, and seconds', () => {
      const remaining = system.getTimeRemaining();

      expect(remaining).toHaveProperty('hours');
      expect(remaining).toHaveProperty('minutes');
      expect(remaining).toHaveProperty('seconds');
    });

    it('should return non-negative values', () => {
      const remaining = system.getTimeRemaining();

      expect(remaining.hours).toBeGreaterThanOrEqual(0);
      expect(remaining.minutes).toBeGreaterThanOrEqual(0);
      expect(remaining.seconds).toBeGreaterThanOrEqual(0);
    });

    it('should return values within valid ranges', () => {
      const remaining = system.getTimeRemaining();

      expect(remaining.hours).toBeLessThanOrEqual(24);
      expect(remaining.minutes).toBeLessThan(60);
      expect(remaining.seconds).toBeLessThan(60);
    });
  });

  describe('resetForNewDay', () => {
    it('should clear existing challenges', () => {
      system.generateDailyChallenges();
      const originalIds = system.getChallenges().map(c => c.id);

      system.resetForNewDay();

      const newIds = system.getChallenges().map(c => c.id);

      // New challenges should have different IDs
      const hasNewIds = newIds.every(id => !originalIds.includes(id));
      expect(hasNewIds).toBe(true);
    });

    it('should generate fresh challenges', () => {
      system.generateDailyChallenges();
      system.resetForNewDay();

      const challenges = system.getChallenges();
      expect(challenges.length).toBe(5);
    });
  });

  describe('localStorage persistence', () => {
    it('should save challenges to localStorage', () => {
      system.generateDailyChallenges();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ita-rp-daily-challenges',
        expect.any(String)
      );
    });

    it('should load challenges from localStorage on init', () => {
      // Generate and save challenges
      system.generateDailyChallenges();

      // Get the saved data
      const savedData = mockLocalStorage.setItem.mock.calls[0][1];

      // Clear and set up for new instance
      mockLocalStorage.getItem.mockReturnValue(savedData);

      // Create new instance
      const newSystem = new DailyChallengeSystem();
      const challenges = newSystem.getChallenges();

      expect(challenges.length).toBe(5);
    });
  });

  describe('challenge properties', () => {
    it('should have all required properties', () => {
      const challenges = system.generateDailyChallenges();

      for (const challenge of challenges) {
        expect(challenge.id).toBeDefined();
        expect(challenge.type).toBeDefined();
        expect(challenge.title).toBeDefined();
        expect(challenge.description).toBeDefined();
        expect(typeof challenge.target).toBe('number');
        expect(typeof challenge.current).toBe('number');
        expect(typeof challenge.xpReward).toBe('number');
        expect(['easy', 'medium', 'hard']).toContain(challenge.difficulty);
        expect(challenge.icon).toBeDefined();
        expect(challenge.expiresAt).toBeInstanceOf(Date);
        expect(typeof challenge.completed).toBe('boolean');
        expect(typeof challenge.claimed).toBe('boolean');
      }
    });

    it('should have valid challenge types', () => {
      const validTypes = [
        'complete_skills',
        'study_time',
        'perfect_quiz',
        'streak_maintain',
        'discipline_progress',
        'achievement_unlock',
        'login_bonus',
      ];

      const challenges = system.generateDailyChallenges();

      for (const challenge of challenges) {
        expect(validTypes).toContain(challenge.type);
      }
    });

    it('should have XP rewards in valid ranges', () => {
      const challenges = system.generateDailyChallenges();

      for (const challenge of challenges) {
        expect(challenge.xpReward).toBeGreaterThanOrEqual(25);
        expect(challenge.xpReward).toBeLessThanOrEqual(350);
      }
    });
  });
});
