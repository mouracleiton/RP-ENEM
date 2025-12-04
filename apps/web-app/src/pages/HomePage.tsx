import React, { useState, useEffect } from 'react';
import {
  useTheme,
  Card,
  Text,
  Button,
  ProgressBar,
  RankBadge,
  AnimatedBackground,
  GlitchEffect,
  type Theme,
} from '@ita-rp/ui-components';
import { useGameStore, useSoundEffects, RankSystem } from '@ita-rp/game-logic';
import type { Rank } from '@ita-rp/shared-types';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onStartJourney: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onStartJourney,
}) => {
  const { currentTheme } = useTheme();
  const { sounds } = useSoundEffects();
  const store = useGameStore();

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const xp = store.player.xp;
  const level = store.player.level;
  const streak = store.player.currentStreak;
  const completedSkills = store.player.completedSkills.length;
  const playerName = store.player.name;

  // Animation sequence on mount
  useEffect(() => {
    const timer1 = setTimeout(() => setIsLoaded(true), 300);
    const timer2 = setTimeout(() => setShowContent(true), 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Rotating text animation
  const rotatingTexts = [
    "Transforme seu conhecimento",
    "Supere desafios complexos",
    "Desenvolva habilidades técnicas",
    "Alcance a excelência acadêmica",
    "Junte-se à elite do ITA"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentRank: Rank = RankSystem.getCurrentRank(level);

  const handleStartClick = () => {
    sounds.click();
    onStartJourney();
  };

  const handleQuickAction = (page: string) => {
    sounds.click();
    onNavigate(page);
  };

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.surface} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: `4px solid ${currentTheme.colors.border}`,
          borderTop: `4px solid ${currentTheme.colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.surface} 50%, ${currentTheme.colors.primary}20 100%)`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background */}
      <AnimatedBackground variant="particles" />

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Hero Section */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px',
          animation: showContent ? 'fadeInUp 1s ease-out' : 'none',
        }}>
          {/* ITA Emblem */}
          <div style={{
            width: '120px',
            height: '120px',
            marginBottom: '30px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            boxShadow: `0 10px 30px ${currentTheme.colors.primary}40`,
            animation: 'pulse 2s infinite',
          }}>
            🎯
          </div>

          {/* Main Title */}
          <GlitchEffect
            intensity="subtle"
            style={{
              marginBottom: '16px',
            }}
          >
            <Text
              variant="heading"
              size="3xl"
              color={currentTheme.colors.primary}
              glow
              style={{
                fontWeight: 'bold',
                textShadow: `0 0 20px ${currentTheme.colors.primary}50`,
              }}
            >
              Instituto Tecnológico de Aeronáutica
            </Text>
          </GlitchEffect>

          {/* Subtitle */}
          <Text
            variant="heading"
            size="xl"
            color={currentTheme.colors.accent}
            style={{
              marginBottom: '20px',
              fontWeight: '300',
            }}
          >
            Role Play Learning Experience
          </Text>

          {/* Rotating Text */}
          <div style={{
            height: '30px',
            marginBottom: '40px',
          }}>
            <Text
              variant="body"
              size="lg"
              color={currentTheme.colors.textSecondary}
              style={{
                opacity: 0.9,
                fontStyle: 'italic',
                animation: 'fadeIn 0.5s ease-in-out',
              }}
            >
              {rotatingTexts[currentTextIndex]}
            </Text>
          </div>

          {/* Player Welcome */}
          {playerName && (
            <Card style={{
              marginBottom: '40px',
              background: `${currentTheme.colors.surface}90`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${currentTheme.colors.primary}30`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                justifyContent: 'center',
              }}>
                <RankBadge rank={currentRank} size="medium" />
                <div>
                  <Text variant="body" color={currentTheme.colors.textSecondary}>
                    Bem-vindo(a), Cadete
                  </Text>
                  <Text variant="heading" size="lg" color={currentTheme.colors.text}>
                    {playerName}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text variant="heading" size="xl" color={currentTheme.colors.primary}>
                    Nível {level}
                  </Text>
                  <Text variant="caption" color={currentTheme.colors.textSecondary}>
                    {xp.toLocaleString()} XP
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Main Action Button */}
          <Button
            onClick={handleStartClick}
            variant="primary"
            size="large"
            style={{
              fontSize: '1.2rem',
              padding: '16px 48px',
              marginBottom: '40px',
              background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
              boxShadow: `0 8px 25px ${currentTheme.colors.primary}40`,
            }}
          >
            🚀 Iniciar Jornada
          </Button>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            width: '100%',
            maxWidth: '600px',
            marginBottom: '40px',
          }}>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: `${currentTheme.colors.surface}80`,
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: `1px solid ${currentTheme.colors.border}50`,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔥</div>
              <Text variant="heading" size="lg" color={currentTheme.colors.warning}>
                {streak}
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                Dias Seguidos
              </Text>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: `${currentTheme.colors.surface}80`,
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: `1px solid ${currentTheme.colors.border}50`,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📚</div>
              <Text variant="heading" size="lg" color={currentTheme.colors.primary}>
                {completedSkills}
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                Habilidades
              </Text>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: `${currentTheme.colors.surface}80`,
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: `1px solid ${currentTheme.colors.border}50`,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚡</div>
              <Text variant="heading" size="lg" color={currentTheme.colors.accent}>
                {xp.toLocaleString()}
              </Text>
              <Text variant="caption" color={currentTheme.colors.textSecondary}>
                XP Total
              </Text>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <Card style={{
          background: `${currentTheme.colors.surface}95`,
          backdropFilter: 'blur(15px)',
          border: `1px solid ${currentTheme.colors.primary}30`,
        }}>
          <Text
            variant="heading"
            size="lg"
            color={currentTheme.colors.text}
            style={{ marginBottom: '20px', textAlign: 'center' }}
          >
            Acesso Rápido
          </Text>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <Button
              onClick={() => handleQuickAction('disciplines')}
              variant="secondary"
              size="medium"
            >
              📖 Disciplinas
            </Button>

            <Button
              onClick={() => handleQuickAction('skilltree')}
              variant="secondary"
              size="medium"
            >
              🌳 Árvore de Habilidades
            </Button>

            <Button
              onClick={() => handleQuickAction('challenges')}
              variant="secondary"
              size="medium"
            >
              🎯 Missões Diárias
            </Button>

                      </div>
        </Card>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          opacity: 0.7,
        }}>
          <Text variant="caption" color={currentTheme.colors.textSecondary}>
            © 2025 ITA Role Play - Desenvolvido com ❤️ para a comunidade ITA
          </Text>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;