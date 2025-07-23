import { DefaultEventsMap, Socket } from "socket.io";
import { GameManager } from "../lib/gamemanager";
import { generate_room } from "../utils/rand_gen";

type AckMessageType = {
  is_ok: boolean;
  message: string;
};

/**
 * Create Room Event Receiever
 */
export const roomCreationEvent = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  gm: GameManager,
  cb: (msg: AckMessageType) => void
) => {
  // create a new room id
  let Room_id = generate_room();

  // check its not duplicate
  while (!!(await gm.check_waiting_room(Room_id))) {
    Room_id = generate_room();
  }

  // put into waiting set
  await gm.set_waiting_room(Room_id);

  cb({ is_ok: true, message: `Room_id: ${Room_id} is created...` });
};

/**
 * Join Room Event Receiever
 */
export const roomJoinEvent = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  gm: GameManager
) => {};
