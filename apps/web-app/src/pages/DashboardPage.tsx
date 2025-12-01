import React, { useState, useEffect } from 'react';
import {
  useTheme,
  Card,
  Text,
  ProgressBar,
  RankBadge,
  Button,
  DailyChallenges,
} from '@ita-rp/ui-components';
import { XPSystem, RankSystem, dailyChallengeSystem, type DailyChallenge } from '@ita-rp/game-logic';
import type { Rank } from '@ita-rp/shared-types';

interface DashboardPageProps {
  xp: number;
  level: number;
  streak: number;
  completedSkills: number;
  totalSkills: number;
  studyTimeToday: number;
  onNavigate: (page: string) => void;
  onAddXP?: (amount: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  xp,
  level,
  streak,
  completedSkills,
  totalSkills,
  studyTimeToday,
  onNavigate,
  onAddXP,
}) => {
  const { currentTheme } = useTheme();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setChallenges(dailyChallengeSystem.getChallenges());
    setTimeRemaining(dailyChallengeSystem.getTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(dailyChallengeSystem.getTimeRemaining());
    }, 60000); // Update every minute for compact view

    return () => clearInterval(interval);
  }, []);

  const handleClaimReward = (challengeId: string) => {
    const reward = dailyChallengeSystem.claimReward(challengeId);
    if (reward) {
      onAddXP?.(reward.xp);
      setChallenges(dailyChallengeSystem.getChallenges());
    }
  };

  const currentRank: Rank = RankSystem.getCurrentRank(level);
  const nextRank = RankSystem.getNextRank(currentRank);
  const levelProgress = XPSystem.calculateLevelProgress(xp);
  const xpForNextLevel = XPSystem.calculateXPForLevel(level + 1);

  const stats = [
    { label: 'Streak Atual', value: `${streak} dias`, icon: '🔥', color: currentTheme.colors.warning },
    { label: 'Habilidades', value: `${completedSkills}/${totalSkills}`, icon: '📚', color: currentTheme.colors.primary },
    { label: 'Tempo Hoje', value: `${studyTimeToday}min`, icon: '⏱️', color: currentTheme.colors.accent },
    { label: 'XP Total', value: xp.toLocaleString(), icon: '⚡', color: currentTheme.colors.success },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Text variant="heading" size="2xl" color={currentTheme.colors.primary} glow>
          Bem-vindo, Cadete!
        </Text>
        <Text variant="body" size="lg" color={currentTheme.colors.textSecondary}>
          Continue sua jornada rumo à excelência
        </Text>
      </div>

      {/* Main Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index} style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{stat.icon}</div>
            <Text variant="heading" size="xl" color={stat.color}>
              {stat.value}
            </Text>
            <Text variant="caption" color={currentTheme.colors.textSecondary}>
              {stat.label}
            </Text>
          </Card>
        ))}
      </div>

      {/* Rank and Progress Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Current Rank */}
        <Card title="Patente Atual">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <RankBadge rank={currentRank} size="large" showProgress currentProgress={levelProgress * 100} />
            <div style={{ flex: 1 }}>
              <Text variant="heading" size="lg" color={currentTheme.colors.text}>
                {currentRank.name}
              </Text>
              <Text variant="body" color={currentTheme.colors.textSecondary}>
                Nível {level}
              </Text>
              {nextRank && (
                <Text variant="caption" color={currentTheme.colors.primary}>
                  Próxima: {nextRank.name} (Nível {nextRank.level})
                </Text>
              )}
            </div>
          </div>
        </Card>

        {/* Level Progress */}
        <Card title="Progresso de Nível">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ProgressBar
              value={xp}
              maxValue={xpForNextLevel}
              label={`Nível ${level} → ${level + 1}`}
              variant="primary"
              size="large"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                {xp.toLocaleString()} XP
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                {xpForNextLevel.toLocaleString()} XP
              </Text>
            </div>
            <Text variant="body" color={currentTheme.colors.text}>
              Faltam <strong style={{ color: currentTheme.colors.primary }}>
                {(xpForNextLevel - xp).toLocaleString()}
              </strong> XP para o próximo nível
            </Text>
          </div>
        </Card>
      </div>

      {/* Daily Challenges Widget */}
      <div
        style={{ marginBottom: '24px', cursor: 'pointer' }}
        onClick={() => onNavigate('challenges')}
      >
        <DailyChallenges
          challenges={challenges}
          onClaimReward={handleClaimReward}
          timeRemaining={timeRemaining}
          compact
        />
      </div>

      {/* Quick Actions */}
      <Card title="Ações Rápidas">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <Button onClick={() => onNavigate('disciplines')} variant="primary" size="large">
            📚 Continuar Estudando
          </Button>
          <Button onClick={() => onNavigate('challenges')} variant="warning" size="large">
            📋 Missões Diárias
          </Button>
          <Button onClick={() => onNavigate('achievements')} variant="secondary" size="large">
            🏆 Ver Conquistas
          </Button>
          <Button onClick={() => onNavigate('profile')} variant="accent" size="large">
            👤 Meu Perfil
          </Button>
        </div>
      </Card>

      {/* Study Streak */}
      {streak > 0 && (
        <Card title="Sequência de Estudos" style={{ marginTop: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '8px' }}>🔥</div>
            <Text variant="heading" size="2xl" color={currentTheme.colors.warning}>
              {streak} dias seguidos!
            </Text>
            <Text variant="body" color={currentTheme.colors.textSecondary}>
              Continue estudando para manter sua sequência
            </Text>
            <ProgressBar
              value={streak}
              maxValue={30}
              label="Meta: 30 dias"
              variant="warning"
              size="medium"
              style={{ marginTop: '16px' }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
