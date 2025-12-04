import React, { useState, useMemo } from 'react';
import {
  useTheme,
  Card,
  Text,
  Button,
  AchievementCard,
  ProgressBar,
  type AchievementData,
} from '@ita-rp/ui-components';
import { AchievementSystem, ALL_ACHIEVEMENTS } from '@ita-rp/game-logic';

// Static achievement definitions for display
const staticAchievements: AchievementData[] = [
  // Study achievements
  {
    id: 'first-steps',
    name: 'Primeiros Passos',
    description: 'Complete sua primeira habilidade',
    icon: '👶',
    category: 'study',
    unlocked: true,
    unlockedAt: new Date('2025-01-15'),
  },
  {
    id: 'apprentice',
    name: 'Aprendiz',
    description: 'Complete 10 habilidades',
    icon: '📖',
    category: 'study',
    unlocked: true,
    unlockedAt: new Date('2025-01-20'),
  },
  {
    id: 'scholar',
    name: 'Estudioso',
    description: 'Complete 50 habilidades',
    icon: '🎓',
    category: 'study',
    unlocked: false,
    progress: 35,
    maxProgress: 50,
  },
  {
    id: 'master',
    name: 'Mestre',
    description: 'Complete 100 habilidades',
    icon: '🏅',
    category: 'study',
    unlocked: false,
    progress: 35,
    maxProgress: 100,
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Complete 10 habilidades com 100% de performance',
    icon: '💯',
    category: 'study',
    unlocked: false,
    progress: 3,
    maxProgress: 10,
  },

  // Streak achievements
  {
    id: 'first-week',
    name: 'Primeira Semana',
    description: 'Mantenha uma sequência de 7 dias',
    icon: '📅',
    category: 'streak',
    unlocked: true,
    unlockedAt: new Date('2025-01-22'),
  },
  {
    id: 'dedicated-month',
    name: 'Mês Dedicado',
    description: 'Mantenha uma sequência de 30 dias',
    icon: '🗓️',
    category: 'streak',
    unlocked: false,
    progress: 12,
    maxProgress: 30,
  },
  {
    id: 'warrior',
    name: 'Guerreiro',
    description: 'Mantenha uma sequência de 60 dias',
    icon: '⚔️',
    category: 'streak',
    unlocked: false,
    progress: 12,
    maxProgress: 60,
  },
  {
    id: 'legendary',
    name: 'Lendário',
    description: 'Mantenha uma sequência de 100 dias',
    icon: '👑',
    category: 'streak',
    unlocked: false,
    progress: 12,
    maxProgress: 100,
  },

  // Completion achievements
  {
    id: 'first-discipline',
    name: 'Primeira Disciplina',
    description: 'Complete todas as habilidades de uma disciplina',
    icon: '📕',
    category: 'completion',
    unlocked: false,
    progress: 23,
    maxProgress: 100,
  },
  {
    id: 'specialist',
    name: 'Especialista',
    description: 'Complete 3 disciplinas',
    icon: '📚',
    category: 'completion',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'polymath',
    name: 'Polímata',
    description: 'Complete 5 disciplinas',
    icon: '🧠',
    category: 'completion',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'graduate',
    name: 'Formado',
    description: 'Complete todo o currículo',
    icon: '🎉',
    category: 'completion',
    unlocked: false,
    progress: 35,
    maxProgress: 15507,
  },

  // Social achievements
  {
    id: 'helper',
    name: 'Ajudante',
    description: 'Ajude 5 colegas com dúvidas',
    icon: '🤝',
    category: 'social',
    unlocked: false,
    progress: 2,
    maxProgress: 5,
  },
  {
    id: 'community-leader',
    name: 'Líder Comunitário',
    description: 'Ajude 25 colegas com dúvidas',
    icon: '🌟',
    category: 'social',
    unlocked: false,
    progress: 2,
    maxProgress: 25,
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Seja mentor de 3 novos alunos',
    icon: '🎖️',
    category: 'social',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
];

// Map from system achievements to display achievements
const allAchievements = staticAchievements;

interface AchievementsPageProps {
  unlockedAchievementIds?: string[];
  completedSkillsCount?: number;
  currentStreak?: number;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  unlockedAchievementIds = [],
  completedSkillsCount = 0,
  currentStreak = 0,
}) => {
  const { currentTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'study', label: 'Estudo', icon: '📚', color: currentTheme.colors.primary },
    { id: 'streak', label: 'Sequência', icon: '🔥', color: currentTheme.colors.warning },
    { id: 'completion', label: 'Conclusão', icon: '✅', color: currentTheme.colors.success },
    { id: 'social', label: 'Social', icon: '👥', color: currentTheme.colors.accent },
  ];

  // Calculate dynamic progress for achievements based on player stats
  const achievements = useMemo(() => {
    return staticAchievements.map(achievement => {
      let progress = achievement.progress || 0;
      let unlocked = achievement.unlocked || unlockedAchievementIds.includes(achievement.id);

      // Calculate dynamic progress based on achievement type
      switch (achievement.id) {
        case 'first-steps':
          progress = Math.min(completedSkillsCount, 1);
          unlocked = completedSkillsCount >= 1;
          break;
        case 'apprentice':
          progress = Math.min(completedSkillsCount, 10);
          unlocked = completedSkillsCount >= 10;
          break;
        case 'scholar':
          progress = Math.min(completedSkillsCount, 50);
          unlocked = completedSkillsCount >= 50;
          break;
        case 'master':
          progress = Math.min(completedSkillsCount, 100);
          unlocked = completedSkillsCount >= 100;
          break;
        case 'first-week':
          progress = Math.min(currentStreak, 7);
          unlocked = currentStreak >= 7;
          break;
        case 'dedicated-month':
          progress = Math.min(currentStreak, 30);
          unlocked = currentStreak >= 30;
          break;
        case 'warrior':
          progress = Math.min(currentStreak, 60);
          unlocked = currentStreak >= 60;
          break;
        case 'legendary':
          progress = Math.min(currentStreak, 100);
          unlocked = currentStreak >= 100;
          break;
        case 'graduate':
          progress = Math.min(completedSkillsCount, 176);
          unlocked = completedSkillsCount >= 176;
          break;
      }

      return {
        ...achievement,
        progress,
        unlocked,
        unlockedAt: unlocked ? achievement.unlockedAt || new Date() : undefined,
      };
    });
  }, [unlockedAchievementIds, completedSkillsCount, currentStreak]);

  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const getCategoryStats = (categoryId: string) => {
    const categoryAchievements = achievements.filter(a => a.category === categoryId);
    const unlocked = categoryAchievements.filter(a => a.unlocked).length;
    return { unlocked, total: categoryAchievements.length };
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Text variant="heading" size="2xl" color={currentTheme.colors.primary} glow>
          Conquistas
        </Text>
        <Text variant="body" color={currentTheme.colors.textSecondary}>
          Desbloqueie conquistas completando desafios
        </Text>
      </div>

      {/* Overall Progress */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '4rem' }}>🏆</div>
          <div style={{ flex: 1 }}>
            <ProgressBar
              value={unlockedCount}
              maxValue={totalCount}
              label="Conquistas Desbloqueadas"
              variant="accent"
              size="large"
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text variant="heading" size="2xl" color={currentTheme.colors.accent}>
              {unlockedCount}/{totalCount}
            </Text>
            <Text variant="caption" color={currentTheme.colors.textSecondary}>
              {((unlockedCount / totalCount) * 100).toFixed(0)}% completo
            </Text>
          </div>
        </div>
      </Card>

      {/* Category Filters */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant={selectedCategory === null ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setSelectedCategory(null)}
        >
          Todas ({totalCount})
        </Button>
        {categories.map(cat => {
          const stats = getCategoryStats(cat.id);
          return (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.label} ({stats.unlocked}/{stats.total})
            </Button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
          <Text variant="heading" size="lg" color={currentTheme.colors.textSecondary}>
            Nenhuma conquista encontrada
          </Text>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card title="Progresso por Categoria" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categories.map(cat => {
            const stats = getCategoryStats(cat.id);
            return (
              <div key={cat.id}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <Text variant="body" color={currentTheme.colors.text}>
                    {cat.label}
                  </Text>
                  <Text
                    variant="caption"
                    color={currentTheme.colors.textSecondary}
                    style={{ marginLeft: 'auto' }}
                  >
                    {stats.unlocked}/{stats.total}
                  </Text>
                </div>
                <ProgressBar
                  value={stats.unlocked}
                  maxValue={stats.total}
                  variant="primary"
                  size="small"
                />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AchievementsPage;
