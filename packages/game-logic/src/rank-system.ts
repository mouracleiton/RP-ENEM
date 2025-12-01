import { Rank, PlayerState } from '@ita-rp/shared-types';

/**
 * Sistema de patentes da Aeronáutica Brasileira
 * Inspirado na hierarquia militar brasileira adaptada para o contexto educacional
 */
export const AERONAUTICS_RANKS: Rank[] = [
  // POSTOS (OFICIAIS)
  {
    id: 'marechal_do_ar',
    name: 'Marechal do Ar',
    level: 100,
    icon: '🌟',
    requirements: { level: 100, xp: 100000, completedDisciplines: 20 },
  },
  {
    id: 'tenente_brigadeiro',
    name: 'Tenente-Brigadeiro',
    level: 90,
    icon: '⭐',
    requirements: { level: 90, xp: 81000, completedDisciplines: 18 },
  },
  {
    id: 'major_brigadeiro',
    name: 'Major-Brigadeiro',
    level: 80,
    icon: '✨',
    requirements: { level: 80, xp: 64000, completedDisciplines: 16 },
  },
  {
    id: 'coronel_aviador',
    name: 'Coronel Aviador',
    level: 70,
    icon: '💫',
    requirements: { level: 70, xp: 49000, completedDisciplines: 14 },
  },
  {
    id: 'tenente_coronel_aviador',
    name: 'Tenente-Coronel Aviador',
    level: 60,
    icon: '🔶',
    requirements: { level: 60, xp: 36000, completedDisciplines: 12 },
  },
  {
    id: 'major_aviador',
    name: 'Major Aviador',
    level: 50,
    icon: '🔷',
    requirements: { level: 50, xp: 25000, completedDisciplines: 10 },
  },
  {
    id: 'capitao_aviador',
    name: 'Capitão Aviador',
    level: 40,
    icon: '🔵',
    requirements: { level: 40, xp: 16000, completedDisciplines: 8 },
  },
  {
    id: 'primeiro_tenente',
    name: '1º Tenente',
    level: 35,
    icon: '🟦',
    requirements: { level: 35, xp: 12250, completedDisciplines: 7 },
  },
  {
    id: 'segundo_tenente',
    name: '2º Tenente',
    level: 30,
    icon: '🟪',
    requirements: { level: 30, xp: 9000, completedDisciplines: 6 },
  },
  {
    id: 'aspirante',
    name: 'Aspirante a Oficial',
    level: 25,
    icon: '🟨',
    requirements: { level: 25, xp: 6250, completedDisciplines: 5 },
  },

  // GRADUAÇÕES (SARGENTOS)
  {
    id: 'suboficial',
    name: 'Suboficial',
    level: 22,
    icon: '🟧',
    requirements: { level: 22, xp: 4840, completedDisciplines: 4 },
  },
  {
    id: 'primeiro_sargento',
    name: '1º Sargento',
    level: 20,
    icon: '🟥',
    requirements: { level: 20, xp: 4000, completedDisciplines: 4 },
  },
  {
    id: 'segundo_sargento',
    name: '2º Sargento',
    level: 18,
    icon: '🟤',
    requirements: { level: 18, xp: 3240, completedDisciplines: 3 },
  },
  {
    id: 'terceiro_sargento',
    name: '3º Sargento',
    level: 16,
    icon: '⚫',
    requirements: { level: 16, xp: 2560, completedDisciplines: 3 },
  },

  // GRADUAÇÕES (CABOS E SOLDADOS)
  {
    id: 'cabo',
    name: 'Cabo',
    level: 14,
    icon: '⚪',
    requirements: { level: 14, xp: 1960, completedDisciplines: 2 },
  },
  {
    id: 'soldado_primeira_classe',
    name: 'Soldado 1ª Classe',
    level: 10,
    icon: '💠',
    requirements: { level: 10, xp: 1000, completedDisciplines: 2 },
  },
  {
    id: 'soldado_segunda_classe',
    name: 'Soldado 2ª Classe',
    level: 7,
    icon: '🔹',
    requirements: { level: 7, xp: 490, completedDisciplines: 1 },
  },
  {
    id: 'soldado_terceira_classe',
    name: 'Soldado 3ª Classe',
    level: 5,
    icon: '🔸',
    requirements: { level: 5, xp: 250, completedDisciplines: 1 },
  },

  // INICIAÇÃO
  {
    id: 'recruta',
    name: 'Recruta',
    level: 1,
    icon: '🎖️',
    requirements: { level: 1, xp: 0, completedDisciplines: 0 },
  },
];

/**
 * Sistema de gerenciamento de patentes
 */
export class RankSystem {
  /**
   * Obtém a patente atual do jogador baseado no nível
   */
  static getCurrentRank(level: number): Rank {
    // Procura a patente mais alta que o jogador qualifica
    // AERONAUTICS_RANKS está ordenado do maior (Marechal) ao menor (Recruta)
    for (const rank of AERONAUTICS_RANKS) {
      if (level >= rank.requirements.level) {
        return rank;
      }
    }

    // Se não encontrar nenhuma (não deveria acontecer), retorna Recruta
    return AERONAUTICS_RANKS[AERONAUTICS_RANKS.length - 1];
  }

  /**
   * Obtém a próxima patente
   */
  static getNextRank(currentRank: Rank): Rank | null {
    const currentIndex = AERONAUTICS_RANKS.findIndex(rank => rank.id === currentRank.id);

    if (currentIndex <= 0) {
      return null; // Já está na patente mais alta
    }

    return AERONAUTICS_RANKS[currentIndex - 1];
  }

  /**
   * Obtém a patente anterior
   */
  static getPreviousRank(currentRank: Rank): Rank | null {
    const currentIndex = AERONAUTICS_RANKS.findIndex(rank => rank.id === currentRank.id);

    if (currentIndex >= AERONAUTICS_RANKS.length - 1) {
      return null; // Já está na patente mais baixa
    }

    return AERONAUTICS_RANKS[currentIndex + 1];
  }

  /**
   * Verifica se o jogador está qualificado para uma promoção
   */
  static checkRankUp(player: PlayerState): Rank | null {
    const currentRank = this.getCurrentRank(player.level);
    const nextRank = this.getNextRank(currentRank);

    if (!nextRank) {
      return null; // Já está na patente mais alta
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
   * Calcula progresso para a próxima patente (0.0 a 1.0)
   */
  static calculateRankProgress(player: PlayerState): number {
    const currentRank = this.getCurrentRank(player.level);
    const nextRank = this.getNextRank(currentRank);

    if (!nextRank) {
      return 1.0; // Já está na patente máxima
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
   * Obtém todas as patentes em ordem decrescente (mais alta primeiro)
   */
  static getAllRanks(): Rank[] {
    return [...AERONAUTICS_RANKS];
  }

  /**
   * Obtém patentes por categoria
   */
  static getRanksByCategory(): {
    officers: Rank[];
    sergeants: Rank[];
    soldiers: Rank[];
    recruits: Rank[];
  } {
    const officers = AERONAUTICS_RANKS.filter(rank =>
      rank.id.includes('marechal') ||
      rank.id.includes('brigadeiro') ||
      rank.id.includes('coronel') ||
      rank.id.includes('tenente') ||
      rank.id.includes('major') ||
      rank.id.includes('capitao') ||
      rank.id.includes('aspirante')
    );

    const sergeants = AERONAUTICS_RANKS.filter(rank =>
      rank.id.includes('sargento') || rank.id.includes('suboficial')
    );

    const soldiers = AERONAUTICS_RANKS.filter(rank =>
      rank.id.includes('soldado') || rank.id.includes('cabo')
    );

    const recruits = AERONAUTICS_RANKS.filter(rank =>
      rank.id.includes('recruta')
    );

    return { officers, sergeants, soldiers, recruits };
  }

  /**
   * Verifica se duas patentes são da mesma categoria
   */
  static areSameCategory(rank1: Rank, rank2: Rank): boolean {
    const categories = this.getRanksByCategory();

    const getCategory = (rank: Rank): string => {
      if (categories.officers.includes(rank)) return 'officer';
      if (categories.sergeants.includes(rank)) return 'sergeant';
      if (categories.soldiers.includes(rank)) return 'soldier';
      if (categories.recruits.includes(rank)) return 'recruit';
      return 'unknown';
    };

    return getCategory(rank1) === getCategory(rank2);
  }

  /**
   * Obtém descrição da patente para UI
   */
  static getRankDescription(rank: Rank): string {
    const descriptions: Record<string, string> = {
      'marechal_do_ar': 'A mais alta patente da Força Aérea Brasileira',
      'tenente_brigadeiro': 'Oficial-general, comando de grandes formações',
      'major_brigadeiro': 'Oficial-general, comando de brigadas',
      'coronel_aviador': 'Oficial superior, comando de grupamentos',
      'tenente_coronel_aviador': 'Oficial superior, subcomando de unidades',
      'major_aviador': 'Oficial intermediário, chefia de seções',
      'capitao_aviador': 'Oficial subalterno, comando de pelotões',
      'primeiro_tenente': 'Oficial subalterno, liderança de equipes',
      'segundo_tenente': 'Oficial subalterno, início da carreira',
      'aspirante': 'Oficial em formação, transição para a carreira',
      'suboficial': 'Graduação mais alta da praça especializada',
      'primeiro_sargento': 'Liderança de esquadrilhas e subunidades',
      'segundo_sargento': 'Assistente de liderança e instrução',
      'terceiro_sargento': 'Início da carreira de sargento',
      'cabo': 'Liderança de pequenas equipes',
      'soldado_primeira_classe': 'Soldado experiente e qualificado',
      'soldado_segunda_classe': 'Soldado com experiência básica',
      'soldado_terceira_classe': 'Soldado em treinamento inicial',
      'recruta': 'Início da jornada na carreira militar',
    };

    return descriptions[rank.id] || 'Patente da Aeronáutica Brasileira';
  }

  /**
   * Obtém cor temática da patente para UI
   */
  static getRankColor(rank: Rank): string {
    const colors: Record<string, string> = {
      'marechal_do_ar': '#FFD700', // Dourado
      'tenente_brigadeiro': '#FFA500', // Laranja
      'major_brigadeiro': '#FF8C00', // Laranja escuro
      'coronel_aviador': '#DC143C', // Vermelho escuro
      'tenente_coronel_aviador': '#B22222', // Vermelho
      'major_aviador': '#8B0000', // Vermelho escuro
      'capitao_aviador': '#4169E1', // Azul royal
      'primeiro_tenente': '#1E90FF', // Azul dodger
      'segundo_tenente': '#00BFFF', // Azul cielo
      'aspirante': '#87CEEB', // Azul claro
      'suboficial': '#32CD32', // Verde lima
      'primeiro_sargento': '#228B22', // Verde floresta
      'segundo_sargento': '#008000', // Verde
      'terceiro_sargento': '#006400', // verde escuro
      'cabo': '#FFD700', // Dourado
      'soldado_primeira_classe': '#C0C0C0', // Prata
      'soldado_segunda_classe': '#CD7F32', // Bronze
      'soldado_terceira_classe': '#8B4513', // Marrom
      'recruta': '#696969', // Cinza escuro
    };

    return colors[rank.id] || '#FFFFFF'; // Branco padrão
  }
}