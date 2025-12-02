# TypeScript Types Reference

All shared types are in `@ita-rp/shared-types`.

## Import

```typescript
import type {
  PlayerState,
  Rank,
  Achievement,
  Curriculum,
  Discipline,
  SpecificSkill,
  // ... etc
} from '@ita-rp/shared-types';
```

## Core Types

### Player & Game State

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

interface GameState {
  player: PlayerState;
  currentDiscipline: Discipline | null;
  currentSkill: SpecificSkill | null;
  currentStep: number;
  studySession: StudySession | null;
  curriculum: Curriculum | null;
}

interface StudySession {
  id: string;
  skillId: string;
  startTime: Date;
  endTime?: Date;
  completedSteps: number;
  totalSteps: number;
  performance: number;
  notes: string[];
}
```

### Rank & Achievement

```typescript
interface Rank {
  id: string;
  name: string;
  level: number;
  icon: string;
  requirements: RankRequirements;
}

interface RankRequirements {
  level: number;
  xp: number;
  completedDisciplines: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'study' | 'streak' | 'completion' | 'social';
}
```

### Curriculum Hierarchy

```typescript
interface Curriculum {
  metadata: CurriculumMetadata;
  areas: Area[];
  infographics: null;
  settings: null;
}

interface Area {
  id: string;
  name: string;
  description: string;
  totalSkills: number;
  percentage: number;
  disciplines: Discipline[];
}

interface Discipline {
  id: string;
  name: string;
  description: string;
  totalSkills: number;
  mainTopics: MainTopic[];
}

interface MainTopic {
  id: string;
  name: string;
  description: string;
  totalSkills: number;
  atomicTopics: AtomicTopic[];
}

interface AtomicTopic {
  id: string;
  name: string;
  description: string;
  individualConcepts: IndividualConcept[];
}

interface IndividualConcept {
  id: string;
  name: string;
  description: string;
  specificSkills: SpecificSkill[];
}

interface SpecificSkill {
  id: string;
  name: string;
  description: string;
  atomicExpansion: AtomicExpansion;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'not_started' | 'in_progress' | 'completed';
  prerequisites: string[];
}

interface AtomicExpansion {
  steps: LearningStep[];
  practicalExample: string;
  finalVerifications: string[];
  assessmentCriteria: string[];
  crossCurricularConnections: string[];
  realWorldApplication: string;
}

interface LearningStep {
  stepNumber: number;
  title: string;
  subSteps: string[];
  verification: string;
  estimatedTime: string;
  materials: string[];
  tips: string;
  learningObjective: string;
  commonMistakes: string[];
}
```

### Progress Tracking

```typescript
interface ProgressState {
  totalSkills: number;
  completedSkills: number;
  skillsByDiscipline: Record<string, DisciplineProgress>;
  weeklyStats: WeeklyStats;
  monthlyStats: MonthlyStats;
}

interface DisciplineProgress {
  disciplineId: string;
  completedSkills: number;
  totalSkills: number;
  completionPercentage: number;
  lastStudiedAt?: Date;
}

interface WeeklyStats {
  weekStart: Date;
  studyTime: number;
  skillsCompleted: number;
  averagePerformance: number;
  streakDays: number;
}
```

### Game Events

```typescript
interface GameEvent {
  type: 'skill_completed' | 'level_up' | 'achievement_unlocked' | 'streak_updated';
  payload: any;
  timestamp: Date;
}
```

### Engine Interfaces

```typescript
interface GameEngine {
  initialize(): Promise<void>;
  startScene(sceneId: string): Promise<void>;
  stopScene(sceneId: string): Promise<void>;
  getCurrentScene(): Scene | null;
  getScenes(): Scene[];
}

interface Scene {
  id: string;
  name: string;
  type: 'menu' | 'study' | 'progress' | 'settings' | 'achievement';
  initialize(): Promise<void>;
  update(deltaTime: number): void;
  render(): void;
  destroy(): void;
}

interface AudioManager {
  initialize(): Promise<void>;
  playSound(soundKey: string, volume?: number): void;
  playMusic(musicKey: string, loop?: boolean, volume?: number): void;
  stopMusic(): void;
  setMasterVolume(volume: number): void;
}
```

### UI Component Interfaces

```typescript
interface UIComponent {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  interactive: boolean;
  render(): void;
  update(deltaTime: number): void;
  destroy(): void;
}

interface Button extends UIComponent {
  text: string;
  onClick: () => void;
  hoverState?: 'normal' | 'hover' | 'pressed';
}

interface ProgressBar extends UIComponent {
  progress: number;
  maxValue: number;
  showText?: boolean;
  color?: string;
  backgroundColor?: string;
}
```

### Curriculum Utilities

```typescript
interface CurriculumFilter {
  discipline?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  status?: 'not_started' | 'in_progress' | 'completed';
  hasPrerequisites?: boolean;
  searchQuery?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  code: string;
  message: string;
  path: string;
}
```

## Type Hierarchy Diagram

```
CurriculumData
└── Curriculum
    └── Area[]
        └── Discipline[]
            └── MainTopic[]
                └── AtomicTopic[]
                    └── IndividualConcept[]
                        └── SpecificSkill[]
                            └── AtomicExpansion
                                └── LearningStep[]
```
