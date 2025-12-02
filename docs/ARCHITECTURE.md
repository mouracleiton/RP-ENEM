# Architecture

This document provides a deep-dive into the ITA RP Game system architecture.

## Overview

ITA RP Game is built as a monorepo using npm workspaces, with clear separation between shared packages and applications.

```
ita-rp-game/
├── packages/                    # Shared libraries
│   ├── core-engine/            # Phaser 3 game engine wrapper
│   ├── game-logic/             # Gamification systems (XP, Ranks, Achievements)
│   ├── ui-components/          # React component library
│   ├── curriculum/             # Education content management
│   └── shared-types/           # TypeScript type definitions
├── apps/
│   └── web-app/                # Main React application
└── docs/                       # Documentation
```

## Package Dependencies

```
                    ┌─────────────────┐
                    │  shared-types   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  game-logic    │  │  curriculum    │  │  core-engine   │
└────────┬───────┘  └────────┬───────┘  └────────┬───────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │  ui-components  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    web-app      │
                    └─────────────────┘
```

## Packages

### @ita-rp/shared-types

**Purpose**: Central type definitions shared across all packages.

**Key Types**:
- `PlayerState` - Player data (XP, level, achievements, settings)
- `Rank` - Military rank progression system
- `Achievement` - Unlockable accomplishments
- `Curriculum`, `Discipline`, `SpecificSkill` - Educational content hierarchy
- `GameState`, `StudySession` - Runtime game state

**Location**: `packages/shared-types/src/index.ts`

### @ita-rp/game-logic

**Purpose**: Core gamification business logic.

**Key Modules**:

| Module | Description |
|--------|-------------|
| `store.ts` | Zustand state management with persistence |
| `xp-system.ts` | XP calculation with multipliers |
| `rank-system.ts` | 19 aeronautical ranks with progression |
| `achievement-system.ts` | 30+ achievements across 4 categories |
| `daily-challenges.ts` | Daily mission system |
| `useStudySession.ts` | Study session management hook |

**XP Formula**:
```typescript
baseXP = difficultyMultiplier × 100
performanceBonus = baseXP × (performance / 100)
streakBonus = baseXP × (streak × 0.05)  // 5% per streak day
finalXP = baseXP + performanceBonus + streakBonus
```

### @ita-rp/ui-components

**Purpose**: React component library with cyberpunk theming.

**Components** (24 total):
- **Layout**: `Card`, `Modal`, `Navbar`, `PageTransition`
- **Forms**: `Button`, `Text`
- **Progress**: `ProgressBar`, `Skeleton`
- **Game**: `RankBadge`, `AchievementCard`, `DisciplineCard`, `SkillCard`, `SkillTree`
- **Interactive**: `Quiz`, `DailyChallenges`, `Leaderboard`, `Onboarding`
- **Feedback**: `Notification`, `CelebrationModal`, `ErrorBoundary`
- **Theming**: `ThemeProvider`

**Themes** (4 available):
- `neonBlue` - Cyan/blue futuristic
- `matrixGreen` - Classic cyberpunk green
- `cyberPurple` - Vibrant purple
- `retroOrange` - Retro-futuristic

### @ita-rp/curriculum

**Purpose**: Educational content management.

**Key Files**:
- `CurriculumService.ts` - Load and query curriculum data
- `useCurriculum.ts` - React hook for curriculum access

**Data Hierarchy**:
```
Area (e.g., "Mathematics")
└── Discipline (e.g., "Calculus I")
    └── MainTopic (e.g., "Derivatives")
        └── AtomicTopic (e.g., "Chain Rule")
            └── IndividualConcept
                └── SpecificSkill (atomic learning unit)
```

### @ita-rp/core-engine

**Purpose**: Phaser 3 game engine integration (foundational).

**Components**:
- `GameEngine.ts` - Phaser scene setup
- `AudioManager.ts` - Sound effects
- `InputManager.ts` - Keyboard/mouse handling
- `SceneManager.ts` - Scene transitions

## Data Flow

### State Management

```
┌─────────────────────────────────────────────────────────┐
│                     Zustand Store                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Player    │  │    Game     │  │  Curriculum │     │
│  │   State     │  │   State     │  │    State    │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                   React Components                       │
│  useGameStore()  useStudySession()  useCurriculum()    │
└─────────────────────────────────────────────────────────┘
```

### Persistence Layer

```typescript
// localStorage via Zustand persist middleware
{
  name: 'ita-rp-game-store',
  partialize: (state) => ({
    player: state.player  // Only persist player data
  })
}
```

**Storage Keys**:
- `ita-rp-game-store` - Main game state (localStorage)
- Future: IndexedDB for larger datasets
- Future: P2P sync via libp2p

## Build System

### Vite Configuration

```typescript
// apps/web-app/vite.config.ts
export default defineConfig({
  base: '/ita-rp-game/',  // GitHub Pages path
  resolve: {
    alias: {
      '@ita-rp/shared-types': '../../packages/shared-types/src',
      '@ita-rp/game-logic': '../../packages/game-logic/src',
      '@ita-rp/ui-components': '../../packages/ui-components/src',
      '@ita-rp/curriculum': '../../packages/curriculum/src',
    }
  }
})
```

### npm Workspaces

```json
// package.json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

## CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Push   │───▶│   Lint   │───▶│   Test   │───▶│  Build   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                                                      ▼
                                               ┌──────────┐
                                               │  Deploy  │
                                               │ (Pages)  │
                                               └──────────┘
```

**Workflows** (`.github/workflows/`):
- `ci.yml` - Test on Node 18 & 20
- `lint.yml` - ESLint checks
- `deploy.yml` - GitHub Pages deployment
- `release.yml` - Release automation

## Security Considerations

- No sensitive data stored client-side
- All data persisted locally (no backend yet)
- Environment variables via `.env.local` (gitignored)
- Input validation on curriculum data

## Performance

**Targets**:
- Bundle size: <200KB gzipped
- First load: <3 seconds
- Runtime: 60 FPS

**Optimizations**:
- Code splitting by route
- Lazy loading components
- Memoization of XP calculations
- Virtualized lists (future)
