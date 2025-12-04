# Contributing Guide

Guidelines for contributing to ENEM RP Game.

## Getting Started

```bash
# Clone repository
git clone <repository-url>
cd ita-rp-game

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 2. Make Changes

- Follow existing code patterns
- Write/update tests for your changes
- Ensure TypeScript types are correct

### 3. Test Your Changes

```bash
# Run tests
npm run test

# Type checking
npm run typecheck

# Lint code
npm run lint
```

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat(gamification): add daily challenge rewards"
git commit -m "fix(ui): resolve theme switching flicker"
git commit -m "docs(readme): update installation steps"
git commit -m "test(xp-system): add edge case tests"
git commit -m "refactor(store): simplify streak calculation"
```

**Format**: `type(scope): description`

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code refactoring
- `style` - Formatting (no code change)
- `chore` - Maintenance

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Standards

### TypeScript

- Use strict typing (no `any` unless necessary)
- Export interfaces from `@ita-rp/shared-types`
- Use type guards when narrowing

```typescript
// Good
function processSkill(skill: SpecificSkill): void {
  // ...
}

// Avoid
function processSkill(skill: any): void {
  // ...
}
```

### React Components

- Use functional components with hooks
- Props interface should be exported
- Use the theme system for styling

```typescript
// Good
export interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  const { currentTheme } = useTheme();

  return (
    <div style={{ color: currentTheme.colors.primary }}>
      {title}
    </div>
  );
};
```

### File Structure

```
ComponentName/
├── ComponentName.tsx      # Main component
├── ComponentName.test.tsx # Tests
└── index.ts               # Export
```

Or flat structure for simpler components:
```
ComponentName.tsx
ComponentName.test.tsx
```

### Styling

- Use theme tokens from `useTheme()`
- Avoid hardcoded colors
- Support all 4 themes

```typescript
// Good
const { currentTheme } = useTheme();
<div style={{ color: currentTheme.colors.primary }}>

// Avoid
<div style={{ color: '#00f3ff' }}>
```

## Adding New Features

### New UI Component

1. Create component in `packages/ui-components/src/`
2. Export from `packages/ui-components/src/index.ts`
3. Add tests
4. Document in `docs/COMPONENTS.md`

### New Game System

1. Create in `packages/game-logic/src/`
2. Add types to `@ita-rp/shared-types`
3. Integrate with store if needed
4. Add tests
5. Document behavior

### New Achievement

```typescript
// In achievement-system.ts
const NEW_ACHIEVEMENT = {
  id: 'unique_id',
  name: 'Achievement Name',
  description: 'How to unlock',
  icon: '🏆',
  category: 'study' as const,
};
```

### New Rank

```typescript
// In store.ts AERONAUTICS_RANKS array
{
  id: 'rank_id',
  name: 'Rank Name',
  level: 25,
  icon: '⭐',
  requirements: { level: 25, xp: 7500, completedDisciplines: 5 },
}
```

## Pull Request Guidelines

### PR Title

Follow commit convention: `feat(scope): description`

### PR Description

```markdown
## Summary
Brief description of changes.

## Changes
- Added X
- Fixed Y
- Updated Z

## Testing
- [ ] Unit tests pass
- [ ] Manual testing done
- [ ] TypeScript compiles

## Screenshots (if UI changes)
[Add screenshots]
```

### Review Checklist

- [ ] Code follows project patterns
- [ ] Tests included/updated
- [ ] TypeScript types correct
- [ ] No console.log statements
- [ ] Documentation updated if needed

## Questions?

- Open an issue for bugs/features
- Use discussions for questions
