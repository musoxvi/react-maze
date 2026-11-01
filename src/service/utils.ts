import { db } from "./Firebase";
import { LevelId } from "../constants/levels";
import { saveLocalScore } from "./records";
import type { PowerId } from "../constants/powers";

export type Score = {
  id: number;
  playerName: string;
  steps: number;
  date: string;
  /** Scores saved before levels existed have no level: treat them as "easy" */
  level?: LevelId;
  timeMs?: number;
  /** Shortest possible moves on the maze that was played */
  best?: number;
  /** Bonus points from items */
  points?: number;
  /** Powers used during the run */
  powers?: PowerId[];
};

/**
 * Saves a finished run locally (always, works offline) and to the global
 * leaderboard (best effort). Returns whether it is a new personal record.
 */
export const saveScore = (input: Omit<Score, "id" | "date">) => {
  const date = new Date().toLocaleDateString("en-AU", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const score: Score = { ...input, id: Date.now(), date };
  const { isRecord } = saveLocalScore(score);

  if (navigator.onLine) {
    db.collection("scores")
      .add(score)
      .catch((error) => console.error("Could not save score", error));
  }
  return { isRecord };
};

export const getScores = async (): Promise<Score[]> => {
  if (!navigator.onLine) return [];
  try {
    const snapshot = await db.collection("scores").get();
    return snapshot.docs.map((doc) => doc.data() as Score);
  } catch (error) {
    console.error("Could not load scores", error);
    return [];
  }
};

export const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};
