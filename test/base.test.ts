import Cruncher from "../src/index";
import {
  manyKeys,
  students1,
  students2,
  students3,
  students4,
  students5,
  studentsWithHappiness1,
  studentsWithHappiness2,
} from "./base.testdata";
import { TestUtils } from "./testutils";

test("returns correct view", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    { id: "3", name: "Jack", age: 21, otherProp: "other" },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "4", name: "Jacky", age: 22, otherProp: "other" },
    { id: "6", name: "Jacky", age: 22, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
});

test("throws an error when adding a view with the id as key", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  expect(() =>
    cruncher.view("students").keys("age", "name", "id").get()
  ).toThrow("An id cannot be a view key. Use byId instead.");
});

test("returns correct view", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    { id: "3", name: "Jack", age: 21, otherProp: "other" },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "4", name: "Jacky", age: 22, otherProp: "other" },
    { id: "6", name: "Jacky", age: 22, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
});

test("adds on update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  cruncher.update([{ collection: "students", data: students2 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    { id: "3", name: "Jack", age: 21, otherProp: "other" },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "4", name: "Jacky", age: 22, otherProp: "other" },
    { id: "6", name: "Jacky", age: 22, otherProp: "other" },
  ]);
  expect(
    studentsByAgeAndName(24, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
    { id: "7", name: "Jacky", age: 24, otherProp: "other" },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(7);
});

test("deletes on update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  cruncher.update([{ collection: "students", data: students2 }]);
  cruncher.update([{ collection: "students", data: students3 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([{ id: "6", name: "Jacky", age: 22, otherProp: "other" }]);
  expect(
    studentsByAgeAndName(24, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
    { id: "7", name: "Jacky", age: 24, otherProp: "other" },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(5);
});

test("swappes changed items on update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  cruncher.update([{ collection: "students", data: students2 }]);
  cruncher.update([{ collection: "students", data: students3 }]);
  cruncher.update([{ collection: "students", data: students5 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other2" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([]);
  expect(studentsByAgeAndName(22, "Jacky")).toEqual([]);
  expect(studentsByAgeAndName(23, "Jacky")).toEqual([
    { id: "6", name: "Jacky", age: 23, otherProp: "other" },
  ]);
  expect(
    studentsByAgeAndName(24, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
    { id: "7", name: "Jacky", age: 24, otherProp: "other" },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(5);
});

test("changes references correctly when adding on update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  const john20 = studentsByAgeAndName(20, "John");
  const jane21 = studentsByAgeAndName(21, "Jane");
  const jack21 = studentsByAgeAndName(21, "Jack");
  const jacky22 = studentsByAgeAndName(22, "Jacky");
  const jacky24 = studentsByAgeAndName(24, "Jacky");
  expect(jacky24).toHaveLength(1);
  cruncher.update([{ collection: "students", data: students2 }]);
  expect(studentsByAgeAndName(24, "Jacky")).toHaveLength(2);

  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(jack21);
  expect(studentsByAgeAndName(22, "Jacky")).toBe(jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).not.toBe(jacky24);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(7);
});

test("changes references correctly when adding and deleting on update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  const john20 = studentsByAgeAndName(20, "John");
  const jane21 = studentsByAgeAndName(21, "Jane");
  const jack21 = studentsByAgeAndName(21, "Jack");
  const jacky22 = studentsByAgeAndName(22, "Jacky");
  const jacky24 = studentsByAgeAndName(24, "Jacky");
  cruncher.update([{ collection: "students", data: students2 }]);
  cruncher.update([{ collection: "students", data: students3 }]);

  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(jane21);
  expect(studentsByAgeAndName(21, "Jack")).not.toBe(jack21);
  expect(studentsByAgeAndName(22, "Jacky")).not.toBe(jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).not.toBe(jacky24);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(5);
});

test("changed references correctly when swapping on update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  cruncher.update([{ collection: "students", data: students2 }]);
  cruncher.update([{ collection: "students", data: students3 }]);
  const john20 = studentsByAgeAndName(20, "John");
  const jane21 = studentsByAgeAndName(21, "Jane");
  const jack21 = studentsByAgeAndName(21, "Jack");
  const jacky22 = studentsByAgeAndName(22, "Jacky");
  const jacky23 = studentsByAgeAndName(23, "Jacky");
  const jacky24 = studentsByAgeAndName(24, "Jacky");
  cruncher.update([{ collection: "students", data: students5 }]);

  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).not.toBe(jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(jack21);
  expect(studentsByAgeAndName(22, "Jacky")).not.toBe(jacky22);
  expect(studentsByAgeAndName(23, "Jacky")).not.toBe(jacky23);
  expect(studentsByAgeAndName(24, "Jacky")).toBe(jacky24);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(5);
});

test("ignores null or undefined values need for view", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students4);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    { id: "3", name: "Jack", age: 21, otherProp: "other" },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "4", name: "Jacky", age: 22, otherProp: "other" },
    { id: "6", name: "Jacky", age: 22, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(22, null as any)).toEqual([]);
  expect(studentsByAgeAndName(undefined as any, "Maria")).toEqual([]);
});

test("ignores null or undefined values need for view when adding values", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  cruncher.update([{ collection: "students", data: students4 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    { id: "3", name: "Jack", age: 21, otherProp: "other" },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "4", name: "Jacky", age: 22, otherProp: "other" },
    { id: "6", name: "Jacky", age: 22, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(22, null as any)).toEqual([]);
  expect(studentsByAgeAndName(undefined as any, "Maria")).toEqual([]);
});

test("ignores null or undefined values need for view when deleting values", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  cruncher.update([{ collection: "students", data: students4 }]);
  cruncher.update([{ collection: "students", data: students1 }]);

  // cruncher does not crash

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    { id: "3", name: "Jack", age: 21, otherProp: "other" },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "4", name: "Jacky", age: 22, otherProp: "other" },
    { id: "6", name: "Jacky", age: 22, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
  ]);
});

test("ignores null or undefined values need for view when adding values", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  cruncher.update([{ collection: "students", data: students4 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    { id: "3", name: "Jack", age: 21, otherProp: "other" },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "4", name: "Jacky", age: 22, otherProp: "other" },
    { id: "6", name: "Jacky", age: 22, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(22, null as any)).toEqual([]);
  expect(studentsByAgeAndName(undefined as any, "Maria")).toEqual([]);
});

test("getById returns correct item", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsById = cruncher.byId("students").get();

  expect(studentsById("1")).toEqual({
    id: "1",
    name: "John",
    age: 20,
    otherProp: "other",
  });
  expect(studentsById("2")).toEqual({
    id: "2",
    name: "Jane",
    age: 21,
    otherProp: "other",
  });
  expect(studentsById("3")).toEqual({
    id: "3",
    name: "Jack",
    age: 21,
    otherProp: "other",
  });
  expect(studentsById("4")).toEqual({
    id: "4",
    name: "Jacky",
    age: 22,
    otherProp: "other",
  });
  expect(studentsById("5")).toEqual({
    id: "5",
    name: "Jacky",
    age: 24,
    otherProp: "other",
  });
  expect(studentsById("6")).toEqual({
    id: "6",
    name: "Jacky",
    age: 22,
    otherProp: "other",
  });
  expect(studentsById("7")).toEqual(undefined);
});

test("getById returns correct items after update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsById = cruncher.byId("students").get();
  cruncher.update([{ collection: "students", data: students5 }]);

  expect(studentsById("1")).toEqual({
    id: "1",
    name: "John",
    age: 20,
    otherProp: "other",
  });
  expect(studentsById("2")).toEqual({
    id: "2",
    name: "Jane",
    age: 21,
    otherProp: "other2",
  });
  expect(studentsById("3")).toEqual(undefined);
  expect(studentsById("4")).toEqual(undefined);
  expect(studentsById("5")).toEqual({
    id: "5",
    name: "Jacky",
    age: 24,
    otherProp: "other",
  });
  expect(studentsById("6")).toEqual({
    id: "6",
    name: "Jacky",
    age: 23,
    otherProp: "other",
  });
  expect(studentsById("7")).toEqual({
    id: "7",
    name: "Jacky",
    age: 24,
    otherProp: "other",
  });
});

test("getById returns correct items after update - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsById = cruncher.byId("students").get();

  const student1 = studentsById("1");
  const student2 = studentsById("2");
  const student3 = studentsById("3");
  const student4 = studentsById("4");
  const student5 = studentsById("5");
  const student6 = studentsById("6");
  const student7 = studentsById("7");

  cruncher.update([{ collection: "students", data: students5 }]);
  expect(studentsById("1")).toBe(student1);
  expect(studentsById("2")).not.toBe(student2);
  expect(studentsById("3")).not.toBe(student3);
  expect(studentsById("4")).not.toBe(student4);
  expect(studentsById("5")).toBe(student5);
  expect(studentsById("6")).not.toBe(student6);
  expect(studentsById("7")).not.toBe(student7);
});

test("can get view with up to ten keys", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("collection1", "id", manyKeys);
  const keysAndValues1 = [
    { key: "prop1", value: "value prop 1" },
    { key: "prop2", value: "value prop 2" },
    { key: "prop3", value: "value prop 3" },
    { key: "prop4", value: "value prop 4" },
    { key: "prop5", value: "value prop 5" },
    { key: "prop6", value: "value prop 6" },
    { key: "prop7", value: "value prop 7" },
    { key: "prop8", value: "value prop 8" },
    { key: "prop9", value: "value prop 9" },
    { key: "prop10", value: "value prop 10" },
  ];
  const keysAndValues2 = keysAndValues1.map((item, index) =>
    index === 0 ? { key: "prop1", value: "other value prop 1" } : item
  );
  for (let i = 1; i < 10; i++) {
    const keys = keysAndValues1
      .filter((_, index) => index < i)
      .map((item) => item.key);
    const values1 = keysAndValues1
      .filter((_, index) => index < i)
      .map((item) => item.value);
    const values2 = keysAndValues2
      .filter((_, index) => index < i)
      .map((item) => item.value);
    const view = cruncher
      .view("collection1")
      .keys(...keys)
      .get();
    const viewWithGroupingAndTransformation = cruncher
      .view("collection1")
      .keys(...keys)
      .transform((item) => ({ ...item, foo: "bar" }))
      .group("prop1", (prop) => prop, false)
      .get();

    expect(view(...values1)).toEqual([
      {
        id: "1",
        prop1: "value prop 1",
        prop2: "value prop 2",
        prop3: "value prop 3",
        prop4: "value prop 4",
        prop5: "value prop 5",
        prop6: "value prop 6",
        prop7: "value prop 7",
        prop8: "value prop 8",
        prop9: "value prop 9",
        prop10: "value prop 10",
      },
      {
        id: "2",
        prop1: "value prop 1",
        prop2: "value prop 2",
        prop3: "value prop 3",
        prop4: "value prop 4",
        prop5: "value prop 5",
        prop6: "value prop 6",
        prop7: "value prop 7",
        prop8: "value prop 8",
        prop9: "value prop 9",
        prop10: "value prop 10",
      },
    ]);
    expect(view(...values2)).toEqual([
      {
        id: "3",
        prop1: "other value prop 1",
        prop2: "value prop 2",
        prop3: "value prop 3",
        prop4: "value prop 4",
        prop5: "value prop 5",
        prop6: "value prop 6",
        prop7: "value prop 7",
        prop8: "value prop 8",
        prop9: "value prop 9",
        prop10: "value prop 10",
      },
    ]);
    expect(viewWithGroupingAndTransformation(...values1)).toEqual([
      {
        id: "1",
        prop1: "value prop 1",
        prop2: "value prop 2",
        prop3: "value prop 3",
        prop4: "value prop 4",
        prop5: "value prop 5",
        prop6: "value prop 6",
        prop7: "value prop 7",
        prop8: "value prop 8",
        prop9: "value prop 9",
        prop10: "value prop 10",
        foo: "bar",
      },
      {
        id: "2",
        prop1: "value prop 1",
        prop2: "value prop 2",
        prop3: "value prop 3",
        prop4: "value prop 4",
        prop5: "value prop 5",
        prop6: "value prop 6",
        prop7: "value prop 7",
        prop8: "value prop 8",
        prop9: "value prop 9",
        prop10: "value prop 10",
        foo: "bar",
      },
    ]);
    expect(viewWithGroupingAndTransformation(...values2)).toEqual([
      {
        id: "3",
        prop1: "other value prop 1",
        prop2: "value prop 2",
        prop3: "value prop 3",
        prop4: "value prop 4",
        prop5: "value prop 5",
        prop6: "value prop 6",
        prop7: "value prop 7",
        prop8: "value prop 8",
        prop9: "value prop 9",
        prop10: "value prop 10",
        foo: "bar",
      },
    ]);
  }
});

test("deletes on update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();
  cruncher.update([{ collection: "students", data: students2 }]);
  cruncher.update([{ collection: "students", data: students3 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    { id: "1", name: "John", age: 20, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    { id: "2", name: "Jane", age: 21, otherProp: "other" },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([{ id: "6", name: "Jacky", age: 22, otherProp: "other" }]);
  expect(
    studentsByAgeAndName(24, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "5", name: "Jacky", age: 24, otherProp: "other" },
    { id: "7", name: "Jacky", age: 24, otherProp: "other" },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(5);
});

test("can do views on booleans", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", studentsWithHappiness1);
  const studentsByHappiness = cruncher.view("students").keys("isHappy").get();

  const happyStudents = studentsByHappiness(true);
  const unhappyStudents = studentsByHappiness(false);
  expect(happyStudents).toEqual([
    { id: "1", name: "John", age: 20, isHappy: true },
    { id: "2", name: "Jane", age: 21, isHappy: true },
    { id: "6", name: "Jacky", age: 23, isHappy: true },
    { id: "7", name: "Jacky", age: 24, isHappy: true },
  ]);
  expect(unhappyStudents).toEqual([
    { id: "5", name: "Jacky", age: 24, isHappy: false },
  ]);
  cruncher.update([{ collection: "students", data: studentsWithHappiness2 }]);
  expect(studentsByHappiness(true)).toEqual([
    { id: "1", name: "John", age: 20, isHappy: true },
    { id: "2", name: "Jane", age: 21, isHappy: true },
    { id: "6", name: "Jacky", age: 23, isHappy: true },
    { id: "7", name: "Jacky", age: 24, isHappy: true },
  ]);
  expect(studentsByHappiness(false)).toEqual([
    { id: "5", name: "Jacky", age: 24, isHappy: false },
    { id: "8", name: "Kelly", age: 21, isHappy: false },
  ]);
  expect(studentsByHappiness(true)).toBe(happyStudents);
  expect(studentsByHappiness(false)).not.toBe(unhappyStudents);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
});

test("returns identical view if it has been created before with collection and keys", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("students2", "id", students1);
  const studentsByHappinessAndAge = cruncher
    .view("students")
    .keys("isHappy", "age")
    .get();
  const studentsByHappinessAndAgeV2 = cruncher
    .view("students")
    .keys("isHappy", "age")
    .get();
  const studentsByHappinessAndAgeV3 = cruncher
    .view("students")
    .keys("isHappy")
    .get();
  const studentsByHappinessAndAgeV4 = cruncher
    .view("students2")
    .keys("isHappy", "age")
    .get();

  expect(studentsByHappinessAndAge).toBe(studentsByHappinessAndAgeV2);
  expect(studentsByHappinessAndAge).not.toBe(studentsByHappinessAndAgeV3);
  expect(studentsByHappinessAndAge).not.toBe(studentsByHappinessAndAgeV4);
});
