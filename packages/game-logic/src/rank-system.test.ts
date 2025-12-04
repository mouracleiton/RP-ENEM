import { describe, it, expect } from 'vitest';
import { RankSystem, ACADEMIC_RANKS } from './rank-system';
import { PlayerState, Rank } from '@ita-rp/shared-types';

// Helper para criar um player de teste
const createMockPlayer = (
  overrides: Partial<PlayerState> = {}
): PlayerState => ({
  id: 'test-player',
  name: 'Test Player',
  level: 1,
  xp: 0,
  currentRank: ACADEMIC_RANKS[ACADEMIC_RANKS.length - 1], // Calouro
  completedSkills: [],
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  totalStudyTime: 0,
  achievements: [],
  settings: {
    theme: 'neonBlue',
    soundEnabled: true,
    notificationsEnabled: true,
    language: 'pt-BR',
    studyReminders: true,
  },
  ...overrides,
});

describe('RankSystem (Academic Progression)', () => {
  describe('ACADEMIC_RANKS', () => {
    it('should have 17 academic ranks', () => {
      expect(ACADEMIC_RANKS).toHaveLength(17);
    });

    it('should have Pós-Doutorando Sênior as highest rank', () => {
      expect(ACADEMIC_RANKS[0].id).toBe('pos_doutorando_senior');
      expect(ACADEMIC_RANKS[0].name).toBe('Pós-Doutorando Sênior');
    });

    it('should have Calouro as lowest rank', () => {
      const lastRank = ACADEMIC_RANKS[ACADEMIC_RANKS.length - 1];
      expect(lastRank.id).toBe('calouro');
      expect(lastRank.name).toBe('Calouro Ingressante');
    });

    it('should have ranks ordered by level descending', () => {
      for (let i = 0; i < ACADEMIC_RANKS.length - 1; i++) {
        expect(ACADEMIC_RANKS[i].level).toBeGreaterThan(
          ACADEMIC_RANKS[i + 1].level
        );
      }
    });

    it('should have valid requirements for all ranks', () => {
      for (const rank of ACADEMIC_RANKS) {
        expect(rank.requirements).toBeDefined();
        expect(rank.requirements.level).toBeGreaterThanOrEqual(0);
        expect(rank.requirements.xp).toBeGreaterThanOrEqual(0);
        expect(rank.requirements.completedDisciplines).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have icons for all ranks', () => {
      for (const rank of ACADEMIC_RANKS) {
        expect(rank.icon).toBeDefined();
        expect(rank.icon.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getCurrentRank', () => {
    it('should return Calouro for level 1', () => {
      const rank = RankSystem.getCurrentRank(1);
      expect(rank.id).toBe('calouro');
    });

    it('should return Cursinho Pré-Vestibular for level 5', () => {
      const rank = RankSystem.getCurrentRank(5);
      expect(rank.id).toBe('cursinho_pre_vestibular');
    });

    it('should return Aprovado no Vestibular for level 7', () => {
      const rank = RankSystem.getCurrentRank(7);
      expect(rank.id).toBe('aprovado_vestibular');
    });

    it('should return Estudante 1º Ano for level 10', () => {
      const rank = RankSystem.getCurrentRank(10);
      expect(rank.id).toBe('estudante_1_ano');
    });

    it('should return Pós-Doutorando Sênior for level 100', () => {
      const rank = RankSystem.getCurrentRank(100);
      expect(rank.id).toBe('pos_doutorando_senior');
    });

    it('should return Calouro for level 0', () => {
      const rank = RankSystem.getCurrentRank(0);
      expect(rank.id).toBe('calouro');
    });
  });

  describe('getNextRank', () => {
    it('should return Cursinho Pré-Vestibular as next rank for Calouro', () => {
      const calouro = ACADEMIC_RANKS.find(r => r.id === 'calouro')!;
      const nextRank = RankSystem.getNextRank(calouro);
      expect(nextRank).not.toBeNull();
      expect(nextRank!.id).toBe('cursinho_pre_vestibular');
    });

    it('should return Aprovado no Vestibular as next rank for Cursinho', () => {
      const cursinho = ACADEMIC_RANKS.find(r => r.id === 'cursinho_pre_vestibular')!;
      const nextRank = RankSystem.getNextRank(cursinho);
      expect(nextRank).not.toBeNull();
      expect(nextRank!.id).toBe('aprovado_vestibular');
    });

    it('should return null for Pós-Doutorando Sênior (highest rank)', () => {
      const posDoutor = ACADEMIC_RANKS.find(r => r.id === 'pos_doutorando_senior')!;
      const nextRank = RankSystem.getNextRank(posDoutor);
      expect(nextRank).toBeNull();
    });
  });

  describe('getPreviousRank', () => {
    it('should return Calouro as previous rank for Cursinho', () => {
      const cursinho = ACADEMIC_RANKS.find(r => r.id === 'cursinho_pre_vestibular')!;
      const prevRank = RankSystem.getPreviousRank(cursinho);
      expect(prevRank).not.toBeNull();
      expect(prevRank!.id).toBe('calouro');
    });

    it('should return null for Calouro (lowest rank)', () => {
      const calouro = ACADEMIC_RANKS.find(r => r.id === 'calouro')!;
      const prevRank = RankSystem.getPreviousRank(calouro);
      expect(prevRank).toBeNull();
    });
  });

  describe('checkRankUp', () => {
    it('should return null when player is at starting level', () => {
      const player = createMockPlayer({ level: 1, xp: 0 });
      const rankUp = RankSystem.checkRankUp(player);
      expect(rankUp).toBeNull();
    });

    it('should return null for highest rank player', () => {
      const posDoutor = ACADEMIC_RANKS.find(r => r.id === 'pos_doutorando_senior')!;
      const player = createMockPlayer({
        level: 100,
        xp: 100000,
        currentRank: posDoutor,
        completedSkills: Array.from({ length: 20 }, (_, i) => `skill${i}`),
      });
      const rankUp = RankSystem.checkRankUp(player);
      expect(rankUp).toBeNull();
    });

    it('should return null when level requirement not met', () => {
      const player = createMockPlayer({
        level: 3, // needs 5 for next rank
        xp: 100,
        completedSkills: ['skill1'],
      });
      const rankUp = RankSystem.checkRankUp(player);
      expect(rankUp).toBeNull();
    });
  });

  describe('calculateRankProgress', () => {
    it('should return 0 for a new player', () => {
      const player = createMockPlayer({ level: 1, xp: 0 });
      const progress = RankSystem.calculateRankProgress(player);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it('should return 1.0 for highest rank player', () => {
      const posDoutor = ACADEMIC_RANKS.find(r => r.id === 'pos_doutorando_senior')!;
      const player = createMockPlayer({
        level: 100,
        xp: 100000,
        currentRank: posDoutor,
        completedSkills: Array(20).fill('skill'),
      });
      const progress = RankSystem.calculateRankProgress(player);
      expect(progress).toBe(1.0);
    });

    it('should return value between 0 and 1', () => {
      const player = createMockPlayer({
        level: 3,
        xp: 150,
        completedSkills: [],
      });
      const progress = RankSystem.calculateRankProgress(player);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it('should increase as player progresses', () => {
      const player1 = createMockPlayer({ level: 2, xp: 100 });
      const player2 = createMockPlayer({ level: 4, xp: 200 });

      const progress1 = RankSystem.calculateRankProgress(player1);
      const progress2 = RankSystem.calculateRankProgress(player2);

      expect(progress2).toBeGreaterThan(progress1);
    });
  });

  describe('getAllRanks', () => {
    it('should return all 17 academic ranks', () => {
      const ranks = RankSystem.getAllRanks();
      expect(ranks).toHaveLength(17);
    });

    it('should return a copy, not the original array', () => {
      const ranks = RankSystem.getAllRanks();
      ranks.pop();
      expect(RankSystem.getAllRanks()).toHaveLength(17);
    });
  });

  describe('getRanksByCategory', () => {
    it('should categorize ranks correctly', () => {
      const categories = RankSystem.getRanksByCategory();

      expect(categories.posGraduacao.length).toBeGreaterThan(0);
      expect(categories.mestrado.length).toBeGreaterThan(0);
      expect(categories.graduacao.length).toBeGreaterThan(0);
      expect(categories.vestibular.length).toBeGreaterThan(0);
      expect(categories.inicio.length).toBeGreaterThan(0);
    });

    it('should have Calouro in inicio category', () => {
      const categories = RankSystem.getRanksByCategory();
      expect(categories.inicio.some(r => r.id === 'calouro')).toBe(true);
    });

    it('should include all ranks in some category', () => {
      const categories = RankSystem.getRanksByCategory();
      const totalCategorized =
        categories.posGraduacao.length +
        categories.mestrado.length +
        categories.graduacao.length +
        categories.vestibular.length +
        categories.inicio.length;

      expect(totalCategorized).toBe(ACADEMIC_RANKS.length);
    });
  });

  describe('areSameCategory', () => {
    it('should return true for two pos-graduation ranks', () => {
      const posDoutor = ACADEMIC_RANKS.find(r => r.id === 'pos_doutorando')!;
      const doutorando = ACADEMIC_RANKS.find(r => r.id === 'doutorando')!;
      expect(RankSystem.areSameCategory(posDoutor, doutorando)).toBe(true);
    });

    it('should return true for two master degree ranks', () => {
      const mestre = ACADEMIC_RANKS.find(r => r.id === 'mestre_defendido')!;
      const mestrando = ACADEMIC_RANKS.find(r => r.id === 'mestrando')!;
      expect(RankSystem.areSameCategory(mestre, mestrando)).toBe(true);
    });

    it('should return false for pos-graduation and undergraduate', () => {
      const posDoutor = ACADEMIC_RANKS.find(r => r.id === 'pos_doutorando')!;
      const estudante = ACADEMIC_RANKS.find(r => r.id === 'estudante_1_ano')!;
      expect(RankSystem.areSameCategory(posDoutor, estudante)).toBe(false);
    });
  });

  describe('getRankDescription', () => {
    it('should return description for Pós-Doutorando Sênior', () => {
      const posDoutor = ACADEMIC_RANKS.find(r => r.id === 'pos_doutorando_senior')!;
      const description = RankSystem.getRankDescription(posDoutor);
      expect(description).toContain('Pesquisador sênior');
    });

    it('should return description for Calouro', () => {
      const calouro = ACADEMIC_RANKS.find(r => r.id === 'calouro')!;
      const description = RankSystem.getRankDescription(calouro);
      expect(description.toLowerCase()).toContain('calouro');
    });

    it('should return default description for unknown rank', () => {
      const unknownRank: Rank = {
        id: 'unknown',
        name: 'Unknown',
        level: 0,
        icon: '?',
        requirements: { level: 0, xp: 0, completedDisciplines: 0 },
      };
      const description = RankSystem.getRankDescription(unknownRank);
      expect(description).toContain('Nível acadêmico');
    });

    it('should have descriptions for all ranks', () => {
      for (const rank of ACADEMIC_RANKS) {
        const description = RankSystem.getRankDescription(rank);
        expect(description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getRankColor', () => {
    it('should return gold color for Pós-Doutorando Sênior', () => {
      const posDoutor = ACADEMIC_RANKS.find(r => r.id === 'pos_doutorando_senior')!;
      const color = RankSystem.getRankColor(posDoutor);
      expect(color).toBe('#FFD700');
    });

    it('should return gray color for Calouro', () => {
      const calouro = ACADEMIC_RANKS.find(r => r.id === 'calouro')!;
      const color = RankSystem.getRankColor(calouro);
      expect(color).toBe('#696969');
    });

    it('should return green ENEM color as default for unknown rank', () => {
      const unknownRank: Rank = {
        id: 'unknown',
        name: 'Unknown',
        level: 0,
        icon: '?',
        requirements: { level: 0, xp: 0, completedDisciplines: 0 },
      };
      const color = RankSystem.getRankColor(unknownRank);
      expect(color).toBe('#038C44');
    });

    it('should return valid hex colors for all ranks', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      for (const rank of ACADEMIC_RANKS) {
        const color = RankSystem.getRankColor(rank);
        expect(color).toMatch(hexRegex);
      }
    });
  });
});