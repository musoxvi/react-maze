import { db } from "./Firebase";

export const saveScore = (playerName: string, steps: number) => {
  const options = {
    month: "short",
    day: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const today = new Date();
  db.collection("scores").add({
    id: new Date().getTime(),
    playerName,
    steps,
    date: today.toLocaleDateString("en-US", options as any),
  });
};
