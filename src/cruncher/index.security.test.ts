import Cruncher from ".";

test("cannot pollute prototype through keys", () => {
  const attack = [{ id: "1", name: "__proto__", street: "pollutedProp" }];
  const cruncher = new Cruncher();
  cruncher.addCollection("people", "id", attack);
  const peopleByName = cruncher.view("people").keys("name", "street").get();
  const peopleByName2 = cruncher.view("people").keys("street", "name").get();
  const a: any = {};
  expect(a.pollutedProp).toBe(undefined);
});

test("cannot pollute prototype through keys when initializing data later", () => {
  const attack = [{ id: "1", name: "__proto__", street: "pollutedProp" }];
  const cruncher = new Cruncher();
  cruncher.addCollection("people", "id", []);
  const peopleByName = cruncher.view("people").keys("name", "street").get();
  const peopleByName2 = cruncher.view("people").keys("street", "name").get();
  cruncher.update([{ collection: "people", data: attack }]);
  const a: any = {};
  expect(a.pollutedProp).toBe(undefined);
});

test("cannot pollute prototype through keys when adding data", () => {
  const clean = [{ id: "1", name: "Hans", street: "Street 1" }];
  const attack = [
    { id: "1", name: "Hans", street: "Street 1" },
    { id: "2", name: "__proto__", street: "pollutedProp" },
  ];
  const cruncher = new Cruncher();
  cruncher.addCollection("people", "id", clean);
  const peopleByName = cruncher.view("people").keys("name", "street").get();
  const peopleByName2 = cruncher.view("people").keys("street", "name").get();
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
  const peopleByName = cruncher.view("__proto__").keys("name", "street").get();
  const peopleByName2 = cruncher.view("__proto__").keys("street", "name").get();
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
    .keys("name", "street")
    .transform((t) => ({
      street: t.street,
    }))
    .get();
  const peopleByName2 = cruncher
    .view("__proto__")
    .keys("street", "name")
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
    .keys("name", "street")
    .join("B", "__proto__")
    .get();
  const second = cruncher
    .view("A")
    .keys("name", "street")
    .join("B", "__proto__")
    .transform((t) => ({
      street: t.street,
      __proto__: t.more,
    }))
    .get();
  const third = cruncher.view("B").keys("other", "__proto__").get();
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
