import tasks from "../performanceTest/tasks.json";
import { students } from "./view.fixtures";
import { toObject } from "../testutils";
import create from "../../src/view/create";
import getDeleteFromView from "../../src/view/delete";

test("deletes with multiple keys and with partially missing values in original data", () => {
  const data = new Map();
  create(data, tasks, ["type", "employee"], (item) => item);
  const deleteFromView = getDeleteFromView(data, ["type", "employee"], "id");
  const idsToDelete = ["63cw7wz0vmi", "afto1msorqm", "5ftrbij9xd3"];
  const deleteList = new Map();
  deleteList.set(
    idsToDelete[0],
    tasks.find((s) => s.id === idsToDelete[0])
  );
  deleteList.set(
    idsToDelete[1],
    tasks.find((s) => s.id === idsToDelete[1])
  );
  deleteList.set(
    idsToDelete[2],
    tasks.find((s) => s.id === idsToDelete[2])
  );
  deleteFromView(deleteList);
  const groupedByShiftAndType = toObject(data, 2);

  const groupedExpected = tasks
    .filter((task) => task.employee && !idsToDelete.includes(task.id))
    .reduce(
      (acc, task: any) => ({
        ...acc,
        [task["type"]]: {
          ...(acc[task["type"]] || []),
          [task["employee"]]: [
            ...(acc[task["type"]]?.[task["employee"]] || []),
            task,
          ],
        },
      }),
      {}
    );
  expect(Object.keys(groupedByShiftAndType).length).toBe(
    Object.keys(groupedExpected).length
  );
  for (let key of Object.keys(groupedExpected)) {
    expect(Object.keys(groupedByShiftAndType[key]).length).toBe(
      Object.keys(groupedExpected[key]).length
    );
    for (let subKey of Object.keys(groupedExpected[key])) {
      groupedByShiftAndType[key][subKey].sort((a, b) =>
        b.id.localeCompare(a.id)
      );
      groupedExpected[key][subKey].sort((a, b) => b.id.localeCompare(a.id));
      expect(groupedByShiftAndType[key][subKey]).toEqual(
        groupedExpected[key][subKey]
      );
    }
  }
});

test("deletes given items result with a nested key", () => {
  const data = new Map();
  create(data, students, ["age", "address.zipCode"], (item) => item);
  const deleteFromView = getDeleteFromView(
    data,
    ["age", "address.zipCode"],
    "id"
  );
  const deleteList = new Map();
  deleteList.set("1", students[0]);
  deleteList.set("2", students[1]);
  deleteFromView(deleteList);
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    "21": {
      "zipCode A": [
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 21,
          id: "3",
          name: "Jack",
        },
      ],
    },
    "22": {
      "zipCode A": [
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 22,
          id: "6",
          name: "Jacky",
        },
      ],
      "zipCode B": [
        {
          address: { street: "street B", zipCode: "zipCode B" },
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
    "24": {
      "zipCode B": [
        {
          address: { street: "street A", zipCode: "zipCode B" },
          age: 24,
          id: "5",
          name: "Jacky",
        },
      ],
    },
  });
});

test("deletes correctly with a function", () => {
  const data = new Map();
  create(
    data,
    students,
    ["age", (item) => item.address.street.endsWith("A")],
    (item) => item
  );
  const deleteFromView = getDeleteFromView(
    data,
    ["age", (item) => item.address.street.endsWith("A")],
    "id"
  );
  const deleteList = new Map();
  deleteList.set("3", students[2]);
  deleteList.set("5", students[4]);
  deleteFromView(deleteList);
  const studentsByAgeAndZipCode = toObject(data, 2);

  expect(studentsByAgeAndZipCode).toEqual({
    "20": {
      true: [
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 20,
          id: "1",
          name: "John",
        },
      ],
    },
    "21": {
      false: [
        {
          address: { street: "street B", zipCode: "zipCode A" },
          age: 21,
          id: "2",
          name: "Jane",
        },
      ],
    },
    "22": {
      true: [
        {
          address: { street: "street A", zipCode: "zipCode A" },
          age: 22,
          id: "6",
          name: "Jacky",
        },
      ],
      false: [
        {
          address: { street: "street B", zipCode: "zipCode B" },
          age: 22,
          id: "4",
          name: "Jacky",
        },
      ],
    },
  });
});
