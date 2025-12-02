# State Management Guide

This document explains the Zustand store architecture in `@ita-rp/game-logic`.

## Overview

The game uses [Zustand](https://github.com/pmndrs/zustand) for state management with localStorage persistence.

## Store Structure

```typescript
interface GameStore {
  // State
  player: PlayerState;
  currentDiscipline: Discipline | null;
  currentSkill: SpecificSkill | null;
  currentStep: number;
  studySession: StudySession | null;
  curriculum: Curriculum | null;

  // Actions
  createPlayer: (name: string) => void;
  updatePlayer: (updates: Partial<PlayerState>) => void;
  addXP: (amount: number) => void;
  completeSkill: (skillId: string) => void;
  unlockAchievement: (achievement: Achievement) => void;
  updateStreak: () => void;
  addStudyTime: (minutes: number) => void;
  updateSettings: (settings: Partial<PlayerSettings>) => void;

  // Game actions
  setCurrentDiscipline: (discipline: Discipline | null) => void;
  setCurrentSkill: (skill: SpecificSkill | null) => void;
  setCurrentStep: (step: number) => void;
  startStudySession: (skillId: string) => void;
  endStudySession: (performance: number) => void;

  // Utilities
  getCurrentRank: () => Rank;
  getNextRank: () => Rank | null;
  calculateLevelProgress: () => { current: number; next: number; percentage: number };
  getDisciplineProgress: (disciplineId: string) => { completed: number; total: number; percentage: number };
  checkAndUpdateStreak: () => { streakUpdated: boolean; newStreak: number; streakLost: boolean };
}
```

## Usage

### Basic Usage

```typescript
import { useGameStore } from '@ita-rp/game-logic';

function PlayerProfile() {
  const player = useGameStore(state => state.player);
  const addXP = useGameStore(state => state.addXP);

  return (
    <div>
      <h1>{player.name}</h1>
      <p>Level: {player.level}</p>
      <p>XP: {player.xp}</p>
      <button onClick={() => addXP(100)}>Add 100 XP</button>
    </div>
  );
}
```

### Selecting Multiple Values

```typescript
// Select multiple values efficiently
const { player, currentDiscipline } = useGameStore(state => ({
  player: state.player,
  currentDiscipline: state.currentDiscipline,
}));
```

### Using Actions

```typescript
function StudyButton() {
  const startStudySession = useGameStore(state => state.startStudySession);
  const completeSkill = useGameStore(state => state.completeSkill);
  const addXP = useGameStore(state => state.addXP);

  const handleComplete = (skillId: string, xpEarned: number) => {
    completeSkill(skillId);
    addXP(xpEarned);
  };

  return <button onClick={() => startStudySession('skill-1')}>Start</button>;
}
```

## Player State

```typescript
interface PlayerState {
  id: string;
  name: string;
  level: number;
  xp: number;
  currentRank: Rank;
  completedSkills: string[];
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalStudyTime: number;
  achievements: Achievement[];
  settings: PlayerSettings;
}

interface PlayerSettings {
  theme: 'neonBlue' | 'matrixGreen' | 'cyberPurple' | 'retroOrange';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'pt-BR' | 'en-US';
  studyReminders: boolean;
}
```

## Rank System

The store includes 10 aeronautical ranks:

| Rank | Level Required | XP Required |
|------|----------------|-------------|
| Recruta | 1 | 0 |
| Soldado | 5 | 500 |
| Cabo | 10 | 1,500 |
| Sargento | 15 | 3,000 |
| Tenente | 20 | 5,000 |
| Capitão | 30 | 10,000 |
| Major | 40 | 20,000 |
| Coronel | 50 | 35,000 |
| Brigadeiro | 60 | 50,000 |
| Marechal do Ar | 100 | 100,000 |

## Level Calculation

```typescript
// XP required for each level follows: 100 × level^1.5
function calculateLevel(xp: number): number {
  let level = 1;
  let xpForNextLevel = 100;

  while (xp >= xpForNextLevel) {
    level++;
    xpForNextLevel += Math.floor(100 * Math.pow(level, 1.5));
  }

  return level;
}
```

## Persistence

Data is automatically persisted to localStorage:

```typescript
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'ita-rp-game-store',
    partialize: (state) => ({
      player: state.player,  // Only player data is persisted
    }),
  }
)
```

**Storage Key**: `ita-rp-game-store`

## Streak Management

```typescript
// Check and update streak on app load
const { streakUpdated, newStreak, streakLost } = checkAndUpdateStreak();

if (streakLost) {
  showNotification('Streak lost! Start again today.');
}

// Update streak when studying
updateStreak();  // Call when user completes a study session
```

## Best Practices

1. **Select only what you need** to prevent unnecessary re-renders
2. **Use actions** instead of directly manipulating state
3. **Check streak** on app initialization
4. **Persist settings** changes immediately
