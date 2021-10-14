import Game from "./containers/Game/Game";
import { MazeProvider } from "./contexts/Maze/context";

const App = () => {
  return (
    <MazeProvider>
      <div id="modal-root" />
      <Game />
    </MazeProvider>
  );
};

export default App;
