export class Block {
  numBombsSurrounding: number = 0;
  isBomb: boolean = false;
  selected: boolean = false;
  flagged: boolean = false;

  setAdjBombs(numAdj: number) {
    this.numBombsSurrounding = numAdj;
  }
}
