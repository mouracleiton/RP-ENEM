import React from 'react';
import { useTheme } from './ThemeProvider';

export interface TextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'code';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  color?: string;
  weight?: 'light' | 'normal' | 'medium' | 'bold' | 'black';
  align?: 'left' | 'center' | 'right';
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  size = 'md',
  color,
  weight = 'normal',
  align = 'left',
  glow = false,
  className = '',
  style = {},
  as: Component = 'span',
}) => {
  const { currentTheme } = useTheme();

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'heading':
        return {
          fontFamily: currentTheme.fonts.primary,
          textTransform: 'uppercase',
          letterSpacing: '2px',
        };
      case 'subheading':
        return {
          fontFamily: currentTheme.fonts.secondary,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        };
      case 'body':
        return {
          fontFamily: currentTheme.fonts.secondary,
        };
      case 'caption':
        return {
          fontFamily: currentTheme.fonts.secondary,
          fontSize: '0.75rem',
        };
      case 'code':
        return {
          fontFamily: currentTheme.fonts.monospace,
          backgroundColor: currentTheme.colors.surface,
          padding: '2px 6px',
          borderRadius: '4px',
          border: `1px solid ${currentTheme.colors.border}`,
        };
      default:
        return {
          fontFamily: currentTheme.fonts.secondary,
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'xs':
        return { fontSize: '0.75rem' };
      case 'sm':
        return { fontSize: '0.875rem' };
      case 'md':
        return { fontSize: '1rem' };
      case 'lg':
        return { fontSize: '1.125rem' };
      case 'xl':
        return { fontSize: '1.25rem' };
      case '2xl':
        return { fontSize: '1.5rem' };
      case '3xl':
        return { fontSize: '2rem' };
      default:
        return { fontSize: '1rem' };
    }
  };

  const getWeightStyles = (): React.CSSProperties => {
    switch (weight) {
      case 'light':
        return { fontWeight: 300 };
      case 'normal':
        return { fontWeight: 400 };
      case 'medium':
        return { fontWeight: 500 };
      case 'bold':
        return { fontWeight: 700 };
      case 'black':
        return { fontWeight: 900 };
      default:
        return { fontWeight: 400 };
    }
  };

  const baseStyles: React.CSSProperties = {
    color: color || currentTheme.colors.text,
    textAlign: align,
    margin: 0,
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...getWeightStyles(),
    ...(glow && {
      textShadow: `0 0 10px ${color || currentTheme.colors.primary}`,
    }),
    ...style,
  };

  return (
    <Component
      className={`cyberpunk-text ${className}`}
      style={baseStyles}
    >
      {children}
    </Component>
  );
};