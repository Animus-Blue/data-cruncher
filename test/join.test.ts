import Cruncher from "../src/cruncher";
import equal from "../src/transformations/equal";
import {
  students1,
  students2,
  schools1,
  schools2,
  schools3,
  schools4,
  students3,
  students4,
  students5,
  students6,
  teachers1,
  teachers2,
  teachers3,
} from "./join.testdata";
import { TestUtils } from "./testutils";

test("returns correct views", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: "school1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: "school1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: "school1",
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: "school2",
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: "school3",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: "school2",
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("getter throws exception when collection of join is not present", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);

  expect(() =>
    cruncher
      .view("students")
      .keys("age", "name")
      .join("schoolz", "school")
      .get()
  ).toThrow("Collection schoolz not found");
});

test("returns correct views with joins", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: "School 2",
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: "School 3",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: "School 2",
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("cannot transform into primitive value", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => 42)
    .get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
    },
  ]);
});

test("does not crash with joins and transformation when ids change", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  cruncher.update([{ collection: "students", data: students6 }]);
  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1a",
      name: "John",
      age: 20,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2a",
      name: "Jane",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3a",
      name: "Jack",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4a",
      name: "Jacky",
      age: 22,
      school: "School 2",
      otherProp: "other",
    },
    {
      id: "student6a",
      name: "Jacky",
      age: 22,
      school: "School 3",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5a",
      name: "Jacky",
      age: 24,
      school: "School 2",
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("does not track foreign keys with null or undefined values", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students2);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: undefined,
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: null,
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("does not track foreign keys with null or undefined values -v2 with transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students2);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: undefined,
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: undefined,
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: "School 2",
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: "School 3",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: "School 2",
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("does track foreign keys even when reference objects are undefined", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools3);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: undefined,
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: undefined,
      otherProp: "other",
    },
  ]);
  expect(schoolsByKind("highschool")).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(2);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with joins after changing reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "schools", data: schools2 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.6,
      },
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.6,
      },
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("byId returns correct views with joins after changing reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsById = cruncher
    .byId("students")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "schools", data: schools2 }]);

  expect(studentsById("student1")).toEqual({
    id: "student1",
    name: "John",
    age: 20,
    school: {
      id: "school1",
      name: "School 1",
      kind: "highschool",
      rating: 4.2,
    },
    otherProp: "other",
  });
  expect(studentsById("student2")).toEqual({
    id: "student2",
    name: "Jane",
    age: 21,
    school: {
      id: "school1",
      name: "School 1",
      kind: "highschool",
      rating: 4.2,
    },
    otherProp: "other",
  });
  expect(studentsById("student3")).toEqual({
    id: "student3",
    name: "Jack",
    age: 21,
    school: {
      id: "school1",
      name: "School 1",
      kind: "highschool",
      rating: 4.2,
    },
    otherProp: "other",
  });
  expect(studentsById("student4")).toEqual({
    id: "student4",
    name: "Jacky",
    age: 22,
    school: {
      id: "school2",
      name: "School 2",
      kind: "highschool",
      rating: 3.6,
    },
    otherProp: "other",
  });
  expect(studentsById("student5")).toEqual({
    id: "student5",
    name: "Jacky",
    age: 24,
    school: {
      id: "school2",
      name: "School 2",
      kind: "highschool",
      rating: 3.6,
    },
    otherProp: "other",
  });
  expect(studentsById("student6")).toEqual({
    id: "student6",
    name: "Jacky",
    age: 22,
    school: {
      id: "school3",
      name: "School 3",
      kind: "middleschool",
      rating: 4.0,
    },
    otherProp: "other",
  });
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("byId returns correct views with joins after changing reference - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsById = cruncher
    .byId("students")
    .join("schools", "school")
    .get();
  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  const student1 = studentsById("student1");
  const student2 = studentsById("student2");
  const student3 = studentsById("student3");
  const student4 = studentsById("student4");
  const student5 = studentsById("student5");
  const student6 = studentsById("student6");
  cruncher.update([{ collection: "schools", data: schools2 }]);

  expect(studentsById("student1")).toBe(student1);
  expect(studentsById("student2")).toBe(student2);
  expect(studentsById("student3")).toBe(student3);
  expect(studentsById("student4")).not.toBe(student4);
  expect(studentsById("student5")).not.toBe(student5);
  expect(studentsById("student6")).toBe(student6);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with joins after adding item", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([
    {
      collection: "students",
      data: [
        ...students1,
        {
          id: "student42",
          name: "Mario",
          age: 35,
          school: "school1",
          otherProp: "other",
        },
      ],
    },
  ]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(35, "Mario")).toEqual([
    {
      id: "student42",
      name: "Mario",
      age: 35,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(7);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: {
            student1: true,
            student2: true,
            student3: true,
            student42: true,
          },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with joins after deleting reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "schools", data: schools3 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: undefined,
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: undefined,
      otherProp: "other",
    },
  ]);
  expect(schoolsByKind("highschool")).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(2);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with joins after deleting reference - references check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  const john20 = studentsByAgeAndName(20, "John");
  const Jane21 = studentsByAgeAndName(21, "Jane");
  const Jack21 = studentsByAgeAndName(21, "Jack");
  const Jacky22 = studentsByAgeAndName(22, "Jacky");
  const Jacky24 = studentsByAgeAndName(24, "Jacky");
  const highschools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "schools", data: schools3 }]);

  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(Jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(Jack21);
  expect(studentsByAgeAndName(22, "Jacky")).not.toBe(Jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).not.toBe(Jacky24);
  expect(schoolsByKind("highschool")).not.toBe(highschools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
});

test("returns correct views with joins after deleting reference - references check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  const john20 = studentsByAgeAndName(20, "John");
  const Jane21 = studentsByAgeAndName(21, "Jane");
  const Jack21 = studentsByAgeAndName(21, "Jack");
  const Jacky22 = studentsByAgeAndName(22, "Jacky");
  const Jacky24 = studentsByAgeAndName(24, "Jacky");
  const highschools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "schools", data: schools3 }]);

  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(Jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(Jack21);
  expect(studentsByAgeAndName(22, "Jacky")).not.toBe(Jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).not.toBe(Jacky24);
  expect(schoolsByKind("highschool")).not.toBe(highschools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
});

test("returns correct views with joins after deleting and adding reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  cruncher.update([{ collection: "schools", data: schools3 }]);
  cruncher.update([{ collection: "schools", data: schools2 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.6,
      },
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.6,
      },
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with joins and transformation after deleting and adding reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  cruncher.update([{ collection: "schools", data: schools3 }]);
  cruncher.update([{ collection: "schools", data: schools2 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: "School 2",
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: "School 3",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: "School 2",
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("byId returns correct views with joins and transformation after deleting and adding reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsById = cruncher
    .byId("students")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  cruncher.update([{ collection: "schools", data: schools3 }]);
  cruncher.update([{ collection: "schools", data: schools2 }]);

  expect(studentsById("student1")).toEqual({
    id: "student1",
    name: "John",
    age: 20,
    school: "School 1",
    otherProp: "other",
  });
  expect(studentsById("student2")).toEqual({
    id: "student2",
    name: "Jane",
    age: 21,
    school: "School 1",
    otherProp: "other",
  });
  expect(studentsById("student3")).toEqual({
    id: "student3",
    name: "Jack",
    age: 21,
    school: "School 1",
    otherProp: "other",
  });
  expect(studentsById("student4")).toEqual({
    id: "student4",
    name: "Jacky",
    age: 22,
    school: "School 2",
    otherProp: "other",
  });
  expect(studentsById("student5")).toEqual({
    id: "student5",
    name: "Jacky",
    age: 24,
    school: "School 2",
    otherProp: "other",
  });
  expect(studentsById("student6")).toEqual({
    id: "student6",
    name: "Jacky",
    age: 22,
    school: "School 3",
    otherProp: "other",
  });
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("byId returns correct views with joins and transformation after deleting and adding reference - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsById = cruncher
    .byId("students")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();

  const student1 = studentsById("student1");
  const student2 = studentsById("student2");
  const student3 = studentsById("student3");
  const student4 = studentsById("student4");
  const student5 = studentsById("student5");
  const student6 = studentsById("student6");
  cruncher.update([{ collection: "schools", data: schools3 }]);
  cruncher.update([{ collection: "schools", data: schools2 }]);

  expect(studentsById("student1")).toBe(student1);
  expect(studentsById("student2")).toBe(student2);
  expect(studentsById("student3")).toBe(student3);
  expect(studentsById("student4")).not.toBe(student4);
  expect(studentsById("student5")).not.toBe(student5);
  expect(studentsById("student6")).toBe(student6);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("byId keeps reference equality when changes are not noticeable due to transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("schools", "id", schools1);
  const schoolsByIdWithTransformation = cruncher
    .byId("schools")
    .transform((school) => ({
      school: school.name,
    }))
    .get();
  const schoolsById = cruncher.byId("schools").get();
  const school1 = schoolsById("school1");
  const school2 = schoolsById("school2");
  const school3 = schoolsById("school3");
  const school1WithTransformation = schoolsByIdWithTransformation("school1");
  const school2WithTransformation = schoolsByIdWithTransformation("school2");
  const school3WithTransformation = schoolsByIdWithTransformation("school3");
  cruncher.update([{ collection: "schools", data: schools2 }]);
  expect(schoolsById("school1")).toBe(school1);
  expect(schoolsById("school2")).not.toBe(school2);
  expect(schoolsById("school3")).toBe(school3);
  expect(schoolsByIdWithTransformation("school1")).toBe(
    school1WithTransformation
  );
  expect(schoolsByIdWithTransformation("school2")).toBe(
    school2WithTransformation
  );
  expect(schoolsByIdWithTransformation("school3")).toBe(
    school3WithTransformation
  );
});

test("returns correct views with joins after adding reference - references check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "schools", data: schools3 }]);
  const john20 = studentsByAgeAndName(20, "John");
  const Jane21 = studentsByAgeAndName(21, "Jane");
  const Jack21 = studentsByAgeAndName(21, "Jack");
  const Jacky22 = studentsByAgeAndName(22, "Jacky");
  const Jacky24 = studentsByAgeAndName(24, "Jacky");
  const highschools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "schools", data: schools2 }]);

  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(Jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(Jack21);
  expect(studentsByAgeAndName(22, "Jacky")).not.toBe(Jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).not.toBe(Jacky24);
  expect(schoolsByKind("highschool")).not.toBe(highschools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
});

test("returns correct views with joins and transformation after adding reference - references check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "schools", data: schools3 }]);
  const john20 = studentsByAgeAndName(20, "John");
  const Jane21 = studentsByAgeAndName(21, "Jane");
  const Jack21 = studentsByAgeAndName(21, "Jack");
  const Jacky22 = studentsByAgeAndName(22, "Jacky");
  const Jacky24 = studentsByAgeAndName(24, "Jacky");
  const highschools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "schools", data: schools2 }]);

  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(Jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(Jack21);
  expect(studentsByAgeAndName(22, "Jacky")).not.toBe(Jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).not.toBe(Jacky24);
  expect(schoolsByKind("highschool")).not.toBe(highschools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
});

test("returns correct views with joins after changing reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "students", data: students3 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student1: true, student6: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with joins and transformation after changing reference thats a noop due to transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "schools", data: schools2 }]);
  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: "School 2",
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: "School 3",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: "School 2",
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation after changing reference thats a noop due to transformation - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  const john20 = studentsByAgeAndName(20, "John");
  const jane21 = studentsByAgeAndName(21, "Jane");
  const jack20 = studentsByAgeAndName(21, "Jack");
  const jacky22 = studentsByAgeAndName(22, "Jacky");
  const jacky24 = studentsByAgeAndName(24, "Jacky");
  const highSchools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "schools", data: schools2 }]);
  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(jack20);
  expect(studentsByAgeAndName(22, "Jacky")).toBe(jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).toBe(jacky24);
  expect(schoolsByKind("highschool")).not.toBe(highSchools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);

  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation after changes that are noops due to transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      id: student.id,
      name: student.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "students", data: students4 }]);
  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
    },
    {
      id: "student6",
      name: "Jacky",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation after changes that are noops due to transformation - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      id: student.id,
      name: student.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  const john20 = studentsByAgeAndName(20, "John");
  const jane21 = studentsByAgeAndName(21, "Jane");
  const jack21 = studentsByAgeAndName(21, "Jack");
  const jacky22 = studentsByAgeAndName(22, "Jacky");
  const jacky24 = studentsByAgeAndName(24, "Jacky");
  const highSchools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "students", data: students4 }]);
  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(jack21);
  expect(studentsByAgeAndName(22, "Jacky")).toBe(jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).toBe(jacky24);
  expect(schoolsByKind("highschool")).toBe(highSchools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation and adding data later after changes to relevant path that are noops due to transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id");
  cruncher.addCollection("schools", "id");
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      id: student.id,
      name: student.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([
    { collection: "students", data: students1 },
    { collection: "schools", data: schools1 },
  ]);
  cruncher.update([{ collection: "students", data: students5 }]);
  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([]);
  expect(studentsByAgeAndName(42, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
    },
    {
      id: "student6",
      name: "Jacky",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation and adding data later after changes to relevant path that are noops due to transformation - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id");
  cruncher.addCollection("schools", "id");
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      id: student.id,
      name: student.name,
    }))
    .get();
  cruncher.update([
    { collection: "students", data: students1 },
    { collection: "schools", data: schools1 },
  ]);
  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  const john20 = studentsByAgeAndName(20, "John");
  const jane21 = studentsByAgeAndName(21, "Jane");
  const jane42 = studentsByAgeAndName(42, "Jane");
  const jack21 = studentsByAgeAndName(21, "Jack");
  const jacky22 = studentsByAgeAndName(22, "Jacky");
  const jacky24 = studentsByAgeAndName(24, "Jacky");
  const highSchools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "students", data: students5 }]);
  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).not.toBe(jane21);
  expect(studentsByAgeAndName(42, "Jane")).not.toBe(jane42);
  expect(studentsByAgeAndName(21, "Jack")).toBe(jack21);
  expect(studentsByAgeAndName(22, "Jacky")).toBe(jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).toBe(jacky24);
  expect(schoolsByKind("highschool")).toBe(highSchools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation and adding data later after changing reference thats not a noop due to transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id");
  cruncher.addCollection("schools", "id");
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([
    { collection: "schools", data: schools1 },
    { collection: "students", data: students1 },
  ]);
  cruncher.update([{ collection: "schools", data: schools4 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: "School 2 Ultra",
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: "School 3",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: "School 2 Ultra",
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2 Ultra", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation after changes to relevant path that are noops due to transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      id: student.id,
      name: student.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "students", data: students5 }]);
  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([]);
  expect(studentsByAgeAndName(42, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
    },
    {
      id: "student6",
      name: "Jacky",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("transformations will keep the id of the object even if not specified in the transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      name: student.name,
    }))
    .get();

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
    },
  ]);
});

test("returns correct views with joins and transformation after changes to relevant path that are noops due to transformation - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      id: student.id,
      name: student.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  const john20 = studentsByAgeAndName(20, "John");
  const jane21 = studentsByAgeAndName(21, "Jane");
  const jane42 = studentsByAgeAndName(42, "Jane");
  const jack21 = studentsByAgeAndName(21, "Jack");
  const jacky22 = studentsByAgeAndName(22, "Jacky");
  const jacky24 = studentsByAgeAndName(24, "Jacky");
  const highSchools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "students", data: students5 }]);
  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).not.toBe(jane21);
  expect(studentsByAgeAndName(42, "Jane")).not.toBe(jane42);
  expect(studentsByAgeAndName(21, "Jack")).toBe(jack21);
  expect(studentsByAgeAndName(22, "Jacky")).toBe(jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).toBe(jacky24);
  expect(schoolsByKind("highschool")).toBe(highSchools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation after changing reference thats not a noop due to transformation", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "schools", data: schools4 }]);
  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: "School 2 Ultra",
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: "School 3",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: "School 2 Ultra",
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2 Ultra", kind: "highschool", rating: 3.6 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins and transformation after changing reference thats not a noop due to transformation - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  const john20 = studentsByAgeAndName(20, "John");
  const jane21 = studentsByAgeAndName(21, "Jane");
  const jack20 = studentsByAgeAndName(21, "Jack");
  const jacky22 = studentsByAgeAndName(22, "Jacky");
  const jacky24 = studentsByAgeAndName(24, "Jacky");
  const highSchools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "schools", data: schools4 }]);
  expect(studentsByAgeAndName(20, "John")).toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(jack20);
  expect(studentsByAgeAndName(22, "Jacky")).not.toBe(jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).not.toBe(jacky24);
  expect(schoolsByKind("highschool")).not.toBe(highSchools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);

  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
});

test("returns correct views with joins after changing reference - references check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  const john20 = studentsByAgeAndName(20, "John");
  const Jane21 = studentsByAgeAndName(21, "Jane");
  const Jack21 = studentsByAgeAndName(21, "Jack");
  const Jacky22 = studentsByAgeAndName(22, "Jacky");
  const Jacky24 = studentsByAgeAndName(24, "Jacky");
  const highschools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "students", data: students3 }]);

  expect(studentsByAgeAndName(20, "John")).not.toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(Jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(Jack21);
  expect(studentsByAgeAndName(22, "Jacky")).toBe(Jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).toBe(Jacky24);
  expect(schoolsByKind("highschool")).toBe(highschools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
});

test("returns correct views with joins after changing reference back and forth", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "students", data: students3 }]);
  cruncher.update([{ collection: "students", data: students1 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with joins after changing reference back and forth - references check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "students", data: students3 }]);
  const john20 = studentsByAgeAndName(20, "John");
  const Jane21 = studentsByAgeAndName(21, "Jane");
  const Jack21 = studentsByAgeAndName(21, "Jack");
  const Jacky22 = studentsByAgeAndName(22, "Jacky");
  const Jacky24 = studentsByAgeAndName(24, "Jacky");
  const highschools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "students", data: students1 }]);

  expect(studentsByAgeAndName(20, "John")).not.toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(Jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(Jack21);
  expect(studentsByAgeAndName(22, "Jacky")).toBe(Jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).toBe(Jacky24);
  expect(schoolsByKind("highschool")).toBe(highschools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
});

test("returns correct views with joins and transformation after changing reference back and forth", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "students", data: students3 }]);
  cruncher.update([{ collection: "students", data: students1 }]);

  expect(studentsByAgeAndName(20, "John")).toEqual([
    {
      id: "student1",
      name: "John",
      age: 20,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jane")).toEqual([
    {
      id: "student2",
      name: "Jane",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(21, "Jack")).toEqual([
    {
      id: "student3",
      name: "Jack",
      age: 21,
      school: "School 1",
      otherProp: "other",
    },
  ]);
  expect(
    studentsByAgeAndName(22, "Jacky").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    {
      id: "student4",
      name: "Jacky",
      age: 22,
      school: "School 2",
      otherProp: "other",
    },
    {
      id: "student6",
      name: "Jacky",
      age: 22,
      school: "School 3",
      otherProp: "other",
    },
  ]);
  expect(studentsByAgeAndName(24, "Jacky")).toEqual([
    {
      id: "student5",
      name: "Jacky",
      age: 24,
      school: "School 2",
      otherProp: "other",
    },
  ]);
  expect(
    schoolsByKind("highschool").sort((a, b) => (b.id > a.id ? -1 : 1))
  ).toEqual([
    { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  ]);
  expect(schoolsByKind("middleschool")).toEqual([
    { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      students: {
        school: {
          school1: { student1: true, student2: true, student3: true },
          school2: { student4: true, student5: true },
          school3: { student6: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with joins and transformation after changing reference back and forth - references check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  const studentsByAgeAndName = cruncher
    .view("students")
    .keys("age", "name")
    .join("schools", "school")
    .transform((student) => ({
      ...student,
      school: student.school?.name,
    }))
    .get();

  const schoolsByKind = cruncher.view("schools").keys("kind").get();
  cruncher.update([{ collection: "students", data: students3 }]);
  const john20 = studentsByAgeAndName(20, "John");
  const Jane21 = studentsByAgeAndName(21, "Jane");
  const Jack21 = studentsByAgeAndName(21, "Jack");
  const Jacky22 = studentsByAgeAndName(22, "Jacky");
  const Jacky24 = studentsByAgeAndName(24, "Jacky");
  const highschools = schoolsByKind("highschool");
  const middleSchools = schoolsByKind("middleschool");
  cruncher.update([{ collection: "students", data: students1 }]);

  expect(studentsByAgeAndName(20, "John")).not.toBe(john20);
  expect(studentsByAgeAndName(21, "Jane")).toBe(Jane21);
  expect(studentsByAgeAndName(21, "Jack")).toBe(Jack21);
  expect(studentsByAgeAndName(22, "Jacky")).toBe(Jacky22);
  expect(studentsByAgeAndName(24, "Jacky")).toBe(Jacky24);
  expect(schoolsByKind("highschool")).toBe(highschools);
  expect(schoolsByKind("middleschool")).toBe(middleSchools);
});

test("returns correct views with array joins", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers1);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .keys("name")
    .join("schools", "schools")
    .get();

  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
    },
  ]);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(3);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true, teacher2: true },
          school2: { teacher1: true },
          school3: { teacher3: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with array joins after adding new objects", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers1);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .keys("name")
    .join("schools", "schools")
    .get();

  cruncher.update([{ collection: "teachers", data: teachers2 }]);

  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
    },
  ]);
  expect(teachersByName("Teacher 4")).toEqual([
    {
      id: "teacher4",
      name: "Teacher 4",
      schools: [
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
    },
  ]);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(4);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true, teacher2: true },
          school2: { teacher1: true, teacher4: true },
          school3: { teacher3: true, teacher4: true },
        },
      },
    })
  ).toBe(true);
});

test("array joins references are not effected by reference deletion", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers1);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .keys("name")
    .join("schools", "schools")
    .get();

  cruncher.update([
    { collection: "teachers", data: teachers2 },
    { collection: "schools", data: [] },
  ]);

  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [undefined, undefined],
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [undefined],
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [undefined],
    },
  ]);
  expect(teachersByName("Teacher 4")).toEqual([
    {
      id: "teacher4",
      name: "Teacher 4",
      schools: [undefined, undefined],
    },
  ]);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(4);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(0);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true, teacher2: true },
          school2: { teacher1: true, teacher4: true },
          school3: { teacher3: true, teacher4: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with array joins after deleting", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers2);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .keys("name")
    .join("schools", "schools")
    .get();

  cruncher.update([{ collection: "teachers", data: teachers1 }]);

  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
    },
  ]);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(3);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true, teacher2: true },
          school2: { teacher1: true },
          school3: { teacher3: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with array joins after editing objects", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers1);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .keys("name")
    .join("schools", "schools")
    .get();

  cruncher.update([{ collection: "teachers", data: teachers3 }]);

  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [],
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
    },
  ]);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(3);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true },
          school2: { teacher1: true, teacher3: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with array joins after editing objects - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers1);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .keys("name")
    .join("schools", "schools")
    .get();

  const teacher1 = teachersByName("Teacher 1");
  const teacher2 = teachersByName("Teacher 2");
  const teacher3 = teachersByName("Teacher 3");
  cruncher.update([{ collection: "teachers", data: teachers3 }]);

  expect(teachersByName("Teacher 1")).toBe(teacher1);
  expect(teachersByName("Teacher 2")).not.toBe(teacher2);
  expect(teachersByName("Teacher 3")).not.toBe(teacher3);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(3);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true },
          school2: { teacher1: true, teacher3: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with array joins after editing objects with adding data later", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id");
  cruncher.addCollection("schools", "id");
  const teachersByName = cruncher
    .view("teachers")
    .keys("name")
    .join("schools", "schools")
    .get();

  cruncher.update([
    { collection: "teachers", data: teachers1 },
    { collection: "schools", data: schools1 },
  ]);
  cruncher.update([{ collection: "teachers", data: teachers3 }]);

  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [],
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
    },
  ]);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(3);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true },
          school2: { teacher1: true, teacher3: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with array joins after editing objects with adding data later - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id");
  cruncher.addCollection("schools", "id");
  const teachersByName = cruncher
    .view("teachers")
    .keys("name")
    .join("schools", "schools")
    .get();

  cruncher.update([
    { collection: "teachers", data: teachers1 },
    { collection: "schools", data: schools1 },
  ]);
  const teacher1 = teachersByName("Teacher 1");
  const teacher2 = teachersByName("Teacher 2");
  const teacher3 = teachersByName("Teacher 3");
  cruncher.update([{ collection: "teachers", data: teachers3 }]);

  expect(teachersByName("Teacher 1")).toBe(teacher1);
  expect(teachersByName("Teacher 2")).not.toBe(teacher2);
  expect(teachersByName("Teacher 3")).not.toBe(teacher3);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(3);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true },
          school2: { teacher1: true, teacher3: true },
        },
      },
    })
  ).toBe(true);
});

test("returns identical view if it has been created before with joins", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  cruncher.addCollection("teachers", "id", teachers1);
  const studentsBySchoolAndAge = cruncher
    .view("students")
    .keys("school", "age")
    .get();
  const studentsBySchoolAndAge2 = cruncher
    .view("students")
    .keys("school", "age")
    .get();
  const studentsBySchoolAndAge3 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .get();
  const studentsBySchoolAndAge4 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .get();
  const studentsBySchoolAndAge5 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .join("teachers", "teacher")
    .get();
  const studentsBySchoolAndAge6 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .join("teachers", "otherteacher")
    .get();
  const studentsBySchoolAndAge7 = cruncher
    .view("students")
    .keys("school", "age")
    .join("teachers", "teacher")
    .join("schools", "school")
    .get();

  expect(studentsBySchoolAndAge).toBe(studentsBySchoolAndAge2);
  expect(studentsBySchoolAndAge).not.toBe(studentsBySchoolAndAge3);
  expect(studentsBySchoolAndAge3).toBe(studentsBySchoolAndAge4);
  expect(studentsBySchoolAndAge3).not.toBe(studentsBySchoolAndAge5);
  expect(studentsBySchoolAndAge3).not.toBe(studentsBySchoolAndAge6);
  expect(studentsBySchoolAndAge5).not.toBe(studentsBySchoolAndAge6);
  expect(studentsBySchoolAndAge5).toBe(studentsBySchoolAndAge7);
});

test("returns identical view if it has been created before with joins and groupings", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  cruncher.addCollection("teachers", "id", teachers1);
  const myGrouping = () => 42;
  const studentsBySchoolAndAge1 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .get();
  const studentsBySchoolAndAge2 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .get();
  const studentsBySchoolAndAge3 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", myGrouping)
    .get();
  const studentsBySchoolAndAge4 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", myGrouping)
    .get();
  const studentsBySchoolAndAge5 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", () => 42)
    .get();

  expect(studentsBySchoolAndAge1).toBe(studentsBySchoolAndAge2);
  expect(studentsBySchoolAndAge1).not.toBe(studentsBySchoolAndAge3);
  expect(studentsBySchoolAndAge3).toBe(studentsBySchoolAndAge4);
  expect(studentsBySchoolAndAge3).not.toBe(studentsBySchoolAndAge5);
});

test("returns identical view if it has been created before with joins and groupings and transformations", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  cruncher.addCollection("schools", "id", schools1);
  cruncher.addCollection("teachers", "id", teachers1);
  const myGrouping = () => 42;
  const myGrouping2 = () => "A";
  const myTransformation = () => {
    value: 42;
  };
  const studentsBySchoolAndAge1 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .get();
  const studentsBySchoolAndAge2 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .get();
  const studentsBySchoolAndAge3 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", myGrouping)
    .get();
  const studentsBySchoolAndAge4 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", myGrouping)
    .get();
  const studentsBySchoolAndAge5 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", () => 42)
    .get();
  const studentsBySchoolAndAge6 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", myGrouping)
    .transform(myTransformation)
    .get();
  const studentsBySchoolAndAge7 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", myGrouping)
    .transform(myTransformation)
    .get();
  const studentsBySchoolAndAge8 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", myGrouping)
    .transform(() => {
      value: 42;
    })
    .get();
  const studentsBySchoolAndAge9 = cruncher
    .view("students")
    .keys("school", "age")
    .group("schools", myGrouping)
    .group("name", myGrouping2)
    .transform(myTransformation)
    .get();
  const studentsBySchoolAndAge10 = cruncher
    .view("students")
    .keys("school", "age")
    .transform(myTransformation)
    .group("name", myGrouping2)
    .group("schools", myGrouping)
    .get();
  const studentsBySchoolAndAge11 = cruncher
    .view("students")
    .keys("school", "age")
    .transform(myTransformation)
    .group("name", myGrouping2, false)
    .group("schools", myGrouping)
    .get();
  const studentsBySchoolAndAge12 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .transform(myTransformation)
    .group("name", myGrouping2, false)
    .group("schools", myGrouping)
    .get();
  const studentsBySchoolAndAge13 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .transform(myTransformation)
    .group("name", myGrouping2, false)
    .group("schools", myGrouping)
    .get();
  const studentsBySchoolAndAge14 = cruncher
    .view("students")
    .keys("school", "age")
    .join("schools", "school")
    .join("teachers", "teacher")
    .transform(myTransformation)
    .group("name", myGrouping2, false)
    .group("schools", myGrouping)
    .get();

  expect(studentsBySchoolAndAge1).toBe(studentsBySchoolAndAge2);
  expect(studentsBySchoolAndAge1).not.toBe(studentsBySchoolAndAge3);
  expect(studentsBySchoolAndAge3).toBe(studentsBySchoolAndAge4);
  expect(studentsBySchoolAndAge3).not.toBe(studentsBySchoolAndAge5);
  expect(studentsBySchoolAndAge3).not.toBe(studentsBySchoolAndAge6);
  expect(studentsBySchoolAndAge6).toBe(studentsBySchoolAndAge7);
  expect(studentsBySchoolAndAge6).not.toBe(studentsBySchoolAndAge8);
  expect(studentsBySchoolAndAge8).not.toBe(studentsBySchoolAndAge9);
  expect(studentsBySchoolAndAge9).toBe(studentsBySchoolAndAge10);
  expect(studentsBySchoolAndAge9).not.toBe(studentsBySchoolAndAge11);
  expect(studentsBySchoolAndAge12).toBe(studentsBySchoolAndAge13);
  expect(studentsBySchoolAndAge13).not.toBe(studentsBySchoolAndAge14);
});
