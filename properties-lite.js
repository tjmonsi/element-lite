/// <reference path="typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from './lib/deduping-mixin.js';
import { saveAccessorValue } from './lib/save-accessor-value.js';
const _hiddenPropOptions = (value) => ({
  configurable: false,
  writable: false,
  enumerable: false,
  value
});

/**
 * Creates a copy of `props` with each property normalized such that
 * upgraded it is an object with at least a type property { type: Type }.
 *
 * @param {Object} props Properties to normalize
 * @return {Object} Copy of input `props` with normalized properties that
 * are in the form {type: Type}
 * @private
 */
function normalizeProperties (props) {
  const output = {};
  for (let p in props) {
    const o = props[p];
    output[p] = (typeof o === 'function') ? {type: o} : o;
  }
  return output;
}

/**
* Returns a memoized version of the `properties` object for the
* given class. Properties not in object format are converted to at
* least {type}.
*
* @param {(ElementLiteBase | Function | typeof ElementLiteBase)} constructor ElementLiteBase constructor
* @return {Object} Memoized properties object
*/
function ownProperties (constructor) {
  if (!constructor.hasOwnProperty('_ownProperties')) {
    // @ts-ignore
    constructor._ownProperties = (constructor.hasOwnProperty('properties') && constructor.properties)
      // @ts-ignore
      ? normalizeProperties(constructor.properties)
      : null;
  }
  // @ts-ignore
  return constructor._ownProperties;
}

export const ElementLiteBase = dedupingMixin(base => {
  class PropertiesLite extends /** @type {HTMLElement} */(base) {
    
    /**
     * Creates property accessors for the given property names.
     *
     * @param {!Object} props Object whose keys are names of accessors.
     * @return {void}
     * @protected
     */
    static createProperties (props) {
      const proto = this.prototype;
      for (let prop in props) {
        const { readOnly, reflectToAttribute, notify } = props[prop];
        
        // don't stomp an existing accessor
        if (!(prop in proto)) {
          proto._createPropertyAccessor(prop, readOnly, reflectToAttribute, notify);
        }
      }
    }
    
    constructor () {
      super();
      
      const _options = _hiddenPropOptions({});
      // flags
      this._finalized = false;
      
      // This holds the data of the object, but is hidden on console log
      Object.defineProperty(this, '_dataProps', _options);
      
      // This holds the old data of the object
      Object.defineProperty(this, '_dataOldProps', _options);
      
      // This holds the data path of the object's data properties
      this._dataHasPaths = false;
      this._dataInvalid = false;
      this._initializeProperties();
    }
    
    /**
     * Initializes the local storage for property accessors.
     *
     * @return {void}
     * @protected
     * @suppress {invalidCasts}
     */
    _initializeProperties () {
      const props = ownProperties(this.constructor);
      const keys = props ? Object.keys(props) : [];
      
      if (!this.hasOwnProperty('_finalized')) {
        this._finalized = true;
        if (props) {
          this.constructor.createProperties(props);
        }
      }
    }
    
    /**
     * Creates a setter/getter pair for the named property with its own
     * local storage.  The getter returns the value in the local storage,
     * and the setter calls `_setProperty`, which updates the local storage
     * for the property and enqueues a `_propertiesChanged` callback.
     *
     * This method may be called on a prototype or an instance.  Calling
     * this method may overwrite a property value that already exists on
     * the prototype/instance by creating the accessor.
     *
     * In addition, this method also sets flags for reflectToAttribute and notify.
     * It also adds references to function calls given by observer
     *
     * @param {string} property Name of the property
     * @param {boolean=} readOnly When true, no setter is created; the
     *   protected `_setProperty` function must be used to set the property
     * @param {boolean=} reflectToAttribute When true, sets flag to `__dataReflectToAttribute`;
     *   this will automatically set the attribute to the element tag using `setAttribute`
     * @param {boolean=} notify When true, sets flag to `__dataNotify`;
     *   this will automatically dispatch a `CustomEvent` given the attribute-name of the
     *   property + `-changed` (eg. `property-name-changed` )
     * @return {void}
     * @protected
     */
    _createPropertyAccessor (property, readOnly, reflectToAttribute, notify) {
      this._addPropertyToAttributeMap(property);
      const _dataHasAccessor = '_dataHasAccessor';
      const _readOnly = '_readOnly';
      const _dataReflectToAttribute = '_dataReflectToAttribute';
      const _dataNotify = '_dataNotify';
      const _dataObserver = '_dataObserver';
      const _options = _hiddenPropOptions({});

      if (!this.hasOwnProperty(_dataHasAccessor)) {
        Object.defineProperty(this, _dataHasAccessor, _options);
      }

      if (!this.hasOwnProperty(_readOnly)) {
        Object.defineProperty(this, _readOnly, _options);
      }

      if (!this.hasOwnProperty(_dataReflectToAttribute)) {
        Object.defineProperty(this, _dataReflectToAttribute, _options);
      }

      if (!this.hasOwnProperty(_dataNotify)) {
        Object.defineProperty(this, _dataNotify, _options);
      }

      if (!this.hasOwnProperty(_dataObserver)) {
        Object.defineProperty(this, _dataObserver, _options);
      }

      if (!this._dataHasAccessor[property]) {
        this._dataHasAccessor[property] = true;
        this._definePropertyAccessor(property, readOnly);
      }

      if (readOnly) {
        this._readOnly[property] = true;
      }

      if (reflectToAttribute) {
        this._dataReflectToAttribute[property] = true;
      }

      if (notify) {
        this._dataNotify[property] = true;
      }
    }
    
    /**
     * Defines a property accessor for the given property.
     *
     * @param {string} property Name of the property
     * @param {boolean=} readOnly When true, no setter is created
     * @return {void}
     */
    _definePropertyAccessor (property, readOnly) {
      saveAccessorValue(this, property);
      Object.defineProperty(this, property, {
        // @ts-ignore
        get () { return this._getProperty(property); },
        set: readOnly
          ? function () { 
            console.error(`Cannot set on a read-only property: ${property}`); 
          }
          : function (value) { 
            this._setProperty(property, value); 
          }
      });
    }
    
    /**
     * Updates the local storage for a property (via `_setPendingProperty`)
     * and enqueues a `_proeprtiesChanged` callback.
     *
     * @param {string} property Name of the property
     * @param {*} value Value to set
     * @return {void}
     * @private
     */
    _setProperty (property, value) {
      if (this._setPendingProperty(property, value)) {
        this._invalidateProperties();
      }
    }
    
    /**
     * Updates the local storage for a property, records the previous value,
     * and adds it to the set of "pending changes" that will be passed to the
     * `_propertiesChanged` callback.  This method does not enqueue the
     * `_propertiesChanged` callback.
     *
     * @param {string} property Name of the property
     * @param {*} value Value to set
     * @return {boolean} Returns true if the property changed
     * @protected
     */
    _setPendingProperty (property, value) {
      console.log(this._dataOldProps);
      const prevProps = this._dataOldProps;
      
      if (!this._shouldPropertyChange(property, value, prevProps[property])) {
        return false;
      }
      
      // get old data from _dataProps to _dataOldProps
      if (!(property in this._dataProps)) {
        this._dataOldProps[property] = this._dataProps[property];
      }
      
      this._dataProps = value;
      return true
    }
    
    /**
     * Method called to determine whether a property value should be
     * considered as a change and cause the `_propertiesChanged` callback
     * to be enqueued.
     *
     * The default implementation returns `true` if a strict equality
     * check fails. The method always returns false for `NaN`.
     *
     * @param {string} property Property name
     * @param {*} value New property value
     * @param {*} old Previous property value
     * @return {boolean} Whether the property should be considered a change
     *   and enqueue a `_proeprtiesChanged` callback
     * @protected
     */
    _shouldPropertyChange (property, value, old) {
      return (
        // Strict equality check
        (old !== value &&
        // This ensures (old==NaN, value==NaN) always returns false
        (old === old || value === value)) // eslint-disable-line
      );
    }
    
    _invalidateProperties () {
      if (!this._dataInvalid) {
        this._dataInvalid = true;
        
        Promise.resolve().then(() => {
          if (this._dataInvalid) {
            this._dataInvalid = false;
            this._flushProperties();
          } else {
            // check hack
            Promise.resolve().then(this._invalidateProperties.bind(this));
          }
        })
      }
    }
    
    _flushProperties () {
        
    }
  }
});
