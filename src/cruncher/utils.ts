import { Value } from ".";

const EMPTY_ARRAY = [];

function getSingleItemGetter(
  data: Map<Value, any>,
  properties: (string | ((item: any) => string | number | boolean))[]
): (...args: Value[]) => any {
  switch (properties.length) {
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
  properties: (string | ((item: any) => string | number | boolean))[]
): (...args: Value[]) => any[] {
  switch (properties.length) {
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

function getJoinAndTransform(
  joins:
    | {
        collection: string;
        property: string;
      }[]
    | undefined,
  transformation,
  idProperty: string,
  normalizedCollections: Map<string, Map<Value, any>>
): (item: any) => any {
  if (!joins || joins.length === 0) {
    if (transformation) {
      return (item) => ({
        ...transformation!(item),
        [idProperty]: item[idProperty],
      });
    }
    return (item) => item;
  }

  if (transformation) {
    return (item) => {
      const result = { ...item };
      for (const join of joins) {
        if (item[join.property]) {
          executeJoin(item, result, join, normalizedCollections);
        }
      }
      return {
        ...transformation!(result),
        [idProperty]: result[idProperty],
      };
    };
  }
  return (item) => {
    const result = { ...item };
    for (const join of joins) {
      if (item[join.property]) {
        executeJoin(item, result, join, normalizedCollections);
      }
    }
    return result;
  };
}

function executeJoin(
  item,
  result,
  join: {
    collection: string;
    property: string;
  },
  normalizedCollections
) {
  if (Array.isArray(item[join.property])) {
    result[join.property] = item[join.property].map((id) =>
      normalizedCollections.get(join.collection).get(id)
    );
  } else {
    result[join.property] = normalizedCollections
      .get(join.collection)
      .get(item[join.property]);
  }
}

export { getGetter, getJoinAndTransform, getSingleItemGetter };
