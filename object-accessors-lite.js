/// <reference path="typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from './lib/deduping-mixin.js';
import { root, getProp, setProp, isPath } from './lib/path.js';

export const ObjectAccessorsLite = dedupingMixin(base => {
  class ObjectAccessorsLite extends /** @type {HTMLElement} */(base) {
    constructor () {
      super();
      this._dataTemp = {};
      /** @type {number} */
      // NOTE: used to track re-entrant calls to `_flushProperties`
      // path changes dirty check against `__dataTemp` only during one "turn"
      // and are cleared when `__dataCounter` returns to 0.
      this._dataCounter = 0;
    }

    /**
     * Sets a pending property or path.  If the root property of the path in
     * question had no accessor, the path is set, otherwise it is enqueued
     * via `_setPendingProperty`.
     *
     * This function isolates relatively expensive functionality necessary
     * for the public API (`set`, `setProperties`, `notifyPath`, and property
     * change listeners via {{...}} bindings), such that it is only done
     * when paths enter the system, and not at every propagation step.  It
     * also sets a `__dataHasPaths` flag on the instance which is used to
     * fast-path slower path-matching code in the property effects host paths.
     *
     * `path` can be a path string or array of path parts as accepted by the
     * public API.
     *
     * @param {string} path Path to set
     * @param {*} value Value to set
     * @param {boolean=} shouldNotify Set to true if this change should
     *  cause a property notification event dispatch
     * @param {boolean=} isPathNotification If the path being set is a path
     *   notification of an already changed value, as opposed to a request
     *   to set and notify the change.  In the latter `false` case, a dirty
     *   check is performed and then the value is set to the path before
     *   enqueuing the pending property change.
     * @return {boolean} Returns true if the property/path was enqueued in
     *   the pending changes bag.
     * @protected
     */
    _setPendingPropertyOrPath (path, value) {
      if (root(Array.isArray(path) ? path[0] : path) !== path) {
        // Dirty check changes being set to a path against the actual object,
        // since this is the entry point for paths into the system; from here
        // the only dirty checks are against the `__dataTemp` cache to prevent
        // duplicate work in the same turn only.
        let old = getProp(this, path, null);
        path = setProp(this, path, value);
        // Use property-accessor's simpler dirty check
        if (!path || !this._shouldPropertyChange(path, value, old)) {
          return false;
        }

        this._dataHasPaths = true;
        return this._setPendingProperty(path, value);
      } else if (this._dataHasAccessor && this._dataHasAccessor[path]) {
        return this._setPendingProperty(path, value);
      } else {
        this._propertyToAttribute(path, this._dataAttributeProperties[path], value);
        // this[path] = value;
      }
      return false;
    }

    /**
     * Updates the local storage for a property, records the previous value,
     * and adds it to the set of "pending changes" that will be passed to the
     * `_propertiesChanged` callback.  This method does not enqueue the
     * `_propertiesChanged` callback.
     *
     * @param {string} property Name of the property
     * @param {*} value Value to set
     * @param {boolean=} shouldNotify
     * @return {boolean} Returns true if the property changed
     * @protected
     */
    _setPendingProperty (property, value) {
      let path = this.__dataHasPaths && isPath(property);
      let prevProps = path ? this.__dataTemp : this.__data;
      if (this._shouldPropertyChange(property, value, prevProps[property])) {
        if (!this.__dataPending) {
          this.__dataPending = {};
          this.__dataOld = {};
        }
        // Ensure old is captured from the last turn
        if (!(property in this.__dataOld)) {
          this.__dataOld[property] = this.__data[property];
        }

        if (path) {
          this.__dataTemp[property] = value;
        } else {
          this.__data[property] = value;
        }

        // All changes go into pending property bag, passed to _propertiesChanged
        this.__dataPending[property] = value;
        return true;
      }
      return false;
    }

    /**
     * This extends the original _flushProperties
     *
     * @return {void}
     * @protected
     */
    _flushProperties (forceFlush) {
      this.__dataCounter++;
      super._flushProperties(forceFlush);
      this.__dataCounter--;
    }

    _propertiesChanged (currentProps, changedProps, oldProps) {
      super._propertiesChanged(currentProps, changedProps, oldProps);
      // Clear temporary cache at end of turn
      if (this._dataCounter === 1) {
        this._dataTemp = {};
      }
    }

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
      if (path &&
        (!this._readOnly || !this._readOnly[root(path)]) &&
        this._setPendingPropertyOrPath(path, value)) {
        this._invalidateProperties();
      }
    }
  }

  return ObjectAccessorsLite;
});
