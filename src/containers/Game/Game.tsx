/* eslint-disable react-hooks/exhaustive-deps */
// Dependencies
import { FC, useContext, memo, useState, useEffect, useCallback } from "react";
import Confetti from "react-confetti";
// Components
import GameBoard from "../../components/GameBoard/GameBoard";
// Hooks
import { MazeContext } from "../../contexts/Maze/context";
import useWindowSize from "../../hooks/useWindowSize";
// Utils
import { AllAdjacentCells, Cell } from "../../utils/grabAllAdjacentCells";
import StartGame from "../StartGame/StartGame";
// Styles
import { Container, Header, Video, Button } from "./styles";
import myVideo from "../../assets/videos/space.mov";
import Modal from "../../components/Modal/Modal";
import { saveScore } from "../../service/utils";

type Props = {
  columns?: number;
  rows?: number;
};

const Game: FC<Props> = ({ columns, rows }: any) => {
  const { state, mazeDispatch } = useContext(MazeContext);
  const { width, height } = useWindowSize();

  const [allAdjacentCells, setAllAdjacentCells] =
    useState<AllAdjacentCells | null>(null);
  const [currentCell, setCurrentCell] = useState<Cell | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [playerName, setPlayerName] = useState<string>("");

  const { type } = currentCell || {};
  const { playerPosition, steps, isWinning, gameStart } = state || {
    playerPosition: 0,
    steps: 0,
  };
  const { rightCell, topCell, leftCell, bottomCell } = allAdjacentCells || {};
  const {
    setPlayerPosition,
    setSteps,
    setWinning,
    setGameStart,
    setRestartGame,
  } = mazeDispatch || {};

  useEffect(() => {
    if (type === "exit") {
      saveScore(playerName, steps);
      setShowModal((prev) => !prev);
      setWinning(true);
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const playerNameInput = (e.target as any)?.playerName;
    const playerNameValue = playerNameInput?.value || "";

    setPlayerName(playerNameValue);

    setGameStart(true);
  };

  const handleRestartGame = () => {
    setRestartGame();
    setShowModal(false);
  };

  const movePlayer = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isWinning) {
        return false;
      }
      switch (event.key) {
        case "ArrowRight":
          if (
            playerPosition + 1 <= 12 * 12 &&
            playerPosition % 12 !== 0 &&
            (rightCell?.type === "path" || rightCell?.type === "exit")
          ) {
            setPlayerPosition(playerPosition + 1);
            return setSteps(steps + 1);
          }
          return false;
        case "ArrowLeft":
          if (playerPosition % 12 !== 1 && leftCell?.type === "path") {
            setPlayerPosition(playerPosition - 1);
            return setSteps(steps + 1);
          }
          return false;

        case "ArrowUp":
          if (playerPosition - 12 > 0 && topCell?.type === "path") {
            setPlayerPosition(playerPosition - 12);
            return setSteps(steps + 1);
          }
          return false;

        case "ArrowDown":
          if (playerPosition + 12 <= 12 * 12 && bottomCell?.type === "path") {
            setPlayerPosition(playerPosition + 12);
            return setSteps(steps + 1);
          }
      }
    },
    [
      bottomCell?.type,
      leftCell?.type,
      playerPosition,
      rightCell?.type,
      setPlayerPosition,
      setSteps,
      steps,
      topCell?.type,
    ]
  );

  return (
    <>
      {showModal && (
        <Modal
          title={`Congratulations ${playerName || ""}! 🥳 `}
          content={`You have won in ${steps} moves! to continue playing, press accept.`}
          buttonText="Accept"
          setShowModal={setShowModal}
          onClick={handleRestartGame}
        />
      )}

      {isWinning && showModal && <Confetti width={width} height={height} />}

      <Video autoPlay loop muted className="video">
        <source src={myVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </Video>

      {!gameStart ? (
        <StartGame handleSubmit={handleSubmit} />
      ) : (
        <Container
          ref={(game) => game && game.focus()}
          onKeyDown={movePlayer}
          tabIndex={0}
        >
          <Header>
            <h2>CookUnity</h2>
            <p>{`moves: ${steps}`}</p>
          </Header>
          <GameBoard
            columns={columns}
            rows={rows}
            getAllAdjacentCells={setAllAdjacentCells}
            getCurrentCell={setCurrentCell}
          />
          {isWinning && (
            <Button type="button" onClick={handleRestartGame}>
              Play again
            </Button>
          )}
        </Container>
      )}
    </>
  );
};

export default memo(Game);
