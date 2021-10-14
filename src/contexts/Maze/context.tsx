import { createContext, useReducer, FC } from "react";
import { mazeActions } from "./actions";
import { ContextProps } from "./models/maze.models";
import { initialState, mazeReducer } from "./reducers";

export const MazeContext = createContext<Partial<ContextProps>>({});

export const MazeProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(mazeReducer, initialState);

  const mazeDispatch = {
    setPlayerPosition(playerPosition: number) {
      dispatch(mazeActions.setPlayerPosition(playerPosition));
    },
    setSteps(steps: number) {
      dispatch(mazeActions.setSteps(steps));
    },
    setWinning(isWinning: boolean) {
      dispatch(mazeActions.setWinning(isWinning));
    },
    setGameStart(gameStart: boolean) {
      dispatch(mazeActions.setGameStart(gameStart));
    },
    setRestartGame() {
      dispatch(mazeActions.setRestartGame());
    },
  };

  return (
    <MazeContext.Provider value={{ state, mazeDispatch }}>
      {children}
    </MazeContext.Provider>
  );
};
