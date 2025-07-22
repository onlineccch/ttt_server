type MatchStatus = {
  is_over: boolean;
  winner: -1 | 0 | 1;
};

export const check_is_over = (state: (0 | 1 | -1)[][]): MatchStatus => {
  const lines = [
    // row
    [state[0][0], state[0][1], state[0][2]],
    [state[1][0], state[1][1], state[1][2]],
    [state[2][0], state[2][1], state[2][2]],

    // column
    [state[0][0], state[1][0], state[2][0]],
    [state[0][1], state[1][1], state[2][1]],
    [state[0][2], state[1][2], state[2][2]],

    // diagonal
    [state[0][0], state[1][1], state[2][2]],
    [state[0][2], state[1][1], state[2][0]],
  ];

  for (let line of lines) {
    const total = (line as number[]).reduce((prev, curr) => prev + curr, 0);
    if (total == 3)
      return {
        winner: 1,
        is_over: true,
      };
    else if (total == -3)
      return {
        winner: -1,
        is_over: true,
      };
  }

  const isEmpty = state.flat().some((cell) => cell === 0);

  if (isEmpty)
    return {
      winner: 0,
      is_over: false,
    };
  else return { winner: 0, is_over: true };
};
