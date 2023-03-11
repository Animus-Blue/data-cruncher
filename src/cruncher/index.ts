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

interface CollectionMutation {
  deleted: boolean;
  prev: any;
  updated?: any;
}

export interface Join {
  collection: string;
  property: string;
}

export interface Grouping {
  property: string;
  groupingFunction: (value: Value) => Value;
  useGroupsAsParameter: boolean;
}

export interface ViewOptions {
  collection: string;
  properties: string[];
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
  properties: string[];
  data: Map<Value, any>;
  getPath: (item: any) => Value[] | null;
  view: (...args: Value[]) => any;
}

class Cruncher {
  private views: View[] = [];
  private normalizedCollections: Map<string, Map<Value, any>>;
  private collections: Map<string, { idProperty: string; data: any[] }>;
  private references: Map<string, Map<string, Map<string, Map<string, true>>>>;

  constructor() {
    this.normalizedCollections = new Map();
    this.collections = new Map();
    this.references = new Map();
  }

  public addCollection(name: string, idProperty: string, data?: any[]): void {
    const normalizedCollection = new Map<Value, any>();
    data?.forEach((t) => normalizedCollection.set(t[idProperty], t));
    this.normalizedCollections.set(name, normalizedCollection);
    if (this.normalizedCollections.get(name)?.get(undefined as any)) {
      throw new Error(`Collection ${name} contains an item with undefined id`);
    }
    this.collections.set(name, {
      idProperty,
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
    const properties = options.properties;
    const idProperty = this.collections.get(options.collection)?.idProperty;
    for (let join of options.joins || []) {
      if (!this.collections.has(join.collection)) {
        throw new Error(`Collection ${join.collection} not found`);
      }
      if (!this.references.has(options.collection)) {
        this.references.set(options.collection, new Map());
      }
      if (!this.references.get(options.collection)!.has(join.property)) {
        this.references.get(options.collection)!.set(join.property, new Map());
        for (const item of this.collections.get(options.collection)!.data) {
          addReference(
            this.references.get(options.collection)!.get(join.property)!,
            item,
            join.property,
            idProperty
          );
        }
      }
    }

    const pathToGroup: {
      [property: string]: (value: Value) => Value | undefined | null;
    } = {};
    options.groupings?.forEach((grouping) => {
      const cache: Map<Value, Value> = new Map();
      pathToGroup[grouping.property] = (value) => {
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
      properties,
      options.groupings,
      pathToGroup
    );
    const joinAndTransform = getJoinAndTransform(
      options.joins,
      options.transformation,
      idProperty as string,
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
        argumentToGroupsMap[grouping.property] = pathToGroup[grouping.property];
      }
    });
    if (options.returnSingleItemWithoutGrouping) {
      view = getSingleItemGetter(data, properties) as (...args: Value[]) => any;
    } else {
      if (Object.keys(argumentToGroupsMap).length > 0) {
        view = getGetterWithGrouping(data, properties, argumentToGroupsMap) as (
          ...args: Value[]
        ) => any[];
      } else {
        view = getGetter(data, properties);
      }
    }
    const newView: View = {
      collection: options.collection,
      isInitialized: this.collections.get(options.collection)!.data.length > 0,
      transformation: options.transformation,
      groupings: options.groupings,
      joins: options.joins,
      joinAndTransform,
      properties: properties,
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
      const idProperty = this.collections.get(update.collection)!.idProperty;
      const normalizedCollection = this.normalizedCollections.get(
        update.collection
      )!;
      for (const t of update.data) {
        const existing = normalizedCollection.get(t[idProperty]);
        if (!existing) {
          added.push(t);
        } else if (!equal(existing, t)) {
          edited.push({ updated: t, prev: existing });
        }
      }
      if (update.data.length !== collection.length + added.length) {
        const normalizedNewData = new Map<string, any>();
        update.data.forEach((t) => normalizedNewData.set(t[idProperty], true));
        for (const t of collection) {
          if (!normalizedNewData.has(t[idProperty])) {
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
      const idProperty = this.collections.get(mutation.collection)!.idProperty;
      const normalizedData = this.normalizedCollections.get(
        mutation.collection
      )!;
      const references = this.references.get(mutation.collection);
      const mutations: Map<string, CollectionMutation> = new Map();
      mutation.deleted.forEach((t) => {
        mutations.set(t[idProperty], { deleted: true, prev: t });
      });
      mutation.edited.forEach((t) => {
        mutations.set(t.prev[idProperty], {
          deleted: false,
          prev: t.prev,
          updated: t.updated,
        });
      });
      for (const [id, m] of mutations) {
        if (m.deleted) {
          normalizedData.delete(id);
          if (references) {
            for (const [ref, val] of references!) {
              deleteReference(val, m.prev, ref, idProperty);
            }
          }
        } else {
          normalizedData.set(id, m.updated);
          if (references) {
            for (const [ref, val] of references!) {
              deleteReference(val, m.prev, ref, idProperty);
              addReference(val, m.updated, ref, idProperty);
            }
          }
        }
      }
      const updatedCollection: any[] = [];
      for (const t of this.collections.get(mutation.collection)!.data) {
        if (!mutations.has(t[idProperty])) {
          updatedCollection.push(t);
        } else if (mutations.get(t[idProperty])!.deleted === false) {
          updatedCollection.push(mutations.get(t[idProperty])!.updated);
        }
      }
      this.collections.get(mutation.collection)!.data = updatedCollection;

      // Handle added
      const collection = this.collections.get(mutation.collection)!.data;
      for (const t of mutation.added) {
        collection.push(t);
        normalizedData.set(t[idProperty], t);
        if (references) {
          for (const [ref, val] of references!) {
            addReference(val, t, ref, idProperty);
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
        const ownIdProperty = this.collections.get(view.collection)!.idProperty;
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
            const propertiesToRefs = view.joins
              ?.filter((join) => join.collection === mutation.collection)
              ?.map((join) => join.property);
            for (const propertyToRef of propertiesToRefs || []) {
              const refs = references.get(propertyToRef);
              if (refs) {
                const foreignIdProperty = this.collections.get(
                  mutation.collection
                )!.idProperty;
                for (const t of mutation.added) {
                  if (refs.has(t[foreignIdProperty])) {
                    refs
                      .get(t[foreignIdProperty])!
                      .forEach((_, ownId) =>
                        toBeCheckedForChanges.set(ownId, true)
                      );
                  }
                }
                for (const t of mutation.edited) {
                  if (refs.has(t.prev[foreignIdProperty])) {
                    refs
                      .get(t.prev[foreignIdProperty])!
                      .forEach((_, ownId) =>
                        toBeCheckedForChanges.set(ownId, true)
                      );
                  }
                }
                for (const t of mutation.deleted) {
                  if (refs.has(t[foreignIdProperty])) {
                    refs
                      .get(t[foreignIdProperty])!
                      .forEach((_, ownId) =>
                        toBeCheckedForChanges.set(ownId, true)
                      );
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
            toBeCheckedForChanges.delete(t[ownIdProperty]);
            const path = view.getPath(t);
            if (path) {
              collectMutationsRecursively(deleted, path, t, t[ownIdProperty]);
            }
          }
          const added: Map<Value, any> = new Map();
          const edited: Map<Value, any> = new Map();
          for (const t of ownMutation.edited) {
            const prevPath = view.getPath(t.prev);
            const updatedPath = view.getPath(t.updated);
            toBeCheckedForChanges.delete(t.prev[ownIdProperty]);
            if (equal(prevPath, updatedPath)) {
              if (prevPath) {
                collectMutationsRecursively(
                  edited,
                  prevPath,
                  t.updated,
                  t.prev[ownIdProperty]
                );
              }
            } else {
              if (prevPath) {
                collectMutationsRecursively(
                  deleted,
                  prevPath,
                  t.prev,
                  t.prev[ownIdProperty]
                );
              }
              if (updatedPath) {
                collectMutationsRecursively(
                  added,
                  updatedPath,
                  view.joinAndTransform(t.updated),
                  t.updated[ownIdProperty]
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
                t[ownIdProperty]
              );
            }
          }
          unwrapMutationsRecursively(
            deleted,
            view.properties.length,
            [],
            (valuesToTs, path) => {
              deleteRecursivelyAll(view.data, path, valuesToTs, ownIdProperty);
            }
          );
          unwrapMutationsRecursively(
            edited,
            view.properties.length,
            [],
            mutateIfChanged(view.joinAndTransform, view.data, ownIdProperty)
          );
          unwrapMutationsRecursively(
            added,
            view.properties.length,
            [],
            (valuesToTs, path) => {
              addRecursivelyAll(
                view.data,
                path,
                Array.from(valuesToTs.values())
              );
            }
          );
        }

        // Go through all items that might have changed
        const mutatedTs: Map<Value, any> = new Map();
        toBeCheckedForChanges.forEach((_, id) => {
          const t = this.normalizedCollections.get(view.collection)!.get(id);
          const path = view.getPath(t);
          if (path) {
            collectMutationsRecursively(mutatedTs, path, t, id);
          }
        });
        unwrapMutationsRecursively(
          mutatedTs,
          view.properties.length,
          [],
          mutateIfChanged(view.joinAndTransform, view.data, ownIdProperty)
        );
      }
    }
  }

  public view = (collection: string) => {
    return {
      by: <K extends string[]>(...properties: K) => {
        if (
          properties.indexOf(this.collections.get(collection)!.idProperty) > -1
        ) {
          throw new Error("An id cannot be a view property. Use byId instead.");
        }
        const options: ViewOptions = { collection, properties };

        const get = (): ((
          ...args: {
            [Property in keyof K]: string | number | boolean;
          }
        ) => any[]) => {
          return this.getView(options);
        };

        const join = (collection: string, property: string) => {
          options.joins = [...(options.joins || []), { collection, property }];
          return builder;
        };

        const transform = (transform: (item: any) => any) => {
          options.transformation = transform;
          return builder;
        };

        const group = (
          property: string,
          groupingFunction: (valueOfProp: Value) => Value,
          useGroupsAsParameter: boolean = true
        ) => {
          options.groupings = [
            ...(options.groupings || []),
            { property, groupingFunction, useGroupsAsParameter },
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
      properties: [this.collections.get(collection)!.idProperty],
      returnSingleItemWithoutGrouping: true,
    };

    const get = (): ((id: string | number | boolean) => any) => {
      return this.getView(options);
    };

    const join = (collection: string, property: string) => {
      options.joins = [...(options.joins || []), { collection, property }];
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
  joinProperty,
  ownIdProperty
) {
  if (item[joinProperty]) {
    if (Array.isArray(item[joinProperty])) {
      for (const ref of item[joinProperty]) {
        if (ref) {
          addSingleReference(refs, ref, item[ownIdProperty]);
        }
      }
    } else {
      addSingleReference(refs, item[joinProperty], item[ownIdProperty]);
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
  joinProperty,
  ownIdProperty
) {
  if (item[joinProperty]) {
    if (Array.isArray(item[joinProperty])) {
      for (const ref of item[joinProperty]) {
        if (ref) {
          deleteSingleReference(refs, ref, item[ownIdProperty]);
        }
      }
    } else {
      deleteSingleReference(refs, item[joinProperty], item[ownIdProperty]);
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

function mutateIfChanged(
  joinAndtransform,
  data: Map<Value, any>,
  ownIdProperty
) {
  return function (valuesToTs, path) {
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
        valuesToTs.has(item[ownIdProperty])
          ? updateOrNot(
              item,
              joinAndtransform(valuesToTs.get(item[ownIdProperty]))
            )
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
  idProperty
) {
  if (path.length === 1) {
    if (!data.has(path[0])) {
      console.error("Cannot find path to delete");
    } else {
      data.set(
        path[0],
        data.get(path[0]).filter((item) => !values.has(item[idProperty]))
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
  if (
    deleteRecursivelyAll(data.get(path[0]), path.slice(1), values, idProperty)
  ) {
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
  callback: (valuesToTs, path) => any
) {
  if (level === 0) {
    callback(changes, path);
    return;
  }
  changes.forEach((_, key) => {
    unwrapMutationsRecursively(
      changes.get(key),
      level - 1,
      [...path, key],
      callback
    );
  });
}

export default Cruncher;
