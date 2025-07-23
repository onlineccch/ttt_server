import { describe, test, expect } from "@jest/globals";
import { GameManager } from "../lib/gamemanager";

const gm = new GameManager();

describe("Testing Game Manager", () => {
  test("Initialize Game Manager", async () => {
    expect(await gm.room_count()).toBe(0);
    expect(gm).toBeInstanceOf(GameManager);
  });

  test("Create a new game", async () => {
    await gm.create_room("1", "1", "2");
    expect(await gm.room_count()).toBe(1);
    await gm.create_room("1", "1", "2");
    expect(await gm.room_count()).toBe(1);
    await gm.create_room("2", "1", "2");
    expect(await gm.room_count()).toBe(2);
  });

  test("Check game status", async () => {
    expect(await gm.check_game("3")).toBe(undefined);
    const game_1 = await gm.check_game("1");
    const game_2 = await gm.check_game("2");

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

  test("Destroy Game Room", async () => {
    await gm.destroy_room("2");

    expect(await gm.room_count()).toBe(1);
    expect(await gm.check_game("2")).toBeUndefined();
  });

  test("Player mark", async () => {
    await gm.player_mark("1", 1, [0, 0]);

    let org_state = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    let currGame = await gm.check_game("1");
    if (!currGame) return;

    expect(currGame.turn).toBe(-1);
    expect(currGame.isover).toBe(false);
    expect(currGame.state).toStrictEqual(org_state);

    org_state[0][0] = -1;

    gm.player_mark("1", -1, [0, 0]);
    currGame = await gm.check_game("1");
    if (!currGame) return;

    expect(currGame.turn).toBe(1);
    expect(currGame.isover).toBe(false);
    expect(currGame.state).toStrictEqual(org_state);
  });

  test("Check winner", async () => {
    expect((await gm.check_game("1"))?.turn).toBe(1);
    await gm.player_mark("1", 1, [2, 0]);
    expect((await gm.check_game("1"))?.turn).toBe(-1);
    await gm.player_mark("1", -1, [0, 1]);
    expect((await gm.check_game("1"))?.turn).toBe(1);
    await gm.player_mark("1", 1, [2, 1]);
    expect((await gm.check_game("1"))?.turn).toBe(-1);
    await gm.player_mark("1", -1, [0, 2]);
    expect((await gm.check_game("1"))?.isover).toBe(true);
    expect((await gm.check_game("1"))?.winner).toBe(-1);
    await gm.destroy_room("1");
  });

  test("Check tie", async () => {
    await gm.create_room("1", "1", "2");

    await gm.player_mark("1", -1, [0, 0]);
    expect((await gm.check_game("1"))?.turn).toBe(1);
    await gm.player_mark("1", 1, [0, 1]);
    expect((await gm.check_game("1"))?.turn).toBe(-1);
    await gm.player_mark("1", -1, [1, 1]);
    expect((await gm.check_game("1"))?.turn).toBe(1);
    await gm.player_mark("1", 1, [1, 0]);
    expect((await gm.check_game("1"))?.turn).toBe(-1);
    await gm.player_mark("1", -1, [1, 2]);
    expect((await gm.check_game("1"))?.turn).toBe(1);
    await gm.player_mark("1", 1, [0, 2]);
    expect((await gm.check_game("1"))?.turn).toBe(-1);
    await gm.player_mark("1", -1, [2, 0]);
    expect((await gm.check_game("1"))?.turn).toBe(1);
    await gm.player_mark("1", 1, [2, 2]);
    expect((await gm.check_game("1"))?.turn).toBe(-1);
    await gm.player_mark("1", -1, [2, 1]);

    expect((await gm.check_game("1"))?.isover).toBe(true);
    expect((await gm.check_game("1"))?.winner).toBe(0);
  });
});
