import { FC, useContext, useEffect, useMemo, useRef } from "react";
import Confetti from "react-confetti";
import GameBoard from "../../components/GameBoard/GameBoard";
import Modal from "../../components/Modal/Modal";
import { Button, Scrim, Video } from "../../components/ui/styles";
import { getLevel, LevelId } from "../../constants/levels";
import { MazeContext } from "../../contexts/Maze/context";
import { Direction } from "../../contexts/Maze/models/maze.models";
import useElapsed from "../../hooks/useElapsed";
import useWindowSize from "../../hooks/useWindowSize";
import { formatTime, saveScore } from "../../service/utils";
import { shortestPath } from "../../utils/shortestPath";
import StartGame from "../StartGame/StartGame";
import myVideo from "../../assets/videos/space.mov";
import {
  Screen,
  Hud,
  HudGroup,
  PlayerName,
  LevelBadge,
  Stat,
  StatLabel,
  StatValue,
  HudButtons,
  DPad,
  Results,
} from "./styles";

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

const STORAGE_KEY = "maze:last-player";

const loadLastPlayer = (): { name?: string; level?: LevelId } => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const Game: FC = () => {
  const { state, mazeDispatch } = useContext(MazeContext);
  const {
    gameStart,
    playerName,
    levelId,
    position,
    steps,
    isWinning,
    startedAt,
    finishedAt,
    revealed,
  } = state;
  const { startGame, move, restart, exitToMenu } = mazeDispatch;
  const { width, height } = useWindowSize();
  const elapsed = useElapsed(startedAt, finishedAt);

  const level = getLevel(levelId);
  const best = useMemo(() => shortestPath(level.grid), [level]);
  const lastPlayer = useMemo(loadLastPlayer, [gameStart]);

  // Keyboard controls
  useEffect(() => {
    if (!gameStart) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!direction || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      move(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameStart, move]);

  // Save the score once per win
  const savedRun = useRef<number | null>(null);
  useEffect(() => {
    if (isWinning && finishedAt && savedRun.current !== finishedAt) {
      savedRun.current = finishedAt;
      saveScore({ playerName, steps, level: levelId, timeMs: elapsed });
    }
  }, [isWinning, finishedAt, playerName, steps, levelId, elapsed]);

  const handleStart = (name: string, id: LevelId) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, level: id }));
    } catch {
      // Storage can be unavailable (private mode); remembering is optional
    }
    startGame(name, id);
  };

  const background = (
    <>
      <Video autoPlay loop muted playsInline>
        <source src={myVideo} type="video/mp4" />
      </Video>
      <Scrim />
    </>
  );

  if (!gameStart) {
    return (
      <>
        {background}
        <StartGame
          onStart={handleStart}
          defaultName={lastPlayer.name}
          defaultLevel={lastPlayer.level}
        />
      </>
    );
  }

  return (
    <>
      {background}

      {isWinning && <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />}

      {isWinning && (
        <Modal
          title={`You escaped, ${playerName}! 🎉`}
          onClose={exitToMenu}
          actions={
            <>
              <Button type="button" variant="ghost" onClick={exitToMenu}>
                Change level
              </Button>
              <Button type="button" onClick={restart} autoFocus>
                Play again
              </Button>
            </>
          }
        >
          <Results>
            <div>
              <span>Moves</span>
              <strong>{steps}</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{formatTime(elapsed)}</strong>
            </div>
            <div>
              <span>Best possible</span>
              <strong>{best ?? "—"}</strong>
            </div>
          </Results>
          {best !== null &&
            (steps === best ? (
              <p>Perfect run: you found the shortest path!</p>
            ) : (
              <p>
                {steps - best} moves more than the shortest path on {level.name}.
              </p>
            ))}
        </Modal>
      )}

      <Screen>
        <Hud>
          <HudGroup>
            <PlayerName title={playerName}>{playerName}</PlayerName>
            <LevelBadge>{level.name}</LevelBadge>
          </HudGroup>
          <HudGroup>
            <Stat>
              <StatLabel>Moves</StatLabel>
              <StatValue>{steps}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>Time</StatLabel>
              <StatValue>{formatTime(elapsed)}</StatValue>
            </Stat>
          </HudGroup>
          <HudButtons>
            <Button type="button" variant="ghost" onClick={restart}>
              Restart
            </Button>
            <Button type="button" variant="ghost" onClick={exitToMenu}>
              Menu
            </Button>
          </HudButtons>
        </Hud>

        <GameBoard
          grid={level.grid}
          position={position}
          fogRadius={level.fogRadius}
          revealed={revealed}
          isWinning={isWinning}
        />

        <DPad aria-label="Movement controls">
          {(["up", "left", "down", "right"] as Direction[]).map((direction) => (
            <button
              key={direction}
              type="button"
              className={direction}
              aria-label={`Move ${direction}`}
              onClick={() => move(direction)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 7l6 8H6z" />
              </svg>
            </button>
          ))}
        </DPad>
      </Screen>
    </>
  );
};

export default Game;
