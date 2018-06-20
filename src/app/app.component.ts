import { Component, ViewContainerRef } from '@angular/core';
import { BoardService } from './board.service';
import { Board } from './board';
import { ToastrService } from 'ngx-toastr';
import { faTint } from '@fortawesome/free-solid-svg-icons';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faShip } from '@fortawesome/free-solid-svg-icons';

const NUM_PLAYERS: number = 2;
const BOARD_SIZE: number = 6;
declare const Pusher: any;
  // The "declare" keyword simply informs the compiler that the variable "Pusher" has been defined elsewhere.

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  providers: [BoardService]
})
export class AppComponent {
  pusherChannel: any;
  canPlay: boolean = true;
  player: number = 0;
  players: number = 0;
  gameId: string;
  gameUrl: string = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port: '');
  messageString: string = "";
  water: any = faTint;
  coffee: any = faCoffee;
  ship: any = faShip;

  constructor(
    private toastr: ToastrService,
    private _boardService: BoardService,
    private _vcr: ViewContainerRef
      // This should be unnecessary now (no longer needed by toastr)
  ) {
    //this.toastr.setRootViewContainerRef(_vcr);
      // Necessary with old ToastModule, not necessary with ToastrModule
      // #YayAngular6
    this.createBoards();
    this.initPusher();
    this.listenForChanges();
        // Given the way these methods are written, these can probably be dot-chained
  }

  initPusher() : AppComponent {
    let id = this.getQueryParam('id');
    if (!id) {
      id = this.getUniqueId();
      location.search = location.search ? '&id=' + id : 'id=' + id;
    }
    this.gameId = id;
    const pusher = new Pusher('1064401eb8ccf6725b67', {
      authEndpoint: '/pusher/auth',
      cluster: 'us2'
    });

    this.pusherChannel = pusher.subscribe(this.gameId);
    this.pusherChannel.bind('pusher:member_added', member => { this.players++ });
    this.pusherChannel.bind('pusher:subscription_succeeded', members => {
      this.players = members.count;
      this.setPlayer(this.players);
      this.toastr.success("Success", "Connected!");
      this.displayMessage(`Subscription succeeded!  ${this.players} players have joined.`);
    });
    this.pusherChannel.bind('pusher:member_removed', member => { this.players-- });

    return this;
  }
      // The only advantage I can think of to returning "this" is to allow dot-chaining in the constructor

  displayMessage(str: string) {
    this.messageString = str;
  }


  listenForChanges() : AppComponent {
    this.pusherChannel.bind('client-fire', (obj) => {
      this.canPlay = !this.canPlay;
      this.boards[obj.boardId] = obj.board;
      this.boards[obj.player].player.score = obj.score;
    });
    return this;
  }

  setPlayer(players: number = 0) : AppComponent {
    this.player = players - 1;
    if (players == 1) {
      this.canPlay = true;
    } else if (players == 2) {
      this.canPlay = false;
    }
    return this;
  }

  fireTorpedo(e: any) : AppComponent {
    this.displayMessage("Firing torpedo!");
    
    let id = e.target.id,
      boardId = id.substring(1, 2),
      row = id.substring(2, 3),
      col = id.substring(3, 4);
    this.displayMessage(`id = ${id}, boardId = ${boardId}, row = ${row}, col = ${col}`);
    let tile = this.boards[boardId].tiles[row][col];
    
    if (!this.checkValidHit(boardId, tile)) {
      return;
    }

    if (tile.value == 1) {
      this.toastr.success("You sank a ship.", "Yayyyyy");
      this.boards[boardId].tiles[row][col].status = 'win';
      this.boards[this.player].player.score++;
    } else {
      this.toastr.info("Keep trying, boss", "All aboard the failboat");
      this.boards[boardId].tiles[row][col].status = 'fail';
    }

    this.canPlay = false;
    this.boards[boardId].tiles[row][col].used = true;
    this.boards[boardId].tiles[row][col].value = "X";

    this.pusherChannel.trigger('client-fire', {
      player: this.player,
      score: this.boards[this.player].player.score,
      boardId: boardId,
      board: this.boards[boardId]
    });
    return this;
  }

  getQueryParam(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }

  getUniqueId() {
    return 'presence-' + Math.random().toString(36).substr(2,8);
  }

  get validPlayer() : boolean {
    //return (this.players >= NUM_PLAYERS) && (this.player < NUM_PLAYERS);
    return true;
  }

  checkValidHit(boardId: number, tile: any) : boolean {
    if (boardId == this.player) {
      this.toastr.error("EPIC FAIL", "You're shooting at yourself, you know");
      return false;
    }

    if (this.winner) {
      this.toastr.error("Game over");
      return false;
    }

    if (!this.canPlay) {
      this.toastr.error("Hold that thought", "Not your turn yet!");
      return false;
    }

    if (tile.value == "X") {
      this.toastr.error("Conserve your ammo", "Looks like you've been here before");
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
