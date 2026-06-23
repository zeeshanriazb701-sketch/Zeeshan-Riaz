/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Position {
  x: number;
  y: number;
}

export interface EchoAction {
  step: number;
  pos: Position;
  action?: 'interact' | 'collect';
}

export interface Echo {
  id: string;
  color: string;
  path: EchoAction[];
}

export type TileType = 
  | 'floor'      // .
  | 'wall'       // W
  | 'start'      // S
  | 'exit'       // E
  | 'key'        // K
  | 'plate'      // P (Pressure plate - triggers doors)
  | 'door'       // D (Door - solid unless plate is active)
  | 'laser'      // L (Laser beam segment, kills active player)
  | 'emitter'    // A (Laser source)
  | 'receiver'   // B (Laser receiver)
  | 'crystal';   // C (Optional value stars)

export interface GridTile {
  type: TileType;
  id: string;        // e.g. "plate-1", "door-1"
  triggerId?: string; // used to link plates to doors
  targetId?: string;  // door that this plate links to
  isLocked?: boolean; // for doors
  collected?: boolean; // for keys / crystals
}

export interface Level {
  id: number;
  name: string;
  nameUrdu: string;
  description: string;
  descriptionUrdu: string;
  grid: string[][]; // initial layout
  tileData: Record<string, Partial<GridTile>>; // dynamic attributes linked by coordinates "y,x"
  maxEchoes: number; // max allowable past loops before collapsing
  loopDuration: number; // seconds per loop (e.g., 10s-15s)
  difficultyTitle: string;
}

export interface Player {
  x: number;
  y: number;
  steps: Position[];
}
