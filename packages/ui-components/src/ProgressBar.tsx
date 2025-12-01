import React from 'react';
import { useTheme, createStyles } from './ThemeProvider';

export interface ProgressBarProps {
  value: number;
  maxValue?: number;
  showText?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  maxValue = 100,
  showText = true,
  variant = 'primary',
  size = 'medium',
  animated = true,
  className = '',
  style = {},
  label,
  color,
}) => {
  const { currentTheme } = useTheme();
  const styles = createStyles(currentTheme);

  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  const getVariantColor = (): string => {
    if (color) return color;

    switch (variant) {
      case 'primary':
        return currentTheme.colors.primary;
      case 'success':
        return currentTheme.colors.success;
      case 'warning':
        return currentTheme.colors.warning;
      case 'error':
        return currentTheme.colors.error;
      case 'accent':
        return currentTheme.colors.accent;
      default:
        return currentTheme.colors.primary;
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return {
          height: '8px',
          fontSize: '0.75rem',
        };
      case 'medium':
        return {
          height: '16px',
          fontSize: '0.875rem',
        };
      case 'large':
        return {
          height: '24px',
          fontSize: '1rem',
        };
      default:
        return {
          height: '16px',
          fontSize: '0.875rem',
        };
    }
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    backgroundColor: currentTheme.colors.surface,
    border: `1px solid ${currentTheme.colors.border}`,
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    ...getSizeStyles(),
    ...style,
  };

  const fillStyles: React.CSSProperties = {
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: getVariantColor(),
    transition: animated ? 'width 0.5s ease-in-out' : 'none',
    position: 'relative',
    overflow: 'hidden',
  };

  // Add animated glow effect for primary variant
  const glowStyles: React.CSSProperties = variant === 'primary' ? {
    boxShadow: `0 0 10px ${getVariantColor()}`,
  } : {};

  return (
    <div className={`cyberpunk-progress-bar ${className}`}>
      {label && (
        <div
          style={{
            fontFamily: currentTheme.fonts.primary,
            color: currentTheme.colors.text,
            marginBottom: '4px',
            fontSize: getSizeStyles().fontSize,
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      )}

      <div style={containerStyles}>
        {/* Background grid pattern */}
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
                transparent 2px,
                rgba(255, 255, 255, 0.03) 2px,
                rgba(255, 255, 255, 0.03) 4px
              )
            `,
            pointerEvents: 'none',
          }}
        />

        {/* Progress fill */}
        <div style={{ ...fillStyles, ...glowStyles }}>
          {/* Animated shine effect */}
          {animated && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: -100,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                animation: 'shine 2s ease-in-out infinite',
              }}
            />
          )}
        </div>

        {/* Progress text overlay */}
        {showText && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: currentTheme.fonts.primary,
              color: currentTheme.colors.text,
              fontSize: getSizeStyles().fontSize,
              fontWeight: 'bold',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            {Math.round(value)} / {maxValue}
          </div>
        )}

        {/* Percentage text (for large progress bars) */}
        {showText && size === 'large' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '8px',
              transform: 'translateY(-50%)',
              fontFamily: currentTheme.fonts.primary,
              color: currentTheme.colors.text,
              fontSize: '0.875rem',
              fontWeight: 'bold',
            }}
          >
            {Math.round(percentage)}%
          </div>
        )}
      </div>

      {/* Shine animation keyframes */}
      <style>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        .cyberpunk-progress-bar {
          --primary-color: ${getVariantColor()};
        }
      `}</style>
    </div>
  );
};