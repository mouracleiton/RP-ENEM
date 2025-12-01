import { BaseScene } from '../GameEngine';
import { SpecificSkill, LearningStep } from '@ita-rp/shared-types';

export class StudyModeScene extends BaseScene {
  private currentSkill: SpecificSkill | null = null;
  private currentStepIndex = 0;
  private studyStartTime: number = 0;
  private stepStartTime: number = 0;

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Setup study mode UI
    this.setupStudyUI();
    
    // Setup input handlers
    this.setupInputHandlers();
    
    console.log('Study mode scene initialized');
  }

  private setupStudyUI(): void {
    if (!this.phaserScene) return;

    // Create background
    this.phaserScene.add.rectangle(
      this.phaserScene.cameras.main.width / 2,
      this.phaserScene.cameras.main.height / 2,
      this.phaserScene.cameras.main.width,
      this.phaserScene.cameras.main.height,
      0x0a0a0a
    );

    // Create title
    const title = this.phaserScene.add.text(
      this.phaserScene.cameras.main.width / 2,
      50,
      'MODO DE ESTUDO',
      {
        fontSize: '32px',
        fontFamily: 'Courier New',
        color: '#00f3ff',
        align: 'center'
      }
    ).setOrigin(0.5);

    // Create content area
    const contentY = 150;
    const contentHeight = this.phaserScene.cameras.main.height - 300;
    
    this.phaserScene.add.rectangle(
      this.phaserScene.cameras.main.width / 2,
      contentY + contentHeight / 2,
      this.phaserScene.cameras.main.width - 100,
      contentHeight,
      0x1a1a2e,
      0.8
    );

    // Create navigation buttons
    this.createNavigationButtons();
  }

  private createNavigationButtons(): void {
    const buttonY = this.phaserScene.cameras.main.height - 80;
    const buttonSpacing = 200;
    const centerX = this.phaserScene.cameras.main.width / 2;

    // Previous button
    const prevButton = this.phaserScene.add.text(
      centerX - buttonSpacing,
      buttonY,
      '◀ ANTERIOR',
      {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        backgroundColor: '#1a237e',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5).setInteractive();

    prevButton.on('pointerdown', () => {
      this.previousStep();
    });

    prevButton.on('pointerover', () => {
      prevButton.setStyle({ color: '#00f3ff' });
    });

    prevButton.on('pointerout', () => {
      prevButton.setStyle({ color: '#ffffff' });
    });

    // Next button
    const nextButton = this.phaserScene.add.text(
      centerX + buttonSpacing,
      buttonY,
      'PRÓXIMO ▶',
      {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        backgroundColor: '#1a237e',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5).setInteractive();

    nextButton.on('pointerdown', () => {
      this.nextStep();
    });

    nextButton.on('pointerover', () => {
      nextButton.setStyle({ color: '#00f3ff' });
    });

    nextButton.on('pointerout', () => {
      nextButton.setStyle({ color: '#ffffff' });
    });

    // Complete button
    const completeButton = this.phaserScene.add.text(
      centerX,
      buttonY,
      'CONCLUIR',
      {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        backgroundColor: '#00f3ff',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5).setInteractive();

    completeButton.on('pointerdown', () => {
      this.completeSkill();
    });

    completeButton.on('pointerover', () => {
      completeButton.setStyle({ backgroundColor: '#1a237e' });
    });

    completeButton.on('pointerout', () => {
      completeButton.setStyle({ backgroundColor: '#00f3ff' });
    });
  }

  private setupInputHandlers(): void {
    // Keyboard shortcuts
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (event) => {
        switch (event.key) {
          case 'ArrowLeft':
            this.previousStep();
            break;
          case 'ArrowRight':
            this.nextStep();
            break;
          case 'Enter':
            this.completeStep();
            break;
          case 'Escape':
            this.exitStudyMode();
            break;
        }
      });
    }
  }

  startSkill(skill: SpecificSkill): void {
    this.currentSkill = skill;
    this.currentStepIndex = 0;
    this.studyStartTime = Date.now();
    this.stepStartTime = Date.now();
    
    this.displayCurrentStep();
    console.log(`Started studying skill: ${skill.name}`);
  }

  private displayCurrentStep(): void {
    if (!this.currentSkill || !this.phaserScene) return;

    const step = this.currentSkill.atomicExpansion.steps[this.currentStepIndex];
    if (!step) return;

    // Clear previous content
    this.phaserScene.children.removeAll();
    this.setupStudyUI();

    // Display step content
    const contentY = 150;
    const centerX = this.phaserScene.cameras.main.width / 2;

    // Step title
    this.phaserScene.add.text(
      centerX,
      contentY,
      `PASSO ${step.stepNumber}: ${step.title}`,
      {
        fontSize: '24px',
        fontFamily: 'Courier New',
        color: '#00f3ff',
        align: 'center',
        wordWrap: { width: this.phaserScene.cameras.main.width - 120 }
      }
    ).setOrigin(0.5, 0);

    // Step description
    let descriptionY = contentY + 60;
    step.subSteps.forEach((subStep, index) => {
      this.phaserScene.add.text(
        60,
        descriptionY + (index * 30),
        `• ${subStep}`,
        {
          fontSize: '16px',
          fontFamily: 'Courier New',
          color: '#ffffff',
          wordWrap: { width: this.phaserScene.cameras.main.width - 120 }
        }
      );
    });

    // Tips
    const tipsY = contentY + 200;
    this.phaserScene.add.text(
      60,
      tipsY,
      `💡 DICA: ${step.tips}`,
      {
        fontSize: '14px',
        fontFamily: 'Courier New',
        color: '#ffff00',
        fontStyle: 'italic',
        wordWrap: { width: this.phaserScene.cameras.main.width - 120 }
      }
    );

    // Progress indicator
    const progressText = `${this.currentStepIndex + 1} / ${this.currentSkill.atomicExpansion.steps.length}`;
    this.phaserScene.add.text(
      centerX,
      100,
      progressText,
      {
        fontSize: '18px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  private previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.displayCurrentStep();
    }
  }

  private nextStep(): void {
    if (this.currentSkill && this.currentStepIndex < this.currentSkill.atomicExpansion.steps.length - 1) {
      this.currentStepIndex++;
      this.displayCurrentStep();
    }
  }

  private completeStep(): void {
    // Log step completion time
    const stepTime = Date.now() - this.stepStartTime;
    console.log(`Step completed in ${stepTime}ms`);
    
    this.stepStartTime = Date.now();
    
    if (this.currentSkill && this.currentStepIndex < this.currentSkill.atomicExpansion.steps.length - 1) {
      this.nextStep();
    } else {
      this.completeSkill();
    }
  }

  private completeSkill(): void {
    if (!this.currentSkill) return;

    const totalTime = Date.now() - this.studyStartTime;
    console.log(`Skill "${this.currentSkill.name}" completed in ${totalTime}ms`);
    
    // Emit skill completion event
    this.emitSkillCompleted(this.currentSkill, totalTime);
    
    // Exit study mode
    this.exitStudyMode();
  }

  private exitStudyMode(): void {
    console.log('Exiting study mode');
    // This would be handled by the main game controller
  }

  private emitSkillCompleted(skill: SpecificSkill, timeSpent: number): void {
    const event = new CustomEvent('skillCompleted', {
      detail: {
        skillId: skill.id,
        skillName: skill.name,
        timeSpent,
        completedAt: new Date()
      }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  update(deltaTime: number): void {
    // Update timers, animations, etc.
  }
}