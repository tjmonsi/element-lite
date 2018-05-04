/// <reference path="typings-project/global.d.ts"/>

import { dedupingMixin } from './lib/deduping-mixin.js';
import { root, getProp, setProp, isPath } from './lib/path.js';
import { saveAccessorValue } from './lib/save-accessor-value.js';
import { camelToDashCase } from './lib/case-map.js';

/**
 * Parts are copied from different mixin parts of https://github.com/Polymer/polymer/tree/__auto_generated_3.0_preview
 *
 * Here are the list of parts that are copied or modified
 * - Copied:
 *   - Private Functions
 *     - normalizeProperties - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-mixin.js#L14
 *     - ownProperties - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-mixin.js#L58
 *   - Class Methods
 *     - Static methods
 *       - createProperties - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L25
 *     - Protected Methods
 *       - _initializeProtoProperties - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-accessors.js#L133
 *       - _initializeInstanceProperties - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1177
 *       - _setProperty - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L202
 *       - _getProperty - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L214
 *       - _setPendingProperty - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1419
 *       - _flushProperties
 *         - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L300
 *         - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1502
 *       - _shouldPropertiesChange - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L323
 *       - _shouldPropertyChange - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L360
 *       - _attributeToProperty - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L400
 *       - _propertyToAttribute - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L419
 *       - _valueToNodeAttribute - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L440
 *       - _serializeValue
 *         - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L460
 *         - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-accessors.js#L162
 *       - _deserializeValue
 *         - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L481
 *         - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-accessors.js#L196
 *       - _setPendingPropertyOrPath - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1319
 *     - HTMLElement Methods
 *       - attributeChangedCallback - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L379
 *       - observedAttributes - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-mixin.js#L85
 *     - Public methods
 *       - ready - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L149
 *       - set - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1805
 *
 *
 *
 * - Modified
 *   - Class Methods
 *     - Protected Methods
 *       - _createPropertyAccessor - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L73
 *       - _addPropertyToAttributeMap - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L91
 *       - _definePropertyAccessor - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L107
 *       - _initializeProperties
 *         - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L163
 *         - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-mixin.js#L160
 *         - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-accessors.js#L112
 *       - _invalidateProperties - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L257
 *     - Public Methods
 *       - push - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1831
 *       - pop - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1855
 *       - splice - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1883
 *       - shift - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1935
 *       - unshift - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1960
 *       - get - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/property-effects.js#L1780
 *   - Class Constructor - https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/mixins/properties-changed.js#L122
 *
 * - Created
 *   - Class Methods
 *     - Protected Methods
 *       - _initializeObservers
 *       - _propertiesChanged
 *
 */

export const ElementLiteBase = dedupingMixin(base => {
  /**
   * Creates a copy of `props` with each property normalized such that
   * upgraded it is an object with at least a type property { type: Type}.
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
    if (!constructor.hasOwnProperty('__ownProperties')) {
      // @ts-ignore
      constructor.__ownProperties = (constructor.hasOwnProperty('properties') && constructor.properties)
        // @ts-ignore
        ? normalizeProperties(constructor.properties)
        : null;
    }
    // @ts-ignore
    return constructor.__ownProperties;
  }

  /**
   * ElementLite is a set of methods coming from Polymer Property Mixins and Property Accessor Mixins
   * that automates the creation of setter and getters given a list of properties and
   * allows auto-calling of methods given observers. This is the base without the lit-html counterpart
   * @extends {HTMLElement}
  */
  class ElementLiteBase extends /** @type {HTMLElement} */(base) {
    /**
      * Returns a memoized version of all properties, including those inherited
      * from super classes. Properties not in object format are converted to
      * at least {type}.
      *
      * @return {Object} Object containing properties for this class
      * @protected
      */
    static get _properties () {
      if (!this.hasOwnProperty('__properties')) {
        this.__properties = Object.assign({}, ownProperties(this));
      }
      return this.__properties;
    }

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
        const { readOnly, reflectToAttribute, notify, observer } = props[prop];
        // don't stomp an existing accessor
        if (!(prop in proto)) {
          proto._createPropertyAccessor(prop, readOnly, reflectToAttribute, notify, observer);
        }
      }
    }

    /**
      * Implements standard custom elements getter to observes the attributes
      * listed in `properties`.
      * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
      */
    static get observedAttributes () {
      const props = this._properties;
      return props ? Object.keys(props).map(p => camelToDashCase(p)) : [];
    }

    /**
      * Overrides `PropertiesChanged` method to return type specified in the
      * static `properties` object for the given property.
      * @param {string} name Name of property
      * @return {*} Type to which to deserialize attribute
      *
      * @protected
      */
    static typeForProperty (name) {
      const info = this._properties[name];
      return info && info.type;
    }

    constructor () {
      super();
      this.__dataEnabled = false;
      this.__dataReady = false;
      this.__dataInvalid = false;
      this.__data = Object.assign({}, this.__data);
      this.__dataPending = null;
      this.__dataOld = null;
      this.__dataInstanceProps = null;
      this.__serializing = false;
      this.__dataHasPaths = false;
      this.__dataTemp = {};
      /** @type {number} */
      // NOTE: used to track re-entrant calls to `_flushProperties`
      // path changes dirty check against `__dataTemp` only during one "turn"
      // and are cleared when `__dataCounter` returns to 0.
      this.__dataCounter = 0;
      this._initializeProperties();
      this._initializeObservers();
    }

    /**
      * Called when the element is added to a document.
      * Calls `_enableProperties` to turn on property system from
      * `PropertiesChanged`.
      * @suppress {missingProperties} Super may or may not implement the callback
      * @return {void}
      */
    connectedCallback () {
      if (super.connectedCallback) {
        super.connectedCallback();
      }
      this._enableProperties();
    }

    /**
     * Call to enable property accessor processing. Before this method is
     * called accessor values will be set but side effects are
     * queued. When called, any pending side effects occur immediately.
     * For elements, generally `connectedCallback` is a normal spot to do so.
     * It is safe to call this method multiple times as it only turns on
     * property accessors once.
     *
     * @return {void}
     * @protected
     */
    _enableProperties () {
      if (!this.__dataEnabled) {
        this.__dataEnabled = true;
        // put here setting of attributes
        if (this.__dataInstanceProps) {
          this._initializeInstanceProperties(this.__dataInstanceProps);
          this.__dataInstanceProps = null;
        }
        this.ready();
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
     * @param {string} observer Puts the string name reference of the method in this element in
     *   the `__dataObserver` object; The method referenced will be called when there are changes
     *   in the property associated to it
     * @return {void}
     * @protected
     */
    _createPropertyAccessor (property, readOnly, reflectToAttribute, notify, observer) {
      this._addPropertyToAttributeMap(property);

      if (!this.hasOwnProperty('__dataHasAccessor')) {
        this.__dataHasAccessor = Object.assign({}, this.__dataHasAccessor);
      }

      if (!this.hasOwnProperty('__readOnly')) {
        this.__readOnly = Object.assign({}, this.__readOnly);
      }

      if (!this.hasOwnProperty('__dataReflectToAttribute')) {
        this.__dataReflectToAttribute = Object.assign({}, this.__dataReflectToAttribute);
      }

      if (!this.hasOwnProperty('__dataNotify')) {
        this.__dataNotify = Object.assign({}, this.__dataNotify);
      }

      if (!this.hasOwnProperty('__dataObserver')) {
        this.__dataObserver = Object.assign({}, this.__dataObserver);
      }

      if (!this.__dataHasAccessor[property]) {
        this.__dataHasAccessor[property] = true;
        this._definePropertyAccessor(property, readOnly);
      }

      if (readOnly) {
        this.__readOnly[property] = true;
      }

      if (reflectToAttribute) {
        this.__dataReflectToAttribute[property] = true;
      }

      if (notify) {
        this.__dataNotify[property] = true;
      }

      if (observer && typeof observer === 'string') {
        this.__dataObserver[property] = observer;
      }
    }

    /**
     * Adds the given `property` to a map matching attribute names
     * to property names, using `camelToDashCase`. This map is
     * used when deserializing attribute values to properties.
     *
     * @param {string} property Name of the property
     */
    _addPropertyToAttributeMap (property) {
      const attr = camelToDashCase(property);

      if (!this.hasOwnProperty('__dataAttributes')) {
        this.__dataAttributes = Object.assign({}, this.__dataAttributes);
      }

      if (!this.hasOwnProperty('__dataAttributeProperties')) {
        this.__dataAttributeProperties = Object.assign({}, this.__dataAttributeProperties);
      }

      if (!this.__dataAttributes[attr]) {
        this.__dataAttributes[attr] = property;
      }

      if (!this.__dataAttributeProperties[property]) {
        this.__dataAttributeProperties[property] = attr;
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
          ? function () { console.error(`Cannot set on a read-only property: ${property}`); }
          : function (value) { this._setProperty(property, value); }
      });
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
      if (!this.hasOwnProperty('__finalized')) {
        this.__finalized = true;
        if (props) {
          this.constructor.createProperties(props);
        }
      }
      // Capture instance properties; these will be set into accessors
      // during first flush. Don't set them here, since we want
      // these to overwrite defaults/constructor assignments
      for (let p in this.__dataHasAccessor) {
        if (this.hasOwnProperty(p)) {
          this.__dataInstanceProps = this.__dataInstanceProps || {};
          this.__dataInstanceProps[p] = this[p];
          delete this[p];
        }
      }

      // set default value
      for (let p = 0, l = keys.length; p < l; p++) {
        const prop = keys[p];
        if (props[prop].value) {
          this.__data[prop] = props[prop].value;
        }
      }

      if (this.__dataProto) {
        this._initializeProtoProperties(this.__dataProto);
        this.__dataProto = null;
      }
    }

    /**
     * Called at ready time with bag of instance properties that overwrote
     * accessors when the element upgraded.
     *
     * @param {Object} props Bag of property values that were overwritten
     *   when creating property accessors.
     * @return {void}
     * @protected
     */
    _initializeInstanceProperties (props) {
      let readOnly = this.__readOnly;
      for (let prop in props) {
        if (!readOnly || !readOnly[prop]) {
          this.__dataPending = this.__dataPending || {};
          this.__dataOld = this.__dataOld || {};
          this.__data[prop] = this.__dataPending[prop] = props[prop];
        }
      }
    }

    /**
     * Called at instance time with bag of properties that were overwritten
     * by accessors on the prototype when accessors were created.
     *
     * The default implementation sets these properties back into the
     * setter at instance time.
     *
     * @param {Object} props Bag of property values that were overwritten
     *   when creating property accessors.
     * @return {void}
     * @protected
     */
    _initializeProtoProperties (props) {
      for (let p in props) {
        this._setProperty(p, props[p]);
      }
    }

    /**
     * Initializes the observers to call methods when property values have changed
     *
     * @return {void}
     * @protected
     * @suppress {invalidCasts}
     */

    _initializeObservers () {
      const observers = this.constructor.observers;

      if (!this.hasOwnProperty('__dataMethodObserver')) {
        this.__dataMethodObserver = Object.assign({}, this.__dataMethodObserver);
      }

      if (observers && observers.length) {
        for (let i = 0, l = observers.length; i < l; i++) {
          const fnArgs = observers[i].split('(');
          const fn = fnArgs[0].trim();
          const args = fnArgs[1].trim().replace(/\)$/g, '').split(',').map(arg => arg.trim());

          for (let p = 0, m = args.length; p < m; p++) {
            const rootPath = root(args[p]);

            if (!this.__dataMethodObserver[args[p]]) {
              this.__dataMethodObserver[args[p]] = { methods: [], root: root(args[p]) };
            }

            if (this.__dataMethodObserver[args[p]].methods.findIndex(item => item.fn === fn) < 0) {
              this.__dataMethodObserver[args[p]].methods.push({ fn, args });
            }

            if (!this.__dataMethodObserver[rootPath]) {
              this.__dataMethodObserver[rootPath] = { methods: [], root: root(rootPath) };
            }

            if (this.__dataMethodObserver[rootPath].methods.findIndex(item => item.fn === fn) < 0) {
              this.__dataMethodObserver[rootPath].methods.push({ fn, args });
            }
          }
        }
      }
    }

    /**
     * Updates the local storage for a property (via `_setPendingProperty`)
     * and enqueues a `_proeprtiesChanged` callback.
     *
     * @param {string} property Name of the property
     * @param {*} value Value to set
     * @return {void}
     * @protected
     */
    _setProperty (property, value) {
      if (this._setPendingProperty(property, value)) {
        this._invalidateProperties();
      }
    }

    /**
     * Returns the value for the given property.
     *
     * @param {string} property Name of property
     * @return {*} Value for the given property
     * @protected
     */
    _getProperty (property) {
      return this.__data[property];
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
    _setPendingPropertyOrPath (path, value, shouldNotify, isPathNotification) {
      if (isPathNotification || root(Array.isArray(path) ? path[0] : path) !== path) {
        // Dirty check changes being set to a path against the actual object,
        // since this is the entry point for paths into the system; from here
        // the only dirty checks are against the `__dataTemp` cache to prevent
        // duplicate work in the same turn only. Note, if this was a notification
        // of a change already set to a path (isPathNotification: true),
        // we always let the change through and skip the `set` since it was
        // already dirty checked at the point of entry and the underlying
        // object has already been updated
        if (!isPathNotification) {
          let old = getProp(this, path, null);
          path = setProp(this, path, value);
          // Use property-accessor's simpler dirty check
          if (!path || !this._shouldPropertyChange(path, value, old)) return false;
        }
        this.__dataHasPaths = true;
        return this._setPendingProperty(path, value, shouldNotify);
      } else {
        if (this.__dataHasAccessor && this.__dataHasAccessor[path]) return this._setPendingProperty(path, value, shouldNotify);
        else this[path] = value;
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
    _setPendingProperty (property, value, shouldNotify) {
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
     * Marks the properties as invalid, and enqueues an async
     * `_propertiesChanged` callback.
     *
     * @return {void}
     * @protected
     */
    _invalidateProperties (forceInvalidate) {
      if (!this.__dataInvalid && this.__dataReady) {
        this.__dataInvalid = true;

        Promise.resolve().then(() => {
          if (this.__dataInvalid) {
            this.__dataInvalid = false;
            this._flushProperties(forceInvalidate);
          }
        });
      }
    }

    /**
     * Calls the `_propertiesChanged` callback with the current set of
     * pending changes (and old values recorded when pending changes were
     * set), and resets the pending set of changes. Generally, this method
     * should not be called in user code.
     *
     * @return {void}
     * @protected
     */
    _flushProperties (forceFlush) {
      this.__dataCounter++;

      const props = this.__data;
      const changedProps = this.__dataPending;
      const old = this.__dataOld;
      if (this._shouldPropertiesChange(props, changedProps, old) || forceFlush) {
        this.__dataPending = null;
        this.__dataOld = {};
        this._propertiesChanged(props, forceFlush ? props : changedProps, old);
      }

      this.__dataCounter--;
    }

    /**
     * Called in `_flushProperties` to determine if `_propertiesChanged`
     * should be called. The default implementation returns true if
     * properties are pending. Override to customize when
     * `_propertiesChanged` is called.
     *
     * @param {!Object} currentProps Bag of all current accessor values
     * @param {!Object} changedProps Bag of properties changed since the last
     *   call to `_propertiesChanged`
     * @param {!Object} oldProps Bag of previous values for each property
     *   in `changedProps`
     * @return {boolean} true if changedProps is truthy
     */
    _shouldPropertiesChange (currentProps, changedProps, oldProps) {
      return Boolean(changedProps);
    }

    /**
     * Callback called when any properties with accessors created via
     * `_createPropertyAccessor` have been set.
     *
     * @param {!Object} currentProps Bag of all current accessor values
     * @param {!Object} changedProps Bag of properties changed since the last
     *   call to `_propertiesChanged`
     * @param {!Object} oldProps Bag of previous values for each property
     *   in `changedProps`
     * @return {void}
     * @protected
     */
    _propertiesChanged (currentProps, changedProps, oldProps) { // eslint-disable-line no-unused-vars
      const fns = {};
      let keys = Object.keys(changedProps);
      this.__dataHasPaths = false;

      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        const prop = root(key);

        if (this.__dataReflectToAttribute[prop]) {
          this._propertyToAttribute(prop, this.__dataAttributeProperties[prop], this.__data[prop]);
        }

        if (this.__dataNotify[root(prop)]) {
          this.dispatchEvent(new window.CustomEvent(`${camelToDashCase(root(prop))}-change`, { detail: this.__data[root(prop)] }));
        }

        if (this.__dataObserver[prop]) {
          const fn = this[this.__dataObserver[prop]];
          const args = [this.__data[prop], oldProps && oldProps[prop]];

          if (fn) {
            fns[this.__dataObserver[prop]] = { fn: fn.bind(this), args };
          } else {
            console.warn(`There's not observer named ${this.__dataObserver[prop]} for ${prop}`);
          }
        }

        if (this.__dataMethodObserver[key]) {
          const { methods } = this.__dataMethodObserver[key];
          for (let p = 0, m = methods.length; p < m; p++) {
            const { fn: fnName, args: argNames } = methods[p];
            const fn = this[fnName];
            const args = [];
            for (let a = 0, n = argNames.length; a < n; a++) {
              args.push(this.get(argNames[a]));
            }

            if (fn) {
              fns[fnName] = { fn: fn.bind(this), args };
            } else {
              console.warn(`There's not method named ${fnName}`);
            }
          }
        }
      }

      keys = Object.keys(fns);
      for (let i = 0, l = keys.length; i < l; i++) {
        const { fn, args } = fns[keys[i]];
        fn(...args);
      }

      // Clear temporary cache at end of turn
      if (this.__dataCounter === 1) {
        this.__dataTemp = {};
      }
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

    /**
     * Implements native Custom Elements `attributeChangedCallback` to
     * set an attribute value to a property via `_attributeToProperty`.
     *
     * @param {string} name Name of attribute that changed
     * @param {?string} old Old attribute value
     * @param {?string} value New attribute value
     * @return {void}
     * @suppress {missingProperties} Super may or may not implement the callback
     */
    attributeChangedCallback (name, old, value) {
      if (old !== value) {
        this._attributeToProperty(name, value);
      }

      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(name, old, value);
      }
    }

    /**
     * Deserializes an attribute to its associated property.
     *
     * This method calls the `_deserializeValue` method to convert the string to
     * a typed value.
     *
     * @param {string} attribute Name of attribute to deserialize.
     * @param {?string} value of the attribute.
     * returned from `typeForProperty`
     * @return {void}
     */
    _attributeToProperty (attribute, value) {
      if (!this.__serializing) {
        const map = this.__dataAttributes;
        const property = (map && map[attribute]) || attribute;
        this[property] = this._deserializeValue(value, this.constructor.typeForProperty(property));
      }
    }

    /**
     * Serializes a property to its associated attribute.
     *
     * @param {string} property Property name to reflect.
     * @param {string=} attribute Attribute name to reflect to.
     * @param {any=} value Property value to refect.
     * @return {void}
     */
    _propertyToAttribute (property, attribute, value) {
      this.__serializing = true;
      value = (arguments.length < 3) ? this[property] : value;
      this._valueToNodeAttribute(this, value, attribute || camelToDashCase(property));
      this.__serializing = false;
    }

    /**
     * Sets a typed value to an HTML attribute on a node.
     *
     * This method calls the `_serializeValue` method to convert the typed
     * value to a string.  If the `_serializeValue` method returns `undefined`,
     * the attribute will be removed (this is the default for boolean
     * type `false`).
     *
     * @param {Element | ElementLiteBase} node Element to set attribute to.
     * @param {*} value Value to serialize.
     * @param {string} attribute Attribute name to serialize to.
     * @return {void}
     */
    _valueToNodeAttribute (node, value, attribute) {
      const str = this._serializeValue(value);

      if (str === undefined) {
        node.removeAttribute(attribute);
      } else {
        node.setAttribute(attribute, str);
      }
    }

    /**
     * Converts a typed JavaScript value to a string.
     *
     * This method is called when setting JS property values to
     * HTML attributes.  Users may override this method to provide
     * serialization for custom types.
     *
     * @param {*} value Property value to serialize.
     * @return {string | undefined} String serialized from the provided
     * property  value.
     */
    _serializeValue (value) {
      /* eslint-disable no-fallthrough */
      switch (typeof value) {
        case 'boolean':
          return value ? '' : undefined;
        case 'object':
          if (value instanceof Date) {
            return value.toString();
          } else if (value) {
            try {
              return JSON.stringify(value);
            } catch (x) {
              return '';
            }
          }
        default:
          return value != null ? value.toString() : undefined;
      }
    }

    /**
     * Converts a string to a typed JavaScript value.
     *
     * This method is called when reading HTML attribute values to
     * JS properties.  Users may override this method to provide
     * deserialization for custom `type`s. Types for `Boolean`, `String`,
     * and `Number` convert attributes to the expected types.
     *
     * @param {?string} value Value to deserialize.
     * @param {any=} type Type to deserialize the string to.
     * @return {*} Typed value deserialized from the provided string.
     */
    _deserializeValue (value, type) {
      /** @type {any} */
      let outValue;
      switch (type) {
        case Object:
          try {
            outValue = JSON.parse(value);
          } catch (x) {
            // allow non-JSON literals like Strings and Numbers
            outValue = value;
          }
          break;
        case Array:
          try {
            outValue = JSON.parse(value);
          } catch (x) {
            outValue = null;
            console.warn(`Polymer::Attributes: couldn't decode Array as JSON: ${value}`);
          }
          break;
        case Date:
          // @ts-ignore
          outValue = isNaN(value) ? String(value) : Number(value);
          outValue = new Date(outValue);
          break;
        case Boolean:
          return (value !== null);
        case Number:
          return Number(value);
        default:
          return value;
      }
      return outValue;
    }

    /**
     * Lifecycle callback called when properties are enabled via
     * `_enableProperties`.
     *
     * Users may override this function to implement behavior that is
     * dependent on the element having its property data initialized, e.g.
     * from defaults (initialized from `constructor`, `_initializeProperties`),
     * `attributeChangedCallback`, or values propagated from host e.g. via
     * bindings.  `super.ready()` must be called to ensure the data system
     * becomes enabled.
     *
     * @return {void}
     * @public
     */
    ready () {
      this.__dataReady = true;
      this._flushProperties(true);
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
        (!this.__readOnly || !this.__readOnly[root(path)]) &&
        this._setPendingPropertyOrPath(path, value, true)) this._invalidateProperties();
    }

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
      let info = {path: ''};
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
      let info = {path: ''};
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
      let info = {path: ''};
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
      let info = {path: ''};
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
      let info = {path: ''};
      let array = getProp(this, path, info);
      // use immutability for now
      let ret = [ ...items, ...array ];
      if (items.length) this.set(path, ret);
      return ret.length;
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

  return ElementLiteBase;
});
