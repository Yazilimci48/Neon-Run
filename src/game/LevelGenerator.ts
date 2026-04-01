/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PoolManager } from './PoolManager';

export interface Tile {
  z: number;
  id: string;
  obstacles: Obstacle[];
}

export interface Obstacle {
  x: number; // Lane: -1, 0, 1
  y: number; // Height: 0 for ground, 1 for jumpable
  type: 'BARRIER' | 'COIN' | 'RAMP';
  id: string;
}

export class LevelGenerator {
  private tilePool: PoolManager<Tile>;
  private activeTiles: Tile[] = [];
  private lastTileZ: number = 0;
  private tileSize: number = 20;
  private maxTiles: number = 10;
  private obstacleChance: number = 0.6;
  private jumpStreak: number = 0;

  constructor() {
    this.tilePool = new PoolManager<Tile>(
      () => ({ z: 0, id: Math.random().toString(36).substr(2, 9), obstacles: [] }),
      (tile) => {
        tile.obstacles = [];
      },
      20
    );

    // Initial tiles
    for (let i = 0; i < this.maxTiles; i++) {
      this.spawnTile(false);
    }
  }

  private spawnTile(withObstacles: boolean = true): void {
    const tile = this.tilePool.get();
    tile.z = this.lastTileZ;
    this.lastTileZ += this.tileSize;

    if (withObstacles && Math.random() < this.obstacleChance) {
      this.generateObstacles(tile);
    }

    this.activeTiles.push(tile);
  }

  private generateObstacles(tile: Tile): void {
    const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    const type = Math.random() > 0.3 ? 'BARRIER' : 'COIN';
    
    // Simple logic to avoid impossible streaks
    if (type === 'BARRIER') {
      this.jumpStreak++;
      if (this.jumpStreak > 2) {
        tile.obstacles.push({ x: lane, y: 0, type: 'COIN', id: Math.random().toString() });
        this.jumpStreak = 0;
        return;
      }
    } else {
      this.jumpStreak = 0;
    }

    tile.obstacles.push({
      x: lane,
      y: 0,
      type: type,
      id: Math.random().toString()
    });
  }

  update(playerZ: number): void {
    // Recycle tiles
    if (this.activeTiles.length > 0 && playerZ > this.activeTiles[0].z + this.tileSize) {
      const oldTile = this.activeTiles.shift()!;
      this.tilePool.release(oldTile);
      this.spawnTile(true);
    }
  }

  getActiveTiles(): Tile[] {
    return this.activeTiles;
  }

  reset(): void {
    this.tilePool.releaseAll();
    this.activeTiles = [];
    this.lastTileZ = 0;
    this.jumpStreak = 0;
    for (let i = 0; i < this.maxTiles; i++) {
      this.spawnTile(i > 3); // No obstacles for first 3 tiles
    }
  }
}
