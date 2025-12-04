import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

interface GlitchEffectProps {
  children: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'heavy';
  frequency?: 'rare' | 'occasional' | 'frequent';
  duration?: number;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const GlitchEffect: React.FC<GlitchEffectProps> = ({
  children,
  intensity = 'subtle',
  frequency = 'occasional',
  duration = 200,
  disabled = false,
  style = {},
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();

  const getGlitchChance = () => {
    switch (frequency) {
      case 'rare': return 0.001;
      case 'occasional': return 0.005;
      case 'frequent': return 0.02;
      default: return 0.005;
    }
  };

  const getGlitchIntensity = () => {
    switch (intensity) {
      case 'subtle': return { maxOffset: 2, layers: 2 };
      case 'medium': return { maxOffset: 5, layers: 3 };
      case 'heavy': return { maxOffset: 10, layers: 4 };
      default: return { maxOffset: 2, layers: 2 };
    }
  };

  const getRandomOffset = (max: number) => (Math.random() - 0.5) * max;

  const triggerGlitch = () => {
    if (disabled) return;

    const intensity = getGlitchIntensity();
    setGlitchOffset({
      x: getRandomOffset(intensity.maxOffset),
      y: getRandomOffset(intensity.maxOffset),
    });
    setIsGlitching(true);

    const glitchDuration = duration + Math.random() * 100;
    setTimeout(() => {
      setIsGlitching(false);
      setGlitchOffset({ x: 0, y: 0 });
    }, glitchDuration);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < getGlitchChance()) {
        triggerGlitch();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [disabled, frequency, duration]);

  const getGlitchLayers = () => {
    const intensity = getGlitchIntensity();
    const layers = [];

    for (let i = 0; i < intensity.layers; i++) {
      const offsetX = getRandomOffset(intensity.maxOffset * (i + 1) * 0.5);
      const offsetY = getRandomOffset(intensity.maxOffset * (i + 1) * 0.5);
      const opacity = 0.3 / (i + 1);

      let color;
      if (i % 2 === 0) {
        color = currentTheme.colors.primary;
      } else {
        color = currentTheme.colors.accent;
      }

      layers.push(
        <div
          key={`glitch-layer-${i}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            opacity: isGlitching ? opacity : 0,
            mixBlendMode: 'screen',
            filter: `blur(${i * 0.5}px)`,
            transition: 'opacity 0.1s ease',
            pointerEvents: 'none',
            zIndex: 10 + i,
          }}
        >
          <div
            style={{
              color: color,
              filter: `hue-rotate(${i * 30}deg)`,
            }}
          >
            {children}
          </div>
        </div>
      );
    }

    return layers;
  };

  const getScanLines = () => {
    if (!isGlitching) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${currentTheme.colors.primary}10 2px,
              ${currentTheme.colors.primary}10 4px
            )
          `,
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 15,
        }}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        transform: isGlitching ? `translate(${glitchOffset.x}px, ${glitchOffset.y}px)` : 'translate(0, 0)',
        transition: 'transform 0.05s ease',
        ...style,
      }}
    >
      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        {children}
      </div>

      {/* Glitch layers */}
      {getGlitchLayers()}

      {/* Scan lines effect */}
      {getScanLines()}

      {/* Random noise overlay during glitch */}
      {isGlitching && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            pointerEvents: 'none',
            zIndex: 16,
            background: `
              radial-gradient(
                circle at ${Math.random() * 100}% ${Math.random() * 100}%',
                ${currentTheme.colors.textSecondary}20 0%,
                transparent 50%
              )
            `,
            animation: 'noise 0.2s infinite',
          }}
        />
      )}

      <style>{`
        @keyframes noise {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }

        @keyframes glitch-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};