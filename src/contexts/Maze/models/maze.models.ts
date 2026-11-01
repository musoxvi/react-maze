import { LevelId, Position } from "../../../constants/levels";

export type Direction = "up" | "down" | "left" | "right";

export interface MazeState {
  gameStart: boolean;
  playerName: string;
  levelId: LevelId;
  position: Position;
  steps: number;
  isWinning: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  /** Cells already seen on levels with fog memory */
  revealed: Set<string>;
}

export type MazeAction =
  | { type: "START_GAME"; playerName: string; levelId: LevelId }
  | { type: "MOVE"; direction: Direction }
  | { type: "RESTART" }
  | { type: "EXIT_TO_MENU" };

export type ContextProps = {
  state: MazeState;
  mazeDispatch: {
    startGame(playerName: string, levelId: LevelId): void;
    move(direction: Direction): void;
    restart(): void;
    exitToMenu(): void;
  };
};
