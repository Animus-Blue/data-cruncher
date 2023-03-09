import Cruncher from "../src";
import { Value } from "../src/cruncher";
import { students, students2, students3, students4 } from "./types.testdata";

test("allows for keys of type string, number, boolean and treats them equal to strings", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students);
  cruncher.addCollection("students2", "id", students2);
  const studentsBy1337AndTrue = cruncher
    .view("students")
    .keys("1337", "true")
    .get();
  const studentsBy1337AndTrue2 = cruncher
    .view("students2")
    .keys(1337 as any, true)
    .get();

  expect(studentsBy1337AndTrue(31, "yes")).toEqual([
    {
      id: "3",
      name: "Jack",
      age: 21,
      1337: 31,
      true: "yes",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue2(31, "yes")).toEqual([
    {
      id: "3",
      name: "Jack",
      age: 21,
      1337: 31,
      true: "yes",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue(31, "no")).toEqual([
    {
      id: "4",
      name: "Jacky",
      age: 22,
      1337: 31,
      true: "no",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue2(31, "no")).toEqual([
    {
      id: "4",
      name: "Jacky",
      age: 22,
      1337: 31,
      true: "no",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue(32, "yes")).toEqual([
    {
      id: "1",
      name: "John",
      age: 20,
      1337: 32,
      true: "yes",
      otherProp: "other",
    },
    {
      id: "2",
      name: "Jane",
      age: 21,
      1337: 32,
      true: "yes",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue2(32, "yes")).toEqual([
    {
      id: "1",
      name: "John",
      age: 20,
      1337: 32,
      true: "yes",
      otherProp: "other",
    },
    {
      id: "2",
      name: "Jane",
      age: 21,
      1337: 32,
      true: "yes",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue(32, "no")).toEqual([
    {
      id: "5",
      name: "Jacky",
      age: 24,
      1337: 32,
      true: "no",
      otherProp: "other",
    },
    {
      id: "6",
      name: "Jacky",
      age: 22,
      1337: 32,
      true: "no",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue2(32, "no")).toEqual([
    {
      id: "5",
      name: "Jacky",
      age: 24,
      1337: 32,
      true: "no",
      otherProp: "other",
    },
    {
      id: "6",
      name: "Jacky",
      age: 22,
      1337: 32,
      true: "no",
      otherProp: "other",
    },
  ]);
});

test("allows for keys of type string, number, boolean and treats them as strings with update - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students2);
  const studentsBy1337AndTrue = cruncher
    .view("students")
    .keys(1337 as any, true)
    .get();

  const yes31 = studentsBy1337AndTrue(31, "yes");
  const no31 = studentsBy1337AndTrue(31, "no");
  const yes32 = studentsBy1337AndTrue(32, "yes");
  const no32 = studentsBy1337AndTrue(32, "no");
  const newStudents = students.map((student) =>
    student.id === "1" ? { ...student, 1337: 31 } : student
  );

  cruncher.update([{ collection: "students", data: newStudents }]);
  expect(studentsBy1337AndTrue(31, "yes")).toEqual([
    {
      id: "3",
      name: "Jack",
      age: 21,
      1337: 31,
      true: "yes",
      otherProp: "other",
    },
    {
      id: "1",
      name: "John",
      age: 20,
      1337: 31,
      true: "yes",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue(31, "yes")).not.toBe(yes31);
  expect(studentsBy1337AndTrue(31, "no")).toEqual([
    {
      id: "4",
      name: "Jacky",
      age: 22,
      1337: 31,
      true: "no",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue(31, "no")).toBe(no31);
  expect(studentsBy1337AndTrue(32, "yes")).toEqual([
    {
      id: "2",
      name: "Jane",
      age: 21,
      1337: 32,
      true: "yes",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue(32, "yes")).not.toBe(yes32);
  expect(studentsBy1337AndTrue(32, "no")).toEqual([
    {
      id: "5",
      name: "Jacky",
      age: 24,
      1337: 32,
      true: "no",
      otherProp: "other",
    },
    {
      id: "6",
      name: "Jacky",
      age: 22,
      1337: 32,
      true: "no",
      otherProp: "other",
    },
  ]);
  expect(studentsBy1337AndTrue(32, "no")).toBe(no32);
});

test("takes types of values into account", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students3);
  const studentsByHappinessAndAge = cruncher
    .view("students")
    .keys("isHappy", "age")
    .get();

  const happyStudents20 = studentsByHappinessAndAge(true, 20);
  const unhappyStudents24 = studentsByHappinessAndAge(false, 24);
  expect(happyStudents20).toEqual([
    { id: "1", name: "John", age: 20, isHappy: true },
  ]);
  expect(unhappyStudents24).toEqual([
    { id: "5", name: "Jacky", age: 24, isHappy: false },
  ]);
  expect(studentsByHappinessAndAge("true", 20)).toEqual([]);
  expect(studentsByHappinessAndAge("true", "20")).toEqual([]);
  expect(studentsByHappinessAndAge("false", 24)).toEqual([]);
  expect(studentsByHappinessAndAge("false", "24")).toEqual([]);
});

test("takes types of values into account when querying", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students4);
  const studentsByHappinessAndAge = cruncher
    .view("students")
    .keys("isHappy", "age")
    .get();

  expect(studentsByHappinessAndAge(true, 21)).toEqual([]);
  expect(studentsByHappinessAndAge(true, "21")).toEqual([
    { id: "2", name: "Jane", age: "21", isHappy: true },
  ]);
  expect(studentsByHappinessAndAge(true, 23)).toEqual([]);
  expect(studentsByHappinessAndAge("true", 23)).toEqual([
    { id: "6", name: "Jacky", age: 23, isHappy: "true" },
  ]);
});

test("group will get the properties value with original type", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students4);
  const studentsByHappinessAndAge = cruncher
    .view("students")
    .keys("isHappy", "age")
    .group("isHappy", (happy: Value) => (typeof happy === "string" ? "3" : 3))
    .group("age", (age: Value) => (typeof age === "string" ? "20" : 20))
    .get();

  expect(studentsByHappinessAndAge(3, 20)).toEqual([
    { id: "1", name: "John", age: 20, isHappy: true },
    { id: "5", name: "Jacky", age: 24, isHappy: false },
    { id: "7", name: "Jacky", age: 24, isHappy: true },
  ]);
  expect(studentsByHappinessAndAge("3", 20)).toEqual([
    { id: "6", name: "Jacky", age: 23, isHappy: "true" },
  ]);
  expect(studentsByHappinessAndAge(3, "20")).toEqual([
    { id: "2", name: "Jane", age: "21", isHappy: true },
  ]);
  expect(studentsByHappinessAndAge("3", "20")).toEqual([]);
});
