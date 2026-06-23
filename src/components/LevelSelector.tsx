/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Star, Sparkles, Key, Lock, ChevronRight } from 'lucide-react';
import { Level } from '../types';

interface LevelSelectorProps {
  levels: Level[];
  completedLevels: Record<number, { stars: number; score: number }>;
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
  onSelectEndlessMode: () => void;
  isEndlessActive: boolean;
}

export default function LevelSelector({
  levels,
  completedLevels,
  currentLevelIndex,
  onSelectLevel,
  onSelectEndlessMode,
  isEndlessActive
}: LevelSelectorProps) {
  return (
    <div id="level-selector-parent" className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-white tracking-widest flex items-center gap-2 uppercase font-mono">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Select Paradox Dimension</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a recorded anomaly matrix. Solve each paradox to unlock downstream time-lattices!
          </p>
        </div>

        {/* Endless Mode Portal Card */}
        <button
          id="custom-endless-mode-btn"
          onClick={onSelectEndlessMode}
          className={`relative overflow-hidden group px-5 py-3 rounded-sm border transition-all duration-300 md:w-auto w-full text-left flex items-center justify-between cursor-pointer ${
            isEndlessActive 
              ? 'bg-gradient-to-r from-purple-950 to-[#0E0E16] border-purple-500 shadow-lg' 
              : 'bg-[#0E0E16] border-white/10 hover:border-purple-500/50 hover:bg-neutral-800/30'
          }`}
        >
          <div className="absolute top-0 right-0 p-8 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center gap-3 font-mono">
            <div className={`p-2 rounded-sm ${isEndlessActive ? 'bg-purple-500/20 text-purple-300' : 'bg-[#0A0A0F] text-slate-400 border border-white/5'}`}>
              <Key className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-sans font-bold text-sm text-yellow-300 flex items-center gap-1.5 uppercase">
                <span>Infinite Paradox</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-purple-600/30 text-purple-300 font-mono rounded-sm border border-purple-500/20 uppercase tracking-widest">Procedural</span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans">Continuous progressive difficulty scales forever</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-405 group-hover:text-purple-300 group-hover:translate-x-1 transition-all ml-4" />
        </button>
      </div>

      {/* Grid selector of levels */}
      <div id="levels-grids-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((lvl, index) => {
          const isCompleted = !!completedLevels[lvl.id];
          const record = completedLevels[lvl.id];
          const isCurrent = currentLevelIndex === index && !isEndlessActive;

          // Locks logic: Unlocking requirements (first level remains open, next levels open once the prior level is completed)
          const isLocked = index > 0 && !completedLevels[levels[index - 1].id];

          return (
            <div
              key={lvl.id}
              id={`selector-card-level-${lvl.id}`}
              onClick={() => {
                if (!isLocked) onSelectLevel(index);
              }}
              className={`relative overflow-hidden p-5 rounded-sm border transition-all duration-300 flex flex-col justify-between min-h-[160px] ${
                isLocked 
                  ? 'bg-[#0E0E16]/20 border-white/5 opacity-40 cursor-not-allowed'
                  : isCurrent
                  ? 'bg-[#0E0E16]/80 border-cyan-400 scale-[1.01] shadow-lg shadow-cyan-500/10'
                  : 'bg-[#0E0E16]/45 border-white/10 hover:border-cyan-400/50 hover:bg-neutral-800/20 cursor-pointer'
              }`}
            >
              {/* Card top banner */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-mono text-[9px]">
                    <span className="text-cyan-400 font-bold uppercase tracking-widest">
                      DIMENSION {index + 1}
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-slate-400 uppercase">
                      {lvl.difficultyTitle}
                    </span>
                  </div>
                  <h3 className="font-mono font-extrabold text-white text-base leading-snug uppercase tracking-wide">
                    {lvl.name}
                  </h3>
                  <p className="text-[10px] text-cyan-400/80 font-mono" dir="rtl">
                    {lvl.nameUrdu}
                  </p>
                </div>

                {isLocked ? (
                  <div className="p-2 bg-[#0A0A0F] text-slate-500 rounded-sm border border-white/5">
                    <Lock className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          isCompleted && record && i < record.stars 
                            ? 'fill-rose-500 text-rose-500' 
                            : 'text-neutral-700'
                        }`} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Description text */}
              <p className="text-xs text-slate-300 mt-2 line-clamp-2 font-sans leading-relaxed">
                {lvl.description}
              </p>

              {/* Card Bottom status layout */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[11px] font-mono">
                {isCompleted ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-emerald-400/10" /> SOLVE VALUE: {record?.score}
                  </span>
                ) : isLocked ? (
                  <span className="text-slate-505">LOCKED MATRIX</span>
                ) : (
                  <span className="text-cyan-400 flex items-center gap-1 font-mono">
                    <Play className="w-3 h-3 text-cyan-400 fill-cyan-400/10" /> PORTAL OPEN
                  </span>
                )}

                <div className="flex gap-2 text-slate-400 text-[9px] font-mono">
                  <span>⏰ Max: {lvl.loopDuration}s</span>
                  <span>🧬 {lvl.maxEchoes} Loops</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
