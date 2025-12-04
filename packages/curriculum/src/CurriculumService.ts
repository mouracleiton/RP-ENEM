import type {
  CurriculumData,
  Discipline,
  SpecificSkill,
  CurriculumLoader,
  CurriculumValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '@ita-rp/shared-types';

export class CurriculumService implements CurriculumLoader, CurriculumValidator {
  private curriculumCache: CurriculumData | null = null;
  private disciplineCache: Map<string, Discipline> = new Map();
  private skillCache: Map<string, SpecificSkill> = new Map();

  async loadCurriculum(): Promise<CurriculumData> {
    if (this.curriculumCache) {
      return this.curriculumCache;
    }

    try {
      // Dynamically load all JSON files from the packages/curriculum directory
      // This ensures we include all available curriculum files without hardcoding
      const curriculumFiles = await this.fetchAllCurriculumFiles();

      const areas: any[] = [];

      // Get base URL for GitHub Pages or local deployment
      // Vite sets import.meta.env.BASE_URL based on vite.config.ts base option
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = import.meta as any;
      let baseUrl = meta?.env?.BASE_URL || '/';

      // Fallback: detect base URL from current page location for GitHub Pages
      // This handles cases where BASE_URL isn't properly injected
      if (typeof window !== 'undefined' && baseUrl === '/') {
        const pathname = window.location.pathname;
        // Check if we're on GitHub Pages (path starts with /repo-name/)
        const match = pathname.match(/^(\/[^/]+\/)/);
        if (match && window.location.hostname.includes('github.io')) {
          baseUrl = match[1];
        }
      }
      console.log('[CurriculumService] Using base URL:', baseUrl);

      for (const filename of curriculumFiles) {
        try {
          // Extract competency code from filename (e.g., 'C1', 'C2', 'CL1')
          const competencyCode = filename.split(' ')[0];

          // Construct the full URL for the curriculum file
          // Load from public/curriculum directory (web runtime)
          const fileUrl = `${baseUrl}curriculum/${encodeURIComponent(filename)}`;
          console.log('[CurriculumService] Fetching:', fileUrl);
          const response = await fetch(fileUrl);
          if (!response.ok) {
            console.warn(`Failed to load ${filename}: ${response.statusText}`);
            continue;
          }

          const data = await response.json();
          if (data.curriculumData && data.curriculumData.areas) {
            // Prefix all IDs with competency code to ensure uniqueness across files
            const prefixedAreas = this.prefixIdsInAreas(data.curriculumData.areas, competencyCode);
            areas.push(...prefixedAreas);
          }
        } catch (error) {
          console.error(`Error loading ${filename}:`, error);
        }
      }

      const curriculumData: CurriculumData = {
        formatVersion: '1.0',
        exportDate: new Date().toISOString(),
        appVersion: '2.0.0',
        curriculumData: {
          metadata: {
            startDate: '2025-01-01',
            duration: '1 Semestre',
            dailyStudyHours: '6-8 hours',
            totalAtomicSkills: areas.reduce((sum, area) => sum + area.totalSkills, 0),
            version: '2.0 - ENEM RP Reborn',
            lastUpdated: new Date().toISOString().split('T')[0],
            institution: 'INEP - Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira',
            basedOn: 'Matriz de Referência ENEM 2026',
          },
          areas,
          infographics: null,
          settings: null,
        },
      };

      this.curriculumCache = curriculumData;
      this.populateCaches(curriculumData);

      // Reset the total skills cache in curriculum-constants
      // This ensures the Dashboard shows the correct skill count
      try {
        const { resetTotalSkillsCache } = await import('@ita-rp/game-logic');
        resetTotalSkillsCache();
        console.log('[CurriculumService] Reset total skills cache after curriculum load');
      } catch (error) {
        console.warn('[CurriculumService] Could not reset total skills cache:', error);
      }

      return curriculumData;
    } catch (error) {
      console.error('Failed to load curriculum:', error);
      throw new Error('Não foi possível carregar o currículo');
    }
  }

  async loadDiscipline(disciplineId: string): Promise<Discipline> {
    if (this.disciplineCache.has(disciplineId)) {
      return this.disciplineCache.get(disciplineId)!;
    }

    await this.loadCurriculum(); // Ensure curriculum is loaded

    const discipline = this.disciplineCache.get(disciplineId);
    if (!discipline) {
      throw new Error(`Disciplina ${disciplineId} não encontrada`);
    }

    return discipline;
  }

  async loadSkill(skillId: string): Promise<SpecificSkill> {
    if (this.skillCache.has(skillId)) {
      return this.skillCache.get(skillId)!;
    }

    await this.loadCurriculum(); // Ensure curriculum is loaded

    const skill = this.skillCache.get(skillId);
    if (!skill) {
      throw new Error(`Habilidade ${skillId} não encontrada`);
    }

    return skill;
  }

  validateCurriculum(data: CurriculumData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic structure validation
    if (!data.curriculumData) {
      errors.push({
        code: 'MISSING_CURRICULUM_DATA',
        message: 'Dados do currículo não encontrados',
        path: 'curriculumData',
      });
    }

    if (!data.curriculumData.areas || data.curriculumData.areas.length === 0) {
      errors.push({
        code: 'MISSING_AREAS',
        message: 'Nenhuma área de conhecimento encontrada',
        path: 'curriculumData.areas',
      });
    }

    // Validate each area
    data.curriculumData.areas?.forEach((area, areaIndex) => {
      if (!area.id) {
        errors.push({
          code: 'MISSING_AREA_ID',
          message: `Área ${areaIndex} não possui ID`,
          path: `curriculumData.areas[${areaIndex}].id`,
        });
      }

      if (!area.disciplines || area.disciplines.length === 0) {
        warnings.push({
          code: 'EMPTY_AREA',
          message: `Área ${area.name} não possui disciplinas`,
          path: `curriculumData.areas[${areaIndex}].disciplines`,
        });
      }

      // Validate each discipline
      area.disciplines?.forEach((discipline, discIndex) => {
        if (!discipline.mainTopics || discipline.mainTopics.length === 0) {
          errors.push({
            code: 'MISSING_TOPICS',
            message: `Disciplina ${discipline.name} não possui tópicos`,
            path: `curriculumData.areas[${areaIndex}].disciplines[${discIndex}].mainTopics`,
          });
        }

        // Validate each topic
        discipline.mainTopics?.forEach((topic, topicIndex) => {
          if (!topic.atomicTopics || topic.atomicTopics.length === 0) {
            warnings.push({
              code: 'EMPTY_TOPIC',
              message: `Tópico ${topic.name} não possui habilidades atômicas`,
              path: `curriculumData.areas[${areaIndex}].disciplines[${discIndex}].mainTopics[${topicIndex}].atomicTopics`,
            });
          }
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  validatePrerequisites(skill: SpecificSkill, completedSkills: string[]): boolean {
    if (!skill.prerequisites || skill.prerequisites.length === 0) {
      return true; // No prerequisites
    }

    return skill.prerequisites.every(prereq => completedSkills.includes(prereq));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private prefixIdsInAreas(areas: any[], disciplineCode: string): any[] {
    return areas.map(area => ({
      ...area,
      id: `${disciplineCode}.${area.id}`,
      disciplines: area.disciplines?.map((discipline: any) => ({
        ...discipline,
        id: `${disciplineCode}.${discipline.id}`,
        mainTopics: discipline.mainTopics?.map((topic: any) => ({
          ...topic,
          id: `${disciplineCode}.${topic.id}`,
          atomicTopics: topic.atomicTopics?.map((atomicTopic: any) => ({
            ...atomicTopic,
            id: `${disciplineCode}.${atomicTopic.id}`,
            individualConcepts: atomicTopic.individualConcepts?.map((concept: any) => ({
              ...concept,
              id: `${disciplineCode}.${concept.id}`,
              specificSkills: concept.specificSkills?.map((skill: any) => ({
                ...skill,
                id: `${disciplineCode}.${skill.id}`,
                prerequisites:
                  skill.prerequisites?.map((prereq: string) =>
                    prereq ? `${disciplineCode}.${prereq}` : prereq
                  ) || [],
              })),
            })),
            // Handle specificSkills directly under atomicTopic (alternative structure)
            specificSkills: atomicTopic.specificSkills?.map((skill: any) => ({
              ...skill,
              id: `${disciplineCode}.${skill.id}`,
              prerequisites:
                skill.prerequisites?.map((prereq: string) =>
                  prereq ? `${disciplineCode}.${prereq}` : prereq
                ) || [],
            })),
          })),
        })),
      })),
    }));
  }

  private transformSkillData(skill: any): SpecificSkill {
    // Create a copy to avoid mutating the original
    const transformedSkill = { ...skill };

    // Transform atomicExpansion if it exists
    if (transformedSkill.atomicExpansion) {
      const expansion = { ...transformedSkill.atomicExpansion };

      // Transform steps from Portuguese to English
      if (expansion.steps) {
        expansion.steps = expansion.steps.map((step: any) => {
          const transformedStep = { ...step };

          // Transform step number
          if (transformedStep.numeroPasso !== undefined) {
            transformedStep.stepNumber = transformedStep.numeroPasso;
            delete transformedStep.numeroPasso;
          }

          // Transform substeps
          if (transformedStep.subpassos) {
            transformedStep.subSteps = transformedStep.subpassos;
            delete transformedStep.subpassos;
          }

          // Ensure required fields exist
          if (!transformedStep.subSteps) {
            transformedStep.subSteps = [];
          }
          if (!transformedStep.verification) {
            transformedStep.verification = transformedStep.verificacao || 'Verifique seu aprendizado';
          }
          if (!transformedStep.estimatedTime) {
            transformedStep.estimatedTime = '15 min';
          }
          if (!transformedStep.materials) {
            transformedStep.materials = [];
          }
          if (!transformedStep.tips) {
            transformedStep.tips = '';
          }
          if (!transformedStep.learningObjective) {
            transformedStep.learningObjective = transformedStep.objetivoAprendizagem || 'Aprender o conceito';
          }
          if (!transformedStep.commonMistakes) {
            transformedStep.commonMistakes = [];
          }

          return transformedStep;
        });
      }

      // Ensure other required fields
      if (!expansion.practicalExample) {
        expansion.practicalExample = '';
      }
      if (!expansion.finalVerifications) {
        expansion.finalVerifications = [];
      }
      if (!expansion.assessmentCriteria) {
        expansion.assessmentCriteria = [];
      }
      if (!expansion.crossCurricularConnections) {
        expansion.crossCurricularConnections = [];
      }
      if (!expansion.realWorldApplication) {
        expansion.realWorldApplication = '';
      }

      transformedSkill.atomicExpansion = expansion;
    }

    // Ensure skill level required fields
    if (!transformedSkill.difficulty) {
      transformedSkill.difficulty = 'beginner';
    }
    if (!transformedSkill.estimatedTime) {
      transformedSkill.estimatedTime = '1h';
    }
    if (!transformedSkill.status) {
      transformedSkill.status = 'not_started';
    }
    if (!transformedSkill.prerequisites) {
      transformedSkill.prerequisites = [];
    }

    return transformedSkill;
  }

  private populateCaches(curriculumData: CurriculumData): void {
    // Clear existing caches
    this.disciplineCache.clear();
    this.skillCache.clear();

    // Populate discipline cache
    curriculumData.curriculumData.areas?.forEach(area => {
      area.disciplines?.forEach(discipline => {
        this.disciplineCache.set(discipline.id, discipline);

        // Populate skill cache
        discipline.mainTopics?.forEach(topic => {
          topic.atomicTopics?.forEach(atomicTopic => {
            // Handle skills under individualConcepts (primary structure)
            atomicTopic.individualConcepts?.forEach(concept => {
              concept.specificSkills?.forEach(skill => {
                // Transform Portuguese field names to English
                const transformedSkill = this.transformSkillData(skill);
                this.skillCache.set(skill.id, transformedSkill);
              });
            });
            // Handle skills directly under atomicTopic (alternative structure)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const atomicTopicAny = atomicTopic as any;
            atomicTopicAny.specificSkills?.forEach((skill: SpecificSkill) => {
              // Transform Portuguese field names to English
              const transformedSkill = this.transformSkillData(skill);
              this.skillCache.set(skill.id, transformedSkill);
            });
          });
        });
      });
    });
  }

  // Utility methods
  getAllDisciplines(): Discipline[] {
    return Array.from(this.disciplineCache.values());
  }

  getAllSkills(): SpecificSkill[] {
    return Array.from(this.skillCache.values());
  }

  getSkillsByDiscipline(disciplineId: string): SpecificSkill[] {
    const discipline = this.disciplineCache.get(disciplineId);
    if (!discipline) return [];

    const skills: SpecificSkill[] = [];
    discipline.mainTopics?.forEach(topic => {
      topic.atomicTopics?.forEach(atomicTopic => {
        // Handle skills under individualConcepts (primary structure)
        atomicTopic.individualConcepts?.forEach(concept => {
          if (concept.specificSkills) {
            skills.push(...concept.specificSkills);
          }
        });
        // Handle skills directly under atomicTopic (alternative structure)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const atomicTopicAny = atomicTopic as any;
        if (atomicTopicAny.specificSkills) {
          skills.push(...atomicTopicAny.specificSkills);
        }
      });
    });

    return skills;
  }

  searchSkills(query: string): SpecificSkill[] {
    const allSkills = this.getAllSkills();
    const lowerQuery = query.toLowerCase();

    return allSkills.filter(
      skill =>
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery)
    );
  }

  getSkillsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): SpecificSkill[] {
    return this.getAllSkills().filter(skill => skill.difficulty === difficulty);
  }

  clearCache(): void {
    this.curriculumCache = null;
    this.disciplineCache.clear();
    this.skillCache.clear();
  }

  // Get formatted disciplines for UI display
  getFormattedDisciplines(): Array<{
    id: string;
    name: string;
    description: string;
    totalSkills: number;
    icon: string;
    color: string;
  }> {
    const disciplines = this.getAllDisciplines();

    const iconMap: Record<string, string> = {
      C1: '🧠',    // Formação do Pensamento Científico
      C2: '💬',    // Linguagens e Interações
      C3: '🔬',    // Conhecimento e Métodos Científicos
      C4: '🌍',    // Ciência e Transformação Social
      C5: '🌍',    // Ciência e Transformação Social (continuação)
      C6: '🌍',    // Ciência e Transformação Social (continuação)
      C7: '🇧🇷',   // Educação CT&I e Nacionalidade
      C8: '🔍',    // Investigação Científica e Argumentação
      C9: '⚡',    // Análise e Resolução de Problemas
      CL1: '📝',   // Competências Específicas de Linguagens
      CL2: '📝',   // Competências Específicas de Linguagens
      CL3: '📝',   // Competências Específicas de Linguagens
      CL4: '📝',   // Competências Específicas de Linguagens
      CL5: '📝',   // Competências Específicas de Linguagens
      CM1: '🔢',   // Competências Específicas de Matemática
      CM2: '🔢',   // Competências Específicas de Matemática
      CM3: '🔢',   // Competências Específicas de Matemática
      CH1: '👥',   // Competências Específicas de Ciências Humanas
      CH2: '👥',   // Competências Específicas de Ciências Humanas
      CH3: '👥',   // Competências Específicas de Ciências Humanas
      CF1: '⚛️',   // Competências Específicas de Ciências da Natureza - Física
      CF2: '⚛️',   // Competências Específicas de Ciências da Natureza - Física
      CQ1: '🧪',   // Competências Específicas de Ciências da Natureza - Química
      CQ2: '🧪',   // Competências Específicas de Ciências da Natureza - Química
      CB1: '🧬',   // Competências Específicas de Ciências da Natureza - Biologia
      CB2: '🧬',   // Competências Específicas de Ciências da Natureza - Biologia
      default: '📚',
    };

    const colorMap: Record<string, string> = {
      C1: '#3b82f6',   // Azul para pensamento científico
      C2: '#10b981',   // Verde para linguagens
      C3: '#8b5cf6',   // Roxo para métodos científicos
      C4: '#f59e0b',   // Laranja para transformação social
      C5: '#f59e0b',   // Laranja para transformação social
      C6: '#f59e0b',   // Laranja para transformação social
      C7: '#06b6d4',   // Ciano para nacionalidade
      C8: '#84cc16',   // Verde lima para investigação
      C9: '#ef4444',   // Vermelho para resolução de problemas
      CL1: '#ec4899',  // Rosa para linguagens específicas
      CL2: '#ec4899',  // Rosa para linguagens específicas
      CL3: '#ec4899',  // Rosa para linguagens específicas
      CL4: '#ec4899',  // Rosa para linguagens específicas
      CL5: '#ec4899',  // Rosa para linguagens específicas
      CM1: '#14b8a6',  // Teal para matemática
      CM2: '#14b8a6',  // Teal para matemática
      CM3: '#14b8a6',  // Teal para matemática
      CH1: '#f97316',  // Laranja escuro para ciências humanas
      CH2: '#f97316',  // Laranja escuro para ciências humanas
      CH3: '#f97316',  // Laranja escuro para ciências humanas
      CF1: '#0ea5e9',  // Azul claro para física
      CF2: '#0ea5e9',  // Azul claro para física
      CQ1: '#22c55e',  // Verde esmeralda para química
      CQ2: '#22c55e',  // Verde esmeralda para química
      CB1: '#a855f7',  // Púrpura para biologia
      CB2: '#a855f7',  // Púrpura para biologia
      default: '#6366f1',
    };

    return disciplines.map(disc => {
      // Extract prefix from ENEM competency codes (e.g., "C1", "CL2" from "C1.1" or "CL2.1")
      const idParts = disc.id.split('.');
      const prefix = idParts[0] || 'default';
      const skills = this.getSkillsByDiscipline(disc.id);

      return {
        id: disc.id,
        name: disc.name.replace(/^[\d.]+:\s*/, '').replace(/^(C\d|CL\d)-\d+:\s*/, ''),
        description: disc.description,
        totalSkills: skills.length || disc.totalSkills || 0,
        icon: iconMap[prefix] || iconMap['default'],
        color: colorMap[prefix] || colorMap['default'],
      };
    });
  }

  // Get skills formatted for UI
  getFormattedSkillsForDiscipline(disciplineId: string): Array<{
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    prerequisites: string[];
    steps: any[];
    practicalExample: string;
  }> {
    const skills = this.getSkillsByDiscipline(disciplineId);

    return skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      difficulty: skill.difficulty || 'beginner',
      estimatedTime: skill.estimatedTime || '1h',
      prerequisites: skill.prerequisites || [],
      steps: skill.atomicExpansion?.steps || [],
      practicalExample: skill.atomicExpansion?.practicalExample || '',
    }));
  }

  isLoaded(): boolean {
    return this.curriculumCache !== null;
  }

  // Fetch all available curriculum files dynamically
  private async fetchAllCurriculumFiles(): Promise<string[]> {
    try {
      // Get base URL for GitHub Pages or local deployment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = import.meta as any;
      let baseUrl = meta?.env?.BASE_URL || '/';

      // Fallback: detect base URL from current page location for GitHub Pages
      if (typeof window !== 'undefined' && baseUrl === '/') {
        const pathname = window.location.pathname;
        // Check if we're on GitHub Pages (path starts with /repo-name/)
        const match = pathname.match(/^(\/[^/]+\/)/);
        if (match && window.location.hostname.includes('github.io')) {
          baseUrl = match[1];
        }
      }

      // Try to fetch the directory listing first
      // Note: This is a fallback approach - in production, we might need to pre-generate a manifest
      try {
        const manifestUrl = `${baseUrl}curriculum/manifest.json`;
        const response = await fetch(manifestUrl);
        if (response.ok) {
          const manifest = await response.json();
          console.log('[CurriculumService] Using manifest file with', manifest.files.length, 'curriculum files');
          return manifest.files;
        }
      } catch (manifestError) {
        console.warn('[CurriculumService] Could not load manifest file, using fallback list');
      }

      // Fallback to known curriculum files
      const fallbackFiles = [
        // Competências Gerais (C1-C9)
        'C1 - Competência C1 - Tema 1: Formação do Pensamento Científico.json',
        'C2 - Competência C2 - Tema 2: Linguagens e Interações.json',
        'C3 - Competência C3 - Tema 3: Conhecimento e Métodos Científicos.json',
        'C4 - Competência C4 - Tema 4: Ciência e Transformação Social.json',
        'C5 - Competência C5 - Tema 4: Ciência e Transformação Social.json',
        'C6 - Competência C6 - Tema 4: Ciência e Transformação Social.json',
        'C7 - Competência C7 - Tema 5: Educação CT&I e Nacionalidade.json',
        'C8 - Competência C8 - Tema 6: Investigação Científica e Argumentação.json',
        'C9 - Competência C9 - Tema 7: Análise e Resolução de Problemas.json',
        // Competências Específicas de Linguagens (CL1-CL5)
        'CL1 - Competência CL1 - Linguagens.json',
        'CL2 - Competência CL2 - Linguagens.json',
        'CL3 - Competência CL3 - Linguagens.json',
        'CL4 - Competência CL4 - Linguagens.json',
        'CL5 - Competência CL5 - Linguagens.json',
        // Competências Específicas de Matemática (CM1-CM3)
        'CM1 - Competência CM1 - Matemática.json',
        'CM2 - Competência CM2 - Matemática.json',
        'CM3 - Competência CM3 - Matemática.json',
        // Competências Específicas de Ciências Humanas (CH1-CH3)
        'CH1 - Competência CH1 - Ciências_Humanas.json',
        'CH2 - Competência CH2 - Ciências_Humanas.json',
        'CH3 - Competência CH3 - Ciências_Humanas.json',
        // Competências Específicas de Ciências da Natureza - Física (CF1-CF2)
        'CF1 - Competência CF1 - Ciências_da_Natureza_Física.json',
        'CF2 - Competência CF2 - Ciências_da_Natureza_Física.json',
        // Competências Específicas de Ciências da Natureza - Química (CQ1-CQ2)
        'CQ1 - Competência CQ1 - Ciências_da_Natureza_Química.json',
        'CQ2 - Competência CQ2 - Ciências_da_Natureza_Química.json',
        // Competências Específicas de Ciências da Natureza - Biologia (CB1-CB2)
        'CB1 - Competência CB1 - Ciências_da_Natureza_Biologia.json',
        'CB2 - Competência CB2 - Ciências_da_Natureza_Biologia.json',
      ];

      return fallbackFiles;
    } catch (error) {
      console.error('Error fetching curriculum files:', error);
      throw new Error('Could not fetch curriculum files');
    }
  }
}

// Singleton instance
export const curriculumService = new CurriculumService();
