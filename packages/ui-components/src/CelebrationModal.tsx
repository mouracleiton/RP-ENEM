/**
 * Celebration Modal Component
 * Shows animated celebration for achievements, level ups, and milestones
 */

import React, { useEffect, useState } from 'react';

export type CelebrationType = 'level_up' | 'achievement' | 'rank_up' | 'streak' | 'challenge_complete';

interface CelebrationModalProps {
  isOpen: boolean;
  type: CelebrationType;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  rewards?: Array<{ type: string; value: string | number; icon: string }>;
  onClose: () => void;
  autoCloseDelay?: number;
}

const celebrationConfig: Record<
  CelebrationType,
  { gradient: string; particleColors: string[]; defaultIcon: string }
> = {
  level_up: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    particleColors: ['#667eea', '#764ba2', '#ffd700', '#ffffff'],
    defaultIcon: '⬆️',
  },
  achievement: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    particleColors: ['#f093fb', '#f5576c', '#ffd700', '#ffffff'],
    defaultIcon: '🏆',
  },
  rank_up: {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    particleColors: ['#4facfe', '#00f2fe', '#ffd700', '#ffffff'],
    defaultIcon: '🎖️',
  },
  streak: {
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    particleColors: ['#fa709a', '#fee140', '#ff6b6b', '#ffffff'],
    defaultIcon: '🔥',
  },
  challenge_complete: {
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    particleColors: ['#11998e', '#38ef7d', '#ffd700', '#ffffff'],
    defaultIcon: '✅',
  },
};

const Particle: React.FC<{ color: string; delay: number; index: number }> = ({
  color,
  delay,
  index,
}) => {
  const angle = (index * 30) % 360;
  const distance = 100 + Math.random() * 100;
  const size = 8 + Math.random() * 8;

  return (
    <div
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        borderRadius: '50%',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        animation: `particle-fly-${index} 1.5s ease-out ${delay}s forwards`,
        opacity: 0,
      }}
    >
      <style>{`
        @keyframes particle-fly-${index} {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + ${Math.cos((angle * Math.PI) / 180) * distance}px),
              calc(-50% + ${Math.sin((angle * Math.PI) / 180) * distance}px)
            ) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

const Confetti: React.FC<{ color: string; index: number }> = ({ color, index }) => {
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 2 + Math.random();
  const rotation = Math.random() * 720 - 360;

  return (
    <div
      style={{
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: color,
        left: `${left}%`,
        top: '-20px',
        borderRadius: index % 2 === 0 ? '50%' : '2px',
        animation: `confetti-fall-${index} ${duration}s ease-in ${delay}s forwards`,
        opacity: 0,
      }}
    >
      <style>{`
        @keyframes confetti-fall-${index} {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(400px) rotate(${rotation}deg);
          }
        }
      `}</style>
    </div>
  );
};

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  type,
  title,
  subtitle,
  description,
  icon,
  rewards,
  onClose,
  autoCloseDelay = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const config = celebrationConfig[type];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);

      if (autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: isClosing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease',
      }}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Confetti */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <Confetti key={i} color={config.particleColors[i % config.particleColors.length]} index={i} />
        ))}
      </div>

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          background: 'rgba(20, 20, 40, 0.95)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          animation: isClosing ? 'scaleOut 0.3s ease forwards' : 'bounceIn 0.5s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Particles around icon */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '120px',
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <Particle
              key={i}
              color={config.particleColors[i % config.particleColors.length]}
              delay={i * 0.1}
              index={i}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: config.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '50px',
            boxShadow: `0 0 40px ${config.particleColors[0]}40`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          {icon || config.defaultIcon}
        </div>

        {/* Title */}
        <h2
          style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: 'bold',
            background: config.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: '18px',
              color: 'white',
              marginBottom: '8px',
              fontWeight: '500',
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Description */}
        {description && (
          <p
            style={{
              margin: '0 0 20px 0',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}

        {/* Rewards */}
        {rewards && rewards.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            {rewards.map((reward, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{reward.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                    +{reward.value}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {reward.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            marginTop: '24px',
            background: config.gradient,
            border: 'none',
            borderRadius: '12px',
            padding: '12px 32px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Incrível!
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scaleOut {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.8); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default CelebrationModal;
