import { Value } from ".";

const EMPTY_ARRAY = [];

function getSingleItemGetter(
  data: Map<Value, any>,
  keys: string[]
): (...args: Value[]) => any {
  switch (keys.length) {
    case 0:
      return (...args) => data[0];
    case 1:
      return (...args) => data.get(args[0])?.[0];
    default:
      throw new Error("Not implemented");
  }
}

function getGetter(
  data: Map<Value, any>,
  keys: string[]
): (...args: Value[]) => any[] {
  switch (keys.length) {
    case 1:
      return (...args) => data.get(args[0]) || EMPTY_ARRAY;
    case 2:
      return (...args) => data.get(args[0])?.get(args[1]) || EMPTY_ARRAY;
    case 3:
      return (...args) =>
        data.get(args[0])?.get(args[1])?.get(args[2]) || EMPTY_ARRAY;
    case 4:
      return (...args) =>
        data.get(args[0])?.get(args[1])?.get(args[2])?.get(args[3]) ||
        EMPTY_ARRAY;
    case 5:
      return (...args) =>
        data
          .get(args[0])
          ?.get(args[1])
          ?.get(args[2])
          ?.get(args[3])
          ?.get(args[4]) || EMPTY_ARRAY;
    case 6:
      return (...args) =>
        data
          .get(args[0])
          ?.get(args[1])
          ?.get(args[2])
          ?.get(args[3])
          ?.get(args[4])
          ?.get(args[5]) || EMPTY_ARRAY;
    case 7:
      return (...args) =>
        data
          .get(args[0])
          ?.get(args[1])
          ?.get(args[2])
          ?.get(args[3])
          ?.get(args[4])
          ?.get(args[5])
          ?.get(args[6]) || EMPTY_ARRAY;
    case 8:
      return (...args) =>
        data
          .get(args[0])
          ?.get(args[1])
          ?.get(args[2])
          ?.get(args[3])
          ?.get(args[4])
          ?.get(args[5])
          ?.get(args[6])
          ?.get(args[7]) || EMPTY_ARRAY;
    case 9:
      return (...args) =>
        data
          .get(args[0])
          ?.get(args[1])
          ?.get(args[2])
          ?.get(args[3])
          ?.get(args[4])
          ?.get(args[5])
          ?.get(args[6])
          ?.get(args[7])
          ?.get(args[8]) || EMPTY_ARRAY;
    case 10:
      return (...args) =>
        data
          .get(args[0])
          ?.get(args[1])
          ?.get(args[2])
          ?.get(args[3])
          ?.get(args[4])
          ?.get(args[5])
          ?.get(args[6])
          ?.get(args[7])
          ?.get(args[8])
          ?.get(args[9]) || EMPTY_ARRAY;
    default:
      throw new Error("Not implemented");
  }
}

function getGetterWithGrouping(
  data: any,
  keys: string[],
  argumentToGroupsMap: {
    [key: string]: (arg: Value) => Value;
  }
): (...args: Value[]) => any[] {
  const group = keys.map((key, index) =>
    argumentToGroupsMap[key]
      ? (arg) => argumentToGroupsMap[key](arg[index])
      : (arg) => arg[index]
  );
  switch (keys.length) {
    case 0:
      return (...args) => data || EMPTY_ARRAY;
    case 1:
      return (...args) => data.get(group[0](args)) || EMPTY_ARRAY;
    case 2:
      return (...args) =>
        data.get(group[0](args))?.get(group[1](args)) || EMPTY_ARRAY;
    case 3:
      return (...args) =>
        data.get(group[0](args))?.get(group[1](args))?.get(group[2](args)) ||
        EMPTY_ARRAY;
    case 4:
      return (...args) =>
        data
          .get(group[0](args))
          ?.get(group[1](args))
          ?.get(group[2](args))
          ?.get(group[3](args)) || EMPTY_ARRAY;
    case 5:
      return (...args) =>
        data
          .get(group[0](args))
          ?.get(group[1](args))
          ?.get(group[2](args))
          ?.get(group[3](args))
          ?.get(group[4](args)) || EMPTY_ARRAY;
    case 6:
      return (...args) =>
        data
          .get(group[0](args))
          ?.get(group[1](args))
          ?.get(group[2](args))
          ?.get(group[3](args))
          ?.get(group[4](args))
          ?.get(group[5](args)) || EMPTY_ARRAY;
    case 7:
      return (...args) =>
        data
          .get(group[0](args))
          ?.get(group[1](args))
          ?.get(group[2](args))
          ?.get(group[3](args))
          ?.get(group[4](args))
          ?.get(group[5](args))
          ?.get(group[6](args)) || EMPTY_ARRAY;
    case 8:
      return (...args) =>
        data
          .get(group[0](args))
          ?.get(group[1](args))
          ?.get(group[2](args))
          ?.get(group[3](args))
          ?.get(group[4](args))
          ?.get(group[5](args))
          ?.get(group[6](args))
          ?.get(group[7](args)) || EMPTY_ARRAY;
    case 9:
      return (...args) =>
        data
          .get(group[0](args))
          ?.get(group[1](args))
          ?.get(group[2](args))
          ?.get(group[3](args))
          ?.get(group[4](args))
          ?.get(group[5](args))
          ?.get(group[6](args))
          ?.get(group[7](args))
          ?.get(group[8](args)) || EMPTY_ARRAY;
    case 10:
      return (...args) =>
        data
          .get(group[0](args))
          ?.get(group[1](args))
          ?.get(group[2](args))
          ?.get(group[3](args))
          ?.get(group[4](args))
          ?.get(group[5](args))
          ?.get(group[6](args))
          ?.get(group[7](args))
          ?.get(group[8](args))
          ?.get(group[9](args)) || EMPTY_ARRAY;
    default:
      throw new Error("Not implemented");
  }
}

function getJoinAndTransform(
  joins:
    | {
        collection: string;
        key: string;
      }[]
    | undefined,
  transformation,
  idKey: string,
  normalizedCollections: Map<string, Map<Value, any>>
): (item: any) => any {
  if (!joins || joins.length === 0) {
    if (transformation) {
      if (idKey === "__proto__") {
        return (item) => {
          const newItem = transformation!(item);
          Object.defineProperty(newItem, idKey, {
            writable: true,
            enumerable: true,
            configurable: true,
            value: item[idKey],
          });
          return newItem;
        };
      }
      return (item) => ({
        ...transformation!(item),
        [idKey]: item[idKey],
      });
    }
    return (item) => item;
  }

  if (transformation) {
    if (idKey === "__proto__") {
      return (item) => {
        const result = { ...item };
        for (const join of joins) {
          if (item[join.key]) {
            executeJoin(item, result, join, normalizedCollections);
          }
        }
        const newItem = transformation!(item);
        Object.defineProperty(newItem, idKey, {
          writable: true,
          enumerable: true,
          configurable: true,
          value: item[idKey],
        });
        return newItem;
      };
    }
    return (item) => {
      const result = { ...item };
      for (const join of joins) {
        if (item[join.key]) {
          executeJoin(item, result, join, normalizedCollections);
        }
      }
      return {
        ...transformation!(result),
        [idKey]: result[idKey],
      };
    };
  }
  return (item) => {
    const result = { ...item };
    for (const join of joins) {
      if (item[join.key]) {
        executeJoin(item, result, join, normalizedCollections);
      }
    }
    return result;
  };
}

function executeJoin(item, result, join, normalizedCollections) {
  if (Array.isArray(item[join.key])) {
    result[join.key] = item[join.key].map((id) =>
      normalizedCollections.get(join.collection).get(id)
    );
  } else {
    result[join.key] = normalizedCollections
      .get(join.collection)
      .get(item[join.key]);
  }
}

function getPathGetter(
  keys: string[],
  groupings,
  pathToGroup: { [key: string]: (value: Value) => Value | undefined | null }
): (item: any) => Value[] | null {
  if (!groupings) {
    return (item: any) => {
      const path: Value[] = [];
      for (const key of keys) {
        const pathItem = item[key];
        if (pathItem === null || pathItem === undefined) {
          return null;
        }
        path.push(pathItem);
      }
      return path;
    };
  }
  return (item: any) => {
    const path: Value[] = [];
    for (const key of keys) {
      const pathItem = pathToGroup[key]
        ? pathToGroup[key](item[key])
        : item[key];
      if (pathItem === null || pathItem === undefined) {
        return null;
      }
      path.push(pathItem);
    }
    return path;
  };
}

export {
  getGetter,
  getPathGetter,
  getJoinAndTransform,
  getGetterWithGrouping,
  getSingleItemGetter,
};
