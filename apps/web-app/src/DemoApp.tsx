import React, { useState } from 'react';
import {
  ThemeProvider,
  useTheme,
  Button,
  ProgressBar,
  RankBadge,
  Card,
  Text,
  Modal,
  NotificationContainer,
} from '@ita-rp/ui-components';
import {
  XPSystem,
  RankSystem,
} from '@ita-rp/game-logic';
import { Rank } from '@ita-rp/shared-types';

// Dados de exemplo
const mockSkill = {
  id: 'skill-1',
  name: 'Introdução à Algoritmos',
  description: 'Aprenda os conceitos básicos de algoritmos',
  atomicExpansion: {
    steps: [],
    practicalExample: 'Implementar um bubble sort',
    finalVerifications: ['Testar com diferentes entradas'],
    assessmentCriteria: ['Correção', 'Eficiência'],
    crossCurricularConnections: ['Matemática', 'Programação'],
    realWorldApplication: 'Ordenação de listas em aplicações',
  },
  estimatedTime: '2 horas',
  difficulty: 'beginner' as const,
  status: 'not_started' as const,
  prerequisites: [],
};

const DemoAppContent: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [xp, setXp] = useState(750);
  const [completedSkills, setCompletedSkills] = useState(12);
  const [streak, setStreak] = useState(7);

  const currentRank: Rank = RankSystem.getCurrentRank(XPSystem.calculateLevel(xp));
  const levelProgress = XPSystem.calculateLevelProgress(xp);

  // Adicionar notificações de exemplo
  const addNotification = (type: any, title: string, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message }]);
  };

  const handleCompleteSkill = () => {
    const newXPReward = XPSystem.calculateTotalXPReward(
      mockSkill,
      0.9, // 90% performance
      streak,
      completedSkills === 0,
      120 // 2 horas em minutos
    );

    setXp(prev => prev + newXPReward);
    setCompletedSkills(prev => prev + 1);
    addNotification('success', 'Habilidade Completa!', `+${newXPReward} XP ganhos`);
  };

  const handleLevelUp = () => {
    const newXP = XPSystem.calculateXPForLevel(XPSystem.calculateLevel(xp) + 1);
    setXp(newXP);
    addNotification('success', 'Level Up!', `Você alcançou o nível ${XPSystem.calculateLevel(newXP)}`);
  };

  const handleStreakIncrease = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    addNotification('info', 'Streak Atualizado', `${newStreak} dias consecutivos!`);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text,
      fontFamily: currentTheme.fonts.secondary,
      padding: '20px',
    }}>
      {/* Header */}
      <header style={{
        marginBottom: '40px',
        textAlign: 'center',
      }}>
        <Text variant="heading" size="3xl" color={currentTheme.colors.primary} glow>
          ITA RP Game - Demonstração
        </Text>
        <Text variant="body" size="lg" color={currentTheme.colors.textSecondary}>
          Sistema Educacional com Gamificação Cyberpunk
        </Text>
      </header>

      {/* Theme Selector */}
      <Card title="Configurações de Tema" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant={currentTheme.id === 'neonBlue' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setTheme('neonBlue')}
          >
            Neon Blue
          </Button>
          <Button
            variant={currentTheme.id === 'matrixGreen' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setTheme('matrixGreen')}
          >
            Matrix Green
          </Button>
          <Button
            variant={currentTheme.id === 'cyberPurple' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setTheme('cyberPurple')}
          >
            Cyber Purple
          </Button>
          <Button
            variant={currentTheme.id === 'retroOrange' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setTheme('retroOrange')}
          >
            Retro Orange
          </Button>
        </div>
      </Card>

      {/* Player Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <Card title="Status do Jogador">
          <Text variant="body">
            <strong>Nível:</strong> {XPSystem.calculateLevel(xp)}<br />
            <strong>XP Total:</strong> {xp}<br />
            <strong>Habilidades Completas:</strong> {completedSkills}<br />
            <strong>Streak Atual:</strong> {streak} dias
          </Text>
        </Card>

        <Card title="Patente Atual">
          <RankBadge rank={currentRank} size="large" showProgress currentProgress={levelProgress * 100} />
          <Text variant="caption" style={{ marginTop: '10px' }}>
            Próxima patente no nível {currentRank.level + 1}
          </Text>
        </Card>
      </div>

      {/* Progress Bars */}
      <Card title="Progresso" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <ProgressBar
            value={xp}
            maxValue={XPSystem.calculateXPForLevel(XPSystem.calculateLevel(xp) + 1)}
            label={`Nível ${XPSystem.calculateLevel(xp)} - XP`}
            variant="primary"
            size="large"
          />
          <ProgressBar
            value={streak}
            maxValue={30}
            label="Streak de Estudos (dias)"
            variant="success"
            size="medium"
          />
          <ProgressBar
            value={completedSkills}
            maxValue={100}
            label="Habilidades Completas"
            variant="accent"
            size="medium"
          />
        </div>
      </Card>

      {/* Actions */}
      <Card title="Ações de Demonstração">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button onClick={handleCompleteSkill}>
            Completar Habilidade
          </Button>
          <Button onClick={handleLevelUp} variant="accent">
            Level Up
          </Button>
          <Button onClick={handleStreakIncrease} variant="success">
            Aumentar Streak
          </Button>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary">
            Abrir Modal
          </Button>
          <Button onClick={() => addNotification('info', 'Teste', 'Esta é uma notificação de teste')} variant="warning">
            Adicionar Notificação
          </Button>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal de Demonstração"
        size="medium"
      >
        <Text variant="body">
          Este é um modal demonstrando os componentes UI do ITA RP Game.
          Todos os componentes seguem o design system cyberpunk com temas
          personalizáveis e animações suaves.
        </Text>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <Button onClick={() => setIsModalOpen(false)}>
            Fechar
          </Button>
        </div>
      </Modal>

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
        position="top-right"
      />
    </div>
  );
};

export const DemoApp: React.FC = () => {
  return (
    <ThemeProvider>
      <DemoAppContent />
    </ThemeProvider>
  );
};

export default DemoApp;