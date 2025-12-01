import { BaseScene } from '../GameEngine';
import { useGameStore } from '@ita-rp/game-logic';

export class MainMenuScene extends BaseScene {
  async initialize(): Promise<void> {
    await super.initialize();

    this.createMainMenu();
    this.setupInputHandlers();

    console.log('Main menu scene initialized');
  }

  private createMainMenu(): void {
    if (!this.phaserScene) return;

    // Create cyberpunk background
    this.createBackground();

    // Create title
    this.createTitle();

    // Create menu buttons
    this.createMenuButtons();

    // Create player info
    this.createPlayerInfo();
  }

  private createBackground(): void {
    if (!this.phaserScene) return;

    // Dark background
    this.phaserScene.add.rectangle(
      this.phaserScene.cameras.main.width / 2,
      this.phaserScene.cameras.main.height / 2,
      this.phaserScene.cameras.main.width,
      this.phaserScene.cameras.main.height,
      0x0a0a0a
    );

    // Grid pattern
    const gridSize = 50;
    const gridColor = "#1a237e";

    for (let x = 0; x < this.phaserScene.cameras.main.width; x += gridSize) {
      this.phaserScene.add
        .line(0, 0, x, 0, x, this.phaserScene.cameras.main.height, 0x1a237e)
        .setAlpha(0.3);
    }

    for (let y = 0; y < this.phaserScene.cameras.main.height; y += gridSize) {
      this.phaserScene.add
        .line(0, 0, 0, y, this.phaserScene.cameras.main.width, y, 0x1a237e)
        .setAlpha(0.3);
    }
  }

  private createTitle(): void {
    if (!this.phaserScene) return;

    const centerX = this.phaserScene.cameras.main.width / 2;
    const titleY = 100;

    // Main title
    const title = this.phaserScene.add
      .text(centerX, titleY, 'ITA RP GAME', {
        fontSize: '48px',
        fontFamily: 'Courier New',
        color: '#00f3ff',
        align: 'center',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    const subtitle = this.phaserScene.add
      .text(centerX, titleY + 60, 'REBORN EDITION', {
        fontSize: '24px',
        fontFamily: 'Courier New',
        color: '#1a237e',
        align: 'center',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    // Add glow effect (Phaser setShadow: x, y, color, blur, shadowStroke, shadowFill)
    title.setShadow(2, 2, '#00f3ff', 10, true, true);
    subtitle.setShadow(2, 2, '#1a237e', 5, true, true);
  }

  private createMenuButtons(): void {
    if (!this.phaserScene) return;

    const centerX = this.phaserScene.cameras.main.width / 2;
    const startY = 250;
    const buttonSpacing = 80;

    const menuItems = [
      { text: 'INICIAR ESTUDO', action: 'startStudy' },
      { text: 'PROGRESSO', action: 'progress' },
      { text: 'CONQUISTAS', action: 'achievements' },
      { text: 'CONFIGURAÇÕES', action: 'settings' },
    ];

    menuItems.forEach((item, index) => {
      const y = startY + index * buttonSpacing;

      const button = this.phaserScene.add
        .text(centerX, y, item.text, {
          fontSize: '20px',
          fontFamily: 'Courier New',
          color: '#ffffff',
          backgroundColor: '#1a237e',
          padding: { x: 30, y: 15 },
          align: 'center',
        })
        .setOrigin(0.5)
        .setInteractive();

      // Button hover effects
      button.on('pointerover', () => {
        button.setStyle({
          backgroundColor: '#00f3ff',
          color: '#0a0a0a',
        });
        button.setShadow(2, 2, '#00f3ff', 8, true, true);
      });

      button.on('pointerout', () => {
        button.setStyle({
          backgroundColor: '#1a237e',
          color: '#ffffff',
        });
        button.setShadow(0, 0, '#000000', 0, false, false);
      });

      button.on('pointerdown', () => {
        this.handleMenuAction(item.action);
      });
    });
  }

  private createPlayerInfo(): void {
    if (!this.phaserScene) return;

    const { player } = useGameStore.getState();
    const infoX = 50;
    const infoY = this.phaserScene.cameras.main.height - 100;

    // Player stats background
    this.phaserScene.add.rectangle(infoX + 150, infoY + 25, 300, 50, 0x1a1a2e).setAlpha(0.8);

    // Player level
    this.phaserScene.add.text(infoX, infoY, `NÍVEL: ${player.level}`, {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#00f3ff',
    });

    // Player XP
    const { current, next, percentage } = useGameStore.getState().calculateLevelProgress();
    this.phaserScene.add.text(infoX, infoY + 25, `XP: ${current} / ${next}`, {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
    });

    // Player rank
    this.phaserScene.add.text(infoX + 200, infoY, `PATENTE: ${player.currentRank.name}`, {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#ffff00',
    });
  }

  private setupInputHandlers(): void {
    // Keyboard shortcuts
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', event => {
        switch (event.key) {
          case '1':
            this.handleMenuAction('startStudy');
            break;
          case '2':
            this.handleMenuAction('progress');
            break;
          case '3':
            this.handleMenuAction('achievements');
            break;
          case '4':
            this.handleMenuAction('settings');
            break;
          case 'Escape':
            this.handleMenuAction('quit');
            break;
        }
      });
    }
  }

  private handleMenuAction(action: string): void {
    console.log(`Menu action: ${action}`);

    // Emit menu action event
    const event = new CustomEvent('menuAction', {
      detail: { action },
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  update(deltaTime: number): void {
    // Update animations, particles, etc.
  }
}
