export type Cell = {
  type: string;
};

export type AllAdjacentCells = {
  topCell: Cell | null;
  leftCell: Cell | null;
  rightCell: Cell | null;
  bottomCell: Cell | null;
};

export const grabAllAdjacentCells = (
  cells: Cell[][],
  rowParam: number,
  colParam: number,
  maxRow: number = 12,
  maxColumn: number = 12
): AllAdjacentCells => {
  const topCell = rowParam > 0 ? cells[rowParam - 1][colParam] : null;

  const leftCell = colParam > 0 ? cells[rowParam][colParam - 1] : null;
  const rightCell =
    colParam < maxColumn - 1 ? cells[rowParam][colParam + 1] : null;

  const bottomCell =
    rowParam < maxRow - 1 ? cells[rowParam + 1][colParam] : null;

  return {
    topCell,
    leftCell,
    rightCell,
    bottomCell,
  };
};
