import { students } from "./view.fixtures";
import { toObject } from "../testutils";
import create from "../../src/view/create";
import getRefresh from "../../src/view/refresh";

test("refreshes items with a nested key", () => {
  const transform = (item) => ({
    address: item.address.street,
    age: item.age,
    id: item.id,
    name: item.name,
  });
  const data = new Map();
  create(data, students, ["age", "address.zipCode"], transform);
  const refresh = getRefresh(data, ["age", "address.zipCode"], "id", transform);
  const refreshList = new Map();
  refreshList.set("1", { ...students[0], name: "Johny" });
  refreshList.set("2", {
    ...students[1],
    address: { street: "street C", zipCode: "zipCode A" },
  });
  refresh(refreshList);
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    "20": {
      "zipCode A": [
        {
          address: "street A",
          age: 20,
          id: "1",
          name: "Johny",
        },
      ],
    },
    "21": {
      "zipCode A": [
        {
          address: "street C",
          age: 21,
          id: "2",
          name: "Jane",
        },
        {
          address: "street A",
          age: 21,
          id: "3",
          name: "Jack",
        },
      ],
    },
    "22": {
      "zipCode A": [
        {
          address: "street A",
          age: 22,
          id: "6",
          name: "Jacky",
        },
      ],
      "zipCode B": [
        {
          address: "street B",
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
    "24": {
      "zipCode B": [
        {
          address: "street A",
          age: 24,
          id: "5",
          name: "Jacky",
        },
      ],
    },
  });
});

test("refreshes correctly with a function", () => {
  const transform = (item) => ({
    address: item.address.street,
    age: item.age,
    id: item.id,
    name: item.name,
  });
  const data = new Map();
  create(
    data,
    students,
    ["age", (item) => item.address.street.endsWith("A")],
    transform
  );
  const refresh = getRefresh(
    data,
    ["age", (item) => item.address.street.endsWith("A")],
    "id",
    transform
  );
  const refreshList = new Map();
  refreshList.set("1", { ...students[0], name: "Johny" });
  refreshList.set("2", {
    ...students[1],
    address: { street: "street C", zipCode: "zipCode A" },
  });
  refresh(refreshList);
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    "20": {
      true: [
        {
          address: "street A",
          age: 20,
          id: "1",
          name: "Johny",
        },
      ],
    },
    "21": {
      false: [
        {
          address: "street C",
          age: 21,
          id: "2",
          name: "Jane",
        },
      ],
      true: [
        {
          address: "street A",
          age: 21,
          id: "3",
          name: "Jack",
        },
      ],
    },
    "22": {
      true: [
        {
          address: "street A",
          age: 22,
          id: "6",
          name: "Jacky",
        },
      ],
      false: [
        {
          address: "street B",
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
    "24": {
      true: [
        {
          address: "street A",
          age: 24,
          id: "5",
          name: "Jacky",
        },
      ],
    },
  });
});
