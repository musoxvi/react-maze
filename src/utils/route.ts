import { cellKey, Position } from "../constants/levels";

/** Ordered cells of the shortest route from `from` to the exit (excluding `from`). */
export const routeToExit = (grid: string[], from: Position): Position[] => {
  const parent = new Map<string, Position | null>([[cellKey(from.row, from.col), null]]);
  const queue: Position[] = [from];
  let end: Position | null = null;

  while (queue.length) {
    const cell = queue.shift()!;
    if (grid[cell.row][cell.col] === "E") {
      end = cell;
      break;
    }
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { row: cell.row + dr, col: cell.col + dc };
      const char = grid[next.row]?.[next.col];
      const key = cellKey(next.row, next.col);
      if (char && char !== "#" && char !== "S" && !parent.has(key)) {
        parent.set(key, cell);
        queue.push(next);
      }
    }
  }

  const route: Position[] = [];
  for (let cell = end; cell && parent.get(cellKey(cell.row, cell.col)) !== null; ) {
    route.unshift(cell);
    cell = parent.get(cellKey(cell.row, cell.col)) ?? null;
  }
  return route;
};
