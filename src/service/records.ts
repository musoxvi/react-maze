import { getLevel, LevelId, isRandomLevel } from "../constants/levels";
import { mazeForLevel } from "../utils/levelMaze";
import { shortestPath } from "../utils/shortestPath";
import type { Score } from "./utils";

/**
 * Personal records kept in localStorage so they work offline and survive
 * reloads. Every access is guarded: storage can be unavailable (private mode).
 */
const KEY = "maze:records";
const MAX_SCORES = 300;

type Store = { scores: Score[]; completed: LevelId[] };

const read = (): Store => {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { scores: data.scores ?? [], completed: data.completed ?? [] };
  } catch {
    return { scores: [], completed: [] };
  }
};

const write = (store: Store) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded or storage disabled: records are best effort
  }
};

const fixedShortest = new Map<LevelId, number | null>();

/** Shortest path of the maze a score was set on (older scores did not store it). */
const shortestFor = (score: Score): number | undefined => {
  if (score.best != null) return score.best;
  const id = score.level ?? "easy";
  if (isRandomLevel(getLevel(id))) return undefined;
  if (!fixedShortest.has(id)) fixedShortest.set(id, shortestPath(mazeForLevel(id)));
  return fixedShortest.get(id) ?? undefined;
};

export const SCORE_BASE = 1000;
export const POINTS_PER_EXTRA_MOVE = 10;

/**
 * Higher is better: 1000 + bonus points − 10 per move over the shortest path.
 * Works the same on fixed and random mazes. `null` if it cannot be computed.
 */
export const finalScore = (score: Pick<Score, "steps" | "points" | "best" | "level">): number | null => {
  const shortest = shortestFor(score as Score);
  if (shortest == null) return null;
  return SCORE_BASE + (score.points ?? 0) - POINTS_PER_EXTRA_MOVE * (score.steps - shortest);
};

export const compareScores = (a: Score, b: Score) =>
  (finalScore(b) ?? -Infinity) - (finalScore(a) ?? -Infinity) ||
  (a.timeMs ?? Infinity) - (b.timeMs ?? Infinity);

export const getLocalScores = (): Score[] => read().scores;

export const getCompletedLevels = (): LevelId[] => read().completed;

export const getPersonalBest = (level: LevelId): Score | undefined =>
  read()
    .scores.filter((score) => score.level === level)
    .sort(compareScores)[0];

/** Saves a finished run. Returns whether it beat the previous personal best. */
export const saveLocalScore = (score: Score): { isRecord: boolean } => {
  const store = read();
  const previous = getPersonalBest(score.level ?? "easy");
  const isRecord = !previous || compareScores(score, previous) < 0;

  // Keep the best runs if the list grows too long
  const scores = [...store.scores, score].sort(compareScores).slice(0, MAX_SCORES);
  const completed = store.completed.includes(score.level ?? "easy")
    ? store.completed
    : [...store.completed, score.level ?? "easy"];

  write({ scores, completed });
  return { isRecord };
};
