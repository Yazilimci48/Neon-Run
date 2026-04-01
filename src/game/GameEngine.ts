/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from './EventEmitter';
import { LevelGenerator } from './LevelGenerator';
import { PlayerController } from './PlayerController';
import { InputManager } from './InputManager';
import { GameEventMap, PlayerState } from './types';

export class GameEngine {
  public player: PlayerController;
  public level: LevelGenerator;
  public events: EventEmitter<GameEventMap>;
  public input: InputManager;
  
  private isRunning: boolean = false;
  private score: number = 0;
  private coins: number = 0;
  private lastTime: number = 0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.player = new PlayerController();
    this.level = new LevelGenerator();
    this.events = new EventEmitter<GameEventMap>();

    this.input = new InputManager({
      up: () => this.player.jump(),
      down: () => this.player.slide(),
      left: () => this.player.moveLeft(),
      right: () => this.player.moveRight(),
    });

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public start(): void {
    this.isRunning = true;
    this.score = 0;
    this.coins = 0;
    this.player.reset();
    this.level.reset();
    this.events.emit('game:start', undefined);
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(time: number): void {
    if (!this.isRunning) return;

    if (!this.lastTime) this.lastTime = time;
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.update();
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  }

  private update(): void {
    if (this.player.stateMachine.getState() === PlayerState.DYING) return;

    this.player.update();
    this.level.update(this.player.position.z);

    // Collision detection
    const activeTiles = this.level.getActiveTiles();
    for (const tile of activeTiles) {
      // Check if tile is in range of player
      const distZ = tile.z - this.player.position.z;
      if (distZ > -1 && distZ < 1) {
        for (const obstacle of tile.obstacles) {
          // Check lane match
          if (obstacle.x === this.player.lane) {
            const playerY = this.player.position.y;
            const isJumping = playerY > 0.5;
            const isSliding = this.player.stateMachine.getState() === PlayerState.SLIDING;

            if (obstacle.type === 'BARRIER') {
              if (!isJumping && !isSliding) {
                this.gameOver();
              }
            } else if (obstacle.type === 'COIN') {
              this.collectCoin(obstacle, tile);
            }
          }
        }
      }
    }

    this.score = Math.floor(this.player.position.z);
    this.events.emit('score:increase', this.score);
  }

  private collectCoin(coin: any, tile: any): void {
    tile.obstacles = tile.obstacles.filter((o: any) => o.id !== coin.id);
    this.coins++;
    this.events.emit('coin:collect', this.coins);
  }

  private gameOver(): void {
    this.player.die();
    this.isRunning = false;
    this.events.emit('game:over', undefined);
  }

  private draw(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background: Misty Jungle/Temple Atmosphere
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#1e272e'); // Dark sky
    bgGrad.addColorStop(0.5, '#2f3640'); // Mist
    bgGrad.addColorStop(1, '#1a1a1a'); // Deep jungle
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Camera perspective
    ctx.save();
    ctx.translate(w / 2, h / 2);
    
    const focalLength = 400;
    const camHeight = 8; // Drastically reduced to fix the "off-screen" issue
    const horizonY = 0; // Center the vanishing point

    // Draw Ground/Mist Floor
    const floorGrad = ctx.createLinearGradient(0, 0, 0, h/2);
    floorGrad.addColorStop(0, 'rgba(47, 54, 64, 0)');
    floorGrad.addColorStop(1, 'rgba(47, 54, 64, 0.5)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(-w/2, 0, w, h/2);

    // Draw Road Tiles (Ancient Stone Bridge)
    const activeTiles = this.level.getActiveTiles();
    activeTiles.forEach(tile => {
      const z = tile.z - this.player.position.z;
      if (z < -5 || z > 150) return;

      const scale = focalLength / (z + 10);
      const roadY = camHeight * scale - horizonY;
      const roadWidth = 50;

      // Fog/Mist effect based on distance
      const opacity = Math.max(0, 1 - z / 120);
      
      // Stone Path
      ctx.fillStyle = `rgba(87, 101, 116, ${opacity})`;
      ctx.beginPath();
      ctx.moveTo(-roadWidth * scale, roadY);
      ctx.lineTo(roadWidth * scale, roadY);
      ctx.lineTo(roadWidth * 1.2 * scale, roadY + 5 * scale);
      ctx.lineTo(-roadWidth * 1.2 * scale, roadY + 5 * scale);
      ctx.fill();

      // Side Pillars (Walls)
      ctx.fillStyle = `rgba(47, 54, 64, ${opacity})`;
      [-1, 1].forEach(side => {
        const px = side * roadWidth * scale;
        ctx.fillRect(px - 4 * scale, roadY - 30 * scale, 8 * scale, 30 * scale);
        // Pillar caps
        ctx.fillStyle = `rgba(113, 128, 147, ${opacity})`;
        ctx.fillRect(px - 6 * scale, roadY - 35 * scale, 12 * scale, 5 * scale);
      });

      // Obstacles (Ancient Blocks)
      tile.obstacles.forEach(obs => {
        const ox = obs.x * (roadWidth / 1.5) * scale;
        const oy = roadY;
        
        if (obs.type === 'BARRIER') {
          ctx.fillStyle = `rgba(44, 58, 71, ${opacity})`;
          const bW = 25 * scale;
          const bH = 30 * scale;
          ctx.fillRect(ox - bW/2, oy - bH, bW, bH);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.1})`;
          ctx.strokeRect(ox - bW/2, oy - bH, bW, bH);
        } else {
          ctx.fillStyle = `rgba(241, 196, 15, ${opacity})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#f1c40f';
          ctx.beginPath();
          ctx.arc(ox, oy - 10 * scale, 5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    });

    // Draw Player (Adventurer Silhouette)
    const pZView = 5; 
    const pScale = focalLength / (pZView + 10);
    const pX = this.player.position.x * (50 / 1.5) * pScale;
    const pY = (camHeight - this.player.position.y * 15) * pScale - horizonY;
    
    ctx.strokeStyle = '#dcdde1';
    ctx.fillStyle = '#e67e22';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    const pState = this.player.stateMachine.getState();
    const size = 2 * pScale;

    if (pState === PlayerState.SLIDING) {
      ctx.beginPath();
      ctx.ellipse(pX, pY - size * 0.3, size * 1.5, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (pState === PlayerState.JUMPING) {
      ctx.beginPath();
      ctx.arc(pX, pY - size * 2, size * 0.6, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pX, pY - size * 1.4);
      ctx.lineTo(pX, pY - size * 0.6); // Body
      ctx.stroke();
    } else {
      const anim = (Date.now() % 500) / 500;
      const legOffset = Math.sin(anim * Math.PI * 2) * size * 0.6;
      
      // Head
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(pX, pY - size * 2.5, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      // Body & Limbs
      ctx.strokeStyle = '#f5f6fa';
      ctx.beginPath();
      ctx.moveTo(pX, pY - size * 2.1);
      ctx.lineTo(pX, pY - size * 1);
      ctx.lineTo(pX + legOffset, pY);
      ctx.moveTo(pX, pY - size * 1);
      ctx.lineTo(pX - legOffset, pY);
      ctx.stroke();
    }

    ctx.restore();
  }
}
