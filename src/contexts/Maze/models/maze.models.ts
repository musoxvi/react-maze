import { LevelId, Position } from "../../../constants/levels";
import { ItemType } from "../../../utils/items";
import { PowerId } from "../../../constants/powers";

export type Direction = "up" | "down" | "left" | "right";

/** Facing for first person: 0 north, 1 east, 2 south, 3 west */
export type Facing = 0 | 1 | 2 | 3;

export const FACING_DIRECTION: Direction[] = ["up", "right", "down", "left"];

export interface MazeState {
  gameStart: boolean;
  playerName: string;
  levelId: LevelId;
  /** The maze being played (generated per game on dynamic levels) */
  grid: string[];
  position: Position;
  steps: number;
  isWinning: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  /** Cells already seen on levels with fog memory */
  revealed: Set<string>;
  /** Bonus items still on the board, by cell key */
  items: Record<string, ItemType>;
  points: number;
  /** Remaining moves onto already-visited cells that cost nothing */
  freeSteps: number;
  /** Cells the player has stepped on this run */
  visited: Set<string>;
  /** Where the player looks in first person */
  facing: Facing;
  /** Super speed charges left: each move runs to the next junction */
  dash: number;
  /** Extra vision radius from lanterns */
  lanternBonus: number;
  /** Moves left with the compass showing the way */
  compass: number;
  /** Powers used this run (shown next to scores) */
  powersUsed: PowerId[];
  /** Last item picked up, for the on-screen notice */
  lastPickup: { type: ItemType; at: number } | null;
}

export type MazeAction =
  | { type: "START_GAME"; playerName: string; levelId: LevelId; grid: string[] }
  | { type: "MOVE"; direction: Direction }
  | { type: "TURN"; side: "left" | "right" }
  | { type: "USE_POWER"; power: PowerId }
  | { type: "RESTART"; grid?: string[] }
  | { type: "EXIT_TO_MENU" };

export type ContextProps = {
  state: MazeState;
  mazeDispatch: {
    startGame(playerName: string, levelId: LevelId): void;
    move(direction: Direction): void;
    turn(side: "left" | "right"): void;
    usePower(power: PowerId): void;
    /** `newMap` regenerates the maze on dynamic levels */
    restart(newMap?: boolean): void;
    exitToMenu(): void;
  };
};
