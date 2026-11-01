import { useEffect, useState } from "react";

/** Milliseconds since `start`, ticking every 250ms until `end` is set. */
const useElapsed = (start: number | null, end: number | null) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (start === null || end !== null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [start, end]);

  if (start === null) return 0;
  return (end ?? now) - start;
};

export default useElapsed;
