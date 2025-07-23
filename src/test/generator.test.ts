import { describe, test, expect } from "@jest/globals";
import { generate_room } from "../utils/rand_gen";

describe("Testing generator", () => {
  test("Room Id generator", () => {
    const roomId = generate_room();
    console.log("Room Id: " + roomId);
    expect(roomId).toBeDefined();
    expect(typeof roomId).toBe("string");
    expect(roomId.length).toBe(5);
  });
});
