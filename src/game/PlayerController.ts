/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StateMachine } from './StateMachine';
import { PlayerState, Lane } from './types';

export class PlayerController {
  public position = { x: 0, y: 0, z: 0 };
  public targetX = 0;
  public lane: Lane = Lane.CENTER;
  public stateMachine: StateMachine<PlayerState>;
  
  private laneWidth = 3;
  private jumpForce = 0.5;
  private gravity = 0.02;
  private velocityY = 0;
  private moveSpeed = 0.15;
  private laneTransitionSpeed = 0.2;

  constructor() {
    this.stateMachine = new StateMachine<PlayerState>(PlayerState.RUNNING);
    
    this.stateMachine.register(PlayerState.JUMPING, {
      onEnter: () => {
        this.velocityY = this.jumpForce;
      }
    });

    this.stateMachine.register(PlayerState.SLIDING, {
      onEnter: () => {
        // Handle sliding logic (e.g. smaller hitbox)
        setTimeout(() => {
          if (this.stateMachine.getState() === PlayerState.SLIDING) {
            this.stateMachine.transition(PlayerState.RUNNING);
          }
        }, 800);
      }
    });
  }

  update(): void {
    const state = this.stateMachine.getState();

    // Forward movement
    if (state !== PlayerState.DYING) {
      this.position.z += this.moveSpeed;
      // Increase speed slightly over time
      this.moveSpeed += 0.00001;
    }

    // Lane switching (Lerp)
    this.targetX = this.lane * this.laneWidth;
    this.position.x += (this.targetX - this.position.x) * this.laneTransitionSpeed;

    // Physics (Jump/Gravity)
    if (state === PlayerState.JUMPING || this.position.y > 0) {
      this.position.y += this.velocityY;
      this.velocityY -= this.gravity;

      if (this.position.y <= 0) {
        this.position.y = 0;
        this.velocityY = 0;
        if (state !== PlayerState.DYING) {
          this.stateMachine.transition(PlayerState.RUNNING);
        }
      }
    }
  }

  moveLeft(): void {
    if (this.lane === Lane.CENTER) this.lane = Lane.LEFT;
    else if (this.lane === Lane.RIGHT) this.lane = Lane.CENTER;
  }

  moveRight(): void {
    if (this.lane === Lane.CENTER) this.lane = Lane.RIGHT;
    else if (this.lane === Lane.LEFT) this.lane = Lane.CENTER;
  }

  jump(): void {
    if (this.stateMachine.getState() === PlayerState.RUNNING) {
      this.stateMachine.transition(PlayerState.JUMPING);
    }
  }

  slide(): void {
    if (this.stateMachine.getState() === PlayerState.RUNNING) {
      this.stateMachine.transition(PlayerState.SLIDING);
    }
  }

  die(): void {
    this.stateMachine.transition(PlayerState.DYING);
  }

  reset(): void {
    this.position = { x: 0, y: 0, z: 0 };
    this.lane = Lane.CENTER;
    this.targetX = 0;
    this.moveSpeed = 0.15;
    this.velocityY = 0;
    this.stateMachine.transition(PlayerState.RUNNING);
  }
}
