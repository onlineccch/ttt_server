import { logger } from "../conf/logger";

type MatchState = (0 | 1 | -1)[][];

type GamePlayer = {
  side: 0 | 1;
  id: string;
};

type GameMatch = {
  turn: 0 | 1;
  state: MatchState;
  isover: boolean;
};

type GameRoom = {
  players: GamePlayer[];
  match: GameMatch;
};

/**
 * Tik Tac Toe Game Manager
 *
 * @property **rooms**  *GameRoom Object Map*
 */
export class GameManager {
  rooms: Map<string, GameRoom>;

  constructor() {
    this.rooms = new Map();
  }

  /**
   * return total room size
   * @returns room size (number)
   */
  room_count() {
    return this.rooms.size;
  }

  /**
   * create a new game room for 2 players
   *
   * @param room_id  *room id to create*
   * @param p1  *player 1 id*
   * @param p2  *player 2 id*
   */
  create_room(room_id: string, p1: string, p2: string) {
    if (!!this.rooms.get(room_id)) {
      logger.error(`Room (${room_id}) already exists...`);
      return;
    }

    // create player 1
    const player1: GamePlayer = {
      id: p1,
      side: 0,
    };

    // create player 2
    const player2: GamePlayer = {
      id: p2,
      side: 1,
    };

    // create game match
    const match: GameMatch = {
      turn: 0,
      state: [
        [-1, -1, -1],
        [-1, -1, -1],
        [-1, -1, -1],
      ],
      isover: false,
    };

    // set a new game match to room map
    this.rooms.set(room_id, {
      match: match,
      players: [player1, player2],
    });
    logger.info(
      `Created a new room of ${room_id} with player 1 (${p1}) and player 2 (${p2})...`
    );
  }

  /**
   *
   * Delete current Game from Map
   *
   * @param room_id *current room's id to destroy*
   */
  destroy_room(room_id: string) {
    if (!this.rooms.get(room_id)) {
      logger.error(`Found no room of ${room_id} to delete...`);
      return;
    }

    this.rooms.delete(room_id);
    logger.info(`Deleted ${room_id} room.`);
  }

  /**
   *
   * player mark the the place
   *
   * @param room_id *current room id to update the game state*
   * @param player *player who make the mark*
   * @param place *x,y point to place the mark*
   */
  player_mark(room_id: string, player: 0 | 1, place: (0 | 1 | 2)[]) {
    const currGame = this.rooms.get(room_id);

    if (place.length != 2) {
      logger.error(`Invalid place to mark ${room_id}...`);
      return;
    }

    if (!currGame) {
      logger.error(`Found no room of ${room_id} to update...`);
      return;
    }

    if (currGame.match.turn != player) {
      logger.warn(`Wait for your turn...`);
      return;
    }

    if (currGame.match.state[place[0]][place[1]] !== -1) {
      logger.error(`Already mark on ${place[0]}, ${place[1]}`);
      return;
    }

    currGame.match.state[place[0]][place[1]] = player;
    currGame.match.turn = player == 0 ? 1 : 0;
    logger.info(`Updated the game state of ${room_id}...`);
  }

  /**
   *
   * Check the current Game Match
   *
   * @param room_id *room id to check*
   * @returns current game match
   */
  check_game(room_id: string) {
    const currGame = this.rooms.get(room_id);
    if (!currGame) {
      logger.error(`Found no room of ${room_id}...`);
      return;
    }

    return currGame.match;
  }
}
