/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCw, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  Compass, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Award,
  Zap,
  HelpCircle,
  Clock,
  Play
} from 'lucide-react';
import { Level, Position, Echo, GridTile, EchoAction } from '../types';
import { playSfx } from '../utils/audio';

interface GameBoardProps {
  level: Level;
  onLevelComplete: (stars: number, score: number) => void;
  onResetLevel: () => void;
}

const ECHO_COLORS = [
  'rgba(168, 85, 247, 0.65)', // purple
  'rgba(236, 72, 153, 0.65)', // pink
  'rgba(249, 115, 22, 0.65)',  // orange
  'rgba(6, 182, 212, 0.65)',  // cyan
];

export default function GameBoard({ level, onLevelComplete, onResetLevel }: GameBoardProps) {
  // --- Game States ---
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [stepCount, setStepCount] = useState<number>(0);
  const [playerHistory, setPlayerHistory] = useState<Position[]>([]);
  const [echoes, setEchoes] = useState<Echo[]>([]);
  
  // Real-time difficulty variables
  const [realTimeLeft, setRealTimeLeft] = useState<number>(level.loopDuration);
  const [temporalStability, setTemporalStability] = useState<number>(100); // 100% to 0%
  const [levelElapsedSeconds, setLevelElapsedSeconds] = useState<number>(0);
  
  // Collectibles and locks
  const [collectedKeys, setCollectedKeys] = useState<Set<string>>(new Set());
  const [collectedCrystals, setCollectedCrystals] = useState<Set<string>>(new Set());
  const [doorStates, setDoorStates] = useState<Record<string, boolean>>({}); // doorId -> isOpen
  const [laserPaths, setLaserPaths] = useState<Set<string>>(new Set()); // set of "y,x" with active laser beams

  // Game flow states
  const [gameState, setGameState] = useState<'playing' | 'vaporized' | 'collapsed' | 'victory'>('playing');
  const [starsAwarded, setStarsAwarded] = useState<number>(0);
  const [calculatedScore, setCalculatedScore] = useState<number>(0);

  // Sound/Vibe feedback message (Urdu-English logs)
  const logIdCounter = useRef<number>(1);
  const [logs, setLogs] = useState<{ id: number; text: string; textUrdu: string; type: 'info' | 'warn' | 'success' }[]>([
    { id: 1, text: "Paradox Loop Initialized. Find the exit!", textUrdu: "وقت کا دائرہ شروع۔ باہر نکلنے کا راستہ تلاش کریں!", type: 'info' }
  ]);

  // Keep track of Start portal coordinates
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });

  // Add event listener refs
  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(null);

  // --- Real-Time Game Loop (Time-based scaling difficulty) ---
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Timer for loop countdown
    const timer = setInterval(() => {
      setRealTimeLeft((prev) => {
        const next = Math.max(0, prev - 0.1);
        if (next <= 0) {
          handleTemporalCollapse();
          return 0;
        }
        return next;
      });

      // Gradually decrease temporal stability with time & loops
      // Every loop decreases starting stability, and within a loop it slowly drains
      setTemporalStability((prev) => {
        const decayRate = 1 + (echoes.length * 0.5); // difficulty increases with more loop clones
        const next = Math.max(0, 100 - ((level.loopDuration - realTimeLeft) / level.loopDuration) * 100);
        return next;
      });
    }, 100);

    // Level elapsed timer
    const elapsedTimer = setInterval(() => {
      setLevelElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(elapsedTimer);
    };
  }, [gameState, realTimeLeft, echoes.length, level.loopDuration]);

  // Push new customized logs
  const pushLog = (text: string, textUrdu: string, type: 'info' | 'warn' | 'success' = 'info') => {
    logIdCounter.current += 1;
    const uniqueId = Date.now() * 1000 + logIdCounter.current;
    setLogs((prev) => [
      { id: uniqueId, text, textUrdu, type },
      ...prev.slice(0, 4) // keep last 5 logs
    ]);
  };

  // --- Map Parser: Setup Starting States ---
  useEffect(() => {
    let checkStart: Position = { x: 1, y: 1 };
    const initialKeys = new Set<string>();
    const initialCrystals = new Set<string>();
    
    level.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'S') {
          checkStart = { x, y };
        }
      });
    });

    setStartPos(checkStart);
    setPlayerPos(checkStart);
    setPlayerHistory([checkStart]);
    setStepCount(0);
    setEchoes([]);
    setCollectedKeys(new Set());
    setCollectedCrystals(new Set());
    setDoorStates({});
    setRealTimeLeft(level.loopDuration);
    setTemporalStability(100);
    setGameState('playing');
    logIdCounter.current += 1;
    const uniqueId = Date.now() * 1000 + logIdCounter.current;
    setLogs([
      { id: uniqueId, text: `Paradox Level: ${level.name} started!`, textUrdu: `لیول شروع: ${level.nameUrdu}`, type: 'info' }
    ]);
  }, [level]);

  // --- Dynamic Laser & Switch Traces ---
  // Run on movement or switch changes
  useEffect(() => {
    recalculateEnvironment();
  }, [playerPos, stepCount, echoes, level]);

  const recalculateEnvironment = () => {
    // 1. Determine active pressure plates
    const activePlates = new Set<string>();

    const checkStateAtCoordinate = (x: number, y: number): boolean => {
      // Check if active player is on plate
      if (playerPos.x === x && playerPos.y === y) return true;
      // Check if any echo is on plate
      for (const echo of echoes) {
        const actionAtStep = echo.path.find(a => a.step === stepCount);
        const currentAction = actionAtStep || echo.path[echo.path.length - 1]; // stay at final step
        if (currentAction && currentAction.pos.x === x && currentAction.pos.y === y) {
          return true;
        }
      }
      return false;
    };

    // Scan level grid for plates
    level.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        // Find plates: can be marked P, Q, Y, M, N, Z
        if (['P', 'Q', 'Y', 'M', 'N', 'Z'].includes(cell)) {
          const isPressed = checkStateAtCoordinate(x, y);
          const tileInfo = level.tileData[`${y},${x}`];
          if (tileInfo && tileInfo.id && isPressed) {
            activePlates.add(tileInfo.id);
          }
        }
      });
    });

    // 2. Open doors linked to active plates
    const newDoorStates: Record<string, boolean> = {};
    level.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'D') {
          const tileInfo = level.tileData[`${y},${x}`];
          if (tileInfo && tileInfo.id) {
            const triggerId = tileInfo.triggerId || '';
            const isOpen = activePlates.has(triggerId);
            newDoorStates[tileInfo.id] = isOpen;
          }
        }
      });
    });
    setDoorStates(newDoorStates);

    // 3. Cast laser rays
    const lasers = new Set<string>();
    level.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'L') {
          // Find standard directional shooting (tut level: right, proc: right)
          // Shoot rightwards until hitting wall or closed door or any character
          let laserX = x + 1;
          while (laserX < row.length) {
            const tileCell = level.grid[y][laserX];
            
            // Check if laser ray is blocked by wall
            if (tileCell === '#') break;

            // Check if laser is blocked by closed door
            if (tileCell === 'D') {
              const doorInfo = level.tileData[`${y},${laserX}`];
              const doorOpen = doorInfo ? newDoorStates[doorInfo.id] : false;
              if (!doorOpen) break;
            }

            // Check if laser is blocked by active player
            if (playerPos.x === laserX && playerPos.y === y) {
              lasers.add(`${y},${laserX}`);
              break;
            }

            // Check if laser is blocked by any echo blocking it
            let echoBlocked = false;
            for (const echo of echoes) {
              const actionAtStep = echo.path.find(a => a.step === stepCount);
              const currentAction = actionAtStep || echo.path[echo.path.length - 1];
              if (currentAction && currentAction.pos.x === laserX && currentAction.pos.y === y) {
                echoBlocked = true;
                break;
              }
            }

            lasers.add(`${y},${laserX}`);
            if (echoBlocked) {
              break; // stops propagating further
            }

            laserX++;
          }
        }
      });
    });
    setLaserPaths(lasers);

    // 4. Verify player collisions with lasers
    if (lasers.has(`${playerPos.y},${playerPos.x}`)) {
      handleVaporization();
    }
  };

  // --- Handlers for Collides & Loop Resets ---
  const handleVaporization = () => {
    if (gameState !== 'playing') return;
    setGameState('vaporized');
    pushLog("Temporal Collision! Laser beam vaporized your active player.", "لیزر کی شعاع نے آپ کو جلا دیا! وقت دوبارہ شروع۔", 'warn');
    playSfx('laser_death');
    
    setTimeout(() => {
      resetCurrentRun(false); // Reset run, do NOT record this bad loop
    }, 1200);
  };

  const handleTemporalCollapse = () => {
    if (gameState !== 'playing') return;
    setGameState('collapsed');
    pushLog("Temporal Stability collapsed! Shifting loop paradigm...", "جذاتی زلزلہ! پائیداری ختم۔ وقت ری سیٹ۔", 'warn');
    playSfx('laser_death');
    
    setTimeout(() => {
      resetCurrentRun(false);
    }, 1200);
  };

  // User manual trigger: "Record past self and trigger next Loop"
  const handleRecordNewLoop = () => {
    if (gameState !== 'playing') return;
    if (echoes.length >= level.maxEchoes) {
      pushLog(`Max echoes (${level.maxEchoes}) reached! Cannot spawn more timelines. Clear levels manually.`, "ماضی کی گونج برقرار رکھنے کی حد ختم ہو گئی!", 'warn');
      return;
    }

    // Convert playerHistory path into custom actions format
    const echoPath: EchoAction[] = playerHistory.map((pos, step) => ({
      step,
      pos
    }));

    const newEcho: Echo = {
      id: `echo-${echoes.length}`,
      color: ECHO_COLORS[echoes.length % ECHO_COLORS.length],
      path: echoPath
    };

    setEchoes((prev) => [...prev, newEcho]);
    pushLog(`Paradox Loop #${echoes.length + 1} Spawned! Past clone is repeating your footprints.`, `ماضی کے ہمزاد کا جنم #${echoes.length + 1}! اب وہ آپ کی نقل کرے گا۔`, 'success');
    playSfx('loop_reset');
    
    resetCurrentRun(true);
  };

  const resetCurrentRun = (preserveEchoes = true) => {
    setPlayerPos(startPos);
    setPlayerHistory([startPos]);
    setStepCount(0);
    setRealTimeLeft(level.loopDuration);
    setTemporalStability(100);
    setGameState('playing');
    if (!preserveEchoes) {
      setEchoes([]); // clear past echoes on total collapse/failure
      setCollectedKeys(new Set());
      setCollectedCrystals(new Set());
      setDoorStates({});
    }
  };

  const resetTotalLevel = () => {
    resetCurrentRun(false);
    pushLog("Manual Reset: Timeline completely purged.", "تمام وقتی دھاگے مٹ گئے۔ نئے سرے سے کھیلیں!", 'info');
  };

  // --- Human & Tap Movement Controls ---
  const attemptMove = (dx: number, dy: number) => {
    if (gameState !== 'playing') return;

    const targetX = playerPos.x + dx;
    const targetY = playerPos.y + dy;

    // Check bounds
    if (targetY < 0 || targetY >= level.grid.length || targetX < 0 || targetX >= level.grid[0].length) return;

    const targetCell = level.grid[targetY][targetX];

    // Solid Wall Collision
    if (targetCell === '#') return;

    // Closed Door Collision
    if (targetCell === 'D') {
      const doorInfo = level.tileData[`${targetY},${targetX}`];
      const doorOpen = doorInfo ? doorStates[doorInfo.id] : false;
      if (!doorOpen) {
        pushLog("The Temporal Door is locked. Must stand on Pressure Switch!", "یہ مقناطیسی دروازہ بند ہے۔ سوئچ تلاش کریں!", 'warn');
        return;
      }
    }

    // Move is valid
    const newPos = { x: targetX, y: targetY };
    const nextStep = stepCount + 1;
    
    setPlayerPos(newPos);
    setStepCount(nextStep);
    setPlayerHistory((prev) => [...prev, newPos]);

    // Dynamic Element interactions (Keys, Crystals, Exit Portals)
    const coordinateKey = `${targetY},${targetX}`;
    let collectedSomething = false;
    
    if (targetCell === 'K' && !collectedKeys.has(coordinateKey)) {
      const updateSet = new Set(collectedKeys);
      updateSet.add(coordinateKey);
      setCollectedKeys(updateSet);
      pushLog("Temporal Key acquired! Exit Portal unlocked.", "چابی مل گئی! اب باہر نکلنے کا راستہ کھلا ہے۔", 'success');
      playSfx('crystal');
      collectedSomething = true;
    }

    if (targetCell === 'C' && !collectedCrystals.has(coordinateKey)) {
      const updateSet = new Set(collectedCrystals);
      updateSet.add(coordinateKey);
      setCollectedCrystals(updateSet);
      pushLog("Gold Time-Crystal merged. (+Star booster)", "سٹار کرسٹل مل گیا! بونس پوائنٹس۔", 'success');
      playSfx('crystal');
      collectedSomething = true;
    }

    // Exit Portal Reach Verification
    if (targetCell === 'E') {
      // Need to make sure they collected ALL keys in the map
      const totalKeysOnMap = level.grid.flat().filter(cell => cell === 'K').length;
      if (collectedKeys.size >= totalKeysOnMap) {
        handleVictoryCompletion();
        collectedSomething = true;
      } else {
        pushLog(`Access Denied! You still need to retrieve ${totalKeysOnMap - collectedKeys.size} Key(s).`, `راستہ نہیں ملا! ابھی مزید ${totalKeysOnMap - collectedKeys.size} چابیوں کی ضرورت ہے۔`, 'warn');
        playSfx('move');
        collectedSomething = true;
      }
    }

    if (!collectedSomething) {
      playSfx('move');
    }
  };

  const handleVictoryCompletion = () => {
    setGameState('victory');
    pushLog("Dimensional Sync Successful! Shifting to Next Anomaly Phase...", "کامیابی! پزل حل کر لیا گیا۔", 'success');
    playSfx('victory');

    // Score Calculations
    // 1 base stars for completion, additional for:
    // - stability index (finishing fast is awesome!)
    // - minimal loops used
    let starScore = 1;
    if (temporalStability > 60 && echoes.length <= 1) {
      starScore = 3;
    } else if (temporalStability > 30 && echoes.length <= 3) {
      starScore = 2;
    }

    const finalScore = Math.max(100, Math.floor(temporalStability * 10) + (collectedCrystals.size * 250) - (echoes.length * 150));
    setStarsAwarded(starScore);
    setCalculatedScore(finalScore);

    setTimeout(() => {
      onLevelComplete(starScore, finalScore);
    }, 1500);
  };

  // Keyboard Event Registry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          attemptMove(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          attemptMove(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          attemptMove(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          attemptMove(1, 0);
          break;
        case ' ': // Space for wait step
          e.preventDefault();
          // wait turn: player stays but step increases (echos move!)
          setStepCount((s) => s + 1);
          setPlayerHistory((prev) => [...prev, playerPos]);
          playSfx('move');
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRecordNewLoop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPos, stepCount, echoes, doorStates, gameState]);

  // --- Rendering helper functions ---
  const renderCellContent = (cell: string, y: number, x: number) => {
    const cellId = `${y},${x}`;
    const tileInfo = level.tileData[cellId];
    
    // Check if active player is here
    const isPlayerHere = playerPos.x === x && playerPos.y === y;

    // Check if some echoes are here right now at current step
    const activeEchoesHere = echoes.filter((echo) => {
      const actionAtStep = echo.path.find(a => a.step === stepCount);
      const currentAction = actionAtStep || echo.path[echo.path.length - 1];
      return currentAction && currentAction.pos.x === x && currentAction.pos.y === y;
    });

    const hasLaser = laserPaths.has(cellId);

    // Dynamic coloring of door if active or locked
    let isDoorOpen = false;
    if (cell === 'D' && tileInfo && tileInfo.id) {
      isDoorOpen = doorStates[tileInfo.id];
    }

    return (
      <div 
        key={cellId}
        id={`cell-${y}-${x}`}
        className={`relative w-full aspect-square border ${
          cell === '#' 
            ? 'bg-neutral-800 border-neutral-700/60 shadow-inner' 
            : 'bg-neutral-900 border-neutral-800'
        } rounded-md flex items-center justify-center overflow-hidden`}
      >
        {/* Cell Coordinates for development readability */}
        <span className="absolute top-0.5 left-0.5 text-[7px] text-neutral-600 font-mono select-none">
          {y},{x}
        </span>

        {/* Laser graphic overlay */}
        {hasLaser && cell !== '#' && cell !== 'L' && (
          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] animate-pulse flex items-center justify-center">
            <div className="h-1.5 w-full bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
          </div>
        )}

        {/* Dynamic Items */}
        {cell === 'S' && (
          <div className="w-5/6 h-5/6 rounded-full border-2 border-indigo-500/50 bg-indigo-505/10 flex items-center justify-center shadow-[0_0_8px_rgba(99,102,241,0.3)]">
            <Compass className="w-4 h-4 text-indigo-400 rotate-45" />
          </div>
        )}

        {cell === 'E' && (
          <div className={`w-5/6 h-5/6 rounded-full border-2 ${
            collectedKeys.size >= level.grid.flat().filter(c => c === 'K').length
              ? 'border-emerald-500 bg-emerald-500/20 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'border-yellow-500/40 bg-yellow-500/5 cursor-not-allowed'
          } flex items-center justify-center transition-all duration-300`}>
            <div className={`w-2.5 h-2.5 rounded-full ${
              collectedKeys.size >= level.grid.flat().filter(c => c === 'K').length
                ? 'bg-emerald-400 animate-ping'
                : 'bg-yellow-600'
            }`} />
          </div>
        )}

        {cell === 'K' && !collectedKeys.has(cellId) && (
          <motion.div 
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-amber-400 flex items-center justify-center"
          >
            <div className="w-3.5 h-3.5 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-sm rotate-45 border border-white/20 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center justify-center">
              <span className="text-[8px] font-bold text-neutral-900 -rotate-45">K</span>
            </div>
          </motion.div>
        )}

        {cell === 'C' && !collectedCrystals.has(cellId) && (
          <motion.div 
            animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="text-cyan-400 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
          </motion.div>
        )}

        {/* Pressure Plates */}
        {['P', 'Q', 'Y', 'M', 'N', 'Z'].includes(cell) && (
          <div className="absolute inset-1 rounded-md border border-dashed border-amber-500/30 flex items-center justify-center bg-amber-500/5 font-sans">
            <span className="text-[10px] font-bold font-mono text-amber-500/60">{cell}</span>
          </div>
        )}

        {/* Temporal Doors */}
        {cell === 'D' && (
          <div className={`absolute inset-1 rounded-md border flex items-center justify-center transition-all duration-300 ${
            isDoorOpen 
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500/40 line-through' 
              : 'border-amber-500 bg-amber-950/40 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
          }`}>
            <span className="text-[9px] font-mono font-bold">{isDoorOpen ? "OPEN" : "LOCK"}</span>
          </div>
        )}

        {/* Laser Emitters and Receivers */}
        {cell === 'L' && (
          <div className="w-4/5 h-4/5 rounded bg-rose-950 border border-rose-500 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.4)]">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
        )}

        {cell === 'R' && (
          <div className="w-4/5 h-4/5 rounded bg-neutral-950 border border-neutral-700 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          </div>
        )}

        {/* Past Echo Clones sitting inside cell */}
        {activeEchoesHere.map((echo, index) => (
          <motion.div
            key={echo.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute z-20 w-3/4 h-3/4 rounded-full flex items-center justify-center shadow-lg border-2 border-white/40"
            style={{ 
              backgroundColor: echo.color,
              filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.5))',
              transform: `translateY(${index * -1.5}px)`
            }}
          >
            <span className="text-[8px] font-extrabold text-neutral-950 font-mono">
              E{echo.id.split('-')[1]}
            </span>
          </motion.div>
        ))}

        {/* Active Player Render */}
        {isPlayerHere && (
          <motion.div 
            id="active-player-sphere"
            layoutId="player"
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="absolute z-30 w-4/5 h-4/5 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 border border-white flex items-center justify-center shadow-lg shadow-indigo-500/50"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div id="game-arena" className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto py-2">
      {/* Left Utilities & Stats */}
      <div id="game-status-left" className="space-y-4 lg:col-span-1 flex flex-col justify-between">
        
        {/* Paradigm stats card */}
        <div className="bg-[#0E0E16] border border-white/10 p-5 rounded-sm space-y-4 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-sans flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM PHASE
            </span>
            <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold tracking-wider uppercase bg-cyan-400/10 text-cyan-400 border border-cyan-400/20`}>
              {level.difficultyTitle}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-[#0A0A0F] p-2.5 rounded-sm border border-white/5">
              <div className="text-[10px] text-slate-400">STABILITY</div>
              <div className={`text-base font-bold font-mono ${temporalStability < 35 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`}>
                {temporalStability.toFixed(0)}%
              </div>
            </div>

            <div className="bg-[#0A0A0F] p-2.5 rounded-sm border border-white/5">
              <div className="text-[10px] text-slate-400">LOOP TIMER</div>
              <div className={`text-base font-bold font-mono ${realTimeLeft < 3 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                {realTimeLeft.toFixed(1)}s
              </div>
            </div>
          </div>

          {/* Progress bar for timer */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Time-drift Decay:</span>
              <span className="text-cyan-400">{realTimeLeft.toFixed(1)}s / {level.loopDuration}s</span>
            </div>
            <div className="w-full bg-[#0A0A0F] h-2 rounded-sm overflow-hidden border border-white/5 p-0.5">
              <motion.div 
                className={`h-full rounded-sm bg-gradient-to-r ${temporalStability < 35 ? 'from-rose-500 to-red-600 shadow-[0_0_8px_#ef4444]' : 'from-cyan-500 to-indigo-500'}`}
                animate={{ width: `${(realTimeLeft / level.loopDuration) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-[#0A0A0F] border border-white/5 rounded-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shrink-0" />
              <div className="text-[10px] leading-tight text-slate-400 font-mono">
                <span className="text-white font-bold block">{echoes.length} / {level.maxEchoes}</span>
                Echoes
              </div>
            </div>

            <div className="p-2 bg-[#0A0A0F] border border-white/5 rounded-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
              <div className="text-[10px] leading-tight text-slate-400 font-mono">
                <span className="text-white font-bold block">
                  {collectedKeys.size} / {level.grid.flat().filter(c => c === 'K').length}
                </span>
                Exit Keys
              </div>
            </div>
          </div>
        </div>

        {/* Real-time scaling info box */}
        <div className="bg-[#0E0E16]/80 border border-white/10 rounded-sm p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Time-Scaling challenge</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Every second spends fuel! In higher dimensions, your <strong>Stability index</strong> degrades continuously. Faster solutions preserve space grids from chaotic collapsing.
          </p>
          <div className="flex justify-between items-center bg-[#0Ref]/10 bg-[#0A0A0F] p-2 rounded-sm border border-white/5 text-xs font-mono">
            <span className="text-slate-400">Elapsed Run:</span>
            <span className="text-rose-400 tracking-widest font-bold">{levelElapsedSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Center Interactive Game Board Grid */}
      <div id="game-core-center" className="lg:col-span-2 flex flex-col items-center">
        
        {/* Playfield Container */}
        <div className="relative w-full aspect-square max-w-[480px] bg-[#0E0E16] p-4 border-2 border-cyan-400 rounded-sm shadow-2xl shadow-cyan-950/30 flex flex-col justify-center">
          
          {/* Collapse Overlay */}
          <AnimatePresence>
            {gameState !== 'playing' && (
              <motion.div 
                id="board-game-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0A0A0F]/95 backdrop-blur-md z-40 rounded-sm flex flex-col items-center justify-center p-6 text-center border-l-4 border-cyan-400"
              >
                {gameState === 'vaporized' && (
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 border-2 border-rose-500 text-rose-500 rounded-sm flex items-center justify-center mx-auto bg-rose-500/10 rotate-45">
                      <AlertTriangle className="w-8 h-8 -rotate-45" />
                    </div>
                    <h3 className="font-mono font-bold text-white text-lg tracking-widest uppercase">TEMPORAL VAPORIZATION</h3>
                    <p className="text-xs text-slate-300 max-w-sm">
                      Your molecule sync disrupted by energy laser. Resetting safe temporal pathway...
                    </p>
                  </motion.div>
                )}

                {gameState === 'collapsed' && (
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 border-2 border-amber-500 text-amber-500 rounded-sm flex items-center justify-center mx-auto bg-amber-500/10 rotate-45">
                      <RefreshCw className="w-8 h-8 animate-spin -rotate-45" />
                    </div>
                    <h3 className="font-mono font-bold text-white text-lg tracking-widest uppercase">TEMPORAL DRIFT</h3>
                    <p className="text-xs text-slate-300 max-w-sm">
                      Stability reached 0%. Relocating timeline safely.
                    </p>
                  </motion.div>
                )}

                {gameState === 'victory' && (
                  <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 border-2 border-cyan-400 text-cyan-400 rounded-sm flex items-center justify-center mx-auto bg-cyan-400/10 rotate-45 shadow-lg shadow-cyan-500/20">
                      <Award className="w-8 h-8 -rotate-45" />
                    </div>
                    <h3 className="font-mono font-bold text-white text-xl tracking-widest uppercase">LOOP METRIC COMPLETED</h3>
                    <p className="text-xs text-cyan-400 font-semibold font-mono">
                      UNLOCKED NEXT TEMPORAL GATE SUCCESSFULLY
                    </p>
                    <div className="flex gap-2 justify-center py-2 text-rose-400">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Sparkles 
                          key={i} 
                          className={`w-5 h-5 ${i < starsAwarded ? 'fill-rose-500 text-rose-500 opacity-100' : 'opacity-20'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Recorded Score: <span className="text-white text-sm font-bold">{calculatedScore}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid Render */}
          <div 
            id="rendering-grid-element"
            className="grid gap-1.5 w-full flex-grow"
            style={{ 
              gridTemplateRows: `repeat(${level.grid.length}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${level.grid[0].length}, minmax(0, 1fr))`
            }}
          >
            {level.grid.flatMap((row, y) => 
              row.map((cell, x) => renderCellContent(cell, y, x))
            )}
          </div>
        </div>

        {/* Touch / D-Pad Movement controls for Mobile Support */}
        <div id="touch-movement-controls" className="w-full max-w-xs mt-4 flex flex-col items-center gap-1 font-mono">
          <button
            id="pad-up"
            onClick={() => attemptMove(0, -1)}
            className="w-12 h-12 bg-[#0E0E16]/80 active:bg-cyan-500/20 hover:text-cyan-400 rounded-sm flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          
          <div className="flex gap-4">
            <button
              id="pad-left"
              onClick={() => attemptMove(-1, 0)}
              className="w-12 h-12 bg-[#0E0E16]/80 active:bg-cyan-500/20 hover:text-cyan-400 rounded-sm flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              id="pad-wait"
              onClick={() => {
                setStepCount((s) => s + 1);
                setPlayerHistory((prev) => [...prev, playerPos]);
              }}
              title="Wait active turn (Space)"
              className="w-16 h-12 bg-[#0E0E16]/90 border border-cyan-400/30 hover:border-cyan-400/60 active:bg-cyan-950/40 text-[10px] font-mono rounded-sm flex flex-col items-center justify-center text-cyan-400 transition-all cursor-pointer"
            >
              <span className="font-bold uppercase tracking-wider text-[8px]">WAIT</span>
              <span className="text-[7px] text-slate-500">(Space)</span>
            </button>

            <button
              id="pad-right"
              onClick={() => attemptMove(1, 0)}
              className="w-12 h-12 bg-[#0E0E16]/80 active:bg-cyan-500/20 hover:text-cyan-400 rounded-sm flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <button
            id="pad-down"
            onClick={() => attemptMove(0, 1)}
            className="w-12 h-12 bg-[#0E0E16]/80 active:bg-cyan-500/20 hover:text-cyan-400 rounded-sm flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right Controller Panel & System logs */}
      <div id="game-status-right" className="lg:col-span-1 space-y-4 flex flex-col justify-between">
        
        {/* Core loops list and temporal actions */}
        <div className="bg-[#0E0E16] border border-white/10 p-5 rounded-sm space-y-4 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
              RECORDED CHRONOLOGY
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              Steps: {stepCount}
            </span>
          </div>

          <div id="echoes-history-stack" className="space-y-2.5 max-h-[140px] overflow-y-auto">
            {echoes.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center py-4 leading-relaxed font-sans">
                No past templates in memory. Place pressure triggers or block laser to spawn!
              </div>
            ) : (
              echoes.map((echo, idx) => (
                <div 
                  key={echo.id} 
                  className="flex items-center justify-between p-2 rounded-sm bg-[#0A0A0F] border border-white/5 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-sm inline-block shrink-0 shadow" 
                      style={{ backgroundColor: echo.color }}
                    />
                    <span className="text-slate-200 font-mono font-bold">Echo E{idx}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {echo.path.length} positions
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <button
              id="record-echo-btn"
              onClick={handleRecordNewLoop}
              disabled={echoes.length >= level.maxEchoes || gameState !== 'playing'}
              className={`w-full py-2.5 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer uppercase font-mono ${
                echoes.length >= level.maxEchoes || gameState !== 'playing'
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-900'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/10 border border-cyan-400/20 active:scale-95'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              Reset & Spawn Past Echo (R)
            </button>

            <button
              id="completely-reset-btn"
              onClick={resetTotalLevel}
              className="w-full py-2 bg-[#0A0A0F] hover:bg-neutral-850 border border-white/10 text-slate-300 hover:text-white rounded-sm text-xs font-medium flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-mono uppercase tracking-wider"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge Chronology (Restart)
            </button>
          </div>
        </div>

        {/* Translation System / Chronos Log */}
        <div className="bg-[#0E0E16]/60 border border-white/10 rounded-sm p-4 space-y-3 shadow-md">
          <div className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-1.5 justify-between font-mono">
            <span>Terminal Paradox Echo Log</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-cyan-400 text-black font-mono font-bold animate-pulse">
              SYNC_ON
            </span>
          </div>

          <div id="chronos-log-container" className="space-y-2 h-[120px] overflow-y-auto">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className={`p-2 rounded-sm border text-[10px] leading-relaxed transition-all font-mono ${
                  log.type === 'success' 
                    ? 'bg-[#0E0E16]/90 border-emerald-500/30 text-emerald-300' 
                    : log.type === 'warn' 
                    ? 'bg-[#0E0E16]/90 border-rose-500/30 text-rose-300' 
                    : 'bg-[#0A0A0F] border-white/5 text-slate-300'
                }`}
              >
                <div className="font-semibold">{log.text}</div>
                <div className="text-[9px] font-sans text-slate-400 mt-0.5" dir="rtl">
                  {log.textUrdu}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
