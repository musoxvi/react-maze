import { createContext, useMemo, useReducer, FC } from "react";
import { getLevel, isRandomLevel } from "../../constants/levels";
import { mazeForLevel } from "../../utils/levelMaze";
import { ContextProps } from "./models/maze.models";
import { initialState, mazeReducer } from "./reducers";

export const MazeContext = createContext({} as ContextProps);

export const MazeProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(mazeReducer, initialState);
  const levelId = state.levelId;

  const mazeDispatch = useMemo<ContextProps["mazeDispatch"]>(
    () => ({
      startGame: (playerName, id) =>
        dispatch({ type: "START_GAME", playerName, levelId: id, grid: mazeForLevel(id) }),
      move: (direction) => dispatch({ type: "MOVE", direction }),
      turn: (side) => dispatch({ type: "TURN", side }),
      usePower: (power) => dispatch({ type: "USE_POWER", power }),
      restart: (newMap = false) =>
        dispatch({
          type: "RESTART",
          grid: newMap && isRandomLevel(getLevel(levelId)) ? mazeForLevel(levelId) : undefined,
        }),
      exitToMenu: () => dispatch({ type: "EXIT_TO_MENU" }),
    }),
    [levelId]
  );

  return (
    <MazeContext.Provider value={{ state, mazeDispatch }}>
      {children}
    </MazeContext.Provider>
  );
};
