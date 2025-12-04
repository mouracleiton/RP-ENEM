import React, { useEffect, useRef } from 'react';
import { useTheme, type Theme } from './ThemeProvider';

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'waves' | 'circuit';
  density?: 'light' | 'medium' | 'heavy';
  speed?: 'slow' | 'medium' | 'fast';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'particles',
  density = 'medium',
  speed = 'medium',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme } = useTheme();
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  const getParticleCount = () => {
    switch (density) {
      case 'light': return 20;
      case 'medium': return 50;
      case 'heavy': return 100;
      default: return 50;
    }
  };

  const getSpeedMultiplier = () => {
    switch (speed) {
      case 'slow': return 0.5;
      case 'medium': return 1;
      case 'fast': return 2;
      default: return 1;
    }
  };

  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    const colors = [
      currentTheme.colors.primary + '40',
      currentTheme.colors.accent + '30',
      currentTheme.colors.textSecondary + '20',
    ];

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * getSpeedMultiplier(),
      vy: (Math.random() - 0.5) * getSpeedMultiplier(),
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.fill();

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      // Draw connections between nearby particles
      particlesRef.current.forEach((otherParticle) => {
        const distance = Math.sqrt(
          Math.pow(particle.x - otherParticle.x, 2) +
          Math.pow(particle.y - otherParticle.y, 2)
        );

        if (distance < 100 && distance > 0) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.strokeStyle = currentTheme.colors.primary + '10';
          ctx.globalAlpha = (1 - distance / 100) * 0.2;
          ctx.stroke();
        }
      });
    });

    ctx.globalAlpha = 1;
  };

  const drawWaves = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const waves = 3;
    const amplitude = 50;
    const frequency = 0.01 * getSpeedMultiplier();

    for (let wave = 0; wave < waves; wave++) {
      ctx.beginPath();
      ctx.strokeStyle = currentTheme.colors.primary + Math.floor(20 - wave * 5).toString(16);
      ctx.lineWidth = 2 - wave * 0.5;

      for (let x = 0; x <= canvas.width; x++) {
        const y = canvas.height / 2 +
                 Math.sin((x * frequency) + (time * getSpeedMultiplier() * 0.001) + (wave * Math.PI / waves)) *
                 (amplitude + wave * 20);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }
  };

  const drawCircuit = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gridSize = 50;
    const speed = getSpeedMultiplier() * 0.0005;

    ctx.strokeStyle = currentTheme.colors.primary + '20';
    ctx.lineWidth = 1;

    // Draw grid
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        // Horizontal lines
        if (Math.random() > 0.7) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + gridSize, y);
          ctx.stroke();
        }

        // Vertical lines
        if (Math.random() > 0.7) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + gridSize);
          ctx.stroke();
        }

        // Draw nodes
        if (Math.random() > 0.8) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = currentTheme.colors.accent + '40';
          ctx.fill();
        }
      }
    }

    // Draw moving signals
    const signalCount = 5;
    for (let i = 0; i < signalCount; i++) {
      const progress = ((time * speed) + (i * 200)) % 1;
      const x = progress * canvas.width;
      const y = Math.floor(progress * canvas.height / gridSize) * gridSize;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = currentTheme.colors.primary + '60';
      ctx.fill();
    }
  };

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    switch (variant) {
      case 'particles':
        drawParticles(ctx, canvas);
        break;
      case 'waves':
        drawWaves(ctx, canvas, time);
        break;
      case 'circuit':
        drawCircuit(ctx, canvas, time);
        break;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Recreate particles on resize
      if (variant === 'particles') {
        const particleCount = getParticleCount();
        particlesRef.current = Array.from({ length: particleCount }, () => createParticle(canvas));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize particles if needed
    if (variant === 'particles') {
      const particleCount = getParticleCount();
      particlesRef.current = Array.from({ length: particleCount }, () => createParticle(canvas));
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant, density, speed, currentTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        opacity: 0.8,
      }}
    />
  );
};