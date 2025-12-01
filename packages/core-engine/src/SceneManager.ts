import { Scene, SceneConfig, TransitionConfig } from '@ita-rp/shared-types';
import { GameEngine } from './GameEngine';

export class SceneManager {
  private engine: GameEngine;
  private transitionContainer: HTMLElement | null = null;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.createTransitionContainer();
  }

  createScene(config: SceneConfig): Scene {
    return this.engine.createScene(config);
  }

  getScene(sceneId: string): Scene | null {
    return this.engine.getScenes().find(scene => scene.id === sceneId) || null;
  }

  async transitionTo(sceneId: string, transition?: TransitionConfig): Promise<void> {
    const currentScene = this.engine.getCurrentScene();
    const nextScene = this.getScene(sceneId);

    if (!nextScene) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    // Default transition
    const transitionConfig: TransitionConfig = transition || {
      type: 'fade',
      duration: 500,
      easing: 'ease-in-out'
    };

    // Start transition
    await this.startTransition(transitionConfig);

    // Stop current scene
    if (currentScene) {
      await this.engine.stopScene(currentScene.id);
    }

    // Start next scene
    await this.engine.startScene(sceneId);

    // End transition
    await this.endTransition(transitionConfig);
  }

  private createTransitionContainer(): void {
    this.transitionContainer = document.createElement('div');
    this.transitionContainer.id = 'transition-overlay';
    this.transitionContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0a0a0a;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    `;
    document.body.appendChild(this.transitionContainer);
  }

  private async startTransition(config: TransitionConfig): Promise<void> {
    if (!this.transitionContainer) return;

    return new Promise((resolve) => {
      if (!this.transitionContainer) {
        resolve();
        return;
      }

      const duration = config.duration / 2; // Half duration for fade in
      
      this.transitionContainer.style.transition = `opacity ${duration}ms ${config.easing || 'ease-in-out'}`;
      this.transitionContainer.style.opacity = '1';

      setTimeout(resolve, duration);
    });
  }

  private async endTransition(config: TransitionConfig): Promise<void> {
    if (!this.transitionContainer) return;

    return new Promise((resolve) => {
      if (!this.transitionContainer) {
        resolve();
        return;
      }

      const duration = config.duration / 2; // Half duration for fade out
      
      this.transitionContainer.style.transition = `opacity ${duration}ms ${config.easing || 'ease-in-out'}`;
      this.transitionContainer.style.opacity = '0';

      setTimeout(resolve, duration);
    });
  }

  async preloadAssets(assets: any[]): Promise<void> {
    // Implement asset preloading
    console.log('Preloading assets:', assets);
  }
}