import { BaseScene } from '../GameEngine';

export class ProgressViewScene extends BaseScene {
  async initialize(): Promise<void> {
    await super.initialize();
    
    this.createProgressView();
    this.setupInputHandlers();
    
    console.log('Progress view scene initialized');
  }

  private createProgressView(): void {
    if (!this.phaserScene) return;

    // Create background
    this.createBackground();

    // Create title
    this.createTitle();

    // Create progress charts
    this.createProgressCharts();

    // Create statistics
    this.createStatistics();

    // Create back button
    this.createBackButton();
  }

  private createBackground(): void {
    if (!this.phaserScene) return;

    // Dark background with gradient effect
    this.phaserScene.add.rectangle(
      this.phaserScene.cameras.main.width / 2,
      this.phaserScene.cameras.main.height / 2,
      this.phaserScene.cameras.main.width,
      this.phaserScene.cameras.main.height,
      0x0a0a0a
    );

    // Add subtle grid
    const gridSize = 40;
    const gridColor = 0x1a237e;

    for (let x = 0; x < this.phaserScene.cameras.main.width; x += gridSize) {
      this.phaserScene.add.line(0, 0, x, 0, x, this.phaserScene.cameras.main.height, gridColor)
        .setAlpha(0.2);
    }

    for (let y = 0; y < this.phaserScene.cameras.main.height; y += gridSize) {
      this.phaserScene.add.line(0, 0, 0, y, this.phaserScene.cameras.main.width, y, gridColor)
        .setAlpha(0.2);
    }
  }

  private createTitle(): void {
    if (!this.phaserScene) return;

    const centerX = this.phaserScene.cameras.main.width / 2;
    const titleY = 50;

    const title = this.phaserScene.add.text(
      centerX,
      titleY,
      'SEU PROGRESSO',
      {
        fontSize: '36px',
        fontFamily: 'Courier New',
        color: '#00f3ff',
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    title.setShadow(2, 2, '#00f3ff', 8, true, true);
  }

  private createProgressCharts(): void {
    if (!this.phaserScene) return;

    const chartX = 100;
    const chartY = 150;
    const chartWidth = 300;
    const chartHeight = 200;

    // Overall progress chart
    this.createProgressBar(
      chartX,
      chartY,
      chartWidth,
      'PROGRESSO GERAL',
      0.35, // 35% complete
      '#00f3ff'
    );

    // Current discipline progress
    this.createProgressBar(
      chartX,
      chartY + 80,
      chartWidth,
      'CSI-22: POO',
      0.60, // 60% complete
      '#ffff00'
    );

    // Weekly goal progress
    this.createProgressBar(
      chartX,
      chartY + 160,
      chartWidth,
      'META SEMANAL',
      0.75, // 75% complete
      '#00ff41'
    );
  }

  private createProgressBar(
    x: number,
    y: number,
    width: number,
    label: string,
    progress: number,
    color: string
  ): void {
    if (!this.phaserScene) return;

    // Label
    this.phaserScene.add.text(
      x,
      y,
      label,
      {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ffffff'
      }
    );

    // Background bar
    this.phaserScene.add.rectangle(
      x + width / 2,
      y + 25,
      width,
      20,
      0x1a1a2e
    );

    // Progress bar
    const progressWidth = width * progress;
    this.phaserScene.add.rectangle(
      x + progressWidth / 2,
      y + 25,
      progressWidth,
      20,
      parseInt(color.replace('#', '0x'), 16)
    );

    // Percentage text
    this.phaserScene.add.text(
      x + width + 20,
      y + 18,
      `${Math.round(progress * 100)}%`,
      {
        fontSize: '14px',
        fontFamily: 'Courier New',
        color: color
      }
    );
  }

  private createStatistics(): void {
    if (!this.phaserScene) return;

    const statsX = 500;
    const statsY = 150;
    const lineHeight = 30;

    const stats = [
      { label: 'Habilidades Completas:', value: '18 / 52' },
      { label: 'Tempo de Estudo Total:', value: '24h 35m' },
      { label: 'Sequência Atual:', value: '7 dias' },
      { label: 'Maior Sequência:', value: '14 dias' },
      { label: 'Média de Desempenho:', value: '87%' },
      { label: 'Conquistas Desbloqueadas:', value: '12 / 25' }
    ];

    // Stats background
    this.phaserScene.add.rectangle(
      statsX + 150,
      statsY + 100,
      350,
      stats.length * lineHeight + 40,
      0x1a1a2e,
      0.8
    );

    stats.forEach((stat, index) => {
      const y = statsY + (index * lineHeight) + 20;

      // Label
      this.phaserScene.add.text(
        statsX,
        y,
        stat.label,
        {
          fontSize: '14px',
          fontFamily: 'Courier New',
          color: '#ffffff'
        }
      );

      // Value
      this.phaserScene.add.text(
        statsX + 250,
        y,
        stat.value,
        {
          fontSize: '14px',
          fontFamily: 'Courier New',
          color: '#00f3ff',
          fontStyle: 'bold'
        }
      );
    });
  }

  private createBackButton(): void {
    if (!this.phaserScene) return;

    const buttonX = 50;
    const buttonY = this.phaserScene.cameras.main.height - 50;

    const backButton = this.phaserScene.add.text(
      buttonX,
      buttonY,
      '◀ VOLTAR',
      {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        backgroundColor: '#1a237e',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5).setInteractive();

    backButton.on('pointerover', () => {
      backButton.setStyle({ color: '#00f3ff' });
    });

    backButton.on('pointerout', () => {
      backButton.setStyle({ color: '#ffffff' });
    });

    backButton.on('pointerdown', () => {
      this.goBack();
    });
  }

  private setupInputHandlers(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.key === 'Backspace') {
          this.goBack();
        }
      });
    }
  }

  private goBack(): void {
    console.log('Returning to main menu');
    
    // Emit back action event
    const event = new CustomEvent('menuAction', {
      detail: { action: 'backToMenu' }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  update(deltaTime: number): void {
    // Update animations, charts, etc.
  }
}