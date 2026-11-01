import { findCell } from "../constants/levels";

/** Fewest moves from the entrance to the exit (breadth-first search). */
export const shortestPath = (grid: string[]): number | null => {
  const start = findCell(grid, "S");
  const seen = new Set([`${start.row},${start.col}`]);
  let frontier = [start];

  for (let steps = 0; frontier.length; steps++) {
    const next = [];
    for (const { row, col } of frontier) {
      if (grid[row][col] === "E") return steps;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const r = row + dr;
        const c = col + dc;
        const key = `${r},${c}`;
        const cell = grid[r]?.[c];
        if (cell && cell !== "#" && !seen.has(key)) {
          seen.add(key);
          next.push({ row: r, col: c });
        }
      }
    }
    frontier = next;
  }
  return null;
};
