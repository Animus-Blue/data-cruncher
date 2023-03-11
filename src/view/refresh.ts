import { Value } from "../cruncher";
import equal from "../transformations/equal";
import { valueGetter } from "./utils";

type Property = string | ((item: any) => string | number | boolean);

function refreshOnLeaf(
  property: string | ((item: any) => string | number | boolean),
  idProperty: string,
  transform: (item: any) => any
): (
  data: Map<string | number | boolean, any>,
  refreshList: Map<string, any>,
  doneList: Map<string, true>,
  item: any
) => void {
  const val: (item: any) => Value = valueGetter(property);
  return (
    data: Map<string | number | boolean, any>,
    refreshList: Map<string, any>,
    doneList: Map<string, true>,
    item: any
  ) => {
    const value: any = val(item);
    if (value === null || value === undefined) {
      return;
    }
    let modified: boolean = false;
    const newArray = data.get(value).map((t) => {
      const updated = refreshList.get(t[idProperty]);
      if (updated !== undefined) {
        doneList.set(t[idProperty], true);
        const newItem = transform(updated);
        if (!equal(t, newItem)) {
          modified = true;
          return newItem;
        }
      }
      return t;
    });
    if (modified) {
      data.set(value, newArray);
    }
  };
}

function refreshOnNode(
  property: string | ((item: any) => string | number | boolean),
  refreshOnNextNode: (
    data: Map<string | number | boolean, any>,
    refreshList: Map<string, any>,
    doneList: Map<string, true>,
    item: any
  ) => void
): (
  data: Map<string | number | boolean, any>,
  refreshList: Map<string, any>,
  doneList: Map<string, true>,
  item: any
) => void {
  const val: (item: any) => Value = valueGetter(property);
  return (
    data: Map<string | number | boolean, any>,
    refreshList: Map<string, any>,
    doneList: Map<string, true>,
    item: any
  ) => {
    const value: any = val(item);
    if (value === null || value === undefined) {
      return;
    }
    refreshOnNextNode(data.get(value), refreshList, doneList, item);
  };
}

function getRefresh(
  data: Map<string | number | boolean, any>,
  properties: Property[],
  idProperty: string,
  transform: (item: any) => any
): (refreshList: Map<string, any>) => void {
  let executeRefresh: (
    data: Map<string | number | boolean, any>,
    refreshList: Map<string, any>,
    doneList: Map<string, true>,
    item: any
  ) => void = refreshOnLeaf(
    properties[properties.length - 1],
    idProperty,
    transform
  );
  for (let i = properties.length - 2; i >= 0; i--) {
    executeRefresh = refreshOnNode(properties[i], executeRefresh);
  }
  return (refreshList: Map<string, any>) => {
    const doneList: Map<string, true> = new Map();
    for (const [id, item] of refreshList) {
      if (!doneList.has(id)) {
        executeRefresh(data, refreshList, doneList, item);
      }
    }
  };
}

export default getRefresh;
