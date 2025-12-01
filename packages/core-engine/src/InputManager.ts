import { InputManager as IInputManager } from '@ita-rp/shared-types';

export class InputManager implements IInputManager {
  private handlers: Map<string, { type: string; callback: Function }> = new Map();
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized) return;

    // Keyboard events
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
    
    // Mouse events
    document.addEventListener('click', this.handleMouse.bind(this));
    document.addEventListener('mousemove', this.handleMouse.bind(this));
    
    // Touch events
    document.addEventListener('touchstart', this.handleTouch.bind(this));
    document.addEventListener('touchmove', this.handleTouch.bind(this));
    document.addEventListener('touchend', this.handleTouch.bind(this));

    this.isInitialized = true;
    console.log('Input manager initialized');
  }

  addKeyboardHandler(key: string, callback: () => void): void {
    const id = `keyboard-${key}`;
    this.handlers.set(id, {
      type: 'keyboard',
      callback: (event: KeyboardEvent) => {
        if (event.key === key || event.code === key) {
          event.preventDefault();
          callback();
        }
      }
    });
  }

  addMouseHandler(event: string, callback: (event: MouseEvent) => void): void {
    const id = `mouse-${event}-${Date.now()}`;
    this.handlers.set(id, {
      type: 'mouse',
      callback: callback as Function
    });
  }

  addTouchHandler(event: string, callback: (event: TouchEvent) => void): void {
    const id = `touch-${event}-${Date.now()}`;
    this.handlers.set(id, {
      type: 'touch',
      callback: callback as Function
    });
  }

  removeHandler(id: string): void {
    this.handlers.delete(id);
  }

  private handleKeyboard(event: KeyboardEvent): void {
    this.handlers.forEach((handler, id) => {
      if (handler.type === 'keyboard') {
        handler.callback(event);
      }
    });
  }

  private handleMouse(event: MouseEvent): void {
    this.handlers.forEach((handler, id) => {
      if (handler.type === 'mouse') {
        handler.callback(event);
      }
    });
  }

  private handleTouch(event: TouchEvent): void {
    this.handlers.forEach((handler, id) => {
      if (handler.type === 'touch') {
        handler.callback(event);
      }
    });
  }

  destroy(): void {
    if (!this.isInitialized) return;

    document.removeEventListener('keydown', this.handleKeyboard.bind(this));
    document.removeEventListener('click', this.handleMouse.bind(this));
    document.removeEventListener('mousemove', this.handleMouse.bind(this));
    document.removeEventListener('touchstart', this.handleTouch.bind(this));
    document.removeEventListener('touchmove', this.handleTouch.bind(this));
    document.removeEventListener('touchend', this.handleTouch.bind(this));

    this.handlers.clear();
    this.isInitialized = false;
  }
}