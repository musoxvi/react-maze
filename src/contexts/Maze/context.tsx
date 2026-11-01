import { createContext, useMemo, useReducer, FC } from "react";
import { ContextProps } from "./models/maze.models";
import { initialState, mazeReducer } from "./reducers";

export const MazeContext = createContext({} as ContextProps);

export const MazeProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(mazeReducer, initialState);

  const mazeDispatch = useMemo<ContextProps["mazeDispatch"]>(
    () => ({
      startGame: (playerName, levelId) =>
        dispatch({ type: "START_GAME", playerName, levelId }),
      move: (direction) => dispatch({ type: "MOVE", direction }),
      restart: () => dispatch({ type: "RESTART" }),
      exitToMenu: () => dispatch({ type: "EXIT_TO_MENU" }),
    }),
    []
  );

  return (
    <MazeContext.Provider value={{ state, mazeDispatch }}>
      {children}
    </MazeContext.Provider>
  );
};
