# Testing Guide

This document covers testing strategy and examples for the ITA RP Game.

## Overview

- **Framework**: Vitest
- **React Testing**: React Testing Library
- **Coverage**: Vitest built-in coverage

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Specific package
npm run test -- packages/game-logic

# Specific test file
npm run test -- xp-system.test.ts

# Pattern matching
npm run test -- --grep "XPSystem"
```

## Test Structure

```
packages/
├── game-logic/src/
│   ├── xp-system.ts
│   ├── xp-system.test.ts
│   ├── rank-system.ts
│   ├── rank-system.test.ts
│   ├── achievement-system.ts
│   ├── achievement-system.test.ts
│   ├── store.ts
│   ├── store.test.ts
│   └── daily-challenges.test.ts
└── ui-components/src/
    ├── Button.tsx
    ├── Button.test.tsx
    ├── Card.tsx
    ├── Card.test.tsx
    ├── ProgressBar.tsx
    ├── ProgressBar.test.tsx
    └── Text.test.tsx
```

## Writing Tests

### Unit Tests (Game Logic)

```typescript
// packages/game-logic/src/xp-system.test.ts
import { describe, it, expect } from 'vitest';
import { XPSystem } from './xp-system';

describe('XPSystem', () => {
  describe('calculateXP', () => {
    it('should calculate base XP for beginner difficulty', () => {
      const xp = XPSystem.calculateXP({
        difficulty: 'beginner',
        performance: 100,
        streak: 0,
      });
      expect(xp).toBe(100);
    });

    it('should apply streak bonus', () => {
      const xp = XPSystem.calculateXP({
        difficulty: 'beginner',
        performance: 100,
        streak: 10,
      });
      expect(xp).toBeGreaterThan(100);
    });

    it('should scale with performance', () => {
      const fullPerf = XPSystem.calculateXP({
        difficulty: 'intermediate',
        performance: 100,
        streak: 0,
      });
      const halfPerf = XPSystem.calculateXP({
        difficulty: 'intermediate',
        performance: 50,
        streak: 0,
      });
      expect(fullPerf).toBeGreaterThan(halfPerf);
    });
  });
});
```

### Store Tests

```typescript
// packages/game-logic/src/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      player: {
        id: 'test-player',
        name: 'Test',
        level: 1,
        xp: 0,
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
    });
  });

  it('should add XP and update level', () => {
    const { addXP } = useGameStore.getState();

    addXP(500);

    const { player } = useGameStore.getState();
    expect(player.xp).toBe(500);
    expect(player.level).toBeGreaterThan(1);
  });

  it('should complete skill and track it', () => {
    const { completeSkill } = useGameStore.getState();

    completeSkill('skill-1');

    const { player } = useGameStore.getState();
    expect(player.completedSkills).toContain('skill-1');
  });

  it('should update streak correctly', () => {
    const { updateStreak } = useGameStore.getState();

    updateStreak();

    const { player } = useGameStore.getState();
    expect(player.currentStreak).toBe(1);
    expect(player.lastStudyDate).not.toBeNull();
  });
});
```

### Component Tests

```typescript
// packages/ui-components/src/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { ThemeProvider } from './ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>{component}</ThemeProvider>
  );
};

describe('Button', () => {
  it('renders children correctly', () => {
    renderWithTheme(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    renderWithTheme(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('shows loading state', () => {
    renderWithTheme(<Button loading>Loading</Button>);
    expect(screen.getByText('Loading')).toBeDisabled();
  });

  it('applies correct variant styles', () => {
    const { rerender } = renderWithTheme(
      <Button variant="primary">Primary</Button>
    );
    // Check primary styles applied

    rerender(
      <ThemeProvider>
        <Button variant="error">Error</Button>
      </ThemeProvider>
    );
    // Check error styles applied
  });
});
```

### ProgressBar Tests

```typescript
// packages/ui-components/src/ProgressBar.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';
import { ThemeProvider } from './ThemeProvider';

describe('ProgressBar', () => {
  it('displays correct value', () => {
    render(
      <ThemeProvider>
        <ProgressBar value={50} maxValue={100} />
      </ThemeProvider>
    );
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('clamps value between 0 and max', () => {
    render(
      <ThemeProvider>
        <ProgressBar value={150} maxValue={100} />
      </ThemeProvider>
    );
    // Should display 100, not 150
  });

  it('hides text when showText is false', () => {
    render(
      <ThemeProvider>
        <ProgressBar value={50} showText={false} />
      </ThemeProvider>
    );
    expect(screen.queryByText('50 / 100')).not.toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(
      <ThemeProvider>
        <ProgressBar value={50} label="Experience" />
      </ThemeProvider>
    );
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });
});
```

## Test Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '*.config.*', '**/*.test.*'],
    },
  },
});
```

### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
});
```

## Coverage Targets

| Area | Target |
|------|--------|
| Game Logic | 80%+ |
| UI Components | 70%+ |
| Store | 80%+ |
| Utilities | 90%+ |

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does
2. **One assertion per test** when possible
3. **Use descriptive test names** - `it('should calculate XP with streak bonus')`
4. **Reset state between tests** - Use `beforeEach` to clean up
5. **Mock external dependencies** - localStorage, APIs, timers
6. **Test edge cases** - Zero values, max values, invalid input
