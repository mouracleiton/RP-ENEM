import React, { useMemo, useState } from 'react';
import { useTheme, Card, Text, Button, ProgressBar, RankBadge } from '@ita-rp/ui-components';
import {
  RankSystem,
  XPSystem,
  useStreakNotifications,
  useWeeklyActivity,
} from '@ita-rp/game-logic';
import type { Rank } from '@ita-rp/shared-types';

interface ProfilePageProps {
  playerName: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  completedSkills: number;
  totalStudyTime: number;
  joinDate: Date;
  currentThemeId: string;
  onChangeTheme: (themeId: string) => void;
  onChangeName?: (name: string) => void;
  onNavigate?: (page: string) => void;
  onResetOnboarding?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  playerName,
  xp,
  level,
  streak,
  longestStreak,
  completedSkills,
  totalStudyTime,
  joinDate,
  currentThemeId,
  onChangeTheme,
  onNavigate,
  onResetOnboarding,
}) => {
  const { currentTheme } = useTheme();
  const currentRank: Rank = RankSystem.getCurrentRank(level);
  const nextRank = RankSystem.getNextRank(currentRank);

  // Notification settings
  const {
    settings: notificationSettings,
    permissionStatus,
    canNotify,
    requestPermission,
    updateSettings,
    sendTestNotification,
  } = useStreakNotifications();

  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const handleToggleNotifications = async () => {
    if (!notificationSettings.enabled) {
      // Enabling notifications
      if (permissionStatus === 'default') {
        const granted = await requestPermission();
        if (granted) {
          updateSettings({ enabled: true });
        }
      } else if (permissionStatus === 'granted') {
        updateSettings({ enabled: true });
      }
    } else {
      // Disabling notifications
      updateSettings({ enabled: false });
    }
  };

  const themes = [
    { id: 'neonBlue', name: 'Neon Blue', color: '#00d4ff' },
    { id: 'matrixGreen', name: 'Matrix Green', color: '#00ff00' },
    { id: 'cyberPurple', name: 'Cyber Purple', color: '#a855f7' },
    { id: 'retroOrange', name: 'Retro Orange', color: '#ff6b35' },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  // Calculate days since join
  const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate advanced statistics
  const advancedStats = useMemo(() => {
    const avgStudyPerDay = daysSinceJoin > 0 ? Math.round(totalStudyTime / daysSinceJoin) : 0;
    const avgXPPerDay = daysSinceJoin > 0 ? Math.round(xp / daysSinceJoin) : 0;
    const skillsPerWeek =
      daysSinceJoin > 7
        ? Math.round((completedSkills / daysSinceJoin) * 7 * 10) / 10
        : completedSkills;
    const xpToNextLevel = XPSystem.calculateXPForLevel(level + 1) - xp;
    const levelProgress = XPSystem.calculateLevelProgress(xp);

    return {
      avgStudyPerDay,
      avgXPPerDay,
      skillsPerWeek,
      xpToNextLevel,
      levelProgress,
    };
  }, [xp, level, totalStudyTime, completedSkills, daysSinceJoin]);

  // Real weekly activity from study history
  const { currentWeek: weeklyActivityData, hasActivity } = useWeeklyActivity();

  // Format for display (keeping backward compatibility with existing UI)
  const weeklyActivity = useMemo(() => {
    return weeklyActivityData.days.map(day => ({
      day: day.day,
      active: day.active,
      minutes: day.minutes,
    }));
  }, [weeklyActivityData]);

  const stats = [
    { label: 'Nível Atual', value: level.toString(), icon: '📈', color: '#4caf50' },
    { label: 'XP Total', value: xp.toLocaleString(), icon: '⚡', color: '#ffc107' },
    { label: 'Habilidades', value: completedSkills.toString(), icon: '✅', color: '#2196f3' },
    { label: 'Tempo Total', value: formatTime(totalStudyTime), icon: '⏱️', color: '#9c27b0' },
    { label: 'Streak Atual', value: `${streak} dias`, icon: '🔥', color: '#ff5722' },
    { label: 'Maior Streak', value: `${longestStreak} dias`, icon: '🏆', color: '#ff9800' },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Text variant="heading" size="2xl" color={currentTheme.colors.primary} glow>
          Meu Perfil
        </Text>
        <Text variant="body" color={currentTheme.colors.textSecondary}>
          Gerencie suas configurações e veja suas estatísticas
        </Text>
      </div>

      {/* Profile Card */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar/Rank */}
          <div style={{ textAlign: 'center' }}>
            <RankBadge rank={currentRank} size="large" />
            <Text
              variant="caption"
              color={currentTheme.colors.textSecondary}
              style={{ marginTop: '8px' }}
            >
              {currentRank.name}
            </Text>
          </div>

          {/* Name and Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Text variant="heading" size="xl" color={currentTheme.colors.text}>
              {playerName}
            </Text>
            <Text variant="body" color={currentTheme.colors.primary}>
              Aluno do ENEM
            </Text>
            <Text
              variant="caption"
              color={currentTheme.colors.textSecondary}
              style={{ marginTop: '8px' }}
            >
              Membro há {daysSinceJoin} dias • Desde {joinDate.toLocaleDateString('pt-BR')}
            </Text>
          </div>

          {/* Level Progress */}
          <div style={{ minWidth: '200px' }}>
            <Text variant="caption" color={currentTheme.colors.textSecondary}>
              Nível {level}
            </Text>
            <ProgressBar value={xp % 1000} maxValue={1000} variant="primary" size="medium" />
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index} style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{stat.icon}</div>
            <Text variant="heading" size="lg" color={stat.color}>
              {stat.value}
            </Text>
            <Text variant="caption" color={currentTheme.colors.textSecondary}>
              {stat.label}
            </Text>
          </Card>
        ))}
      </div>

      {/* Weekly Activity & Advanced Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Weekly Activity */}
        <Card title="Atividade Semanal">
          {hasActivity ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                {weeklyActivity.map((day, index) => (
                  <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                    <div
                      style={{
                        width: '100%',
                        height: '60px',
                        background: day.active
                          ? `linear-gradient(to top, ${currentTheme.colors.primary}40, ${currentTheme.colors.primary})`
                          : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: '4px',
                        marginBottom: '8px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {day.active && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${Math.min(day.minutes * 1.5, 100)}%`,
                            background: currentTheme.colors.primary,
                            borderRadius: '8px',
                          }}
                        />
                      )}
                      {day.active && (
                        <span style={{ position: 'relative', fontSize: '10px', color: 'white' }}>
                          {day.minutes}m
                        </span>
                      )}
                    </div>
                    <Text variant="caption" color={currentTheme.colors.textSecondary}>
                      {day.day}
                    </Text>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="caption" color={currentTheme.colors.textSecondary}>
                  {weeklyActivityData.activeDays} dias ativos
                </Text>
                <Text variant="caption" color={currentTheme.colors.primary}>
                  {weeklyActivityData.totalMinutes} min total
                </Text>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text variant="body" color={currentTheme.colors.textSecondary}>
                Nenhuma atividade registrada esta semana
              </Text>
              <Text
                variant="caption"
                color={currentTheme.colors.textSecondary}
                style={{ marginTop: '8px' }}
              >
                Complete sessões de estudo para ver sua atividade aqui
              </Text>
            </div>
          )}
        </Card>

        {/* Advanced Statistics */}
        <Card title="Estatísticas Detalhadas">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="body" color={currentTheme.colors.textSecondary}>
                Média diária de estudo
              </Text>
              <Text
                variant="body"
                color={currentTheme.colors.primary}
                style={{ fontWeight: 'bold' }}
              >
                {formatTime(advancedStats.avgStudyPerDay)}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="body" color={currentTheme.colors.textSecondary}>
                XP médio por dia
              </Text>
              <Text variant="body" color="#ffc107" style={{ fontWeight: 'bold' }}>
                +{advancedStats.avgXPPerDay} XP
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="body" color={currentTheme.colors.textSecondary}>
                Habilidades por semana
              </Text>
              <Text variant="body" color="#2196f3" style={{ fontWeight: 'bold' }}>
                {advancedStats.skillsPerWeek}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="body" color={currentTheme.colors.textSecondary}>
                XP para próximo nível
              </Text>
              <Text variant="body" color="#4caf50" style={{ fontWeight: 'bold' }}>
                {advancedStats.xpToNextLevel.toLocaleString()}
              </Text>
            </div>
            {nextRank && (
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text variant="body" color={currentTheme.colors.textSecondary}>
                  Próximo nível acadêmico
                </Text>
                <Text variant="body" color="#9c27b0" style={{ fontWeight: 'bold' }}>
                  {nextRank.name} (Nv. {nextRank.level})
                </Text>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Next Level Progress */}
      <Card title="Progresso para Próximo Nível" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text variant="body" color={currentTheme.colors.text}>
              Nível {level} → Nível {level + 1}
            </Text>
            <Text variant="body" color={currentTheme.colors.primary}>
              {(advancedStats.levelProgress * 100).toFixed(1)}%
            </Text>
          </div>
          <ProgressBar
            value={advancedStats.levelProgress * 100}
            maxValue={100}
            variant="primary"
            size="large"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <Text variant="caption" color={currentTheme.colors.textSecondary}>
              {xp.toLocaleString()} XP
            </Text>
            <Text variant="caption" color={currentTheme.colors.textSecondary}>
              {XPSystem.calculateXPForLevel(level + 1).toLocaleString()} XP
            </Text>
          </div>
        </div>
        <Text variant="caption" color={currentTheme.colors.textSecondary}>
          Complete mais {Math.ceil(advancedStats.xpToNextLevel / 50)} habilidades para subir de
          nível
        </Text>
      </Card>

      {/* Theme Selection */}
      <Card title="Tema Visual" style={{ marginBottom: '24px' }}>
        <Text
          variant="body"
          color={currentTheme.colors.textSecondary}
          style={{ marginBottom: '16px' }}
        >
          Escolha o tema cyberpunk de sua preferência
        </Text>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => onChangeTheme(theme.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                backgroundColor:
                  currentThemeId === theme.id ? theme.color + '20' : currentTheme.colors.surface,
                border: `2px solid ${currentThemeId === theme.id ? theme.color : currentTheme.colors.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: theme.color,
                  boxShadow: `0 0 10px ${theme.color}`,
                }}
              />
              <span
                style={{
                  fontFamily: currentTheme.fonts.secondary,
                  fontSize: '0.875rem',
                  color: currentThemeId === theme.id ? theme.color : currentTheme.colors.text,
                  fontWeight: currentThemeId === theme.id ? 'bold' : 'normal',
                }}
              >
                {theme.name}
              </span>
              {currentThemeId === theme.id && <span style={{ marginLeft: '8px' }}>✓</span>}
            </button>
          ))}
        </div>
      </Card>

      {/* Rank Progress */}
      <Card title="Progressão Acadêmica">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {RankSystem.getAllRanks()
            .slice(0, 6)
            .map((rank, index) => {
              const isCurrentRank = rank.id === currentRank.id;
              const isUnlocked = level >= rank.level;

              return (
                <div
                  key={rank.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px',
                    backgroundColor: isCurrentRank
                      ? currentTheme.colors.primary + '20'
                      : 'transparent',
                    borderRadius: '8px',
                    opacity: isUnlocked ? 1 : 0.5,
                  }}
                >
                  <span
                    style={{ fontSize: '1.5rem', filter: isUnlocked ? 'none' : 'grayscale(100%)' }}
                  >
                    {rank.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <Text
                      variant="body"
                      color={isCurrentRank ? currentTheme.colors.primary : currentTheme.colors.text}
                      style={{ fontWeight: isCurrentRank ? 'bold' : 'normal' }}
                    >
                      {rank.name}
                    </Text>
                    <Text variant="caption" color={currentTheme.colors.textSecondary}>
                      Nível {rank.level}
                    </Text>
                  </div>
                  <div>
                    {isUnlocked ? (
                      <span style={{ color: currentTheme.colors.success }}>✅</span>
                    ) : (
                      <span style={{ color: currentTheme.colors.textSecondary }}>🔒</span>
                    )}
                  </div>
                </div>
              );
            })}
          <Text
            variant="caption"
            color={currentTheme.colors.textSecondary}
            style={{ textAlign: 'center', marginTop: '8px' }}
          >
            +{RankSystem.getAllRanks().length - 6} níveis acadêmicos disponíveis...
          </Text>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card title="Notificações" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text variant="body" color={currentTheme.colors.text}>
                Notificações Push
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                {permissionStatus === 'denied'
                  ? 'Bloqueado pelo navegador'
                  : notificationSettings.enabled
                    ? 'Receber lembretes de estudo'
                    : 'Ative para receber lembretes'}
              </Text>
            </div>
            <Button
              variant={notificationSettings.enabled && canNotify ? 'primary' : 'secondary'}
              size="small"
              onClick={handleToggleNotifications}
              disabled={permissionStatus === 'denied'}
            >
              {permissionStatus === 'denied'
                ? 'Bloqueado'
                : notificationSettings.enabled && canNotify
                  ? 'Ativado'
                  : 'Desativado'}
            </Button>
          </div>

          {/* Notification options (show when enabled) */}
          {notificationSettings.enabled && canNotify && (
            <>
              {/* Streak reminders */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: '16px',
                }}
              >
                <div>
                  <Text variant="body" color={currentTheme.colors.text}>
                    Lembrete de Streak
                  </Text>
                  <Text variant="caption" color={currentTheme.colors.textSecondary}>
                    Aviso para manter sua sequência
                  </Text>
                </div>
                <button
                  onClick={() =>
                    updateSettings({ streakReminder: !notificationSettings.streakReminder })
                  }
                  style={{
                    width: '48px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: notificationSettings.streakReminder
                      ? currentTheme.colors.primary
                      : currentTheme.colors.surface,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: notificationSettings.streakReminder ? '26px' : '2px',
                      transition: 'left 0.3s',
                    }}
                  />
                </button>
              </div>

              {/* Daily challenge reminders */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: '16px',
                }}
              >
                <div>
                  <Text variant="body" color={currentTheme.colors.text}>
                    Missões Diárias
                  </Text>
                  <Text variant="caption" color={currentTheme.colors.textSecondary}>
                    Lembrete de missões pendentes
                  </Text>
                </div>
                <button
                  onClick={() =>
                    updateSettings({
                      dailyChallengeReminder: !notificationSettings.dailyChallengeReminder,
                    })
                  }
                  style={{
                    width: '48px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: notificationSettings.dailyChallengeReminder
                      ? currentTheme.colors.primary
                      : currentTheme.colors.surface,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: notificationSettings.dailyChallengeReminder ? '26px' : '2px',
                      transition: 'left 0.3s',
                    }}
                  />
                </button>
              </div>

              {/* Achievement notifications */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: '16px',
                }}
              >
                <div>
                  <Text variant="body" color={currentTheme.colors.text}>
                    Conquistas
                  </Text>
                  <Text variant="caption" color={currentTheme.colors.textSecondary}>
                    Notificar novas conquistas
                  </Text>
                </div>
                <button
                  onClick={() =>
                    updateSettings({
                      achievementNotifications: !notificationSettings.achievementNotifications,
                    })
                  }
                  style={{
                    width: '48px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: notificationSettings.achievementNotifications
                      ? currentTheme.colors.primary
                      : currentTheme.colors.surface,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: notificationSettings.achievementNotifications ? '26px' : '2px',
                      transition: 'left 0.3s',
                    }}
                  />
                </button>
              </div>

              {/* Reminder time */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: '16px',
                }}
              >
                <div>
                  <Text variant="body" color={currentTheme.colors.text}>
                    Horário do Lembrete
                  </Text>
                  <Text variant="caption" color={currentTheme.colors.textSecondary}>
                    Quando receber o lembrete diário
                  </Text>
                </div>
                <input
                  type="time"
                  value={notificationSettings.reminderTime}
                  onChange={e => updateSettings({ reminderTime: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${currentTheme.colors.border}`,
                    backgroundColor: currentTheme.colors.surface,
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.fonts.secondary,
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Test notification button */}
              <div style={{ paddingLeft: '16px', paddingTop: '8px' }}>
                <Button variant="secondary" size="small" onClick={sendTestNotification}>
                  Testar Notificação
                </Button>
              </div>
            </>
          )}

          {permissionStatus === 'denied' && (
            <Text variant="caption" color="#ff6b6b" style={{ paddingLeft: '16px' }}>
              As notificações foram bloqueadas. Para habilitar, vá nas configurações do navegador.
            </Text>
          )}
        </div>
      </Card>

      {/* Settings */}
      <Card title="Configurações" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text variant="body" color={currentTheme.colors.text}>
                Som
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                Efeitos sonoros e música
              </Text>
            </div>
            <Button variant="secondary" size="small">
              Ativado
            </Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text variant="body" color={currentTheme.colors.text}>
                Idioma
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                Português (Brasil)
              </Text>
            </div>
            <Button variant="secondary" size="small">
              PT-BR
            </Button>
          </div>

          {onResetOnboarding && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text variant="body" color={currentTheme.colors.text}>
                  Tutorial
                </Text>
                <Text variant="caption" color={currentTheme.colors.textSecondary}>
                  Rever o tutorial de introdução
                </Text>
              </div>
              <Button variant="secondary" size="small" onClick={onResetOnboarding}>
                Ver Tutorial
              </Button>
            </div>
          )}

          {onNavigate && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text variant="body" color={currentTheme.colors.text}>
                  Sincronização
                </Text>
                <Text variant="caption" color={currentTheme.colors.textSecondary}>
                  Configurar backup descentralizado
                </Text>
              </div>
              <Button variant="secondary" size="small" onClick={() => onNavigate('sync')}>
                Configurar
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
