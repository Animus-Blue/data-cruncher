import Cruncher from "../src/cruncher";
import {
  items,
  items2,
  players,
  players2,
  players3,
  players4,
  players5,
} from "./group.testdata";
import { TestUtils } from "./testutils";

test("returns correct views with joins, groupings and transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);

  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group(
      "score",
      (score) => (score >= 60 ? "top" : score >= 40 ? "middle" : "low"),
      false
    )
    .get();

  expect(playersByScore(20).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      info: "everything good",
    },
  ]);
  expect(playersByScore(50).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 42,
      info: "everything good",
    },
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      info: "everything good",
    },
  ]);
  expect(playersByScore(70).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2",
      score: 63,
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(5);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation after update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group(
      "score",
      (score) => (score >= 60 ? "top" : score >= 40 ? "middle" : "low"),
      false
    )
    .get();

  cruncher.update([{ collection: "players", data: players2 }]);
  expect(playersByScore(20).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 33,
      info: "everything good",
    },
  ]);
  expect(playersByScore(50).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      info: "everything good",
    },
    {
      id: "player6",
      name: "Yoshi",
      item: "Item 1",
      score: 56,
      info: "everything good",
    },
  ]);
  expect(playersByScore(70).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2",
      score: 63,
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true, player6: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation after update - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group(
      "score",
      (score) => (score >= 60 ? "top" : score >= 40 ? "middle" : "low"),
      false
    )
    .get();

  const lowPlayers = playersByScore(20);
  const middlePlayers = playersByScore(50);
  const highPlayers = playersByScore(70);
  cruncher.update([{ collection: "players", data: players2 }]);
  expect(playersByScore(20)).not.toBe(lowPlayers);
  expect(playersByScore(50)).not.toBe(middlePlayers);
  expect(playersByScore(70)).toBe(highPlayers);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true, player6: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation after update of references", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players2);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group(
      "score",
      (score) => (score >= 60 ? "top" : score >= 40 ? "middle" : "low"),
      false
    )
    .get();

  cruncher.update([{ collection: "items", data: items2 }]);
  expect(playersByScore(20).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2 XXL",
      score: 33,
      info: "everything good",
    },
  ]);
  expect(playersByScore(50).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      info: "everything good",
    },
    {
      id: "player6",
      name: "Yoshi",
      item: "Item 1",
      score: 56,
      info: "everything good",
    },
  ]);
  expect(playersByScore(70).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2 XXL",
      score: 63,
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2 XXL",
      score: 78,
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true, player6: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation after update of references - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players2);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group(
      "score",
      (score) => (score >= 60 ? "top" : score >= 40 ? "middle" : "low"),
      false
    )
    .get();

  const lowPlayers = playersByScore(20);
  const middlePlayers = playersByScore(50);
  const highPlayers = playersByScore(70);
  cruncher.update([{ collection: "items", data: items2 }]);
  expect(playersByScore(20)).not.toBe(lowPlayers);
  expect(playersByScore(50)).toBe(middlePlayers);
  expect(playersByScore(70)).not.toBe(highPlayers);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true, player6: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation after changes affecting the grouping", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group(
      "score",
      (score) => (score >= 60 ? "top" : score >= 40 ? "middle" : "low"),
      false
    )
    .get();

  const lowPlayers = playersByScore(20);
  const middlePlayers = playersByScore(50);
  const highPlayers = playersByScore(70);
  cruncher.update([{ collection: "players", data: players3 }]);
  expect(playersByScore(20)).not.toBe(lowPlayers);
  expect(playersByScore(50)).not.toBe(middlePlayers);
  expect(playersByScore(70)).toBe(highPlayers);

  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(5);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation after changes affecting the grouping - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group(
      "score",
      (score) => (score >= 60 ? "top" : score >= 40 ? "middle" : "low"),
      false
    )
    .get();

  cruncher.update([{ collection: "players", data: players3 }]);
  expect(playersByScore(20)).toEqual([]);
  expect(playersByScore(50).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 45,
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 42,
      info: "everything good",
    },
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      info: "everything good",
    },
  ]);
  expect(playersByScore(70).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2",
      score: 63,
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(5);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation with group as function parameter", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);

  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", (score) =>
      score >= 60 ? "top" : score >= 40 ? "middle" : "low"
    )
    .get();

  expect(
    playersByScore("low").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      info: "everything good",
    },
  ]);
  expect(
    playersByScore("middle").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 42,
      info: "everything good",
    },
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      info: "everything good",
    },
  ]);
  expect(
    playersByScore("top").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2",
      score: 63,
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(5);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation after update  with group as function parameter", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", (score) =>
      score >= 60 ? "top" : score >= 40 ? "middle" : "low"
    )
    .get();

  cruncher.update([{ collection: "players", data: players2 }]);
  expect(
    playersByScore("low").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 33,
      info: "everything good",
    },
  ]);
  expect(
    playersByScore("middle").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      info: "everything good",
    },
    {
      id: "player6",
      name: "Yoshi",
      item: "Item 1",
      score: 56,
      info: "everything good",
    },
  ]);
  expect(
    playersByScore("top").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2",
      score: 63,
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true, player6: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation after update  with group as function parameter - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", (score) =>
      score >= 60 ? "top" : score >= 40 ? "middle" : "low"
    )
    .get();

  const lowPlayers = playersByScore("low");
  const middlePlayers = playersByScore("middle");
  const highPlayers = playersByScore("top");
  cruncher.update([{ collection: "players", data: players2 }]);
  expect(playersByScore("low")).not.toBe(lowPlayers);
  expect(playersByScore("middle")).not.toBe(middlePlayers);
  expect(playersByScore("top")).toBe(highPlayers);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true, player6: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation with group as function parameter after update of references", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players2);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", (score) =>
      score >= 60 ? "top" : score >= 40 ? "middle" : "low"
    )
    .get();

  cruncher.update([{ collection: "items", data: items2 }]);
  expect(
    playersByScore("low").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2 XXL",
      score: 33,
      info: "everything good",
    },
  ]);
  expect(
    playersByScore("middle").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      info: "everything good",
    },
    {
      id: "player6",
      name: "Yoshi",
      item: "Item 1",
      score: 56,
      info: "everything good",
    },
  ]);
  expect(
    playersByScore("top").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2 XXL",
      score: 63,
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2 XXL",
      score: 78,
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true, player6: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation  with group as function parameter after update of references - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players2);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", (score) =>
      score >= 60 ? "top" : score >= 40 ? "middle" : "low"
    )
    .get();

  const lowPlayers = playersByScore("low");
  const middlePlayers = playersByScore("middle");
  const highPlayers = playersByScore("top");
  cruncher.update([{ collection: "items", data: items2 }]);
  expect(playersByScore("low")).not.toBe(lowPlayers);
  expect(playersByScore("middle")).toBe(middlePlayers);
  expect(playersByScore("top")).not.toBe(highPlayers);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true, player6: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation  with group as function parameter after changes affecting the grouping", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", (score) =>
      score >= 60 ? "top" : score >= 40 ? "middle" : "low"
    )
    .get();

  const lowPlayers = playersByScore("low");
  const middlePlayers = playersByScore("middle");
  const highPlayers = playersByScore("top");
  cruncher.update([{ collection: "players", data: players3 }]);
  expect(playersByScore("low")).not.toBe(lowPlayers);
  expect(playersByScore("middle")).not.toBe(middlePlayers);
  expect(playersByScore("top")).toBe(highPlayers);

  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(5);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation  with group as function parameter after changes affecting the grouping - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", (score) =>
      score >= 60 ? "top" : score >= 40 ? "middle" : "low"
    )
    .get();

  cruncher.update([{ collection: "players", data: players3 }]);
  expect(playersByScore("low")).toEqual([]);
  expect(
    playersByScore("middle").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 45,
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 42,
      info: "everything good",
    },
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      info: "everything good",
    },
  ]);
  expect(
    playersByScore("top").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2",
      score: 63,
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(5);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation with group as function parameter for some groupings", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players4);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score", "color")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", (score) => (score >= 50 ? "high" : "low"), false)
    .group("color", (color) =>
      color === "blue" || color === "white" ? "cold" : "warm"
    )
    .get();

  expect(playersByScore(20, "warm")).toEqual([]);
  expect(
    playersByScore(20, "cold").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      color: "blue",
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 42,
      color: "white",
      info: "everything good",
    },
  ]);
  expect(
    playersByScore(60, "warm").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      color: "red",
      info: "everything good",
    },

    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      color: "red",
      info: "everything good",
    },
  ]);
  expect(playersByScore(60, "cold")).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2",
      score: 63,
      color: "white",
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(5);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("returns correct views with joins, groupings and transformation with group as function parameter for all groupings", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("players", "id", players4);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score", "color")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", (score) => (score >= 50 ? "high" : "low"))
    .group("color", (color) =>
      color === "blue" || color === "white" ? "cold" : "warm"
    )
    .get();

  expect(playersByScore("low", "warm")).toEqual([]);
  expect(
    playersByScore("low", "cold").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      color: "blue",
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 42,
      color: "white",
      info: "everything good",
    },
  ]);
  expect(
    playersByScore("high", "warm").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      color: "red",
      info: "everything good",
    },

    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      color: "red",
      info: "everything good",
    },
  ]);
  expect(playersByScore("high", "cold")).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2",
      score: 63,
      color: "white",
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(5);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
});

test("each grouping function is only being called once per unique argument and cache works", () => {
  const cruncher = new Cruncher();
  const scoreGrouping = jest.fn((score) => (score >= 50 ? "high" : "low"));
  const colorGrouping = jest.fn((color) =>
    color === "blue" || color === "white" ? "cold" : "warm"
  );
  cruncher.addCollection("players", "id", players4);
  cruncher.addCollection("items", "id", items);
  const playersByScore = cruncher
    .view("players")
    .by("score", "color")
    .join("items", "item")
    .transform((player) => ({
      ...player,
      item: player.item?.name,
    }))
    .group("score", scoreGrouping, false)
    .group("color", colorGrouping, false)
    .get();

  cruncher.update([{ collection: "players", data: players5 }]);
  cruncher.update([{ collection: "players", data: players4 }]);
  expect(
    playersByScore(39, "blue").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      color: "blue",
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 42,
      color: "white",
      info: "everything good",
    },
  ]);
  expect(
    playersByScore(42, "white").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player1",
      name: "Mario",
      item: "Item 1",
      score: 39,
      color: "blue",
      info: "everything good",
    },
    {
      id: "player2",
      name: "Luigi",
      item: "Item 2",
      score: 42,
      color: "white",
      info: "everything good",
    },
  ]);
  expect(
    playersByScore(78, "red").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      color: "red",
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      color: "red",
      info: "everything good",
    },
  ]);
  expect(
    playersByScore(55, "red").sort((a, b) => a.id.localeCompare(b.id))
  ).toEqual([
    {
      id: "player3",
      name: "Bowser",
      item: "Item 1",
      score: 55,
      color: "red",
      info: "everything good",
    },
    {
      id: "player5",
      name: "Wario",
      item: "Item 2",
      score: 78,
      color: "red",
      info: "everything good",
    },
  ]);
  expect(playersByScore(63, "white")).toEqual([
    {
      id: "player4",
      name: "Toad",
      item: "Item 2",
      score: 63,
      color: "white",
      info: "everything good",
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "players")).toBe(5);
  expect(TestUtils.getInternalSize(cruncher, "items")).toBe(2);
  expect(TestUtils.getReferences(cruncher)).toEqual({
    players: {
      item: {
        item1: { player1: true, player3: true },
        item2: { player2: true, player4: true, player5: true },
      },
    },
  });
  expect(scoreGrouping.mock.calls).toHaveLength(5);
  expect(colorGrouping.mock.calls).toHaveLength(3);
});
