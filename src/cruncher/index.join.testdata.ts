interface Student {
  id: string;
  name: string | null | undefined;
  age: number | null | undefined;
  school: string | null | undefined;
  otherProp: string;
}

interface Teacher {
  id: string;
  name: string;
  schools: string[];
}

interface School {
  id: string;
  name: string;
  kind: string;
  rating: number;
}

const teachers1: Teacher[] = [
  { id: "teacher1", name: "Teacher 1", schools: ["school1", "school2"] },
  { id: "teacher2", name: "Teacher 2", schools: ["school1"] },
  { id: "teacher3", name: "Teacher 3", schools: ["school3"] },
];

const teachers2: Teacher[] = [
  { id: "teacher1", name: "Teacher 1", schools: ["school1", "school2"] },
  { id: "teacher2", name: "Teacher 2", schools: ["school1"] },
  { id: "teacher3", name: "Teacher 3", schools: ["school3"] },
  { id: "teacher4", name: "Teacher 4", schools: ["school2", "school3"] },
];

const teachers3: Teacher[] = [
  { id: "teacher1", name: "Teacher 1", schools: ["school1", "school2"] },
  { id: "teacher2", name: "Teacher 2", schools: [] },
  { id: "teacher3", name: "Teacher 3", schools: ["school2"] },
];

const schools1: School[] = [
  { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
  { id: "school2", name: "School 2", kind: "highschool", rating: 3.5 },
  { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
];

const schools2: School[] = [
  { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
  { id: "school2", name: "School 2", kind: "highschool", rating: 3.6 },
  { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
];

const schools3: School[] = [
  { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
  { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
];

const schools4: School[] = [
  { id: "school1", name: "School 1", kind: "highschool", rating: 4.2 },
  { id: "school2", name: "School 2 Ultra", kind: "highschool", rating: 3.6 },
  { id: "school3", name: "School 3", kind: "middleschool", rating: 4.0 },
];

const students1: Student[] = [
  {
    id: "student1",
    name: "John",
    age: 20,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student2",
    name: "Jane",
    age: 21,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student3",
    name: "Jack",
    age: 21,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student4",
    name: "Jacky",
    age: 22,
    school: "school2",
    otherProp: "other",
  },
  {
    id: "student5",
    name: "Jacky",
    age: 24,
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
];

const students2: Student[] = [
  {
    id: "student1",
    name: "John",
    age: 20,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student2",
    name: "Jane",
    age: 21,
    school: undefined,
    otherProp: "other",
  },
  {
    id: "student3",
    name: "Jack",
    age: 21,
    school: null,
    otherProp: "other",
  },
  {
    id: "student4",
    name: "Jacky",
    age: 22,
    school: "school2",
    otherProp: "other",
  },
  {
    id: "student5",
    name: "Jacky",
    age: 24,
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
];

const students3: Student[] = [
  {
    id: "student1",
    name: "John",
    age: 20,
    school: "school3",
    otherProp: "other",
  },
  {
    id: "student2",
    name: "Jane",
    age: 21,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student3",
    name: "Jack",
    age: 21,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student4",
    name: "Jacky",
    age: 22,
    school: "school2",
    otherProp: "other",
  },
  {
    id: "student5",
    name: "Jacky",
    age: 24,
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
];

const students4: Student[] = [
  {
    id: "student1",
    name: "John",
    age: 20,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student2",
    name: "Jane",
    age: 21,
    school: "school1",
    otherProp: "new value",
  },
  {
    id: "student3",
    name: "Jack",
    age: 21,
    school: "school2",
    otherProp: "other",
  },
  {
    id: "student4",
    name: "Jacky",
    age: 22,
    school: "school2",
    otherProp: "other",
  },
  {
    id: "student5",
    name: "Jacky",
    age: 24,
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
];

const students5: Student[] = [
  {
    id: "student1",
    name: "John",
    age: 20,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student2",
    name: "Jane",
    age: 42,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student3",
    name: "Jack",
    age: 21,
    school: "school2",
    otherProp: "other",
  },
  {
    id: "student4",
    name: "Jacky",
    age: 22,
    school: "school2",
    otherProp: "other",
  },
  {
    id: "student5",
    name: "Jacky",
    age: 24,
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
];

const students6: Student[] = [
  {
    id: "student1a",
    name: "John",
    age: 20,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student2a",
    name: "Jane",
    age: 21,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student3a",
    name: "Jack",
    age: 21,
    school: "school1",
    otherProp: "other",
  },
  {
    id: "student4a",
    name: "Jacky",
    age: 22,
    school: "school2",
    otherProp: "other",
  },
  {
    id: "student5a",
    name: "Jacky",
    age: 24,
    school: "school2",
    otherProp: "other",
  },
  {
    id: "student6a",
    name: "Jacky",
    age: 22,
    school: "school3",
    otherProp: "other",
  },
];

export {
  schools1,
  schools2,
  schools3,
  schools4,
  students1,
  students2,
  students3,
  students4,
  students5,
  students6,
  teachers1,
  teachers2,
  teachers3,
};
