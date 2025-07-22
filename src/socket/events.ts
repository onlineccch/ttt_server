import { DefaultEventsMap, Socket } from "socket.io";

/**
 * Create Room Event Receiever
 */
export const roomCreationEvent = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {};

/**
 * Join Room Event Receiever
 */
export const roomJoinEvent = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {};
