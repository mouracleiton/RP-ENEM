/**
 * Skill Tree Component
 * Visual representation of skills progression with connections
 */

import React, { useMemo } from 'react';

interface SkillNode {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  xp: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  prerequisites?: string[];
  tier: number;
  position?: { x: number; y: number };
}

interface SkillTreeProps {
  skills: SkillNode[];
  onSkillClick?: (skillId: string) => void;
  title?: string;
  compact?: boolean;
}

const statusColors = {
  locked: {
    bg: 'rgba(128, 128, 128, 0.3)',
    border: '#666',
    text: '#888',
    glow: 'none',
  },
  available: {
    bg: 'rgba(33, 150, 243, 0.3)',
    border: '#2196f3',
    text: '#64b5f6',
    glow: '0 0 15px rgba(33, 150, 243, 0.5)',
  },
  in_progress: {
    bg: 'rgba(255, 193, 7, 0.3)',
    border: '#ffc107',
    text: '#ffca28',
    glow: '0 0 15px rgba(255, 193, 7, 0.5)',
  },
  completed: {
    bg: 'rgba(76, 175, 80, 0.3)',
    border: '#4caf50',
    text: '#81c784',
    glow: '0 0 15px rgba(76, 175, 80, 0.5)',
  },
};

const SkillNodeComponent: React.FC<{
  skill: SkillNode;
  onClick?: () => void;
  compact?: boolean;
}> = ({ skill, onClick, compact }) => {
  const colors = statusColors[skill.status];
  const isClickable = skill.status !== 'locked';

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: compact ? '10px' : '16px',
        padding: compact ? '10px' : '16px',
        minWidth: compact ? '100px' : '140px',
        maxWidth: compact ? '120px' : '180px',
        textAlign: 'center',
        cursor: isClickable ? 'pointer' : 'not-allowed',
        transition: 'all 0.3s ease',
        boxShadow: colors.glow,
        opacity: skill.status === 'locked' ? 0.6 : 1,
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (isClickable) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = colors.glow.replace('15px', '25px');
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = colors.glow;
      }}
    >
      {/* Status indicator */}
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: colors.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
        }}
      >
        {skill.status === 'completed' && '✓'}
        {skill.status === 'in_progress' && '◐'}
        {skill.status === 'available' && '!'}
        {skill.status === 'locked' && '🔒'}
      </div>

      {/* Icon */}
      <div
        style={{
          fontSize: compact ? '24px' : '32px',
          marginBottom: compact ? '4px' : '8px',
        }}
      >
        {skill.icon || '📖'}
      </div>

      {/* Name */}
      <div
        style={{
          fontWeight: 'bold',
          fontSize: compact ? '11px' : '13px',
          color: colors.text,
          marginBottom: '4px',
          lineHeight: 1.2,
        }}
      >
        {skill.name}
      </div>

      {/* XP */}
      <div
        style={{
          fontSize: compact ? '10px' : '11px',
          color: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        {skill.xp} XP
      </div>

      {/* Progress bar for in_progress */}
      {skill.status === 'in_progress' && (
        <div
          style={{
            marginTop: '8px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '50%',
              height: '100%',
              background: colors.border,
              borderRadius: '2px',
            }}
          />
        </div>
      )}
    </div>
  );
};

const ConnectionLine: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
}> = ({ from, to, isActive }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <defs>
        <linearGradient id={`gradient-${from.x}-${to.x}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset="0%"
            stopColor={isActive ? '#4caf50' : '#666'}
            stopOpacity={isActive ? 1 : 0.5}
          />
          <stop
            offset="100%"
            stopColor={isActive ? '#81c784' : '#888'}
            stopOpacity={isActive ? 1 : 0.5}
          />
        </linearGradient>
      </defs>
      <path
        d={`M ${from.x} ${from.y} Q ${midX} ${from.y}, ${midX} ${midY} T ${to.x} ${to.y}`}
        fill="none"
        stroke={`url(#gradient-${from.x}-${to.x})`}
        strokeWidth={isActive ? 3 : 2}
        strokeDasharray={isActive ? 'none' : '5,5'}
      />
      {isActive && (
        <circle r="4" fill="#4caf50">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={`M ${from.x} ${from.y} Q ${midX} ${from.y}, ${midX} ${midY} T ${to.x} ${to.y}`}
          />
        </circle>
      )}
    </svg>
  );
};

export const SkillTree: React.FC<SkillTreeProps> = ({
  skills,
  onSkillClick,
  title,
  compact = false,
}) => {
  // Group skills by tier
  const tiers = useMemo(() => {
    const grouped: Record<number, SkillNode[]> = {};
    skills.forEach(skill => {
      if (!grouped[skill.tier]) {
        grouped[skill.tier] = [];
      }
      grouped[skill.tier].push(skill);
    });
    return grouped;
  }, [skills]);

  const tierKeys = Object.keys(tiers)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate positions
  const skillPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const nodeWidth = compact ? 130 : 200;
    const nodeHeight = compact ? 100 : 140;
    const tierSpacing = compact ? 120 : 180;

    tierKeys.forEach((tier, tierIndex) => {
      const tierSkills = tiers[tier];
      const tierWidth = tierSkills.length * nodeWidth;
      const startX = -tierWidth / 2 + nodeWidth / 2;

      tierSkills.forEach((skill, skillIndex) => {
        positions[skill.id] = {
          x: startX + skillIndex * nodeWidth,
          y: tierIndex * tierSpacing,
        };
      });
    });

    return positions;
  }, [tiers, tierKeys, compact]);

  // Calculate connections
  const connections = useMemo(() => {
    const conns: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      isActive: boolean;
    }> = [];

    skills.forEach(skill => {
      if (skill.prerequisites) {
        skill.prerequisites.forEach(prereqId => {
          const fromPos = skillPositions[prereqId];
          const toPos = skillPositions[skill.id];
          const fromSkill = skills.find(s => s.id === prereqId);

          if (fromPos && toPos) {
            conns.push({
              from: { x: fromPos.x + 70, y: fromPos.y + (compact ? 80 : 110) },
              to: { x: toPos.x + 70, y: toPos.y },
              isActive: fromSkill?.status === 'completed',
            });
          }
        });
      }
    });

    return conns;
  }, [skills, skillPositions, compact]);

  const completedCount = skills.filter(s => s.status === 'completed').length;
  const totalCount = skills.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '16px',
        padding: compact ? '16px' : '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      {title && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🌳</span>
            {title}
          </h3>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
              {completedCount}/{totalCount} habilidades
            </div>
            <div
              style={{
                width: '120px',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '4px',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4caf50, #81c784)',
                  borderRadius: '3px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(statusColors).map(([status, colors]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: colors.border,
              }}
            />
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {status === 'locked' && 'Bloqueado'}
              {status === 'available' && 'Disponível'}
              {status === 'in_progress' && 'Em Progresso'}
              {status === 'completed' && 'Completo'}
            </span>
          </div>
        ))}
      </div>

      {/* Tree visualization */}
      <div
        style={{
          position: 'relative',
          minHeight: tierKeys.length * (compact ? 120 : 180),
          overflow: 'auto',
        }}
      >
        {/* Connection lines */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: '100%',
            height: '100%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {connections.map((conn, index) => (
            <g key={index}>
              <line
                x1={conn.from.x}
                y1={conn.from.y}
                x2={conn.to.x}
                y2={conn.to.y}
                stroke={conn.isActive ? '#4caf50' : '#666'}
                strokeWidth={conn.isActive ? 3 : 2}
                strokeDasharray={conn.isActive ? 'none' : '5,5'}
                opacity={conn.isActive ? 1 : 0.5}
              />
            </g>
          ))}
        </svg>

        {/* Skill nodes by tier */}
        {tierKeys.map(tier => (
          <div
            key={tier}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: compact ? '12px' : '20px',
              marginBottom: compact ? '30px' : '50px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {tiers[tier].map(skill => (
              <SkillNodeComponent
                key={skill.id}
                skill={skill}
                onClick={() => onSkillClick?.(skill.id)}
                compact={compact}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillTree;
