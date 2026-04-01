/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class InputManager {
  private startX: number = 0;
  private startY: number = 0;
  private minSwipeDistance: number = 30;

  private onSwipeUp: () => void;
  private onSwipeDown: () => void;
  private onSwipeLeft: () => void;
  private onSwipeRight: () => void;

  constructor(callbacks: {
    up: () => void;
    down: () => void;
    left: () => void;
    right: () => void;
  }) {
    this.onSwipeUp = callbacks.up;
    this.onSwipeDown = callbacks.down;
    this.onSwipeLeft = callbacks.left;
    this.onSwipeRight = callbacks.right;

    this.init();
  }

  private init(): void {
    window.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const diffX = endX - this.startX;
      const diffY = endY - this.startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > this.minSwipeDistance) {
          if (diffX > 0) this.onSwipeRight();
          else this.onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (Math.abs(diffY) > this.minSwipeDistance) {
          if (diffY > 0) this.onSwipeDown();
          else this.onSwipeUp();
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.onSwipeUp();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.onSwipeDown();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.onSwipeLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.onSwipeRight();
          break;
      }
    });
  }

  destroy(): void {
    // Cleanup listeners if needed
  }
}
