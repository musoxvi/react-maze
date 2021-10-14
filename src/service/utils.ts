import { db } from "./Firebase";

export const saveScore = (playerName: string, steps: number) => {
  const options = {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    formatMatcher: "best fit",
    hour12: true,
  };
  const today = new Date();
  db.collection("scores").add({
    id: new Date().getTime(),
    playerName,
    steps,
    date: today.toLocaleDateString("en-AU", options as any),
  });
};
