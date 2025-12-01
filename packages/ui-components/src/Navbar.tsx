import React from 'react';
import { useTheme } from './ThemeProvider';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface PlayerStats {
  xp: number;
  level: number;
  streak: number;
}

export interface NavbarProps {
  items: NavItem[];
  activeItem: string;
  onNavigate: (itemId: string) => void;
  playerStats?: PlayerStats;
}

export const Navbar: React.FC<NavbarProps> = ({ items, activeItem, onNavigate, playerStats }) => {
  const { currentTheme } = useTheme();

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: currentTheme.colors.surface,
        borderBottom: `2px solid ${currentTheme.colors.primary}`,
        boxShadow: `0 4px 20px ${currentTheme.colors.primary}40`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo / Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: currentTheme.fonts.primary,
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🎮</span>
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: currentTheme.colors.primary,
            textShadow: currentTheme.effects.glow,
          }}
        >
          ITA RP
        </span>
      </div>

      {/* Navigation Items */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {items.map((item) => {
          const isActive = item.id === activeItem;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 20px',
                backgroundColor: isActive ? currentTheme.colors.primary : 'transparent',
                color: isActive ? currentTheme.colors.background : currentTheme.colors.text,
                border: `1px solid ${isActive ? currentTheme.colors.primary : currentTheme.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: currentTheme.fonts.secondary,
                fontSize: '0.8rem',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? currentTheme.effects.glow : 'none',
                minWidth: '80px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = currentTheme.colors.primary + '20';
                  e.currentTarget.style.borderColor = currentTheme.colors.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = currentTheme.colors.border;
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Player Stats */}
      {playerStats && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          {/* Streak Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: playerStats.streak > 0
                ? currentTheme.colors.warning + '20'
                : currentTheme.colors.surface,
              border: `1px solid ${playerStats.streak > 0
                ? currentTheme.colors.warning
                : currentTheme.colors.border}`,
              borderRadius: '20px',
              animation: playerStats.streak >= 7 ? 'pulse 2s infinite' : 'none',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🔥</span>
            <span
              style={{
                fontFamily: currentTheme.fonts.secondary,
                fontSize: '0.875rem',
                fontWeight: 'bold',
                color: playerStats.streak > 0
                  ? currentTheme.colors.warning
                  : currentTheme.colors.textSecondary,
              }}
            >
              {playerStats.streak}
            </span>
          </div>

          {/* Level & XP */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: currentTheme.colors.primary + '10',
              border: `1px solid ${currentTheme.colors.primary}`,
              borderRadius: '20px',
            }}
          >
            <span style={{ fontSize: '1rem' }}>⚡</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span
                style={{
                  fontFamily: currentTheme.fonts.secondary,
                  fontSize: '0.7rem',
                  color: currentTheme.colors.textSecondary,
                  lineHeight: 1,
                }}
              >
                Nível {playerStats.level}
              </span>
              <span
                style={{
                  fontFamily: currentTheme.fonts.secondary,
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: currentTheme.colors.primary,
                  lineHeight: 1,
                }}
              >
                {playerStats.xp.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pulse animation for streak */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </nav>
  );
};
