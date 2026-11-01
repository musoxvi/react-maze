import { cellKey, findCell } from "../constants/levels";

export type ItemType = "gem" | "hourglass" | "boots";

export const ITEM_INFO: Record<ItemType, { icon: string; label: string; effect: string }> = {
  gem: { icon: "💎", label: "Gem", effect: "+150 points" },
  hourglass: { icon: "⏳", label: "Hourglass", effect: "−12 moves" },
  boots: { icon: "👣", label: "Ghost boots", effect: "next 30 steps back are free" },
};

export const GEM_POINTS = 150;
export const HOURGLASS_MOVES = 12;
export const BOOTS_STEPS = 30;

const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

const neighbours = (grid: string[], row: number, col: number) =>
  DIRECTIONS.map(([dr, dc]) => [row + dr, col + dc] as const).filter(
    ([r, c]) => grid[r]?.[c] !== undefined && grid[r][c] !== "#"
  );

/** Cells on the shortest route from entrance to exit. */
export const solutionCells = (grid: string[]): Set<string> => {
  const start = findCell(grid, "S");
  const parent = new Map<string, string | null>([[cellKey(start.row, start.col), null]]);
  const queue = [start];
  let end: string | null = null;

  while (queue.length) {
    const { row, col } = queue.shift()!;
    if (grid[row][col] === "E") {
      end = cellKey(row, col);
      break;
    }
    for (const [r, c] of neighbours(grid, row, col)) {
      const key = cellKey(r, c);
      if (!parent.has(key)) {
        parent.set(key, cellKey(row, col));
        queue.push({ row: r, col: c });
      }
    }
  }

  const path = new Set<string>();
  for (let key = end; key; key = parent.get(key) ?? null) path.add(key);
  return path;
};

/** Deterministic number from the maze, so fixed levels always get the same items. */
const hashGrid = (grid: string[]) => {
  let h = 2166136261;
  for (const ch of grid.join("")) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
};

/**
 * Hides items at the tips of side branches, never on the solution path.
 * Branches must be deep enough to be a real detour but not so deep that the
 * item is never worth the trip.
 */
export const placeItems = (grid: string[], count: number): Record<string, ItemType> => {
  if (count <= 0) return {};

  const path = solutionCells(grid);

  // Distance of every cell from the solution path (multi-source BFS)
  const depth = new Map<string, number>();
  const queue: [number, number][] = [];
  path.forEach((key) => {
    depth.set(key, 0);
    const [r, c] = key.split(",").map(Number);
    queue.push([r, c]);
  });
  while (queue.length) {
    const [row, col] = queue.shift()!;
    const d = depth.get(cellKey(row, col))!;
    for (const [r, c] of neighbours(grid, row, col)) {
      const key = cellKey(r, c);
      if (!depth.has(key)) {
        depth.set(key, d + 1);
        queue.push([r, c]);
      }
    }
  }

  const maxDepth = Math.max(8, Math.round(grid.length / 2.5));
  let seed = hashGrid(grid);
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // Dead-end tips off the solution path, in a stable shuffled order
  const candidates = [...depth.entries()]
    .filter(([key, d]) => {
      const [r, c] = key.split(",").map(Number);
      return d >= 3 && d <= maxDepth && grid[r][c] === "." && neighbours(grid, r, c).length === 1;
    })
    .map(([key]) => ({ key, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ key }) => key);

  // Keep items spread out
  const chosen: string[] = [];
  for (const key of candidates) {
    const [r, c] = key.split(",").map(Number);
    const farEnough = chosen.every((other) => {
      const [or, oc] = other.split(",").map(Number);
      return Math.abs(or - r) + Math.abs(oc - c) >= 6;
    });
    if (farEnough) chosen.push(key);
    if (chosen.length === count) break;
  }

  const order: ItemType[] = ["gem", "hourglass", "gem", "boots"];
  return Object.fromEntries(chosen.map((key, i) => [key, order[i % order.length]]));
};
