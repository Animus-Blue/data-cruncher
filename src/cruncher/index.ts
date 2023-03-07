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

export interface Join {
  collection: string;
  key: string;
}

export interface Grouping {
  key: string;
  groupingFunction: (value: string | number) => string | number;
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
  keys: (string | number)[];
  data: any;
  getPath: (item: any) => (string | number)[] | null;
  view: (...args: (string | number | boolean)[]) => any;
}

class Cruncher {
  private views: View[] = [];
  private normalizedCollections: {
    [collection: string]: Map<string | number, any>;
  };
  private collections: { [collection: string]: { idKey: string; data: any[] } };
  private references: {
    [refHolderCollection: string]: {
      [referencedCollection: string]: {
        [referencedCollectionId: string]: { [refHolderId: string]: true };
      };
    };
  };

  constructor() {
    this.normalizedCollections = {};
    this.collections = {};
    this.references = {};
  }

  public addCollection(name: string, idKey: string, data?: any[]): void {
    const normalizedCollection = new Map<string, any>();
    data?.forEach((t) => normalizedCollection.set(t[idKey], t));
    this.normalizedCollections[name] = normalizedCollection;
    if (this.normalizedCollections[name].get(undefined as any)) {
      throw new Error(`Collection ${name} contains an item with undefined id`);
    }
    this.collections[name] = {
      idKey: idKey,
      data: [...(data || [])],
    };
  }

  private getView<K extends (string | number)[]>(
    options: ViewOptions
  ): (
    ...args: {
      [Property in keyof K]: string | number | boolean;
    }
  ) => any[] {
    const alreadyPresentViews = getAlreadyPresentViews(this.views, options);
    if (alreadyPresentViews) {
      return alreadyPresentViews;
    }
    const keys = options.keys;
    const idKey = this.collections[options.collection].idKey;
    for (let join of options.joins || []) {
      if (!this.collections[join.collection]) {
        throw new Error(`Collection ${join.collection} not found`);
      }
      if (!this.references[options.collection]?.[join.key]) {
        if (!this.references[options.collection]) {
          this.references[options.collection] = {};
        }
        this.references[options.collection][join.key] = {};
        for (const item of this.collections[options.collection].data) {
          addReference(
            this.references[options.collection][join.key],
            item,
            join.key,
            idKey
          );
        }
      }
    }

    const pathToGroup = {};
    options.groupings?.forEach((grouping) => {
      const cache = {};
      pathToGroup[grouping.key] = (value) => {
        if (value === null || value === undefined) {
          return value;
        }
        if (!cache[value]) {
          cache[value] = grouping.groupingFunction(value);
        }
        return cache[value];
      };
    });
    const getPath: (item: any) => (string | number)[] | null = getPathGetter(
      keys,
      options.groupings,
      pathToGroup
    );
    const joinAndTransform = getJoinAndTransform(
      options.joins,
      options.transformation,
      idKey,
      this.normalizedCollections
    );
    const data: any = {};
    group(
      data,
      this.collections[options.collection].data,
      joinAndTransform,
      getPath
    );
    let view: (...args: (string | number | boolean)[]) => any;
    const argumentToGroupsMap = {};
    options.groupings?.forEach((grouping) => {
      if (!grouping.useGroupsAsParameter) {
        argumentToGroupsMap[grouping.key] = pathToGroup[grouping.key];
      }
    });
    if (options.returnSingleItemWithoutGrouping) {
      view = getSingleItemGetter(data, keys) as (
        ...args: (string | number | boolean)[]
      ) => any;
    } else {
      if (Object.keys(argumentToGroupsMap).length > 0) {
        view = getGetterWithGrouping(data, keys, argumentToGroupsMap) as (
          ...args: (string | number | boolean)[]
        ) => any[];
      } else {
        view = getGetter(data, keys) as (
          ...args: (string | number | boolean)[]
        ) => any[];
      }
    }
    const newView: View = {
      collection: options.collection,
      isInitialized: this.collections[options.collection].data.length > 0,
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
      const collection = this.collections[update.collection].data;
      const idKey = this.collections[update.collection].idKey;
      const normalizedCollection =
        this.normalizedCollections[update.collection];
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
      const idKey = this.collections[mutation.collection].idKey;
      const normalizedData = this.normalizedCollections[mutation.collection];
      const references = this.references[mutation.collection];

      // Handle deleted
      if (mutation.deleted.length > 0) {
        for (const t of mutation.deleted) {
          normalizedData.delete(t[idKey]);
          for (const ref in references) {
            deleteReference(references[ref], t, ref, idKey);
          }
        }
        const deleted = normalize(mutation.deleted, idKey);
        this.collections[mutation.collection].data = this.collections[
          mutation.collection
        ].data.filter((item) => !deleted[item[idKey]]);
      }

      // Handle edited
      if (mutation.edited.length > 0) {
        for (const t of mutation.edited) {
          normalizedData.set(t.prev[idKey], t.updated);
          for (const ref in references) {
            if (t.updated[ref] !== t.prev[ref])
              deleteReference(references[ref], t.prev, ref, idKey);
            addReference(references[ref], t.updated, ref, idKey);
          }
        }
        const edited = normalizeAfterProp(mutation.edited, "prev", idKey);
        this.collections[mutation.collection].data = this.collections[
          mutation.collection
          // TODO: optimize
        ].data.map((item) =>
          edited[item[idKey]] ? edited[item[idKey]].updated : item
        );
      }

      // Handle added
      if (mutation.added.length > 0) {
        const collection = this.collections[mutation.collection].data;
        for (const t of mutation.added) {
          normalizedData.set(t[idKey], t);
          collection.push(t);
          for (const ref in references) {
            addReference(references[ref], t, ref, idKey);
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
        const ts = this.collections[view.collection].data;
        if (ts.length > 0) {
          group(
            view.data,
            this.collections[view.collection].data,
            view.joinAndTransform,
            view.getPath
          );
          view.isInitialized = true;
        }
      } else {
        const ownIdKey = this.collections[view.collection].idKey;
        const references = this.references[view.collection];
        let ownMutation:
          | {
              collection: string;
              added: any[];
              edited: { updated: any; prev: any }[];
              deleted: any[];
            }
          | undefined;
        const toBeCheckedForChanges: { [id: string]: true } = {};
        for (const mutation of mutations) {
          if (mutation.collection === view.collection) {
            ownMutation = mutation;
          } else if (references) {
            const keysToRefs = view.joins
              ?.filter((join) => join.collection === mutation.collection)
              ?.map((join) => join.key);
            for (const keyToRef of keysToRefs || []) {
              const refs = references[keyToRef];
              if (refs) {
                const foreignIdKey =
                  this.collections[mutation.collection].idKey;
                for (const t of mutation.added) {
                  if (refs[t[foreignIdKey]]) {
                    for (const ownId in refs[t[foreignIdKey]]) {
                      toBeCheckedForChanges[ownId] = true;
                    }
                  }
                }
                for (const t of mutation.edited) {
                  if (refs[t.prev[foreignIdKey]]) {
                    for (const ownId in refs[t.prev[foreignIdKey]]) {
                      toBeCheckedForChanges[ownId] = true;
                    }
                  }
                }
                for (const t of mutation.deleted) {
                  if (refs[t[foreignIdKey]]) {
                    for (const ownId in refs[t[foreignIdKey]]) {
                      toBeCheckedForChanges[ownId] = true;
                    }
                  }
                }
              }
            }
          }
        }

        // Handle own Collection
        const deleted: any = {};
        if (ownMutation) {
          for (const t of ownMutation.deleted) {
            delete toBeCheckedForChanges[t[ownIdKey]];
            const path = view.getPath(t);
            if (path) {
              collectMutationsRecursively(deleted, path, t, t[ownIdKey]);
            }
          }
          const added: any = {};
          const edited: any = {};
          for (const t of ownMutation.edited) {
            const prevPath = view.getPath(t.prev);
            const updatedPath = view.getPath(t.updated);
            delete toBeCheckedForChanges[t.prev[ownIdKey]];
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
              addRecursivelyAll(view.data, path, Object.values(keysAndTs));
            }
          );
        }

        // Go through all items that might have changed
        const mutatedTs: any = {};
        for (const id in toBeCheckedForChanges) {
          const t = this.normalizedCollections[view.collection].get(id);
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
        if (keys.indexOf(this.collections[collection].idKey) > -1) {
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

        const join = (collection, key) => {
          options.joins = [...(options.joins || []), { collection, key }];
          return builder;
        };

        const transform = (transform: (item: any) => any) => {
          options.transformation = transform;
          return builder;
        };

        const group = (
          key: string,
          groupingFunction: (value: string | number) => string | number,
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
      keys: [this.collections[collection].idKey],
      returnSingleItemWithoutGrouping: true,
    };

    const get = (): ((id: string | number) => any) => {
      return this.getView(options);
    };

    const join = (collection, key) => {
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
  refs: { [foreignId: string]: { [ownId: string]: true } },
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
  refs: { [foreignId: string]: { [ownId: string]: true } },
  foreignRef,
  ownId
) {
  if (!refs[foreignRef]) {
    refs[foreignRef] = {};
  }
  refs[foreignRef][ownId] = true;
}

function deleteReference(
  refs: { [foreignId: string]: { [ownId: string]: true } },
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

function deleteSingleReference(refs, foreignRef, ownId) {
  if (Object.keys(refs[foreignRef]).length === 1) {
    delete refs[foreignRef];
  } else {
    delete refs[foreignRef][ownId];
  }
}

function mutateIfChanged(joinAndtransform, data, ownIdKey) {
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
    const updatedItems = obj[path[path.length - 1]].map((item) =>
      keysAndTs[item[ownIdKey]]
        ? updateOrNot(item, joinAndtransform(keysAndTs[item[ownIdKey]]))
        : item
    );
    if (updated > 0) {
      obj[path[path.length - 1]] = updatedItems;
    }
  };
}

function getObjectAtLevel(data, path, targetLevel) {
  if (path.length === targetLevel) {
    return data;
  }
  return getObjectAtLevel(data[path[0]], path.slice(1), targetLevel);
}

function addRecursivelyAll(data: any, path: string[], value: any[]) {
  if (path.length === 1) {
    if (!data[path[0]]) {
      data[path[0]] = value;
    } else {
      data[path[0]] = [...data[path[0]], ...value];
    }
    return;
  }
  if (!data[path[0]]) {
    data[path[0]] = {};
  }
  addRecursivelyAll(data[path[0]], path.slice(1), value);
}

function deleteRecursivelyAll(
  data: any,
  path: string[],
  values: { [id: string]: any },
  idKey
) {
  if (path.length === 1) {
    if (!data[path[0]]) {
      console.error("Cannot find path to delete");
    } else {
      data[path[0]] = data[path[0]].filter((item) => !values[item[idKey]]);
      if (data[path[0]].length === 0) {
        delete data[path[0]];
        return true;
      }
    }
    return false;
  }
  if (!data[path[0]]) {
    console.error("Cannot find path to delete");
    return false;
  }
  if (deleteRecursivelyAll(data[path[0]], path.slice(1), values, idKey)) {
    if (Object.keys(data[path[0]]).length === 0) {
      delete data[path[0]];
      return true;
    }
  }
  return false;
}

function collectMutationsRecursively(
  data: any,
  path: (string | number)[],
  value: any,
  id: string
) {
  if (path.length === 1) {
    if (!data[path[0]]) {
      data[path[0]] = { [id]: value };
    } else {
      data[path[0]][id] = value;
    }
    return;
  }
  if (!data[path[0]]) {
    data[path[0]] = {};
  }
  collectMutationsRecursively(data[path[0]], path.slice(1), value, id);
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
  for (const key in changes) {
    unwrapMutationsRecursively(
      changes[key],
      level - 1,
      [...path, key],
      callback
    );
  }
}

export default Cruncher;
