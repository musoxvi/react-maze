import styled, { keyframes } from "styled-components";

const shake = keyframes`
10%, 90% {
  transform: translate3d(-1px, 0, 0);
}

20%, 80% {
  transform: translate3d(1px, 0, 0);
}

30%, 50%, 70% {
  transform: translate3d(-1px, -1px, 0);
}

40%, 60% {
  transform: translate3d(1px, 1px, 0);
}
`;

export const Wall = styled.div`
  background-color: black;
  height: 40px;
  width: 60px;
  border: 1px solid #fff;
`;

export const Path = styled(Wall)`
  background-color: rgba(200, 200, 250, 0.4);
  border: 1px solid rgba(200, 200, 250, 0.2);
`;

export const PlayerContainer = styled(Wall)`
  animation: ${shake} 1s infinite;
  background-color: rgba(250, 250, 250, 0.9);
  border: 1px solid orange;
`;

export const ExitContainer = styled(Wall)`
  background-color: #7ad7a7;
  border: 1px solid #7ad7a7;
`;
