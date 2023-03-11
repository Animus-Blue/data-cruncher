import Cruncher from "../src";
import { students, students2, students3, students4 } from "./types.fixtures";

test("by only allows for functions and strings", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students);
  cruncher.addCollection("students2", "id", students2);
  const studentsBy1337AndTrue = cruncher
    .view("students")
    .by("1337", (student) => (student.age > 21 ? "senior" : "junior"))
    .get();
  expect(() =>
    cruncher
      .view("students2")
      .by(1337 as any, true)
      .get()
  ).toThrow("A view property must be a string or a function.");
});

test("takes types of values into account", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students3);
  const studentsByHappinessAndAge = cruncher
    .view("students")
    .by("isHappy", "age")
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
    .by("isHappy", "age")
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
    .by(
      ({ isHappy }) => (typeof isHappy === "string" ? "3" : 3),
      ({ age }) => (typeof age === "string" ? "20" : 20)
    )
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
