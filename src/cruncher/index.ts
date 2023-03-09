import { group, normalize, normalizeAfterProp } from "../transformations";
import {
  getGetter,
  getGetterWithGrouping,
  getJoinAndTransform,
  getPathGetter,
  getSingleItemGetter,
} from "./utils";
import equal from "../transformations/equal";
import { getAlreadyPresentViews } from "./verifyViews";

export type Value = string | number | boolean;

export interface Join {
  collection: string;
  key: string;
}

export interface Grouping {
  key: string;
  groupingFunction: (value: Value) => Value;
  useGroupsAsParameter: boolean;
}

export interface ViewOptions {
  collection: string;
  keys: string[];
  joins?: Join[];
  groupings?: Grouping[];
  transformation?: (item: any) => any;
  returnSingleItemWithoutGrouping?: boolean;
}

export interface Update {
  collection: string;
  data: any[];
}

interface View {
  collection: string;
  isInitialized: boolean;
  transformation?: (item: any) => any;
  groupings?: Grouping[];
  joins?: Join[];
  joinAndTransform: (item: any) => any;
  keys: Value[];
  data: Map<Value, any>;
  getPath: (item: any) => Value[] | null;
  view: (...args: Value[]) => any;
}

class Cruncher {
  private views: View[] = [];
  private normalizedCollections: Map<string, Map<Value, any>>;
  private collections: Map<string, { idKey: string; data: any[] }>;
  private references: Map<string, Map<string, Map<string, Map<string, true>>>>;

  constructor() {
    this.normalizedCollections = new Map();
    this.collections = new Map();
    this.references = new Map();
  }

  public addCollection(name: string, idKey: string, data?: any[]): void {
    const normalizedCollection = new Map<Value, any>();
    data?.forEach((t) => normalizedCollection.set(t[idKey], t));
    this.normalizedCollections.set(name, normalizedCollection);
    if (this.normalizedCollections.get(name)?.get(undefined as any)) {
      throw new Error(`Collection ${name} contains an item with undefined id`);
    }
    this.collections.set(name, {
      idKey: idKey,
      data: [...(data || [])],
    });
  }

  private getView<K extends Value[]>(
    options: ViewOptions
  ): (
    ...args: {
      [Property in keyof K]: Value;
    }
  ) => any[] {
    const alreadyPresentViews = getAlreadyPresentViews(this.views, options);
    if (alreadyPresentViews) {
      return alreadyPresentViews;
    }
    const keys = options.keys;
    const idKey = this.collections.get(options.collection)?.idKey;
    for (let join of options.joins || []) {
      if (!this.collections.has(join.collection)) {
        throw new Error(`Collection ${join.collection} not found`);
      }
      if (!this.references.has(options.collection)) {
        this.references.set(options.collection, new Map());
      }
      if (!this.references.get(options.collection)!.has(join.key)) {
        this.references.get(options.collection)!.set(join.key, new Map());
        for (const item of this.collections.get(options.collection)!.data) {
          addReference(
            this.references.get(options.collection)!.get(join.key)!,
            item,
            join.key,
            idKey
          );
        }
      }
    }

    const pathToGroup: {
      [key: string]: (value: Value) => Value | undefined | null;
    } = {};
    options.groupings?.forEach((grouping) => {
      const cache: Map<Value, Value> = new Map();
      pathToGroup[grouping.key] = (value) => {
        if (value === null || value === undefined) {
          return value;
        }
        if (!cache.has(value)) {
          cache.set(value, grouping.groupingFunction(value));
        }
        return cache.get(value);
      };
    });
    const getPath: (item: any) => Value[] | null = getPathGetter(
      keys,
      options.groupings,
      pathToGroup
    );
    const joinAndTransform = getJoinAndTransform(
      options.joins,
      options.transformation,
      idKey as string,
      this.normalizedCollections
    );
    const data: Map<Value, any> = new Map();
    group(
      data,
      this.collections.get(options.collection)!.data,
      joinAndTransform,
      getPath
    );
    let view: (...args: Value[]) => any;
    const argumentToGroupsMap = {};
    options.groupings?.forEach((grouping) => {
      if (!grouping.useGroupsAsParameter) {
        argumentToGroupsMap[grouping.key] = pathToGroup[grouping.key];
      }
    });
    if (options.returnSingleItemWithoutGrouping) {
      view = getSingleItemGetter(data, keys) as (...args: Value[]) => any;
    } else {
      if (Object.keys(argumentToGroupsMap).length > 0) {
        view = getGetterWithGrouping(data, keys, argumentToGroupsMap) as (
          ...args: Value[]
        ) => any[];
      } else {
        view = getGetter(data, keys);
      }
    }
    const newView: View = {
      collection: options.collection,
      isInitialized: this.collections.get(options.collection)!.data.length > 0,
      transformation: options.transformation,
      groupings: options.groupings,
      joins: options.joins,
      joinAndTransform,
      keys,
      data,
      view: view,
      getPath,
    };
    this.views.push(newView);
    return view;
  }

  public update(updates: Update[]) {
    const mutations: {
      collection: string;
      added: any[];
      edited: { updated: any; prev: any }[];
      deleted: any[];
    }[] = updates.map((update) => {
      const added: any[] = [];
      const deleted: any[] = [];
      const edited: { updated: any; prev: any }[] = [];
      const collection = this.collections.get(update.collection)!.data;
      const idKey = this.collections.get(update.collection)!.idKey;
      const normalizedCollection = this.normalizedCollections.get(
        update.collection
      )!;
      for (const t of update.data) {
        const existing = normalizedCollection.get(t[idKey]);
        if (!existing) {
          added.push(t);
        } else if (!equal(existing, t)) {
          edited.push({ updated: t, prev: existing });
        }
      }
      if (update.data.length !== collection.length + added.length) {
        const normalizedNewData = new Map<string, any>();
        update.data.forEach((t) => normalizedNewData.set(t[idKey], true));
        for (const t of collection) {
          if (!normalizedNewData.has(t[idKey])) {
            deleted.push(t);
          }
        }
      }
      return {
        collection: update.collection,
        added,
        edited,
        deleted,
      };
    });
    this.updateCollections(mutations);
    this.updateViews(mutations);
  }

  private updateCollections(
    mutations: {
      collection: string;
      added: any[];
      edited: { updated: any; prev: any }[];
      deleted: any[];
    }[]
  ) {
    for (const mutation of mutations) {
      const idKey = this.collections.get(mutation.collection)!.idKey;
      const normalizedData = this.normalizedCollections.get(
        mutation.collection
      )!;
      const references = this.references.get(mutation.collection);

      // Handle deleted
      if (mutation.deleted.length > 0) {
        for (const t of mutation.deleted) {
          normalizedData.delete(t[idKey]);
          if (references) {
            for (const [ref, val] of references!) {
              deleteReference(val, t, ref, idKey);
            }
          }
        }
        const deleted = normalize(mutation.deleted, idKey);
        this.collections.get(mutation.collection)!.data = this.collections
          .get(mutation.collection)!
          .data.filter((item) => !deleted[item[idKey]]);
      }

      // Handle edited
      if (mutation.edited.length > 0) {
        for (const t of mutation.edited) {
          normalizedData.set(t.prev[idKey], t.updated);
          if (references) {
            for (const [ref, val] of references!) {
              if (t.updated[ref] !== t.prev[ref])
                deleteReference(val, t.prev, ref, idKey);
              addReference(val, t.updated, ref, idKey);
            }
          }
        }
        const edited = normalizeAfterProp(mutation.edited, "prev", idKey);
        this.collections.get(mutation.collection)!.data = this.collections
          .get(
            mutation.collection
            // TODO: optimize
          )!
          .data.map((item) =>
            edited[item[idKey]] ? edited[item[idKey]].updated : item
          );
      }

      // Handle added
      if (mutation.added.length > 0) {
        const collection = this.collections.get(mutation.collection)!.data;
        for (const t of mutation.added) {
          collection.push(t);
          normalizedData.set(t[idKey], t);
          if (references) {
            for (const [ref, val] of references!) {
              addReference(val, t, ref, idKey);
            }
          }
        }
      }
    }
  }

  private updateViews(
    mutations: {
      collection: string;
      added: any[];
      edited: { updated: any; prev: any }[];
      deleted: any[];
    }[]
  ) {
    for (const view of this.views) {
      if (!view.isInitialized) {
        const ts = this.collections.get(view.collection)!.data;
        if (ts.length > 0) {
          group(
            view.data,
            this.collections.get(view.collection)!.data,
            view.joinAndTransform,
            view.getPath
          );
          view.isInitialized = true;
        }
      } else {
        const ownIdKey = this.collections.get(view.collection)!.idKey;
        const references = this.references.get(view.collection);
        let ownMutation:
          | {
              collection: string;
              added: any[];
              edited: { updated: any; prev: any }[];
              deleted: any[];
            }
          | undefined;
        const toBeCheckedForChanges: Map<string, true> = new Map();
        for (const mutation of mutations) {
          if (mutation.collection === view.collection) {
            ownMutation = mutation;
          } else if (references) {
            const keysToRefs = view.joins
              ?.filter((join) => join.collection === mutation.collection)
              ?.map((join) => join.key);
            for (const keyToRef of keysToRefs || []) {
              const refs = references.get(keyToRef);
              if (refs) {
                const foreignIdKey = this.collections.get(
                  mutation.collection
                )!.idKey;
                for (const t of mutation.added) {
                  if (refs.has(t[foreignIdKey])) {
                    for (const ownId of refs.get(t[foreignIdKey])!.keys()) {
                      toBeCheckedForChanges.set(ownId, true);
                    }
                  }
                }
                for (const t of mutation.edited) {
                  if (refs.has(t.prev[foreignIdKey])) {
                    for (const ownId of refs
                      .get(t.prev[foreignIdKey])!
                      .keys()) {
                      toBeCheckedForChanges.set(ownId, true);
                    }
                  }
                }
                for (const t of mutation.deleted) {
                  if (refs.has(t[foreignIdKey])) {
                    for (const ownId of refs.get(t[foreignIdKey])!.keys()) {
                      toBeCheckedForChanges.set(ownId, true);
                    }
                  }
                }
              }
            }
          }
        }

        // Handle own Collection
        const deleted: Map<Value, any> = new Map();
        if (ownMutation) {
          for (const t of ownMutation.deleted) {
            toBeCheckedForChanges.delete(t[ownIdKey]);
            const path = view.getPath(t);
            if (path) {
              collectMutationsRecursively(deleted, path, t, t[ownIdKey]);
            }
          }
          const added: Map<Value, any> = new Map();
          const edited: Map<Value, any> = new Map();
          for (const t of ownMutation.edited) {
            const prevPath = view.getPath(t.prev);
            const updatedPath = view.getPath(t.updated);
            toBeCheckedForChanges.delete(t.prev[ownIdKey]);
            if (equal(prevPath, updatedPath)) {
              if (prevPath) {
                collectMutationsRecursively(
                  edited,
                  prevPath,
                  t.updated,
                  t.prev[ownIdKey]
                );
              }
            } else {
              if (prevPath) {
                collectMutationsRecursively(
                  deleted,
                  prevPath,
                  t.prev,
                  t.prev[ownIdKey]
                );
              }
              if (updatedPath) {
                collectMutationsRecursively(
                  added,
                  updatedPath,
                  view.joinAndTransform(t.updated),
                  t.updated[ownIdKey]
                );
              }
            }
          }
          for (const t of ownMutation.added) {
            const path = view.getPath(t);
            if (path) {
              collectMutationsRecursively(
                added,
                path,
                view.joinAndTransform(t),
                t[ownIdKey]
              );
            }
          }
          unwrapMutationsRecursively(
            deleted,
            view.keys.length,
            [],
            (keysAndTs, path) => {
              deleteRecursivelyAll(view.data, path, keysAndTs, ownIdKey);
            }
          );
          unwrapMutationsRecursively(
            edited,
            view.keys.length,
            [],
            mutateIfChanged(view.joinAndTransform, view.data, ownIdKey)
          );
          unwrapMutationsRecursively(
            added,
            view.keys.length,
            [],
            (keysAndTs, path) => {
              addRecursivelyAll(
                view.data,
                path,
                Array.from(keysAndTs.values())
              );
            }
          );
        }

        // Go through all items that might have changed
        const mutatedTs: Map<Value, any> = new Map();
        for (const id of toBeCheckedForChanges.keys()) {
          const t = this.normalizedCollections.get(view.collection)!.get(id);
          const path = view.getPath(t);
          if (path) {
            collectMutationsRecursively(mutatedTs, path, t, id);
          }
        }
        unwrapMutationsRecursively(
          mutatedTs,
          view.keys.length,
          [],
          mutateIfChanged(view.joinAndTransform, view.data, ownIdKey)
        );
      }
    }
  }

  public view = (collection: string) => {
    return {
      keys: <K extends string[]>(...keys: K) => {
        if (keys.indexOf(this.collections.get(collection)!.idKey) > -1) {
          throw new Error("An id cannot be a view key. Use byId instead.");
        }
        const options: ViewOptions = { collection, keys };

        const get = (): ((
          ...args: {
            [Property in keyof K]: string | number | boolean;
          }
        ) => any[]) => {
          return this.getView(options);
        };

        const join = (collection: string, key: string) => {
          options.joins = [...(options.joins || []), { collection, key }];
          return builder;
        };

        const transform = (transform: (item: any) => any) => {
          options.transformation = transform;
          return builder;
        };

        const group = (
          key: string,
          groupingFunction: (valueOfProp: Value) => Value,
          useGroupsAsParameter: boolean = true
        ) => {
          options.groupings = [
            ...(options.groupings || []),
            { key, groupingFunction, useGroupsAsParameter },
          ];
          return builder;
        };

        const builder = {
          join,
          transform,
          group,
          get,
        };

        return builder;
      },
    };
  };

  public byId = (collection: string) => {
    const options: ViewOptions = {
      collection,
      keys: [this.collections.get(collection)!.idKey],
      returnSingleItemWithoutGrouping: true,
    };

    const get = (): ((id: string | number | boolean) => any) => {
      return this.getView(options);
    };

    const join = (collection: string, key: string) => {
      options.joins = [...(options.joins || []), { collection, key }];
      return builder;
    };

    const transform = (transform: (item: any) => any) => {
      options.transformation = transform;
      return builder;
    };

    const builder = {
      join,
      transform,
      get,
    };

    return builder;
  };
}

function addReference(
  refs: Map<string, Map<string, true>>,
  item,
  joinKey,
  ownIdKey
) {
  if (item[joinKey]) {
    if (Array.isArray(item[joinKey])) {
      for (const ref of item[joinKey]) {
        if (ref) {
          addSingleReference(refs, ref, item[ownIdKey]);
        }
      }
    } else {
      addSingleReference(refs, item[joinKey], item[ownIdKey]);
    }
  }
}

function addSingleReference(
  refs: Map<string, Map<string, true>>,
  foreignRef,
  ownId
) {
  if (!refs.has(foreignRef)) {
    refs.set(foreignRef, new Map());
  }
  refs.get(foreignRef)!.set(ownId, true);
}

function deleteReference(
  refs: Map<string, Map<string, true>>,
  item,
  joinKey,
  ownIdKey
) {
  if (item[joinKey]) {
    if (Array.isArray(item[joinKey])) {
      for (const ref of item[joinKey]) {
        if (ref) {
          deleteSingleReference(refs, ref, item[ownIdKey]);
        }
      }
    } else {
      deleteSingleReference(refs, item[joinKey], item[ownIdKey]);
    }
  }
}

function deleteSingleReference(
  refs: Map<string, Map<string, true>>,
  foreignRef,
  ownId
) {
  if (refs.get(foreignRef)!.size === 1) {
    refs.delete(foreignRef);
  } else {
    refs.get(foreignRef)!.delete(ownId);
  }
}

function mutateIfChanged(joinAndtransform, data: Map<Value, any>, ownIdKey) {
  return function (keysAndTs, path) {
    const obj = getObjectAtLevel(data, path, 1);
    let updated: number = 0;
    function updateOrNot(item, updatedItem) {
      if (equal(item, updatedItem)) {
        return item;
      } else {
        updated++;
        return updatedItem;
      }
    }
    const updatedItems = obj
      .get(path[path.length - 1])
      .map((item) =>
        keysAndTs.has(item[ownIdKey])
          ? updateOrNot(item, joinAndtransform(keysAndTs.get(item[ownIdKey])))
          : item
      );
    if (updated > 0) {
      obj.set(path[path.length - 1], updatedItems);
    }
  };
}

function getObjectAtLevel(data: Map<Value, any>, path, targetLevel) {
  if (path.length === targetLevel) {
    return data;
  }
  return getObjectAtLevel(data.get(path[0]), path.slice(1), targetLevel);
}

function addRecursivelyAll(
  data: Map<Value, any>,
  path: string[],
  value: any[]
) {
  if (path.length === 1) {
    if (!data.has(path[0])) {
      data.set(path[0], value);
    } else {
      data.set(path[0], [...data.get(path[0]), ...value]);
    }
    return;
  }
  if (!data.has(path[0])) {
    data.set(path[0], new Map());
  }
  addRecursivelyAll(data.get(path[0]), path.slice(1), value);
}

function deleteRecursivelyAll(
  data: Map<Value, any>,
  path: string[],
  values: Map<Value, any>,
  idKey
) {
  if (path.length === 1) {
    if (!data.has(path[0])) {
      console.error("Cannot find path to delete");
    } else {
      data.set(
        path[0],
        data.get(path[0]).filter((item) => !values.has(item[idKey]))
      );
      if (data.get(path[0]).length === 0) {
        data.delete(path[0]);
        return true;
      }
    }
    return false;
  }
  if (!data.has(path[0])) {
    console.error("Cannot find path to delete");
    return false;
  }
  if (deleteRecursivelyAll(data.get(path[0]), path.slice(1), values, idKey)) {
    if (data.get(path[0]).size === 0) {
      data.delete(path[0]);
      return true;
    }
  }
  return false;
}

function collectMutationsRecursively(
  data: Map<Value, any>,
  path: Value[],
  value: any,
  id: string
) {
  if (path.length === 1) {
    if (!data.has(path[0])) {
      const map = new Map();
      map.set(id, value);
      data.set(path[0], map);
    } else {
      data.get(path[0])!.set(id, value);
    }
    return;
  }
  if (!data.has(path[0])) {
    data.set(path[0], new Map());
  }
  collectMutationsRecursively(data.get(path[0]), path.slice(1), value, id);
}

function unwrapMutationsRecursively(
  changes,
  level,
  path,
  callback: (keysAndTs, path) => any
) {
  if (level === 0) {
    callback(changes, path);
    return;
  }
  for (const key of changes.keys()) {
    unwrapMutationsRecursively(
      changes.get(key),
      level - 1,
      [...path, key],
      callback
    );
  }
}

export default Cruncher;
