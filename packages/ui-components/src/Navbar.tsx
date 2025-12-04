import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigate = (itemId: string) => {
    onNavigate(itemId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop/Tablet Navbar */}
      {!isMobile && (
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
              ENEM RP
            </span>
          </div>

          {/* Navigation Items */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {items.map((item) => {
              const isActive = item.id === activeItem;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
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
        </nav>
      )}

      {/* Mobile Top Bar */}
      {isMobile && (
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: currentTheme.colors.surface,
            borderBottom: `2px solid ${currentTheme.colors.primary}`,
            boxShadow: `0 4px 20px ${currentTheme.colors.primary}40`,
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: currentTheme.fonts.primary,
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🎮</span>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: currentTheme.colors.primary,
                textShadow: currentTheme.effects.glow,
              }}
            >
              ENEM RP
            </span>
          </div>

          {/* Mobile Stats */}
          {playerStats && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Streak */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: playerStats.streak > 0
                    ? currentTheme.colors.warning + '20'
                    : 'transparent',
                  borderRadius: '12px',
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>🔥</span>
                <span
                  style={{
                    fontFamily: currentTheme.fonts.secondary,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: currentTheme.colors.warning,
                  }}
                >
                  {playerStats.streak}
                </span>
              </div>

              {/* Level */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: currentTheme.colors.primary + '20',
                  borderRadius: '12px',
                }}
              >
                <span
                  style={{
                    fontFamily: currentTheme.fonts.secondary,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: currentTheme.colors.primary,
                  }}
                >
                  Nv.{playerStats.level}
                </span>
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '8px 4px',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            backgroundColor: currentTheme.colors.surface,
            borderTop: `2px solid ${currentTheme.colors.primary}`,
            boxShadow: `0 -4px 20px ${currentTheme.colors.primary}40`,
            zIndex: 100,
          }}
        >
          {items.slice(0, 5).map((item) => {
            const isActive = item.id === activeItem;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '8px 12px',
                  backgroundColor: isActive ? currentTheme.colors.primary + '20' : 'transparent',
                  color: isActive ? currentTheme.colors.primary : currentTheme.colors.textSecondary,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: currentTheme.fonts.secondary,
                  fontSize: '0.65rem',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  minWidth: '60px',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    fontSize: '1.4rem',
                    transition: 'transform 0.2s ease',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '3px',
                      backgroundColor: currentTheme.colors.primary,
                      borderRadius: '2px',
                      boxShadow: currentTheme.effects.glow,
                    }}
                  />
                )}
              </button>
            );
          })}

          {/* More button if there are more than 5 items */}
          {items.length > 5 && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: currentTheme.colors.textSecondary,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: currentTheme.fonts.secondary,
                fontSize: '0.65rem',
                minWidth: '60px',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>⋮</span>
              <span>Mais</span>
            </button>
          )}
        </nav>
      )}

      {/* Mobile More Menu Overlay */}
      {isMobile && isMenuOpen && items.length > 5 && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 99,
            }}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu */}
          <div
            style={{
              position: 'fixed',
              bottom: '70px',
              right: '16px',
              backgroundColor: currentTheme.colors.surface,
              border: `2px solid ${currentTheme.colors.primary}`,
              borderRadius: '16px',
              padding: '8px',
              zIndex: 101,
              boxShadow: `0 0 30px ${currentTheme.colors.primary}40`,
            }}
          >
            {items.slice(5).map((item) => {
              const isActive = item.id === activeItem;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: isActive ? currentTheme.colors.primary + '20' : 'transparent',
                    color: isActive ? currentTheme.colors.primary : currentTheme.colors.text,
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: currentTheme.fonts.secondary,
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
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
    </>
  );
};
