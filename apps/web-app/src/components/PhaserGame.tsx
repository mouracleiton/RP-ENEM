import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@ita-rp/core-engine';
import {
  MainMenuScene,
  StudyModeScene,
  ProgressViewScene,
  DisciplineSelectionScene,
} from '@ita-rp/core-engine';
import { SpecificSkill } from '@ita-rp/shared-types';
import { useGameStore } from '@ita-rp/game-logic';
import { curriculumService } from '@ita-rp/curriculum';

const PhaserGame: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { player, createPlayer, completeSkill, addXP } = useGameStore();

  useEffect(() => {
    const initializeGame = async () => {
      if (!gameContainerRef.current) return;

      try {
        // Initialize player if not exists
        if (!player.name || player.name === 'Cadete') {
          createPlayer('Novo Cadete');
        }

        // Load curriculum
        await curriculumService.loadCurriculum();

        // Create game engine
        const gameEngine = new GameEngine();
        gameEngineRef.current = gameEngine;

        // Initialize engine
        await gameEngine.initialize();

        // Create scenes
        const mainMenuScene = gameEngine.createScene({
          id: 'main-menu',
          name: 'Main Menu',
          type: 'menu',
        });

        const studyModeScene = gameEngine.createScene({
          id: 'study-mode',
          name: 'Study Mode',
          type: 'study',
        });

        const progressViewScene = gameEngine.createScene({
          id: 'progress-view',
          name: 'Progress View',
          type: 'progress',
        });

        const disciplineSelectionScene = gameEngine.createScene({
          id: 'discipline-selection',
          name: 'Discipline Selection',
          type: 'menu',
        });

        // Start with main menu
        await gameEngine.startScene('main-menu');

        // Setup event listeners
        setupEventListeners();

        setIsInitialized(true);
        console.log('Phaser game initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Phaser game:', error);
      }
    };

    initializeGame();

    return () => {
      // Cleanup
      if (gameEngineRef.current) {
        // Game cleanup would go here
      }
    };
  }, [player.name, createPlayer]);

  const setupEventListeners = () => {
    if (typeof window === 'undefined') return;

    // Handle menu actions
    const handleMenuAction = (event: CustomEvent) => {
      const { action } = event.detail;

      if (!gameEngineRef.current) return;

      switch (action) {
        case 'startStudy':
          // Navigate to discipline selection first
          gameEngineRef.current.startScene('discipline-selection');
          break;
        case 'progress':
          gameEngineRef.current.startScene('progress-view');
          break;
        case 'achievements':
          console.log('Achievements scene not implemented yet');
          break;
        case 'settings':
          console.log('Settings scene not implemented yet');
          break;
        case 'backToMenu':
          gameEngineRef.current.startScene('main-menu');
          break;
        case 'quit':
          console.log('Quit game');
          break;
      }
    };

    // Handle skill completion
    const handleSkillCompleted = (event: CustomEvent) => {
      const { skillId, skillName, timeSpent } = event.detail;
      console.log(`Skill completed: ${skillName} (${timeSpent}ms)`);

      // Update player progress, award XP, etc.
      completeSkill(skillId);
      addXP(Math.floor(timeSpent / 1000)); // 1 XP per second of study
    };

    window.addEventListener('menuAction', handleMenuAction as EventListener);
    window.addEventListener('skillCompleted', handleSkillCompleted as EventListener);

    return () => {
      window.removeEventListener('menuAction', handleMenuAction as EventListener);
      window.removeEventListener('skillCompleted', handleSkillCompleted as EventListener);
    };
  };

  const startStudyMode = (skill: SpecificSkill) => {
    if (!gameEngineRef.current) return;

    // Get study mode scene and start skill
    const studyScene = gameEngineRef.current
      .getScenes()
      .find(scene => scene.id === 'study-mode') as unknown as StudyModeScene;

    if (studyScene) {
      studyScene.startSkill(skill);
    }
  };

  return (
    <div className="phaser-game-container">
      <div
        ref={gameContainerRef}
        id="phaser-game-container"
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      />

      {!isInitialized && (
        <div className="loading-overlay">
          <div className="loading-text">CARREGANDO MOTOR DO JOGO...</div>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaserGame;
