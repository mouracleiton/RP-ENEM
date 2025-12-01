import React from 'react';
import { useTheme } from './ThemeProvider';

export interface SkillData {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'not_started' | 'in_progress' | 'completed';
  estimatedTime: string;
  prerequisites?: string[];
  prerequisitesMet?: boolean;
}

export interface SkillCardProps {
  skill: SkillData;
  onClick?: () => void;
  compact?: boolean;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onClick,
  compact = false,
}) => {
  const { currentTheme } = useTheme();

  const getDifficultyConfig = () => {
    switch (skill.difficulty) {
      case 'beginner':
        return { color: currentTheme.colors.success, label: 'Iniciante', icon: '🟢' };
      case 'intermediate':
        return { color: currentTheme.colors.warning, label: 'Intermediário', icon: '🟡' };
      case 'advanced':
        return { color: currentTheme.colors.error, label: 'Avançado', icon: '🔴' };
      default:
        return { color: currentTheme.colors.textSecondary, label: 'N/A', icon: '⚪' };
    }
  };

  const getStatusConfig = () => {
    switch (skill.status) {
      case 'completed':
        return { color: currentTheme.colors.success, label: 'Concluída', icon: '✅' };
      case 'in_progress':
        return { color: currentTheme.colors.warning, label: 'Em Progresso', icon: '📝' };
      case 'not_started':
      default:
        return { color: currentTheme.colors.textSecondary, label: 'Não Iniciada', icon: '⏳' };
    }
  };

  const difficultyConfig = getDifficultyConfig();
  const statusConfig = getStatusConfig();
  const canStart = skill.prerequisitesMet !== false;

  if (compact) {
    return (
      <div
        onClick={canStart ? onClick : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: currentTheme.colors.surface,
          border: `1px solid ${skill.status === 'completed' ? currentTheme.colors.success : currentTheme.colors.border}`,
          borderRadius: '8px',
          cursor: canStart && onClick ? 'pointer' : 'default',
          opacity: canStart ? 1 : 0.5,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (canStart && onClick) {
            e.currentTarget.style.borderColor = currentTheme.colors.primary;
            e.currentTarget.style.backgroundColor = currentTheme.colors.primary + '10';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = skill.status === 'completed'
            ? currentTheme.colors.success
            : currentTheme.colors.border;
          e.currentTarget.style.backgroundColor = currentTheme.colors.surface;
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>{statusConfig.icon}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: currentTheme.fonts.secondary,
              fontSize: '0.875rem',
              color: currentTheme.colors.text,
              fontWeight: skill.status === 'in_progress' ? 'bold' : 'normal',
            }}
          >
            {skill.name}
          </div>
        </div>
        <span style={{ fontSize: '0.75rem' }}>{difficultyConfig.icon}</span>
        <span
          style={{
            fontFamily: currentTheme.fonts.secondary,
            fontSize: '0.75rem',
            color: currentTheme.colors.textSecondary,
          }}
        >
          {skill.estimatedTime}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={canStart ? onClick : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        backgroundColor: currentTheme.colors.surface,
        border: `2px solid ${skill.status === 'completed'
          ? currentTheme.colors.success
          : skill.status === 'in_progress'
            ? currentTheme.colors.warning
            : currentTheme.colors.border}`,
        borderRadius: '12px',
        cursor: canStart && onClick ? 'pointer' : 'default',
        opacity: canStart ? 1 : 0.5,
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (canStart && onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 16px ${currentTheme.colors.primary}20`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Status badge */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          backgroundColor: statusConfig.color + '20',
          borderRadius: '12px',
        }}
      >
        <span style={{ fontSize: '0.875rem' }}>{statusConfig.icon}</span>
        <span
          style={{
            fontFamily: currentTheme.fonts.secondary,
            fontSize: '0.625rem',
            color: statusConfig.color,
            fontWeight: 'bold',
          }}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Header */}
      <h4
        style={{
          margin: '0 0 8px 0',
          fontFamily: currentTheme.fonts.primary,
          fontSize: '1rem',
          color: currentTheme.colors.text,
          paddingRight: '100px',
        }}
      >
        {skill.name}
      </h4>

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
        {skill.description.length > 150
          ? skill.description.substring(0, 150) + '...'
          : skill.description}
      </p>

      {/* Meta info */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: 'auto',
        }}
      >
        {/* Difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{difficultyConfig.icon}</span>
          <span
            style={{
              fontFamily: currentTheme.fonts.secondary,
              fontSize: '0.75rem',
              color: difficultyConfig.color,
            }}
          >
            {difficultyConfig.label}
          </span>
        </div>

        {/* Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>⏱️</span>
          <span
            style={{
              fontFamily: currentTheme.fonts.secondary,
              fontSize: '0.75rem',
              color: currentTheme.colors.textSecondary,
            }}
          >
            {skill.estimatedTime}
          </span>
        </div>

        {/* Prerequisites warning */}
        {!canStart && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🔒</span>
            <span
              style={{
                fontFamily: currentTheme.fonts.secondary,
                fontSize: '0.75rem',
                color: currentTheme.colors.error,
              }}
            >
              Pré-requisitos pendentes
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
