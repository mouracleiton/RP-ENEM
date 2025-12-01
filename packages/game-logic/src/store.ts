import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PlayerState,
  GameState,
  Discipline,
  SpecificSkill,
  StudySession,
  PlayerSettings,
  Rank,
  Achievement,
} from '@ita-rp/shared-types';

// Define available ranks
const AERONAUTICS_RANKS: Rank[] = [
  {
    id: 'recruit',
    name: 'Recruta',
    level: 1,
    icon: '🎖️',
    requirements: { level: 1, xp: 0, completedDisciplines: 0 },
  },
  {
    id: 'soldier',
    name: 'Soldado',
    level: 5,
    icon: '⭐',
    requirements: { level: 5, xp: 500, completedDisciplines: 1 },
  },
  {
    id: 'corporal',
    name: 'Cabo',
    level: 10,
    icon: '🌟',
    requirements: { level: 10, xp: 1500, completedDisciplines: 2 },
  },
  {
    id: 'sergeant',
    name: 'Sargento',
    level: 15,
    icon: '💫',
    requirements: { level: 15, xp: 3000, completedDisciplines: 3 },
  },
  {
    id: 'lieutenant',
    name: 'Tenente',
    level: 20,
    icon: '✨',
    requirements: { level: 20, xp: 5000, completedDisciplines: 4 },
  },
  {
    id: 'captain',
    name: 'Capitão',
    level: 30,
    icon: '🌠',
    requirements: { level: 30, xp: 10000, completedDisciplines: 6 },
  },
  {
    id: 'major',
    name: 'Major',
    level: 40,
    icon: '🌌',
    requirements: { level: 40, xp: 20000, completedDisciplines: 8 },
  },
  {
    id: 'colonel',
    name: 'Coronel',
    level: 50,
    icon: '🌃',
    requirements: { level: 50, xp: 35000, completedDisciplines: 10 },
  },
  {
    id: 'brigadier',
    name: 'Brigadeiro',
    level: 60,
    icon: '🌆',
    requirements: { level: 60, xp: 50000, completedDisciplines: 12 },
  },
  {
    id: 'marshal',
    name: 'Marechal do Ar',
    level: 100,
    icon: '🏆',
    requirements: { level: 100, xp: 100000, completedDisciplines: 20 },
  },
];

interface GameStore extends GameState {
  // Player actions
  createPlayer: (name: string) => void;
  updatePlayer: (updates: Partial<PlayerState>) => void;
  addXP: (amount: number) => void;
  completeSkill: (skillId: string) => void;
  unlockAchievement: (achievement: Achievement) => void;
  updateStreak: () => void;
  addStudyTime: (minutes: number) => void;
  updateSettings: (settings: Partial<PlayerState['settings']>) => void;

  // Game state actions
  setCurrentDiscipline: (discipline: Discipline | null) => void;
  setCurrentSkill: (skill: SpecificSkill | null) => void;
  setCurrentStep: (step: number) => void;
  startStudySession: (skillId: string) => void;
  endStudySession: (performance: number) => void;

  // Utility functions
  getCurrentRank: () => Rank;
  getNextRank: () => Rank | null;
  calculateLevelProgress: () => { current: number; next: number; percentage: number };
  getDisciplineProgress: (disciplineId: string) => {
    completed: number;
    total: number;
    percentage: number;
  };
  checkAndUpdateStreak: () => { streakUpdated: boolean; newStreak: number; streakLost: boolean };
}

const createDefaultPlayer = (): PlayerState => ({
  id: `player_${Date.now()}`,
  name: 'Cadete',
  level: 1,
  xp: 0,
  currentRank: AERONAUTICS_RANKS[0],
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
});

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      player: createDefaultPlayer(),
      currentDiscipline: null,
      currentSkill: null,
      currentStep: 0,
      studySession: null,
      curriculum: null,

      // Player actions
      createPlayer: (name: string) => {
        const newPlayer = createDefaultPlayer();
        newPlayer.name = name;
        set({ player: newPlayer });
      },

      updatePlayer: (updates: Partial<PlayerState>) => {
        set(state => ({
          player: { ...state.player, ...updates },
        }));
      },

      addXP: (amount: number) => {
        set(state => {
          const newXP = state.player.xp + amount;
          const newLevel = calculateLevel(newXP);
          const newRank = getCurrentRankForLevel(newLevel);

          return {
            player: {
              ...state.player,
              xp: newXP,
              level: newLevel,
              currentRank: newRank,
            },
          };
        });
      },

      completeSkill: (skillId: string) => {
        set(state => {
          const completedSkills = [...state.player.completedSkills, skillId];
          const newLevel = calculateLevel(state.player.xp);
          const newRank = getCurrentRankForLevel(newLevel);

          return {
            player: {
              ...state.player,
              completedSkills,
              level: newLevel,
              currentRank: newRank,
            },
          };
        });
      },

      unlockAchievement: (achievement: Achievement) => {
        set(state => ({
          player: {
            ...state.player,
            achievements: [...state.player.achievements, achievement],
          },
        }));
      },

      updateStreak: () => {
        set(state => {
          const today = new Date().toDateString();
          const lastStudy = state.player.lastStudyDate;

          if (lastStudy === today) {
            // Already studied today, no change
            return state;
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();

          let newStreak = state.player.currentStreak;

          if (lastStudy === yesterdayStr) {
            // Consecutive day - increment streak
            newStreak = state.player.currentStreak + 1;
          } else if (lastStudy === null || lastStudy !== today) {
            // First day or streak broken - reset to 1
            newStreak = 1;
          }

          const newLongestStreak = Math.max(newStreak, state.player.longestStreak);

          return {
            player: {
              ...state.player,
              currentStreak: newStreak,
              longestStreak: newLongestStreak,
              lastStudyDate: today,
            },
          };
        });
      },

      addStudyTime: (minutes: number) => {
        set(state => ({
          player: {
            ...state.player,
            totalStudyTime: state.player.totalStudyTime + minutes,
          },
        }));
      },

      updateSettings: (settings: Partial<PlayerState['settings']>) => {
        set(state => ({
          player: {
            ...state.player,
            settings: { ...state.player.settings, ...settings },
          },
        }));
      },

      // Game state actions
      setCurrentDiscipline: (discipline: Discipline | null) => {
        set({ currentDiscipline: discipline });
      },

      setCurrentSkill: (skill: SpecificSkill | null) => {
        set({ currentSkill: skill, currentStep: 0 });
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      startStudySession: (skillId: string) => {
        const session: StudySession = {
          id: `session_${Date.now()}`,
          skillId,
          startTime: new Date(),
          completedSteps: 0,
          totalSteps: 1,
          performance: 0,
          notes: [],
        };
        set({ studySession: session });
      },

      endStudySession: (performance: number) => {
        set(state => {
          if (!state.studySession) return state;

          const updatedSession = {
            ...state.studySession,
            endTime: new Date(),
            performance,
          };

          return {
            studySession: updatedSession,
          };
        });
      },

      // Utility functions
      getCurrentRank: () => {
        const state = get();
        return getCurrentRankForLevel(state.player.level);
      },

      getNextRank: () => {
        const state = get();
        const currentRankIndex = AERONAUTICS_RANKS.findIndex(
          rank => rank.id === state.player.currentRank.id
        );
        return AERONAUTICS_RANKS[currentRankIndex + 1] || null;
      },

      calculateLevelProgress: () => {
        const state = get();
        const currentLevel = state.player.level;
        const currentXP = state.player.xp;
        const currentLevelXP = calculateXPForLevel(currentLevel);
        const nextLevelXP = calculateXPForLevel(currentLevel + 1);
        const progress =
          nextLevelXP > currentLevelXP
            ? ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
            : 100;

        return {
          current: currentXP - currentLevelXP,
          next: nextLevelXP - currentLevelXP,
          percentage: Math.min(progress, 100),
        };
      },

      getDisciplineProgress: (disciplineId: string) => {
        const state = get();
        // This would need curriculum data to calculate properly
        // For now, return mock data
        return {
          completed: 0,
          total: 52, // Mock total
          percentage: 0,
        };
      },

      checkAndUpdateStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const lastStudy = state.player.lastStudyDate;

        if (lastStudy === today) {
          return { streakUpdated: false, newStreak: state.player.currentStreak, streakLost: false };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastStudy === yesterdayStr) {
          return { streakUpdated: false, newStreak: state.player.currentStreak, streakLost: false };
        }

        // Check if streak was lost (more than 1 day gap)
        if (lastStudy !== null && lastStudy !== yesterdayStr && lastStudy !== today) {
          return { streakUpdated: false, newStreak: 0, streakLost: true };
        }

        return { streakUpdated: false, newStreak: state.player.currentStreak, streakLost: false };
      },
    }),
    {
      name: 'ita-rp-game-store',
      partialize: state => ({
        player: state.player,
        // Don't persist current session state
      }),
    }
  )
);

// Utility functions
function calculateLevel(xp: number): number {
  let level = 1;
  let xpForNextLevel = 100;

  while (xp >= xpForNextLevel) {
    level++;
    xpForNextLevel += Math.floor(100 * Math.pow(level, 1.5));
  }

  return level;
}

function calculateXPForLevel(level: number): number {
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += Math.floor(100 * Math.pow(i, 1.5));
  }
  return totalXP;
}

function getCurrentRankForLevel(level: number): Rank {
  return AERONAUTICS_RANKS.filter(rank => rank.level <= level).pop() || AERONAUTICS_RANKS[0];
}

export { AERONAUTICS_RANKS };
