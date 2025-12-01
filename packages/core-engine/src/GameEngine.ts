import { Game, Types } from 'phaser';
import { GameEngine as IGameEngine, Scene as IScene, SceneConfig } from '@ita-rp/shared-types';

export class GameEngine implements IGameEngine {
  private game: Game | null = null;
  private scenes: Map<string, IScene> = new Map();
  private currentScene: IScene | null = null;

  async initialize(): Promise<void> {
    const config: Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'phaser-game-container',
      backgroundColor: '#0a0a0a',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    this.game = new Game(config);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.game) {
        this.game.scale.resize(window.innerWidth, window.innerHeight);
      }
    });

    return new Promise((resolve) => {
      if (this.game) {
        this.game.events.once('ready', () => {
          console.log('Phaser game engine initialized');
          resolve();
        });
      }
    });
  }

  async startScene(sceneId: string): Promise<void> {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    await scene.initialize();

    if (this.currentScene) {
      this.currentScene.destroy();
    }

    this.currentScene = scene;

    if (this.game) {
      // Add Phaser scene if it's a Phaser scene
      if ('phaserScene' in scene) {
        this.game.scene.add(sceneId, (scene as any).phaserScene, true);
      }
    }
  }

  stopScene(sceneId: string): Promise<void> {
    const scene = this.scenes.get(sceneId);
    if (scene) {
      scene.destroy();
      this.scenes.delete(sceneId);

      if (this.currentScene?.id === sceneId) {
        this.currentScene = null;
      }
    }
    return Promise.resolve();
  }

  getCurrentScene(): IScene | null {
    return this.currentScene;
  }

  getScenes(): IScene[] {
    return Array.from(this.scenes.values());
  }

  createScene(config: SceneConfig): IScene {
    const scene = new BaseScene(config);
    this.scenes.set(config.id, scene);
    return scene;
  }
}

class BaseScene implements IScene {
  id: string;
  name: string;
  type: 'menu' | 'study' | 'progress' | 'settings' | 'achievement';
  phaserScene: Phaser.Scene;

  constructor(config: SceneConfig) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    
    // Create Phaser scene
    this.phaserScene = new Phaser.Scene({
      key: config.id,
      active: false,
      visible: false,
    });
  }

  async initialize(): Promise<void> {
    // Override in subclasses
    console.log(`Initializing scene: ${this.name}`);
  }

  update(deltaTime: number): void {
    // Override in subclasses
  }

  render(): void {
    // Handled by Phaser
  }

  destroy(): void {
    if (this.phaserScene && this.phaserScene.scene) {
      this.phaserScene.scene.stop(this.id);
    }
  }
}

export { BaseScene };
export default GameEngine;