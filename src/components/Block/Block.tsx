import Player from "../../assets/svg/player.svg?react";
import Door from "../../assets/svg/door.svg?react";
import { Path, Wall, PlayerContainer, ExitContainer } from "./styles";

type Props = {
  type: string;
  counter: number;
  playerPosition: number;
};

const Block: React.FC<Props> = ({ type, counter, playerPosition }) => {
  if (counter === playerPosition) {
    return (
      <PlayerContainer>
        <Player />
      </PlayerContainer>
    );
  } else if (type === "wall") {
    return <Wall />;
  } else if (type === "exit") {
    return (
      <ExitContainer>
        <Door />
      </ExitContainer>
    );
  }

  return <Path />;
};

export default Block;
