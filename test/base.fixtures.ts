interface Student {
  id: string;
  name: string | null | undefined;
  age: number | null | undefined;
  otherProp: string;
}

const students1: Student[] = [
  { id: "1", name: "John A", age: 20, otherProp: "other" },
  { id: "2", name: "Jane A", age: 21, otherProp: "other" },
  { id: "3", name: "Jack A", age: 21, otherProp: "other" },
  { id: "4", name: "Jacky A", age: 22, otherProp: "other" },
  { id: "5", name: "Jacky A", age: 24, otherProp: "other" },
  { id: "6", name: "Jacky A", age: 22, otherProp: "other" },
];

const students2: Student[] = [
  { id: "1", name: "John A", age: 20, otherProp: "other" },
  { id: "2", name: "Jane A", age: 21, otherProp: "other" },
  { id: "3", name: "Jack A", age: 21, otherProp: "other" },
  { id: "4", name: "Jacky A", age: 22, otherProp: "other" },
  { id: "5", name: "Jacky A", age: 24, otherProp: "other" },
  { id: "6", name: "Jacky A", age: 22, otherProp: "other" },
  { id: "7", name: "Jacky A", age: 24, otherProp: "other" },
];

const students3: Student[] = [
  { id: "1", name: "John A", age: 20, otherProp: "other" },
  { id: "2", name: "Jane A", age: 21, otherProp: "other" },
  { id: "5", name: "Jacky A", age: 24, otherProp: "other" },
  { id: "6", name: "Jacky A", age: 22, otherProp: "other" },
  { id: "7", name: "Jacky A", age: 24, otherProp: "other" },
];

const students4: Student[] = [
  { id: "1", name: "John A", age: 20, otherProp: "other" },
  { id: "2", name: "Jane A", age: 21, otherProp: "other" },
  { id: "3", name: "Jack A", age: 21, otherProp: "other" },
  { id: "4", name: "Jacky A", age: 22, otherProp: "other" },
  { id: "5", name: "Jacky A", age: 24, otherProp: "other" },
  { id: "6", name: "Jacky A", age: 22, otherProp: "other" },
  { id: "7", name: null, age: 22, otherProp: "other" },
  { id: "8", name: "Maria A", age: undefined, otherProp: "other" },
];

const students5: Student[] = [
  { id: "1", name: "John A", age: 20, otherProp: "other" },
  { id: "2", name: "Jane A", age: 21, otherProp: "other2" },
  { id: "5", name: "Jacky A", age: 24, otherProp: "other" },
  { id: "6", name: "Jacky A", age: 23, otherProp: "other" },
  { id: "7", name: "Jacky A", age: 24, otherProp: "other" },
];

const manyProperties: any[] = [
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
];

const studentsWithHappiness1: any[] = [
  { id: "1", name: "John A", age: 20, isHappy: true },
  { id: "2", name: "Jane A", age: 21, isHappy: true },
  { id: "5", name: "Jacky A", age: 24, isHappy: false },
  { id: "6", name: "Jacky A", age: 23, isHappy: true },
  { id: "7", name: "Jacky A", age: 24, isHappy: true },
];

const studentsWithHappiness2: any[] = [
  { id: "1", name: "John A", age: 20, isHappy: true },
  { id: "2", name: "Jane A", age: 21, isHappy: true },
  { id: "5", name: "Jacky A", age: 24, isHappy: false },
  { id: "6", name: "Jacky A", age: 23, isHappy: true },
  { id: "7", name: "Jacky A", age: 24, isHappy: true },
  { id: "8", name: "Kelly A", age: 21, isHappy: false },
];

export {
  students1,
  students2,
  students3,
  students4,
  students5,
  studentsWithHappiness1,
  studentsWithHappiness2,
  manyProperties,
};
