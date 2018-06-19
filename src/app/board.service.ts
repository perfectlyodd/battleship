import { Injectable } from '@angular/core';
import { Board } from './board';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  playerID: number = 1;
  boards: Board[] = [];

  constructor() { }

  createBoard(size: number = 5) : BoardService {
    let tiles = [];
    for (let i = 0; i < size; i++) {
      tiles[i] = [];
      for (let j = 0; j < size; j++) {
        tiles[i][j] = { used: false, value: 0, status: '' };
      }
    }
    
    for (let i = 0; i < size * 2; i++) {
      tiles = this.randomShips(tiles, size);
    }

    let board = new Board({
      player: new Player({ id: this.playerID++ }),
      tiles: tiles
    });

    this.boards.push(board);
    return this;
  }
      // Questions:
      // Why is the return type "BoardService"?  Couldn't it just be "void"?

  randomShips(tiles: Object[], len: number) : Object[] {
    len--;
      // Modified from original
    let randomRow = this.getRandomInt(0, len),
        randomCol = this.getRandomInt(0, len);
    if (tiles[randomRow][randomCol].value == 1) {
      return this.randomShips(tiles, len);
    } else {
      tiles[randomRow][randomCol].value = 1;
      return tiles;
    }
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getBoards() : Board[] {
    return this.boards;
  }
}
