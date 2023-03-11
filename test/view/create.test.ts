import create from "../../src/view/create";
import tasks from "../performanceTest/tasks.json";
import { students } from "./view.fixtures";
import { studentsWithMissingKeys } from "./view.fixtures";
import { toObject } from "../testutils";

test("returns correct result with one key", () => {
  const data = new Map();
  create(data, tasks, ["shift"], (item) => item);
  const groupedByShift = toObject(data, 1);
  const groupedExpected = tasks.reduce(
    (acc, task) => ({
      ...acc,
      [task["shift"]]: [...(acc[task["shift"]] || []), task],
    }),
    {}
  );
  expect(Object.keys(groupedByShift).length).toBe(
    Object.keys(groupedExpected).length
  );
  for (let key of Object.keys(groupedExpected)) {
    groupedByShift[key].sort((a, b) => b.id.localeCompare(a.id));
    groupedExpected[key].sort((a, b) => b.id.localeCompare(a.id));
    expect(groupedByShift[key]).toEqual(groupedExpected[key]);
  }
});

test("returns correct result with multiple keys", () => {
  const data = new Map();
  create(data, tasks, ["shift", "type"], (item) => item);
  const groupedByShiftAndType = toObject(data, 2);
  const groupedExpected = tasks.reduce(
    (acc, task) => ({
      ...acc,
      [task["shift"]]: {
        ...(acc[task["shift"]] || []),
        [task["type"]]: [...(acc[task["shift"]]?.[task["type"]] || []), task],
      },
    }),
    {}
  );
  expect(Object.keys(groupedByShiftAndType).length).toBe(
    Object.keys(groupedExpected).length
  );
  for (let key of Object.keys(groupedExpected)) {
    expect(Object.keys(groupedByShiftAndType[key]).length).toBe(
      Object.keys(groupedExpected[key]).length
    );
    for (let subKey of Object.keys(groupedExpected[key])) {
      groupedByShiftAndType[key][subKey].sort((a, b) =>
        b.id.localeCompare(a.id)
      );
      groupedExpected[key][subKey].sort((a, b) => b.id.localeCompare(a.id));
      expect(groupedByShiftAndType[key][subKey]).toEqual(
        groupedExpected[key][subKey]
      );
    }
  }
});

test("returns correct result with multiple keys and ignores missing values", () => {
  const data = new Map();
  create(data, tasks, ["workStation", "employee"], (item) => item);
  const groupedByShiftAndType = toObject(data, 2);
  const groupedExpected = tasks
    .filter((task) => task.workStation && task.employee)
    .reduce(
      (acc, task: any) => ({
        ...acc,
        [task["workStation"]]: {
          ...(acc[task["workStation"]] || []),
          [task["employee"]]: [
            ...(acc[task["workStation"]]?.[task["employee"]] || []),
            task,
          ],
        },
      }),
      {}
    );
  expect(Object.keys(groupedByShiftAndType).length).toBe(
    Object.keys(groupedExpected).length
  );
  for (let key of Object.keys(groupedExpected)) {
    expect(Object.keys(groupedByShiftAndType[key]).length).toBe(
      Object.keys(groupedExpected[key]).length
    );
    for (let subKey of Object.keys(groupedExpected[key])) {
      groupedByShiftAndType[key][subKey].sort((a, b) =>
        b.id.localeCompare(a.id)
      );
      groupedExpected[key][subKey].sort((a, b) => b.id.localeCompare(a.id));
      expect(groupedByShiftAndType[key][subKey]).toEqual(
        groupedExpected[key][subKey]
      );
    }
  }
});

test("returns correct result with multiple keys and ignores missing values mixed with present values", () => {
  const data = new Map();
  create(data, tasks, ["type", "employee"], (item) => item);
  const groupedByShiftAndType = toObject(data, 2);
  const groupedExpected = tasks
    .filter((task) => task.employee)
    .reduce(
      (acc, task: any) => ({
        ...acc,
        [task["type"]]: {
          ...(acc[task["type"]] || []),
          [task["employee"]]: [
            ...(acc[task["type"]]?.[task["employee"]] || []),
            task,
          ],
        },
      }),
      {}
    );
  expect(Object.keys(groupedByShiftAndType).length).toBe(
    Object.keys(groupedExpected).length
  );
  for (let key of Object.keys(groupedExpected)) {
    expect(Object.keys(groupedByShiftAndType[key]).length).toBe(
      Object.keys(groupedExpected[key]).length
    );
    for (let subKey of Object.keys(groupedExpected[key])) {
      groupedByShiftAndType[key][subKey].sort((a, b) =>
        b.id.localeCompare(a.id)
      );
      groupedExpected[key][subKey].sort((a, b) => b.id.localeCompare(a.id));
      expect(groupedByShiftAndType[key][subKey]).toEqual(
        groupedExpected[key][subKey]
      );
    }
  }
});

test("returns correct result with a nested key", () => {
  const data = new Map();
  create(data, students, ["age", "address.zipCode"], (item) => item);
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    "20": {
      "zipCode A": [
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 20,
          id: "1",
          name: "John",
        },
      ],
    },
    "21": {
      "zipCode A": [
        {
          address: { street: "street B", zipCode: "zipCode A" },
          age: 21,
          id: "2",
          name: "Jane",
        },
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 21,
          id: "3",
          name: "Jack",
        },
      ],
    },
    "22": {
      "zipCode A": [
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 22,
          id: "6",
          name: "Jacky",
        },
      ],
      "zipCode B": [
        {
          address: { street: "street B", zipCode: "zipCode B" },
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
    "24": {
      "zipCode B": [
        {
          address: { street: "street A", zipCode: "zipCode B" },
          age: 24,
          id: "5",
          name: "Jacky",
        },
      ],
    },
  });
});

test("returns correct result with a nested key as first parameter", () => {
  const data = new Map();
  create(data, students, ["address.zipCode", "age"], (item) => item);
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    "zipCode A": {
      "20": [
        {
          address: {
            street: "street A",
            zipCode: "zipCode A",
          },
          age: 20,
          id: "1",
          name: "John",
        },
      ],
      "21": [
        {
          address: {
            street: "street B",
            zipCode: "zipCode A",
          },
          age: 21,
          id: "2",
          name: "Jane",
        },
        {
          address: {
            street: "street A",
            zipCode: "zipCode A",
          },
          age: 21,
          id: "3",
          name: "Jack",
        },
      ],
      "22": [
        {
          address: {
            street: "street A",
            zipCode: "zipCode A",
          },
          age: 22,
          id: "6",
          name: "Jacky",
        },
      ],
    },
    "zipCode B": {
      "22": [
        {
          address: {
            street: "street B",
            zipCode: "zipCode B",
          },
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
      "24": [
        {
          address: {
            street: "street A",
            zipCode: "zipCode B",
          },
          age: 24,
          id: "5",
          name: "Jacky",
        },
      ],
    },
  });
});

test("returns correct result with a function", () => {
  const data = new Map();
  create(
    data,
    students,
    ["age", (item) => item.address.street.endsWith("A")],
    (item) => item
  );
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    "20": {
      true: [
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 20,
          id: "1",
          name: "John",
        },
      ],
    },
    "21": {
      true: [
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 21,
          id: "3",
          name: "Jack",
        },
      ],
      false: [
        {
          address: { street: "street B", zipCode: "zipCode A" },
          age: 21,
          id: "2",
          name: "Jane",
        },
      ],
    },
    "22": {
      true: [
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 22,
          id: "6",
          name: "Jacky",
        },
      ],
      false: [
        {
          address: { street: "street B", zipCode: "zipCode B" },
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
    "24": {
      true: [
        {
          address: { street: "street A", zipCode: "zipCode B" },
          age: 24,
          id: "5",
          name: "Jacky",
        },
      ],
    },
  });
});

test("returns correct result with a function as first parameter", () => {
  const data = new Map();
  create(
    data,
    students,
    [(item) => item.address.street.endsWith("A"), "age"],
    (item) => item
  );
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    false: {
      "21": [
        {
          address: {
            street: "street B",
            zipCode: "zipCode A",
          },
          age: 21,
          id: "2",
          name: "Jane",
        },
      ],
      "22": [
        {
          address: {
            street: "street B",
            zipCode: "zipCode B",
          },
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
    true: {
      "20": [
        {
          address: {
            street: "street A",
            zipCode: "zipCode A",
          },
          age: 20,
          id: "1",
          name: "John",
        },
      ],
      "21": [
        {
          address: {
            street: "street A",
            zipCode: "zipCode A",
          },
          age: 21,
          id: "3",
          name: "Jack",
        },
      ],
      "22": [
        {
          address: {
            street: "street A",
            zipCode: "zipCode A",
          },
          age: 22,
          id: "6",
          name: "Jacky",
        },
      ],
      "24": [
        {
          address: {
            street: "street A",
            zipCode: "zipCode B",
          },
          age: 24,
          id: "5",
          name: "Jacky",
        },
      ],
    },
  });
});

test("returns correct result with transformation and a function as first parameter", () => {
  const data = new Map();
  create(
    data,
    students,
    [(item) => item.address.street.endsWith("A"), "age"],
    (item) => ({ ...item, address: item.address.street })
  );
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    false: {
      "21": [
        {
          address: "street B",
          age: 21,
          id: "2",
          name: "Jane",
        },
      ],
      "22": [
        {
          address: "street B",
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
    true: {
      "20": [
        {
          address: "street A",
          age: 20,
          id: "1",
          name: "John",
        },
      ],
      "21": [
        {
          address: "street A",
          age: 21,
          id: "3",
          name: "Jack",
        },
      ],
      "22": [
        {
          address: "street A",
          age: 22,
          id: "6",
          name: "Jacky",
        },
      ],
      "24": [
        {
          address: "street A",
          age: 24,
          id: "5",
          name: "Jacky",
        },
      ],
    },
  });
});

test("ignores items with missing keys", () => {
  const data = new Map();
  create(
    data,
    studentsWithMissingKeys,
    ["age", "address.zipCode"],
    (item) => item
  );
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    "21": {
      "zipCode A": [
        {
          address: { street: "street B", zipCode: "zipCode A" },
          age: 21,
          id: "2",
          name: "Jane",
        },
        { address: { zipCode: "zipCode A" }, age: 21, id: "3", name: "Jack" },
      ],
    },
    "22": {
      "zipCode B": [
        {
          address: { street: "street B", zipCode: "zipCode B" },
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
  });
});

test("returns correct result with a function and ignores those for which function returns null or undefined", () => {
  const data = new Map();
  create(
    data,
    studentsWithMissingKeys,
    ["age", (item) => item.address?.street?.endsWith("A")],
    (item) => item
  );
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    "20": {
      true: [
        { address: { street: "street A" }, age: 20, id: "1", name: "John" },
      ],
    },
    "21": {
      false: [
        {
          address: { street: "street B", zipCode: "zipCode A" },
          age: 21,
          id: "2",
          name: "Jane",
        },
      ],
    },
    "22": {
      false: [
        {
          address: { street: "street B", zipCode: "zipCode B" },
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
  });
});

test("cannot pollute prototype with __proto__ property", () => {
  const toString = Object.prototype.toString;
  const attack1 = create(
    new Map(),
    studentsWithMissingKeys,
    ["__proto__", "name", "age"],
    (item) => item
  );
  const attack2 = create(
    new Map(),
    studentsWithMissingKeys,
    ["name", "__proto__", "age"],
    (item) => item
  );
  const attack3 = create(
    new Map(),
    studentsWithMissingKeys,
    ["name", "age", "__proto__"],
    (item) => item
  );
  const attack4 = create(
    new Map(),
    studentsWithMissingKeys,
    ["__proto__.toString", "age"],
    (item) => item
  );
  const attack5 = create(
    new Map(),
    studentsWithMissingKeys,
    ["__proto__"],
    (item) => item
  );
  const attack6 = create(
    new Map(),
    studentsWithMissingKeys,
    ["__proto__.toString"],
    (item) => item
  );
  const a: any = {};
  expect(a.name).toBe(undefined);
  expect(a.toString).toBe(toString);
  expect(a.John).toBe(undefined);
  expect(a.age).toBe(undefined);
  expect(a["20"]).toBe(undefined);
});

test("cannot pollute prototype with __proto__ values", () => {
  const toString = Object.prototype.toString;
  const students = [
    {
      id: "1",
      name: "John",
      age: "__proto__",
      address: { street: "street A" },
    },
    {
      id: "2",
      name: "__proto__",
      age: 21,
      address: { street: "street B", zipCode: "zipCode A" },
    },
    {
      id: "3",
      name: "John",
      age: 21,
      address: { street: "__proto__", zipCode: "zipCode A" },
    },
  ];
  const attack1 = create(new Map(), students, ["age", "name"], (item) => item);
  const attack2 = create(new Map(), students, ["age.name"], (item) => item);
  const attack3 = create(
    new Map(),
    students,
    ["age.__proto__"],
    (item) => item
  );
  const attack4 = create(
    new Map(),
    students,
    ["age.name", "address.street"],
    (item) => item
  );
  const attack5 = create(
    new Map(),
    students,
    ["age.__proto__", "address.street"],
    (item) => item
  );
  const attack6 = create(
    new Map(),
    students,
    ["address.street", "name"],
    (item) => item
  );
  const attack7 = create(
    new Map(),
    students,
    ["__proto__", "name", "age"],
    (item) => item
  );
  const attack8 = create(
    new Map(),
    students,
    ["name", "__proto__", "age"],
    (item) => item
  );
  const a: any = {};
  expect(a.name).toBe(undefined);
  expect(a.toString).toBe(toString);
  expect(a.John).toBe(undefined);
  expect(a.age).toBe(undefined);
  expect(a.street).toBe(undefined);
  expect(a.address).toBe(undefined);
  expect(a["street A"]).toBe(undefined);
  expect(a["street B"]).toBe(undefined);
  expect(a["20"]).toBe(undefined);
  expect(a["21"]).toBe(undefined);
});
