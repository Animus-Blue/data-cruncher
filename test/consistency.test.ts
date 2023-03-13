import Cruncher from "../src";
import tasks from "./performanceTest/tasks.json";
import tasksDiff120 from "./performanceTest/tasksDiff120.json";
import tasksDiff1200 from "./performanceTest/tasksDiff1200.json";
import workStations from "./performanceTest/workStations.json";
import workStationsDiff50Percent from "./performanceTest/workStationsDiff50Percent.json";
import departments from "./performanceTest/departments.json";
import employees from "./performanceTest/employees.json";
import { TestUtils } from "./testutils";

function dateToMonth(date) {
  const d = new Date(date);
  return d.getMonth();
}

test("internal structure is consistent after a lot of updates", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("tasks", "id", tasks);
  cruncher.addCollection("workStations", "id", workStations);
  cruncher.addCollection("departments", "id", departments);
  cruncher.addCollection("employees", "id", employees);
  const workStationsById = cruncher.byId("workStations").get();
  const departmentsById = cruncher.byId("departments").get();
  const employeesById = cruncher.byId("employees").get();
  const tasksById = cruncher
    .byId("tasks")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployeeDateShiftNoJoins = cruncher
    .view("tasks")
    .by("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift = cruncher
    .view("tasks")
    .by("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation = cruncher
    .view("tasks")
    .by("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee = cruncher
    .view("tasks")
    .by("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth = cruncher
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByTypeAndWorkstation = cruncher
    .view("tasks")
    .by("type", "workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();
  const tasksByDepartmentAndMonthTransformed = cruncher
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();

  cruncher.update([
    { collection: "tasks", data: tasksDiff120 },
    { collection: "workStations", data: workStationsDiff50Percent },
    { collection: "departments", data: [] },
    { collection: "employees", data: employees },
  ]);

  cruncher.update([
    { collection: "tasks", data: tasks },
    { collection: "workStations", data: workStations },
    { collection: "departments", data: [] },
    { collection: "employees", data: [] },
  ]);

  cruncher.update([
    { collection: "tasks", data: tasksDiff1200 },
    { collection: "workStations", data: workStationsDiff50Percent },
    { collection: "departments", data: departments },
    { collection: "employees", data: employees },
  ]);

  const cruncher2 = new Cruncher();
  cruncher2.addCollection("tasks", "id", tasksDiff1200);
  cruncher2.addCollection("workStations", "id", workStationsDiff50Percent);
  cruncher2.addCollection("departments", "id", departments);
  cruncher2.addCollection("employees", "id", employees);

  const workStationsById2 = cruncher2.byId("workStations").get();
  const departmentsById2 = cruncher2.byId("departments").get();
  const employeesById2 = cruncher2.byId("employees").get();
  const tasksById2 = cruncher2
    .byId("tasks")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployeeDateShiftNoJoins2 = cruncher2
    .view("tasks")
    .by("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift2 = cruncher2
    .view("tasks")
    .by("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation2 = cruncher2
    .view("tasks")
    .by("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee2 = cruncher2
    .view("tasks")
    .by("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth2 = cruncher2
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByTypeAndWorkstation2 = cruncher2
    .view("tasks")
    .by("type", "workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();
  const tasksByDepartmentAndMonthTransformed2 = cruncher2
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();

  expect(TestUtils.isInnerStructureEqual(cruncher, cruncher2)).toBe(true);
});

test("internal structure is consistent after a lot of updates with adding data after instantiating", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("tasks", "id");
  cruncher.addCollection("workStations", "id");
  cruncher.addCollection("departments", "id");
  cruncher.addCollection("employees", "id");
  const workStationsById = cruncher.byId("workStations").get();
  const departmentsById = cruncher.byId("departments").get();
  const employeesById = cruncher.byId("employees").get();
  const tasksById = cruncher
    .byId("tasks")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployeeDateShiftNoJoins = cruncher
    .view("tasks")
    .by("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift = cruncher
    .view("tasks")
    .by("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation = cruncher
    .view("tasks")
    .by("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee = cruncher
    .view("tasks")
    .by("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth = cruncher
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByTypeAndWorkstation = cruncher
    .view("tasks")
    .by("type", "workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();
  const tasksByDepartmentAndMonthTransformed = cruncher
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();

  cruncher.update([
    { collection: "tasks", data: tasks },
    { collection: "workStations", data: workStations },
    { collection: "departments", data: departments },
    { collection: "employees", data: employees },
  ]);

  cruncher.update([
    { collection: "tasks", data: tasksDiff120 },
    { collection: "workStations", data: workStationsDiff50Percent },
    { collection: "departments", data: [] },
    { collection: "employees", data: employees },
  ]);

  cruncher.update([
    { collection: "tasks", data: tasks },
    { collection: "workStations", data: workStations },
    { collection: "departments", data: [] },
    { collection: "employees", data: [] },
  ]);

  cruncher.update([
    { collection: "tasks", data: tasksDiff1200 },
    { collection: "workStations", data: workStationsDiff50Percent },
    { collection: "departments", data: departments },
    { collection: "employees", data: employees },
  ]);

  const cruncher2 = new Cruncher();
  cruncher2.addCollection("tasks", "id", tasksDiff1200);
  cruncher2.addCollection("workStations", "id", workStationsDiff50Percent);
  cruncher2.addCollection("departments", "id", departments);
  cruncher2.addCollection("employees", "id", employees);

  const workStationsById2 = cruncher2.byId("workStations").get();
  const departmentsById2 = cruncher2.byId("departments").get();
  const employeesById2 = cruncher2.byId("employees").get();
  const tasksById2 = cruncher2
    .byId("tasks")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployeeDateShiftNoJoins2 = cruncher2
    .view("tasks")
    .by("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift2 = cruncher2
    .view("tasks")
    .by("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation2 = cruncher2
    .view("tasks")
    .by("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee2 = cruncher2
    .view("tasks")
    .by("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth2 = cruncher2
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByTypeAndWorkstation2 = cruncher2
    .view("tasks")
    .by("type", "workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();
  const tasksByDepartmentAndMonthTransformed2 = cruncher2
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();

  expect(TestUtils.isInnerStructureEqual(cruncher, cruncher2)).toBe(true);
});

test("internal structure is consistent after a lot of updates with adding data after instantiating on both compared crunchers", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("tasks", "id");
  cruncher.addCollection("workStations", "id");
  cruncher.addCollection("departments", "id");
  cruncher.addCollection("employees", "id");
  const workStationsById = cruncher.byId("workStations").get();
  const departmentsById = cruncher.byId("departments").get();
  const employeesById = cruncher.byId("employees").get();
  const tasksById = cruncher
    .byId("tasks")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployeeDateShiftNoJoins = cruncher
    .view("tasks")
    .by("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift = cruncher
    .view("tasks")
    .by("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation = cruncher
    .view("tasks")
    .by("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee = cruncher
    .view("tasks")
    .by("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth = cruncher
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByTypeAndWorkstation = cruncher
    .view("tasks")
    .by("type", "workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();
  const tasksByDepartmentAndMonthTransformed = cruncher
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();

  cruncher.update([
    { collection: "tasks", data: tasks },
    { collection: "workStations", data: workStations },
    { collection: "departments", data: departments },
    { collection: "employees", data: employees },
  ]);

  cruncher.update([
    { collection: "tasks", data: tasksDiff120 },
    { collection: "workStations", data: workStationsDiff50Percent },
    { collection: "departments", data: [] },
    { collection: "employees", data: employees },
  ]);

  cruncher.update([
    { collection: "tasks", data: tasks },
    { collection: "workStations", data: workStations },
    { collection: "departments", data: [] },
    { collection: "employees", data: [] },
  ]);

  cruncher.update([
    { collection: "tasks", data: tasksDiff1200 },
    { collection: "workStations", data: workStationsDiff50Percent },
    { collection: "departments", data: departments },
    { collection: "employees", data: employees },
  ]);

  const cruncher2 = new Cruncher();
  cruncher2.addCollection("tasks", "id");
  cruncher2.addCollection("workStations", "id");
  cruncher2.addCollection("departments", "id");
  cruncher2.addCollection("employees", "id");

  const workStationsById2 = cruncher2.byId("workStations").get();
  const departmentsById2 = cruncher2.byId("departments").get();
  const employeesById2 = cruncher2.byId("employees").get();
  const tasksById2 = cruncher2
    .byId("tasks")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployeeDateShiftNoJoins2 = cruncher2
    .view("tasks")
    .by("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift2 = cruncher2
    .view("tasks")
    .by("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation2 = cruncher2
    .view("tasks")
    .by("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee2 = cruncher2
    .view("tasks")
    .by("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth2 = cruncher2
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByTypeAndWorkstation2 = cruncher2
    .view("tasks")
    .by("type", "workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();
  const tasksByDepartmentAndMonthTransformed2 = cruncher2
    .view("tasks")
    .by("department", "date", (a) => dateToMonth(a.date))
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();
  cruncher2.update([
    { collection: "tasks", data: tasksDiff1200 },
    { collection: "workStations", data: workStationsDiff50Percent },
    { collection: "departments", data: departments },
    { collection: "employees", data: employees },
  ]);
  expect(TestUtils.isInnerStructureEqual(cruncher, cruncher2)).toBe(true);
});
