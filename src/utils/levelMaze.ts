import { getLevel, LevelId } from "../constants/levels";
import { generateMaze } from "./generateMaze";

/** The maze to play for a level: hand-made, seeded, or freshly generated. */
export const mazeForLevel = (id: LevelId): string[] => {
  const { grid, size, seed } = getLevel(id);
  if (grid) return grid;
  return generateMaze(size ?? 21, seed);
};
