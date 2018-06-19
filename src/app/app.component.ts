import { Component, ViewContainerRef } from '@angular/core';
import { BoardService } from './board.service';
import { Board } from './board';

const NUM_PLAYERS: number = 2;
const BOARD_SIZE: number = 6;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  providers: [BoardService]
})
export class AppComponent {
  canPlay: boolean = true;
  player: number = 0;
  players: number = 0;
  gameId: string;
  gameUrl: string = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port: '');

  constructor(
    private _boardService: BoardService,
    private _vcr: ViewContainerRef
  ) {
    this.createBoards();
  }

  fireTorpedo(e: any) : AppComponent {
    let id = e.target.id,
      boardId = id.substring(1, 2),
      row = id.substring(2, 3),
      col = id.substring(3, 4), 
      tile = this.boards[boardId].tiles[row][col];
    
    if (!this.checkValidHit(boardId, tile)) {
      return;
    }

    if (tile.value == 1) {
      this.boards[boardId].tiles[row][col].status = 'win';
      this.boards[this.player].player.score++;
    } else {
      this.boards[boardId].tiles[row][col].status = 'fail';
    }

    this.canPlay = false;
    this.boards[boardId].tiles[row][col].used = true;
    this.boards[boardId].tiles[row][col].value = "X";
    return this;
  }

  checkValidHit(boardId: number, tile: any) : boolean {
    if (boardId == this.player) {
      return false;
    }

    if (this.winner) {
      return false;
    }

    if (!this.canPlay) {
      return false;
    }

    if (tile.value == "X") {
      return false;
    }

    return true;
  }

  createBoards() : AppComponent {
    for (let i = 0; i < NUM_PLAYERS; i++) {
      this._boardService.createBoard(BOARD_SIZE);
    }
    return this;
  }

  get winner() : Board {
    return this.boards.find(board => board.player.score >= BOARD_SIZE);
  }

  get boards() : Board[] {
    return this._boardService.getBoards();
  }
    // Note that this "get" method is automatically invoked whenever other class methods access "this.boards"
}
