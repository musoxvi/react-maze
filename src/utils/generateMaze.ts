import { shortestPath } from "./shortestPath";

/** Small seeded PRNG so a maze can be recreated from its seed. */
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * Growing-tree maze: mostly extends the newest cell (long corridors) and
 * sometimes branches from a random one (forks and dead ends).
 * `size` must be odd. Entrance top-left, exit bottom-right.
 */
const carve = (size: number, random: () => number): string[] => {
  const g = Array.from({ length: size }, () => Array<string>(size).fill("#"));
  const stack: [number, number][] = [[1, 1]];
  g[1][1] = ".";

  while (stack.length) {
    const i = random() < 0.35 ? Math.floor(random() * stack.length) : stack.length - 1;
    const [r, c] = stack[i];
    const options = (
      [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ] as const
    ).filter(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      return nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1 && g[nr][nc] === "#";
    });
    if (!options.length) {
      stack.splice(i, 1);
      continue;
    }
    const [dr, dc] = options[Math.floor(random() * options.length)];
    g[r + dr / 2][c + dc / 2] = ".";
    g[r + dr][c + dc] = ".";
    stack.push([r + dr, c + dc]);
  }

  g[0][1] = "S";
  g[size - 2][size - 1] = "E";
  return g.map((row) => row.join(""));
};

const deadEnds = (grid: string[]) => {
  let count = 0;
  for (let r = 1; r < grid.length - 1; r++) {
    for (let c = 1; c < grid.length - 1; c++) {
      if (grid[r][c] !== ".") continue;
      const open = [grid[r + 1][c], grid[r - 1][c], grid[r][c + 1], grid[r][c - 1]].filter(
        (cell) => cell !== "#"
      ).length;
      if (open === 1) count++;
    }
  }
  return count;
};

/**
 * Builds a few candidates and keeps the hardest one: among the longer
 * solutions, the one with the most dead ends.
 */
export const generateMaze = (size: number, seed = Date.now()): string[] => {
  const random = mulberry32(seed);
  const candidates = Array.from({ length: 12 }, () => {
    const grid = carve(size, random);
    return { grid, length: shortestPath(grid) ?? 0, dead: deadEnds(grid) };
  });
  const lengths = candidates.map((c) => c.length).sort((a, b) => a - b);
  const cut = lengths[Math.floor(lengths.length / 2)];
  return candidates
    .filter((c) => c.length >= cut)
    .sort((a, b) => b.dead - a.dead)[0].grid;
};
