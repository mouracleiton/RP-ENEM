import React, { useMemo } from 'react';
import {
  useTheme,
  Card,
  Text,
  Leaderboard,
  generateMockLeaderboard,
} from '@ita-rp/ui-components';

interface LeaderboardPageProps {
  playerXP: number;
  playerLevel: number;
  playerStreak: number;
  playerSkills: number;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  playerXP,
  playerLevel,
  playerStreak,
  playerSkills,
}) => {
  const { currentTheme } = useTheme();

  // Generate leaderboard entries with current player
  const leaderboardEntries = useMemo(() => {
    return generateMockLeaderboard(playerXP, playerLevel, playerStreak, playerSkills);
  }, [playerXP, playerLevel, playerStreak, playerSkills]);

  // Find current user rank
  const currentUserRank = leaderboardEntries.find(e => e.isCurrentUser)?.rank || 0;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Text variant="heading" size="2xl" color={currentTheme.colors.primary} glow>
          Ranking
        </Text>
        <Text variant="body" color={currentTheme.colors.textSecondary}>
          Veja como você se compara com outros estudantes
        </Text>
      </div>

      {/* Player Summary Card */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: currentTheme.colors.primary + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `3px solid ${currentTheme.colors.primary}`,
                boxShadow: `0 0 20px ${currentTheme.colors.primary}40`,
              }}
            >
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentTheme.colors.primary }}>
                #{currentUserRank}
              </span>
            </div>
            <div>
              <Text variant="heading" size="lg" color={currentTheme.colors.text}>
                Sua Posição
              </Text>
              <Text variant="body" color={currentTheme.colors.textSecondary}>
                {currentUserRank <= 3
                  ? 'Parabéns! Você está no pódio!'
                  : currentUserRank <= 10
                  ? 'Você está no Top 10!'
                  : 'Continue estudando para subir no ranking!'}
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', textAlign: 'center' }}>
            <div>
              <Text variant="heading" size="xl" color={currentTheme.colors.success}>
                {playerXP.toLocaleString()}
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                XP Total
              </Text>
            </div>
            <div>
              <Text variant="heading" size="xl" color={currentTheme.colors.primary}>
                Lv.{playerLevel}
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                Nível
              </Text>
            </div>
            {playerStreak > 0 && (
              <div>
                <Text variant="heading" size="xl" color={currentTheme.colors.warning}>
                  {playerStreak}
                </Text>
                <Text variant="caption" color={currentTheme.colors.textSecondary}>
                  Streak
                </Text>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <Leaderboard
        entries={leaderboardEntries}
        theme={currentTheme}
        title="Top 10 Estudantes"
        showStreak={true}
        showSkills={true}
      />

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '24px',
        }}
      >
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
            <Text variant="heading" size="lg" color={currentTheme.colors.text}>
              Competição Semanal
            </Text>
            <Text variant="body" color={currentTheme.colors.textSecondary}>
              Reseta toda segunda-feira
            </Text>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
            <Text variant="heading" size="lg" color={currentTheme.colors.text}>
              Meta da Semana
            </Text>
            <Text variant="body" color={currentTheme.colors.success}>
              +500 XP para subir
            </Text>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏆</div>
            <Text variant="heading" size="lg" color={currentTheme.colors.text}>
              Prêmio Top 3
            </Text>
            <Text variant="body" color={currentTheme.colors.warning}>
              Badge Exclusivo
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardPage;
