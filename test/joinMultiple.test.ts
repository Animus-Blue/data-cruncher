import Cruncher from "../src/cruncher";
import equal from "../src/transformations/equal";
import {
  schools1,
  schools2,
  schools3,
  teachers1,
  teachers2,
  teachers3,
} from "./joinMultiple.fixtures";
import { TestUtils } from "./testutils";

test("returns correct views with multiple joins to the same collection", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers1);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .by("name")
    .join("schools", "schools")
    .join("schools", "previousSchool")
    .get();

  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
      previousSchool: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
      previousSchool: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
      previousSchool: undefined,
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
        previousSchool: {
          school1: { teacher2: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with multiple joins to the same collection after adding item", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers1);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .by("name")
    .join("schools", "schools")
    .join("schools", "previousSchool")
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
      previousSchool: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
      previousSchool: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
      previousSchool: undefined,
    },
  ]);
  expect(teachersByName("Teacher 4")).toEqual([
    {
      id: "teacher4",
      name: "Teacher 4",
      schools: [
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
      previousSchool: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
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
          school3: { teacher3: true },
        },
        previousSchool: {
          school1: { teacher2: true, teacher4: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with multiple joins to the same collection after deleting item", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers2);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .by("name")
    .join("schools", "schools")
    .join("schools", "previousSchool")
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
      previousSchool: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
      previousSchool: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
      previousSchool: undefined,
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
        previousSchool: {
          school1: { teacher2: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with multiple joins to the same collection after editing item", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers2);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .by("name")
    .join("schools", "schools")
    .join("schools", "previousSchool")
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
      previousSchool: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
      previousSchool: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
      previousSchool: undefined,
    },
  ]);
  expect(teachersByName("Teacher 4")).toEqual([
    {
      id: "teacher4",
      name: "Teacher 4",
      schools: [
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
      previousSchool: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
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
          school3: { teacher3: true },
        },
        previousSchool: {
          school1: { teacher4: true },
          school2: { teacher2: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with multiple joins to the same collection after deleting reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers3);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .by("name")
    .join("schools", "schools")
    .join("schools", "previousSchool")
    .get();
  cruncher.update([{ collection: "schools", data: schools3 }]);
  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
        undefined,
      ],
      previousSchool: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
      previousSchool: undefined,
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
      previousSchool: undefined,
    },
  ]);
  expect(teachersByName("Teacher 4")).toEqual([
    {
      id: "teacher4",
      name: "Teacher 4",
      schools: [undefined],
      previousSchool: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
    },
  ]);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(4);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(2);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true, teacher2: true },
          school2: { teacher1: true, teacher4: true },
          school3: { teacher3: true },
        },
        previousSchool: {
          school1: { teacher4: true },
          school2: { teacher2: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with multiple joins to the same collection after adding reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers3);
  cruncher.addCollection("schools", "id", schools3);
  const teachersByName = cruncher
    .view("teachers")
    .by("name")
    .join("schools", "schools")
    .join("schools", "previousSchool")
    .get();
  cruncher.update([{ collection: "schools", data: schools1 }]);
  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
      previousSchool: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
      previousSchool: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.5,
      },
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
      previousSchool: undefined,
    },
  ]);
  expect(teachersByName("Teacher 4")).toEqual([
    {
      id: "teacher4",
      name: "Teacher 4",
      schools: [
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
      ],
      previousSchool: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
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
          school3: { teacher3: true },
        },
        previousSchool: {
          school1: { teacher4: true },
          school2: { teacher2: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with multiple joins to the same collection after changing reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers3);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .by("name")
    .join("schools", "schools")
    .join("schools", "previousSchool")
    .get();
  cruncher.update([{ collection: "schools", data: schools2 }]);
  expect(teachersByName("Teacher 1")).toEqual([
    {
      id: "teacher1",
      name: "Teacher 1",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
      ],
      previousSchool: {
        id: "school3",
        name: "School 3",
        kind: "middleschool",
        rating: 4.0,
      },
    },
  ]);
  expect(teachersByName("Teacher 2")).toEqual([
    {
      id: "teacher2",
      name: "Teacher 2",
      schools: [
        { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      ],
      previousSchool: {
        id: "school2",
        name: "School 2",
        kind: "highschool",
        rating: 3.6,
      },
    },
  ]);
  expect(teachersByName("Teacher 3")).toEqual([
    {
      id: "teacher3",
      name: "Teacher 3",
      schools: [
        { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
      ],
      previousSchool: undefined,
    },
  ]);
  expect(teachersByName("Teacher 4")).toEqual([
    {
      id: "teacher4",
      name: "Teacher 4",
      schools: [
        { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
      ],
      previousSchool: {
        id: "school1",
        name: "School 1",
        kind: "highschool",
        rating: 4.2,
      },
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
          school3: { teacher3: true },
        },
        previousSchool: {
          school1: { teacher4: true },
          school2: { teacher2: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});

test("returns correct views with multiple joins to the same collection after changing reference - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers3);
  cruncher.addCollection("schools", "id", schools1);
  const teachersByName = cruncher
    .view("teachers")
    .by("name")
    .join("schools", "schools")
    .join("schools", "previousSchool")
    .get();

  const teacher1 = teachersByName("Teacher 1");
  const teacher2 = teachersByName("Teacher 2");
  const teacher3 = teachersByName("Teacher 3");
  const teacher4 = teachersByName("Teacher 4");
  cruncher.update([{ collection: "schools", data: schools2 }]);
  expect(teachersByName("Teacher 1")).not.toBe(teacher1);
  expect(teachersByName("Teacher 2")).not.toBe(teacher2);
  expect(teachersByName("Teacher 3")).toBe(teacher3);
  expect(teachersByName("Teacher 4")).not.toBe(teacher4);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(4);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true, teacher2: true },
          school2: { teacher1: true, teacher4: true },
          school3: { teacher3: true },
        },
        previousSchool: {
          school1: { teacher4: true },
          school2: { teacher2: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});

test("byId returns correct item with multiple joins to the same collection after changing reference", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers3);
  cruncher.addCollection("schools", "id", schools1);
  const teachersById = cruncher
    .byId("teachers")
    .join("schools", "schools")
    .join("schools", "previousSchool")
    .get();
  cruncher.update([{ collection: "schools", data: schools2 }]);
  expect(teachersById("teacher1")).toEqual({
    id: "teacher1",
    name: "Teacher 1",
    schools: [
      { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
      { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
    ],
    previousSchool: {
      id: "school3",
      name: "School 3",
      kind: "middleschool",
      rating: 4.0,
    },
  });
  expect(teachersById("teacher2")).toEqual({
    id: "teacher2",
    name: "Teacher 2",
    schools: [
      { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
    ],
    previousSchool: {
      id: "school2",
      name: "School 2",
      kind: "highschool",
      rating: 3.6,
    },
  });
  expect(teachersById("teacher3")).toEqual({
    id: "teacher3",
    name: "Teacher 3",
    schools: [
      { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
    ],
    previousSchool: undefined,
  });
  expect(teachersById("teacher4")).toEqual({
    id: "teacher4",
    name: "Teacher 4",
    schools: [
      { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
    ],
    previousSchool: {
      id: "school1",
      name: "School 1",
      kind: "highschool",
      rating: 4.2,
    },
  });

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(4);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true, teacher2: true },
          school2: { teacher1: true, teacher4: true },
          school3: { teacher3: true },
        },
        previousSchool: {
          school1: { teacher4: true },
          school2: { teacher2: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});

test("view by and byId with multiple joins to the same collection do not manipulate original collections", () => {
  const cruncher = new Cruncher();
  const originalTeachers3 = JSON.parse(JSON.stringify(teachers3));
  const originalSchools1 = JSON.parse(JSON.stringify(schools1));
  const originalSchools2 = JSON.parse(JSON.stringify(schools2));
  const originalTeachers3Refs = [...teachers3];
  const originalSchools1Refs = [...schools1];
  const originalSchools2Refs = [...schools2];
  cruncher.addCollection("teachers", "id", teachers3);
  cruncher.addCollection("schools", "id", schools1);
  const teachersById = cruncher
    .byId("teachers")
    .join("schools", "schools")
    .join("schools", "previousSchool")
    .get();
  const teachersByName = cruncher
    .view("teachers")
    .by("name")
    .join("schools", "schools")
    .join("schools", "previousSchool")
    .get();
  cruncher.update([{ collection: "schools", data: schools2 }]);
  for (let i = 0; i < originalTeachers3Refs.length; i++) {
    expect(teachers3[i]).toBe(originalTeachers3Refs[i]);
  }
  for (let i = 0; i < originalSchools1Refs.length; i++) {
    expect(schools1[i]).toBe(originalSchools1Refs[i]);
  }
  for (let i = 0; i < originalSchools2Refs.length; i++) {
    expect(schools2[i]).toBe(originalSchools2Refs[i]);
  }
  expect(equal(originalSchools1, schools1)).toBe(true);
  expect(equal(originalSchools2, schools2)).toBe(true);
  expect(equal(originalTeachers3, teachers3)).toBe(true);
});

test("byId returns correct item with multiple joins to the same collection after changing reference - reference check", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("teachers", "id", teachers3);
  cruncher.addCollection("schools", "id", schools1);
  const teachersById = cruncher
    .byId("teachers")
    .join("schools", "schools")
    .join("schools", "previousSchool")
    .get();

  const teacher1 = teachersById("teacher1");
  const teacher2 = teachersById("teacher2");
  const teacher3 = teachersById("teacher3");
  const teacher4 = teachersById("teacher4");
  cruncher.update([{ collection: "schools", data: schools2 }]);
  expect(teachersById("teacher1")).not.toBe(teacher1);
  expect(teachersById("teacher2")).not.toBe(teacher2);
  expect(teachersById("teacher3")).toBe(teacher3);
  expect(teachersById("teacher4")).not.toBe(teacher4);

  expect(TestUtils.getInternalSize(cruncher, "teachers")).toBe(4);
  expect(TestUtils.getInternalSize(cruncher, "schools")).toBe(3);
  expect(
    equal(TestUtils.getReferences(cruncher), {
      teachers: {
        schools: {
          school1: { teacher1: true, teacher2: true },
          school2: { teacher1: true, teacher4: true },
          school3: { teacher3: true },
        },
        previousSchool: {
          school1: { teacher4: true },
          school2: { teacher2: true },
          school3: { teacher1: true },
        },
      },
    })
  ).toBe(true);
});
