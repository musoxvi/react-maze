import { FC, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti";
import GameBoard from "../../components/GameBoard/GameBoard";
import Modal from "../../components/Modal/Modal";
import { Button, Scrim, Video } from "../../components/ui/styles";
import {
  cellKey,
  getLevel,
  getNextLevel,
  isRandomLevel,
  LEVELS,
  LevelId,
  VIEW_LABEL,
} from "../../constants/levels";
import { COMPASS_LENGTH, getPower, PowerId, POWERS } from "../../constants/powers";
import { MazeContext } from "../../contexts/Maze/context";
import { Direction, FACING_DIRECTION } from "../../contexts/Maze/models/maze.models";
import useElapsed from "../../hooks/useElapsed";
import useOnline from "../../hooks/useOnline";
import useWindowSize from "../../hooks/useWindowSize";
import { finalScore, getCompletedLevels } from "../../service/records";
import { consumePower, grantReward, Reward } from "../../service/wallet";
import useWallet from "../../hooks/useWallet";
import { routeToExit } from "../../utils/route";
import { formatTime, saveScore } from "../../service/utils";
import { ITEM_INFO } from "../../utils/items";
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
  OfflineBadge,
  Loading,
  DPad,
  Results,
  RecordNote,
  Toast,
  Legend,
  PowerBar,
  RewardBox,
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

// three.js is large: only download it when a 3D level is played
const Maze3D = lazy(() => import("../../components/Maze3D/Maze3D"));

const STORAGE_KEY = "maze:last-player";

const loadLastPlayer = (): { name?: string; level?: LevelId } => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const rememberPlayer = (name: string, level: LevelId) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, level }));
  } catch {
    // Storage can be unavailable (private mode); remembering is optional
  }
};

const levelLabel = (id: LevelId) => {
  const level = getLevel(id);
  return `${VIEW_LABEL[level.view]} · ${level.name}`;
};

const Game: FC = () => {
  const { state, mazeDispatch } = useContext(MazeContext);
  const {
    gameStart,
    playerName,
    levelId,
    grid,
    position,
    steps,
    isWinning,
    startedAt,
    finishedAt,
    revealed,
    items,
    points,
    freeSteps,
    lastPickup,
    facing,
    dash,
    lanternBonus,
    compass,
    powersUsed,
  } = state;
  const { startGame, move, turn, usePower, restart, exitToMenu } = mazeDispatch;
  const wallet = useWallet();
  const [reward, setReward] = useState<Reward | null>(null);
  const { width, height } = useWindowSize();
  const elapsed = useElapsed(startedAt, finishedAt);
  const online = useOnline();
  const [isRecord, setIsRecord] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Brief notice when an item is picked up
  useEffect(() => {
    if (!lastPickup) return;
    const info = ITEM_INFO[lastPickup.type];
    setToast(`${info.icon} ${info.label}: ${info.effect}`);
  }, [lastPickup]);

  // Notices hide themselves
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const level = getLevel(levelId);
  const nextLevel = getNextLevel(levelId);
  const best = useMemo(() => shortestPath(grid), [grid]);
  const lastPlayer = useMemo(loadLastPlayer, [gameStart]);

  const firstPerson = level.view === "fp";

  // In first person ↑/↓ walk forward/back relative to where you look and
  // ←/→ turn on the spot; elsewhere the arrows are compass directions
  const control = useCallback(
    (direction: Direction) => {
      if (!firstPerson) return move(direction);
      if (direction === "up") return move(FACING_DIRECTION[facing]);
      if (direction === "down") return move(FACING_DIRECTION[(facing + 2) % 4]);
      turn(direction === "left" ? "left" : "right");
    },
    [firstPerson, facing, move, turn]
  );

  // The lantern only helps where vision is limited
  const lanternUseful = level.fogRadius !== undefined || firstPerson;
  const canUse = (id: PowerId) =>
    !isWinning && (wallet.inventory[id] ?? 0) > 0 && (id !== "lantern" || lanternUseful);

  const activatePower = useCallback(
    (id: PowerId) => {
      if (isWinning || (id === "lantern" && !lanternUseful)) return;
      if (!consumePower(id)) return;
      usePower(id);
      const power = getPower(id);
      setToast(`${power.icon} ${power.name}: ${power.description}`);
    },
    [isWinning, lanternUseful, usePower]
  );

  // Keyboard controls: arrows/WASD to move, 1-4 for powers
  useEffect(() => {
    if (!gameStart) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const power = POWERS.find((p) => p.key === e.key);
      if (power) {
        e.preventDefault();
        activatePower(power.id);
        return;
      }
      const direction = KEY_TO_DIRECTION[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!direction) return;
      e.preventDefault();
      control(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameStart, control, activatePower]);

  // Compass: the next cells of the shortest route from where you stand
  const hint = useMemo(() => {
    if (compass <= 0 || isWinning) return undefined;
    return new Set(
      routeToExit(grid, position)
        .slice(0, COMPASS_LENGTH)
        .map((cell) => cellKey(cell.row, cell.col))
    );
  }, [compass, isWinning, grid, position]);

  // Save the score once per win
  const savedRun = useRef<number | null>(null);
  useEffect(() => {
    if (isWinning && finishedAt && savedRun.current !== finishedAt) {
      savedRun.current = finishedAt;
      const firstClear = !getCompletedLevels().includes(levelId);
      const result = saveScore({
        playerName,
        steps,
        points,
        level: levelId,
        timeMs: elapsed,
        best: best ?? undefined,
        powers: powersUsed.length ? powersUsed : undefined,
      });
      setIsRecord(result.isRecord);

      const finished = getLevel(levelId);
      const tier = LEVELS.filter((l) => l.view === finished.view).indexOf(finished);
      setReward(
        grantReward({
          tier,
          score: finalScore({ steps, points, best: best ?? undefined, level: levelId }) ?? 0,
          firstClear,
          perfect: best !== null && steps <= best,
        })
      );
    }
  }, [isWinning, finishedAt, playerName, steps, points, levelId, elapsed, best, powersUsed]);

  const play = (name: string, id: LevelId) => {
    rememberPlayer(name, id);
    setIsRecord(false);
    setReward(null);
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

  const offline = !online && <OfflineBadge role="status">Offline · records saved on this device</OfflineBadge>;

  if (!gameStart) {
    return (
      <>
        {background}
        {offline}
        <StartGame
          onStart={play}
          defaultName={lastPlayer.name}
          defaultLevel={lastPlayer.level}
        />
      </>
    );
  }

  const boardProps = {
    grid,
    position,
    // Lanterns widen whatever vision limit the level has
    fogRadius: level.fogRadius !== undefined ? level.fogRadius + lanternBonus : undefined,
    revealed,
    items,
    isWinning,
  };
  const score = finalScore({ steps, points, best: best ?? undefined, level: levelId });

  return (
    <>
      {background}
      {offline}

      {isWinning && <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />}

      {isWinning && (
        <Modal
          title={nextLevel ? `Level complete, ${playerName}! 🎉` : `You beat every level, ${playerName}! 🏆`}
          onClose={exitToMenu}
          actions={
            <>
              <Button type="button" variant="ghost" onClick={exitToMenu}>
                Menu
              </Button>
              <Button type="button" variant="ghost" onClick={() => restart(true)}>
                {isRandomLevel(level) ? "New maze" : "Play again"}
              </Button>
              {nextLevel && (
                <Button type="button" onClick={() => play(playerName, nextLevel.id)} autoFocus>
                  Next: {levelLabel(nextLevel.id)} →
                </Button>
              )}
            </>
          }
        >
          {isRecord && <RecordNote>New personal record on {levelLabel(levelId)}!</RecordNote>}
          {reward && (
            <RewardBox>
              <strong>
                +{reward.coins} 🪙 · +{reward.xp} XP
              </strong>
              <span>{reward.breakdown.map((line) => `${line.label} +${line.coins}`).join(" · ")}</span>
              {reward.levelAfter > reward.levelBefore && (
                <em>Level up! You are now level {reward.levelAfter} ⭐</em>
              )}
            </RewardBox>
          )}
          <Results>
            <div className="highlight">
              <span>Score</span>
              <strong>{score ?? "—"}</strong>
            </div>
            <div>
              <span>Moves</span>
              <strong>{steps}</strong>
            </div>
            <div>
              <span>Shortest</span>
              <strong>{best ?? "—"}</strong>
            </div>
            <div>
              <span>Bonus</span>
              <strong>+{points}</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{formatTime(elapsed)}</strong>
            </div>
          </Results>
          {best !== null &&
            (steps <= best ? (
              <p>
                {steps < best
                  ? `${best - steps} moves under the shortest path thanks to your items!`
                  : "Perfect run: you found the shortest path!"}
              </p>
            ) : (
              <p>{steps - best} moves more than the shortest path (−{(steps - best) * 10} points).</p>
            ))}
        </Modal>
      )}

      <Screen>
        <Hud>
          <HudGroup>
            <PlayerName title={playerName}>{playerName}</PlayerName>
            <LevelBadge>{levelLabel(levelId)}</LevelBadge>
          </HudGroup>
          <HudGroup>
            <Stat>
              <StatLabel>Moves</StatLabel>
              <StatValue>{steps}</StatValue>
            </Stat>
            {level.items ? (
              <Stat>
                <StatLabel>Bonus</StatLabel>
                <StatValue>+{points}</StatValue>
              </Stat>
            ) : null}
            {freeSteps > 0 && (
              <Stat title="Steps back onto visited cells are free">
                <StatLabel>👣 Free</StatLabel>
                <StatValue>{freeSteps}</StatValue>
              </Stat>
            )}
            <Stat>
              <StatLabel>Time</StatLabel>
              <StatValue>{formatTime(elapsed)}</StatValue>
            </Stat>
          </HudGroup>
          <HudButtons>
            <Button type="button" variant="ghost" onClick={() => restart()}>
              Restart
            </Button>
            <Button type="button" variant="ghost" onClick={exitToMenu}>
              Menu
            </Button>
          </HudButtons>
        </Hud>

        {toast && <Toast role="status">{toast}</Toast>}

        <PowerBar aria-label="Powers">
          {POWERS.map((power) => {
            const owned = wallet.inventory[power.id] ?? 0;
            const active =
              (power.id === "dash" && dash > 0) ||
              (power.id === "compass" && compass > 0) ||
              (power.id === "boots" && freeSteps > 0) ||
              (power.id === "lantern" && lanternBonus > 0);
            return (
              <button
                key={power.id}
                type="button"
                disabled={!canUse(power.id)}
                aria-pressed={active}
                title={`${power.name} (${power.key}): ${power.description}`}
                onClick={() => activatePower(power.id)}
              >
                <span className="icon">{power.icon}</span>
                <span className="count">{owned}</span>
                <kbd>{power.key}</kbd>
                {power.id === "dash" && dash > 0 && <span className="live">{dash}</span>}
                {power.id === "compass" && compass > 0 && <span className="live">{compass}</span>}
              </button>
            );
          })}
        </PowerBar>

        {level.view !== "2d" ? (
          <Suspense fallback={<Loading>Loading 3D…</Loading>}>
            <Maze3D {...boardProps} firstPerson={firstPerson} facing={facing} hint={hint} />
          </Suspense>
        ) : (
          <GameBoard {...boardProps} hint={hint} />
        )}

        {firstPerson && (
          <Legend>
            <span>
              <kbd>↑</kbd> forward
            </span>
            <span>
              <kbd>↓</kbd> back
            </span>
            <span>
              <kbd>←</kbd> <kbd>→</kbd> turn
            </span>
          </Legend>
        )}

        {level.items ? (
          <Legend>
            Side paths hide{" "}
            {Object.values(ITEM_INFO).map((info) => (
              <span key={info.label}>
                {info.icon} {info.effect}
              </span>
            ))}
          </Legend>
        ) : null}

        <DPad aria-label="Movement controls">
          {(["up", "left", "down", "right"] as Direction[]).map((direction) => (
            <button
              key={direction}
              type="button"
              className={direction}
              aria-label={
                firstPerson
                  ? { up: "Forward", down: "Back", left: "Turn left", right: "Turn right" }[direction]
                  : `Move ${direction}`
              }
              onClick={() => control(direction)}
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
