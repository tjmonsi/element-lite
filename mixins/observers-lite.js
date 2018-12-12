/// <reference path="../typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from '../lib/deduping-mixin.js';
import { root, getProp } from '../lib/path.js';
import { PropertiesLite } from './properties-lite.js';

export const ObserversLite = dedupingMixin(base => {
  class ObserversLite extends /** @type {HTMLElement} */PropertiesLite(base) {
    constructor () {
      super();
      this._initializeObservers();
    }

    _initializeObservers () {
      this._observersMap = new Map(null);
      const observers = this.constructor.observers;

      for (const observer of observers) {
        const fnArgs = observer.split('(');
        const fn = fnArgs[0].trim();
        const args = fnArgs[1].trim().replace(/\)$/g, '').split(',').map(arg => arg.trim());
        this._observersMap.set(fn, args);
      }
    }

    _requestPropertyUpdateOptions (name, options) {
      super._requestPropertyUpdateOptions(name, options);

      if (options && options.observer) {
        if (typeof this[options.observer] === 'function') {
          if (this._callObserverProperties === undefined) {
            this._callObserverProperties = new Map();
          }
          this._callObserverProperties.set(name, options.observer);
        } else {
          console.warn(`${options.observer} doesn't exist in the element as a function`);
        }
      }
    }

    update (_changedProperties) {
      super.update(_changedProperties);

      if (this._callObserverProperties !== undefined && this._callObserverProperties.size > 0) {
        for (const [prop, fn] of this._callObserverProperties) {
          this[fn](this[prop], _changedProperties.get(prop));
        }
        this._callObserverProperties = undefined;
      }

      if (this._observersMap !== undefined && this._observersMap.size > 0) {
        for (const [fn, args] of this._observersMap) {
          let callFn = false;
          const newArgs = [];
          for (const arg of args) {
            newArgs.push(getProp(this, arg));
            if (_changedProperties.has(arg) || _changedProperties.has(root(arg))) {
              callFn = true;
            }
          }
          if (callFn) {
            this[fn](...newArgs);
          }
        }

        this._observersMap = undefined;
      }
    }
  }

  ObserversLite.observers = [];

  return ObserversLite;
});
