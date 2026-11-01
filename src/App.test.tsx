import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { LEVELS } from "./constants/levels";
import { shortestPath } from "./utils/shortestPath";

vi.mock("./service/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./service/utils")>()),
  saveScore: vi.fn(),
  getScores: vi.fn().mockResolvedValue([]),
}));

test("every level is square, solvable and has one entrance and exit", () => {
  for (const level of LEVELS) {
    const size = level.grid.length;
    expect(level.grid.every((row) => row.length === size)).toBe(true);
    expect(level.grid.join("").split("S")).toHaveLength(2);
    expect(level.grid.join("").split("E")).toHaveLength(2);
    expect(shortestPath(level.grid)).not.toBeNull();
  }
});

test("starts a game on the chosen level and moves the player", () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/player name/i), {
    target: { value: "Ada" },
  });
  fireEvent.click(screen.getByLabelText(/hard/i));
  fireEvent.click(screen.getByRole("button", { name: /start game/i }));

  expect(screen.getByText("Ada")).toBeInTheDocument();
  expect(screen.getByText("Hard")).toBeInTheDocument();

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
  });
  const atStart = state.revealed.size;
  expect(atStart).toBeGreaterThan(0);

  state = mazeReducer(state, { type: "MOVE", direction: "down" });
  expect(state.revealed.size).toBeGreaterThan(atStart);
  // The entrance stays revealed after walking away from it
  expect(state.revealed.has("0,1")).toBe(true);
});
