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
  previousSchool?: string;
}

interface School {
  id: string;
  name: string;
  kind: string;
  rating: number;
}

const teachers1: Teacher[] = [
  {
    id: "teacher1",
    name: "Teacher 1",
    schools: ["school1", "school2"],
    previousSchool: "school3",
  },
  {
    id: "teacher2",
    name: "Teacher 2",
    schools: ["school1"],
    previousSchool: "school1",
  },
  { id: "teacher3", name: "Teacher 3", schools: ["school3"] },
];

const teachers2: Teacher[] = [
  {
    id: "teacher1",
    name: "Teacher 1",
    schools: ["school1", "school2"],
    previousSchool: "school3",
  },
  {
    id: "teacher2",
    name: "Teacher 2",
    schools: ["school1"],
    previousSchool: "school1",
  },
  { id: "teacher3", name: "Teacher 3", schools: ["school3"] },
  {
    id: "teacher4",
    name: "Teacher 4",
    schools: ["school2"],
    previousSchool: "school1",
  },
];

const teachers3: Teacher[] = [
  {
    id: "teacher1",
    name: "Teacher 1",
    schools: ["school1", "school2"],
    previousSchool: "school3",
  },
  {
    id: "teacher2",
    name: "Teacher 2",
    schools: ["school1"],
    previousSchool: "school2",
  },
  { id: "teacher3", name: "Teacher 3", schools: ["school3"] },
  {
    id: "teacher4",
    name: "Teacher 4",
    schools: ["school2"],
    previousSchool: "school1",
  },
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

export { schools1, schools2, schools3, teachers1, teachers2, teachers3 };
