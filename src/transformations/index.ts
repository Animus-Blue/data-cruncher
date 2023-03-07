type UnwrapArray<T extends [...any[]]> = T extends [infer Head, ...infer Tail]
  ? [Head, ...UnwrapArray<Tail>]
  : [];

export type Grouping<
  T extends { [key: string]: any },
  K extends Array<keyof T>,
  S
> = K extends [infer Head, ...infer Tail]
  ? {
      [key: string]: undefined | Grouping<T, UnwrapArray<Tail>, S>;
    }
  : undefined | S[];

function group<T extends { [key: string]: any }, K extends Array<keyof T>, S>(
  data: any,
  array: T[],
  transformation: (item: T) => S,
  getPath
): void {
  for (const item of array) {
    const path = getPath(item);
    if (path) {
      addRecursively(data, path, transformation(item));
    }
  }
}

function addRecursively(data: any, path: string[], value: any) {
  if (path.length === 1) {
    if (!data[path[0]]) {
      data[path[0]] = [value];
    } else {
      data[path[0]].push(value);
    }
    return;
  }
  if (!data[path[0]]) {
    data[path[0]] = {};
  }
  addRecursively(data[path[0]], path.slice(1), value);
}

function normalize(array: any, idKey: string) {
  const result: any = {};
  for (const item of array) {
    result[item[idKey]] = item;
  }
  return result;
}

function normalizeAfterProp(array: any, property: string, idKey: string) {
  const result: any = {};
  for (const item of array) {
    result[item[property][idKey]] = item;
  }
  return result;
}

export { group, normalize, normalizeAfterProp, addRecursively };
