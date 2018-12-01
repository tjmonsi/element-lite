/// <reference path="../typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from '../lib/deduping-mixin.js';
import { root, getProp, setProp } from '../lib/path.js';

export const ObjectAccessorsLite = dedupingMixin(base => {
  class ObjectAccessorsLite extends /** @type {any} */(base) {
    /**
     * Convenience method for setting a value to a path and notifying any
     * elements bound to the same path.
     *
     * Note, if any part in the path except for the last is undefined,
     * this method does nothing (this method does not throw when
     * dereferencing undefined paths).
     *
     * @param {string} path Path to the value
     *   to write.  The path may be specified as a string (e.g. `'foo.bar.baz'`)
     *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
     *   bracketed expressions are not supported; string-based path parts
     *   *must* be separated by dots.  Note that when dereferencing array
     *   indices, the index may be used as a dotted part directly
     *   (e.g. `'users.12.name'` or `['users', 12, 'name']`).
     * @param {*} value Value to set at the specified path.
     * @return {void}
     * @public
    */
    set (path, value) {
      if (path && typeof path === 'string') {
        const oldValue = getProp(this, path, null);
        setProp(this, path, value);
        /** @type {any} */(this).requestUpdate(root(path), oldValue);
      }
    }
  }

  return ObjectAccessorsLite;
});
