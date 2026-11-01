import { FC, useEffect, useRef } from "react";
import { cellKey, Position } from "../../constants/levels";
import { ItemType } from "../../utils/items";
import { MinimapCanvas } from "./styles";

type Props = {
  grid: string[];
  position: Position;
  facing: number;
  revealed: Set<string>;
  items: Record<string, ItemType>;
  hint?: Set<string>;
};

const SIZE = 168;
const ITEM_COLOR: Record<ItemType, string> = {
  gem: "#22d3ee",
  hourglass: "#f59e0b",
  boots: "#a78bfa",
};

/** Corner map that only shows cells the player has already seen. */
const Minimap: FC<Props> = ({ grid, position, facing, revealed, items, hint }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = SIZE * ratio;
    canvas.height = SIZE * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);

    const cell = SIZE / grid.length;
    grid.forEach((line, row) =>
      [...line].forEach((char, col) => {
        const key = cellKey(row, col);
        if (!revealed.has(key)) return;
        ctx.fillStyle =
          char === "#" ? "rgba(167, 155, 255, 0.75)" : char === "E" ? "#7ad7a7" : "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(col * cell, row * cell, cell, cell);
        const item = items[key];
        if (item) {
          ctx.fillStyle = ITEM_COLOR[item];
          ctx.beginPath();
          ctx.arc((col + 0.5) * cell, (row + 0.5) * cell, cell * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      })
    );

    // Compass route, even through unexplored cells
    hint?.forEach((key) => {
      const [row, col] = key.split(",").map(Number);
      ctx.fillStyle = "#fcd34d";
      ctx.beginPath();
      ctx.arc((col + 0.5) * cell, (row + 0.5) * cell, Math.max(cell * 0.22, 1.5), 0, Math.PI * 2);
      ctx.fill();
    });

    // Player arrow pointing where they face
    const cx = (position.col + 0.5) * cell;
    const cy = (position.row + 0.5) * cell;
    const r = Math.max(cell * 0.55, 3.5);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(facing * (Math.PI / 2));
    ctx.fillStyle = "#5eead4";
    ctx.shadowColor = "#5eead4";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.8, r * 0.8);
    ctx.lineTo(0, r * 0.35);
    ctx.lineTo(-r * 0.8, r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [grid, position, facing, revealed, items, hint]);

  return <MinimapCanvas ref={canvasRef} style={{ width: SIZE, height: SIZE }} aria-label="Minimap of explored cells" role="img" />;
};

export default Minimap;
