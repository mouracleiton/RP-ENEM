import React from 'react';
import { useTheme, createStyles } from './ThemeProvider';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'glow';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  size = 'medium',
  className = '',
  style = {},
  onClick,
  hover = false,
}) => {
  const { currentTheme } = useTheme();
  const styles = createStyles(currentTheme);

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          borderColor: currentTheme.colors.primary,
          boxShadow: `0 0 12px ${currentTheme.colors.primary}`,
        };
      case 'secondary':
        return {
          borderColor: currentTheme.colors.accent,
          boxShadow: `0 0 8px ${currentTheme.colors.accent}`,
        };
      case 'glow':
        return {
          borderColor: currentTheme.colors.primary,
          boxShadow: `0 0 20px ${currentTheme.colors.primary}, inset 0 0 10px ${currentTheme.colors.background}`,
          backgroundColor: `${currentTheme.colors.primary}08`,
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return {
          padding: '1rem',
        };
      case 'medium':
        return {
          padding: '1.5rem',
        };
      case 'large':
        return {
          padding: '2rem',
        };
      default:
        return {
          padding: '1.5rem',
        };
    }
  };

  const containerStyles: React.CSSProperties = {
    ...styles.card,
    ...getVariantStyles(),
    ...getSizeStyles(),
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    position: 'relative',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover || onClick) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 8px 16px ${currentTheme.colors.primary}`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover || onClick) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = variant === 'primary' ? `0 0 12px ${currentTheme.colors.primary}` : styles.card.boxShadow;
    }
  };

  return (
    <div
      className={`cyberpunk-card ${className}`}
      style={containerStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
        }}
      />

      {/* Card content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        {(title || subtitle) && (
          <div style={{ marginBottom: '1rem' }}>
            {title && (
              <h3
                style={{
                  fontFamily: currentTheme.fonts.primary,
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: currentTheme.colors.primary,
                  margin: '0 0 0.25rem 0',
                  textShadow: `0 0 8px ${currentTheme.colors.primary}`,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontFamily: currentTheme.fonts.secondary,
                  fontSize: '0.875rem',
                  color: currentTheme.colors.textSecondary,
                  margin: 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Body content */}
        <div
          style={{
            fontFamily: currentTheme.fonts.secondary,
            color: currentTheme.colors.text,
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>
      </div>

      {/* Corner decorations */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '8px',
          height: '8px',
          borderTop: `2px solid ${currentTheme.colors.primary}`,
          borderRight: `2px solid ${currentTheme.colors.primary}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          width: '8px',
          height: '8px',
          borderBottom: `2px solid ${currentTheme.colors.primary}`,
          borderLeft: `2px solid ${currentTheme.colors.primary}`,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.01) 10px,
              rgba(255, 255, 255, 0.01) 20px
            )
          `,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />

      <style>{`
        .cyberpunk-card {
          background: linear-gradient(135deg, ${currentTheme.colors.surface}, ${currentTheme.colors.background});
        }
      `}</style>
    </div>
  );
};