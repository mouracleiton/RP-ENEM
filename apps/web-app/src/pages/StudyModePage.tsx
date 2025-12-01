import React, { useState, useEffect, useMemo } from 'react';
import {
  useTheme,
  Card,
  Text,
  Button,
  ProgressBar,
  Modal,
  Quiz,
} from '@ita-rp/ui-components';
import { XPSystem } from '@ita-rp/game-logic';
import type { LearningStep } from '@ita-rp/shared-types';

type StudyPhase = 'learning' | 'quiz' | 'complete';

interface StudyModePageProps {
  skillId: string;
  skillName: string;
  skillDescription: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: LearningStep[];
  practicalExample: string;
  streak: number;
  onComplete: (xpEarned: number, performance: number) => void;
  onExit: () => void;
}

export const StudyModePage: React.FC<StudyModePageProps> = ({
  skillId,
  skillName,
  skillDescription,
  difficulty,
  estimatedTime,
  steps,
  practicalExample,
  streak,
  onComplete,
  onExit,
}) => {
  const { currentTheme } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [startTime] = useState(Date.now());
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [studyPhase, setStudyPhase] = useState<StudyPhase>('learning');
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Generate mock steps if none provided
  const studySteps: LearningStep[] = steps.length > 0 ? steps : [
    {
      stepNumber: 1,
      title: 'Introdução ao Conceito',
      subSteps: [
        'Leia a definição formal do conceito',
        'Identifique os elementos-chave',
        'Relacione com conhecimentos prévios',
      ],
      verification: 'Você consegue explicar o conceito em suas próprias palavras?',
      estimatedTime: '15 min',
      materials: ['Slides da aula', 'Livro-texto'],
      tips: 'Tente criar analogias com situações do dia-a-dia',
      learningObjective: 'Compreender a definição básica do conceito',
      commonMistakes: ['Confundir com conceitos similares', 'Memorizar sem entender'],
    },
    {
      stepNumber: 2,
      title: 'Aprofundamento Teórico',
      subSteps: [
        'Estude os teoremas relacionados',
        'Analise as propriedades importantes',
        'Entenda as limitações e casos especiais',
      ],
      verification: 'Você consegue identificar quando o conceito se aplica?',
      estimatedTime: '20 min',
      materials: ['Notas de aula', 'Exercícios resolvidos'],
      tips: 'Faça resumos e diagramas para visualizar as relações',
      learningObjective: 'Dominar os aspectos teóricos avançados',
      commonMistakes: ['Pular etapas na demonstração', 'Ignorar casos limite'],
    },
    {
      stepNumber: 3,
      title: 'Prática Guiada',
      subSteps: [
        'Resolva os exercícios de exemplo',
        'Compare com as soluções fornecidas',
        'Identifique padrões de resolução',
      ],
      verification: 'Você consegue resolver exercícios básicos sem consulta?',
      estimatedTime: '25 min',
      materials: ['Lista de exercícios', 'Calculadora'],
      tips: 'Comece pelos exercícios mais simples e aumente gradualmente',
      learningObjective: 'Aplicar o conceito em problemas práticos',
      commonMistakes: ['Pular etapas do cálculo', 'Não verificar o resultado'],
    },
    {
      stepNumber: 4,
      title: 'Verificação Final',
      subSteps: [
        'Revise os pontos principais',
        'Resolva o problema desafio',
        'Auto-avalie seu entendimento',
      ],
      verification: 'Você se sente confiante para usar este conceito em provas?',
      estimatedTime: '15 min',
      materials: ['Resumo pessoal', 'Questões de provas anteriores'],
      tips: 'Ensine o conceito para alguém ou explique em voz alta',
      learningObjective: 'Consolidar o aprendizado',
      commonMistakes: ['Confiar demais na memória', 'Não revisar regularmente'],
    },
  ];

  const currentStep = studySteps[currentStepIndex];
  const totalSteps = studySteps.length;
  const progress = (completedSteps.length / totalSteps) * 100;

  // Generate quiz questions from the learning steps
  const quizQuestions = useMemo(() => {
    const questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }> = [];

    studySteps.forEach((step, index) => {
      // Create a question from the verification
      if (step.verification) {
        questions.push({
          id: `q-verify-${index}`,
          question: step.verification.endsWith('?') ? step.verification : `${step.verification}?`,
          options: [
            'Sim, completamente',
            'Parcialmente - preciso revisar',
            'Tenho dúvidas sobre isso',
            'Não compreendi ainda',
          ],
          correctIndex: 0,
          explanation: `Excelente! O objetivo "${step.learningObjective}" foi alcançado. Continue praticando para consolidar o conhecimento.`,
        });
      }

      // Create a question about common mistakes
      if (step.commonMistakes && step.commonMistakes.length > 0) {
        questions.push({
          id: `q-mistake-${index}`,
          question: `Qual destes é um erro comum ao estudar "${step.title}"?`,
          options: [
            step.commonMistakes[0],
            'Praticar demais',
            'Fazer muitos exercícios',
            'Revisar com frequência',
          ],
          correctIndex: 0,
          explanation: `Correto! "${step.commonMistakes[0]}" é um erro comum. ${step.tips}`,
        });
      }
    });

    // Limit to 5 questions max
    return questions.slice(0, 5);
  }, [studySteps]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyConfig = () => {
    switch (difficulty) {
      case 'beginner':
        return { color: currentTheme.colors.success, label: 'Iniciante', icon: '🟢' };
      case 'intermediate':
        return { color: currentTheme.colors.warning, label: 'Intermediário', icon: '🟡' };
      case 'advanced':
        return { color: currentTheme.colors.error, label: 'Avançado', icon: '🔴' };
      default:
        return { color: currentTheme.colors.textSecondary, label: 'N/A', icon: '⚪' };
    }
  };

  const difficultyConfig = getDifficultyConfig();

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps([...completedSteps, currentStepIndex]);
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // All steps completed - transition to quiz if there are questions
      if (quizQuestions.length > 0) {
        setStudyPhase('quiz');
      } else {
        setShowCompleteModal(true);
      }
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore(score);
    setQuizTotal(total);
    setStudyPhase('complete');
    setShowCompleteModal(true);
  };

  const handleSkipQuiz = () => {
    setQuizScore(0);
    setQuizTotal(quizQuestions.length);
    setStudyPhase('complete');
    setShowCompleteModal(true);
  };

  const handleFinalComplete = () => {
    const timeSpentMinutes = Math.floor((Date.now() - startTime) / 60000);

    // Calculate performance including quiz results
    const stepsPerformance = completedSteps.length / totalSteps;
    const quizPerformance = quizTotal > 0 ? quizScore / quizTotal : 1;
    const performance = Math.min(1, (stepsPerformance * 0.6) + (quizPerformance * 0.4));

    // Calculate XP
    const mockSkill = {
      id: skillId,
      name: skillName,
      description: skillDescription,
      atomicExpansion: { steps: studySteps, practicalExample, finalVerifications: [], assessmentCriteria: [], crossCurricularConnections: [], realWorldApplication: '' },
      estimatedTime,
      difficulty,
      status: 'in_progress' as const,
      prerequisites: [],
    };

    const xpEarned = XPSystem.calculateTotalXPReward(
      mockSkill,
      performance,
      streak,
      false,
      timeSpentMinutes
    );

    onComplete(xpEarned, performance * 100);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: currentTheme.colors.background,
        padding: '20px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: currentTheme.colors.surface,
          borderRadius: '12px',
          border: `1px solid ${currentTheme.colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button onClick={() => setShowExitModal(true)} variant="secondary" size="small">
            ← Sair
          </Button>
          <div>
            <Text variant="heading" size="lg" color={currentTheme.colors.text}>
              {skillName}
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span>{difficultyConfig.icon}</span>
              <Text variant="caption" color={difficultyConfig.color}>
                {difficultyConfig.label}
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                • {estimatedTime}
              </Text>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Timer */}
          <div style={{ textAlign: 'center' }}>
            <Text variant="heading" size="xl" color={currentTheme.colors.primary}>
              {formatTime(elapsedTime)}
            </Text>
            <Text variant="caption" color={currentTheme.colors.textSecondary}>
              Tempo
            </Text>
          </div>

          {/* Progress */}
          <div style={{ textAlign: 'center', minWidth: '100px' }}>
            <Text variant="heading" size="xl" color={currentTheme.colors.success}>
              {completedSteps.length}/{totalSteps}
            </Text>
            <Text variant="caption" color={currentTheme.colors.textSecondary}>
              Passos
            </Text>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        value={studyPhase === 'quiz' ? totalSteps : completedSteps.length}
        maxValue={totalSteps}
        label={studyPhase === 'quiz' ? 'Quiz de Verificação' : `Progresso: ${progress.toFixed(0)}%`}
        variant={studyPhase === 'quiz' ? 'primary' : 'success'}
        size="medium"
        style={{ marginBottom: '24px' }}
      />

      {/* Quiz Phase */}
      {studyPhase === 'quiz' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <Text variant="heading" size="xl" color={currentTheme.colors.primary} glow>
              Quiz de Verificação
            </Text>
            <Text variant="body" color={currentTheme.colors.textSecondary}>
              Teste seu conhecimento sobre "{skillName}"
            </Text>
          </div>
          <Quiz
            questions={quizQuestions}
            onComplete={handleQuizComplete}
            onExit={handleSkipQuiz}
            theme={currentTheme}
          />
        </div>
      )}

      {/* Learning Phase - Step Navigation */}
      {studyPhase === 'learning' && (
        <>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          padding: '8px 0',
        }}
      >
        {studySteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStepIndex;

          return (
            <button
              key={index}
              onClick={() => setCurrentStepIndex(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: isCurrent
                  ? currentTheme.colors.primary
                  : isCompleted
                    ? currentTheme.colors.success + '20'
                    : currentTheme.colors.surface,
                border: `2px solid ${isCurrent
                  ? currentTheme.colors.primary
                  : isCompleted
                    ? currentTheme.colors.success
                    : currentTheme.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted
                    ? currentTheme.colors.success
                    : currentTheme.colors.border,
                  color: currentTheme.colors.background,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </span>
              <span
                style={{
                  fontFamily: currentTheme.fonts.secondary,
                  fontSize: '0.875rem',
                  color: isCurrent
                    ? currentTheme.colors.background
                    : currentTheme.colors.text,
                }}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Step Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main Content */}
        <div>
          <Card>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                  }}
                >
                  {currentStep.stepNumber}
                </div>
                <div>
                  <Text variant="heading" size="xl" color={currentTheme.colors.text}>
                    {currentStep.title}
                  </Text>
                  <Text variant="caption" color={currentTheme.colors.textSecondary}>
                    Tempo estimado: {currentStep.estimatedTime}
                  </Text>
                </div>
              </div>

              {/* Learning Objective */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: currentTheme.colors.primary + '10',
                  borderLeft: `4px solid ${currentTheme.colors.primary}`,
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '24px',
                }}
              >
                <Text variant="caption" color={currentTheme.colors.primary} style={{ fontWeight: 'bold' }}>
                  Objetivo de Aprendizagem
                </Text>
                <Text variant="body" color={currentTheme.colors.text}>
                  {currentStep.learningObjective}
                </Text>
              </div>

              {/* Sub-steps */}
              <Text variant="heading" size="md" color={currentTheme.colors.text} style={{ marginBottom: '12px' }}>
                Atividades:
              </Text>
              <ul style={{ margin: 0, paddingLeft: '24px' }}>
                {currentStep.subSteps.map((subStep, index) => (
                  <li
                    key={index}
                    style={{
                      fontFamily: currentTheme.fonts.secondary,
                      color: currentTheme.colors.text,
                      marginBottom: '8px',
                      lineHeight: 1.6,
                    }}
                  >
                    {subStep}
                  </li>
                ))}
              </ul>
            </div>

            {/* Verification Question */}
            <div
              style={{
                padding: '16px',
                backgroundColor: currentTheme.colors.warning + '10',
                border: `1px solid ${currentTheme.colors.warning}`,
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <Text variant="caption" color={currentTheme.colors.warning} style={{ fontWeight: 'bold' }}>
                Auto-verificação
              </Text>
              <Text variant="body" color={currentTheme.colors.text}>
                {currentStep.verification}
              </Text>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {currentStepIndex > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                >
                  ← Anterior
                </Button>
              )}
              <Button variant="primary" onClick={handleStepComplete}>
                {completedSteps.includes(currentStepIndex) ? 'Revisado' : 'Marcar como Concluído'} →
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tips */}
          <Card title="💡 Dicas">
            <Text variant="body" color={currentTheme.colors.text}>
              {currentStep.tips}
            </Text>
          </Card>

          {/* Materials */}
          <Card title="📚 Materiais">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {currentStep.materials.map((material, index) => (
                <li
                  key={index}
                  style={{
                    fontFamily: currentTheme.fonts.secondary,
                    fontSize: '0.875rem',
                    color: currentTheme.colors.textSecondary,
                    marginBottom: '4px',
                  }}
                >
                  {material}
                </li>
              ))}
            </ul>
          </Card>

          {/* Common Mistakes */}
          <Card title="⚠️ Erros Comuns">
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {currentStep.commonMistakes.map((mistake, index) => (
                <li
                  key={index}
                  style={{
                    fontFamily: currentTheme.fonts.secondary,
                    fontSize: '0.875rem',
                    color: currentTheme.colors.error,
                    marginBottom: '4px',
                  }}
                >
                  {mistake}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      </>
      )}

      {/* Exit Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Sair do Modo de Estudo?"
        size="small"
      >
        <Text variant="body" color={currentTheme.colors.text}>
          Seu progresso nesta sessão será perdido. Tem certeza que deseja sair?
        </Text>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowExitModal(false)}>
            Continuar Estudando
          </Button>
          <Button variant="error" onClick={onExit}>
            Sair
          </Button>
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Parabéns! 🎉"
        size="medium"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏆</div>
          <Text variant="heading" size="xl" color={currentTheme.colors.success}>
            Habilidade Concluída!
          </Text>
          <Text variant="body" color={currentTheme.colors.textSecondary} style={{ marginTop: '8px' }}>
            Você completou todos os passos de "{skillName}"
          </Text>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: quizTotal > 0 ? '1fr 1fr 1fr' : '1fr 1fr',
              gap: '16px',
              margin: '24px 0',
            }}
          >
            <div
              style={{
                padding: '16px',
                backgroundColor: currentTheme.colors.surface,
                borderRadius: '8px',
              }}
            >
              <Text variant="heading" size="lg" color={currentTheme.colors.primary}>
                {formatTime(elapsedTime)}
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                Tempo Total
              </Text>
            </div>
            <div
              style={{
                padding: '16px',
                backgroundColor: currentTheme.colors.surface,
                borderRadius: '8px',
              }}
            >
              <Text variant="heading" size="lg" color={currentTheme.colors.success}>
                {completedSteps.length}/{totalSteps}
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                Passos Completos
              </Text>
            </div>
            {quizTotal > 0 && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: currentTheme.colors.surface,
                  borderRadius: '8px',
                }}
              >
                <Text variant="heading" size="lg" color={quizScore / quizTotal >= 0.7 ? currentTheme.colors.success : currentTheme.colors.warning}>
                  {quizScore}/{quizTotal}
                </Text>
                <Text variant="caption" color={currentTheme.colors.textSecondary}>
                  Quiz
                </Text>
              </div>
            )}
          </div>

          <Button variant="primary" size="large" onClick={handleFinalComplete}>
            Receber Recompensa
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default StudyModePage;
