import { Value } from "../cruncher";

function group(
  data: Map<Value, any>,
  array: any[],
  transformation: (item: any) => any,
  getPath
): void {
  for (const item of array) {
    const path = getPath(item);
    if (path) {
      addRecursively(data, path, transformation(item));
    }
  }
}

function addRecursively(data: Map<Value, any>, path: Value[], value: any) {
  if (path.length === 1) {
    if (!data.has(path[0])) {
      data.set(path[0], [value]);
    } else {
      data.get(path[0]).push(value);
    }
    return;
  }
  if (!data.has(path[0])) {
    data.set(path[0], new Map());
  }
  addRecursively(data.get(path[0]), path.slice(1), value);
}

function normalize(array: any, idProperty: string) {
  const result: any = {};
  for (const item of array) {
    result[item[idProperty]] = item;
  }
  return result;
}

function normalizeAfterProp(array: any, property: string, idProperty: string) {
  const result: any = {};
  for (const item of array) {
    result[item[property][idProperty]] = item;
  }
  return result;
}

export { group, normalize, normalizeAfterProp, addRecursively };
