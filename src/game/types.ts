/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PlayerState {
  RUNNING = 'RUNNING',
  JUMPING = 'JUMPING',
  SLIDING = 'SLIDING',
  DYING = 'DYING',
}

export enum Lane {
  LEFT = -1,
  CENTER = 0,
  RIGHT = 1,
}

export interface IInteractable {
  onInteract: () => void;
  id: string;
  type: 'OBSTACLE' | 'COIN';
  position: { x: number; y: number; z: number };
}

export interface GameEventMap {
  'score:increase': number;
  'coin:collect': number;
  'game:over': void;
  'game:start': void;
  'game:restart': void;
}
