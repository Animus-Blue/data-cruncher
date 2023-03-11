export const students = [
  {
    id: "1",
    name: "John",
    age: 20,
    address: { street: "street A", zipCode: "zipCode A" },
  },
  {
    id: "2",
    name: "Jane",
    age: 21,
    address: { street: "street B", zipCode: "zipCode A" },
  },
  {
    id: "3",
    name: "Jack",
    age: 21,
    address: { street: "street A", zipCode: "zipCode A" },
  },
  {
    id: "4",
    name: "Jacky",
    age: 22,
    address: { street: "street B", zipCode: "zipCode B" },
  },
  {
    id: "5",
    name: "Jacky",
    age: 24,
    address: { street: "street A", zipCode: "zipCode B" },
  },
  {
    id: "6",
    name: "Jacky",
    age: 22,
    address: { street: "street A", zipCode: "zipCode A" },
  },
];

export const studentsWithMissingKeys = [
  {
    id: "1",
    name: "John",
    age: 20,
    address: { street: "street A" },
  },
  {
    id: "2",
    name: "Jane",
    age: 21,
    address: { street: "street B", zipCode: "zipCode A" },
  },
  {
    id: "3",
    name: "Jack",
    age: 21,
    address: { zipCode: "zipCode A" },
  },
  {
    id: "4",
    name: "Jacky",
    age: 22,
    address: { street: "street B", zipCode: "zipCode B" },
  },
  {
    id: "5",
    name: "Jacky",
    age: 24,
  },
  {
    id: "6",
    name: "Jacky",
    address: { street: "street A", zipCode: "zipCode A" },
  },
];
