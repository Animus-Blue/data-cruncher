const students = [
  { id: "1", name: "John", age: 20, 1337: 32, true: "yes", otherProp: "other" },
  { id: "2", name: "Jane", age: 21, 1337: 32, true: "yes", otherProp: "other" },
  { id: "3", name: "Jack", age: 21, 1337: 31, true: "yes", otherProp: "other" },
  {
    id: "4",
    name: "Jacky",
    age: 22,
    1337: 31,
    true: "no",
    otherProp: "other",
  },
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
];

const students2 = [
  {
    id: "1",
    name: "John",
    age: 20,
    "1337": 32,
    true: "yes",
    otherProp: "other",
  },
  {
    id: "2",
    name: "Jane",
    age: 21,
    "1337": 32,
    true: "yes",
    otherProp: "other",
  },
  {
    id: "3",
    name: "Jack",
    age: 21,
    "1337": 31,
    true: "yes",
    otherProp: "other",
  },
  {
    id: "4",
    name: "Jacky",
    age: 22,
    "1337": 31,
    true: "no",
    otherProp: "other",
  },
  {
    id: "5",
    name: "Jacky",
    age: 24,
    "1337": 32,
    true: "no",
    otherProp: "other",
  },
  {
    id: "6",
    name: "Jacky",
    age: 22,
    "1337": 32,
    true: "no",
    otherProp: "other",
  },
];

const students3: any[] = [
  { id: "1", name: "John", age: 20, isHappy: true },
  { id: "2", name: "Jane", age: 21, isHappy: true },
  { id: "5", name: "Jacky", age: 24, isHappy: false },
  { id: "6", name: "Jacky", age: 23, isHappy: true },
  { id: "7", name: "Jacky", age: 24, isHappy: true },
];

const students4: any[] = [
  { id: "1", name: "John", age: 20, isHappy: true },
  { id: "2", name: "Jane", age: "21", isHappy: true },
  { id: "5", name: "Jacky", age: 24, isHappy: false },
  { id: "6", name: "Jacky", age: 23, isHappy: "true" },
  { id: "7", name: "Jacky", age: 24, isHappy: true },
];

export { students, students2, students3, students4 };
