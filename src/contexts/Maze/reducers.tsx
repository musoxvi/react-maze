import { MazeState } from "./models/maze.models";
import { MAZE_NAMES } from "./names";

export const initialState: MazeState = {
  gameStart: false,
  playerPosition: 2,
  steps: 0,
  isWinning: false,
};

const {
  SET_PLAYER_POSITION,
  SET_STEPS,
  SET_WINNING,
  SET_GAME_START,
  SET_RESTART_GAME,
} = MAZE_NAMES;

export function mazeReducer(state: MazeState, action: any): MazeState {
  const { type, playerPosition, steps, isWinning, gameStart } = action || {};

  switch (type) {
    case SET_PLAYER_POSITION:
      return {
        ...state,
        playerPosition,
      };
    case SET_STEPS:
      return {
        ...state,
        steps,
      };
    case SET_WINNING:
      return {
        ...state,
        isWinning,
      };
    case SET_GAME_START:
      return {
        ...state,
        gameStart,
      };
    case SET_RESTART_GAME:
      return {
        ...state,
        ...initialState,
      };

    default: {
      // helps us avoid typos!
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
}
