import { getGetter, getJoinAndTransform, getSingleItemGetter } from "./utils";
import equal from "../transformations/equal";
import { getAlreadyPresentViews } from "./verifyViews";
import create from "../view/create";
import getDeleteFromView from "../view/delete";
import getAddToView from "../view/add";
import getRefresh from "../view/refresh";
import { pathGetter } from "../view/utils";

export type Value = string | number | boolean;

interface Mutation {
  collection: string;
  added: any[];
  mutations: Map<string, { deleted: boolean; prev: any; updated?: any }>;
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
  properties: (string | ((item: any) => string | number | boolean))[];
  joins?: Join[];
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
  joins?: Join[];
  joinAndTransform: (item: any) => any;
  properties: (string | ((item: any) => string | number | boolean))[];
  data: Map<Value, any>;
  getPath: (item: any) => Value[] | null;
  view: (...args: Value[]) => any;
  deleteFromView: (deleteList: Map<string, any>) => void;
  addToView: (addList: any[], additionalAddList: any[]) => void;
  refresh: (refreshList: Map<string, any>) => void;
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
    const getPath: (item: any) => Value[] | null = pathGetter(properties);
    // TODO: make optional
    const joinAndTransform = getJoinAndTransform(
      options.joins,
      options.transformation,
      idProperty as string,
      this.normalizedCollections
    );
    const data: Map<Value, any> = new Map();
    create(
      data,
      this.collections.get(options.collection)!.data,
      options.properties,
      joinAndTransform
    );
    let view: (...args: Value[]) => any;

    if (options.returnSingleItemWithoutGrouping) {
      view = getSingleItemGetter(data, properties) as (...args: Value[]) => any;
    } else {
      view = getGetter(data, properties);
    }
    const refresh = getRefresh(data, properties, idProperty!, joinAndTransform);
    const newView: View = {
      collection: options.collection,
      isInitialized: this.collections.get(options.collection)!.data.length > 0,
      transformation: options.transformation,
      joins: options.joins,
      joinAndTransform,
      properties: properties,
      data,
      view: view,
      getPath,
      deleteFromView: getDeleteFromView(data, properties, idProperty!),
      addToView: getAddToView(data, properties, joinAndTransform),
      refresh,
    };
    this.views.push(newView);
    return view;
  }

  public update(updates: Update[]) {
    const mutations: Mutation[] = updates.map((update) => {
      const mutation: Mutation = {
        collection: update.collection,
        added: [],
        mutations: new Map(),
      };
      const added = mutation.added;
      const mutations = mutation.mutations;
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
          mutations.set(t[idProperty], {
            deleted: false,
            updated: t,
            prev: existing,
          });
        }
      }
      if (update.data.length !== collection.length + added.length) {
        const normalizedNewData = new Map<string, any>();
        update.data.forEach((t) => normalizedNewData.set(t[idProperty], true));
        for (const t of collection) {
          if (!normalizedNewData.has(t[idProperty])) {
            mutations.set(t[idProperty], { deleted: true, prev: t });
          }
        }
      }
      return mutation;
    });
    this.updateCollections(mutations);
    this.updateViews(mutations);
  }

  private updateCollections(mutations: Mutation[]) {
    for (const mutation of mutations) {
      const idProperty = this.collections.get(mutation.collection)!.idProperty;
      const normalizedData = this.normalizedCollections.get(
        mutation.collection
      )!;
      const references = this.references.get(mutation.collection);
      const mutations = mutation.mutations;
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

  private updateViews(mutations: Mutation[]) {
    for (const view of this.views) {
      if (!view.isInitialized) {
        const ts = this.collections.get(view.collection)!.data;
        if (ts.length > 0) {
          create(
            view.data,
            this.collections.get(view.collection)!.data,
            view.properties,
            view.joinAndTransform
          );
          view.isInitialized = true;
        }
      } else {
        const references = this.references.get(view.collection);
        const normalizedCollection = this.normalizedCollections.get(
          view.collection
        )!;
        let ownMutation: Mutation | undefined;
        const refreshList: Map<string, any> = new Map();
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
                let currentRef: any;
                for (const t of mutation.added) {
                  currentRef = refs.get(t[foreignIdProperty]);
                  if (currentRef !== undefined) {
                    currentRef.forEach((_, ownId) =>
                      refreshList.set(ownId, normalizedCollection.get(ownId))
                    );
                  }
                }
                for (const [id] of mutation.mutations) {
                  currentRef = refs.get(id);
                  if (currentRef !== undefined) {
                    currentRef.forEach((_, ownId) =>
                      refreshList.set(ownId, normalizedCollection.get(ownId))
                    );
                  }
                }
              }
            }
          }
        }

        // Handle own Collection
        const deletedList: Map<string, any> = new Map();
        if (ownMutation) {
          const added: any[] = [];
          for (const [id, singleMutation] of ownMutation.mutations) {
            refreshList.delete(id);
            if (singleMutation.deleted) {
              deletedList.set(id, singleMutation.prev);
            } else {
              const prevPath = view.getPath(singleMutation.prev);
              const updatedPath = view.getPath(singleMutation.updated);
              if (equal(prevPath, updatedPath)) {
                if (prevPath) {
                  refreshList.set(id, singleMutation.updated);
                }
              } else {
                if (prevPath) {
                  deletedList.set(id, singleMutation.prev);
                }
                if (updatedPath) {
                  added.push(singleMutation.updated);
                }
              }
            }
          }

          view.deleteFromView(deletedList);
          view.addToView(ownMutation.added, added);
        }

        if (refreshList.size > 0) {
          view.refresh(refreshList);
        }
      }
    }
  }

  public view = (collection: string) => {
    return {
      by: <K extends (string | ((item: any) => string | number | boolean))[]>(
        ...properties: K
      ) => {
        if (
          properties.indexOf(this.collections.get(collection)!.idProperty) > -1
        ) {
          throw new Error("An id cannot be a view property. Use byId instead.");
        }
        for (const property of properties) {
          if (typeof property !== "function" && typeof property !== "string") {
            throw new Error("A view property must be a string or a function.");
          }
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

        const builder = {
          join,
          transform,
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

export default Cruncher;
