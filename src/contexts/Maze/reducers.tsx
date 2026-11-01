import { cellsInSight, findCell, getLevel, LevelId, Position } from "../../constants/levels";
import { Direction, MazeAction, MazeState } from "./models/maze.models";

const DELTAS: Record<Direction, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

const reveal = (levelId: LevelId, position: Position, revealed = new Set<string>()) => {
  const { fogRadius, fogMemory } = getLevel(levelId);
  if (!fogMemory || fogRadius === undefined) return revealed;
  return new Set([...revealed, ...cellsInSight(position, fogRadius)]);
};

const freshRun = (levelId: LevelId) => {
  const position = findCell(getLevel(levelId).grid, "S");
  return {
    levelId,
    position,
    steps: 0,
    isWinning: false,
    startedAt: null,
    finishedAt: null,
    revealed: reveal(levelId, position),
  };
};

export const initialState: MazeState = {
  gameStart: false,
  playerName: "",
  ...freshRun("easy"),
};

export function mazeReducer(state: MazeState, action: MazeAction): MazeState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        ...freshRun(action.levelId),
        gameStart: true,
        playerName: action.playerName,
      };

    case "MOVE": {
      if (!state.gameStart || state.isWinning) return state;

      const { grid } = getLevel(state.levelId);
      const [dRow, dCol] = DELTAS[action.direction];
      const row = state.position.row + dRow;
      const col = state.position.col + dCol;
      const target = grid[row]?.[col];

      // Walls, the outside and walking back out the entrance are blocked
      if (!target || target === "#" || target === "S") return state;

      const now = Date.now();
      const isWinning = target === "E";
      return {
        ...state,
        position: { row, col },
        revealed: reveal(state.levelId, { row, col }, state.revealed),
        steps: state.steps + 1,
        isWinning,
        startedAt: state.startedAt ?? now,
        finishedAt: isWinning ? now : null,
      };
    }

    case "RESTART":
      return { ...state, ...freshRun(state.levelId) };

    case "EXIT_TO_MENU":
      return { ...state, ...freshRun(state.levelId), gameStart: false };

    default:
      return state;
  }
}
