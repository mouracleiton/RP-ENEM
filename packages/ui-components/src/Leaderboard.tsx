import React from 'react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  streak: number;
  completedSkills: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      success: string;
      error: string;
      warning: string;
      border: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
  };
  title?: string;
  showStreak?: boolean;
  showSkills?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  theme,
  title = 'Ranking',
  showStreak = true,
  showSkills = true,
}) => {
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number, isCurrentUser: boolean): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      marginBottom: '8px',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      border: '2px solid',
    };

    if (isCurrentUser) {
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary + '20',
        borderColor: theme.colors.primary,
        boxShadow: `0 0 15px ${theme.colors.primary}40`,
      };
    }

    switch (rank) {
      case 1:
        return {
          ...baseStyle,
          backgroundColor: '#FFD700' + '15',
          borderColor: '#FFD700',
        };
      case 2:
        return {
          ...baseStyle,
          backgroundColor: '#C0C0C0' + '15',
          borderColor: '#C0C0C0',
        };
      case 3:
        return {
          ...baseStyle,
          backgroundColor: '#CD7F32' + '15',
          borderColor: '#CD7F32',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        };
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            fontFamily: theme.fonts.primary,
            fontSize: '1.5rem',
            color: theme.colors.primary,
            margin: 0,
            textShadow: `0 0 10px ${theme.colors.primary}60`,
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontFamily: theme.fonts.secondary,
            fontSize: '0.875rem',
            color: theme.colors.textSecondary,
          }}
        >
          {entries.length} participantes
        </span>
      </div>

      {/* Column Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showStreak && showSkills
            ? '60px 1fr 100px 80px 80px 100px'
            : showStreak || showSkills
            ? '60px 1fr 100px 80px 100px'
            : '60px 1fr 100px 100px',
          gap: '12px',
          padding: '8px 16px',
          marginBottom: '8px',
          fontFamily: theme.fonts.secondary,
          fontSize: '0.75rem',
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>#</span>
        <span>Jogador</span>
        <span style={{ textAlign: 'right' }}>XP</span>
        <span style={{ textAlign: 'center' }}>Nível</span>
        {showStreak && <span style={{ textAlign: 'center' }}>Streak</span>}
        {showSkills && <span style={{ textAlign: 'right' }}>Habilidades</span>}
      </div>

      {/* Entries */}
      <div>
        {entries.map((entry) => (
          <div
            key={entry.rank}
            style={getRankStyle(entry.rank, entry.isCurrentUser || false)}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: showStreak && showSkills
                  ? '44px 1fr 100px 80px 80px 100px'
                  : showStreak || showSkills
                  ? '44px 1fr 100px 80px 100px'
                  : '44px 1fr 100px 100px',
                gap: '12px',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {/* Rank */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getMedalEmoji(entry.rank) ? (
                  <span style={{ fontSize: '1.5rem' }}>{getMedalEmoji(entry.rank)}</span>
                ) : (
                  <span
                    style={{
                      fontFamily: theme.fonts.primary,
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: entry.isCurrentUser ? theme.colors.primary : theme.colors.textSecondary,
                    }}
                  >
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Name */}
              <div>
                <span
                  style={{
                    fontFamily: theme.fonts.primary,
                    fontSize: '1rem',
                    fontWeight: entry.isCurrentUser ? 'bold' : 'normal',
                    color: entry.isCurrentUser ? theme.colors.primary : theme.colors.text,
                  }}
                >
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '0.75rem',
                        color: theme.colors.primary,
                        backgroundColor: theme.colors.primary + '20',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      Você
                    </span>
                  )}
                </span>
              </div>

              {/* XP */}
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontFamily: theme.fonts.primary,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: theme.colors.success,
                  }}
                >
                  {entry.xp.toLocaleString()}
                </span>
                <span
                  style={{
                    fontFamily: theme.fonts.secondary,
                    fontSize: '0.75rem',
                    color: theme.colors.textSecondary,
                    marginLeft: '4px',
                  }}
                >
                  XP
                </span>
              </div>

              {/* Level */}
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: theme.colors.primary + '20',
                    borderRadius: '20px',
                    fontFamily: theme.fonts.primary,
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    color: theme.colors.primary,
                  }}
                >
                  Lv.{entry.level}
                </span>
              </div>

              {/* Streak */}
              {showStreak && (
                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      fontFamily: theme.fonts.secondary,
                      fontSize: '0.875rem',
                      color: entry.streak > 0 ? theme.colors.warning : theme.colors.textSecondary,
                    }}
                  >
                    {entry.streak > 0 ? `🔥 ${entry.streak}` : '-'}
                  </span>
                </div>
              )}

              {/* Completed Skills */}
              {showSkills && (
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontFamily: theme.fonts.secondary,
                      fontSize: '0.875rem',
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {entry.completedSkills}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.secondary,
          }}
        >
          Nenhum participante ainda
        </div>
      )}
    </div>
  );
};

// Generate mock leaderboard data for demo purposes
export const generateMockLeaderboard = (currentUserXP: number, currentUserLevel: number, currentUserStreak: number, currentUserSkills: number): LeaderboardEntry[] => {
  const names = [
    'Carlos Silva', 'Ana Santos', 'Pedro Lima', 'Maria Costa',
    'João Oliveira', 'Julia Fernandes', 'Lucas Souza', 'Beatriz Alves',
    'Gabriel Pereira', 'Larissa Rocha', 'Rafael Martins', 'Camila Ribeiro',
    'Matheus Gomes', 'Amanda Dias', 'Felipe Castro'
  ];

  // Generate random entries
  const entries: LeaderboardEntry[] = names.map((name, index) => ({
    rank: 0,
    name,
    xp: Math.floor(Math.random() * 5000) + 500,
    level: Math.floor(Math.random() * 20) + 1,
    streak: Math.floor(Math.random() * 30),
    completedSkills: Math.floor(Math.random() * 50),
    isCurrentUser: false,
  }));

  // Add current user
  entries.push({
    rank: 0,
    name: 'Você',
    xp: currentUserXP,
    level: currentUserLevel,
    streak: currentUserStreak,
    completedSkills: currentUserSkills,
    isCurrentUser: true,
  });

  // Sort by XP and assign ranks
  entries.sort((a, b) => b.xp - a.xp);
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries.slice(0, 10); // Top 10
};

export default Leaderboard;
