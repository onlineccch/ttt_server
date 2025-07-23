import { Mutex } from "async-mutex";
import { logger } from "../conf/logger";
import { check_is_over } from "../utils/ttt_game";

type MatchState = (0 | 1 | -1)[][];

type GamePlayer = {
  side: -1 | 1;
  id: string;
};

type GameMatch = {
  turn: -1 | 1;
  state: MatchState;
  isover: boolean;
  winner: -1 | 1 | 0;
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
  private waitingRooms: Set<string>;
  private rooms: Map<string, GameRoom>;
  private mutex: Mutex;

  constructor() {
    this.rooms = new Map();
    this.waitingRooms = new Set();
    this.mutex = new Mutex();
  }

  /**
   * return total room size
   * @returns room size (number)
   */
  async room_count(): Promise<number> {
    return this.rooms.size;
  }

  /**
   *
   * check if room exists in the waiting set
   *
   * @param room_id room id to check from waiting set
   * @returns boolean
   */
  async check_waiting_room(room_id: string): Promise<boolean> {
    return this.waitingRooms.has(room_id);
  }

  /**
   *
   * @param room_id *room id to set waiting*
   */
  async set_waiting_room(room_id: string) {
    if (!!this.waitingRooms.has(room_id)) {
      logger.error("Room id already in the waiting sets.");
      return;
    }

    await this.mutex.runExclusive(() => {
      this.waitingRooms.add(room_id);
      logger.info(`Room id ${room_id} set for waiting...`);
    });
  }

  /**
   *
   * @param room_id *room id to remove from waiting*
   */
  async remove_waiting_room(room_id: string) {
    if (!this.waitingRooms.has(room_id)) {
      logger.error("Room id not found in the waiting sets.");
      return;
    }

    await this.mutex.runExclusive(() => {
      this.waitingRooms.delete(room_id);
      logger.info(`Room id ${room_id} removed from waiting...`);
    });
  }

  /**
   * create a new game room for 2 players
   *
   * @param room_id  *room id to create*
   * @param p1  *player 1 id*
   * @param p2  *player 2 id*
   */
  async create_room(room_id: string, p1: string, p2: string) {
    if (!!this.rooms.get(room_id)) {
      logger.error(`Room (${room_id}) already exists...`);
      return;
    }

    // remove room from waiting set
    await this.remove_waiting_room(room_id);

    // create player 1
    const player1: GamePlayer = {
      id: p1,
      side: -1,
    };

    // create player 2
    const player2: GamePlayer = {
      id: p2,
      side: 1,
    };

    // create game match
    const match: GameMatch = {
      turn: -1,
      state: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      isover: false,
      winner: 0,
    };

    await this.mutex.runExclusive(() => {
      // set a new game match to room map
      this.rooms.set(room_id, {
        match: match,
        players: [player1, player2],
      });
      logger.info(
        `Created a new room of ${room_id} with player 1 (${p1}) and player 2 (${p2})...`
      );
    });
  }

  /**
   *
   * Delete current Game from Map
   *
   * @param room_id *current room's id to destroy*
   */
  async destroy_room(room_id: string) {
    if (!this.rooms.get(room_id)) {
      logger.error(`Found no room of ${room_id} to delete...`);
      return;
    }

    await this.mutex.runExclusive(() => {
      this.rooms.delete(room_id);
      logger.info(`Deleted ${room_id} room.`);
    });
  }

  /**
   *
   * player mark the the place
   *
   * @param room_id *current room id to update the game state*
   * @param player *player who make the mark*
   * @param place *x,y point to place the mark*
   */
  async player_mark(room_id: string, player: -1 | 1, place: (0 | 1 | 2)[]) {
    const currGame = this.rooms.get(room_id);

    if (place.length != 2) {
      logger.error(`Invalid place to mark ${room_id}...`);
      return;
    }

    if (!currGame) {
      logger.error(`Found no room of ${room_id} to update...`);
      return;
    }

    if (currGame.match.isover) {
      logger.warn(`Current game is over...`);
      return;
    }

    if (currGame.match.turn != player) {
      logger.warn(`Wait for your turn...`);
      return;
    }

    if (currGame.match.state[place[0]][place[1]] !== 0) {
      logger.error(`Already mark on ${place[0]}, ${place[1]}`);
      return;
    }

    await this.mutex.runExclusive(async () => {
      currGame.match.state[place[0]][place[1]] = player;
      currGame.match.turn = player == 1 ? -1 : 1;

      // check if the game is over
      const currStatus = await check_is_over(currGame.match.state);
      currGame.match.isover = currStatus.is_over;
      currGame.match.winner = currStatus.winner;
      logger.info(`Updated the game state of ${room_id}...`);

      if (currStatus.is_over) {
        logger.info(`Game ${room_id} is over...`);
        return;
      }
    });
  }

  /**
   *
   * Check the current Game Match
   *
   * @param room_id *room id to check*
   * @returns current game match
   */
  async check_game(room_id: string): Promise<GameMatch | undefined> {
    const currGame = this.rooms.get(room_id);
    if (!currGame) {
      logger.error(`Found no room of ${room_id}...`);
      return;
    }

    return currGame.match;
  }
}
