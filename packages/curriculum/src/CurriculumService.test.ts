import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CurriculumService } from '../src/CurriculumService';

// Mock fetch globally
global.fetch = vi.fn();

describe('CurriculumService', () => {
  let service: CurriculumService;

  beforeEach(() => {
    service = new CurriculumService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('loadDiscipline', () => {
    it('should load discipline from cache', async () => {
      const mockDiscipline = {
        id: 'disc1',
        name: 'Test Discipline',
        description: 'A test discipline',
        mainTopics: [],
        totalSkills: 1,
      };

      const mockCurriculumData = {
        curriculumData: {
          areas: [
            {
              disciplines: [mockDiscipline],
            },
          ],
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCurriculumData),
      });

      await service.loadCurriculum();
      const result = await service.loadDiscipline('disc1');

      expect(result).toEqual(mockDiscipline);
    });

    it('should throw error for non-existent discipline', async () => {
      const mockCurriculumData = {
        curriculumData: {
          areas: [],
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCurriculumData),
      });

      await service.loadCurriculum();

      await expect(service.loadDiscipline('nonexistent')).rejects.toThrow(
        'Disciplina nonexistent não encontrada'
      );
    });
  });

  describe('loadSkill', () => {
    it('should load skill from cache', async () => {
      const mockSkill = {
        id: 'skill1',
        name: 'Test Skill',
        description: 'A test skill',
        difficulty: 'beginner',
        atomicExpansion: {
          steps: [],
          practicalExample: '',
          finalVerifications: [],
          assessmentCriteria: [],
          crossCurricularConnections: [],
          realWorldApplication: '',
        },
        estimatedTime: '1h',
        status: 'not_started',
        prerequisites: [],
      };

      const mockCurriculumData = {
        curriculumData: {
          areas: [
            {
              disciplines: [
                {
                  mainTopics: [
                    {
                      atomicTopics: [
                        {
                          individualConcepts: [
                            {
                              specificSkills: [mockSkill],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCurriculumData),
      });

      await service.loadCurriculum();
      const result = await service.loadSkill('skill1');

      expect(result).toEqual(mockSkill);
    });

    it('should throw error for non-existent skill', async () => {
      const mockCurriculumData = {
        curriculumData: {
          areas: [],
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCurriculumData),
      });

      await service.loadCurriculum();

      await expect(service.loadSkill('nonexistent')).rejects.toThrow(
        'Habilidade nonexistent não encontrada'
      );
    });
  });

  describe('validateCurriculum', () => {
    it('should validate valid curriculum data', () => {
      const validData = {
        formatVersion: '1.0',
        exportDate: new Date().toISOString(),
        appVersion: '2.0.0',
        curriculumData: {
          metadata: {
            startDate: '2025-01-01',
            duration: '1 Semestre',
            dailyStudyHours: '6-8 hours',
            totalAtomicSkills: 1,
            version: '2.0',
            lastUpdated: '2025-01-01',
            institution: 'ITA',
            basedOn: 'Catalog',
          },
          areas: [
            {
              id: 'area1',
              name: 'Test Area',
              disciplines: [
                {
                  id: 'disc1',
                  name: 'Test Discipline',
                  mainTopics: [
                    {
                      name: 'Topic 1',
                      atomicTopics: [
                        {
                          name: 'Atomic Topic',
                          individualConcepts: [
                            {
                              name: 'Concept',
                              specificSkills: [
                                {
                                  id: 'skill1',
                                  name: 'Skill',
                                  description: 'Description',
                                  difficulty: 'beginner',
                                  atomicExpansion: {
                                    steps: [],
                                    practicalExample: '',
                                    finalVerifications: [],
                                    assessmentCriteria: [],
                                    crossCurricularConnections: [],
                                    realWorldApplication: '',
                                  },
                                  estimatedTime: '1h',
                                  status: 'not_started',
                                  prerequisites: [],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          infographics: null,
          settings: null,
        },
      };

      const result = service.validateCurriculum(validData as any);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing areas', () => {
      const invalidData = {
        formatVersion: '1.0',
        exportDate: new Date().toISOString(),
        appVersion: '2.0.0',
        curriculumData: {
          metadata: {},
          areas: [],
          infographics: null,
          settings: null,
        },
      };

      const result = service.validateCurriculum(invalidData as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_AREAS',
        })
      );
    });

    it('should detect missing area id', () => {
      const invalidData = {
        formatVersion: '1.0',
        exportDate: new Date().toISOString(),
        appVersion: '2.0.0',
        curriculumData: {
          metadata: {},
          areas: [
            {
              name: 'Test Area',
              disciplines: [],
            },
          ],
          infographics: null,
          settings: null,
        },
      };

      const result = service.validateCurriculum(invalidData as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_AREA_ID',
        })
      );
    });

    it('should detect empty disciplines', () => {
      const invalidData = {
        formatVersion: '1.0',
        exportDate: new Date().toISOString(),
        appVersion: '2.0.0',
        curriculumData: {
          metadata: {},
          areas: [
            {
              id: 'area1',
              name: 'Test Area',
              disciplines: [],
            },
          ],
          infographics: null,
          settings: null,
        },
      } as any;

      const result = service.validateCurriculum(invalidData);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'EMPTY_AREA',
        })
      );
    });

    it('should detect missing main topics', () => {
      const invalidData = {
        formatVersion: '1.0',
        exportDate: new Date().toISOString(),
        appVersion: '2.0.0',
        curriculumData: {
          metadata: {},
          areas: [
            {
              id: 'area1',
              name: 'Test Area',
              disciplines: [
                {
                  id: 'disc1',
                  name: 'Test Discipline',
                  mainTopics: [],
                },
              ],
            },
          ],
          infographics: null,
          settings: null,
        },
      };

      const result = service.validateCurriculum(invalidData as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_TOPICS',
        })
      );
    });
  });

  describe('validatePrerequisites', () => {
    it('should return true for skill with no prerequisites', () => {
      const skill = {
        id: 'skill1',
        name: 'Skill',
        description: 'Description',
        prerequisites: [],
      } as any;

      const result = service.validatePrerequisites(skill, []);

      expect(result).toBe(true);
    });

    it('should return true when all prerequisites are completed', () => {
      const skill = {
        id: 'skill1',
        name: 'Skill',
        description: 'Description',
        prerequisites: ['skillA', 'skillB'],
      } as any;

      const result = service.validatePrerequisites(skill, ['skillA', 'skillB', 'skillC']);

      expect(result).toBe(true);
    });

    it('should return false when prerequisites are not completed', () => {
      const skill = {
        id: 'skill1',
        name: 'Skill',
        description: 'Description',
        prerequisites: ['skillA', 'skillB'],
      } as any;

      const result = service.validatePrerequisites(skill, ['skillA']);

      expect(result).toBe(false);
    });
  });

  describe('utility methods', () => {
    beforeEach(async () => {
      const mockCurriculumData = {
        curriculumData: {
          areas: [
            {
              disciplines: [
                {
                  id: 'disc1',
                  name: 'Discipline 1',
                  description: 'Description 1',
                  mainTopics: [
                    {
                      atomicTopics: [
                        {
                          individualConcepts: [
                            {
                              specificSkills: [
                                {
                                  id: 'skill1',
                                  name: 'Skill One',
                                  description: 'First skill',
                                  difficulty: 'beginner',
                                } as any,
                                {
                                  id: 'skill2',
                                  name: 'Skill Two',
                                  description: 'Second skill',
                                  difficulty: 'intermediate',
                                } as any,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCurriculumData),
      });

      await service.loadCurriculum();
    });

    it('should get all disciplines', () => {
      const disciplines = service.getAllDisciplines();

      expect(disciplines).toHaveLength(1);
      expect(disciplines[0].id).toBe('disc1');
    });

    it('should get all skills', () => {
      const skills = service.getAllSkills();

      expect(skills).toHaveLength(2);
      expect(skills.map(s => s.id)).toEqual(['skill1', 'skill2']);
    });

    it('should search skills by query', () => {
      const skills = service.searchSkills('One');

      expect(skills).toHaveLength(1);
      expect(skills[0].id).toBe('skill1');
    });

    it('should get skills by discipline', () => {
      const skills = service.getSkillsByDiscipline('disc1');

      expect(skills).toHaveLength(2);
    });

    it('should return empty array for non-existent discipline', () => {
      const skills = service.getSkillsByDiscipline('nonexistent');

      expect(skills).toHaveLength(0);
    });

    it('should search skills by query', () => {
      const skills = service.searchSkills('One');

      expect(skills).toHaveLength(1);
      expect(skills[0].id).toBe('skill1');
    });

    it('should search skills case insensitively', () => {
      const skills = service.searchSkills('ONE');

      expect(skills).toHaveLength(1);
      expect(skills[0].id).toBe('skill1');
    });

    it('should search skills by description', () => {
      const skills = service.searchSkills('First');

      expect(skills).toHaveLength(1);
      expect(skills[0].id).toBe('skill1');
    });

    it('should return empty array when no skills match query', () => {
      const skills = service.searchSkills('nonexistent');

      expect(skills).toHaveLength(0);
    });

    it('should get skills by difficulty', () => {
      const beginnerSkills = service.getSkillsByDifficulty('beginner');
      const intermediateSkills = service.getSkillsByDifficulty('intermediate');
      const advancedSkills = service.getSkillsByDifficulty('advanced');

      expect(beginnerSkills).toHaveLength(1);
      expect(intermediateSkills).toHaveLength(1);
      expect(advancedSkills).toHaveLength(0);
    });

    it('should clear cache', () => {
      service.clearCache();

      expect(service.isLoaded()).toBe(false);
      expect(service.getAllDisciplines()).toHaveLength(0);
    });

    it('should get formatted disciplines', () => {
      const formatted = service.getFormattedDisciplines();

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toHaveProperty('id', 'disc1');
      expect(formatted[0]).toHaveProperty('icon');
      expect(formatted[0]).toHaveProperty('color');
    });

    it('should get formatted skills for discipline', () => {
      const formatted = service.getFormattedSkillsForDiscipline('disc1');

      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toHaveProperty('id', 'skill1');
      expect(formatted[0]).toHaveProperty('difficulty');
    });

    it('should return empty array for non-existent discipline in formatted skills', () => {
      const formatted = service.getFormattedSkillsForDiscipline('nonexistent');

      expect(formatted).toHaveLength(0);
    });
  });
});
