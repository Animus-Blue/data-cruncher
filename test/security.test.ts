import Cruncher from "../src/cruncher";

test("cannot pollute prototype through keys", () => {
  const attack = [{ id: "1", name: "__proto__", street: "pollutedProp" }];
  const cruncher = new Cruncher();
  cruncher.addCollection("people", "id", attack);
  const peopleByName = cruncher.view("people").by("name", "street").get();
  const peopleByName2 = cruncher.view("people").by("street", "name").get();
  const a: any = {};
  expect(a.pollutedProp).toBe(undefined);
});

test("cannot pollute prototype through keys", () => {
  const clean = [{ id: "1", name: "hans", street: "pollutedProp" }];
  const attack = [
    {
      id: "1",
      name: "hans",
      __proto__: { x: 42 },
      "__proto__.x": "x",
      street: "pollutedProp",
    },
  ];
  const cruncher = new Cruncher();
  cruncher.addCollection("people", "id", attack);
  cruncher.addCollection("people2", "__proto__", attack);
  cruncher.addCollection("clean", "id", clean);
  cruncher.addCollection("clean2", "__proto__", clean);
  const peopleByName = cruncher.view("people").by("name", "street").get();
  const peopleByName2 = cruncher.view("people").by("__proto__", "name").get();
  const peopleByName3 = cruncher.view("people").by("__proto__.x", "name").get();
  const peopleByName4 = cruncher.view("people2").by("name", "street").get();
  const peopleByName5 = cruncher.view("people2").by("id", "name").get();
  const peopleByName6 = cruncher
    .view("people2")
    .by("__proto__.x", "name")
    .get();
  const cleanGetter = cruncher.view("clean").by("name", "street").get();
  const cleanGetter2 = cruncher.view("clean").by("__proto__", "name").get();
  const cleanGetter3 = cruncher.view("clean").by("name", "__proto__").get();
  const cleanGetter4 = cruncher.view("clean2").by("name", "street").get();
  const cleanGetter5 = cruncher.view("clean2").by("id", "name").get();
  const cleanGetter6 = cruncher.view("clean2").by("__proto__.x", "name").get();
  const a: any = {};
  expect(a.pollutedProp).toBe(undefined);
  expect(a.name).toBe(undefined);
  expect(a.id).toBe(undefined);
  expect(a.street).toBe(undefined);
  expect(a.x).toBe(undefined);
  expect(a.hans).toBe(undefined);
});

test("cannot pollute prototype through keys when initializing data later", () => {
  const clean = [{ id: "1", name: "hans", street: "pollutedProp" }];
  const attack = [
    {
      id: "1",
      name: "hans",
      __proto__: { x: 42 },
      "__proto__.x": "x",
      street: "pollutedProp",
    },
  ];
  const cruncher = new Cruncher();
  cruncher.addCollection("people", "id", []);
  cruncher.addCollection("people2", "__proto__", []);
  cruncher.addCollection("clean", "id", []);
  cruncher.addCollection("clean2", "__proto__", []);
  const peopleByName = cruncher.view("people").by("name", "street").get();
  const peopleByName2 = cruncher.view("people").by("__proto__", "name").get();
  const peopleByName3 = cruncher.view("people").by("__proto__.x", "name").get();
  const peopleByName4 = cruncher.view("people2").by("name", "street").get();
  const peopleByName5 = cruncher.view("people2").by("id", "name").get();
  const peopleByName6 = cruncher
    .view("people2")
    .by("__proto__.x", "name")
    .get();
  const cleanGetter = cruncher.view("clean").by("name", "street").get();
  const cleanGetter2 = cruncher.view("clean").by("__proto__", "name").get();
  const cleanGetter3 = cruncher.view("clean").by("name", "__proto__").get();
  const cleanGetter4 = cruncher.view("clean2").by("name", "street").get();
  const cleanGetter5 = cruncher.view("clean2").by("id", "name").get();
  const cleanGetter6 = cruncher.view("clean2").by("__proto__.x", "name").get();
  cruncher.update([{ collection: "people", data: attack }]);
  cruncher.update([{ collection: "people2", data: attack }]);
  cruncher.update([{ collection: "clean", data: clean }]);
  cruncher.update([{ collection: "clean2", data: clean }]);
  const a: any = {};
  expect(a.pollutedProp).toBe(undefined);
  expect(a.name).toBe(undefined);
  expect(a.id).toBe(undefined);
  expect(a.street).toBe(undefined);
  expect(a.x).toBe(undefined);
  expect(a.hans).toBe(undefined);
});

test("cannot pollute prototype through keys when updating", () => {
  const clean = [
    { id: "1", name: "hans", street: "pollutedProp" },
    { id: "2", name: "x", street: "pollutedProp" },
  ];
  const clean2 = [
    { id: "3", name: "hans", street: "pollutedProp" },
    { id: "2", name: "hans", street: "pollutedProp" },
  ];
  const attack = [
    {
      id: "1",
      name: "hans",
      __proto__: { x: 42 },
      "__proto__.x": "x",
      street: "pollutedProp",
    },
    {
      id: "2",
      name: "hans",
      __proto__: { x: 42 },
      "__proto__.x": "x2",
      street: "pollutedProp",
    },
  ];
  const attack2 = [
    {
      id: "1",
      name: "hans2",
      __proto__: { x: 42 },
      "__proto__.x": "x",
      street: "pollutedProp",
    },
    {
      id: "3",
      name: "hans",
      __proto__: { x: 42 },
      "__proto__.x": "x3",
      street: "pollutedProp",
    },
  ];
  const cruncher = new Cruncher();
  cruncher.addCollection("people", "id", attack);
  cruncher.addCollection("people2", "__proto__", attack);
  cruncher.addCollection("clean", "id", clean);
  cruncher.addCollection("clean2", "__proto__", clean);
  const peopleByName = cruncher.view("people").by("name", "street").get();
  const peopleByName2 = cruncher.view("people").by("__proto__", "name").get();
  const peopleByName3 = cruncher.view("people").by("__proto__.x", "name").get();
  const peopleByName4 = cruncher.view("people2").by("name", "street").get();
  const peopleByName5 = cruncher.view("people2").by("id", "name").get();
  const peopleByName6 = cruncher
    .view("people2")
    .by("__proto__.x", "name")
    .get();
  const cleanGetter = cruncher.view("clean").by("name", "street").get();
  const cleanGetter2 = cruncher.view("clean").by("__proto__", "name").get();
  const cleanGetter3 = cruncher.view("clean").by("name", "__proto__").get();
  const cleanGetter4 = cruncher.view("clean2").by("name", "street").get();
  const cleanGetter5 = cruncher.view("clean2").by("id", "name").get();
  const cleanGetter6 = cruncher.view("clean2").by("__proto__.x", "name").get();
  cruncher.update([{ collection: "people", data: attack2 }]);
  cruncher.update([{ collection: "people2", data: attack2 }]);
  cruncher.update([{ collection: "clean", data: clean2 }]);
  cruncher.update([{ collection: "clean2", data: clean2 }]);
  const a: any = {};
  expect(a.pollutedProp).toBe(undefined);
  expect(a.name).toBe(undefined);
  expect(a.id).toBe(undefined);
  expect(a.street).toBe(undefined);
  expect(a.x).toBe(undefined);
  expect(a.x2).toBe(undefined);
  expect(a.x3).toBe(undefined);
  expect(a.hans).toBe(undefined);
  expect(a.hans2).toBe(undefined);
});

test("cannot pollute prototype through value when initializing data later", () => {
  const attack = [{ id: "1", name: "__proto__", street: "pollutedProp" }];
  const cruncher = new Cruncher();
  cruncher.addCollection("people", "id", []);
  const peopleByName = cruncher.view("people").by("name", "street").get();
  const peopleByName2 = cruncher.view("people").by("street", "name").get();
  cruncher.update([{ collection: "people", data: attack }]);
  const a: any = {};
  expect(a.pollutedProp).toBe(undefined);
});

test("cannot pollute prototype through values when adding data", () => {
  const clean = [{ id: "1", name: "Hans", street: "Street 1" }];
  const attack = [
    { id: "1", name: "Hans", street: "Street 1" },
    { id: "2", name: "__proto__", street: "pollutedProp" },
  ];
  const cruncher = new Cruncher();
  cruncher.addCollection("people", "id", clean);
  const peopleByName = cruncher.view("people").by("name", "street").get();
  const peopleByName2 = cruncher.view("people").by("street", "name").get();
  cruncher.update([{ collection: "people", data: attack }]);
  const a: any = {};
  expect(a.pollutedProp).toBe(undefined);
});

test("cannot pollute prototype through collection names", () => {
  const clean = [{ id: "1", name: "Hans", street: "Street 1" }];
  const attack = [
    { id: "1", name: "Hans", street: "Street 1" },
    { id: "2", name: "__proto__", street: "pollutedProp" },
  ];
  const cruncher = new Cruncher();
  cruncher.addCollection("__proto__", "id", clean);
  const peopleByName = cruncher.view("__proto__").by("name", "street").get();
  const peopleByName2 = cruncher.view("__proto__").by("street", "name").get();
  cruncher.update([{ collection: "__proto__", data: attack }]);
  const a: any = {};
  expect(a["1"]).toBe(undefined);
  expect(a["2"]).toBe(undefined);
  expect(a["id"]).toBe(undefined);
  expect(a["Hans"]).toBe(undefined);
  expect(a["Street 1"]).toBe(undefined);
  expect(a["name"]).toBe(undefined);
  expect(a["street"]).toBe(undefined);
  expect(a["pollutedProp"]).toBe(undefined);
});

test("cannot pollute prototype through ids", () => {
  const clean = [{ id: "__proto__", name: "Hans", street: "Street 1" }];
  const attack = [
    { id: "__proto__", name: "Hans", street: "Street 2" },
    { id: "2", name: "__proto__", street: "pollutedProp" },
  ];
  const cruncher = new Cruncher();
  cruncher.addCollection("__proto__", "id", clean);
  const peopleByName = cruncher
    .view("__proto__")
    .by("name", "street")
    .transform((t) => ({
      street: t.street,
    }))
    .get();
  const peopleByName2 = cruncher
    .view("__proto__")
    .by("street", "name")
    .transform((t) => ({
      street: t.street,
    }))
    .get();
  cruncher.update([{ collection: "__proto__", data: attack }]);
  const a: any = {};
  expect(a["1"]).toBe(undefined);
  expect(a["2"]).toBe(undefined);
  expect(a["id"]).toBe(undefined);
  expect(a["Hans"]).toBe(undefined);
  expect(a["Street 1"]).toBe(undefined);
  expect(a["name"]).toBe(undefined);
  expect(a["street"]).toBe(undefined);
  expect(a["pollutedProp"]).toBe(undefined);
});

test("objects with __proto__ key don't cause prototype pollution", () => {
  const attack1 = [
    {
      id: "__proto__",
      name: "Hans",
      street: "Street 1",
      more: { other: true },
      __proto__: "pollutedProp",
    },
    {
      id: "__proto__2",
      name: "Hans2",
      street: "Street 1",
      more: { other: true },
      __proto__: "pollutedProp",
    },
  ];
  const attack2 = [
    {
      id: "__proto__",
      other: "other",
      street: "some",
      more: { other: true },
      __proto__: "pollutedProp",
    },
  ];
  const attack1b = [
    {
      id: "__proto__",
      name: "Hansb",
      street: "Street 1",
      more: { other: true },
      __proto__: "pollutedProp",
    },
    {
      id: "__proto__3",
      name: "Hans2",
      street: "Street 1",
      more: { other: true },
      __proto__: "pollutedProp",
    },
  ];

  const cruncher = new Cruncher();
  cruncher.addCollection("A", "id", attack1);
  cruncher.addCollection("B", "id", attack2);
  const first = cruncher
    .view("A")
    .by("name", "street")
    .join("B", "__proto__")
    .get();
  const second = cruncher
    .view("A")
    .by("name", "street")
    .join("B", "__proto__")
    .transform((t) => ({
      street: t.street,
      __proto__: t.more,
    }))
    .get();
  const third = cruncher.view("B").by("other", "__proto__").get();
  cruncher.update([{ collection: "A", data: attack1b }]);
  const a: any = {};
  expect(a["A"]).toBe(undefined);
  expect(a["name"]).toBe(undefined);
  expect(a["street"]).toBe(undefined);
  expect(a["B"]).toBe(undefined);
  expect(a["pollutedProp"]).toBe(undefined);
  expect(a["some"]).toBe(undefined);
  expect(a["more"]).toBe(undefined);
  expect(a["other"]).toBe(undefined);
});
