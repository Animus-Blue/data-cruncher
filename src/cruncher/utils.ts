const EMPTY_ARRAY = [];

function getSingleItemGetter(
  data: any,
  keys: (string | number)[]
): (...args: (string | number)[]) => any {
  switch (keys.length) {
    case 0:
      return (...args) => data[0];
    case 1:
      return (...args) => data[args[0]]?.[0];
    default:
      throw new Error("Not implemented");
  }
}

function getGetter(
  data: any,
  keys: (string | number)[]
): (...args: (string | number)[]) => any[] {
  switch (keys.length) {
    case 0:
      return (...args) => data || EMPTY_ARRAY;
    case 1:
      return (...args) => data[args[0]] || EMPTY_ARRAY;
    case 2:
      return (...args) => data[args[0]]?.[args[1]] || EMPTY_ARRAY;
    case 3:
      return (...args) => data[args[0]]?.[args[1]]?.[args[2]] || EMPTY_ARRAY;
    case 4:
      return (...args) =>
        data[args[0]]?.[args[1]]?.[args[2]]?.[args[3]] || EMPTY_ARRAY;
    case 5:
      return (...args) =>
        data[args[0]]?.[args[1]]?.[args[2]]?.[args[3]]?.[args[4]] ||
        EMPTY_ARRAY;
    case 6:
      return (...args) =>
        data[args[0]]?.[args[1]]?.[args[2]]?.[args[3]]?.[args[4]]?.[args[5]] ||
        EMPTY_ARRAY;
    case 7:
      return (...args) =>
        data[args[0]]?.[args[1]]?.[args[2]]?.[args[3]]?.[args[4]]?.[args[5]]?.[
          args[6]
        ] || EMPTY_ARRAY;
    case 8:
      return (...args) =>
        data[args[0]]?.[args[1]]?.[args[2]]?.[args[3]]?.[args[4]]?.[args[5]]?.[
          args[6]
        ]?.[args[7]] || EMPTY_ARRAY;
    case 9:
      return (...args) =>
        data[args[0]]?.[args[1]]?.[args[2]]?.[args[3]]?.[args[4]]?.[args[5]]?.[
          args[6]
        ]?.[args[7]]?.[args[8]] || EMPTY_ARRAY;
    case 10:
      return (...args) =>
        data[args[0]]?.[args[1]]?.[args[2]]?.[args[3]]?.[args[4]]?.[args[5]]?.[
          args[6]
        ]?.[args[7]]?.[args[8]]?.[args[9]] || EMPTY_ARRAY;
    default:
      throw new Error("Not implemented");
  }
}

function getGetterWithGrouping(
  data: any,
  keys: (string | number)[],
  argumentToGroupsMap: {
    [key: string]: (arg: string | number) => string | number;
  }
): (...args: (string | number)[]) => any[] {
  const group = keys.map((key, index) =>
    argumentToGroupsMap[key]
      ? (arg) => argumentToGroupsMap[key](arg[index])
      : (arg) => arg[index]
  );
  switch (keys.length) {
    case 0:
      return (...args) => data || EMPTY_ARRAY;
    case 1:
      return (...args) => data[group[0](args)] || EMPTY_ARRAY;
    case 2:
      return (...args) => data[group[0](args)]?.[group[1](args)] || EMPTY_ARRAY;
    case 3:
      return (...args) =>
        data[group[0](args)]?.[group[1](args)]?.[group[2](args)] || EMPTY_ARRAY;
    case 4:
      return (...args) =>
        data[group[0](args)]?.[group[1](args)]?.[group[2](args)]?.[
          group[3](args)
        ] || EMPTY_ARRAY;
    case 5:
      return (...args) =>
        data[group[0](args)]?.[group[1](args)]?.[group[2](args)]?.[
          group[3](args)
        ]?.[group[4](args)] || EMPTY_ARRAY;
    case 6:
      return (...args) =>
        data[group[0](args)]?.[group[1](args)]?.[group[2](args)]?.[
          group[3](args)
        ]?.[group[4](args)]?.[group[5](args)] || EMPTY_ARRAY;
    case 7:
      return (...args) =>
        data[group[0](args)]?.[group[1](args)]?.[group[2](args)]?.[
          group[3](args)
        ]?.[group[4](args)]?.[group[5](args)]?.[group[6](args)] || EMPTY_ARRAY;
    case 8:
      return (...args) =>
        data[group[0](args)]?.[group[1](args)]?.[group[2](args)]?.[
          group[3](args)
        ]?.[group[4](args)]?.[group[5](args)]?.[group[6](args)]?.[
          group[7](args)
        ] || EMPTY_ARRAY;
    case 9:
      return (...args) =>
        data[group[0](args)]?.[group[1](args)]?.[group[2](args)]?.[
          group[3](args)
        ]?.[group[4](args)]?.[group[5](args)]?.[group[6](args)]?.[
          group[7](args)
        ]?.[group[8](args)] || EMPTY_ARRAY;
    case 10:
      return (...args) =>
        data[group[0](args)]?.[group[1](args)]?.[group[2](args)]?.[
          group[3](args)
        ]?.[group[4](args)]?.[group[5](args)]?.[group[6](args)]?.[
          group[7](args)
        ]?.[group[8](args)]?.[group[9](args)] || EMPTY_ARRAY;
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
  normalizedCollections: { [collection: string]: Map<string | number, any> }
): (item: any) => any {
  if (!joins || joins.length === 0) {
    if (transformation) {
      return (item) => ({
        ...transformation!(item),
        [idKey]: item[idKey],
      });
    }
    return (item) => item;
  }

  if (transformation) {
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
      normalizedCollections[join.collection].get(id)
    );
  } else {
    result[join.key] = normalizedCollections[join.collection].get(
      item[join.key]
    );
  }
}

function getPathGetter(
  keys,
  groupings,
  pathToGroup: { [key: string]: (arg: string | number) => string | number }
): (item: any) => (string | number)[] | null {
  if (!groupings) {
    return (item: any) => {
      const path: (string | number)[] = [];
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
    const path: (string | number)[] = [];
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
