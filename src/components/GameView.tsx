/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameEngine } from '../game/GameEngine';
import { Trophy, Coins, Play, RotateCcw, Zap } from 'lucide-react';

export const GameView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      const engine = new GameEngine(canvasRef.current);
      engineRef.current = engine;

      engine.events.on('score:increase', (newScore) => setScore(newScore));
      engine.events.on('coin:collect', (newCoins) => setCoins(newCoins));
      engine.events.on('game:over', () => setIsGameOver(true));
      engine.events.on('game:start', () => {
        setIsGameOver(false);
        setIsStarted(true);
      });
    }
  }, []);

  const startGame = () => {
    engineRef.current?.start();
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* HUD */}
      <AnimatePresence>
        {isStarted && !isGameOver && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-cyan-400" />
                <span className="text-2xl font-bold tracking-tighter tabular-nums">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full w-fit">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-semibold tabular-nums">
                  {coins}
                </span>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-bold opacity-70">
                Hyperdrive Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen */}
      <AnimatePresence>
        {!isStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl z-20"
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-8xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 mb-8"
            >
              NEON RUNNER
            </motion.h1>
            
            <div className="grid grid-cols-3 gap-8 mb-12 text-center max-w-2xl">
              <div className="space-y-2">
                <div className="text-cyan-400 font-bold text-xs uppercase tracking-widest">Controls</div>
                <div className="text-sm opacity-60">Arrows / WASD / Swipe</div>
              </div>
              <div className="space-y-2">
                <div className="text-cyan-400 font-bold text-xs uppercase tracking-widest">Objective</div>
                <div className="text-sm opacity-60">Dodge barriers, collect coins</div>
              </div>
              <div className="space-y-2">
                <div className="text-cyan-400 font-bold text-xs uppercase tracking-widest">Speed</div>
                <div className="text-sm opacity-60">Increases over time</div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="group relative flex items-center gap-4 bg-white text-black px-12 py-6 rounded-full font-black text-2xl hover:scale-105 transition-transform active:scale-95"
            >
              <Play className="w-8 h-8 fill-black" />
              START MISSION
              <div className="absolute -inset-1 bg-cyan-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 backdrop-blur-2xl z-30"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black border border-white/10 p-12 rounded-[40px] shadow-2xl flex flex-col items-center max-w-md w-full"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-10 h-10 text-red-500" />
              </div>
              
              <h2 className="text-4xl font-black tracking-tight mb-2">MISSION FAILED</h2>
              <p className="text-white/40 text-sm uppercase tracking-widest mb-8">System Overload Detected</p>

              <div className="grid grid-cols-2 gap-4 w-full mb-10">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Final Score</div>
                  <div className="text-3xl font-bold tracking-tighter">{score}</div>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Coins Collected</div>
                  <div className="text-3xl font-bold tracking-tighter">{coins}</div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-5 rounded-2xl font-bold text-lg hover:bg-cyan-400 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                RETRY MISSION
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette & Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
};
