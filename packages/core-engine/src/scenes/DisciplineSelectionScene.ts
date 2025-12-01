import { BaseScene } from '../GameEngine';
import type { Discipline } from '@ita-rp/shared-types';
import { curriculumService } from '@ita-rp/curriculum';
import { useGameStore } from '@ita-rp/game-logic';

export class DisciplineSelectionScene extends BaseScene {
  private disciplines: Discipline[] = [];
  private selectedDisciplineIndex = 0;
  private disciplineItems: { bg: any; nameText: any; descText: any; skillsText: any }[] = [];

  async initialize(): Promise<void> {
    await super.initialize();

    // Load disciplines
    this.disciplines = curriculumService.getAllDisciplines();

    // Setup UI
    this.createDisciplineSelection();
    this.setupInputHandlers();

    console.log('Discipline selection scene initialized');
  }

  private createDisciplineSelection(): void {
    if (!this.phaserScene) return;

    // Create background
    this.createBackground();

    // Create title
    this.createTitle();

    // Create discipline list
    this.createDisciplineList();

    // Create navigation
    this.createNavigation();
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
    const gridColor = 0x1a237e;

    for (let x = 0; x < this.phaserScene.cameras.main.width; x += gridSize) {
      this.phaserScene.add
        .line(0, 0, x, 0, x, this.phaserScene.cameras.main.height, gridColor)
        .setAlpha(0.3);
    }

    for (let y = 0; y < this.phaserScene.cameras.main.height; y += gridSize) {
      this.phaserScene.add
        .line(0, 0, 0, y, this.phaserScene.cameras.main.width, y, gridColor)
        .setAlpha(0.3);
    }
  }

  private createTitle(): void {
    if (!this.phaserScene) return;

    const centerX = this.phaserScene.cameras.main.width / 2;
    const titleY = 50;

    const title = this.phaserScene.add
      .text(centerX, titleY, 'SELECIONE UMA DISCIPLINA', {
        fontSize: '32px',
        fontFamily: 'Courier New',
        color: '#00f3ff',
        align: 'center',
      })
      .setOrigin(0.5);

    title.setShadow(2, 2, '#00f3ff', 10, true, true);
  }

  private createDisciplineList(): void {
    if (!this.phaserScene) return;

    const centerX = this.phaserScene.cameras.main.width / 2;
    const startY = 150;
    const itemHeight = 80;
    const itemWidth = 600;

    this.disciplineItems = [];

    this.disciplines.forEach((discipline, index) => {
      const y = startY + index * itemHeight;

      // Background for discipline item
      const isSelected = index === this.selectedDisciplineIndex;
      const bgColor = isSelected ? 0x1a237e : 0x1a1a2e;
      const borderColor = isSelected ? 0x00f3ff : 0x444444;

      const bg = this.phaserScene.add.rectangle(centerX, y, itemWidth, itemHeight - 10, bgColor);
      bg.setStrokeStyle(2, borderColor);

      // Discipline name
      const nameText = this.phaserScene.add.text(
        centerX - itemWidth / 2 + 20,
        y - 10,
        discipline.name,
        {
          fontSize: '20px',
          fontFamily: 'Courier New',
          color: '#ffffff',
          fontStyle: 'bold',
        }
      );

      // Discipline description
      const descText = this.phaserScene.add.text(
        centerX - itemWidth / 2 + 20,
        y + 15,
        discipline.description,
        {
          fontSize: '14px',
          fontFamily: 'Courier New',
          color: '#cccccc',
          wordWrap: { width: itemWidth - 40 },
        }
      );

      // Skills count
      const skillsText = this.phaserScene.add.text(
        centerX + itemWidth / 2 - 100,
        y,
        `${discipline.totalSkills} habilidades`,
        {
          fontSize: '16px',
          fontFamily: 'Courier New',
          color: '#00f3ff',
          fontStyle: 'bold',
        }
      );

      this.disciplineItems.push({
        bg,
        nameText,
        descText,
        skillsText,
      });
    });
  }

  private createNavigation(): void {
    if (!this.phaserScene) return;

    const centerX = this.phaserScene.cameras.main.width / 2;
    const bottomY = this.phaserScene.cameras.main.height - 100;

    // Instructions
    this.phaserScene.add
      .text(centerX, bottomY - 40, 'Use ↑↓ para navegar, ENTER para selecionar, ESC para voltar', {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ffff00',
        align: 'center',
      })
      .setOrigin(0.5);

    // Select button
    const selectButton = this.phaserScene.add
      .text(centerX, bottomY, 'SELECIONAR DISCIPLINA', {
        fontSize: '18px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        backgroundColor: '#00f3ff',
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive();

    selectButton.on('pointerover', () => {
      selectButton.setStyle({ backgroundColor: '#1a237e' });
    });

    selectButton.on('pointerout', () => {
      selectButton.setStyle({ backgroundColor: '#00f3ff' });
    });

    selectButton.on('pointerdown', () => {
      this.selectDiscipline();
    });

    // Back button
    const backButton = this.phaserScene.add
      .text(100, bottomY, '◀ VOLTAR', {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        backgroundColor: '#1a237e',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

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
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          this.navigateUp();
          break;
        case 'ArrowDown':
          this.navigateDown();
          break;
        case 'Enter':
          this.selectDiscipline();
          break;
        case 'Escape':
          this.goBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
  }

  private navigateUp(): void {
    if (this.selectedDisciplineIndex > 0) {
      this.selectedDisciplineIndex--;
      this.refreshDisciplineList();
    }
  }

  private navigateDown(): void {
    if (this.selectedDisciplineIndex < this.disciplines.length - 1) {
      this.selectedDisciplineIndex++;
      this.refreshDisciplineList();
    }
  }

  private refreshDisciplineList(): void {
    // Clear existing items
    this.disciplineItems.forEach(item => {
      Object.values(item).forEach(element => {
        if (element && element.destroy) {
          element.destroy();
        }
      });
    });
    this.disciplineItems = [];

    // Recreate the list
    this.createDisciplineList();
  }

  private selectDiscipline(): void {
    const selectedDiscipline = this.disciplines[this.selectedDisciplineIndex];
    if (!selectedDiscipline) return;

    console.log(`Selected discipline: ${selectedDiscipline.name}`);

    // Update game state
    const { setCurrentDiscipline } = useGameStore.getState();
    setCurrentDiscipline(selectedDiscipline);

    // Navigate to study mode
    this.navigateToStudyMode(selectedDiscipline);
  }

  private navigateToStudyMode(discipline: Discipline): void {
    // Emit event to navigate to study mode
    const event = new CustomEvent('menuAction', {
      detail: {
        action: 'startStudy',
        discipline: discipline.id,
      },
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  private goBack(): void {
    console.log('Returning to main menu');

    // Emit back action event
    const event = new CustomEvent('menuAction', {
      detail: { action: 'backToMenu' },
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  update(deltaTime: number): void {
    // Update animations, hover effects, etc.
  }
}
