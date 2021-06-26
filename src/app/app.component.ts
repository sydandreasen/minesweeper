import { Component } from '@angular/core';
import { Block } from './Block';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  numBlocks: number = 49; // a perfect square. use sqrt(numBlocks) in repeat() in scss
  blocks: Block[][] = new Array<Array<Block>>();
  msg: string | null = null;
  bombProb: number = 0.576;

  constructor() {
    this.generateGame();
  }

  generateGame(): void {
    this.msg = null;
    // empty blocks
    this.blocks = new Array<Array<Block>>();
    // create blocks
    for (let r = 0; r < Math.sqrt(this.numBlocks); r++) {
      let row: Block[] = new Array<Block>();
      for (let c = 0; c < Math.sqrt(this.numBlocks); c++) {
        let temp = new Block();
        temp.isBomb = !!Math.round(Math.random() * this.bombProb);
        row.push(temp);
      }
      this.blocks.push(row);
    }
    // determine number bombs around them
    for (let r = 0; r < Math.sqrt(this.numBlocks); r++) {
      let row: Block[] = this.blocks[r];
      for (let c = 0; c < Math.sqrt(this.numBlocks); c++) {
        let block = row[c];
        block.setAdjBombs(this.numAdjacentBombs(r, c));
      }
    }
  }

  setBombProb(prob: number): void {
    this.bombProb = prob;
    this.generateGame();
  }

  numAdjacentBombs(r: number, c: number): number {
    const minRow = r === 0 ? 0 : r - 1;
    const minCol = c === 0 ? 0 : c - 1;

    const maxRow =
      r === Math.sqrt(this.numBlocks) - 1
        ? Math.sqrt(this.numBlocks) - 1
        : r + 1;
    const maxCol =
      c === Math.sqrt(this.numBlocks) - 1
        ? Math.sqrt(this.numBlocks) - 1
        : c + 1;

    let numAdj = 0;
    for (let offsetR = minRow; offsetR <= maxRow; offsetR++) {
      let row = this.blocks[offsetR];
      for (let offsetC = minCol; offsetC <= maxCol; offsetC++) {
        // don't check itself
        if (c !== offsetC || r !== offsetR) {
          let checkBlock = row[offsetC];
          if (checkBlock.isBomb) {
            numAdj++;
          }
        }
      }
    }
    return numAdj;
  }

  locateAdjacentZeros(r: number, c: number): void {
    const minRow = r === 0 ? 0 : r - 1;
    const minCol = c === 0 ? 0 : c - 1;

    const maxRow =
      r === Math.sqrt(this.numBlocks) - 1
        ? Math.sqrt(this.numBlocks) - 1
        : r + 1;
    const maxCol =
      c === Math.sqrt(this.numBlocks) - 1
        ? Math.sqrt(this.numBlocks) - 1
        : c + 1;

    for (let offsetR = minRow; offsetR <= maxRow; offsetR++) {
      let row = this.blocks[offsetR];
      for (let offsetC = minCol; offsetC <= maxCol; offsetC++) {
        // XOR to check. don't want to show diagonal zeros. either-or AND NOT both
        if (
          (offsetC === c || offsetR === r) &&
          !(offsetC === c && offsetR === r)
        ) {
          let checkBlock = row[offsetC];
          if (checkBlock.numBombsSurrounding === 0 && !checkBlock.selected) {
            checkBlock.selected = true;
            this.locateAdjacentZeros(offsetR, offsetC);
          }
        }
      }
    }
  }

  checkWin(): boolean {
    // search through blocks. if there are any non-bomb non-selected blocks, haven't won
    for (let r = 0; r < Math.sqrt(this.numBlocks); r++) {
      let row = this.blocks[r];
      for (let c = 0; c < Math.sqrt(this.numBlocks); c++) {
        let block = row[c];
        if (!block.isBomb && !block.selected) {
          return false;
        }
      }
    }
    return true;
  }

  onClick(block: Block, r: number, c: number): void {
    block.flagged = false;
    block.selected = true;
    let won = this.checkWin();
    if (won) {
      this.clearBoard();
      this.msg = 'YOU WON';
    } else {
      if (block.isBomb) {
        this.clearBoard();
        this.msg = 'YOU LOST';
      } // if the num is zero, need recursive logic to auto-select adjacent zeros
      else if (block.numBombsSurrounding === 0) {
        this.locateAdjacentZeros(r, c);
      }
    }
  }

  onRightClick(event: Event, block: Block): void {
    event.preventDefault();
    block.flagged = !block.flagged;
    block.selected = false;
  }

  clearBoard(): void {
    for (let r = 0; r < Math.sqrt(this.numBlocks); r++) {
      let row = this.blocks[r];
      for (let c = 0; c < Math.sqrt(this.numBlocks); c++) {
        row[c].selected = true;
      }
    }
  }
}
