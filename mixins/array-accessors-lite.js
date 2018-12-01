/// <reference path="../typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from '../lib/deduping-mixin.js';
import { getProp } from '../lib/path.js';
import { ObjectAccessorsLite } from './object-accessors-lite.js';

export const ArrayAccessorsLite = dedupingMixin(base => {
  class ArrayAccessorsLite extends /** @type {HTMLElement} */ObjectAccessorsLite(base) {
    /**
     * Adds items onto the end of the array at the path specified.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.push`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @param {string} path Path to array.
     * @param {...*} items Items to push onto array
     * @return {number} New length of the array.
     * @public
     */
    push (path, ...items) {
      let info = { path: '' };
      let array = getProp(this, path, info);
      // use immutability for now
      let ret = [ ...array, ...items ];
      if (items.length) this.set(path, ret);
      return ret.length;
    }

    /**
     * Removes an item from the end of array at the path specified.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.pop`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @param {string} path Path to array.
     * @return {*} Item that was removed.
     * @public
     */
    pop (path) {
      let info = { path: '' };
      let array = getProp(this, path, info);
      let hadLength = Boolean(array.length);
      // use immutability for now
      if (hadLength) {
        let ret = array.slice(0, -1);
        this.set(path, ret);
        return array.slice(-1);
      }
    }

    /**
     * Starting from the start index specified, removes 0 or more items
     * from the array and inserts 0 or more new items in their place.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.splice`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @param {string} path Path to array.
     * @param {number} start Index from which to start removing/inserting.
     * @param {number} deleteCount Number of items to remove.
     * @param {...*} items Items to insert into array.
     * @return {Array} Array of remaining items.
     * @public
     */
    splice (path, start, deleteCount, ...items) {
      let info = { path: '' };
      let array = getProp(this, path, info);
      // Normalize fancy native splice handling of crazy start values
      if (start < 0) start = array.length - Math.floor(-start);
      else if (start) start = Math.floor(start);
      // array.splice does different things based on the number of arguments
      // you pass in. Therefore, array.splice(0) and array.splice(0, undefined)
      // do different things. In the former, the whole array is cleared. In the
      // latter, no items are removed.
      // This means that we need to detect whether 1. one of the arguments
      // is actually passed in and then 2. determine how many arguments
      // we should pass on to the native array.splice
      //
      let ret;
      // Omit any additional arguments if they were not passed in
      ret = [ ...array.slice(0, start), ...items, ...array.slice(start + deleteCount) ];
      // ret = arguments.length === 2 ? array.splice(start) : array.splice(start, deleteCount, ...items);

      // Either start was undefined and the others were defined, but in this
      // case we can safely pass on all arguments
      //
      // Note: this includes the case where none of the arguments were passed in,
      // e.g. this.splice('array'). However, if both start and deleteCount
      // are undefined, array.splice will not modify the array (as expected)

      // At the end, check whether any items were passed in (e.g. insertions)
      // or if the return array contains items (e.g. deletions).
      // Only notify if items were added or deleted.
      if (items.length || ret.length) {
        this.set(path, ret);
        // notifySplice(this, array, info.path, start, items.length, ret);
      }
      return ret;
    }

    /**
     * Removes an item from the beginning of array at the path specified.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.pop`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @param {string} path Path to array.
     * @return {*} Item that was removed.
     * @public
     */
    shift (path) {
      let info = { path: '' };
      let array = getProp(this, path, info);
      let hadLength = Boolean(array.length);
      // use immutability for now
      if (hadLength) {
        let ret = array.slice(1);
        this.set(path, ret);
        return array.slice(0, 1);
      }
    }

    /**
     * Adds items onto the beginning of the array at the path specified.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.push`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @param {string} path Path to array.
     * @param {...*} items Items to insert info array
     * @return {number} New length of the array.
     * @public
     */
    unshift (path, ...items) {
      let info = { path: '' };
      let array = getProp(this, path, info);
      // use immutability for now
      let ret = [ ...items, ...array ];
      if (items.length) this.set(path, ret);
      return ret.length;
    }
  }

  return ArrayAccessorsLite;
});
