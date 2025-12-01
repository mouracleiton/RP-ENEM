import React from 'react';
import { useTheme } from './ThemeProvider';

export interface DisciplineData {
  id: string;
  name: string;
  description: string;
  totalSkills: number;
  completedSkills: number;
  icon?: string;
  color?: string;
}

export interface DisciplineCardProps {
  discipline: DisciplineData;
  onClick?: () => void;
  selected?: boolean;
}

export const DisciplineCard: React.FC<DisciplineCardProps> = ({
  discipline,
  onClick,
  selected = false,
}) => {
  const { currentTheme } = useTheme();
  const progress = discipline.totalSkills > 0
    ? (discipline.completedSkills / discipline.totalSkills) * 100
    : 0;

  const disciplineColor = discipline.color || currentTheme.colors.primary;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        backgroundColor: selected
          ? currentTheme.colors.primary + '15'
          : currentTheme.colors.surface,
        border: `2px solid ${selected ? currentTheme.colors.primary : currentTheme.colors.border}`,
        borderRadius: '12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: selected
          ? currentTheme.effects.glow
          : `0 4px 6px ${currentTheme.colors.background}`,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = currentTheme.colors.primary;
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 8px 16px ${currentTheme.colors.primary}30`;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = currentTheme.colors.border;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 4px 6px ${currentTheme.colors.background}`;
        }
      }}
    >
      {/* Progress bar at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: currentTheme.colors.border,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: disciplineColor,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span
          style={{
            fontSize: '2rem',
            filter: progress === 100 ? 'none' : 'grayscale(30%)',
          }}
        >
          {discipline.icon || '📚'}
        </span>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontFamily: currentTheme.fonts.primary,
              fontSize: '1.125rem',
              color: currentTheme.colors.text,
            }}
          >
            {discipline.name}
          </h3>
          <span
            style={{
              fontFamily: currentTheme.fonts.secondary,
              fontSize: '0.75rem',
              color: disciplineColor,
              fontWeight: 'bold',
            }}
          >
            {discipline.id}
          </span>
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          margin: '0 0 16px 0',
          fontFamily: currentTheme.fonts.secondary,
          fontSize: '0.875rem',
          color: currentTheme.colors.textSecondary,
          lineHeight: 1.5,
        }}
      >
        {discipline.description.length > 100
          ? discipline.description.substring(0, 100) + '...'
          : discipline.description}
      </p>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: currentTheme.fonts.secondary,
              fontSize: '0.875rem',
              color: currentTheme.colors.textSecondary,
            }}
          >
            {discipline.completedSkills}/{discipline.totalSkills} habilidades
          </span>
        </div>
        <div
          style={{
            padding: '4px 12px',
            backgroundColor: disciplineColor + '20',
            borderRadius: '20px',
            fontFamily: currentTheme.fonts.primary,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: disciplineColor,
          }}
        >
          {progress.toFixed(0)}%
        </div>
      </div>

      {/* Completed badge */}
      {progress === 100 && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '1.5rem',
          }}
        >
          ✅
        </div>
      )}
    </div>
  );
};
