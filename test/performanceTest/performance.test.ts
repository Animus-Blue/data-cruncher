import Cruncher from "../../src/cruncher/index";
import tasks from "./tasks.json";
import tasksDiff6 from "./tasksDiff6.json";
import tasksDiff30 from "./tasksDiff30.json";
import tasksDiff120 from "./tasksDiff120.json";
import tasksDiff1200 from "./tasksDiff1200.json";
import workStations from "./workStations.json";
import workStationsDiff50Percent from "./workStationsDiff50Percent.json";
import departments from "./departments.json";
import employees from "./employees.json";

test("performance test", () => {
  const cruncher = new Cruncher();
  cruncher.addCollection("tasks", "id", tasks);
  cruncher.addCollection("workStations", "id", workStations);
  cruncher.addCollection("departments", "id", departments);
  cruncher.addCollection("employees", "id", employees);

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
    .by("department", "date")
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
    .by("department", "date")
    .join("employees", "employee")
    .join("departments", "department")
    .join("workStations", "workStation")
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
      .by("department", "date")
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
      .by("department", "date")
      .join("employees", "employee")
      .join("departments", "department")
      .join("workStations", "workStation")
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
      .by("department", "date")
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
      .by("department", "date")
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
  }
  console.log(
    "100 new instantiations without initial data through update",
    new Date().getTime() - t1.getTime()
  );
});
