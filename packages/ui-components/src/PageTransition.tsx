/**
 * Page Transition Component
 * Smooth animations between page changes
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp';
  duration?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
  type = 'fade',
  duration = 300,
}) => {
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit' | 'idle'>('idle');
  const previousKeyRef = useRef(pageKey);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (pageKey !== previousKeyRef.current && !isTransitioningRef.current) {
      isTransitioningRef.current = true;
      // Start exit animation
      setTransitionStage('exit');

      const exitTimer = setTimeout(() => {
        previousKeyRef.current = pageKey;
        setTransitionStage('enter');

        const enterTimer = setTimeout(() => {
          setTransitionStage('idle');
          isTransitioningRef.current = false;
        }, duration);

        return () => clearTimeout(enterTimer);
      }, duration);

      return () => clearTimeout(exitTimer);
    }
  }, [pageKey, duration]);

  const getTransitionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: `all ${duration}ms ease-in-out`,
    };

    switch (type) {
      case 'slide':
        if (transitionStage === 'exit') {
          return { ...baseStyles, opacity: 0, transform: 'translateX(-30px)' };
        }
        if (transitionStage === 'enter') {
          return { ...baseStyles, opacity: 1, transform: 'translateX(0)' };
        }
        return { ...baseStyles, opacity: 1, transform: 'translateX(0)' };

      case 'slideUp':
        if (transitionStage === 'exit') {
          return { ...baseStyles, opacity: 0, transform: 'translateY(20px)' };
        }
        if (transitionStage === 'enter') {
          return { ...baseStyles, opacity: 1, transform: 'translateY(0)' };
        }
        return { ...baseStyles, opacity: 1, transform: 'translateY(0)' };

      case 'scale':
        if (transitionStage === 'exit') {
          return { ...baseStyles, opacity: 0, transform: 'scale(0.95)' };
        }
        if (transitionStage === 'enter') {
          return { ...baseStyles, opacity: 1, transform: 'scale(1)' };
        }
        return { ...baseStyles, opacity: 1, transform: 'scale(1)' };

      case 'fade':
      default:
        if (transitionStage === 'exit') {
          return { ...baseStyles, opacity: 0 };
        }
        if (transitionStage === 'enter') {
          return { ...baseStyles, opacity: 1 };
        }
        return { ...baseStyles, opacity: 1 };
    }
  };

  return (
    <div style={getTransitionStyles()}>
      {children}
    </div>
  );
};

/**
 * Animated List Component
 * Staggers children entry animations
 */
interface AnimatedListProps {
  children: ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn';
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDelay = 50,
  initialDelay = 0,
  animation = 'fadeIn',
}) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    children.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems(prev => [...prev, index]);
      }, initialDelay + (index * staggerDelay));
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [children.length, staggerDelay, initialDelay]);

  const getItemStyles = (index: number): React.CSSProperties => {
    const isVisible = visibleItems.includes(index);
    const baseStyles: React.CSSProperties = {
      transition: 'all 0.3s ease-out',
    };

    switch (animation) {
      case 'slideIn':
        return {
          ...baseStyles,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
        };
      case 'scaleIn':
        return {
          ...baseStyles,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        };
      case 'fadeIn':
      default:
        return {
          ...baseStyles,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        };
    }
  };

  return (
    <>
      {React.Children.map(children, (child, index) => (
        <div style={getItemStyles(index)}>{child}</div>
      ))}
    </>
  );
};

/**
 * Fade In Component
 * Simple fade-in animation on mount
 */
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 400,
  direction = 'up',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = (): string => {
    if (isVisible) return 'translate(0, 0)';

    switch (direction) {
      case 'up': return 'translate(0, 20px)';
      case 'down': return 'translate(0, -20px)';
      case 'left': return 'translate(20px, 0)';
      case 'right': return 'translate(-20px, 0)';
      default: return 'translate(0, 0)';
    }
  };

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
