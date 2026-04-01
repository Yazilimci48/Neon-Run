/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState } from './types';

export class StateMachine<T extends string> {
  private currentState: T;
  private handlers: Map<T, { onEnter?: () => void; onExit?: () => void }> = new Map();

  constructor(initialState: T) {
    this.currentState = initialState;
  }

  register(state: T, config: { onEnter?: () => void; onExit?: () => void }): void {
    this.handlers.set(state, config);
  }

  transition(newState: T): void {
    if (this.currentState === newState) return;

    this.handlers.get(this.currentState)?.onExit?.();
    this.currentState = newState;
    this.handlers.get(this.currentState)?.onEnter?.();
  }

  getState(): T {
    return this.currentState;
  }
}
