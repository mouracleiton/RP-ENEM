import React, { useState, useEffect } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, totalQuestions: number, answers: boolean[]) => void;
  onExit?: () => void;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      success: string;
      error: string;
      warning: string;
      border: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
  };
}

export const Quiz: React.FC<QuizProps> = ({
  questions,
  onComplete,
  onExit,
  theme,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    setAnswers([...answers, isCorrect]);
    setIsAnswered(true);

    if (currentQuestion.explanation) {
      setShowExplanation(true);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const finalAnswers = [...answers];
      const score = finalAnswers.filter(Boolean).length;
      onComplete(score, questions.length, finalAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    }
  };

  const getOptionStyle = (index: number) => {
    const baseStyle: React.CSSProperties = {
      padding: '16px 20px',
      marginBottom: '12px',
      borderRadius: '12px',
      cursor: isAnswered ? 'default' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: theme.fonts.secondary,
      fontSize: '1rem',
      border: '2px solid',
    };

    if (!isAnswered) {
      // Not answered yet
      if (selectedAnswer === index) {
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary + '20',
          borderColor: theme.colors.primary,
          color: theme.colors.text,
        };
      }
      return {
        ...baseStyle,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        color: theme.colors.text,
      };
    }

    // After answer is confirmed
    if (index === currentQuestion.correctIndex) {
      return {
        ...baseStyle,
        backgroundColor: theme.colors.success + '20',
        borderColor: theme.colors.success,
        color: theme.colors.success,
      };
    }
    if (selectedAnswer === index && index !== currentQuestion.correctIndex) {
      return {
        ...baseStyle,
        backgroundColor: theme.colors.error + '20',
        borderColor: theme.colors.error,
        color: theme.colors.error,
      };
    }
    return {
      ...baseStyle,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      color: theme.colors.textSecondary,
      opacity: 0.6,
    };
  };

  const getOptionIcon = (index: number) => {
    if (!isAnswered) {
      return selectedAnswer === index ? '◉' : '○';
    }
    if (index === currentQuestion.correctIndex) {
      return '✓';
    }
    if (selectedAnswer === index && index !== currentQuestion.correctIndex) {
      return '✗';
    }
    return '○';
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: theme.fonts.primary,
              fontSize: '0.875rem',
              color: theme.colors.primary,
              fontWeight: 'bold',
            }}
          >
            Questão {currentQuestionIndex + 1} de {questions.length}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.secondary,
              fontSize: '0.875rem',
              color: theme.colors.textSecondary,
            }}
          >
            Acertos: {answers.filter(Boolean).length}/{answers.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '6px',
          backgroundColor: theme.colors.surface,
          borderRadius: '3px',
          marginBottom: '24px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: theme.colors.primary,
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Question */}
      <div
        style={{
          marginBottom: '24px',
        }}
      >
        <h3
          style={{
            fontFamily: theme.fonts.primary,
            fontSize: '1.25rem',
            color: theme.colors.text,
            marginBottom: '8px',
            lineHeight: 1.4,
          }}
        >
          {currentQuestion.question}
        </h3>
      </div>

      {/* Options */}
      <div style={{ marginBottom: '24px' }}>
        {currentQuestion.options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleSelectAnswer(index)}
            style={getOptionStyle(index)}
          >
            <span
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {getOptionIcon(index)}
            </span>
            <span>{option}</span>
          </div>
        ))}
      </div>

      {/* Explanation */}
      {showExplanation && currentQuestion.explanation && (
        <div
          style={{
            padding: '16px',
            backgroundColor: isAnswered && selectedAnswer === currentQuestion.correctIndex
              ? theme.colors.success + '10'
              : theme.colors.warning + '10',
            borderRadius: '12px',
            marginBottom: '24px',
            borderLeft: `4px solid ${
              isAnswered && selectedAnswer === currentQuestion.correctIndex
                ? theme.colors.success
                : theme.colors.warning
            }`,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.primary,
              fontSize: '0.875rem',
              fontWeight: 'bold',
              color: isAnswered && selectedAnswer === currentQuestion.correctIndex
                ? theme.colors.success
                : theme.colors.warning,
              display: 'block',
              marginBottom: '8px',
            }}
          >
            {selectedAnswer === currentQuestion.correctIndex ? 'Correto!' : 'Explicação'}
          </span>
          <p
            style={{
              fontFamily: theme.fonts.secondary,
              fontSize: '0.9rem',
              color: theme.colors.text,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {onExit && (
          <button
            onClick={onExit}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: `2px solid ${theme.colors.border}`,
              borderRadius: '8px',
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.secondary,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Pular Quiz
          </button>
        )}

        {!isAnswered ? (
          <button
            onClick={handleConfirmAnswer}
            disabled={selectedAnswer === null}
            style={{
              padding: '12px 32px',
              backgroundColor: selectedAnswer !== null ? theme.colors.primary : theme.colors.surface,
              border: 'none',
              borderRadius: '8px',
              color: selectedAnswer !== null ? theme.colors.background : theme.colors.textSecondary,
              fontFamily: theme.fonts.secondary,
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              marginLeft: 'auto',
            }}
          >
            Confirmar
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            style={{
              padding: '12px 32px',
              backgroundColor: theme.colors.primary,
              border: 'none',
              borderRadius: '8px',
              color: theme.colors.background,
              fontFamily: theme.fonts.secondary,
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginLeft: 'auto',
            }}
          >
            {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'} →
          </button>
        )}
      </div>
    </div>
  );
};

// Helper function to generate quiz questions from skill verification
export const generateQuizFromSkill = (
  skillName: string,
  verifications: string[],
  _commonMistakes?: string[]
): QuizQuestion[] => {
  // Generate basic comprehension questions from verifications
  return verifications.slice(0, 3).map((verification, index) => ({
    id: `q-${index}`,
    question: verification.endsWith('?') ? verification : `${verification}?`,
    options: [
      'Sim, completamente',
      'Parcialmente',
      'Ainda tenho dúvidas',
      'Não compreendi',
    ],
    correctIndex: 0,
    explanation: `Continue praticando para dominar "${skillName}". A prática constante é fundamental!`,
  }));
};

export default Quiz;
