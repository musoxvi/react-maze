import { MAZE_NAMES } from "../names";

export interface MazeState {
  gameStart: boolean;
  playerPosition: number;
  steps: number;
  isWinning: boolean;
}

interface IPlayerPosition {
  type: MAZE_NAMES.SET_PLAYER_POSITION;
  playerPosition: number;
}

interface ISteps {
  type: MAZE_NAMES.SET_STEPS;
  steps: number;
}

export type Action = IPlayerPosition | ISteps;

export type ContextProps = {
  state: MazeState;
  mazeDispatch: {
    setPlayerPosition(playerPosition: number): void;
    setSteps(steps: number): void;
    setWinning(isWinning: boolean): void;
    setGameStart(gameStart: boolean): void;
    setRestartGame(): void;
  };
};
