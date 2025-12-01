import React from 'react';
import { useTheme } from './ThemeProvider';
import { Rank } from '@ita-rp/shared-types';

export interface RankBadgeProps {
  rank: Rank;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  currentProgress?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 'medium',
  showProgress = false,
  currentProgress = 0,
  className = '',
  style = {},
}) => {
  const { currentTheme } = useTheme();

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return {
          fontSize: '0.875rem',
          padding: '4px 8px',
          minWidth: '80px',
        };
      case 'medium':
        return {
          fontSize: '1rem',
          padding: '8px 16px',
          minWidth: '120px',
        };
      case 'large':
        return {
          fontSize: '1.25rem',
          padding: '12px 24px',
          minWidth: '160px',
        };
      default:
        return {
          fontSize: '1rem',
          padding: '8px 16px',
          minWidth: '120px',
        };
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: currentTheme.colors.surface,
    border: `2px solid ${currentTheme.colors.primary}`,
    borderRadius: '12px',
    fontFamily: currentTheme.fonts.primary,
    fontWeight: 'bold',
    color: currentTheme.colors.text,
    position: 'relative',
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    ...getSizeStyles(),
    boxShadow: `0 0 8px ${currentTheme.colors.primary}`,
    ...style,
  };

  const progressContainerStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    backgroundColor: currentTheme.colors.background,
    opacity: 0.8,
  };

  const progressFillStyles: React.CSSProperties = {
    height: '100%',
    width: `${Math.min(100, Math.max(0, currentProgress))}%`,
    backgroundColor: currentTheme.colors.success,
    transition: 'width 0.5s ease-in-out',
  };

  return (
    <div className={`cyberpunk-rank-badge ${className}`} style={containerStyles}>
      {/* Rank icon */}
      <span
        style={{
          fontSize: size === 'small' ? '1rem' : size === 'large' ? '1.5rem' : '1.25rem',
          filter: `drop-shadow(0 0 4px ${currentTheme.colors.primary})`,
        }}
      >
        {rank.icon}
      </span>

      {/* Rank name */}
      <span>{rank.name}</span>

      {/* Rank level indicator */}
      {size !== 'small' && (
        <span
          style={{
            fontSize: '0.75rem',
            color: currentTheme.colors.textSecondary,
            marginLeft: '4px',
          }}
        >
          Lv.{rank.level}
        </span>
      )}

      {/* Progress bar (optional) */}
      {showProgress && (
        <div style={progressContainerStyles}>
          <div style={progressFillStyles} />
        </div>
      )}

      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, transparent 30%, ${currentTheme.colors.primary} 50%, transparent 70%)`,
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      />

      <style>{`
        .cyberpunk-rank-badge {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        .cyberpunk-rank-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px ${currentTheme.colors.primary};
        }
      `}</style>
    </div>
  );
};