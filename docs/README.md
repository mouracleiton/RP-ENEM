# Documentation

Welcome to the ENEM RP Game documentation.

## Quick Links

| Document | Description |
|----------|-------------|
| [Architecture](./ARCHITECTURE.md) | System architecture and package structure |
| [Components](./COMPONENTS.md) | UI component API reference |
| [Store](./STORE.md) | Zustand state management guide |
| [Types](./TYPES.md) | TypeScript type definitions |
| [Testing](./TESTING.md) | Testing strategy and examples |
| [Contributing](./CONTRIBUTING.md) | Development workflow |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Project Structure

```
ita-rp-game/
├── apps/web-app/          # Main React application
├── packages/
│   ├── shared-types/      # TypeScript types
│   ├── game-logic/        # Gamification systems
│   ├── ui-components/     # React components
│   ├── curriculum/        # Education content
│   └── core-engine/       # Phaser integration
└── docs/                  # Documentation
```

## Key Concepts

### Gamification System

- **XP**: Earned by completing skills with performance multipliers
- **Ranks**: 10 aeronautical military ranks from Recruta to Marechal do Ar
- **Achievements**: 30+ unlockable accomplishments
- **Streaks**: Daily study tracking with bonus rewards

### Curriculum Hierarchy

```
Area → Discipline → MainTopic → AtomicTopic → IndividualConcept → SpecificSkill
```

### Theming

4 cyberpunk themes available:
- Neon Blue (default)
- Matrix Green
- Cyber Purple
- Retro Orange

## Need Help?

- Check the [main README](../README.md) for overview
- See [Contributing](./CONTRIBUTING.md) to get involved
- Open an issue for bugs or feature requests
