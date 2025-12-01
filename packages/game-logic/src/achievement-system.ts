import { Achievement, GameEvent, PlayerState } from '@ita-rp/shared-types';

/**
 * Define todas as conquistas disponíveis no jogo
 * Categorizadas por tipo de comportamento que recompensam
 */
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // CONQUISTAS DE ESTUDO (STUDY)
  {
    id: 'first_steps',
    name: 'Primeiros Passos',
    description: 'Complete sua primeira habilidade',
    icon: '👣',
    unlockedAt: new Date(), // Será atualizado quando desbloqueado
    category: 'study',
  },
  {
    id: 'apprentice',
    name: 'Aprendiz',
    description: 'Complete 10 habilidades',
    icon: '🎓',
    unlockedAt: new Date(),
    category: 'study',
  },
  {
    id: 'dedicated_student',
    name: 'Estudante Dedicado',
    description: 'Complete 50 habilidades',
    icon: '📚',
    unlockedAt: new Date(),
    category: 'study',
  },
  {
    id: 'master',
    name: 'Mestre',
    description: 'Complete 100 habilidades',
    icon: '🏆',
    unlockedAt: new Date(),
    category: 'study',
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Complete 10 habilidades com 100% de performance',
    icon: '💯',
    unlockedAt: new Date(),
    category: 'study',
  },
  {
    id: 'speed_learner',
    name: 'Aprendiz Rápido',
    description: 'Complete uma habilidade em menos da metade do tempo esperado',
    icon: '⚡',
    unlockedAt: new Date(),
    category: 'study',
  },
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Complete habilidades de 5 disciplinas diferentes',
    icon: '🗺️',
    unlockedAt: new Date(),
    category: 'study',
  },
  {
    id: 'specialist',
    name: 'Especialista',
    description: 'Complete todas as habilidades de uma única disciplina',
    icon: '🎯',
    unlockedAt: new Date(),
    category: 'study',
  },

  // CONQUISTAS DE SEQUÊNCIA (STREAK)
  {
    id: 'first_week',
    name: 'Primeira Semana',
    description: 'Mantenha uma sequência de 7 dias de estudos',
    icon: '📅',
    unlockedAt: new Date(),
    category: 'streak',
  },
  {
    id: 'dedicated_month',
    name: 'Mês Dedicado',
    description: 'Mantenha uma sequência de 30 dias de estudos',
    icon: '📆',
    unlockedAt: new Date(),
    category: 'streak',
  },
  {
    id: 'warrior',
    name: 'Guerreiro',
    description: 'Mantenha uma sequência de 90 dias de estudos',
    icon: '⚔️',
    unlockedAt: new Date(),
    category: 'streak',
  },
  {
    id: 'legendary',
    name: 'Lendário',
    description: 'Mantenha uma sequência de 365 dias de estudos',
    icon: '👑',
    unlockedAt: new Date(),
    category: 'streak',
  },
  {
    id: 'comeback_king',
    name: 'Rei do Retorno',
    description: 'Recupere uma sequência após 7 dias de inatividade',
    icon: '🔄',
    unlockedAt: new Date(),
    category: 'streak',
  },

  // CONQUISTAS DE CONCLUSÃO (COMPLETION)
  {
    id: 'first_discipline',
    name: 'Primeira Disciplina',
    description: 'Complete sua primeira disciplina',
    icon: '📖',
    unlockedAt: new Date(),
    category: 'completion',
  },
  {
    id: 'halfway_there',
    name: 'Metade do Caminho',
    description: 'Complete 50% de uma disciplina',
    icon: '📊',
    unlockedAt: new Date(),
    category: 'completion',
  },
  {
    id: 'discipline_master',
    name: 'Mestre de Disciplina',
    description: 'Complete 5 disciplinas inteiras',
    icon: '🎓',
    unlockedAt: new Date(),
    category: 'completion',
  },
  {
    id: 'polymath',
    name: 'Polímata',
    description: 'Complete 10 disciplinas inteiras',
    icon: '🧠',
    unlockedAt: new Date(),
    category: 'completion',
  },
  {
    id: 'graduate',
    name: 'Formado',
    description: 'Complete todas as disciplinas básicas',
    icon: '🎖️',
    unlockedAt: new Date(),
    category: 'completion',
  },

  // CONQUISTAS SOCIAIS (SOCIAL) - Para features futuras
  {
    id: 'helper',
    name: 'Ajudante',
    description: 'Ajude 10 outros estudantes (quando implementado)',
    icon: '🤝',
    unlockedAt: new Date(),
    category: 'social',
  },
  {
    id: 'community_leader',
    name: 'Líder Comunitário',
    description: 'Seja reconhecido pela comunidade 50 vezes',
    icon: '🌟',
    unlockedAt: new Date(),
    category: 'social',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Mentoreie 5 estudantes até a conclusão de disciplinas',
    icon: '👨‍🏫',
    unlockedAt: new Date(),
    category: 'social',
  },

  // CONQUISTAS DE TEMPO E PERFORMANCE
  {
    id: 'night_owl',
    name: 'Coruja',
    description: 'Estude durante 10 noites (após 22h)',
    icon: '🦉',
    unlockedAt: new Date(),
    category: 'study',
  },
  {
    id: 'early_bird',
    name: 'Pássaro Madrugador',
    description: 'Estude durante 10 manhãs (antes 6h)',
    icon: '🐦',
    unlockedAt: new Date(),
    category: 'study',
  },
  {
    id: 'marathon_session',
    name: 'Sessão Maratona',
    description: 'Estude por mais de 4 horas em uma única sessão',
    icon: '⏰',
    unlockedAt: new Date(),
    category: 'study',
  },
  {
    id: 'consistency_champion',
    name: 'Campeão da Consistência',
    description: 'Estude pelo menos 1 hora todos os dias por 30 dias',
    icon: '🏅',
    unlockedAt: new Date(),
    category: 'streak',
  },
];

/**
 * Sistema de gerenciamento de conquistas
 */
export class AchievementSystem {
  /**
   * Verifica quais conquistas foram desbloqueadas com base em um evento
   */
  static checkAchievements(player: PlayerState, event: GameEvent): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    // Verifica conquistas baseadas no tipo de evento
    switch (event.type) {
      case 'skill_completed':
        unlockedAchievements.push(...this.checkStudyAchievements(player, event));
        break;
      case 'streak_updated':
        unlockedAchievements.push(...this.checkStreakAchievements(player, event));
        break;
      case 'level_up':
        unlockedAchievements.push(...this.checkLevelAchievements(player, event));
        break;
    }

    // Verifica conquistas gerais
    unlockedAchievements.push(...this.checkGeneralAchievements(player));

    // Remove conquistas já desbloqueadas
    return unlockedAchievements.filter(achievement =>
      !player.achievements.some(unlocked => unlocked.id === achievement.id)
    );
  }

  /**
   * Verifica conquistas relacionadas a estudo
   */
  private static checkStudyAchievements(player: PlayerState, event: GameEvent): Achievement[] {
    const achievements: Achievement[] = [];
    const completedSkills = player.completedSkills.length;

    // Primeiros Passos
    if (completedSkills === 1) {
      achievements.push(this.getAchievement('first_steps'));
    }

    // Aprendiz
    if (completedSkills === 10) {
      achievements.push(this.getAchievement('apprentice'));
    }

    // Estudante Dedicado
    if (completedSkills === 50) {
      achievements.push(this.getAchievement('dedicated_student'));
    }

    // Mestre
    if (completedSkills === 100) {
      achievements.push(this.getAchievement('master'));
    }

    // Aprendiz Rápido (se o evento tiver dados de performance)
    if (event.payload.timeSpent && event.payload.expectedTime) {
      if (event.payload.timeSpent < event.payload.expectedTime * 0.5) {
        achievements.push(this.getAchievement('speed_learner'));
      }
    }

    // Perfeccionista (se o evento tiver dados de performance)
    if (event.payload.performance === 1.0) {
      const perfectSkills = this.countPerfectSkills(player);
      if (perfectSkills === 10) {
        achievements.push(this.getAchievement('perfectionist'));
      }
    }

    return achievements;
  }

  /**
   * Verifica conquistas relacionadas a streak
   */
  private static checkStreakAchievements(player: PlayerState, event: GameEvent): Achievement[] {
    const achievements: Achievement[] = [];
    const streak = player.currentStreak;

    // Primeira Semana
    if (streak === 7) {
      achievements.push(this.getAchievement('first_week'));
    }

    // Mês Dedicado
    if (streak === 30) {
      achievements.push(this.getAchievement('dedicated_month'));
    }

    // Guerreiro
    if (streak === 90) {
      achievements.push(this.getAchievement('warrior'));
    }

    // Lendário
    if (streak === 365) {
      achievements.push(this.getAchievement('legendary'));
    }

    return achievements;
  }

  /**
   * Verifica conquistas relacionadas a nível
   */
  private static checkLevelAchievements(player: PlayerState, event: GameEvent): Achievement[] {
    const achievements: Achievement[] = [];
    const level = player.level;

    // Adicionar conquistas baseadas em nível aqui se necessário
    // Ex: nível 10, 25, 50, etc.

    return achievements;
  }

  /**
   * Verifica conquistas gerais
   */
  private static checkGeneralAchievements(player: PlayerState): Achievement[] {
    const achievements: Achievement[] = [];

    // Verifica disciplinas completas (precisaria de mais dados do jogador)
    // Por enquanto, implementações básicas

    return achievements;
  }

  /**
   * Obtém uma conquista pelo ID
   */
  private static getAchievement(id: string): Achievement {
    const achievement = ALL_ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) {
      throw new Error(`Achievement with id '${id}' not found`);
    }
    return achievement;
  }

  /**
   * Conta habilidades perfeitas (precisaria de mais dados do jogador)
   */
  private static countPerfectSkills(player: PlayerState): number {
    // Implementação simplificada - precisaria armazenar performance por skill
    return Math.floor(player.completedSkills.length * 0.1); // Exemplo: 10% das skills
  }

  /**
   * Desbloqueia uma conquista para o jogador
   */
  static unlockAchievement(playerId: string, achievementId: string): Achievement {
    const achievement = this.getAchievement(achievementId);
    achievement.unlockedAt = new Date();
    return achievement;
  }

  /**
   * Obtém conquistas por categoria
   */
  static getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return ALL_ACHIEVEMENTS.filter(achievement => achievement.category === category);
  }

  /**
   * Obtém todas as conquistas
   */
  static getAllAchievements(): Achievement[] {
    return [...ALL_ACHIEVEMENTS];
  }

  /**
   * Calcula progresso para uma conquista (0.0 a 1.0)
   */
  static calculateAchievementProgress(
    achievementId: string,
    player: PlayerState
  ): number {
    switch (achievementId) {
      case 'first_steps':
        return player.completedSkills.length >= 1 ? 1.0 : player.completedSkills.length;

      case 'apprentice':
        return Math.min(1.0, player.completedSkills.length / 10);

      case 'dedicated_student':
        return Math.min(1.0, player.completedSkills.length / 50);

      case 'master':
        return Math.min(1.0, player.completedSkills.length / 100);

      case 'first_week':
        return Math.min(1.0, player.currentStreak / 7);

      case 'dedicated_month':
        return Math.min(1.0, player.currentStreak / 30);

      case 'warrior':
        return Math.min(1.0, player.currentStreak / 90);

      case 'legendary':
        return Math.min(1.0, player.currentStreak / 365);

      default:
        return 0.0;
    }
  }

  /**
   * Obtém descrição do progresso para UI
   */
  static getProgressDescription(
    achievementId: string,
    player: PlayerState
  ): string {
    const progress = this.calculateAchievementProgress(achievementId, player);
    const achievement = this.getAchievement(achievementId);

    switch (achievementId) {
      case 'first_steps':
        return `${player.completedSkills.length}/1 habilidades`;

      case 'apprentice':
        return `${player.completedSkills.length}/10 habilidades`;

      case 'dedicated_student':
        return `${player.completedSkills.length}/50 habilidades`;

      case 'master':
        return `${player.completedSkills.length}/100 habilidades`;

      case 'first_week':
        return `${player.currentStreak}/7 dias`;

      case 'dedicated_month':
        return `${player.currentStreak}/30 dias`;

      case 'warrior':
        return `${player.currentStreak}/90 dias`;

      case 'legendary':
        return `${player.currentStreak}/365 dias`;

      default:
        return `${Math.floor(progress * 100)}% completo`;
    }
  }

  /**
   * Verifica se uma conquista já foi desbloqueada
   */
  static isAchievementUnlocked(
    achievementId: string,
    player: PlayerState
  ): boolean {
    return player.achievements.some(achievement => achievement.id === achievementId);
  }

  /**
   * Obtém conquistas desbloqueadas pelo jogador
   */
  static getUnlockedAchievements(player: PlayerState): Achievement[] {
    return player.achievements;
  }

  /**
   * Obtém conquistas não desbloqueadas pelo jogador
   */
  static getLockedAchievements(player: PlayerState): Achievement[] {
    return ALL_ACHIEVEMENTS.filter(achievement =>
      !this.isAchievementUnlocked(achievement.id, player)
    );
  }

  /**
   * Obtém estatísticas de conquistas
   */
  static getAchievementStats(player: PlayerState): {
    total: number;
    unlocked: number;
    locked: number;
    completionRate: number;
    categoryStats: Record<string, { total: number; unlocked: number }>;
  } {
    const total = ALL_ACHIEVEMENTS.length;
    const unlocked = player.achievements.length;
    const locked = total - unlocked;
    const completionRate = unlocked / total;

    const categoryStats: Record<string, { total: number; unlocked: number }> = {};

    ALL_ACHIEVEMENTS.forEach(achievement => {
      if (!categoryStats[achievement.category]) {
        categoryStats[achievement.category] = { total: 0, unlocked: 0 };
      }
      categoryStats[achievement.category].total++;
    });

    player.achievements.forEach(achievement => {
      if (categoryStats[achievement.category]) {
        categoryStats[achievement.category].unlocked++;
      }
    });

    return { total, unlocked, locked, completionRate, categoryStats };
  }
}