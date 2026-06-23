/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Level, GridTile } from './types';

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "The First Echo",
    nameUrdu: "Pehli Goonj (پہلی گونج)",
    description: "Step on the pressure plate to open the door. Click 'Reset/Record Loop' to unleash your past self to hold it open while you run through!",
    descriptionUrdu: "پریشر پلیٹ پر قدم رکھیں۔ 'نیا لوپ' دبائیں تاکہ آپ کا ماضی کا روپ دروازہ کھلا رکھے جبکہ آپ آگے نکل جائیں!",
    maxEchoes: 3,
    loopDuration: 12,
    difficultyTitle: "Tutorial",
    grid: [
      ["#", "#", "#", "#", "#", "#", "#", "#"],
      ["#", "S", ".", ".", "#", "E", ".", "#"],
      ["#", ".", ".", ".", "D", ".", ".", "#"],
      ["#", ".", "P", ".", "#", "#", ".", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#"]
    ],
    tileData: {
      "3,2": { id: "plate-1", type: "plate", targetId: "door-1" },
      "2,4": { id: "door-1", type: "door", isLocked: true, triggerId: "plate-1" }
    }
  },
  {
    id: 2,
    name: "Dual Convergence",
    nameUrdu: "Do-Tarfa Mel (دو طرفہ میل)",
    description: "Collect the key to unlock the exit. You need to unlock two doors simultaneously. Use multiple past versions of yourself!",
    descriptionUrdu: "باہر نکلنے کے لیے چابی حاصل کریں۔ آپ کو ایک ساتھ دو دروازے کھولنے ہوں گے۔ اپنے کئی ماضی کے دوستوں کو بلائیں!",
    maxEchoes: 4,
    loopDuration: 14,
    difficultyTitle: "Easy",
    grid: [
      ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["#", "S", ".", ".", "#", "K", ".", ".", "#"],
      ["#", ".", ".", ".", "#", "#", "D", ".", "#"],
      ["#", "P", ".", ".", ".", "D", ".", ".", "#"],
      ["#", ".", ".", "Q", "#", "E", ".", ".", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#"]
    ],
    tileData: {
      "3,1": { id: "plate-1", type: "plate", targetId: "door-1" },
      "4,3": { id: "plate-2", type: "plate", targetId: "door-2" },
      "3,5": { id: "door-1", type: "door", isLocked: true, triggerId: "plate-1" },
      "2,6": { id: "door-2", type: "door", isLocked: true, triggerId: "plate-2" }
    }
  },
  {
    id: 3,
    name: "Temporal Shielding",
    nameUrdu: "Roshni Ka Dhal (روشنی کی ڈھال)",
    description: "A deadly laser emitter blocks your path. Guide your past loop to step in front of the laser emitter (block it!) so you can cross safely.",
    descriptionUrdu: "ایک خطرناک لیزر آپ کا راستہ روک رہی ہے۔ اپنے ماضی کے وجود کو لیزر کے سامنے کھڑا کریں (بلاکر بنیں!) تاکہ آپ بحفاظت گزر سکیں۔",
    maxEchoes: 4,
    loopDuration: 15,
    difficultyTitle: "Medium",
    grid: [
      ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["#", "S", ".", ".", "#", ".", ".", "E", "#"],
      ["#", ".", ".", ".", "#", ".", ".", ".", "#"],
      ["#", "L", ".", ".", ".", ".", ".", "R", "#"], // L is emitter, R is receiver, laser shoots right
      ["#", ".", ".", ".", "#", ".", ".", ".", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#"]
    ],
    tileData: {
      "3,1": { id: "emitter-1", type: "emitter", targetId: "receiver-1" },
      "3,7": { id: "receiver-1", type: "receiver" }
    }
  },
  {
    id: 4,
    name: "Triple Lock Paradox",
    nameUrdu: "Tihri Paheli (تہری پہلی)",
    description: "A complex matrix. Open three gates while dodging laser feeds and grabbing the glowing gold star crystals.",
    descriptionUrdu: "تین دروازے کھولیں، لیزر بیم سے بچیں اور سونے کے چمکدار سٹارز اکٹھے کریں۔",
    maxEchoes: 5,
    loopDuration: 20,
    difficultyTitle: "Hard",
    grid: [
      ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["#", "S", ".", ".", "D", ".", ".", "K", ".", ".", "#"],
      ["#", ".", "P", ".", "#", "#", "#", "#", "D", ".", "#"],
      ["#", "L", ".", ".", ".", ".", ".", ".", ".", "R", "#"],
      ["#", ".", "Q", ".", "#", "D", "#", ".", "Y", ".", "#"],
      ["#", "C", ".", ".", "E", ".", ".", ".", ".", ".", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
    ],
    tileData: {
      "2,2": { id: "plate-1", type: "plate", targetId: "door-1" },
      "4,2": { id: "plate-2", type: "plate", targetId: "door-2" },
      "4,8": { id: "plate-3", type: "plate", targetId: "door-3" },
      "1,4": { id: "door-1", type: "door", isLocked: true, triggerId: "plate-1" },
      "4,5": { id: "door-2", type: "door", isLocked: true, triggerId: "plate-2" },
      "2,8": { id: "door-3", type: "door", isLocked: true, triggerId: "plate-3" },
      "3,1": { id: "emitter-1", type: "emitter", targetId: "receiver-1" },
      "3,9": { id: "receiver-1", type: "receiver" },
      "5,1": { id: "crystal-1", type: "crystal", collected: false }
    }
  },
  {
    id: 5,
    name: "The Infinite Weave",
    nameUrdu: "Waqti Khala (وقتی خلا)",
    description: "The ultimate challenge. Blocks, gates, switches, and dual crossovers. Coordinate perfectly with three of your Echoes.",
    descriptionUrdu: "سب سے بڑا امتحان۔ تین یادگاروں (ماضی کے خودوں) کے ساتھ مکمل ہم آہنگی بنائیں۔",
    maxEchoes: 6,
    loopDuration: 25,
    difficultyTitle: "Expert",
    grid: [
      ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["#", "S", ".", ".", "D", ".", "#", "E", ".", ".", ".", "#"],
      ["#", ".", "P", ".", "#", ".", "D", ".", "#", "#", "D", "#"],
      ["#", "L", ".", ".", ".", ".", "#", ".", "K", "#", ".", "#"],
      ["#", ".", "Q", ".", "#", ".", "Y", ".", ".", ".", ".", "#"],
      ["#", "M", ".", ".", "#", ".", ".", ".", "#", "#", ".", "#"],
      ["#", ".", ".", "C", "#", "N", ".", ".", "Z", "#", ".", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
    ],
    tileData: {
      "2,2": { id: "plate-1", type: "plate", targetId: "door-1" }, // P
      "4,2": { id: "plate-2", type: "plate", targetId: "door-2" }, // Q
      "4,6": { id: "plate-3", type: "plate", targetId: "door-3" }, // Y
      "5,1": { id: "plate-4", type: "plate", targetId: "door-4" }, // M
      "6,5": { id: "plate-5", type: "plate", targetId: "door-5" }, // N
      "6,8": { id: "plate-6", type: "plate", targetId: "door-6" }, // Z
      "1,4": { id: "door-1", type: "door", isLocked: true, triggerId: "plate-1" },
      "2,6": { id: "door-2", type: "door", isLocked: true, triggerId: "plate-2" },
      "2,10": { id: "door-3", type: "door", isLocked: true, triggerId: "plate-3" },
      "3,1": { id: "emitter-1", type: "emitter", targetId: "receiver-1" },
      "3,11": { id: "receiver-1", type: "receiver" },
      "6,3": { id: "crystal-1", type: "crystal", collected: false }
    }
  }
];

// Helper to generate a procedural level based on endless difficulty index
export function generateProceduralLevel(difficultyIndex: number): Level {
  const seed = difficultyIndex * 31;
  const loopTime = Math.max(10, 20 - Math.floor(difficultyIndex / 2)); // decreases as level increases (higher difficulty)
  
  // Decide grid size: 9x9 up to 12x12
  const size = Math.min(12, 8 + Math.floor(difficultyIndex / 3));
  
  // Initialize grid with floor
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill("."));
  
  // Outer walls
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (y === 0 || y === size - 1 || x === 0 || x === size - 1) {
        grid[y][x] = "#";
      }
    }
  }

  // Set start and exit
  grid[1][1] = "S";
  grid[size - 2][size - 2] = "E";

  const tileData: Record<string, Partial<GridTile>> = {};

  // Procedural puzzles: Place blocks and doors
  // For simplicity, let's place some walls
  const wallCount = size + Math.floor(difficultyIndex * 1.5);
  let attempts = 0;
  let placedWalls = 0;
  while (placedWalls < wallCount && attempts < 100) {
    attempts++;
    const ry = 1 + Math.floor(Math.random() * (size - 2));
    const rx = 1 + Math.floor(Math.random() * (size - 2));
    // Ensure we don't block start or exit
    if ((ry === 1 && rx === 1) || (ry === size - 2 && rx === size - 2)) continue;
    if (grid[ry][rx] === ".") {
      grid[ry][rx] = "#";
      placedWalls++;
    }
  }

  // Ensure path is solvable by keeping start/exit areas somewhat open
  grid[1][2] = ".";
  grid[2][1] = ".";
  grid[size - 2][size - 3] = ".";
  grid[size - 3][size - 2] = ".";

  // Let's add 1 Plate and 1 Door
  const plateY = Math.floor(size / 2);
  const plateX = 2;
  const doorY = size - 2;
  const doorX = size - 3;

  grid[plateY][plateX] = "P";
  grid[doorY][doorX] = "D";

  tileData[`${plateY},${plateX}`] = { id: `proc-plate`, type: "plate", targetId: `proc-door` };
  tileData[`${doorY},${doorX}`] = { id: `proc-door`, type: "door", isLocked: true, triggerId: `proc-plate` };

  // Maybe put a Key at a random tile
  const keyY = 2;
  const keyX = size - 2;
  grid[keyY][keyX] = "K";

  // Let's also add 1 dynamic laser if difficulty > 2
  if (difficultyIndex > 2) {
    const laserRow = Math.floor(size / 2) + (difficultyIndex % 2 === 0 ? 1 : -1);
    if (laserRow > 1 && laserRow < size - 2) {
      grid[laserRow][1] = "L";
      grid[laserRow][size - 2] = "R";
      tileData[`${laserRow},1`] = { id: `proc-emitter`, type: "emitter", targetId: `proc-receiver` };
      tileData[`${laserRow},${size - 2}`] = { id: `proc-receiver`, type: "receiver" };
      // Make sure intermediate spaces are floor segments so laser can traverse
      for (let x = 2; x < size - 2; x++) {
        if (grid[laserRow][x] === "#") grid[laserRow][x] = ".";
      }
    }
  }

  return {
    id: 100 + difficultyIndex,
    name: `Anomaly Space ${difficultyIndex}`,
    nameUrdu: `مخالف خلیہ ${difficultyIndex}`,
    description: `A procedurally scrambled anomaly matrix. Fast-thinking required as gravity decay speeds up!`,
    descriptionUrdu: `ایک عجیب خودکار میٹرکس۔ وقت ختم ہونے سے پہلے راستے تلاش کریں!`,
    maxEchoes: Math.max(3, 8 - Math.floor(difficultyIndex / 2)),
    loopDuration: loopTime,
    difficultyTitle: difficultyIndex > 5 ? "Insane" : "Hardcore",
    grid,
    tileData
  };
}
