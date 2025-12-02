import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  exportPlayerData,
  importPlayerData,
  type ExportData,
} from './data-export';
import { useGameStore } from './store';

// Mock localStorage
const localStorageMock = (() => {
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

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('DataExport', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset store
    useGameStore.setState({
      player: {
        id: 'test-player',
        name: 'Test Player',
        level: 5,
        xp: 1500,
        currentRank: {
          id: 'recruit',
          name: 'Recruta',
          level: 1,
          icon: '🎖️',
          requirements: { level: 1, xp: 0, completedDisciplines: 0 },
        },
        completedSkills: ['skill-1', 'skill-2'],
        currentStreak: 7,
        longestStreak: 14,
        lastStudyDate: '2024-01-15',
        totalStudyTime: 300,
        achievements: [],
        settings: {
          theme: 'neonBlue',
          soundEnabled: true,
          notificationsEnabled: true,
          language: 'pt-BR',
          studyReminders: true,
        },
      },
      currentDiscipline: null,
      currentSkill: null,
      currentStep: 0,
      studySession: null,
      curriculum: null,
    });
  });

  describe('exportPlayerData', () => {
    it('should export player data with correct structure', () => {
      const exported = exportPlayerData();

      expect(exported.version).toBe('1.0.0');
      expect(exported.exportDate).toBeDefined();
      expect(exported.player).toBeDefined();
      expect(exported.player.name).toBe('Test Player');
      expect(exported.player.level).toBe(5);
      expect(exported.player.xp).toBe(1500);
      expect(exported.metadata).toBeDefined();
      expect(exported.metadata.appVersion).toBe('2.0.0');
    });

    it('should include completed skills', () => {
      const exported = exportPlayerData();

      expect(exported.player.completedSkills).toContain('skill-1');
      expect(exported.player.completedSkills).toContain('skill-2');
    });

    it('should include streak information', () => {
      const exported = exportPlayerData();

      expect(exported.player.currentStreak).toBe(7);
      expect(exported.player.longestStreak).toBe(14);
    });

    it('should increment export count', () => {
      exportPlayerData();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('ita-rp-game-export-count', '1');

      exportPlayerData();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('ita-rp-game-export-count');
    });
  });

  describe('importPlayerData', () => {
    it('should import valid data successfully', () => {
      const validData: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        player: {
          id: 'imported-player',
          name: 'Imported Player',
          level: 10,
          xp: 5000,
          currentRank: {
            id: 'corporal',
            name: 'Cabo',
            level: 10,
            icon: '🌟',
            requirements: { level: 10, xp: 1500, completedDisciplines: 2 },
          },
          completedSkills: ['skill-a', 'skill-b', 'skill-c'],
          currentStreak: 21,
          longestStreak: 30,
          lastStudyDate: '2024-02-01',
          totalStudyTime: 600,
          achievements: [],
          settings: {
            theme: 'matrixGreen',
            soundEnabled: false,
            notificationsEnabled: true,
            language: 'pt-BR',
            studyReminders: true,
          },
        },
        metadata: {
          appVersion: '2.0.0',
          totalExports: 5,
        },
      };

      const result = importPlayerData(JSON.stringify(validData));

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
    });

    it('should reject invalid JSON', () => {
      const result = importPlayerData('not valid json');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject data with missing required fields', () => {
      const invalidData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        // Missing player field
      };

      const result = importPlayerData(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing or invalid player field');
    });

    it('should reject data with invalid player fields', () => {
      const invalidData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        player: {
          id: 123, // Should be string
          name: 'Test',
          level: 1,
          xp: 0,
          completedSkills: [],
        },
      };

      const result = importPlayerData(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing or invalid player.id');
    });

    it('should reject incompatible versions', () => {
      const incompatibleData: ExportData = {
        version: '2.0.0', // Different major version
        exportDate: new Date().toISOString(),
        player: {
          id: 'test',
          name: 'Test',
          level: 1,
          xp: 0,
          currentRank: {
            id: 'recruit',
            name: 'Recruta',
            level: 1,
            icon: '🎖️',
            requirements: { level: 1, xp: 0, completedDisciplines: 0 },
          },
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
        },
        metadata: {
          appVersion: '2.0.0',
          totalExports: 1,
        },
      };

      const result = importPlayerData(JSON.stringify(incompatibleData));

      expect(result.success).toBe(false);
      expect(result.message).toContain('Incompatible version');
    });

    it('should update store with imported data', () => {
      const validData: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        player: {
          id: 'new-player',
          name: 'New Player Name',
          level: 15,
          xp: 8000,
          currentRank: {
            id: 'sergeant',
            name: 'Sargento',
            level: 15,
            icon: '💫',
            requirements: { level: 15, xp: 3000, completedDisciplines: 3 },
          },
          completedSkills: ['skill-x', 'skill-y'],
          currentStreak: 5,
          longestStreak: 10,
          lastStudyDate: '2024-03-01',
          totalStudyTime: 450,
          achievements: [],
          settings: {
            theme: 'cyberPurple',
            soundEnabled: true,
            notificationsEnabled: false,
            language: 'pt-BR',
            studyReminders: false,
          },
        },
        metadata: {
          appVersion: '2.0.0',
          totalExports: 3,
        },
      };

      importPlayerData(JSON.stringify(validData));

      const state = useGameStore.getState();
      expect(state.player.name).toBe('New Player Name');
      expect(state.player.level).toBe(15);
      expect(state.player.xp).toBe(8000);
    });

    it('should restore study history if present', () => {
      const dataWithHistory: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        player: {
          id: 'test',
          name: 'Test',
          level: 1,
          xp: 0,
          currentRank: {
            id: 'recruit',
            name: 'Recruta',
            level: 1,
            icon: '🎖️',
            requirements: { level: 1, xp: 0, completedDisciplines: 0 },
          },
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
        },
        studyHistory: [
          { id: 'h1', skillId: 'skill-1', date: '2024-01-01', duration: 30, performance: 85 },
          { id: 'h2', skillId: 'skill-2', date: '2024-01-02', duration: 45, performance: 90 },
        ],
        metadata: {
          appVersion: '2.0.0',
          totalExports: 1,
        },
      };

      importPlayerData(JSON.stringify(dataWithHistory));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ita-rp-game-study-history',
        expect.any(String)
      );
    });
  });

  describe('validation', () => {
    it('should require version field', () => {
      const data = {
        exportDate: new Date().toISOString(),
        player: { id: 'test', name: 'Test', level: 1, xp: 0, completedSkills: [] },
      };

      const result = importPlayerData(JSON.stringify(data));
      expect(result.errors).toContain('Missing or invalid version field');
    });

    it('should require exportDate field', () => {
      const data = {
        version: '1.0.0',
        player: { id: 'test', name: 'Test', level: 1, xp: 0, completedSkills: [] },
      };

      const result = importPlayerData(JSON.stringify(data));
      expect(result.errors).toContain('Missing or invalid exportDate field');
    });

    it('should require completedSkills to be an array', () => {
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        player: { id: 'test', name: 'Test', level: 1, xp: 0, completedSkills: 'not-array' },
      };

      const result = importPlayerData(JSON.stringify(data));
      expect(result.errors).toContain('Missing or invalid player.completedSkills');
    });
  });
});
