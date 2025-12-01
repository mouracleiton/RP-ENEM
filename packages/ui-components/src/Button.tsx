import React from 'react';
import { useTheme, createStyles } from './ThemeProvider';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  style = {},
}) => {
  const { currentTheme } = useTheme();
  const styles = createStyles(currentTheme);

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: currentTheme.colors.primary,
          color: currentTheme.colors.background,
          borderColor: currentTheme.colors.primary,
          boxShadow: currentTheme.effects.glow,
        };
      case 'secondary':
        return {
          backgroundColor: currentTheme.colors.surface,
          color: currentTheme.colors.primary,
          borderColor: currentTheme.colors.primary,
        };
      case 'accent':
        return {
          backgroundColor: currentTheme.colors.accent,
          color: currentTheme.colors.background,
          borderColor: currentTheme.colors.accent,
          boxShadow: `0 0 8px ${currentTheme.colors.accent}`,
        };
      case 'success':
        return {
          backgroundColor: currentTheme.colors.success,
          color: currentTheme.colors.background,
          borderColor: currentTheme.colors.success,
        };
      case 'warning':
        return {
          backgroundColor: currentTheme.colors.warning,
          color: currentTheme.colors.background,
          borderColor: currentTheme.colors.warning,
        };
      case 'error':
        return {
          backgroundColor: currentTheme.colors.error,
          color: currentTheme.colors.text,
          borderColor: currentTheme.colors.error,
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return {
          padding: '8px 16px',
          fontSize: '0.875rem',
        };
      case 'medium':
        return {
          padding: '12px 24px',
          fontSize: '1rem',
        };
      case 'large':
        return {
          padding: '16px 32px',
          fontSize: '1.125rem',
        };
      default:
        return {};
    }
  };

  const baseStyles: React.CSSProperties = {
    ...styles.button,
    ...getVariantStyles(),
    ...getSizeStyles(),
    fontFamily: currentTheme.fonts.primary,
    fontWeight: 'bold',
    borderRadius: '4px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    position: 'relative',
    overflow: 'hidden',
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 6px 12px ${currentTheme.colors.primary}`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = currentTheme.effects.glow;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <button
      type={type}
      className={`cyberpunk-button ${className}`}
      style={baseStyles}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
    >
      {/* Loading spinner */}
      {loading && (
        <span
          style={{
            marginRight: '8px',
            display: 'inline-block',
            animation: 'spin 1s linear infinite',
          }}
        >
          ⚙️
        </span>
      )}

      {/* Button content */}
      <span style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </span>

      {/* Animated border effect */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .cyberpunk-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s ease;
        }

        .cyberpunk-button:hover::before {
          left: 100%;
        }
      `}</style>
    </button>
  );
};