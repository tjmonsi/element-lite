/// <reference path="typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from './lib/deduping-mixin.js';
import { root, getProp } from './lib/path.js';
import { ownProperties } from './lib/own-properties.js';
import { PropertiesLite } from './properties-lite.js';

export const ObserversLite = dedupingMixin(base => {
  class ObserversLite extends /** @type {HTMLElement} */PropertiesLite(base) {
    static createPropertyObserver (props) {
      const proto = this.prototype;

      for (let prop in props) {
        const { observer } = props[prop];
        proto._createPropertyObserver(prop, observer);
      }
    }

    constructor () {
      super();
      this._finalizedObserver = false;
      this._initializeObservers();
    }

    /**
     * Initializes the observers to call methods when property values have changed
     *
     * @return {void}
     * @protected
     * @suppress {invalidCasts}
     */

    _initializeObservers () {
      const props = ownProperties(this.constructor);
      const { observers } = this.constructor;
      const _dataMethodObserver = '_dataMethodObserver';

      if (!this.hasOwnProperty('_finalizedObserver') || !this._finalizedObserver) {
        this._finalizedObserver = true;
        if (props) {
          this.constructor.createPropertyObserver(props);
        }
      }

      if (!this.hasOwnProperty(_dataMethodObserver)) {
        Object.defineProperty(this, _dataMethodObserver, {
          configurable: false,
          writable: false,
          enumerable: false,
          value: {}
        });
      }

      if (observers && observers.length) {
        for (let i = 0, l = observers.length; i < l; i++) {
          const fnArgs = observers[i].split('(');
          const fn = fnArgs[0].trim();
          const args = fnArgs[1].trim().replace(/\)$/g, '').split(',').map(arg => arg.trim());

          for (let p = 0, m = args.length; p < m; p++) {
            const rootPath = root(args[p]);

            if (!this._dataMethodObserver[args[p]]) {
              this._dataMethodObserver[args[p]] = { methods: [], root: root(args[p]) };
            }

            if (!this._dataMethodObserver[rootPath]) {
              this._dataMethodObserver[rootPath] = { methods: [], root: root(rootPath) };
            }

            // Removed these parts so that you can call the same function name with same set of
            // paramaters but in different order
            // if (this._dataMethodObserver[args[p]].methods.findIndex(item => item.fn === fn) < 0) {
            this._dataMethodObserver[args[p]].methods.push({ fn, args });
            // }
            // if (this._dataMethodObserver[rootPath].methods.findIndex(item => item.fn === fn) < 0) {
            this._dataMethodObserver[rootPath].methods.push({ fn, args });
            // }
          }
        }
      }
    }

    /**
     * Creates a reference to function call given by observer
     *
     * @param {string} property Name of the property
     * @param {boolean=} observer Puts the string name reference of the method in this element in
     *   the `_dataObserver` object; The method referenced will be called when there are changes
     *   in the property associated to it
     * @return {void}
     * @protected
     */
    _createPropertyObserver (property, observer) {
      const _dataObserver = '_dataObserver';

      if (!this.hasOwnProperty(_dataObserver)) {
        Object.defineProperty(this, _dataObserver, {
          configurable: false,
          writable: false,
          enumerable: false,
          value: {}
        });
      }

      if (observer && typeof observer === 'string') {
        this._dataObserver[property] = observer;
      }
    }

    /**
     * Callback called when any properties with accessors created via
     * `_createPropertyAccessor` have been set. This is the extended version for
     * calling observer functions as well.
     *
     * @param {!Object} currentProps Bag of all current accessor values
     * @param {!Object} changedProps Bag of properties changed since the last
     *   call to `_propertiesChanged`
     * @param {!Object} oldProps Bag of previous values for each property
     *   in `changedProps`
     * @return {void}
     * @protected
     */
    _propertiesChanged (currentProps, changedProps, oldProps) {
      super._propertiesChanged(currentProps, changedProps, oldProps);
      const fns = {};

      let keys = Object.keys(changedProps);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        const prop = root(key);

        if (this._dataObserver[prop]) {
          const fn = this[this._dataObserver[prop]];
          const args = [this._dataProps[prop], oldProps && oldProps[prop]];

          if (fn) {
            fns[`${this._dataObserver[prop]}-${prop}`] = { fn: fn.bind(this), args };
          } else {
            console.warn(`There's no observer named ${this._dataObserver[prop]} for ${prop}`);
          }
        }

        if (this._dataMethodObserver[key]) {
          const { methods } = this._dataMethodObserver[key];
          for (let p = 0, m = methods.length; p < m; p++) {
            const { fn: fnName, args: argNames } = methods[p];
            const fn = this[fnName];
            const args = [];
            for (let a = 0, n = argNames.length; a < n; a++) {
              args.push(this.get(argNames[a]));
            }

            if (fn) {
              fns[`${fnName}-${argNames.join('-')}`] = { fn: fn.bind(this), args };
            } else {
              console.warn(`There's no method named ${fnName}`);
            }
          }
        }
      }

      keys = Object.keys(fns);
      for (let i = 0, l = keys.length; i < l; i++) {
        const { fn, args } = fns[keys[i]];
        fn(...args);
      }
    }

    /**
     * Convenience method for reading a value from a path.
     *
     * Note, if any part in the path is undefined, this method returns
     * `undefined` (this method does not throw when dereferencing undefined
     * paths).
     *
     * @param {(string|!Array<(string|number)>)} path Path to the value
     *   to read.  The path may be specified as a string (e.g. `foo.bar.baz`)
     *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
     *   bracketed expressions are not supported; string-based path parts
     *   *must* be separated by dots.  Note that when dereferencing array
     *   indices, the index may be used as a dotted part directly
     *   (e.g. `users.12.name` or `['users', 12, 'name']`).
     * @param {Object=} root Root object from which the path is evaluated.
     * @return {*} Value at the path, or `undefined` if any part of the path
     *   is undefined.
     * @public
     */
    get (path, root) {
      return getProp(root || this, path, null);
    }
  }

  return ObserversLite;
});
