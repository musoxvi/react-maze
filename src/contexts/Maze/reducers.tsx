import { cellKey, cellsInSight, findCell, getLevel, LevelId, Position } from "../../constants/levels";
import { BOOTS_STEPS, GEM_POINTS, HOURGLASS_MOVES, placeItems } from "../../utils/items";
import {
  COMPASS_MOVES,
  DASH_CHARGES,
  LANTERN_BONUS,
  LANTERN_MAX_BONUS,
} from "../../constants/powers";
import { Direction, Facing, MazeAction, MazeState } from "./models/maze.models";

const DELTAS: Record<Direction, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

const reveal = (
  levelId: LevelId,
  positions: Position[],
  revealed = new Set<string>(),
  bonus = 0
) => {
  const { fogRadius, fogMemory, view } = getLevel(levelId);
  // First person always remembers what you saw, for the minimap
  const radius = view === "fp" ? fogRadius ?? 2 : fogMemory ? fogRadius : undefined;
  if (radius === undefined) return revealed;
  const next = new Set(revealed);
  positions.forEach((p) => cellsInSight(p, radius + bonus).forEach((key) => next.add(key)));
  return next;
};

const openNeighbours = (grid: string[], { row, col }: Position) =>
  Object.values(DELTAS).filter(([dr, dc]) => {
    const cell = grid[row + dr]?.[col + dc];
    return cell !== undefined && cell !== "#";
  }).length;

const freshRun = (levelId: LevelId, grid: string[]) => {
  const position = findCell(grid, "S");
  return {
    levelId,
    grid,
    position,
    steps: 0,
    isWinning: false,
    startedAt: null,
    finishedAt: null,
    revealed: reveal(levelId, [position]),
    items: placeItems(grid, getLevel(levelId).items ?? 0),
    points: 0,
    freeSteps: 0,
    visited: new Set([cellKey(position.row, position.col)]),
    lastPickup: null,
    // The entrance is on the top edge, so start looking into the maze
    facing: 2 as Facing,
    dash: 0,
    lanternBonus: 0,
    compass: 0,
    powersUsed: [],
  };
};

export const initialState: MazeState = {
  gameStart: false,
  playerName: "",
  ...freshRun("easy", getLevel("easy").grid ?? []),
};

export function mazeReducer(state: MazeState, action: MazeAction): MazeState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        ...freshRun(action.levelId, action.grid),
        gameStart: true,
        playerName: action.playerName,
      };

    case "MOVE": {
      if (!state.gameStart || state.isWinning) return state;

      const { grid } = state;
      const [dRow, dCol] = DELTAS[action.direction];
      const blocked = (r: number, c: number) => {
        const cell = grid[r]?.[c];
        // Walls, the outside and walking back out the entrance are blocked
        return !cell || cell === "#" || cell === "S";
      };
      let row = state.position.row + dRow;
      let col = state.position.col + dCol;
      if (blocked(row, col)) return state;

      // Super speed: keep running down the corridor until a junction, a
      // corner, an item or the exit. The whole run costs one move.
      const path: Position[] = [{ row, col }];
      if (state.dash > 0) {
        while (
          grid[row][col] !== "E" &&
          !state.items[cellKey(row, col)] &&
          openNeighbours(grid, { row, col }) === 2 &&
          !blocked(row + dRow, col + dCol)
        ) {
          row += dRow;
          col += dCol;
          path.push({ row, col });
        }
      }
      const target = grid[row][col];

      const now = Date.now();
      const key = cellKey(row, col);
      const isWinning = target === "E";

      // Ghost boots: stepping back onto a visited cell is free while they last
      const free = state.freeSteps > 0 && state.visited.has(key);
      let steps = free ? state.steps : state.steps + 1;
      let freeSteps = free ? state.freeSteps - 1 : state.freeSteps;
      let points = state.points;
      let items = state.items;
      let lastPickup = state.lastPickup;

      const item = items[key];
      if (item) {
        items = { ...items };
        delete items[key];
        lastPickup = { type: item, at: now };
        if (item === "gem") points += GEM_POINTS;
        if (item === "hourglass") steps = Math.max(0, steps - HOURGLASS_MOVES);
        if (item === "boots") freeSteps += BOOTS_STEPS;
      }

      const visited = new Set(state.visited);
      path.forEach((p) => visited.add(cellKey(p.row, p.col)));

      return {
        ...state,
        position: { row, col },
        revealed: reveal(state.levelId, path, state.revealed, state.lanternBonus),
        visited,
        dash: Math.max(0, state.dash - 1),
        compass: Math.max(0, state.compass - 1),
        steps,
        freeSteps,
        points,
        items,
        lastPickup,
        isWinning,
        startedAt: state.startedAt ?? now,
        finishedAt: isWinning ? now : null,
      };
    }

    case "TURN": {
      if (!state.gameStart || state.isWinning) return state;
      const facing = ((state.facing + (action.side === "right" ? 1 : 3)) % 4) as Facing;
      return { ...state, facing };
    }

    case "USE_POWER": {
      if (!state.gameStart || state.isWinning) return state;
      const powersUsed = [...state.powersUsed, action.power];
      switch (action.power) {
        case "dash":
          return { ...state, powersUsed, dash: state.dash + DASH_CHARGES };
        case "compass":
          return { ...state, powersUsed, compass: state.compass + COMPASS_MOVES };
        case "boots":
          return { ...state, powersUsed, freeSteps: state.freeSteps + BOOTS_STEPS };
        case "lantern": {
          const lanternBonus = Math.min(LANTERN_MAX_BONUS, state.lanternBonus + LANTERN_BONUS);
          return {
            ...state,
            powersUsed,
            lanternBonus,
            revealed: reveal(state.levelId, [state.position], state.revealed, lanternBonus),
          };
        }
        default:
          return state;
      }
    }

    case "RESTART":
      return { ...state, ...freshRun(state.levelId, action.grid ?? state.grid) };

    case "EXIT_TO_MENU":
      return { ...state, ...freshRun(state.levelId, state.grid), gameStart: false };

    default:
      return state;
  }
}
