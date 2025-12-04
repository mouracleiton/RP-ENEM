import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';

// Temas cyberpunk para o ENEM RP Game
export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    grid: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  effects: {
    glow: string;
    shadow: string;
  };
}

export const cyberpunkThemes: Record<string, Theme> = {
  neonBlue: {
    id: 'neonBlue',
    name: 'Neon Blue',
    colors: {
      primary: '#00f3ff',
      secondary: '#1a237e',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      accent: '#00bcd4',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      border: '#333333',
      grid: '#1a237e',
    },
    fonts: {
      primary: '"Orbitron", "Roboto Mono", monospace',
      secondary: '"Rajdhani", sans-serif',
      monospace: '"Fira Code", monospace',
    },
    effects: {
      glow: '0 0 10px rgba(0, 243, 255, 0.5)',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    },
  },
  matrixGreen: {
    id: 'matrixGreen',
    name: 'Matrix Green',
    colors: {
      primary: '#00ff41',
      secondary: '#003b00',
      background: '#000000',
      surface: '#0a0a0a',
      text: '#00ff41',
      textSecondary: '#00cc33',
      accent: '#00dd00',
      success: '#00ff41',
      warning: '#ffaa00',
      error: '#ff0000',
      border: '#003b00',
      grid: '#003b00',
    },
    fonts: {
      primary: '"Share Tech Mono", monospace',
      secondary: '"Orbitron", sans-serif',
      monospace: '"Fira Code", monospace',
    },
    effects: {
      glow: '0 0 8px rgba(0, 255, 65, 0.6)',
      shadow: '0 4px 6px rgba(0, 255, 65, 0.2)',
    },
  },
  cyberPurple: {
    id: 'cyberPurple',
    name: 'Cyber Purple',
    colors: {
      primary: '#e100ff',
      secondary: '#3a0051',
      background: '#0d0013',
      surface: '#1a0026',
      text: '#ffffff',
      textSecondary: '#cc99ff',
      accent: '#ff00ff',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff3366',
      border: '#4a0066',
      grid: '#2a0039',
    },
    fonts: {
      primary: '"Audiowide", cursive',
      secondary: '"Rajdhani", sans-serif',
      monospace: '"Fira Code", monospace',
    },
    effects: {
      glow: '0 0 12px rgba(225, 0, 255, 0.5)',
      shadow: '0 4px 8px rgba(225, 0, 255, 0.3)',
    },
  },
  retroOrange: {
    id: 'retroOrange',
    name: 'Retro Orange',
    colors: {
      primary: '#ff6b35',
      secondary: '#2d1b17',
      background: '#0a0500',
      surface: '#1a0f09',
      text: '#ffcc99',
      textSecondary: '#ff9966',
      accent: '#ff9933',
      success: '#66ff66',
      warning: '#ffcc33',
      error: '#ff3333',
      border: '#4a3026',
      grid: '#2d1b17',
    },
    fonts: {
      primary: '"Press Start 2P", cursive',
      secondary: '"Orbitron", sans-serif',
      monospace: '"Fira Code", monospace',
    },
    effects: {
      glow: '0 0 8px rgba(255, 107, 53, 0.6)',
      shadow: '0 4px 6px rgba(255, 107, 53, 0.3)',
    },
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
}

// Memoize available themes since they never change
const availableThemesArray = Object.values(cyberpunkThemes);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'neonBlue',
}) => {
  const [currentThemeId, setCurrentThemeId] = React.useState(defaultTheme);
  const currentTheme = cyberpunkThemes[currentThemeId] || cyberpunkThemes[defaultTheme];

  const setTheme = useCallback((themeId: string) => {
    if (cyberpunkThemes[themeId]) {
      setCurrentThemeId(themeId);
      localStorage.setItem('ita-rp-theme', themeId);
    }
  }, []);

  // Load theme from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('ita-rp-theme');
    if (savedTheme && cyberpunkThemes[savedTheme]) {
      setCurrentThemeId(savedTheme);
    }
  }, []);

  // Apply CSS variables for the theme
  React.useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(currentTheme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });
  }, [currentTheme]);

  const value = useMemo<ThemeContextType>(() => ({
    currentTheme,
    setTheme,
    availableThemes: availableThemesArray,
  }), [currentTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// CSS-in-JS styles helper
export const createStyles = (theme: Theme) => ({
  // Base styles
  container: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fonts.primary,
    minHeight: '100vh',
    position: 'relative' as const,
    overflow: 'hidden',
  },

  // Grid background
  gridBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(${parseInt(theme.colors.grid.slice(1, 3), 16)}, ${parseInt(theme.colors.grid.slice(3, 5), 16)}, ${parseInt(theme.colors.grid.slice(5, 7), 16)}, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(${parseInt(theme.colors.grid.slice(1, 3), 16)}, ${parseInt(theme.colors.grid.slice(3, 5), 16)}, ${parseInt(theme.colors.grid.slice(5, 7), 16)}, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    pointerEvents: 'none' as const,
    zIndex: 0,
  },

  // Surface styles
  surface: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    boxShadow: theme.effects.shadow,
  },

  // Button styles
  button: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    border: `2px solid ${theme.colors.primary}`,
    padding: '12px 24px',
    fontFamily: theme.fonts.primary,
    fontWeight: 'bold',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase' as const,
    boxShadow: theme.effects.glow,
  },

  buttonHover: {
    backgroundColor: theme.colors.background,
    color: theme.colors.primary,
    boxShadow: `0 0 15px ${theme.colors.primary}`,
    transform: 'translateY(-2px)',
  },

  // Text styles
  heading: {
    fontFamily: theme.fonts.primary,
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: theme.colors.primary,
    textShadow: theme.effects.glow,
    marginBottom: '1rem',
  },

  subheading: {
    fontFamily: theme.fonts.secondary,
    fontSize: '1.5rem',
    color: theme.colors.textSecondary,
    marginBottom: '0.5rem',
  },

  body: {
    fontFamily: theme.fonts.secondary,
    fontSize: '1rem',
    color: theme.colors.text,
    lineHeight: 1.6,
  },

  // Card styles
  card: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: theme.effects.shadow,
    position: 'relative' as const,
    overflow: 'hidden',
  },

  cardBefore: {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})`,
  },
});