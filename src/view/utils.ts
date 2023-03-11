import { Value } from "../cruncher";

function valueGetter(
  property: string | ((item: any) => string | number | boolean)
): (item: any) => Value {
  if (typeof property === "function") {
    return property;
  } else if (property.indexOf(".") === -1) {
    return (item) => item[property];
  } else {
    const path = property.split(".");
    return (item) => {
      let value = item;
      for (const property of path) {
        value = value[property];
        if (value === undefined || value === null) {
          return undefined;
        }
      }
      return value;
    };
  }
}

function pathGetter(
  properties: (string | ((item: any) => string | number | boolean))[]
): (item: any) => Value[] | null {
  const getter: ((item: any) => Value | null | undefined)[] = properties.map(
    (property) => valueGetter(property)
  );
  return (item: any) => {
    const path: Value[] = [];
    let pathItem: Value | null | undefined;
    for (const get of getter) {
      pathItem = get(item);
      if (pathItem === null || pathItem === undefined) {
        return null;
      }
      path.push(pathItem);
    }
    return path;
  };
}

export { pathGetter, valueGetter };
