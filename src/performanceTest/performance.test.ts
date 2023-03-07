import Cruncher from "../cruncher/index";
import tasks from "./tasks.json";
import tasksDiff6 from "./tasksDiff6.json";
import tasksDiff30 from "./tasksDiff30.json";
import tasksDiff120 from "./tasksDiff120.json";
import tasksDiff1200 from "./tasksDiff1200.json";
import workStations from "./workStations.json";
import workStationsDiff50Percent from "./workStationsDiff50Percent.json";
import departments from "./departments.json";
import employees from "./employees.json";
import { TestUtils } from "../cruncher/testutils";

function dateToMonth(date) {
  const d = new Date(date);
  return d.getMonth();
}

test("performance test", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("tasks", "id", tasks);
  cruncher.addCollection("workStations", "id", workStations);
  cruncher.addCollection("departments", "id", departments);
  cruncher.addCollection("employees", "id", employees);

  const tasksByEmployeeDateShiftNoJoins = cruncher
    .view("tasks")
    .keys("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift = cruncher
    .view("tasks")
    .keys("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation = cruncher
    .view("tasks")
    .keys("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee = cruncher
    .view("tasks")
    .keys("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth = cruncher
    .view("tasks")
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth)
    .get();
  const tasksByTypeAndWorkstation = cruncher
    .view("tasks")
    .keys("type", "workStation")
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
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth, false)
    .transform((task) => ({
      ...task,
      workStation: task.workStation ? task.workStation.name : null,
    }))
    .get();

  let t1 = new Date();
  for (let i = 0; i < 100; i++) {
    cruncher.update([
      { collection: "tasks", data: i % 2 === 0 ? tasks : tasksDiff6 },
      { collection: "workStations", data: workStations },
      { collection: "departments", data: departments },
      { collection: "employees", data: employees },
    ]);
  }
  console.log(
    "100 updates with 6 changes",
    new Date().getTime() - t1.getTime()
  );
  t1 = new Date();
  for (let i = 0; i < 100; i++) {
    cruncher.update([
      { collection: "tasks", data: i % 2 === 0 ? tasks : tasksDiff30 },
      { collection: "workStations", data: workStations },
      { collection: "departments", data: departments },
      { collection: "employees", data: employees },
    ]);
  }
  console.log(
    "100 updates with 30 changes",
    new Date().getTime() - t1.getTime()
  );
  t1 = new Date();
  for (let i = 0; i < 100; i++) {
    cruncher.update([
      { collection: "tasks", data: i % 2 === 0 ? tasks : tasksDiff120 },
      { collection: "workStations", data: workStations },
      { collection: "departments", data: departments },
      { collection: "employees", data: employees },
    ]);
  }
  console.log(
    "100 updates with 120 changes",
    new Date().getTime() - t1.getTime()
  );
  t1 = new Date();
  for (let i = 0; i < 100; i++) {
    cruncher.update([
      { collection: "tasks", data: i % 2 === 0 ? tasks : tasksDiff1200 },
      { collection: "workStations", data: workStations },
      { collection: "departments", data: departments },
      { collection: "employees", data: employees },
    ]);
  }
  console.log(
    "100 updates with 1200 changes",
    new Date().getTime() - t1.getTime()
  );
  t1 = new Date();
  for (let i = 0; i < 100; i++) {
    cruncher.update([
      { collection: "tasks", data: tasks },
      {
        collection: "workStations",
        data: i % 2 === 0 ? workStations : workStationsDiff50Percent,
      },
      { collection: "departments", data: departments },
      { collection: "employees", data: employees },
    ]);
  }
  console.log(
    "100 updates with very heavy reference changes",
    new Date().getTime() - t1.getTime()
  );
  t1 = new Date();
  for (let i = 0; i < 100; i++) {
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
      .keys("employee", "date", "shift")
      .get();
    const tasksByEmployeeDateShift = cruncher
      .view("tasks")
      .keys("employee", "date", "shift")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .get();
    const tasksByWorkstation = cruncher
      .view("tasks")
      .keys("workStation")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .get();
    const tasksByEmployee = cruncher
      .view("tasks")
      .keys("employee")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .get();
    const tasksByDepartmentAndMonth = cruncher
      .view("tasks")
      .keys("department", "date")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .group("date", dateToMonth)
      .get();
    const tasksByTypeAndWorkstation = cruncher
      .view("tasks")
      .keys("type", "workStation")
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
      .keys("department", "date")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .group("date", dateToMonth, false)
      .transform((task) => ({
        ...task,
        workStation: task.workStation ? task.workStation.name : null,
      }))
      .get();
  }
  console.log("100 new instantiations", new Date().getTime() - t1.getTime());
  t1 = new Date();
  for (let i = 0; i < 100; i++) {
    const cruncher = new Cruncher();
    cruncher.addCollection("tasks", "id", []);
    cruncher.addCollection("workStations", "id", []);
    cruncher.addCollection("departments", "id", []);
    cruncher.addCollection("employees", "id", []);

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
      .keys("employee", "date", "shift")
      .get();
    const tasksByEmployeeDateShift = cruncher
      .view("tasks")
      .keys("employee", "date", "shift")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .get();
    const tasksByWorkstation = cruncher
      .view("tasks")
      .keys("workStation")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .get();
    const tasksByEmployee = cruncher
      .view("tasks")
      .keys("employee")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .get();
    const tasksByDepartmentAndMonth = cruncher
      .view("tasks")
      .keys("department", "date")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .group("date", dateToMonth)
      .get();
    const tasksByTypeAndWorkstation = cruncher
      .view("tasks")
      .keys("type", "workStation")
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
      .keys("department", "date")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
      .group("date", dateToMonth, false)
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
  }
  console.log(
    "100 new instantiations without initial data through update",
    new Date().getTime() - t1.getTime()
  );
});

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
    .keys("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift = cruncher
    .view("tasks")
    .keys("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation = cruncher
    .view("tasks")
    .keys("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee = cruncher
    .view("tasks")
    .keys("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth = cruncher
    .view("tasks")
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth)
    .get();
  const tasksByTypeAndWorkstation = cruncher
    .view("tasks")
    .keys("type", "workStation")
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
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth, false)
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
    .keys("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift2 = cruncher2
    .view("tasks")
    .keys("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation2 = cruncher2
    .view("tasks")
    .keys("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee2 = cruncher2
    .view("tasks")
    .keys("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth2 = cruncher2
    .view("tasks")
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth)
    .get();
  const tasksByTypeAndWorkstation2 = cruncher2
    .view("tasks")
    .keys("type", "workStation")
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
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth, false)
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
    .keys("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift = cruncher
    .view("tasks")
    .keys("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation = cruncher
    .view("tasks")
    .keys("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee = cruncher
    .view("tasks")
    .keys("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth = cruncher
    .view("tasks")
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth)
    .get();
  const tasksByTypeAndWorkstation = cruncher
    .view("tasks")
    .keys("type", "workStation")
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
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth, false)
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
    .keys("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift2 = cruncher2
    .view("tasks")
    .keys("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation2 = cruncher2
    .view("tasks")
    .keys("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee2 = cruncher2
    .view("tasks")
    .keys("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth2 = cruncher2
    .view("tasks")
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth)
    .get();
  const tasksByTypeAndWorkstation2 = cruncher2
    .view("tasks")
    .keys("type", "workStation")
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
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth, false)
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
    .keys("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift = cruncher
    .view("tasks")
    .keys("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation = cruncher
    .view("tasks")
    .keys("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee = cruncher
    .view("tasks")
    .keys("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth = cruncher
    .view("tasks")
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth)
    .get();
  const tasksByTypeAndWorkstation = cruncher
    .view("tasks")
    .keys("type", "workStation")
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
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth, false)
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
    .keys("employee", "date", "shift")
    .get();
  const tasksByEmployeeDateShift2 = cruncher2
    .view("tasks")
    .keys("employee", "date", "shift")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByWorkstation2 = cruncher2
    .view("tasks")
    .keys("workStation")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByEmployee2 = cruncher2
    .view("tasks")
    .keys("employee")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .get();
  const tasksByDepartmentAndMonth2 = cruncher2
    .view("tasks")
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth)
    .get();
  const tasksByTypeAndWorkstation2 = cruncher2
    .view("tasks")
    .keys("type", "workStation")
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
    .keys("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
    .group("date", dateToMonth, false)
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
