import Cruncher from "../src";
import { students1, students2, students3, students4 } from "./nested.fixtures";
import { TestUtils } from "./testutils";

test("returns correct view with nested properties", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndStreet = cruncher
    .view("students")
    .by("age", "address.street")
    .get();

  expect(studentsByAgeAndStreet(20, "Street A")).toEqual([
    {
      id: "1",
      name: "John",
      age: 20,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(21, "Street A")).toEqual([]);
  expect(studentsByAgeAndStreet(21, "Street B")).toEqual([
    {
      id: "2",
      name: "Jane",
      age: 21,
      address: { street: "Street B", zipCode: "zip code A" },
    },
    {
      id: "3",
      name: "Jack",
      age: 21,
      address: { street: "Street B", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(22, "Street A")).toEqual([
    {
      id: "6",
      name: "Jacky",
      age: 22,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(22, "Street B")).toEqual([
    {
      id: "4",
      name: "Jacky",
      age: 22,
      address: { street: "Street B", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(24, "Street A")).toEqual([
    {
      id: "5",
      name: "Jacky",
      age: 24,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
});

test("returns correct view with nested properties after update", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndStreet = cruncher
    .view("students")
    .by("age", "address.street")
    .get();
  cruncher.update([{ collection: "students", data: students2 }]);
  expect(studentsByAgeAndStreet(20, "Street A")).toEqual([
    {
      id: "1",
      name: "John",
      age: 20,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(21, "Street A")).toEqual([]);
  expect(studentsByAgeAndStreet(21, "Street B")).toEqual([
    {
      id: "2",
      name: "Jane",
      age: 21,
      address: { street: "Street B", zipCode: "zip code A" },
    },
    {
      id: "3",
      name: "Jack",
      age: 21,
      address: { street: "Street B", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(22, "Street A")).toEqual([
    {
      id: "6",
      name: "Jacky",
      age: 22,
      address: { street: "Street A", zipCode: "zip code A" },
    },
    {
      id: "4",
      name: "Jacky",
      age: 22,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(22, "Street B")).toEqual([]);
  expect(studentsByAgeAndStreet(24, "Street A")).toEqual([
    {
      id: "5",
      name: "Jacky",
      age: 24,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
});

test("returns correct view with deeply nested properties", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndStreet = cruncher
    .view("students")
    .by("age", "address.foo.bar.street")
    .transform((student) => ({ ...student, address: student.address.foo.bar }))
    .get();
  cruncher.update([{ collection: "students", data: students4 }]);
  expect(studentsByAgeAndStreet(20, "Street A")).toEqual([
    {
      id: "1",
      name: "John",
      age: 20,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(21, "Street A")).toEqual([]);
  expect(studentsByAgeAndStreet(21, "Street B")).toEqual([
    {
      id: "2",
      name: "Jane",
      age: 21,
      address: { street: "Street B", zipCode: "zip code A" },
    },
    {
      id: "3",
      name: "Jack",
      age: 21,
      address: { street: "Street B", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(22, "Street A")).toEqual([
    {
      id: "4",
      name: "Jacky",
      age: 22,
      address: { street: "Street A", zipCode: "zip code A" },
    },
    {
      id: "6",
      name: "Jacky",
      age: 22,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(22, "Street B")).toEqual([]);
  expect(studentsByAgeAndStreet(24, "Street A")).toEqual([
    {
      id: "5",
      name: "Jacky",
      age: 24,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
});

test("ignores objects with missing properties with nested properties", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("students", "id", students1);
  const studentsByAgeAndStreet = cruncher
    .view("students")
    .by("age", "address.street")
    .get();
  cruncher.update([{ collection: "students", data: students3 }]);
  expect(studentsByAgeAndStreet(20, "Street A")).toEqual([
    {
      id: "1",
      name: "John",
      age: 20,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(21, "Street A")).toEqual([]);
  expect(studentsByAgeAndStreet(21, "Street B")).toEqual([
    {
      id: "2",
      name: "Jane",
      age: 21,
      address: { street: "Street B", zipCode: "zip code A" },
    },
    {
      id: "3",
      name: "Jack",
      age: 21,
      address: { street: "Street B", zipCode: "zip code A" },
    },
  ]);
  expect(studentsByAgeAndStreet(22, "Street A")).toEqual([]);
  expect(studentsByAgeAndStreet(22, "Street B")).toEqual([]);
  expect(studentsByAgeAndStreet(24, "Street A")).toEqual([
    {
      id: "5",
      name: "Jacky",
      age: 24,
      address: { street: "Street A", zipCode: "zip code A" },
    },
  ]);
  expect(TestUtils.getInternalSize(cruncher, "students")).toBe(6);
});
