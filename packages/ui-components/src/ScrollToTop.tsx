/**
 * ScrollToTop Component
 * Floating button that appears when user scrolls down
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export interface ScrollToTopProps {
  showAfter?: number; // pixels scrolled before showing
  smooth?: boolean;
  position?: 'left' | 'right';
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  showAfter = 300,
  smooth = true,
  position = 'right',
}) => {
  const { currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > showAfter);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Voltar ao topo"
      style={{
        position: 'fixed',
        bottom: '100px', // Above mobile nav
        [position]: '20px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: isHovered
          ? currentTheme.colors.primary
          : currentTheme.colors.surface,
        color: isHovered
          ? currentTheme.colors.background
          : currentTheme.colors.primary,
        border: `2px solid ${currentTheme.colors.primary}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        boxShadow: isHovered
          ? `0 0 20px ${currentTheme.colors.primary}80`
          : `0 4px 12px rgba(0, 0, 0, 0.3)`,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        zIndex: 90,
        opacity: isVisible ? 1 : 0,
        animation: 'fadeInUp 0.3s ease',
      }}
    >
      ↑
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </button>
  );
};

export default ScrollToTop;
