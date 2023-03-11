import { Value } from "../cruncher";
import { valueGetter } from "./utils";

type Property = string | ((item: any) => string | number | boolean);

function addOnLeaf(
  property: string | ((item: any) => string | number | boolean),
  transform: (item: any) => any
): (data: Map<string | number | boolean, any>, item: any) => boolean {
  const val: (item: any) => Value = valueGetter(property);
  return (data: Map<string | number | boolean, any>, item: any) => {
    const value: any = val(item);
    if (value === null || value === undefined) {
      return false;
    }
    if (data.has(value)) {
      data.get(value).push(transform(item));
    } else {
      data.set(value, [transform(item)]);
    }
    return true;
  };
}

function addOnNode(
  property: string | ((item: any) => string | number | boolean),
  addOnNextNode: (
    data: Map<string | number | boolean, any>,
    item: any
  ) => boolean
): (data: Map<string | number | boolean, any>, item: any) => boolean {
  const val: (item: any) => Value = valueGetter(property);
  return (data: Map<string | number | boolean, any>, item: any) => {
    const value: any = val(item);
    if (value === null || value === undefined) {
      return false;
    }
    if (data.has(value)) {
      return addOnNextNode(data.get(value), item);
    }
    const newData = new Map();
    if (addOnNextNode(newData, item)) {
      data.set(value, newData);
      return true;
    }
    return false;
  };
}

function add(properties: Property[], transform: (item: any) => any) {
  const property = properties[properties.length - 1];
  let result: (
    data: Map<string | number | boolean, any>,
    item: any
  ) => boolean = addOnLeaf(property, transform);
  for (let i = properties.length - 2; i >= 0; i--) {
    result = addOnNode(properties[i], result);
  }
  return result;
}

function create(
  data: Map<string | number | boolean, any>,
  items: any[],
  properties: (string | ((item: any) => string | number | boolean))[],
  transform: (item: any) => any
): Map<string | number | boolean, any> {
  if (!Array.isArray(items)) {
    throw new Error("Can only group arrays");
  }
  const addItem = add(properties, transform);
  for (const item of items) {
    addItem(data, item);
  }
  return data;
}

export default create;
