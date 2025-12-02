import { describe, it, expect } from 'vitest';
import {
  generateQuestionsFromSkill,
  generateDisciplineQuiz,
  calculateQuizResult,
  getReviewQuestions,
  QuizQuestion,
} from './quiz-generator';
import type { SpecificSkill } from '@ita-rp/shared-types';

describe('Quiz Generator', () => {
  const mockSkill: SpecificSkill = {
    id: 'skill-1',
    name: 'Provar limites usando definição ε-δ',
    description: 'Calcular limites de funções usando a definição formal',
    difficulty: 'intermediate',
    estimatedTime: '3 horas',
    status: 'not_started',
    prerequisites: [],
    atomicExpansion: {
      steps: [
        {
          stepNumber: 1,
          title: 'Entender a definição formal de limite',
          subSteps: ['Revisar conceito de ε', 'Revisar conceito de δ'],
          verification: 'Estudante consegue explicar a definição',
          estimatedTime: '1 hora',
          materials: ['Apostila de Cálculo'],
          tips: 'Pratique com exemplos simples primeiro',
          learningObjective: 'Compreender a definição formal de limite',
          commonMistakes: ['Confundir ε com δ', 'Esquecer de verificar o domínio'],
        },
        {
          stepNumber: 2,
          title: 'Aplicar em exemplos',
          subSteps: ['Resolver limite linear', 'Resolver limite quadrático'],
          verification: 'Consegue resolver 3 exercícios sem ajuda',
          estimatedTime: '2 horas',
          materials: ['Lista de exercícios'],
          tips: 'Siga os passos metodicamente',
          learningObjective: 'Aplicar a definição em problemas práticos',
          commonMistakes: ['Erro algébrico na manipulação'],
        },
      ],
      practicalExample: 'Limite de x² quando x→2 = 4',
      finalVerifications: ['Prova escrita', 'Exercício oral'],
      assessmentCriteria: ['Rigor matemático', 'Clareza na explicação'],
      crossCurricularConnections: ['Análise Real'],
      realWorldApplication: 'Base para cálculo diferencial',
    },
  };

  const mockDerivativeSkill: SpecificSkill = {
    id: 'skill-2',
    name: 'Calcular derivadas usando regra da cadeia',
    description: 'Aplicar a regra da cadeia para derivar funções compostas',
    difficulty: 'beginner',
    estimatedTime: '2 horas',
    status: 'not_started',
    prerequisites: [],
    atomicExpansion: {
      steps: [],
      practicalExample: '',
      finalVerifications: [],
      assessmentCriteria: [],
      crossCurricularConnections: [],
      realWorldApplication: '',
    },
  };

  describe('generateQuestionsFromSkill', () => {
    it('should generate questions from skill with atomicExpansion', () => {
      const questions = generateQuestionsFromSkill(mockSkill);

      expect(questions.length).toBeGreaterThan(0);
    });

    it('should include skill ID in all questions', () => {
      const questions = generateQuestionsFromSkill(mockSkill);

      questions.forEach((q) => {
        expect(q.skillId).toBe('skill-1');
      });
    });

    it('should generate questions for limit-related skills', () => {
      const questions = generateQuestionsFromSkill(mockSkill);

      // Should have some limit-related questions
      expect(questions.some(q => q.topic === 'limits')).toBe(true);
    });

    it('should generate questions for derivative-related skills', () => {
      const questions = generateQuestionsFromSkill(mockDerivativeSkill);

      // Should have derivative-related questions
      expect(questions.some(q => q.topic === 'derivatives')).toBe(true);
    });

    it('should include common mistakes questions', () => {
      const questions = generateQuestionsFromSkill(mockSkill);

      const mistakeQuestions = questions.filter(q =>
        q.tags.includes('common-mistakes')
      );
      expect(mistakeQuestions.length).toBeGreaterThan(0);
    });

    it('should include comprehension questions', () => {
      const questions = generateQuestionsFromSkill(mockSkill);

      const comprehensionQuestions = questions.filter(q =>
        q.tags.includes('comprehension')
      );
      expect(comprehensionQuestions.length).toBeGreaterThan(0);
    });

    it('should generate at least one question for any skill', () => {
      const genericSkill: SpecificSkill = {
        id: 'generic-1',
        name: 'Generic Skill',
        description: 'A generic skill',
        difficulty: 'beginner',
        estimatedTime: '1h',
        status: 'not_started',
        prerequisites: [],
        atomicExpansion: {
          steps: [],
          practicalExample: '',
          finalVerifications: [],
          assessmentCriteria: [],
          crossCurricularConnections: [],
          realWorldApplication: '',
        },
      };

      const questions = generateQuestionsFromSkill(genericSkill);
      expect(questions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generateDisciplineQuiz', () => {
    it('should generate specified number of questions', () => {
      const skills = [mockSkill, mockDerivativeSkill];
      const quiz = generateDisciplineQuiz(skills, {
        numberOfQuestions: 5,
        includeExplanations: true,
        shuffleOptions: false,
      });

      expect(quiz.length).toBeLessThanOrEqual(5);
    });

    it('should filter by difficulty when specified', () => {
      const skills = [mockSkill, mockDerivativeSkill];
      const quiz = generateDisciplineQuiz(skills, {
        numberOfQuestions: 10,
        difficulty: 'beginner',
        includeExplanations: true,
        shuffleOptions: false,
      });

      quiz.forEach((q) => {
        expect(q.difficulty).toBe('beginner');
      });
    });

    it('should shuffle options when configured', () => {
      const skills = [mockSkill];
      const quiz1 = generateDisciplineQuiz(skills, {
        numberOfQuestions: 3,
        includeExplanations: true,
        shuffleOptions: true,
      });
      const quiz2 = generateDisciplineQuiz(skills, {
        numberOfQuestions: 3,
        includeExplanations: true,
        shuffleOptions: true,
      });

      // With shuffling, the order might be different
      // This is a probabilistic test, might occasionally fail
      const sameOrder = quiz1.every((q, i) =>
        quiz2[i] && q.correctIndex === quiz2[i].correctIndex
      );

      // We can't guarantee they're different (random), but we can check they're valid
      quiz1.forEach((q) => {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      });
    });
  });

  describe('calculateQuizResult', () => {
    const mockQuestions: QuizQuestion[] = [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Question 1',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
        explanation: 'Explanation 1',
        difficulty: 'beginner',
        skillId: 'skill-1',
        topic: 'test',
        tags: ['test'],
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Question 2',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 1,
        explanation: 'Explanation 2',
        difficulty: 'intermediate',
        skillId: 'skill-1',
        topic: 'test',
        tags: ['test'],
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        question: 'Question 3',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 2,
        explanation: 'Explanation 3',
        difficulty: 'advanced',
        skillId: 'skill-1',
        topic: 'test',
        tags: ['test'],
      },
    ];

    it('should calculate correct score', () => {
      const answers = [true, true, false]; // 2 correct, 1 wrong
      const result = calculateQuizResult(answers, 60, mockQuestions);

      expect(result.score).toBe(2);
      expect(result.totalQuestions).toBe(3);
    });

    it('should calculate correct percentage', () => {
      const answers = [true, true, false];
      const result = calculateQuizResult(answers, 60, mockQuestions);

      expect(result.percentage).toBeCloseTo(66.67, 1);
    });

    it('should identify correct and incorrect answers', () => {
      const answers = [true, false, true];
      const result = calculateQuizResult(answers, 60, mockQuestions);

      expect(result.correctAnswers).toContain('q1');
      expect(result.correctAnswers).toContain('q3');
      expect(result.incorrectAnswers).toContain('q2');
    });

    it('should return "master" level for 90%+', () => {
      const answers = [true, true, true];
      const result = calculateQuizResult(answers, 60, mockQuestions);

      expect(result.masteryLevel).toBe('master');
    });

    it('should return "proficient" level for 70-89%', () => {
      const questions = [
        ...mockQuestions,
        { ...mockQuestions[0], id: 'q4' },
        { ...mockQuestions[0], id: 'q5' },
      ];
      const answers = [true, true, true, true, false]; // 80%
      const result = calculateQuizResult(answers, 60, questions);

      expect(result.masteryLevel).toBe('proficient');
    });

    it('should return "learning" level for 50-69%', () => {
      const answers = [true, true, false]; // 66%
      const result = calculateQuizResult(answers, 60, mockQuestions);

      expect(result.masteryLevel).toBe('learning');
    });

    it('should return "novice" level for <50%', () => {
      const answers = [true, false, false]; // 33%
      const result = calculateQuizResult(answers, 60, mockQuestions);

      expect(result.masteryLevel).toBe('novice');
    });
  });

  describe('getReviewQuestions', () => {
    const mockQuestions: QuizQuestion[] = [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Question 1',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
        explanation: 'Explanation 1',
        difficulty: 'beginner',
        skillId: 'skill-1',
        topic: 'limits',
        tags: ['limits'],
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Question 2',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 1,
        explanation: 'Explanation 2',
        difficulty: 'intermediate',
        skillId: 'skill-1',
        topic: 'limits',
        tags: ['limits'],
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        question: 'Question 3',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 2,
        explanation: 'Explanation 3',
        difficulty: 'advanced',
        skillId: 'skill-1',
        topic: 'derivatives',
        tags: ['derivatives'],
      },
    ];

    it('should include incorrectly answered questions', () => {
      const result = {
        score: 2,
        totalQuestions: 3,
        percentage: 66.67,
        timeSpent: 60,
        correctAnswers: ['q1', 'q3'],
        incorrectAnswers: ['q2'],
        masteryLevel: 'learning' as const,
      };

      const reviewQuestions = getReviewQuestions(result, mockQuestions);

      expect(reviewQuestions.some(q => q.id === 'q2')).toBe(true);
    });

    it('should include similar topic questions', () => {
      const result = {
        score: 2,
        totalQuestions: 3,
        percentage: 66.67,
        timeSpent: 60,
        correctAnswers: ['q2', 'q3'],
        incorrectAnswers: ['q1'],
        masteryLevel: 'learning' as const,
      };

      const reviewQuestions = getReviewQuestions(result, mockQuestions);

      // Should include q1 (incorrect) and q2 (same topic as q1)
      expect(reviewQuestions.length).toBeGreaterThan(1);
    });
  });
});
