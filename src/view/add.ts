import { Value } from "../cruncher";
import { valueGetter } from "./utils";

type Property = string | ((item: any) => string | number | boolean);

function addOnLeaf(
  property: string | ((item: any) => string | number | boolean),
  transform: (item: any) => any
): (
  data: Map<string | number | boolean, any>,
  modifiedList: Map<any[], true>,
  item: any
) => boolean {
  const val: (item: any) => Value = valueGetter(property);
  return (
    data: Map<string | number | boolean, any>,
    modifiedList: Map<any[], true>,
    item: any
  ) => {
    const value: any = val(item);
    if (value === null || value === undefined) {
      return false;
    }
    const array = data.get(value);
    if (array !== undefined) {
      if (modifiedList.has(array)) {
        array.push(transform(item));
      } else {
        const newArray = [...array, transform(item)];
        modifiedList.set(newArray, true);
        data.set(value, newArray);
      }
    } else {
      const newArray = [transform(item)];
      modifiedList.set(newArray, true);
      data.set(value, newArray);
    }
    return true;
  };
}

function addOnNode(
  property: string | ((item: any) => string | number | boolean),
  addOnNextNode: (
    data: Map<string | number | boolean, any>,
    modifiedList: Map<any[], true>,
    item: any
  ) => boolean
): (
  data: Map<string | number | boolean, any>,
  modifiedList: Map<any[], true>,
  item: any
) => boolean {
  const val: (item: any) => Value = valueGetter(property);
  return (
    data: Map<string | number | boolean, any>,
    modifiedList: Map<any[], true>,
    item: any
  ) => {
    const value: any = val(item);
    if (value === null || value === undefined) {
      return false;
    }
    if (data.has(value)) {
      return addOnNextNode(data.get(value), modifiedList, item);
    }
    const newData = new Map();
    if (addOnNextNode(newData, modifiedList, item)) {
      data.set(value, newData);
      return true;
    }
    return false;
  };
}

function getAddToView(
  data: Map<string | number | boolean, any>,
  properties: Property[],
  transform: (item: any) => any
): (addList: any[], additionalAddList: any[]) => void {
  let executeAdd: (
    data: Map<string | number | boolean, any>,
    modifiedList: Map<any[], true>,
    item: any
  ) => boolean = addOnLeaf(properties[properties.length - 1], transform);
  for (let i = properties.length - 2; i >= 0; i--) {
    executeAdd = addOnNode(properties[i], executeAdd);
  }
  return (addList: any[], additionalAddList: any[]) => {
    const modifiedList: Map<any[], true> = new Map();
    for (const item of addList) {
      executeAdd(data, modifiedList, item);
    }
    for (const item of additionalAddList) {
      executeAdd(data, modifiedList, item);
    }
  };
}

export default getAddToView;
