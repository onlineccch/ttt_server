import { DefaultEventsMap, Socket } from "socket.io";
import { GameManager } from "../lib/gamemanager";
import { generate_room } from "../utils/rand_gen";

type RoomJoinPayload = {
  room_id: string;
};

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
  callback: (ms: AckMessageType) => void
) => {
  // create a new room id
  let Room_id = generate_room();

  // check its not duplicate
  while (!!(await gm.check_waiting_room(Room_id))) {
    Room_id = generate_room();
  }

  // put into waiting set
  await gm.set_waiting_room(Room_id);

  for (let i of socket.rooms) {
    await socket.leave(i);
    await gm.remove_waiting_room(i);
  }

  // join socket room
  await socket.join(Room_id);

  callback({ is_ok: true, message: `Room_id (${Room_id}) is created...` });
};

/**
 * Join Room Event Receiever
 */
export const roomJoinEvent = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  pl: RoomJoinPayload,
  gm: GameManager,
  callback: (ms: AckMessageType) => void
) => {
  if (!pl.room_id) {
    callback({ message: "Room id is required...", is_ok: false });
    return;
  }

  if (!(await gm.check_waiting_room(pl.room_id))) {
    callback({ message: "Cannot find the waiting room...", is_ok: false });
    return;
  }

  if (socket.rooms.size >= 2) {
    callback({ message: "Game room already at max capacity...", is_ok: false });
    return;
  }

  socket.join(pl.room_id);
};
