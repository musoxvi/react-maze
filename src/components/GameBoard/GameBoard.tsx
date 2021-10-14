import React, { memo, useContext } from "react";
import mazes from "../../constants/maze";
import { MazeContext } from "../../contexts/Maze/context";
import {
  Cell,
  AllAdjacentCells,
  grabAllAdjacentCells,
} from "../../utils/grabAllAdjacentCells";
import Block from "../Block/Block";
import { Body } from "./styles";

type Props = {
  columns?: number;
  rows?: number;
  getAllAdjacentCells: (allAdjacentCells: AllAdjacentCells) => void;
  getCurrentCell: (currentCell: Cell) => void;
};

const GameBoard: React.FC<Props> = ({
  getAllAdjacentCells,
  getCurrentCell,
}) => {
  const { state } = useContext(MazeContext);

  const { playerPosition } = state || { playerPosition: 0 };

  /**
   * renderBoard
   * @returns {React.ReactNode}
   */
  const createBoard = (): React.ReactNode => {
    let index = 0;

    return mazes.map((row, rowIndex) => {
      const maze = row.map((col, colIndex) => {
        const currentCell = mazes[rowIndex][colIndex];
        index++;

        if (index === playerPosition) {
          const allAdjacentCells = grabAllAdjacentCells(
            mazes,
            rowIndex,
            colIndex
          );

          setTimeout(() => {
            getCurrentCell(currentCell);
            getAllAdjacentCells(allAdjacentCells);
          }, 50);
        }

        const { type } = col || {};
        return (
          <Block
            key={index}
            counter={index}
            playerPosition={playerPosition}
            type={type}
          />
        );
      });

      return maze;
    });
  };

  return <Body>{createBoard()}</Body>;
};

export default memo(GameBoard);
