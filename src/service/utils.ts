import { db } from "./Firebase";
import { LevelId } from "../constants/levels";

export type Score = {
  id: number;
  playerName: string;
  steps: number;
  date: string;
  /** Scores saved before levels existed have no level: treat them as "easy" */
  level?: LevelId;
  timeMs?: number;
};

export const saveScore = async (score: Omit<Score, "id" | "date">) => {
  const date = new Date().toLocaleDateString("en-AU", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  try {
    await db.collection("scores").add({ ...score, id: Date.now(), date });
  } catch (error) {
    console.error("Could not save score", error);
  }
};

export const getScores = async (): Promise<Score[]> => {
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
