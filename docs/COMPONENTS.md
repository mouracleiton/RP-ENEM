# UI Components API Reference

This document provides API documentation for all components in `@ita-rp/ui-components`.

## Setup

All components require the `ThemeProvider` wrapper:

```tsx
import { ThemeProvider } from '@ita-rp/ui-components';

function App() {
  return (
    <ThemeProvider>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

---

## Button

Interactive button with cyberpunk styling and multiple variants.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Button content |
| `variant` | `'primary' \| 'secondary' \| 'accent' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Visual style |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disable interactions |
| `loading` | `boolean` | `false` | Show loading spinner |
| `onClick` | `() => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |

### Usage

```tsx
import { Button } from '@ita-rp/ui-components';

<Button variant="primary" onClick={handleClick}>Start Study</Button>
<Button variant="success" size="large">Complete</Button>
<Button loading>Processing...</Button>
```

---

## Card

Container with title, subtitle, and cyberpunk decorations.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Card content |
| `title` | `string` | - | Card title |
| `subtitle` | `string` | - | Card subtitle |
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'glow'` | `'default'` | Visual style |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Padding size |
| `onClick` | `() => void` | - | Make clickable |
| `hover` | `boolean` | `false` | Enable hover effects |

### Usage

```tsx
import { Card } from '@ita-rp/ui-components';

<Card title="Player Stats" subtitle="Current Progress">
  <p>Level: 15 | XP: 3,500</p>
</Card>
```

---

## ProgressBar

Animated progress indicator.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Current value |
| `maxValue` | `number` | `100` | Maximum value |
| `showText` | `boolean` | `true` | Show value text |
| `variant` | `'primary' \| 'success' \| 'warning' \| 'error' \| 'accent'` | `'primary'` | Color |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Bar height |
| `animated` | `boolean` | `true` | Enable animations |
| `label` | `string` | - | Label above bar |

### Usage

```tsx
import { ProgressBar } from '@ita-rp/ui-components';

<ProgressBar value={750} maxValue={1000} label="Experience" />
<ProgressBar value={45} variant="success" size="small" />
```

---

## ThemeProvider & useTheme

Context provider and hook for theming.

### Available Themes

| Theme | Primary Color | Description |
|-------|---------------|-------------|
| `neonBlue` | `#00f3ff` | Cyan futuristic |
| `matrixGreen` | `#00ff00` | Classic cyberpunk |
| `cyberPurple` | `#bf00ff` | Vibrant purple |
| `retroOrange` | `#ff6600` | Retro-futuristic |

### Usage

```tsx
import { useTheme } from '@ita-rp/ui-components';

function MyComponent() {
  const { currentTheme, setTheme, themeName } = useTheme();

  return (
    <button onClick={() => setTheme('matrixGreen')}>
      Switch Theme
    </button>
  );
}
```

---

## Other Components

| Component | Purpose |
|-----------|---------|
| `Text` | Typography with theme styling |
| `Modal` | Overlay dialog |
| `RankBadge` | Display player rank |
| `AchievementCard` | Achievement display |
| `DisciplineCard` | Discipline with progress |
| `SkillCard` | Skill with status |
| `SkillTree` | Visual dependency graph |
| `Quiz` | Interactive assessment |
| `DailyChallenges` | Daily missions list |
| `Leaderboard` | Player rankings |
| `Notification` | Toast messages |
| `CelebrationModal` | Level up celebrations |
| `Skeleton` | Loading placeholder |
| `ErrorBoundary` | Error handling |
| `Navbar` | Navigation bar |
| `PageTransition` | Route animations |
| `Onboarding` | New user flow |
