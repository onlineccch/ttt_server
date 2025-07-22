import { describe, test, expect } from "@jest/globals";
import { GameManager } from "../lib/gamemanager";

const gm = new GameManager();

describe("Testing Game Manager", () => {
  test("Initialize Game Manager", () => {
    expect(gm.room_count()).toBe(0);
    expect(gm).toBeInstanceOf(GameManager);
  });

  test("Create a new game", () => {
    gm.create_room("1", "1", "2");
    expect(gm.room_count()).toBe(1);
    gm.create_room("1", "1", "2");
    expect(gm.room_count()).toBe(1);
    gm.create_room("2", "1", "2");
    expect(gm.room_count()).toBe(2);
  });

  test("Check game status", () => {
    expect(gm.check_game("3")).toBe(undefined);
    const game_1 = gm.check_game("1");
    const game_2 = gm.check_game("2");

    expect(game_1).toBeDefined();
    expect(game_2).toBeDefined();

    expect(game_1?.isover).toBe(false);
    expect(game_2?.isover).toBe(false);

    expect(game_1?.turn).toBe(-1);
    expect(game_2?.turn).toBe(-1);

    const org_state = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    expect(game_1?.state).toStrictEqual(org_state);
    expect(game_2?.state).toStrictEqual(org_state);
  });

  test("Destroy Game Room", () => {
    gm.destroy_room("2");

    expect(gm.room_count()).toBe(1);
    expect(gm.check_game("2")).toBeUndefined();
  });

  test("Player mark", () => {
    gm.player_mark("1", 1, [0, 0]);

    let org_state = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    expect(gm.check_game("1")?.turn).toBe(-1);
    expect(gm.check_game("1")?.isover).toBe(false);
    expect(gm.check_game("1")?.state).toStrictEqual(org_state);

    org_state[0][0] = -1;

    gm.player_mark("1", -1, [0, 0]);
    expect(gm.check_game("1")?.turn).toBe(1);
    expect(gm.check_game("1")?.isover).toBe(false);
    expect(gm.check_game("1")?.state).toStrictEqual(org_state);
  });

  test("Check winner", () => {
    expect(gm.check_game("1")?.turn).toBe(1);
    gm.player_mark("1", 1, [2, 0]);
    expect(gm.check_game("1")?.turn).toBe(-1);
    gm.player_mark("1", -1, [0, 1]);
    expect(gm.check_game("1")?.turn).toBe(1);
    gm.player_mark("1", 1, [2, 1]);
    expect(gm.check_game("1")?.turn).toBe(-1);
    gm.player_mark("1", -1, [0, 2]);
    expect(gm.check_game("1")?.isover).toBe(true);
    expect(gm.check_game("1")?.winner).toBe(-1);
    gm.destroy_room("1");
  });

  test("Check tie", () => {
    gm.create_room("1", "1", "2");

    gm.player_mark("1", -1, [0, 0]);
    expect(gm.check_game("1")?.turn).toBe(1);
    gm.player_mark("1", 1, [0, 1]);
    expect(gm.check_game("1")?.turn).toBe(-1);
    gm.player_mark("1", -1, [1, 1]);
    expect(gm.check_game("1")?.turn).toBe(1);
    gm.player_mark("1", 1, [1, 0]);
    expect(gm.check_game("1")?.turn).toBe(-1);
    gm.player_mark("1", -1, [1, 2]);
    expect(gm.check_game("1")?.turn).toBe(1);
    gm.player_mark("1", 1, [0, 2]);
    expect(gm.check_game("1")?.turn).toBe(-1);
    gm.player_mark("1", -1, [2, 0]);
    expect(gm.check_game("1")?.turn).toBe(1);
    gm.player_mark("1", 1, [2, 2]);
    expect(gm.check_game("1")?.turn).toBe(-1);
    gm.player_mark("1", -1, [2, 1]);

    expect(gm.check_game("1")?.isover).toBe(true);
    expect(gm.check_game("1")?.winner).toBe(0);
  });
});
