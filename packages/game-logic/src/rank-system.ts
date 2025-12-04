import { Rank, PlayerState } from '@ita-rp/shared-types';

/**
 * Sistema de progressão acadêmica da ENEM
 * Inspirado na trajetória estudantil desde o ingresso até a pós-graduação
 */
export const ACADEMIC_RANKS: Rank[] = [
  // PÓS-GRADUAÇÃO (DOUTORADO E PÓS-DOUTORADO)
  {
    id: 'pos_doutorando_senior',
    name: 'Pós-Doutorando Sênior',
    level: 100,
    icon: '🏆',
    requirements: { level: 100, xp: 100000, completedDisciplines: 20 },
  },
  {
    id: 'pos_doutorando',
    name: 'Pós-Doutorando',
    level: 90,
    icon: '🎓',
    requirements: { level: 90, xp: 81000, completedDisciplines: 18 },
  },
  {
    id: 'doutorando_final',
    name: 'Doutorando (Tese Concluída)',
    level: 80,
    icon: '📜',
    requirements: { level: 80, xp: 64000, completedDisciplines: 16 },
  },
  {
    id: 'doutorando_qualificado',
    name: 'Doutorando (Qualificado)',
    level: 70,
    icon: '📚',
    requirements: { level: 70, xp: 49000, completedDisciplines: 14 },
  },
  {
    id: 'doutorando',
    name: 'Doutorando',
    level: 60,
    icon: '📖',
    requirements: { level: 60, xp: 36000, completedDisciplines: 12 },
  },

  // MESTRADO
  {
    id: 'mestre_defendido',
    name: 'Mestre (Dissertação Defendida)',
    level: 50,
    icon: '🎯',
    requirements: { level: 50, xp: 25000, completedDisciplines: 10 },
  },
  {
    id: 'mestre_qualificado',
    name: 'Mestre (Qualificado)',
    level: 45,
    icon: '📝',
    requirements: { level: 45, xp: 20250, completedDisciplines: 9 },
  },
  {
    id: 'mestrando',
    name: 'Mestrando',
    level: 40,
    icon: '📄',
    requirements: { level: 40, xp: 16000, completedDisciplines: 8 },
  },

  // GRADUAÇÃO AVANÇADA
  {
    id: 'formando',
    name: 'Formando',
    level: 35,
    icon: '🎓',
    requirements: { level: 35, xp: 12250, completedDisciplines: 7 },
  },
  {
    id: 'estudante_5_ano',
    name: 'Estudante 5º Ano',
    level: 30,
    icon: '📚',
    requirements: { level: 30, xp: 9000, completedDisciplines: 6 },
  },
  {
    id: 'estudante_4_ano',
    name: 'Estudante 4º Ano',
    level: 25,
    icon: '📓',
    requirements: { level: 25, xp: 6250, completedDisciplines: 5 },
  },

  // GRADUAÇÃO INTERMEDIÁRIA
  {
    id: 'estudante_3_ano',
    name: 'Estudante 3º Ano',
    level: 20,
    icon: '📘',
    requirements: { level: 20, xp: 4000, completedDisciplines: 4 },
  },
  {
    id: 'estudante_2_ano',
    name: 'Estudante 2º Ano',
    level: 15,
    icon: '📗',
    requirements: { level: 15, xp: 2250, completedDisciplines: 3 },
  },
  {
    id: 'estudante_1_ano',
    name: 'Estudante 1º Ano',
    level: 10,
    icon: '📕',
    requirements: { level: 10, xp: 1000, completedDisciplines: 2 },
  },

  // VESTIBULAR E INGRESSO
  {
    id: 'aprovado_vestibular',
    name: 'Aprovado no Vestibular',
    level: 7,
    icon: '✅',
    requirements: { level: 7, xp: 490, completedDisciplines: 1 },
  },
  {
    id: 'cursinho_pre_vestibular',
    name: 'Cursinho Pré-Vestibular',
    level: 5,
    icon: '🏫',
    requirements: { level: 5, xp: 250, completedDisciplines: 1 },
  },

  // INICIAÇÃO ACADÊMICA
  {
    id: 'calouro',
    name: 'Calouro Ingressante',
    level: 1,
    icon: '🎒',
    requirements: { level: 1, xp: 0, completedDisciplines: 0 },
  },
];

/**
 * Sistema de gerenciamento de progressão acadêmica
 */
export class RankSystem {
  /**
   * Obtém o nível acadêmico atual do estudante baseado no nível
   */
  static getCurrentRank(level: number): Rank {
    // Procura o nível mais alto que o estudante qualifica
    // ACADEMIC_RANKS está ordenado do maior (Pós-Doutorando) ao menor (Calouro)
    for (const rank of ACADEMIC_RANKS) {
      if (level >= rank.requirements.level) {
        return rank;
      }
    }

    // Se não encontrar nenhuma (não deveria acontecer), retorna Calouro
    return ACADEMIC_RANKS[ACADEMIC_RANKS.length - 1];
  }

  /**
   * Obtém o próximo nível acadêmico
   */
  static getNextRank(currentRank: Rank): Rank | null {
    const currentIndex = ACADEMIC_RANKS.findIndex(rank => rank.id === currentRank.id);

    if (currentIndex <= 0) {
      return null; // Já está no nível mais alto
    }

    return ACADEMIC_RANKS[currentIndex - 1];
  }

  /**
   * Obtém o nível acadêmico anterior
   */
  static getPreviousRank(currentRank: Rank): Rank | null {
    const currentIndex = ACADEMIC_RANKS.findIndex(rank => rank.id === currentRank.id);

    if (currentIndex >= ACADEMIC_RANKS.length - 1) {
      return null; // Já está no nível mais baixo
    }

    return ACADEMIC_RANKS[currentIndex + 1];
  }

  /**
   * Verifica se o estudante está qualificado para uma progressão
   */
  static checkRankUp(player: PlayerState): Rank | null {
    const currentRank = this.getCurrentRank(player.level);
    const nextRank = this.getNextRank(currentRank);

    if (!nextRank) {
      return null; // Já está no nível mais alto
    }

    const completedDisciplines = player.completedSkills.length; // Simplificado

    if (player.level >= nextRank.requirements.level &&
        player.xp >= nextRank.requirements.xp &&
        completedDisciplines >= nextRank.requirements.completedDisciplines) {
      return nextRank;
    }

    return null;
  }

  /**
   * Calcula progresso para o próximo nível acadêmico (0.0 a 1.0)
   */
  static calculateRankProgress(player: PlayerState): number {
    const currentRank = this.getCurrentRank(player.level);
    const nextRank = this.getNextRank(currentRank);

    if (!nextRank) {
      return 1.0; // Já está no nível máximo
    }

    const completedDisciplines = player.completedSkills.length; // Simplificado

    // Calcula progresso em cada requisito
    const levelProgress = Math.min(1.0, player.level / nextRank.requirements.level);
    const xpProgress = Math.min(1.0, player.xp / nextRank.requirements.xp);
    const disciplineProgress = Math.min(1.0, completedDisciplines / nextRank.requirements.completedDisciplines);

    // Progresso geral é a média dos três requisitos
    return (levelProgress + xpProgress + disciplineProgress) / 3;
  }

  /**
   * Obtém todos os níveis acadêmicos em ordem decrescente (mais alto primeiro)
   */
  static getAllRanks(): Rank[] {
    return [...ACADEMIC_RANKS];
  }

  /**
   * Obtém níveis acadêmicos por categoria
   */
  static getRanksByCategory(): {
    posGraduacao: Rank[];
    mestrado: Rank[];
    graduacao: Rank[];
    vestibular: Rank[];
    inicio: Rank[];
  } {
    const posGraduacao = ACADEMIC_RANKS.filter(rank =>
      rank.id.includes('pos_doutorando') ||
      rank.id.includes('doutorando')
    );

    const mestrado = ACADEMIC_RANKS.filter(rank =>
      rank.id.includes('mestre') ||
      rank.id.includes('mestrando')
    );

    const graduacao = ACADEMIC_RANKS.filter(rank =>
      rank.id.includes('estudante_') ||
      rank.id.includes('formando')
    );

    const vestibular = ACADEMIC_RANKS.filter(rank =>
      rank.id.includes('vestibular') ||
      rank.id.includes('cursinho')
    );

    const inicio = ACADEMIC_RANKS.filter(rank =>
      rank.id.includes('calouro')
    );

    return { posGraduacao, mestrado, graduacao, vestibular, inicio };
  }

  /**
   * Verifica se dois níveis acadêmicos são da mesma categoria
   */
  static areSameCategory(rank1: Rank, rank2: Rank): boolean {
    const categories = this.getRanksByCategory();

    const getCategory = (rank: Rank): string => {
      if (categories.posGraduacao.includes(rank)) return 'posGraduacao';
      if (categories.mestrado.includes(rank)) return 'mestrado';
      if (categories.graduacao.includes(rank)) return 'graduacao';
      if (categories.vestibular.includes(rank)) return 'vestibular';
      if (categories.inicio.includes(rank)) return 'inicio';
      return 'unknown';
    };

    return getCategory(rank1) === getCategory(rank2);
  }

  /**
   * Obtém descrição do nível acadêmico para UI
   */
  static getRankDescription(rank: Rank): string {
    const descriptions: Record<string, string> = {
      'pos_doutorando_senior': 'Pesquisador sênior com pós-doutorado concluído',
      'pos_doutorando': 'Pesquisador pós-doutorando em instituição de renome',
      'doutorando_final': 'Doutorando com tese concluída e defendida',
      'doutorando_qualificado': 'Doutorando qualificado, pesquisando e escrevendo tese',
      'doutorando': 'Estudante de doutorado, iniciando pesquisa avançada',
      'mestre_defendido': 'Mestre com dissertação defendida e aprovada',
      'mestre_qualificado': 'Mestrando qualificado, pesquisando e escrevendo dissertação',
      'mestrando': 'Estudante de mestrado, aprofundando conhecimentos',
      'formando': 'Estudante em fase de conclusão de curso',
      'estudante_5_ano': 'Estudante de quinto ano, próximo da formatura',
      'estudante_4_ano': 'Estudante de quarto ano, avançado no curso',
      'estudante_3_ano': 'Estudante de terceiro ano, consolidando conhecimentos',
      'estudante_2_ano': 'Estudante de segundo ano, adaptado à vida acadêmica',
      'estudante_1_ano': 'Estudante de primeiro ano, começando a jornada',
      'aprovado_vestibular': 'Aprovado no vestibular, pronto para ingressar na universidade',
      'cursinho_pre_vestibular': 'Estudante preparando-se para o vestibular',
      'calouro': 'Calouro ingressante, dando os primeiros passos na vida acadêmica',
    };

    return descriptions[rank.id] || 'Nível acadêmico da ENEM';
  }

  /**
   * Obtém cor temática do nível acadêmico para UI
   */
  static getRankColor(rank: Rank): string {
    const colors: Record<string, string> = {
      'pos_doutorando_senior': '#FFD700', // Dourado
      'pos_doutorando': '#FFA500', // Laranja
      'doutorando_final': '#FF8C00', // Laranja escuro
      'doutorando_qualificado': '#DC143C', // Vermelho escuro
      'doutorando': '#B22222', // Vermelho
      'mestre_defendido': '#8B0000', // Vermelho escuro
      'mestre_qualificado': '#4169E1', // Azul royal
      'mestrando': '#1E90FF', // Azul dodger
      'formando': '#00BFFF', // Azul cielo
      'estudante_5_ano': '#87CEEB', // Azul claro
      'estudante_4_ano': '#32CD32', // Verde lima
      'estudante_3_ano': '#228B22', // Verde floresta
      'estudante_2_ano': '#008000', // Verde
      'estudante_1_ano': '#006400', // Verde escuro
      'aprovado_vestibular': '#FFD700', // Dourado
      'cursinho_pre_vestibular': '#C0C0C0', // Prata
      'calouro': '#696969', // Cinza escuro
    };

    return colors[rank.id] || '#038C44'; // Verde ENEM padrão
  }
}