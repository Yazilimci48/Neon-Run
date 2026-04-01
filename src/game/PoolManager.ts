/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class PoolManager<T> {
  private pool: T[] = [];
  private active: T[] = [];
  private factory: () => T;
  private reset: (item: T) => void;

  constructor(factory: () => T, reset: (item: T) => void, initialSize: number = 10) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  get(): T {
    const item = this.pool.length > 0 ? this.pool.pop()! : this.factory();
    this.active.push(item);
    return item;
  }

  release(item: T): void {
    this.reset(item);
    const index = this.active.indexOf(item);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.pool.push(item);
    }
  }

  getActive(): T[] {
    return this.active;
  }

  releaseAll(): void {
    while (this.active.length > 0) {
      this.release(this.active[0]);
    }
  }
}
