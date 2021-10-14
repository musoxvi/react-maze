function setPlayerPosition(playerPosition: number) {
  return {
    type: "SET_PLAYER_POSITION",
    playerPosition,
  };
}

function setSteps(steps: number) {
  return {
    type: "SET_STEPS",
    steps,
  };
}

function setWinning(isWinning: boolean) {
  return {
    type: "SET_WINNING",
    isWinning,
  };
}

function setGameStart(gameStart: boolean) {
  return {
    type: "SET_GAME_START",
    gameStart,
  };
}

function setRestartGame() {
  return {
    type: "SET_RESTART_GAME",
  };
}

export const mazeActions = {
  setPlayerPosition,
  setSteps,
  setWinning,
  setGameStart,
  setRestartGame,
};
