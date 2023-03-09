import Cruncher from ".";

const TestUtils = {
  getReferences: (
    cruncher: Cruncher
  ): {
    [refHolderCollection: string]: {
      [referencedCollection: string]: {
        [referencedCollectionId: string]: { [refHolderId: string]: true };
      };
    };
  } => {
    const references = (cruncher as any).references;
    if (!references) {
      throw new Error("References not available");
    }
    const result = {};
    for (const a of references.keys()) {
      result[a] = {};
      for (const b of references.get(a).keys()) {
        result[a][b] = {};
        for (const c of references.get(a).get(b).keys()) {
          result[a][b][c] = {};
          for (const d of references.get(a).get(b).get(c).keys()) {
            result[a][b][c][d] = true;
          }
        }
      }
    }
    return result;
  },
  getInternalSize: (cruncher: Cruncher, collection: string) => {
    if (
      (cruncher as any).collections.get(collection).data.length !==
      (cruncher as any).normalizedCollections.get(collection).size
    ) {
      throw new Error("Internal size mismatch");
    }
    return (cruncher as any).collections.get(collection).data.length;
  },
  isInnerStructureEqual: (
    cruncher: Cruncher,
    other: Cruncher,
    wrong?: boolean
  ) => {
    const isEqual = wrong ? wrongEqual : internalEqual;
    for (const collection in (cruncher as any).collections) {
      (cruncher as any).collections
        .get(collection)
        .data.sort((a, b) => a.id.localeCompare(b.id));
      (other as any).collections
        .get(collection)
        .data.sort((a, b) => a.id.localeCompare(b.id));
    }
    if (!isEqual((cruncher as any).collections, (other as any).collections)) {
      return false;
    }
    if (
      !isEqual(
        (cruncher as any).normalizedCollections,
        (other as any).normalizedCollections
      )
    ) {
      return false;
    }
    if (!isEqual((cruncher as any).references, (other as any).references)) {
      return false;
    }
    for (const view of (cruncher as any).views) {
      internalSortRecursively(view.data);
    }
    for (const view of (other as any).views) {
      internalSortRecursively(view.data);
    }
    if (!isEqual((cruncher as any).views, (other as any).views)) {
      return false;
    }
    return true;
  },
};

// Thanks to the authors of https://github.com/epoberezkin/fast-deep-equal
// The following function was created from their code and modified
function internalEqual(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == "object" && typeof b == "object") {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; )
        if (!internalEqual(a[i], b[i])) {
          return false;
        }
      return true;
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (i of a.entries()) if (!b.has(i[0])) return false;
      for (i of a.entries())
        if (!internalEqual(i[1], b.get(i[0]))) return false;
      return true;
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      for (i of a.entries()) if (!b.has(i[0])) return false;
      return true;
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = (a as any).length;
      if (length != (b as any).length) return false;
      for (i = length; i-- !== 0; ) if (a[i] !== b[i]) return false;
      return true;
    }

    if (a.constructor === RegExp)
      return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf)
      return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString)
      return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0; ) {
      var key = keys[i];

      if (!internalEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  if (typeof a === "function" && typeof b === "function") {
    return true;
  }
  // true if both NaN, false otherwise
  return a !== a && b !== b;
}

// Thanks to the authors of https://github.com/epoberezkin/fast-deep-equal
// The following function was created from their code and modified
function wrongEqual(a, b) {
  if (a && b && typeof a == "object" && typeof b == "object") {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; )
        if (!internalEqual(a[i], b[i])) {
          return false;
        }
      return true;
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (i of a.entries()) if (!b.has(i[0])) return false;
      for (i of a.entries())
        if (!internalEqual(i[1], b.get(i[0]))) return false;
      return true;
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      for (i of a.entries()) if (!b.has(i[0])) return false;
      return true;
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = (a as any).length;
      if (length != (b as any).length) return false;
      for (i = length; i-- !== 0; ) if (a[i] !== b[i]) return false;
      return true;
    }

    if (a.constructor === RegExp)
      return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf)
      return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString)
      return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0; ) {
      var key = keys[i];

      if (!internalEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  if (typeof a === "function" && typeof b === "function") {
    return true;
  }
  // true if both NaN, false otherwise
  return a !== a && b !== b;
}

function internalSortRecursively(data) {
  if (Array.isArray(data)) {
    data.sort((a, b) => a.id.localeCompare(b.id));
  } else {
    for (const key of data.keys()) {
      internalSortRecursively(data.get(key));
    }
  }
}

export { TestUtils };

/*
This is a copy of the MIT license text from https://github.com/epoberezkin/fast-deep-equal:

MIT License

Copyright (c) 2017 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
