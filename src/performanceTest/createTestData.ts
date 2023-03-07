import fs from "fs";

function nanoid() {
  return Math.random().toString(36).substr(2);
}

const numberOfTasks = 2000;
const numberOfWorkstations = 100;
const numberOfEmployees = 50;
const numberOfDepartments = 10;
const initialDate = new Date(Date.UTC(2023, 2, 1));

const departments: { id: string; name: string; description: string }[] = [];

for (let i = 0; i < numberOfDepartments; i++) {
  departments.push({
    id: nanoid(),
    name: `Department ${i}`,
    description: `Description ${i}`,
  });
}

const employees: {
  id: string;
  name: string;
  address: string;
  careerLevel: number;
  entryDate: string;
  exitDate: string | null;
}[] = [];

for (let i = 0; i < numberOfEmployees; i++) {
  const entryDate = new Date(initialDate.getTime());
  entryDate.setUTCDate(
    entryDate.getUTCDate() - Math.round(Math.random() * 365)
  );
  const exitDate = new Date(entryDate.getTime());
  exitDate.setUTCDate(exitDate.getUTCDate() + 500);
  employees.push({
    id: nanoid(),
    name: `Employee ${i}`,
    address: `Street: Street ${(Math.random() * 500).toFixed(0)}, City: City ${(
      Math.random() * 500
    ).toFixed(0)}`,
    careerLevel: Math.round(Math.random() * 10),
    entryDate: entryDate.toISOString(),
    exitDate: Math.random() > 0.7 ? exitDate.toISOString() : null,
  });
}

const workStations: { id: string; name: string; building: string }[] = [];
for (let i = 0; i < numberOfWorkstations; i++) {
  workStations.push({
    id: nanoid(),
    name: `Workstation ${i}`,
    building: `Building ${(Math.random() * 10).toFixed(0)}`,
  });
}

const tasks: {
  id: string;
  title: string;
  type: string;
  date: string;
  shift: string;
  workStation: string | null;
  employee: string | null;
  department: string;
}[] = [];
for (let i = 0; i < numberOfTasks; i++) {
  const date = new Date(initialDate.getTime());
  date.setUTCDate(date.getUTCDate() + Math.round(Math.random() * 365));
  tasks.push({
    id: nanoid(),
    title: `Task ${i}`,
    type: `Type ${(Math.random() * 10).toFixed(0)}`,
    date: date.toISOString(),
    shift: `Shift ${(Math.random() * 3).toFixed(0)}`,
    workStation:
      Math.random() > 0.8
        ? null
        : workStations[Math.floor(Math.random() * workStations.length)].id,
    employee:
      Math.random() > 0.8
        ? null
        : employees[Math.floor(Math.random() * employees.length)].id,
    department: departments[Math.floor(Math.random() * departments.length)].id,
  });
}

function manipulatedTasks(
  tasks: {
    id: string;
    title: string;
    type: string;
    date: string;
    shift: string;
    workStation: string | null;
    employee: string | null;
    department: string;
  }[],
  amountToChangeDeleteAdd: number
): {
  id: string;
  title: string;
  type: string;
  date: string;
  shift: string;
  workStation: string | null;
  employee: string | null;
  department: string;
}[] {
  const toChange: number[] = [];
  for (let i = 0; i < amountToChangeDeleteAdd; i++) {
    let randomIndex = Math.floor(
      Math.random() * tasks.length - amountToChangeDeleteAdd
    );
    while (toChange.includes(randomIndex)) {
      randomIndex = Math.floor(
        Math.random() * tasks.length - amountToChangeDeleteAdd
      );
    }
    toChange.push(randomIndex);
  }

  let tasksDiff = tasks.map((task, index) =>
    toChange.includes(index)
      ? {
          ...task,
          title: `Task ${index} - modified`,
          type: `Type ${(Math.random() * 10).toFixed(0)}`,
          shift: `Shift ${(Math.random() * 3).toFixed(0)}`,
          workStation:
            Math.random() > 0.8
              ? null
              : workStations[Math.floor(Math.random() * workStations.length)]
                  .id,
          employee:
            Math.random() > 0.8
              ? null
              : employees[Math.floor(Math.random() * employees.length)].id,
          department:
            departments[Math.floor(Math.random() * departments.length)].id,
        }
      : task
  );

  tasksDiff = tasksDiff.filter(
    (_, index) => index < tasks.length - amountToChangeDeleteAdd
  );
  for (let i = 0; i < amountToChangeDeleteAdd; i++) {
    const date = new Date(initialDate.getTime());
    date.setUTCDate(date.getUTCDate() + Math.round(Math.random() * 365));
    tasksDiff.push({
      id: nanoid(),
      title: `Task ${i}`,
      type: `Type ${(Math.random() * 10).toFixed(0)}`,
      date: date.toISOString(),
      shift: `Shift ${(Math.random() * 3).toFixed(0)}`,
      workStation:
        Math.random() > 0.8
          ? null
          : workStations[Math.floor(Math.random() * workStations.length)].id,
      employee:
        Math.random() > 0.8
          ? null
          : employees[Math.floor(Math.random() * employees.length)].id,
      department:
        departments[Math.floor(Math.random() * departments.length)].id,
    });
  }
  return tasksDiff;
}

fs.writeFileSync(
  "src/performanceTest/tasks.json",
  JSON.stringify(tasks, null, 2)
);

fs.writeFileSync(
  "src/performanceTest/employees.json",
  JSON.stringify(employees, null, 2)
);

fs.writeFileSync(
  "src/performanceTest/workStations.json",
  JSON.stringify(workStations, null, 2)
);

fs.writeFileSync(
  "src/performanceTest/workStationsDiff50Percent.json",
  JSON.stringify(
    workStations.map((station) =>
      Math.random() > 0.5
        ? { ...station, name: station.name + " changed" }
        : station
    ),
    null,
    2
  )
);

fs.writeFileSync(
  "src/performanceTest/departments.json",
  JSON.stringify(departments, null, 2)
);

fs.writeFileSync(
  "src/performanceTest/tasksDiff6.json",
  JSON.stringify(manipulatedTasks(tasks, 2), null, 2)
);

fs.writeFileSync(
  "src/performanceTest/tasksDiff30.json",
  JSON.stringify(manipulatedTasks(tasks, 10), null, 2)
);

fs.writeFileSync(
  "src/performanceTest/tasksDiff120.json",
  JSON.stringify(manipulatedTasks(tasks, 40), null, 2)
);

fs.writeFileSync(
  "src/performanceTest/tasksDiff1200.json",
  JSON.stringify(manipulatedTasks(tasks, 400), null, 2)
);
