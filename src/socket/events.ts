import { DefaultEventsMap, Socket } from "socket.io";
import { GameManager } from "../lib/gamemanager";
import { generate_room } from "../utils/rand_gen";
import { z } from "zod";

const MarkPlacePayload = z.object({
  room_id: z.string().length(5),
  place: z.array(z.literal([0, 1, 2])).length(2),
  turn: z.literal([-1, 1]),
});

type MarkPlacePayloadType = z.infer<typeof MarkPlacePayload>;

const CheckGamePayload = z.object({
  room_id: z.string().length(5),
});

type CheckGamePayloadType = z.infer<typeof CheckGamePayload>;

const RoomJoinPayload = z.object({
  room_id: z.string().length(5),
});

type RoomJoinPayloadType = z.infer<typeof RoomJoinPayload>;

type MatchState = (0 | 1 | -1)[][];

type GameMatch = {
  turn: -1 | 1;
  state: MatchState;
  isover: boolean;
  winner: -1 | 1 | 0;
};

type AckCheckGameType = {
  is_ok: boolean;
  state?: GameMatch;
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
  payload: RoomJoinPayloadType,
  gm: GameManager,
  callback: (ms: AckMessageType) => void
) => {
  let pl: RoomJoinPayloadType;

  try {
    pl = RoomJoinPayload.parse(payload);
  } catch (err) {
    callback({ message: "Invalid payload type...", is_ok: false });
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

  callback({
    message: `Successfully joined to room (${pl.room_id})`,
    is_ok: true,
  });
};

/**
 * Mark Place Event Receiever
 */
export const markPlaceEvent = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  payload: MarkPlacePayloadType,
  gm: GameManager,
  callback: (ms: AckMessageType) => void
) => {
  let pl: MarkPlacePayloadType;

  try {
    pl = MarkPlacePayload.parse(payload);
  } catch (err) {
    callback({ message: "Invalid payload type...", is_ok: false });
    return;
  }

  if (!(await gm.check_game(pl.room_id))) {
    callback({ message: "Game not found...", is_ok: false });
    return;
  }

  try {
    await gm.player_mark(pl.room_id, pl.turn, pl.place);
  } catch (err) {
    callback({ message: err as string, is_ok: false });
    return;
  }

  socket.broadcast.to(pl.room_id).emit("mark_place", pl);
};

/**
 * Game Check Event Receiever
 */
export const checkGameEvent = async (
  _: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  payload: CheckGamePayloadType,
  gm: GameManager,
  callback: (ms: AckCheckGameType) => void
) => {
  let pl: CheckGamePayloadType;

  try {
    pl = CheckGamePayload.parse(payload);
  } catch (err) {
    callback({ state: undefined, is_ok: false });
    return;
  }

  const currGame = await gm.check_game(pl.room_id);

  if (!currGame) {
    callback({ state: undefined, is_ok: false });
    console.log("Game not found");
    return;
  }

  console.log("game state:", currGame);

  return callback({ is_ok: true, state: currGame });
};
