export type LevelId =
  | "easy"
  | "medium"
  | "hard"
  | "expert"
  | "impossible"
  | "3d-easy"
  | "3d-medium"
  | "3d-hard"
  | "3d-expert"
  | "3d-impossible"
  | "fp-easy"
  | "fp-medium"
  | "fp-hard"
  | "fp-expert"
  | "fp-impossible";

/** "fp" = first person, inside the 3D maze */
export type View = "2d" | "3d" | "fp";

export const VIEW_LABEL: Record<View, string> = {
  "2d": "2D",
  "3d": "3D",
  fp: "1st person",
};

export type Level = {
  id: LevelId;
  name: string;
  description: string;
  view: View;
  /** Hand-made maze: "#" wall, "." path, "S" entrance, "E" exit */
  grid?: string[];
  /** Generated maze size (odd). With `seed` it is always the same maze,
   *  without it a new maze is generated for every game */
  size?: number;
  seed?: number;
  /** If set, only cells within this distance of the player are visible */
  fogRadius?: number;
  /** Keep cells you have already seen on the map (dimmed) */
  fogMemory?: boolean;
  /** How many bonus items to hide in side branches */
  items?: number;
};

export const LEVELS: Level[] = [
  {
    id: "easy",
    name: "Easy",
    view: "2d",
    description: "12×12 · warm up",
    grid: [
      "#S##########",
      "#.#...#....#",
      "#...#.#.#.##",
      "#####...#..#",
      "#.....####.#",
      "#.#####....#",
      "#.....#.####",
      "###.#.#....#",
      "#...#.######",
      "##.##.#...##",
      "#...#...#..E",
      "############",
    ],
  },
  {
    id: "medium",
    name: "Medium",
    view: "2d",
    description: "19×19 · getting tricky",
    size: 19,
    seed: 4,
  },
  {
    id: "hard",
    name: "Hard",
    view: "2d",
    description: "27×27 · bonus items in side paths",
    items: 4,
    grid: [
      "#S#########################",
      "#.....#...............#...#",
      "#.###.###.###.###.###.###.#",
      "#...#.....#...#.....#.#...#",
      "###.#.#######.#.#.#.#.#.###",
      "#...#.....#.#.#.#.#.#...#.#",
      "#.#.###.#.#.#.#.#.###.###.#",
      "#.#.#...#...#.#.#.#...#...#",
      "#######.###########.#####.#",
      "#.............#.....#...#.#",
      "#.#.#.#######.#######.###.#",
      "#.#.#.#.....#.....#.......#",
      "#.#.###.#.#.#######.#######",
      "#.#.....#.#.....#.........#",
      "#.#.###.#.#.#.###.#####.###",
      "#.#.#...#.#.#...#.#.......#",
      "#####.#####.###.###.#####.#",
      "#.#.....#.#...#...#.#.....#",
      "#.#.#####.###.###.#.###.###",
      "#...#.......#.#...#...#...#",
      "#.#.#.#.#########.#####.#.#",
      "#.#...#.#.....#.......#.#.#",
      "#######.#.#############.###",
      "#...#...#.......#.......#.#",
      "###.#.#.#.###.#.#.###.###.#",
      "#.....#...#...#.....#.....E",
      "###########################",
    ],
  },
  {
    id: "expert",
    name: "Expert",
    view: "2d",
    description: "31×31 · fog · new maze every game",
    fogRadius: 3,
    items: 6,
    size: 31,
  },
  {
    id: "impossible",
    name: "Impossible",
    view: "2d",
    description: "41×41 · new maze, reveals as you go",
    fogRadius: 1,
    fogMemory: true,
    items: 8,
    size: 41,
  },
  {
    id: "3d-easy",
    name: "Easy",
    view: "3d",
    description: "15×15 · glass corridors",
    size: 15,
    seed: 3,
  },
  {
    id: "3d-medium",
    name: "Medium",
    view: "3d",
    description: "19×19 · getting tricky",
    size: 19,
    seed: 9,
  },
  {
    id: "3d-hard",
    name: "Hard",
    view: "3d",
    description: "23×23 · bonus items in side paths",
    items: 4,
    size: 23,
    seed: 11,
  },
  {
    id: "3d-expert",
    name: "Expert",
    view: "3d",
    description: "27×27 · fog · new maze every game",
    fogRadius: 3,
    items: 5,
    size: 27,
  },
  {
    id: "3d-impossible",
    name: "Impossible",
    view: "3d",
    description: "35×35 · new maze, reveals as you go",
    fogRadius: 1,
    fogMemory: true,
    items: 7,
    size: 35,
  },
  {
    id: "fp-easy",
    name: "Easy",
    view: "fp",
    description: "11×11 · find your way inside",
    size: 11,
    seed: 1,
  },
  {
    id: "fp-medium",
    name: "Medium",
    view: "fp",
    description: "15×15 · glass corridors",
    size: 15,
    seed: 2,
  },
  {
    id: "fp-hard",
    name: "Hard",
    view: "fp",
    description: "19×19 · bonus items in side paths",
    size: 19,
    seed: 5,
    items: 3,
  },
  {
    id: "fp-expert",
    name: "Expert",
    view: "fp",
    description: "23×23 · dark · new maze every game",
    fogRadius: 3,
    size: 23,
    items: 4,
  },
  {
    id: "fp-impossible",
    name: "Impossible",
    view: "fp",
    description: "27×27 · pitch black · new maze",
    fogRadius: 1,
    fogMemory: true,
    size: 27,
    items: 5,
  },
];

/** Levels with a different maze every game */
export const isRandomLevel = (level: Level) => !level.grid && level.seed === undefined;

/** The level after this one, if any (2D levels lead into the 3D ones) */
export const getNextLevel = (id: LevelId): Level | undefined =>
  LEVELS[LEVELS.findIndex((level) => level.id === id) + 1];

export const getLevel = (id: LevelId): Level =>
  LEVELS.find((level) => level.id === id) ?? LEVELS[0];

export type Position = { row: number; col: number };

export const findCell = (grid: string[], char: string): Position => {
  const row = grid.findIndex((line) => line.includes(char));
  return { row, col: grid[row].indexOf(char) };
};


export const cellKey = (row: number, col: number) => `${row},${col}`;

/** Whether a cell is inside the player's line of sight on a foggy level. */
export const isInSight = (from: Position, row: number, col: number, radius: number) =>
  Math.hypot(row - from.row, col - from.col) <= radius + 0.5;

/** Keys of every cell currently in sight from `from`. */
export const cellsInSight = (from: Position, radius: number): string[] => {
  const keys = [];
  const r = Math.ceil(radius);
  for (let row = from.row - r; row <= from.row + r; row++) {
    for (let col = from.col - r; col <= from.col + r; col++) {
      if (isInSight(from, row, col, radius)) keys.push(cellKey(row, col));
    }
  }
  return keys;
};
