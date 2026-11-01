import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { getNextLevel, LEVELS } from "./constants/levels";
import { getCompletedLevels, getPersonalBest, saveLocalScore } from "./service/records";
import { generateMaze } from "./utils/generateMaze";
import { mazeForLevel } from "./utils/levelMaze";
import { shortestPath } from "./utils/shortestPath";

vi.mock("./service/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./service/utils")>()),
  saveScore: vi.fn(() => ({ isRecord: false })),
  getScores: vi.fn().mockResolvedValue([]),
}));

beforeEach(() => localStorage.clear());

test("every level is square, solvable and has one entrance and exit", () => {
  for (const level of LEVELS) {
    const grid = mazeForLevel(level.id);
    const size = grid.length;
    expect(grid.every((row) => row.length === size)).toBe(true);
    expect(grid.join("").split("S")).toHaveLength(2);
    expect(grid.join("").split("E")).toHaveLength(2);
    expect(shortestPath(grid)).not.toBeNull();
  }
});

test("levels run 2D then 3D, and the last one has no next level", () => {
  expect(LEVELS.map((l) => l.view)).toEqual([
    ...Array(5).fill("2d"),
    ...Array(5).fill("3d"),
    ...Array(5).fill("fp"),
  ]);
  expect(getNextLevel("easy")?.id).toBe("medium");
  expect(getNextLevel("medium")?.id).toBe("hard");
  expect(getNextLevel("impossible")?.id).toBe("3d-easy");
  expect(getNextLevel("3d-impossible")?.id).toBe("fp-easy");
  expect(getNextLevel("fp-impossible")).toBeUndefined();
});

test("seeded 3D levels always build the same maze", () => {
  expect(mazeForLevel("3d-hard")).toEqual(mazeForLevel("3d-hard"));
});

test("starts a game on the chosen level and moves the player", () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/player name/i), {
    target: { value: "Ada" },
  });
  fireEvent.click(screen.getByLabelText("2D Hard"));
  fireEvent.click(screen.getByRole("button", { name: /start game/i }));

  expect(screen.getByText("Ada")).toBeInTheDocument();
  expect(screen.getByText("2D · Hard")).toBeInTheDocument();

  // Hard maze: entrance at (0,1), the only open move is down
  fireEvent.keyDown(window, { key: "ArrowUp" });
  fireEvent.keyDown(window, { key: "ArrowDown" });
  expect(screen.getByText("Moves").nextSibling).toHaveTextContent("1");
});

test("impossible level remembers explored cells", async () => {
  const { mazeReducer, initialState } = await import("./contexts/Maze/reducers");
  let state = mazeReducer(initialState, {
    type: "START_GAME",
    playerName: "Ada",
    levelId: "impossible",
    grid: generateMaze(41, 1),
  });
  const atStart = state.revealed.size;
  expect(atStart).toBeGreaterThan(0);

  state = mazeReducer(state, { type: "MOVE", direction: "down" });
  expect(state.revealed.size).toBeGreaterThan(atStart);
  expect(state.revealed.has("0,1")).toBe(true);
});

test("dynamic mazes are reproducible by seed and differ between seeds", () => {
  expect(generateMaze(31, 42)).toEqual(generateMaze(31, 42));
  expect(generateMaze(31, 42)).not.toEqual(generateMaze(31, 43));
});

test("local records keep the personal best and completed levels", () => {
  const run = { playerName: "Ada", date: "today", level: "easy" as const };
  expect(saveLocalScore({ ...run, id: 1, steps: 40 }).isRecord).toBe(true);
  expect(saveLocalScore({ ...run, id: 2, steps: 50 }).isRecord).toBe(false);
  expect(saveLocalScore({ ...run, id: 3, steps: 32 }).isRecord).toBe(true);
  expect(getPersonalBest("easy")?.steps).toBe(32);
  expect(getCompletedLevels()).toEqual(["easy"]);

  // Random levels rank by moves over the shortest path, not raw moves
  const expert = { playerName: "Ada", date: "today", level: "expert" as const };
  saveLocalScore({ ...expert, id: 4, steps: 120, best: 100 }); // +20
  saveLocalScore({ ...expert, id: 5, steps: 90, best: 80 }); // +10
  expect(getPersonalBest("expert")?.id).toBe(5);
});

test("items hide in side branches, never on the solution path", async () => {
  const { placeItems, solutionCells } = await import("./utils/items");
  for (const id of ["hard", "3d-hard"] as const) {
    const grid = mazeForLevel(id);
    const items = placeItems(grid, 4);
    const path = solutionCells(grid);
    expect(Object.keys(items).length).toBeGreaterThan(0);
    for (const key of Object.keys(items)) expect(path.has(key)).toBe(false);
    // Same maze, same items
    expect(placeItems(grid, 4)).toEqual(items);
  }
});

test("picking up items changes points, moves and free steps", async () => {
  const { mazeReducer, initialState } = await import("./contexts/Maze/reducers");
  // Corridor: S at top, then gem, hourglass and boots on the way to the exit
  const grid = ["#S###", "#...#", "###.#", "#...E", "#####"];
  let state = mazeReducer(initialState, { type: "START_GAME", playerName: "Ada", levelId: "hard", grid });
  state = { ...state, items: { "1,1": "gem", "1,3": "boots", "3,2": "hourglass" } };

  state = mazeReducer(state, { type: "MOVE", direction: "down" }); // gem
  expect(state.points).toBe(150);
  state = mazeReducer(state, { type: "MOVE", direction: "right" });
  state = mazeReducer(state, { type: "MOVE", direction: "right" }); // boots
  expect(state.freeSteps).toBe(30);
  expect(state.steps).toBe(3);

  // Walking back over visited cells is free while boots last
  state = mazeReducer(state, { type: "MOVE", direction: "left" });
  expect(state.steps).toBe(3);
  expect(state.freeSteps).toBe(29);
  state = mazeReducer(state, { type: "MOVE", direction: "right" });

  state = mazeReducer(state, { type: "MOVE", direction: "down" });
  state = mazeReducer(state, { type: "MOVE", direction: "down" });
  state = mazeReducer(state, { type: "MOVE", direction: "left" }); // hourglass
  expect(state.steps).toBe(0); // 6 moves - 12, never below zero
  expect(state.items).toEqual({});
});

test("final score rewards bonus points and penalises extra moves", async () => {
  const { finalScore } = await import("./service/records");
  expect(finalScore({ steps: 100, best: 100, points: 0, level: "expert" })).toBe(1000);
  expect(finalScore({ steps: 110, best: 100, points: 150, level: "expert" })).toBe(1050);
  expect(finalScore({ steps: 32, level: "easy" })).toBe(1000); // fixed level: shortest is known
});

test("first person turns on the spot and remembers what it saw", async () => {
  const { mazeReducer, initialState } = await import("./contexts/Maze/reducers");
  let state = mazeReducer(initialState, {
    type: "START_GAME",
    playerName: "Ada",
    levelId: "fp-easy",
    grid: mazeForLevel("fp-easy"),
  });
  expect(state.facing).toBe(2); // looking south, into the maze
  expect(state.revealed.size).toBeGreaterThan(0); // minimap starts with the view

  state = mazeReducer(state, { type: "TURN", side: "left" });
  expect(state.facing).toBe(1);
  state = mazeReducer(state, { type: "TURN", side: "right" });
  state = mazeReducer(state, { type: "TURN", side: "right" });
  expect(state.facing).toBe(3);
  expect(state.steps).toBe(0); // turning is free
});

test("super speed runs to the next junction for one move", async () => {
  const { mazeReducer, initialState } = await import("./contexts/Maze/reducers");
  // Long corridor down from the entrance, junction at row 4
  const grid = ["#S###", "#.###", "#.###", "#.###", "#...#", "###.E", "#####"];
  let state = mazeReducer(initialState, { type: "START_GAME", playerName: "Ada", levelId: "easy", grid });
  state = mazeReducer(state, { type: "USE_POWER", power: "dash" });
  state = mazeReducer(state, { type: "MOVE", direction: "down" });
  expect(state.position).toEqual({ row: 4, col: 1 });
  expect(state.steps).toBe(1);
  expect(state.dash).toBe(7);
});

test("lantern widens vision and compass charges count down", async () => {
  const { mazeReducer, initialState } = await import("./contexts/Maze/reducers");
  let state = mazeReducer(initialState, {
    type: "START_GAME",
    playerName: "Ada",
    levelId: "impossible",
    grid: generateMaze(41, 3),
  });
  const before = state.revealed.size;
  state = mazeReducer(state, { type: "USE_POWER", power: "lantern" });
  expect(state.lanternBonus).toBe(2);
  expect(state.revealed.size).toBeGreaterThan(before);

  state = mazeReducer(state, { type: "USE_POWER", power: "compass" });
  state = mazeReducer(state, { type: "MOVE", direction: "down" });
  expect(state.compass).toBe(11);
  expect(state.powersUsed).toEqual(["lantern", "compass"]);
});

test("wallet: rewards, buying and using powers", async () => {
  const { grantReward, buyPower, consumePower, getWallet, levelFromXp } = await import("./service/wallet");
  const reward = grantReward({ tier: 2, score: 1000, firstClear: true, perfect: true });
  // 10 + 2*5 base, +5 high score, +25 first clear, +10 perfect
  expect(reward.coins).toBe(60);
  expect(getWallet().coins).toBe(60);

  expect(buyPower("dash", 40)).not.toBeNull();
  expect(buyPower("dash", 40)).toBeNull(); // only 20 coins left
  expect(getWallet().inventory.dash).toBe(1);
  expect(consumePower("dash")).toBe(true);
  expect(consumePower("dash")).toBe(false);

  expect(levelFromXp(0)).toBe(1);
  expect(levelFromXp(50)).toBe(2);
});

test("route to exit starts next to the player", async () => {
  const { routeToExit } = await import("./utils/route");
  const grid = ["#S###", "#...#", "###.#", "#...E", "#####"];
  const route = routeToExit(grid, { row: 1, col: 1 });
  expect(route[0]).toEqual({ row: 1, col: 2 });
  expect(route[route.length - 1]).toEqual({ row: 3, col: 4 });
});

test("global scores never send undefined fields", async () => {
  const add = vi.fn().mockResolvedValue(undefined);
  vi.doMock("./service/Firebase", () => ({ db: { collection: () => ({ add }) } }));
  vi.resetModules();
  const { saveScore } = await vi.importActual<typeof import("./service/utils")>("./service/utils");
  saveScore({ playerName: "Ada", steps: 10, level: "easy", powers: undefined, best: undefined });
  const sent = add.mock.calls[0][0];
  expect(Object.values(sent)).not.toContain(undefined);
  expect(sent).not.toHaveProperty("powers");
  vi.doUnmock("./service/Firebase");
});
