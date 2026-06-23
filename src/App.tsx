/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  Zap, 
  Compass, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
  Trophy
} from 'lucide-react';
import { LEVELS, generateProceduralLevel } from './levels';
import GameBoard from './components/GameBoard';
import LevelSelector from './components/LevelSelector';
import InstructionModal from './components/InstructionModal';
import { Level } from './types';
import { playSfx } from './utils/audio';

export default function App() {
  // Saved completions format: Record<levelId, { stars: number; score: number }>
  const [completedLevels, setCompletedLevels] = useState<Record<number, { stars: number; score: number }>>({});
  
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [isEndlessMode, setIsEndlessMode] = useState<boolean>(false);
  const [endlessDifficultyIndex, setEndlessDifficultyIndex] = useState<number>(1);
  const [activeLevel, setActiveLevel] = useState<Level>(LEVELS[0]);
  
  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(true); // Start with instructions open so they get the unique mechanic instantly!
  const [showGlobalVictory, setShowGlobalVictory] = useState<boolean>(false);

  // Cumulative score records
  const [highScore, setHighScore] = useState<number>(0);

  // Sound play states
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('echoweave_mute') === 'true';
    } catch {
      return false;
    }
  });

  const toggleMute = () => {
    const newValue = !isMuted;
    setIsMuted(newValue);
    try {
      localStorage.setItem('echoweave_mute', String(newValue));
      if (!newValue) {
        playSfx('move');
      }
    } catch (e) {
      console.error("Could not write mute state to localStorage:", e);
    }
  };

  // --- Load localStorage on Boot ---
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('echoweave_completions');
      if (savedData) {
        setCompletedLevels(JSON.parse(savedData));
      }
      const savedScore = localStorage.getItem('echoweave_highscore');
      if (savedScore) {
        setHighScore(parseInt(savedScore, 10));
      }
    } catch (e) {
      console.error("Could not load paradox save data:", e);
    }
  }, []);

  // Update current active level based on states
  useEffect(() => {
    if (isEndlessMode) {
      setActiveLevel(generateProceduralLevel(endlessDifficultyIndex));
    } else {
      setActiveLevel(LEVELS[currentLevelIndex]);
    }
  }, [currentLevelIndex, isEndlessMode, endlessDifficultyIndex]);

  // --- Handlers ---
  const handleLevelComplete = (stars: number, score: number) => {
    const levelId = activeLevel.id;
    
    // Save completion
    const updated = {
      ...completedLevels,
      [levelId]: { stars, score }
    };
    setCompletedLevels(updated);
    try {
      localStorage.setItem('echoweave_completions', JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save completion to localStorage:", e);
    }

    // Highscore updates
    const currentTotalScore = Object.values(updated).reduce((acc, curr: any) => acc + curr.score, 0);
    if (currentTotalScore > highScore) {
      setHighScore(currentTotalScore);
      try {
        localStorage.setItem('echoweave_highscore', currentTotalScore.toString());
      } catch (e) {
        console.warn("Could not save highscore to localStorage:", e);
      }
    }

    // Progression logic
    if (isEndlessMode) {
      // Endless progression: increase procedural index infinitely
      setEndlessDifficultyIndex((prev) => prev + 1);
    } else {
      // Regular levels: check if finished all levels
      if (currentLevelIndex < LEVELS.length - 1) {
        setTimeout(() => {
          setCurrentLevelIndex((prev) => prev + 1);
        }, 1000);
      } else {
        // High level accomplishment!
        setShowGlobalVictory(true);
      }
    }
  };

  const handleSelectLevel = (idx: number) => {
    setIsEndlessMode(false);
    setCurrentLevelIndex(idx);
  };

  const handleSelectEndless = () => {
    setIsEndlessMode(true);
    setEndlessDifficultyIndex(1);
  };

  const handleClearProgress = () => {
    if (confirm("Are you sure you want to completely wipe your quantum timeline progress? This resets all level scores.")) {
      setCompletedLevels({});
      setHighScore(0);
      setCurrentLevelIndex(0);
      setIsEndlessMode(false);
      try {
        localStorage.removeItem('echoweave_completions');
        localStorage.removeItem('echoweave_highscore');
      } catch (e) {
        console.warn("Could not clear localStorage progress:", e);
      }
    }
  };

  const handleRestartActiveLevel = () => {
    // Toggles re-initialization of board
    const tempIndex = currentLevelIndex;
    setIsEndlessMode(isEndlessMode);
    if (isEndlessMode) {
      setEndlessDifficultyIndex(endlessDifficultyIndex);
    } else {
      setCurrentLevelIndex(tempIndex);
    }
  };

  const totalCalculatedStars = Object.values(completedLevels).reduce((acc, curr: any) => acc + curr.stars, 0);

  return (
    <div id="quantum-app-frame" className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#0A0A0F] text-slate-200 border-8 border-[#1A1A24]">
      
      {/* Background Neon ambient flares */}
      <div className="absolute top-[-10%] left-[5%] w-[45%] h-[45%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[45%] h-[45%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none select-none" />

      {/* Main Container Wrapper */}
      <div id="central-view-block" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-grow flex flex-col justify-between">
        
        {/* Header Block with high-contrast displays */}
        <header id="app-header-nav" className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-4 mb-4 bg-[#0E0E16] p-4 rounded-lg">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-10 h-10 border-2 border-cyan-400 rotate-45 flex items-center justify-center">
              <div className="w-6 h-6 border border-cyan-400 rotate-45 flex items-center justify-center">
                <Dna className="w-3.5 h-3.5 text-cyan-400 -rotate-90 animate-pulse" />
              </div>
            </div>

            <div className="leading-none">
              <h1 className="text-2xl font-display font-extrabold tracking-tighter uppercase text-white bg-clip-text">
                Symmetry Breach
              </h1>
              <span className="text-[10px] tracking-[0.3em] text-cyan-400/70 uppercase block font-mono">
                Dimensional Alignment Protocol (بائلل منفرد ایکو گیم)
              </span>
            </div>
          </div>

          {/* Cumulative Stats Dashboard */}
          <div className="flex items-center gap-4 flex-wrap select-none">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-white/5 border border-white/10 text-xs">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest">Cosmic Highscore</div>
                <div className="font-mono font-bold text-white">{highScore} pts</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-white/5 border border-white/10 text-xs">
              <div className="flex text-rose-400">
                <Star className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest">Acquired Stars</div>
                <div className="font-mono font-bold text-cyan-400">{totalCalculatedStars} ★</div>
              </div>
            </div>

            {/* General Utilities buttons */}
            <div className="flex items-center gap-2">
              <button
                id="utility-sound-btn"
                onClick={toggleMute}
                title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
                className={`w-9 h-9 rounded-sm border flex items-center justify-center transition-all cursor-pointer ${
                  isMuted 
                    ? "bg-amber-950/20 hover:bg-amber-950/40 border-amber-500/30 text-amber-500" 
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-cyan-400"
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                id="utility-help-btn"
                onClick={() => setIsHelpOpen(true)}
                title="View Mechanic Rules"
                className="w-9 h-9 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-cyan-400 transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                id="utility-clear-btn"
                onClick={handleClearProgress}
                title="Wipe chronology database memory"
                className="w-9 h-9 rounded-sm bg-white/5 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 flex items-center justify-center text-rose-400 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Global Victory Overlay Screen if normal levels are beaten */}
        <AnimatePresence>
          {showGlobalVictory && (
            <motion.div
              id="champion-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-6"
            >
              <div className="bg-neutral-900 border border-yellow-500/30 max-w-lg w-full p-8 rounded-3xl text-center shadow-2xl space-y-6">
                <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500 rounded-full flex items-center justify-center mx-auto text-yellow-500 shadow-xl shadow-yellow-500/10 animate-bounce">
                  <Trophy className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-extrabold text-white">Quantum Loop Mastered!</h2>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Aapne saare standard level mukammal kar liye hain! You have restored sync across all 5 spatial paradox dimensions with pristine timeline execution.
                  </p>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 font-mono text-center">
                  <div className="text-xs text-neutral-400">Ultimate Star Rank</div>
                  <div className="text-4xl font-extrabold text-yellow-400">{totalCalculatedStars} ★</div>
                  <div className="text-[10px] text-neutral-500">Unlocked infinite procedurally scaled matrices!</div>
                </div>

                <div className="flex gap-3">
                  <button
                    id="finish-win-regular-btn"
                    onClick={() => {
                      setShowGlobalVictory(false);
                      setIsEndlessMode(true);
                      setEndlessDifficultyIndex(1);
                    }}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Enter Infinite Paradox Mode
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    id="back-to-dims-btn"
                    onClick={() => setShowGlobalVictory(false)}
                    className="px-5 py-3 bg-neutral-805 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Review Map Grid
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play Space Grid or Select Levels layouts */}
        <div id="gameplay-viewport" className="flex-grow flex flex-col justify-center space-y-8 my-2">
          
          {/* Section 1: Active Game Dashboard */}
          <div id="active-play-header" className="bg-[#0E0E16]/40 border border-white/10 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-cyan-400">
            
            {/* Left label metadata */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase ${
                  isEndlessMode 
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' 
                    : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                }`}>
                  {isEndlessMode ? `Procedural Anomaly Matrix` : `Preset Dimension ${activeLevel.id}`}
                </span>

                {/* Star completion count */}
                {!isEndlessMode && completedLevels[activeLevel.id] && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Solve Verified
                  </span>
                )}
              </div>
              
              <h2 className="text-lg sm:text-xl font-display font-bold text-white leading-tight uppercase tracking-tight">
                {activeLevel.name} <span className="text-neutral-500 font-normal">|</span> <span className="font-normal text-cyan-300">{activeLevel.nameUrdu}</span>
              </h2>
              
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {activeLevel.description}
              </p>

              <p className="text-[11px] text-slate-400 italic" dir="rtl">
                {activeLevel.descriptionUrdu}
              </p>
            </div>

            {/* Right Reset / Action layout */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
              <button
                id="reset-current-challenge-btn"
                onClick={handleRestartActiveLevel}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#0E0E16] border border-white/10 hover:bg-neutral-800 text-xs font-bold rounded-sm text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Run (ری سیٹ)
              </button>
            </div>
          </div>

          {/* Section 2: Active Arena Map Component */}
          <GameBoard 
            level={activeLevel} 
            onLevelComplete={handleLevelComplete}
            onResetLevel={handleRestartActiveLevel}
          />

          {/* Section 3: Dimensions Selection lists */}
          <div className="bg-neutral-950/20 border border-neutral-900/60 p-6 rounded-2xl">
            <LevelSelector 
              levels={LEVELS} 
              completedLevels={completedLevels}
              currentLevelIndex={currentLevelIndex}
              onSelectLevel={handleSelectLevel}
              onSelectEndlessMode={handleSelectEndless}
              isEndlessActive={isEndlessMode}
            />
          </div>

        </div>

        {/* Footer info brand */}
        <footer id="app-footer-bar" className="flex flex-col sm:flex-row items-center justify-between border-t border-neutral-900 pt-6 mt-8 text-neutral-500 text-[11px] font-mono gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Temporal Echo Engines online: Local WebGL Context active</span>
          </div>

          <div>
            <span>Developed as standard-compliant responsive HTML5 web game</span>
          </div>
        </footer>

      </div>

      {/* Instruction Rules help Modal component popup */}
      <InstructionModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />

    </div>
  );
}
