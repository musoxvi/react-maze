import { FC, memo, useEffect, useRef, useState } from "react";
import { cellKey, isInSight, Position } from "../../constants/levels";
import Door from "./Door";
import Walker from "./Walker";
import { Board, Player } from "./styles";

type Props = {
  grid: string[];
  position: Position;
  fogRadius?: number;
  revealed: Set<string>;
  isWinning: boolean;
};

const CELL_CLASS: Record<string, string> = {
  "#": "wall",
  ".": "path",
  S: "path entrance",
  E: "exit",
};

const GameBoard: FC<Props> = ({ grid, position, fogRadius, revealed, isWinning }) => {
  const size = grid.length;
  const [walking, setWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const previous = useRef(position);

  // Play the walk cycle for a moment after each move and face the direction of travel
  useEffect(() => {
    const dCol = position.col - previous.current.col;
    const moved = dCol !== 0 || position.row !== previous.current.row;
    previous.current = position;
    if (!moved) return;
    if (dCol !== 0) setFacingLeft(dCol < 0);
    setWalking(true);
    const id = window.setTimeout(() => setWalking(false), 320);
    return () => window.clearTimeout(id);
  }, [position]);

  // "" = visible, " seen" = explored but out of sight, " fog" = never seen
  const fogClass = (row: number, col: number) => {
    if (fogRadius === undefined || isWinning || isInSight(position, row, col, fogRadius)) {
      return "";
    }
    return revealed.has(cellKey(row, col)) ? " seen" : " fog";
  };

  return (
    <Board style={{ ["--size" as string]: size }} aria-label="Maze board">
      {grid.flatMap((line, row) =>
        [...line].map((char, col) => (
          <div
            key={`${row}-${col}`}
            className={`cell ${CELL_CLASS[char]}${fogClass(row, col)}`}
          >
            {char === "E" && <Door />}
          </div>
        ))
      )}
      <Player
        className={[walking && "walking", facingLeft && "left", isWinning && "won"]
          .filter(Boolean)
          .join(" ")}
        style={{
          transform: `translate(${position.col * 100}%, ${position.row * 100}%)`,
        }}
        aria-label="Player"
      >
        <Walker />
      </Player>
    </Board>
  );
};

export default memo(GameBoard);
