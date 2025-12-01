import { SpecificSkill, PlayerState, Achievement, GameEvent } from '@ita-rp/shared-types';

/**
 * Sistema de cálculo de XP e progressão
 * Baseado em princípios de gamificação educacional
 */
export class XPSystem {
  /**
   * Calcula XP base para uma habilidade baseada na dificuldade
   */
  static calculateBaseXP(skill: SpecificSkill): number {
    const difficultyMultipliers = {
      'beginner': 25,
      'intermediate': 50,
      'advanced': 100,
    };

    return difficultyMultipliers[skill.difficulty] || 25;
  }

  /**
   * Calcula bônus de performance baseado no tempo e qualidade
   * performance: 0.0 a 1.0 (0% a 100%)
   */
  static calculatePerformanceBonus(performance: number): number {
    // Performance de 50% = multiplicador 0.75 (perde 25%)
    // Performance de 80% = multiplicador 0.9 (perde 10%)
    // Performance de 100% = multiplicador 1.25 (ganha 25%)
    return Math.max(0.5, 0.5 + (performance * 0.75));
  }

  /**
   * Calcula bônus de streak (sequência de estudos)
   * streak: número de dias consecutivos
   */
  static calculateStreakBonus(streak: number): number {
    if (streak === 0) return 1.0;
    if (streak <= 3) return 1.1; // 10% bonus
    if (streak <= 7) return 1.2; // 20% bonus
    if (streak <= 14) return 1.3; // 30% bonus
    if (streak <= 30) return 1.4; // 40% bonus
    return 1.5; // 50% bonus máximo
  }

  /**
   * Calcula bônus por primeira vez completando
   */
  static calculateFirstTimeBonus(isFirstCompletion: boolean): number {
    return isFirstCompletion ? 1.5 : 1.0;
  }

  /**
   * Calcula XP total para completar uma habilidade
   */
  static calculateTotalXPReward(
    skill: SpecificSkill,
    performance: number,
    streak: number,
    isFirstCompletion: boolean,
    timeSpentMinutes: number
  ): number {
    const baseXP = this.calculateBaseXP(skill);
    const performanceMultiplier = this.calculatePerformanceBonus(performance);
    const streakMultiplier = this.calculateStreakBonus(streak);
    const firstTimeMultiplier = this.calculateFirstTimeBonus(isFirstCompletion);

    // Bônus/malus por tempo (se completou muito rápido ou muito devagar)
    const expectedTimeMinutes = this.parseEstimatedTime(skill.estimatedTime);
    const timeMultiplier = this.calculateTimeMultiplier(timeSpentMinutes, expectedTimeMinutes);

    const totalXP = Math.floor(
      baseXP * performanceMultiplier * streakMultiplier * firstTimeMultiplier * timeMultiplier
    );

    return Math.max(baseXP * 0.5, totalXP); // Mínimo de 50% do XP base
  }

  /**
   * Converte tempo estimado (ex: "2-3 horas") para minutos
   */
  static parseEstimatedTime(estimatedTime: string): number {
    // Padrões comuns: "2 horas", "30 minutos", "1-2 horas", "45 min"
    const timeStr = estimatedTime.toLowerCase();

    if (timeStr.includes('hora')) {
      const hours = parseFloat(timeStr.match(/[\d.]+/)?.[0] || '1');
      return hours * 60;
    }

    if (timeStr.includes('min')) {
      const minutes = parseFloat(timeStr.match(/[\d.]+/)?.[0] || '30');
      return minutes;
    }

    // Padrão: 60 minutos
    return 60;
  }

  /**
   * Calcula multiplicador baseado no tempo gasto vs tempo esperado
   */
  static calculateTimeMultiplier(actualTime: number, expectedTime: number): number {
    const ratio = actualTime / expectedTime;

    if (ratio < 0.5) return 0.8; // Muito rápido - possível rush
    if (ratio < 1.0) return 1.1; // Mais rápido que esperado - bom!
    if (ratio < 1.5) return 1.0; // Dentro do esperado
    if (ratio < 2.0) return 0.9; // Um pouco lento
    return 0.8; // Muito lento
  }

  /**
   * Calcula nível do jogador baseado no XP total
   * Fórmula: XP = 100 * level^1.5
   */
  static calculateLevel(xp: number): number {
    return Math.floor(Math.pow(xp / 100, 2/3)) + 1;
  }

  /**
   * Calcula XP necessário para alcançar determinado nível
   */
  static calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level - 1, 1.5));
  }

  /**
   * Calcula XP necessário para o próximo nível
   */
  static calculateXPToNextLevel(currentXP: number): number {
    const currentLevel = this.calculateLevel(currentXP);
    const nextLevelXP = this.calculateXPForLevel(currentLevel + 1);
    return nextLevelXP - currentXP;
  }

  /**
   * Calcula progresso para o próximo nível (0.0 a 1.0)
   */
  static calculateLevelProgress(xp: number): number {
    const currentLevel = this.calculateLevel(xp);
    const currentLevelXP = this.calculateXPForLevel(currentLevel);
    const nextLevelXP = this.calculateXPForLevel(currentLevel + 1);

    if (nextLevelXP === currentLevelXP) return 1.0;

    return (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
  }

  /**
   * Gera evento de jogo para conclusão de habilidade
   */
  static createSkillCompletedEvent(
    skillId: string,
    xpEarned: number,
    performance: number,
    timeSpent: number
  ): GameEvent {
    return {
      type: 'skill_completed',
      payload: {
        skillId,
        xpEarned,
        performance,
        timeSpent,
        timestamp: new Date()
      },
      timestamp: new Date()
    };
  }

  /**
   * Gera evento de level up
   */
  static createLevelUpEvent(newLevel: number): GameEvent {
    return {
      type: 'level_up',
      payload: {
        newLevel,
        timestamp: new Date()
      },
      timestamp: new Date()
    };
  }

  /**
   * Gera evento de atualização de streak
   */
  static createStreakUpdatedEvent(newStreak: number): GameEvent {
    return {
      type: 'streak_updated',
      payload: {
        newStreak,
        timestamp: new Date()
      },
      timestamp: new Date()
    };
  }

  /**
   * Calcula XP ganho por study session (tempo de estudo)
   * XP por minuto: 0.5 XP (ou seja, 30 XP por hora)
   */
  static calculateStudySessionXP(timeSpentMinutes: number): number {
    return Math.floor(timeSpentMinutes * 0.5);
  }

  /**
   * Valida se uma performance é válida (0.0 a 1.0)
   */
  static validatePerformance(performance: number): boolean {
    return performance >= 0.0 && performance <= 1.0;
  }

  /**
   * Arredonda performance para níveis discretos (opcional)
   */
  static discretizePerformance(performance: number): number {
    if (performance >= 0.95) return 1.0;
    if (performance >= 0.85) return 0.9;
    if (performance >= 0.75) return 0.8;
    if (performance >= 0.65) return 0.7;
    if (performance >= 0.55) return 0.6;
    if (performance >= 0.45) return 0.5;
    if (performance >= 0.35) return 0.4;
    if (performance >= 0.25) return 0.3;
    if (performance >= 0.15) return 0.2;
    return 0.1;
  }
}