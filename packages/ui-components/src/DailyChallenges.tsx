/**
 * Daily Challenges Component
 * Displays daily missions with progress and rewards
 */

import React, { useState, useEffect } from 'react';

interface DailyChallenge {
  id: string;
  type: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  bonusReward?: {
    type: 'streak_protection' | 'xp_multiplier' | 'badge';
    value: number | string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  completed: boolean;
  claimed: boolean;
}

interface DailyChallengesProps {
  challenges: DailyChallenge[];
  onClaimReward: (challengeId: string) => void;
  timeRemaining: { hours: number; minutes: number; seconds: number };
  compact?: boolean;
}

const difficultyColors = {
  easy: { bg: 'rgba(76, 175, 80, 0.2)', border: '#4caf50', text: '#81c784' },
  medium: { bg: 'rgba(255, 152, 0, 0.2)', border: '#ff9800', text: '#ffb74d' },
  hard: { bg: 'rgba(244, 67, 54, 0.2)', border: '#f44336', text: '#e57373' },
};

const ChallengeCard: React.FC<{
  challenge: DailyChallenge;
  onClaim: () => void;
}> = ({ challenge, onClaim }) => {
  const colors = difficultyColors[challenge.difficulty];
  const progress = (challenge.current / challenge.target) * 100;

  return (
    <div
      style={{
        background: challenge.completed
          ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)'
          : 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '16px',
        border: `1px solid ${challenge.completed ? '#4caf50' : 'rgba(255, 255, 255, 0.1)'}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Difficulty badge */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          color: colors.text,
        }}
      >
        {challenge.difficulty === 'easy' && 'Fácil'}
        {challenge.difficulty === 'medium' && 'Médio'}
        {challenge.difficulty === 'hard' && 'Difícil'}
      </div>

      {/* Icon and title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: challenge.completed
              ? 'linear-gradient(135deg, #4caf50, #81c784)'
              : 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          {challenge.completed ? '✓' : challenge.icon}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{challenge.title}</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>{challenge.description}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: challenge.completed
                ? 'linear-gradient(90deg, #4caf50, #81c784)'
                : 'linear-gradient(90deg, #00bcd4, #4dd0e1)',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            marginTop: '4px',
            opacity: 0.7,
          }}
        >
          <span>
            {challenge.current}/{challenge.target}
          </span>
          <span>{progress.toFixed(0)}%</span>
        </div>
      </div>

      {/* Rewards */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              background: 'rgba(255, 215, 0, 0.2)',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#ffd700',
            }}
          >
            +{challenge.xpReward} XP
          </div>
          {challenge.bonusReward && (
            <div
              style={{
                background: 'rgba(156, 39, 176, 0.2)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#ce93d8',
              }}
            >
              {challenge.bonusReward.type === 'streak_protection' && '🛡️ Proteção de Streak'}
              {challenge.bonusReward.type === 'xp_multiplier' &&
                `⚡ ${challenge.bonusReward.value}x XP`}
            </div>
          )}
        </div>

        {challenge.completed && !challenge.claimed && (
          <button
            onClick={onClaim}
            style={{
              background: 'linear-gradient(135deg, #4caf50, #81c784)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Resgatar
          </button>
        )}

        {challenge.claimed && (
          <div
            style={{
              color: '#81c784',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ✓ Resgatado
          </div>
        )}
      </div>
    </div>
  );
};

export const DailyChallenges: React.FC<DailyChallengesProps> = ({
  challenges,
  onClaimReward,
  timeRemaining,
  compact = false,
}) => {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    setTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          return prev;
        }

        let newSeconds = prev.seconds - 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }
        if (newHours < 0) {
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const completedCount = challenges.filter(c => c.completed).length;
  const claimedCount = challenges.filter(c => c.claimed).length;
  const totalXPAvailable = challenges
    .filter(c => c.completed && !c.claimed)
    .reduce((sum, c) => sum + c.xpReward, 0);

  const formatTime = (t: typeof time) => {
    return `${t.hours.toString().padStart(2, '0')}:${t.minutes.toString().padStart(2, '0')}:${t.seconds.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📋</span>
            <span style={{ fontWeight: 'bold' }}>Missões Diárias</span>
          </div>
          <div
            style={{
              background: 'rgba(255, 152, 0, 0.2)',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#ffb74d',
            }}
          >
            ⏱️ {formatTime(time)}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {completedCount}/{challenges.length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Completas</div>
          </div>

          {totalXPAvailable > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, #ffd700, #ffb300)',
                padding: '8px 16px',
                borderRadius: '8px',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              +{totalXPAvailable} XP disponível
            </div>
          )}
        </div>

        {/* Mini progress indicators */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
          {challenges.map(challenge => (
            <div
              key={challenge.id}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: challenge.claimed
                  ? '#4caf50'
                  : challenge.completed
                    ? '#ffd700'
                    : 'rgba(255, 255, 255, 0.2)',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📋</span>
            Missões Diárias
          </h2>
          <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '14px' }}>
            Complete missões para ganhar XP extra e recompensas especiais!
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.3), rgba(255, 87, 34, 0.3))',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 152, 0, 0.5)',
            }}
          >
            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>
              Tempo restante
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: '#ffb74d',
              }}
            >
              {formatTime(time)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#81c784' }}>
            {completedCount}/{challenges.length}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>Completas</div>
        </div>

        <div
          style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700' }}>
            {claimedCount}/{completedCount}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>Resgatadas</div>
        </div>

        <div
          style={{
            background: 'rgba(0, 188, 212, 0.1)',
            border: '1px solid rgba(0, 188, 212, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4dd0e1' }}>
            {totalXPAvailable > 0 ? `+${totalXPAvailable}` : '0'}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>XP Disponível</div>
        </div>
      </div>

      {/* Challenge cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {challenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onClaim={() => onClaimReward(challenge.id)}
          />
        ))}
      </div>

      {/* All completed message */}
      {completedCount === challenges.length && claimedCount === challenges.length && (
        <div
          style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(139, 195, 74, 0.2))',
            border: '1px solid rgba(76, 175, 80, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
          <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#81c784' }}>
            Parabéns! Todas as missões concluídas!
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
            Volte amanhã para novas missões
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyChallenges;
