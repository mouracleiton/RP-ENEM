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
      // Load all JSON files from the public/curriculum directory
      const curriculumFiles = [
        'CSI-22 - Programação Orientada a Objetos.json',
        'MAT-13 - Cálculo Diferencial e Integral I.json',
        'CMC-14 - Lógica Matemática e Estruturas Discreta.json',
        'CTC-55: Algoritmos Avançados.json',
        'CTC-12 - Projeto e Análise de Algoritmos.json',
      ];

      const areas: any[] = [];

      for (const filename of curriculumFiles) {
        try {
          const response = await fetch(`/curriculum/${filename}`);
          if (!response.ok) {
            console.warn(`Failed to load ${filename}: ${response.statusText}`);
            continue;
          }

          const data = await response.json();
          if (data.curriculumData && data.curriculumData.areas) {
            areas.push(...data.curriculumData.areas);
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
            version: '2.0 - ITA RP Reborn',
            lastUpdated: new Date().toISOString().split('T')[0],
            institution: 'Instituto Tecnológico de Aeronáutica (ITA)',
            basedOn: 'Catálogo dos Cursos de Graduação 2025 - CC201',
          },
          areas,
          infographics: null,
          settings: null,
        },
      };

      this.curriculumCache = curriculumData;
      this.populateCaches(curriculumData);

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
            atomicTopic.individualConcepts?.forEach(concept => {
              concept.specificSkills?.forEach(skill => {
                this.skillCache.set(skill.id, skill);
              });
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
        atomicTopic.individualConcepts?.forEach(concept => {
          if (concept.specificSkills) {
            skills.push(...concept.specificSkills);
          }
        });
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
      'CSI': '💻',
      'MAT': '📐',
      'CMC': '🧮',
      'CTC': '⚙️',
      'ELE': '⚡',
      'FIS': '🔬',
      'QUI': '🧪',
    };

    const colorMap: Record<string, string> = {
      'CSI': '#00d4ff',
      'MAT': '#ff6b6b',
      'CMC': '#4ecdc4',
      'CTC': '#a855f7',
      'ELE': '#fbbf24',
      'FIS': '#22c55e',
      'QUI': '#f472b6',
    };

    return disciplines.map(disc => {
      const prefix = disc.id.split('-')[0]?.split('.').pop() || 'default';
      const skills = this.getSkillsByDiscipline(disc.id);

      return {
        id: disc.id,
        name: disc.name.replace(/^[\d.]+:\s*/, '').replace(/^CSI-\d+:\s*/, ''),
        description: disc.description,
        totalSkills: skills.length || disc.totalSkills || 0,
        icon: iconMap[prefix] || '📚',
        color: colorMap[prefix] || '#6366f1',
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
}

// Singleton instance
export const curriculumService = new CurriculumService();
