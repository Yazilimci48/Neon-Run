/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type Handler<T> = (data: T) => void;

export class EventEmitter<TMap> {
  private handlers: Map<keyof TMap, Handler<any>[]> = new Map();

  on<K extends keyof TMap>(event: K, handler: Handler<TMap[K]>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off<K extends keyof TMap>(event: K, handler: Handler<TMap[K]>): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      this.handlers.set(event, eventHandlers.filter(h => h !== handler));
    }
  }

  emit<K extends keyof TMap>(event: K, data: TMap[K]): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => handler(data));
    }
  }
}
