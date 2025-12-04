import React, { useMemo, useState, useEffect } from 'react';
import { useGameStore, useStudyAnalytics } from '@ita-rp/game-logic';
import {
  StatsCard,
  ProgressChart,
  HeatmapCalendar,
  LineChart,
  RadarChart,
  ReportExport,
  Button,
  Text,
  Card,
} from '@ita-rp/ui-components';
import { useTheme } from '@ita-rp/ui-components';

interface StatsPageProps {
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
}

export const StatsPage: React.FC<StatsPageProps> = ({ theme }) => {
  const { currentTheme } = useTheme();
  const player = useGameStore((state) => state.player);
  const analytics = useStudyAnalytics();

  // State for filters and controls
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'progress' | 'insights'>('overview');

  // Load analytics data
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [skillProgress, setSkillProgress] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    // Load analytics data
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const weeks = timeRange === 'week' ? 1 : timeRange === 'month' ? 4 : 52;

    setDailyStats(analytics.getDailyStats(days));
    setWeeklyStats(analytics.getWeeklyStats(weeks));
    setSkillProgress(analytics.getSkillProgress());
    setInsights(analytics.getLearningInsights());
  }, [timeRange, analytics]);

  // Calculate derived statistics
  const stats = useMemo(() => {
    const achievements = player?.achievements || [];
    const completedSkills = player?.completedSkills || [];

    // Study time breakdown
    const avgDailyStudyTime = player?.totalStudyTime
      ? Math.round(player.totalStudyTime / Math.max(player.currentStreak, 1))
      : 0;

    // Calculate level progress
    const currentLevelXP = Math.floor(100 * Math.pow(player?.level || 1, 1.5));
    const nextLevelXP = Math.floor(100 * Math.pow((player?.level || 1) + 1, 1.5));
    const levelProgress = player
      ? ((player.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
      : 0;

    // XP per skill average
    const xpPerSkill = completedSkills.length > 0
      ? Math.round((player?.xp || 0) / completedSkills.length)
      : 0;

    // Achievement completion rate
    const totalPossibleAchievements = 30;
    const achievementRate = Math.round((achievements.length / totalPossibleAchievements) * 100);

    return {
      avgDailyStudyTime,
      levelProgress,
      xpPerSkill,
      achievementRate,
      totalAchievements: achievements.length,
      totalPossibleAchievements,
    };
  }, [player]);

  // Generate progress chart data
  const progressData = useMemo(() => {
    return dailyStats.map((day, index) => ({
      x: index,
      y: day.totalStudyTime || 0,
      label: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    })).slice(-30); // Last 30 days
  }, [dailyStats]);

  // Generate XP trend data
  const xpTrendData = useMemo(() => {
    return dailyStats.map((day, index) => ({
      x: index,
      y: day.totalXPEarned || 0,
      label: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    })).slice(-30);
  }, [dailyStats]);

  // Generate skill radar data
  const skillRadarData = useMemo(() => {
    // Map disciplines to radar data
    const disciplineData = new Map<string, { total: number; count: number; time: number }>();

    dailyStats.forEach(day => {
      Object.entries(day.disciplineBreakdown || {}).forEach(([disciplineId, data]: [string, any]) => {
        if (!disciplineData.has(disciplineId)) {
          disciplineData.set(disciplineId, { total: 0, count: 0, time: 0 });
        }
        const current = disciplineData.get(disciplineId)!;
        current.total += data.xp || 0;
        current.time += data.time || 0;
        current.count += data.skills || 0;
      });
    });

    return Array.from(disciplineData.entries())
      .map(([disciplineId, data]) => ({
        label: `Disciplina ${disciplineId}`,
        value: Math.min(100, (data.time / 60)), // Convert to hours, cap at 100
        color: theme.colors.primary,
      }))
      .slice(0, 6); // Top 6 disciplines
  }, [dailyStats, theme.colors.primary]);

  
  // Generate report data
  const reportData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365));

    return {
      title: `Relatório de Aprendizagem - ${timeRange === 'week' ? 'Semana' : timeRange === 'month' ? 'Mês' : 'Ano'}`,
      generatedAt: new Date().toISOString(),
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalStudyTime: dailyStats.reduce((sum, day) => sum + day.totalStudyTime, 0),
        sessionsCount: dailyStats.reduce((sum, day) => sum + day.sessionsCount, 0),
        skillsStudied: new Set(dailyStats.flatMap(day => day.skillsStudied)).size,
        totalXPEarned: dailyStats.reduce((sum, day) => sum + day.totalXPEarned, 0),
        averagePerformance: dailyStats.length > 0
          ? dailyStats.reduce((sum, day) => sum + day.averagePerformance, 0) / dailyStats.filter(day => day.averagePerformance > 0).length
          : 0,
        streakDays: dailyStats.filter(day => day.streakDay).length,
      },
      charts: [],
      insights: insights ? [
        `Seu melhor horário para estudar é entre ${insights.peakProductivityHours[0]}h e ${insights.peakProductivityHours[0] + 2}h`,
        `Seu comprimento ideal de sessão é de ${Math.round(insights.optimalSessionLength)} minutos`,
        `Você está aprendendo em uma velocidade de ${insights.learningVelocity.toFixed(1)} habilidades por semana`,
        `Sua consistência de estudo é de ${insights.studyConsistency.toFixed(0)}%`,
      ] : [],
    };
  }, [timeRange, dailyStats, insights]);

  if (!player) {
    return (
      <div style={{ padding: '24px', color: theme.colors.text }}>
        Carregando estatísticas...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Text variant="heading" size="2xl" color={currentTheme.colors.text}>
          📊 Estatísticas Detalhadas
        </Text>
        <Text variant="body" color={currentTheme.colors.textSecondary}>
          Acompanhe seu progresso e descubra insights sobre seu aprendizado
        </Text>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* View Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { value: 'overview', label: 'Visão Geral' },
              { value: 'progress', label: 'Progresso' },
              { value: 'insights', label: 'Insights' },
            ].map((view) => (
              <Button
                key={view.value}
                onClick={() => setSelectedView(view.value as any)}
                variant={selectedView === view.value ? 'primary' : 'secondary'}
                size="small"
              >
                {view.label}
              </Button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mês' },
              { value: 'year', label: 'Ano' },
            ].map((range) => (
              <Button
                key={range.value}
                onClick={() => setTimeRange(range.value as any)}
                variant={timeRange === range.value ? 'primary' : 'secondary'}
                size="small"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatsCard
          title="XP Total"
          value={player.xp.toLocaleString()}
          subtitle={`${stats.xpPerSkill} XP por habilidade`}
          icon="⚡"
          color={currentTheme.colors.primary}
          theme={currentTheme}
        />
        <StatsCard
          title="Nível"
          value={player.level}
          subtitle={`${Math.round(stats.levelProgress)}% para o próximo`}
          icon="🎯"
          color={currentTheme.colors.secondary}
          theme={currentTheme}
        />
        <StatsCard
          title="Streak Atual"
          value={`${player.currentStreak} dias`}
          subtitle={`Recorde: ${player.longestStreak} dias`}
          icon="🔥"
          trend={player.currentStreak > 0 ? { value: player.currentStreak, isPositive: true } : undefined}
          color={currentTheme.colors.warning}
          theme={currentTheme}
        />
        <StatsCard
          title="Tempo de Estudo"
          value={`${Math.floor(player.totalStudyTime / 60)}h`}
          subtitle={`~${stats.avgDailyStudyTime} min/dia`}
          icon="⏱️"
          color="#4ecdc4"
          theme={currentTheme}
        />
        <StatsCard
          title="Habilidades"
          value={player.completedSkills.length}
          subtitle="Concluídas"
          icon="✅"
          color={currentTheme.colors.success}
          theme={currentTheme}
        />
        <StatsCard
          title="Conquistas"
          value={`${stats.totalAchievements}/${stats.totalPossibleAchievements}`}
          subtitle={`${stats.achievementRate}% desbloqueadas`}
          icon="🏆"
          color="#fbbf24"
          theme={currentTheme}
        />
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}>
          {/* Activity Heatmap */}
          <div style={{ gridColumn: 'span 2' }}>
            <HeatmapCalendar
              title="📅 Atividade de Estudo"
              data={dailyStats.map(day => ({
                date: day.date,
                value: Math.min(100, (day.totalStudyTime / 60) * 10), // Convert to 0-100 scale
                label: day.totalStudyTime > 0 ? `${Math.floor(day.totalStudyTime / 60)}h ${day.totalStudyTime % 60}m` : 'Sem estudo',
              }))}
              weeks={12}
              theme={currentTheme}
            />
          </div>

          {/* XP Trend */}
          <LineChart
            title="📈 Tendência de XP"
            data={xpTrendData}
            color={currentTheme.colors.primary}
            height={200}
            theme={currentTheme}
          />

          {/* Study Time Trend */}
          <LineChart
            title="⏱️ Tempo de Estudo Diário"
            data={progressData}
            color={currentTheme.colors.accent}
            height={200}
            theme={currentTheme}
          />
        </div>
      )}

      {selectedView === 'progress' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}>
          {/* Skill Radar */}
          <RadarChart
            title="🎯 Foco por Disciplina"
            data={skillRadarData}
            size={350}
            theme={currentTheme}
          />

          {/* Weekly Progress */}
          <ProgressChart
            title="📊 Progresso Semanal"
            data={weeklyStats.slice(-8).map((week, index) => ({
              label: `Semana ${index + 1}`,
              value: week.totalStudyTime || 0,
              color: currentTheme.colors.primary,
            }))}
            showLabels={true}
            showValues={true}
            barHeight={24}
            theme={currentTheme}
          />

          {/* Skill Progress Details */}
          <Card title="📈 Detalhes das Habilidades" style={{ gridColumn: 'span 2' }}>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              {skillProgress.slice(0, 10).map((skill, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderBottom: `1px solid ${currentTheme.colors.border}20`,
                }}>
                  <div>
                    <Text variant="body" color={currentTheme.colors.text}>
                      {skill.skillName}
                    </Text>
                    <Text variant="caption" color={currentTheme.colors.textSecondary}>
                      {skill.disciplineName} • {skill.sessionCount} sessões
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text variant="body" color={currentTheme.colors.primary}>
                      {Math.round(skill.currentMastery)}%
                    </Text>
                    <Text variant="caption" color={currentTheme.colors.textSecondary}>
                      {Math.floor(skill.totalStudyTime / 60)}h
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {selectedView === 'insights' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}>
          {/* Learning Insights */}
          <Card title="🧠 Insights de Aprendizado" style={{ gridColumn: 'span 2' }}>
            <div style={{ padding: '20px' }}>
              {insights && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                }}>
                  <div>
                    <Text variant="subheading" color={currentTheme.colors.text}>
                      Picos de Produtividade
                    </Text>
                    <Text variant="body" color={currentTheme.colors.textSecondary}>
                      {insights.peakProductivityHours.join('h, ')}h
                    </Text>
                  </div>
                  <div>
                    <Text variant="subheading" color={currentTheme.colors.text}>
                      Sessão Ideal
                    </Text>
                    <Text variant="body" color={currentTheme.colors.textSecondary}>
                      {Math.round(insights.optimalSessionLength)} minutos
                    </Text>
                  </div>
                  <div>
                    <Text variant="subheading" color={currentTheme.colors.text}>
                      Velocidade de Aprendizado
                    </Text>
                    <Text variant="body" color={currentTheme.colors.textSecondary}>
                      {insights.learningVelocity.toFixed(1)} habilidades/semana
                    </Text>
                  </div>
                  <div>
                    <Text variant="subheading" color={currentTheme.colors.text}>
                      Consistência
                    </Text>
                    <Text variant="body" color={currentTheme.colors.textSecondary}>
                      {insights.studyConsistency.toFixed(0)}%
                    </Text>
                  </div>
                </div>
              )}

              {/* Next Milestones */}
              {insights && (
                <div style={{ marginTop: '24px' }}>
                  <Text variant="subheading" color={currentTheme.colors.text}>
                    🎯 Próximos Marcos
                  </Text>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '12px',
                  }}>
                    {insights.nextMilestones.map((milestone: any, index: number) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: currentTheme.colors.background,
                        borderRadius: '8px',
                      }}>
                        <div>
                          <Text variant="body" color={currentTheme.colors.text}>
                            {milestone.description}
                          </Text>
                          <Text variant="caption" color={currentTheme.colors.textSecondary}>
                            Estimado: {milestone.estimatedDays} dias
                          </Text>
                        </div>
                        <div style={{
                          width: '60px',
                          height: '6px',
                          backgroundColor: currentTheme.colors.border,
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${Math.max(10, 100 - (milestone.estimatedDays * 3))}%`,
                            height: '100%',
                            backgroundColor: currentTheme.colors.primary,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Report Export */}
          <ReportExport
            data={reportData}
            theme={currentTheme}
          />
        </div>
      )}
    </div>
  );
};

export default StatsPage;