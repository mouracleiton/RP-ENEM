/**
 * Daily Challenges System
 * Provides daily missions and rewards for player engagement
 */

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
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
  expiresAt: Date;
  completed: boolean;
  claimed: boolean;
}

export type ChallengeType =
  | 'complete_skills'
  | 'study_time'
  | 'perfect_quiz'
  | 'streak_maintain'
  | 'discipline_progress'
  | 'achievement_unlock'
  | 'login_bonus';

interface ChallengeTemplate {
  type: ChallengeType;
  titleTemplate: string;
  descriptionTemplate: string;
  targetRange: { min: number; max: number };
  xpRange: { min: number; max: number };
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // Easy challenges
  {
    type: 'login_bonus',
    titleTemplate: 'Boas-vindas!',
    descriptionTemplate: 'Faça login no jogo hoje',
    targetRange: { min: 1, max: 1 },
    xpRange: { min: 25, max: 25 },
    difficulty: 'easy',
    icon: '👋',
  },
  {
    type: 'complete_skills',
    titleTemplate: 'Estudante Dedicado',
    descriptionTemplate: 'Complete {target} habilidade(s) hoje',
    targetRange: { min: 1, max: 2 },
    xpRange: { min: 50, max: 75 },
    difficulty: 'easy',
    icon: '📖',
  },
  {
    type: 'study_time',
    titleTemplate: 'Tempo de Estudo',
    descriptionTemplate: 'Estude por {target} minutos hoje',
    targetRange: { min: 15, max: 30 },
    xpRange: { min: 40, max: 60 },
    difficulty: 'easy',
    icon: '⏱️',
  },

  // Medium challenges
  {
    type: 'complete_skills',
    titleTemplate: 'Maratonista',
    descriptionTemplate: 'Complete {target} habilidades hoje',
    targetRange: { min: 3, max: 5 },
    xpRange: { min: 100, max: 150 },
    difficulty: 'medium',
    icon: '🏃',
  },
  {
    type: 'perfect_quiz',
    titleTemplate: 'Perfeição',
    descriptionTemplate: 'Acerte {target} quiz(zes) com 100%',
    targetRange: { min: 1, max: 2 },
    xpRange: { min: 75, max: 125 },
    difficulty: 'medium',
    icon: '💯',
  },
  {
    type: 'study_time',
    titleTemplate: 'Sessão Intensiva',
    descriptionTemplate: 'Estude por {target} minutos hoje',
    targetRange: { min: 45, max: 60 },
    xpRange: { min: 80, max: 120 },
    difficulty: 'medium',
    icon: '🔥',
  },
  {
    type: 'discipline_progress',
    titleTemplate: 'Foco Total',
    descriptionTemplate: 'Avance {target}% em uma disciplina',
    targetRange: { min: 5, max: 10 },
    xpRange: { min: 100, max: 150 },
    difficulty: 'medium',
    icon: '🎯',
  },

  // Hard challenges
  {
    type: 'complete_skills',
    titleTemplate: 'Lenda do Estudo',
    descriptionTemplate: 'Complete {target} habilidades hoje',
    targetRange: { min: 7, max: 10 },
    xpRange: { min: 200, max: 300 },
    difficulty: 'hard',
    icon: '🌟',
  },
  {
    type: 'perfect_quiz',
    titleTemplate: 'Mestre dos Quizzes',
    descriptionTemplate: 'Acerte {target} quizzes com 100%',
    targetRange: { min: 3, max: 5 },
    xpRange: { min: 150, max: 250 },
    difficulty: 'hard',
    icon: '🏆',
  },
  {
    type: 'streak_maintain',
    titleTemplate: 'Chama Imortal',
    descriptionTemplate: 'Mantenha seu streak de {target} dias',
    targetRange: { min: 7, max: 14 },
    xpRange: { min: 200, max: 350 },
    difficulty: 'hard',
    icon: '🔱',
  },
];

export class DailyChallengeSystem {
  private challenges: DailyChallenge[] = [];
  private lastGeneratedDate: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('ita-rp-daily-challenges');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.challenges = data.challenges.map((c: DailyChallenge) => ({
          ...c,
          expiresAt: new Date(c.expiresAt),
        }));
        this.lastGeneratedDate = data.lastGeneratedDate;
      } catch {
        this.challenges = [];
        this.lastGeneratedDate = null;
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
      'ita-rp-daily-challenges',
      JSON.stringify({
        challenges: this.challenges,
        lastGeneratedDate: this.lastGeneratedDate,
      })
    );
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateChallenge(template: ChallengeTemplate): DailyChallenge {
    const target = this.getRandomInt(template.targetRange.min, template.targetRange.max);
    const xpReward = this.getRandomInt(template.xpRange.min, template.xpRange.max);

    // Round XP to nearest 5
    const roundedXP = Math.round(xpReward / 5) * 5;

    // Set expiration to end of today
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    // Bonus rewards for hard challenges
    let bonusReward: DailyChallenge['bonusReward'] = undefined;
    if (template.difficulty === 'hard') {
      const bonusTypes: DailyChallenge['bonusReward'][] = [
        { type: 'streak_protection', value: 1 },
        { type: 'xp_multiplier', value: 1.5 },
      ];
      bonusReward = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    }

    return {
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      title: template.titleTemplate,
      description: template.descriptionTemplate.replace('{target}', target.toString()),
      target,
      current: template.type === 'login_bonus' ? 1 : 0,
      xpReward: roundedXP,
      bonusReward,
      difficulty: template.difficulty,
      icon: template.icon,
      expiresAt,
      completed: template.type === 'login_bonus',
      claimed: false,
    };
  }

  generateDailyChallenges(): DailyChallenge[] {
    const today = new Date().toDateString();

    // Return existing challenges if already generated today
    if (this.lastGeneratedDate === today && this.challenges.length > 0) {
      return this.challenges;
    }

    // Generate new challenges
    const easyTemplates = CHALLENGE_TEMPLATES.filter(t => t.difficulty === 'easy');
    const mediumTemplates = CHALLENGE_TEMPLATES.filter(t => t.difficulty === 'medium');
    const hardTemplates = CHALLENGE_TEMPLATES.filter(t => t.difficulty === 'hard');

    // Select 2 easy, 2 medium, 1 hard
    const selectedChallenges: DailyChallenge[] = [];

    // Always include login bonus
    const loginTemplate = easyTemplates.find(t => t.type === 'login_bonus');
    if (loginTemplate) {
      selectedChallenges.push(this.generateChallenge(loginTemplate));
    }

    // Add 1 more easy (not login)
    const otherEasy = easyTemplates.filter(t => t.type !== 'login_bonus');
    if (otherEasy.length > 0) {
      const randomEasy = otherEasy[Math.floor(Math.random() * otherEasy.length)];
      selectedChallenges.push(this.generateChallenge(randomEasy));
    }

    // Add 2 medium
    const shuffledMedium = [...mediumTemplates].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2 && i < shuffledMedium.length; i++) {
      selectedChallenges.push(this.generateChallenge(shuffledMedium[i]));
    }

    // Add 1 hard
    if (hardTemplates.length > 0) {
      const randomHard = hardTemplates[Math.floor(Math.random() * hardTemplates.length)];
      selectedChallenges.push(this.generateChallenge(randomHard));
    }

    this.challenges = selectedChallenges;
    this.lastGeneratedDate = today;
    this.saveToStorage();

    return this.challenges;
  }

  getChallenges(): DailyChallenge[] {
    return this.generateDailyChallenges();
  }

  updateProgress(type: ChallengeType, amount: number = 1): DailyChallenge[] {
    const updated: DailyChallenge[] = [];

    this.challenges = this.challenges.map(challenge => {
      if (challenge.type === type && !challenge.completed) {
        const newCurrent = Math.min(challenge.current + amount, challenge.target);
        const isCompleted = newCurrent >= challenge.target;

        if (newCurrent !== challenge.current) {
          updated.push({ ...challenge, current: newCurrent, completed: isCompleted });
        }

        return {
          ...challenge,
          current: newCurrent,
          completed: isCompleted,
        };
      }
      return challenge;
    });

    this.saveToStorage();
    return updated;
  }

  claimReward(challengeId: string): { xp: number; bonus?: DailyChallenge['bonusReward'] } | null {
    const challenge = this.challenges.find(c => c.id === challengeId);

    if (!challenge || !challenge.completed || challenge.claimed) {
      return null;
    }

    challenge.claimed = true;
    this.saveToStorage();

    return {
      xp: challenge.xpReward,
      bonus: challenge.bonusReward,
    };
  }

  getCompletedCount(): number {
    return this.challenges.filter(c => c.completed).length;
  }

  getClaimedCount(): number {
    return this.challenges.filter(c => c.claimed).length;
  }

  getTotalXPAvailable(): number {
    return this.challenges
      .filter(c => c.completed && !c.claimed)
      .reduce((sum, c) => sum + c.xpReward, 0);
  }

  getTimeRemaining(): { hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const diff = endOfDay.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }

  resetForNewDay(): void {
    this.challenges = [];
    this.lastGeneratedDate = null;
    this.saveToStorage();
    this.generateDailyChallenges();
  }
}

// Singleton instance
export const dailyChallengeSystem = new DailyChallengeSystem();

// React hook for daily challenges
export function useDailyChallenges() {
  return dailyChallengeSystem;
}
