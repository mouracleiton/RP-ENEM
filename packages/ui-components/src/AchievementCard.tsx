import React from 'react';
import { useTheme } from './ThemeProvider';

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'streak' | 'completion' | 'social';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: Date;
}

export interface AchievementCardProps {
  achievement: AchievementData;
  onClick?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClick }) => {
  const { currentTheme } = useTheme();

  const getCategoryColor = () => {
    switch (achievement.category) {
      case 'study':
        return currentTheme.colors.primary;
      case 'streak':
        return currentTheme.colors.warning;
      case 'completion':
        return currentTheme.colors.success;
      case 'social':
        return currentTheme.colors.accent;
      default:
        return currentTheme.colors.primary;
    }
  };

  const categoryColor = getCategoryColor();
  const progressPercent = achievement.maxProgress
    ? Math.min((achievement.progress || 0) / achievement.maxProgress * 100, 100)
    : 0;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: achievement.unlocked
          ? currentTheme.colors.surface
          : currentTheme.colors.background,
        border: `2px solid ${achievement.unlocked ? categoryColor : currentTheme.colors.border}`,
        borderRadius: '12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        opacity: achievement.unlocked ? 1 : 0.5,
        filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
        boxShadow: achievement.unlocked
          ? `0 0 20px ${categoryColor}40`
          : 'none',
        minWidth: '140px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Category indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: categoryColor,
        }}
      />

      {/* Icon */}
      <div
        style={{
          fontSize: '3rem',
          marginBottom: '8px',
          filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
        }}
      >
        {achievement.icon}
      </div>

      {/* Name */}
      <div
        style={{
          fontFamily: currentTheme.fonts.primary,
          fontSize: '0.875rem',
          fontWeight: 'bold',
          color: achievement.unlocked ? currentTheme.colors.text : currentTheme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: '4px',
        }}
      >
        {achievement.name}
      </div>

      {/* Description */}
      <div
        style={{
          fontFamily: currentTheme.fonts.secondary,
          fontSize: '0.75rem',
          color: currentTheme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: '8px',
        }}
      >
        {achievement.description}
      </div>

      {/* Progress bar (if not unlocked) */}
      {!achievement.unlocked && achievement.maxProgress && (
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: currentTheme.colors.border,
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: categoryColor,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      )}

      {/* Unlocked date */}
      {achievement.unlocked && achievement.unlockedAt && (
        <div
          style={{
            fontFamily: currentTheme.fonts.secondary,
            fontSize: '0.625rem',
            color: currentTheme.colors.textSecondary,
            marginTop: '4px',
          }}
        >
          {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
        </div>
      )}

      {/* Lock icon overlay */}
      {!achievement.unlocked && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '2rem',
            opacity: 0.3,
          }}
        >
          🔒
        </div>
      )}
    </div>
  );
};
