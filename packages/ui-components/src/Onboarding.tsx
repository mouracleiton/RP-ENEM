/**
 * Onboarding Component
 * Interactive tutorial for new players
 */

import React, { useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight?: string; // CSS selector or element ID to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    type: 'next' | 'skip' | 'complete' | 'navigate';
    target?: string;
  };
}

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  playerName?: string;
  steps?: OnboardingStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao ITA RP Game!',
    description: 'Prepare-se para uma jornada épica de aprendizado. Você está prestes a se tornar um cadete do ITA, dominando todas as disciplinas necessárias para a aprovação.',
    icon: '🚀',
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Seu Dashboard',
    description: 'Aqui você verá seu progresso geral: XP, nível, streak de estudos e estatísticas. Acompanhe sua evolução diariamente!',
    icon: '🏠',
    highlight: 'dashboard',
    position: 'bottom',
  },
  {
    id: 'disciplines',
    title: 'Disciplinas',
    description: 'Explore as 12 disciplinas do ITA: Cálculo, Física, Química, Álgebra Linear, Programação e muito mais. Cada uma tem dezenas de habilidades para dominar.',
    icon: '📚',
    highlight: 'disciplines',
    position: 'bottom',
  },
  {
    id: 'skills',
    title: 'Habilidades e Skills',
    description: 'Cada disciplina possui habilidades organizadas em árvore. Complete as básicas para desbloquear as avançadas. Quanto mais difícil, mais XP você ganha!',
    icon: '🌳',
    highlight: 'skilltree',
    position: 'bottom',
  },
  {
    id: 'study',
    title: 'Modo de Estudo',
    description: 'Ao iniciar uma habilidade, você entrará no modo de estudo com lições, exemplos práticos e quizzes para testar seu conhecimento.',
    icon: '📖',
    position: 'center',
  },
  {
    id: 'xp',
    title: 'Sistema de XP e Níveis',
    description: 'Ganhe XP completando habilidades, acertando quizzes e mantendo seu streak. Suba de nível para desbloquear novas patentes e recompensas!',
    icon: '⚡',
    position: 'center',
  },
  {
    id: 'streak',
    title: 'Streak de Estudos',
    description: 'Estude todos os dias para manter seu streak! Quanto maior seu streak, mais bônus de XP você ganha. Não quebre a sequência!',
    icon: '🔥',
    position: 'center',
  },
  {
    id: 'challenges',
    title: 'Desafios Diários',
    description: 'Complete missões diárias para ganhar XP extra. As missões renovam todos os dias às 00:00 - não perca!',
    icon: '🎯',
    position: 'center',
  },
  {
    id: 'achievements',
    title: 'Conquistas',
    description: 'Desbloqueie conquistas especiais por marcos importantes: primeiro nível, primeira semana de streak, 100 habilidades completadas e muito mais.',
    icon: '🏆',
    highlight: 'achievements',
    position: 'bottom',
  },
  {
    id: 'ranks',
    title: 'Sistema de Patentes',
    description: 'Comece como Aspirante e evolua até Marechal! Cada patente requer um nível mínimo e mostra seu progresso na jornada ITA.',
    icon: '🎖️',
    position: 'center',
  },
  {
    id: 'ready',
    title: 'Você está pronto!',
    description: 'Sua missão: dominar todas as disciplinas do ITA. Comece explorando o dashboard e escolha sua primeira habilidade. Boa sorte, cadete!',
    icon: '🎓',
    position: 'center',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({
  isOpen,
  onComplete,
  onSkip,
  playerName = 'Cadete',
  steps = defaultSteps,
  currentStep: controlledStep,
  onStepChange,
}) => {
  const [internalStep, setInternalStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStep = controlledStep ?? internalStep;
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNext = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      if (isLastStep) {
        onComplete();
      } else {
        const newStep = currentStep + 1;
        if (onStepChange) {
          onStepChange(newStep);
        } else {
          setInternalStep(newStep);
        }
      }
      setIsAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (isAnimating || isFirstStep) return;

    setIsAnimating(true);
    setTimeout(() => {
      const newStep = currentStep - 1;
      if (onStepChange) {
        onStepChange(newStep);
      } else {
        setInternalStep(newStep);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  if (!isOpen || !step) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Animated background particles */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: `rgba(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, 255, ${0.3 + Math.random() * 0.4})`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          maxWidth: '600px',
          width: '90%',
          margin: '20px',
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? 'scale(0.95) translateY(20px)' : 'scale(1) translateY(0)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4caf50, #81c784)',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(30, 30, 60, 0.95), rgba(20, 20, 40, 0.98))',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(76, 175, 80, 0.1)',
          }}
        >
          {/* Icon */}
          <div
            style={{
              fontSize: '64px',
              textAlign: 'center',
              marginBottom: '24px',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            {step.icon}
          </div>

          {/* Welcome message for first step */}
          {isFirstStep && (
            <div
              style={{
                textAlign: 'center',
                marginBottom: '16px',
                color: '#81c784',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              Olá, {playerName}!
            </div>
          )}

          {/* Title */}
          <h2
            style={{
              margin: '0 0 16px 0',
              textAlign: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            }}
          >
            {step.title}
          </h2>

          {/* Description */}
          <p
            style={{
              margin: '0 0 32px 0',
              textAlign: 'center',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {step.description}
          </p>

          {/* Step dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '32px',
            }}
          >
            {steps.map((_, index) => (
              <div
                key={index}
                style={{
                  width: index === currentStep ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: index === currentStep
                    ? 'linear-gradient(90deg, #4caf50, #81c784)'
                    : index < currentStep
                    ? '#4caf50'
                    : 'rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}
          >
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                ← Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                padding: '14px 36px',
                borderRadius: '12px',
                border: 'none',
                background: isLastStep
                  ? 'linear-gradient(135deg, #4caf50, #81c784)'
                  : 'linear-gradient(135deg, #2196f3, #64b5f6)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isLastStep
                  ? '0 0 30px rgba(76, 175, 80, 0.4)'
                  : '0 0 30px rgba(33, 150, 243, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = isLastStep
                  ? '0 0 40px rgba(76, 175, 80, 0.6)'
                  : '0 0 40px rgba(33, 150, 243, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = isLastStep
                  ? '0 0 30px rgba(76, 175, 80, 0.4)'
                  : '0 0 30px rgba(33, 150, 243, 0.4)';
              }}
            >
              {isLastStep ? 'Começar! 🚀' : 'Próximo →'}
            </button>
          </div>

          {/* Skip button */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              style={{
                display: 'block',
                margin: '20px auto 0',
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
              }}
            >
              Pular tutorial
            </button>
          )}
        </div>

        {/* Tips at bottom */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '12px',
            }}
          >
            💡 Dica: Use as setas do teclado para navegar
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  );
};

export default Onboarding;
