/**
 * Quiz Generator - Creates dynamic quizzes from curriculum content
 * Uses spaced repetition principles and adaptive difficulty
 */

import type { SpecificSkill } from '@ita-rp/shared-types';

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'order_steps';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skillId: string;
  topic: string;
  tags: string[];
}

export interface QuizConfig {
  numberOfQuestions: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
  includeExplanations: boolean;
  timeLimit?: number; // seconds per question
  shuffleOptions: boolean;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  correctAnswers: string[];
  incorrectAnswers: string[];
  masteryLevel: 'novice' | 'learning' | 'proficient' | 'master';
}

// Math-related question templates
const mathQuestionTemplates = {
  limit: [
    {
      template: 'Qual é o valor de lim(x→{a}) {expression}?',
      generator: () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const m = Math.floor(Math.random() * 4) + 1;
        const b = Math.floor(Math.random() * 10) - 5;
        const result = m * a + b;
        return {
          question: `Qual é o valor de lim(x→${a}) (${m}x + ${b >= 0 ? b : `(${b})`})?`,
          options: [
            `${result}`,
            `${result + m}`,
            `${result - m}`,
            `${result * 2}`,
          ],
          correctIndex: 0,
          explanation: `Substituindo x = ${a}: ${m}·${a} + ${b >= 0 ? b : `(${b})`} = ${m * a} + ${b >= 0 ? b : `(${b})`} = ${result}`,
        };
      },
    },
    {
      template: 'Qual condição é necessária para que lim(x→a) f(x) = L?',
      generator: () => ({
        question: 'Qual condição é necessária e suficiente para que lim(x→a) f(x) = L exista?',
        options: [
          'Os limites laterais devem existir e serem iguais',
          'f(a) deve estar definida',
          'f deve ser contínua em a',
          'f deve ser derivável em a',
        ],
        correctIndex: 0,
        explanation: 'Para que o limite exista, os limites laterais (pela esquerda e pela direita) devem existir e serem iguais a L.',
      }),
    },
  ],
  derivative: [
    {
      template: 'Qual é a derivada de {function}?',
      generator: () => {
        const n = Math.floor(Math.random() * 5) + 2;
        return {
          question: `Qual é a derivada de f(x) = x^${n}?`,
          options: [
            `${n}x^${n - 1}`,
            `${n - 1}x^${n}`,
            `x^${n + 1}/${n + 1}`,
            `${n}x^${n + 1}`,
          ],
          correctIndex: 0,
          explanation: `Usando a regra da potência: d/dx[x^n] = n·x^(n-1). Portanto, d/dx[x^${n}] = ${n}x^${n - 1}`,
        };
      },
    },
    {
      template: 'Regra da cadeia',
      generator: () => ({
        question: 'Qual é a derivada de f(x) = sen(x²)?',
        options: [
          '2x·cos(x²)',
          'cos(x²)',
          '2x·sen(x²)',
          '-cos(x²)',
        ],
        correctIndex: 0,
        explanation: 'Pela regra da cadeia: d/dx[sen(u)] = cos(u)·du/dx. Com u = x², du/dx = 2x. Logo, f\'(x) = cos(x²)·2x = 2x·cos(x²)',
      }),
    },
  ],
  integral: [
    {
      template: 'Qual é a integral de {function}?',
      generator: () => {
        const n = Math.floor(Math.random() * 4) + 1;
        return {
          question: `Qual é ∫x^${n} dx?`,
          options: [
            `x^${n + 1}/${n + 1} + C`,
            `${n}x^${n - 1} + C`,
            `x^${n + 1} + C`,
            `x^${n}/${n} + C`,
          ],
          correctIndex: 0,
          explanation: `A integral de x^n é x^(n+1)/(n+1) + C. Portanto, ∫x^${n} dx = x^${n + 1}/${n + 1} + C`,
        };
      },
    },
  ],
  continuity: [
    {
      template: 'Condições de continuidade',
      generator: () => ({
        question: 'Para que f seja contínua em x = a, quais condições devem ser satisfeitas?',
        options: [
          'f(a) existe, lim(x→a) f(x) existe, e lim(x→a) f(x) = f(a)',
          'Apenas f(a) deve existir',
          'f deve ser derivável em a',
          'lim(x→a) f(x) = 0',
        ],
        correctIndex: 0,
        explanation: 'Continuidade requer três condições: (1) f(a) está definida, (2) o limite existe, e (3) o valor do limite é igual ao valor da função.',
      }),
    },
  ],
};

// Physics-related question templates
const physicsQuestionTemplates = {
  mechanics: [
    {
      template: 'Leis de Newton',
      generator: () => ({
        question: 'Qual é a expressão da Segunda Lei de Newton?',
        options: [
          'F = m·a',
          'F = m·v',
          'F = m·v²/r',
          'F = m·g',
        ],
        correctIndex: 0,
        explanation: 'A Segunda Lei de Newton estabelece que a força resultante é igual ao produto da massa pela aceleração: F = m·a',
      }),
    },
    {
      template: 'Energia cinética',
      generator: () => ({
        question: 'Qual é a expressão da energia cinética?',
        options: [
          'Ec = (1/2)mv²',
          'Ec = mgh',
          'Ec = mv',
          'Ec = (1/2)mv',
        ],
        correctIndex: 0,
        explanation: 'A energia cinética de um corpo é dada por Ec = (1/2)mv², onde m é a massa e v é a velocidade.',
      }),
    },
  ],
  electromagnetism: [
    {
      template: 'Lei de Coulomb',
      generator: () => ({
        question: 'A força elétrica entre duas cargas é proporcional a:',
        options: [
          'Ao produto das cargas e inversamente proporcional ao quadrado da distância',
          'À soma das cargas e proporcional à distância',
          'Ao produto das cargas e proporcional à distância',
          'À diferença das cargas',
        ],
        correctIndex: 0,
        explanation: 'Lei de Coulomb: F = k·q1·q2/r². A força é proporcional ao produto das cargas e inversamente proporcional ao quadrado da distância.',
      }),
    },
  ],
};

// Statistics question templates
const statisticsQuestionTemplates = {
  probability: [
    {
      template: 'Probabilidade básica',
      generator: () => ({
        question: 'Se P(A) = 0.3 e P(B) = 0.4, e A e B são eventos independentes, qual é P(A ∩ B)?',
        options: [
          '0.12',
          '0.70',
          '0.10',
          '0.34',
        ],
        correctIndex: 0,
        explanation: 'Para eventos independentes: P(A ∩ B) = P(A) × P(B) = 0.3 × 0.4 = 0.12',
      }),
    },
  ],
  distributions: [
    {
      template: 'Distribuição normal',
      generator: () => ({
        question: 'Na distribuição normal padrão, qual porcentagem dos dados está dentro de 1 desvio padrão da média?',
        options: [
          'Aproximadamente 68%',
          'Aproximadamente 95%',
          'Aproximadamente 50%',
          'Aproximadamente 99%',
        ],
        correctIndex: 0,
        explanation: 'Na regra empírica (68-95-99.7): aproximadamente 68% dos dados estão dentro de 1 desvio padrão da média.',
      }),
    },
  ],
};

/**
 * Generate questions based on skill content
 */
export function generateQuestionsFromSkill(skill: SpecificSkill): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const skillLower = skill.name.toLowerCase();
  const descLower = skill.description.toLowerCase();

  // Determine topic based on skill content
  let topicTemplates: Record<string, { template: string; generator: () => Partial<QuizQuestion> }[]> = {};
  let topic = 'general';

  if (skillLower.includes('limite') || skillLower.includes('lim') || descLower.includes('limite')) {
    topicTemplates = { limit: mathQuestionTemplates.limit };
    topic = 'limits';
  } else if (skillLower.includes('derivad') || skillLower.includes('diferencia') || descLower.includes('derivad')) {
    topicTemplates = { derivative: mathQuestionTemplates.derivative };
    topic = 'derivatives';
  } else if (skillLower.includes('integral') || descLower.includes('integral')) {
    topicTemplates = { integral: mathQuestionTemplates.integral };
    topic = 'integrals';
  } else if (skillLower.includes('continu') || descLower.includes('continu')) {
    topicTemplates = { continuity: mathQuestionTemplates.continuity };
    topic = 'continuity';
  } else if (skillLower.includes('mecânica') || skillLower.includes('newton') || descLower.includes('força')) {
    topicTemplates = { mechanics: physicsQuestionTemplates.mechanics };
    topic = 'mechanics';
  } else if (skillLower.includes('eletricidade') || skillLower.includes('magnetismo') || descLower.includes('carga')) {
    topicTemplates = { electromagnetism: physicsQuestionTemplates.electromagnetism };
    topic = 'electromagnetism';
  } else if (skillLower.includes('probabilidade') || skillLower.includes('estatística') || descLower.includes('probabilidade')) {
    topicTemplates = {
      probability: statisticsQuestionTemplates.probability,
      distributions: statisticsQuestionTemplates.distributions,
    };
    topic = 'statistics';
  }

  // Generate questions from templates
  Object.values(topicTemplates).forEach((templates) => {
    templates.forEach((t, idx) => {
      const generated = t.generator();
      questions.push({
        id: `${skill.id}-q${idx}`,
        type: 'multiple_choice',
        question: generated.question || '',
        options: generated.options || [],
        correctIndex: generated.correctIndex || 0,
        explanation: generated.explanation || '',
        difficulty: skill.difficulty || 'intermediate',
        skillId: skill.id,
        topic,
        tags: [topic, skill.difficulty || 'intermediate'],
      });
    });
  });

  // Generate questions from skill's atomic expansion if available
  if (skill.atomicExpansion?.steps) {
    skill.atomicExpansion.steps.forEach((step, idx) => {
      // Create comprehension check question
      questions.push({
        id: `${skill.id}-step${idx}`,
        type: 'multiple_choice',
        question: `Em "${skill.name}", qual é o objetivo do passo "${step.title}"?`,
        options: [
          step.learningObjective || 'Compreender o conceito fundamental',
          'Memorizar fórmulas sem entender',
          'Pular para o próximo tópico',
          'Praticar exercícios aleatórios',
        ],
        correctIndex: 0,
        explanation: step.verification || `Este passo é essencial para dominar ${skill.name}.`,
        difficulty: skill.difficulty || 'intermediate',
        skillId: skill.id,
        topic,
        tags: [topic, 'comprehension'],
      });

      // Create common mistakes question if available
      if (step.commonMistakes && step.commonMistakes.length > 0) {
        questions.push({
          id: `${skill.id}-mistake${idx}`,
          type: 'multiple_choice',
          question: `Qual é um erro comum ao estudar "${step.title}"?`,
          options: [
            step.commonMistakes[0],
            'Praticar demais',
            'Revisar antes da prova',
            'Fazer anotações detalhadas',
          ],
          correctIndex: 0,
          explanation: `Evite este erro comum: ${step.commonMistakes[0]}`,
          difficulty: skill.difficulty || 'intermediate',
          skillId: skill.id,
          topic,
          tags: [topic, 'common-mistakes'],
        });
      }
    });
  }

  // If no questions generated, create generic ones
  if (questions.length === 0) {
    questions.push({
      id: `${skill.id}-generic1`,
      type: 'true_false',
      question: `A habilidade "${skill.name}" é fundamental para o domínio deste tópico.`,
      options: ['Verdadeiro', 'Falso'],
      correctIndex: 0,
      explanation: skill.description,
      difficulty: skill.difficulty || 'beginner',
      skillId: skill.id,
      topic: 'general',
      tags: ['general'],
    });
  }

  return questions;
}

/**
 * Generate a complete quiz for a discipline
 */
export function generateDisciplineQuiz(
  skills: SpecificSkill[],
  config: QuizConfig
): QuizQuestion[] {
  const allQuestions: QuizQuestion[] = [];

  // Generate questions for each skill
  skills.forEach((skill) => {
    const skillQuestions = generateQuestionsFromSkill(skill);
    allQuestions.push(...skillQuestions);
  });

  // Filter by difficulty if specified
  let filteredQuestions = allQuestions;
  if (config.difficulty && config.difficulty !== 'adaptive') {
    filteredQuestions = allQuestions.filter(q => q.difficulty === config.difficulty);
  }

  // Shuffle and select
  const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, config.numberOfQuestions);

  // Shuffle options if configured
  if (config.shuffleOptions) {
    selected.forEach((q) => {
      const correctAnswer = q.options[q.correctIndex];
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      q.options = shuffledOptions;
      q.correctIndex = shuffledOptions.indexOf(correctAnswer);
    });
  }

  return selected;
}

/**
 * Calculate quiz result with mastery level
 */
export function calculateQuizResult(
  answers: boolean[],
  timeSpent: number,
  questions: QuizQuestion[]
): QuizResult {
  const score = answers.filter(Boolean).length;
  const percentage = (score / answers.length) * 100;

  const correctAnswers: string[] = [];
  const incorrectAnswers: string[] = [];

  answers.forEach((isCorrect, idx) => {
    if (isCorrect) {
      correctAnswers.push(questions[idx].id);
    } else {
      incorrectAnswers.push(questions[idx].id);
    }
  });

  let masteryLevel: QuizResult['masteryLevel'] = 'novice';
  if (percentage >= 90) {
    masteryLevel = 'master';
  } else if (percentage >= 70) {
    masteryLevel = 'proficient';
  } else if (percentage >= 50) {
    masteryLevel = 'learning';
  }

  return {
    score,
    totalQuestions: answers.length,
    percentage,
    timeSpent,
    correctAnswers,
    incorrectAnswers,
    masteryLevel,
  };
}

/**
 * Get recommended review questions based on performance
 */
export function getReviewQuestions(
  result: QuizResult,
  allQuestions: QuizQuestion[]
): QuizQuestion[] {
  // Get questions that were answered incorrectly
  const reviewQuestions = allQuestions.filter(q =>
    result.incorrectAnswers.includes(q.id)
  );

  // Add similar questions from the same topic
  const incorrectTopics = new Set(reviewQuestions.map(q => q.topic));
  const similarQuestions = allQuestions.filter(q =>
    incorrectTopics.has(q.topic) && !result.incorrectAnswers.includes(q.id)
  );

  return [...reviewQuestions, ...similarQuestions.slice(0, 3)];
}
