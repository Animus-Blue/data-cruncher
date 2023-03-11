import { Value } from "../cruncher";
import { valueGetter } from "./utils";

type Property = string | ((item: any) => string | number | boolean);

function deleteFromLeaf(
  property: string | ((item: any) => string | number | boolean),
  idProperty: string
): (
  data: Map<string | number | boolean, any>,
  deleteList: Map<string, any>,
  deletedList: Map<string, true>,
  item: any
) => boolean {
  const val: (item: any) => Value = valueGetter(property);
  return (
    data: Map<string | number | boolean, any>,
    deleteList: Map<string, any>,
    deletedList: Map<string, true>,
    item: any
  ) => {
    const value: any = val(item);
    if (!data.has(value)) {
      return false;
    }
    const newArray: any[] = data.get(value).filter((item) => {
      if (deleteList.has(item[idProperty])) {
        deletedList.set(item[idProperty], true);
        return false;
      }
      return true;
    });
    if (newArray.length === 0) {
      data.delete(value);
      return true;
    } else {
      data.set(value, newArray);
      return false;
    }
  };
}

function deleteFromNode(
  property: string | ((item: any) => string | number | boolean),
  deleteOnNextNode: (
    data: Map<string | number | boolean, any>,
    deleteList: Map<string, any>,
    deletedList: Map<string, true>,
    item: any
  ) => boolean
): (
  data: Map<string | number | boolean, any>,
  deleteList: Map<string, any>,
  deletedList: Map<string, true>,
  item: any
) => boolean {
  const val: (item: any) => Value = valueGetter(property);
  return (
    data: Map<string | number | boolean, any>,
    deleteList: Map<string, any>,
    deletedList: Map<string, true>,
    item: any
  ) => {
    const value: any = val(item);
    if (!data.has(value)) {
      return false;
    }
    if (deleteOnNextNode(data.get(value), deleteList, deletedList, item)) {
      if (data.get(value).size === 0) {
        data.delete(value);
        return true;
      }
    }
    return false;
  };
}

function getDeleteFromView(
  data: Map<string | number | boolean, any>,
  properties: Property[],
  idProperty: string
): (deleteList: Map<string, any>) => void {
  let executeDelete: (
    data: Map<string | number | boolean, any>,
    deleteList: Map<string, any>,
    deletedList: Map<string, true>,
    item: any
  ) => boolean = deleteFromLeaf(properties[properties.length - 1], idProperty);
  for (let i = properties.length - 2; i >= 0; i--) {
    executeDelete = deleteFromNode(properties[i], executeDelete);
  }
  return (deleteList: Map<string, any>) => {
    const deletedList: Map<string, true> = new Map();
    for (const [id, item] of deleteList) {
      if (!deletedList.has(id)) {
        executeDelete(data, deleteList, deletedList, item);
      }
    }
  };
}

export default getDeleteFromView;
