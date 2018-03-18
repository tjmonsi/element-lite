(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// @ts-check

// unique global id for deduping mixins.
/** @type {number} */
var dedupeId = 0;

/**
 * @type {Function}
 * @param {!MixinFunction} [mixin]
 * @return {Function}
 */
var dedupingMixin = function (mixin) {
  var mixinApplications = mixin.__mixinApplications;
  if (!mixinApplications) {
    mixinApplications = new WeakMap();
    mixin.__mixinApplications = mixinApplications;
  }
  // maintain a unique id for each mixin
  var mixinDedupeId = dedupeId++;

  /**
 * @type {Function}
 * @param {!MixinFunction} base
 * @return {MixinFunction}
 */
  function dedupingMixin (base) {
    /** @type {(Object | undefined)} */
    var baseSet = base.__mixinSet;
    if (baseSet && baseSet[mixinDedupeId]) {
      return base;
    }

    var map = mixinApplications;

    /** @type {MixinFunction} */
    var extended = map.get(base);
    if (!extended) {
      // @ts-ignore
      extended = mixin(base);
      map.set(base, extended);
    }
    // copy inherited mixin set from the extended class, or the base class
    // NOTE: we avoid use of Set here because some browser (IE11)
    // cannot extend a base Set via the constructor.

    /** @type {(Object | undefined)} */
    var mixinSet = Object.create(extended.__mixinSet || baseSet || null);
    mixinSet[mixinDedupeId] = true;

    /** @type {!MixinFunction} */
    extended.__mixinSet = mixinSet;
    return extended;
  }

  return dedupingMixin;
};

// @ts-check

/**
 * @param {string[]} path
 * @return {string} normalized path
 */
var normalizeArray = function (path) {
  /** @type {string[]} */
  var parts = [];
  for (var i = 0; i < path.length; i++) {
    /** @type {string[]} */
    var args = path[i].toString().split('.');
    for (var j = 0; j < args.length; j++) { parts.push(args[j]); }
  }

  return parts.join('.');
};

/**
 * @param {string} path
 * @return {boolean} if it is a path
 */
var isPath = function (path) { return path.indexOf('.') >= 0; };

/**
 * @param {string} path
 * @return {string} path's root
 */
var root = function (path) { return path.indexOf('.') === -1 ? path : path.slice(0, path.indexOf('.')); };

/**
 * @param {string | string[]} path
 * @return {string} normalize path
 */
var normalize = function (path) { return Array.isArray(path) ? normalizeArray(path) : path; };

/**
 * @param {string | string[]} path
 * @return {string[]} split path into array
 */
var split = function (path) { return Array.isArray(path) ? normalize(path).split('.') : path.toString().split('.'); };

/**
 * @param {object} obj
 * @param {string|array} path
 * @param {?object} info
 * @return {any} the data given a path
 */
var getProp = function (obj, path, info) {
  var prop = obj;
  var parts = split(path);
  // Loop over path parts[0..n-1] and dereference
  for (var i = 0; i < parts.length; i++) {
    if (!prop) { return; }
    var part = parts[i];
    prop = prop[part];
  }
  if (info) { info.path = parts.join('.'); }
  return prop;
};

/**
 * @param {object} obj
 * @param {string} path
 * @param {any} value
 * @return {string} path
 */
var setProp = function (obj, path, value) {
  var prop = obj;
  var parts = split(path);
  var last = parts[parts.length - 1];
  if (parts.length > 1) {
    // Loop over path parts[0..n-2] and dereference
    for (var i = 0; i < parts.length - 1; i++) {
      var part = parts[i];
      prop = prop[part];
      if (!prop) { return; }
    }
    // Set value to object at end of path
    prop[last] = value;
  } else {
    // Simple property set
    prop[path] = value;
  }
  return parts.join('.');
};

// Save map of native properties; this forms a blacklist or properties
// that won't have their values "saved" by `saveAccessorValue`, since
// reading from an HTMLElement accessor from the context of a prototype throws
var nativeProperties = {};
var proto = window.HTMLElement.prototype;

while (proto) {
  var props = Object.getOwnPropertyNames(proto);
  for (var i = 0; i < props.length; i++) { nativeProperties[props[i]] = true; }
  proto = Object.getPrototypeOf(proto);
}

/**
  * Copied from Polymer/polymer/lib/mixins/property-accessors.js
  *
  * Used to save the value of a property that will be overridden with
  * an accessor. If the `model` is a prototype, the values will be saved
  * in `__dataProto`, and it's up to the user (or downstream mixin) to
  * decide how/when to set these values back into the accessors.
  * If `model` is already an instance (it has a `__data` property), then
  * the value will be set as a pending property, meaning the user should
  * call `_invalidateProperties` or `_flushProperties` to take effect
  *
  * @param {Object} model Prototype or instance
  * @param {string} property Name of property
  * @return {void}
  */
function saveAccessorValue (model, property) {
// Don't read/store value for any native properties since they could throw
  if (!nativeProperties[property]) {
    var value = model[property];
    if (value !== undefined) {
      if (model.__data) {
        // Adding accessor to instance; update the property
        // It is the user's responsibility to call _flushProperties
        model._setPendingProperty(property, value);
      } else {
        // Adding accessor to proto; save proto's value for instance-time use
        if (!model.__dataProto) {
          model.__dataProto = {};
        } else if (!model.hasOwnProperty('__dataProto')) {
          model.__dataProto = Object.create(model.__dataProto);
        }
        model.__dataProto[property] = value;
      }
    }
  }
}

var caseMap = {};
// const DASH_TO_CAMEL = /-[a-z]/g;
var CAMEL_TO_DASH = /([A-Z])/g;

// export function dashToCamelCase (dash) {
//   return caseMap[dash] || (
//     caseMap[dash] = dash.indexOf('-') < 0 ? dash : dash.replace(DASH_TO_CAMEL,
//       (m) => m[1].toUpperCase()
//     )
//   );
// }

function camelToDashCase (camel) {
  return caseMap[camel] || (
    caseMap[camel] = camel.replace(CAMEL_TO_DASH, '-$1').toLowerCase()
  );
}

/// <reference path="typings-project/global.d.ts"/>

var ElementLiteBase = dedupingMixin(function (base) {
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
    var output = {};
    for (var p in props) {
      var o = props[p];
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
  var ElementLiteBase = (function (superclass) {
    function ElementLiteBase () {
      superclass.call(this);
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

    if ( superclass ) ElementLiteBase.__proto__ = superclass;
    ElementLiteBase.prototype = Object.create( superclass && superclass.prototype );
    ElementLiteBase.prototype.constructor = ElementLiteBase;

    var staticAccessors = { _properties: { configurable: true },observedAttributes: { configurable: true } };

    /**
      * Called when the element is added to a document.
      * Calls `_enableProperties` to turn on property system from
      * `PropertiesChanged`.
      * @suppress {missingProperties} Super may or may not implement the callback
      * @return {void}
      */
    staticAccessors._properties.get = function () {
      if (!this.hasOwnProperty('__properties')) {
        this.__properties = Object.assign({}, ownProperties(this));
      }
      return this.__properties;
    };

    /**
     * Creates property accessors for the given property names.
     *
     * @param {!Object} props Object whose keys are names of accessors.
     * @return {void}
     * @protected
     */
    ElementLiteBase.createProperties = function createProperties (props) {
      var proto = this.prototype;

      for (var prop in props) {
        var ref = props[prop];
        var readOnly = ref.readOnly;
        var reflectToAttribute = ref.reflectToAttribute;
        var notify = ref.notify;
        var observer = ref.observer;
        // don't stomp an existing accessor
        if (!(prop in proto)) {
          proto._createPropertyAccessor(prop, readOnly, reflectToAttribute, notify, observer);
        }
      }
    };

    /**
      * Implements standard custom elements getter to observes the attributes
      * listed in `properties`.
      * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
      */
    staticAccessors.observedAttributes.get = function () {
      var props = this._properties;
      return props ? Object.keys(props).map(function (p) { return camelToDashCase(p); }) : [];
    };

    /**
      * Overrides `PropertiesChanged` method to return type specified in the
      * static `properties` object for the given property.
      * @param {string} name Name of property
      * @return {*} Type to which to deserialize attribute
      *
      * @protected
      */
    ElementLiteBase.typeForProperty = function typeForProperty (name) {
      var info = this._properties[name];
      return info && info.type;
    };

    ElementLiteBase.prototype.connectedCallback = function connectedCallback () {
      if (superclass.prototype.connectedCallback) {
        superclass.prototype.connectedCallback.call(this);
      }
      this._enableProperties();
    };

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
    ElementLiteBase.prototype._enableProperties = function _enableProperties () {
      if (!this.__dataEnabled) {
        this.__dataEnabled = true;
        // put here setting of attributes
        if (this.__dataInstanceProps) {
          this._initializeInstanceProperties(this.__dataInstanceProps);
          this.__dataInstanceProps = null;
        }
        this.ready();
      }
    };

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
    ElementLiteBase.prototype._createPropertyAccessor = function _createPropertyAccessor (property, readOnly, reflectToAttribute, notify, observer) {
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
    };

    /**
     * Adds the given `property` to a map matching attribute names
     * to property names, using `camelToDashCase`. This map is
     * used when deserializing attribute values to properties.
     *
     * @param {string} property Name of the property
     */
    ElementLiteBase.prototype._addPropertyToAttributeMap = function _addPropertyToAttributeMap (property) {
      var attr = camelToDashCase(property);

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
    };

    /**
     * Defines a property accessor for the given property.
     *
     * @param {string} property Name of the property
     * @param {boolean=} readOnly When true, no setter is created
     * @return {void}
     */
    ElementLiteBase.prototype._definePropertyAccessor = function _definePropertyAccessor (property, readOnly) {
      saveAccessorValue(this, property);
      Object.defineProperty(this, property, {
        // @ts-ignore
        get: function get () { return this._getProperty(property); },
        set: readOnly
          ? function () { console.error(`Cannot set on a read-only property: ${property}`); }
          : function (value) { this._setProperty(property, value); }
      });
    };

    /**
     * Initializes the local storage for property accessors.
     *
     * @return {void}
     * @protected
     * @suppress {invalidCasts}
     */
    ElementLiteBase.prototype._initializeProperties = function _initializeProperties () {
      var this$1 = this;

      var props = ownProperties(this.constructor);
      var keys = props ? Object.keys(props) : [];
      if (!this.hasOwnProperty('__finalized')) {
        this.__finalized = true;
        if (props) {
          this.constructor.createProperties(props);
        }
      }
      // Capture instance properties; these will be set into accessors
      // during first flush. Don't set them here, since we want
      // these to overwrite defaults/constructor assignments
      for (var p in this$1.__dataHasAccessor) {
        if (this$1.hasOwnProperty(p)) {
          this$1.__dataInstanceProps = this$1.__dataInstanceProps || {};
          this$1.__dataInstanceProps[p] = this$1[p];
          delete this$1[p];
        }
      }

      // set default value
      for (var p$1 = 0, l = keys.length; p$1 < l; p$1++) {
        var prop = keys[p$1];
        if (props[prop].value) {
          this$1.__data[prop] = props[prop].value;
        }
      }

      if (this.__dataProto) {
        this._initializeProtoProperties(this.__dataProto);
        this.__dataProto = null;
      }
    };

    /**
     * Called at ready time with bag of instance properties that overwrote
     * accessors when the element upgraded.
     *
     * @param {Object} props Bag of property values that were overwritten
     *   when creating property accessors.
     * @return {void}
     * @protected
     */
    ElementLiteBase.prototype._initializeInstanceProperties = function _initializeInstanceProperties (props) {
      var this$1 = this;

      var readOnly = this.__readOnly;
      for (var prop in props) {
        if (!readOnly || !readOnly[prop]) {
          this$1.__dataPending = this$1.__dataPending || {};
          this$1.__dataOld = this$1.__dataOld || {};
          this$1.__data[prop] = this$1.__dataPending[prop] = props[prop];
        }
      }
    };

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
    ElementLiteBase.prototype._initializeProtoProperties = function _initializeProtoProperties (props) {
      var this$1 = this;

      for (var p in props) {
        this$1._setProperty(p, props[p]);
      }
    };

    /**
     * Initializes the observers to call methods when property values have changed
     *
     * @return {void}
     * @protected
     * @suppress {invalidCasts}
     */

    ElementLiteBase.prototype._initializeObservers = function _initializeObservers () {
      var this$1 = this;

      var observers = this.constructor.observers;

      if (!this.hasOwnProperty('__dataMethodObserver')) {
        this.__dataMethodObserver = Object.assign({}, this.__dataMethodObserver);
      }

      if (observers && observers.length) {
        var loop = function ( i, l ) {
          var fnArgs = observers[i].split('(');
          var fn = fnArgs[0].trim();
          var args = fnArgs[1].trim().replace(/\)$/g, '').split(',').map(function (arg) { return arg.trim(); });

          for (var p = 0, m = args.length; p < m; p++) {
            var rootPath = root(args[p]);

            if (!this$1.__dataMethodObserver[args[p]]) {
              this$1.__dataMethodObserver[args[p]] = { methods: [], root: root(args[p]) };
            }

            if (this$1.__dataMethodObserver[args[p]].methods.findIndex(function (item) { return item.fn === fn; }) < 0) {
              this$1.__dataMethodObserver[args[p]].methods.push({ fn: fn, args: args });
            }

            if (!this$1.__dataMethodObserver[rootPath]) {
              this$1.__dataMethodObserver[rootPath] = { methods: [], root: root(rootPath) };
            }

            if (this$1.__dataMethodObserver[rootPath].methods.findIndex(function (item) { return item.fn === fn; }) < 0) {
              this$1.__dataMethodObserver[rootPath].methods.push({ fn: fn, args: args });
            }
          }
        };

        for (var i = 0, l = observers.length; i < l; i++) loop( i, l );
      }
    };

    /**
     * Updates the local storage for a property (via `_setPendingProperty`)
     * and enqueues a `_proeprtiesChanged` callback.
     *
     * @param {string} property Name of the property
     * @param {*} value Value to set
     * @return {void}
     * @protected
     */
    ElementLiteBase.prototype._setProperty = function _setProperty (property, value) {
      if (this._setPendingProperty(property, value)) {
        this._invalidateProperties();
      }
    };

    /**
     * Returns the value for the given property.
     *
     * @param {string} property Name of property
     * @return {*} Value for the given property
     * @protected
     */
    ElementLiteBase.prototype._getProperty = function _getProperty (property) {
      return this.__data[property];
    };

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
    ElementLiteBase.prototype._setPendingPropertyOrPath = function _setPendingPropertyOrPath (path, value, shouldNotify, isPathNotification) {
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
          var old = getProp(this, path, null);
          path = setProp(this, path, value);
          // Use property-accessor's simpler dirty check
          if (!path || !this._shouldPropertyChange(path, value, old)) { return false; }
        }
        this.__dataHasPaths = true;
        return this._setPendingProperty(path, value, shouldNotify);
      } else {
        if (this.__dataHasAccessor && this.__dataHasAccessor[path]) { return this._setPendingProperty(path, value, shouldNotify); }
        else { this[path] = value; }
      }
      return false;
    };

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
    ElementLiteBase.prototype._setPendingProperty = function _setPendingProperty (property, value, shouldNotify) {
      var path = this.__dataHasPaths && isPath(property);
      var prevProps = path ? this.__dataTemp : this.__data;
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
    };

    /**
     * Marks the properties as invalid, and enqueues an async
     * `_propertiesChanged` callback.
     *
     * @return {void}
     * @protected
     */
    ElementLiteBase.prototype._invalidateProperties = function _invalidateProperties () {
      var this$1 = this;

      if (!this.__dataInvalid && this.__dataReady) {
        this.__dataInvalid = true;

        Promise.resolve().then(function () {
          if (this$1.__dataInvalid) {
            this$1.__dataInvalid = false;
            this$1._flushProperties();
          }
        });
      }
    };

    /**
     * Calls the `_propertiesChanged` callback with the current set of
     * pending changes (and old values recorded when pending changes were
     * set), and resets the pending set of changes. Generally, this method
     * should not be called in user code.
     *
     * @return {void}
     * @protected
     */
    ElementLiteBase.prototype._flushProperties = function _flushProperties () {
      this.__dataCounter++;

      var props = this.__data;
      var changedProps = this.__dataPending;
      var old = this.__dataOld;
      if (this._shouldPropertiesChange(props, changedProps, old)) {
        this.__dataPending = null;
        this.__dataOld = {};
        this._propertiesChanged(props, changedProps, old);
      }

      this.__dataCounter--;
    };

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
    ElementLiteBase.prototype._shouldPropertiesChange = function _shouldPropertiesChange (currentProps, changedProps, oldProps) {
      return Boolean(changedProps);
    };

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
    ElementLiteBase.prototype._propertiesChanged = function _propertiesChanged (currentProps, changedProps, oldProps) {
      var this$1 = this;
 // eslint-disable-line no-unused-vars
      var fns = {};
      var keys = Object.keys(changedProps);
      this.__dataHasPaths = false;

      for (var i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        var prop = root(key);

        if (this$1.__dataReflectToAttribute[prop]) {
          this$1._propertyToAttribute(prop, this$1.__dataAttributeProperties[prop], this$1.__data[prop]);
        }

        if (this$1.__dataNotify[root(prop)]) {
          this$1.dispatchEvent(new window.CustomEvent(`${camelToDashCase(root(prop))}-changed`, { detail: this$1.__data[root(prop)] }));
        }

        if (this$1.__dataObserver[prop]) {
          var fn = this$1[this$1.__dataObserver[prop]];
          var args = [this$1.__data[prop], oldProps && oldProps[prop]];

          if (fn) {
            fns[this$1.__dataObserver[prop]] = { fn: fn.bind(this$1), args: args };
          } else {
            console.warn(`There's not observer named ${this$1.__dataObserver[prop]} for ${prop}`);
          }
        }

        if (this$1.__dataMethodObserver[key]) {
          var ref = this$1.__dataMethodObserver[key];
          var methods = ref.methods;
          for (var p = 0, m = methods.length; p < m; p++) {
            var ref$1 = methods[p];
            var fnName = ref$1.fn;
            var argNames = ref$1.args;
            var fn$1 = this$1[fnName];
            var args$1 = [];
            for (var a = 0, n = argNames.length; a < n; a++) {
              args$1.push(this$1.get(argNames[a]));
            }

            if (fn$1) {
              fns[fnName] = { fn: fn$1.bind(this$1), args: args$1 };
            } else {
              console.warn(`There's not method named ${fnName}`);
            }
          }
        }
      }

      keys = Object.keys(fns);
      for (var i$1 = 0, l$1 = keys.length; i$1 < l$1; i$1++) {
        var ref$2 = fns[keys[i$1]];
        var fn$2 = ref$2.fn;
        var args$2 = ref$2.args;
        fn$2.apply(void 0, args$2);
      }

      // Clear temporary cache at end of turn
      if (this.__dataCounter === 1) {
        this.__dataTemp = {};
      }
    };

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
    ElementLiteBase.prototype._shouldPropertyChange = function _shouldPropertyChange (property, value, old) {
      return (
        // Strict equality check
        (old !== value &&
        // This ensures (old==NaN, value==NaN) always returns false
        (old === old || value === value)) // eslint-disable-line
      );
    };

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
    ElementLiteBase.prototype.attributeChangedCallback = function attributeChangedCallback (name, old, value) {
      if (old !== value) {
        this._attributeToProperty(name, value);
      }

      if (superclass.prototype.attributeChangedCallback) {
        superclass.prototype.attributeChangedCallback.call(this, name, old, value);
      }
    };

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
    ElementLiteBase.prototype._attributeToProperty = function _attributeToProperty (attribute, value) {
      if (!this.__serializing) {
        var map = this.__dataAttributes;
        var property = (map && map[attribute]) || attribute;
        this[property] = this._deserializeValue(value, this.constructor.typeForProperty(property));
      }
    };

    /**
     * Serializes a property to its associated attribute.
     *
     * @param {string} property Property name to reflect.
     * @param {string=} attribute Attribute name to reflect to.
     * @param {any=} value Property value to refect.
     * @return {void}
     */
    ElementLiteBase.prototype._propertyToAttribute = function _propertyToAttribute (property, attribute, value) {
      this.__serializing = true;
      value = (arguments.length < 3) ? this[property] : value;
      this._valueToNodeAttribute(this, value, attribute || camelToDashCase(property));
      this.__serializing = false;
    };

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
    ElementLiteBase.prototype._valueToNodeAttribute = function _valueToNodeAttribute (node, value, attribute) {
      var str = this._serializeValue(value);

      if (str === undefined) {
        node.removeAttribute(attribute);
      } else {
        node.setAttribute(attribute, str);
      }
    };

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
    ElementLiteBase.prototype._serializeValue = function _serializeValue (value) {
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
    };

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
    ElementLiteBase.prototype._deserializeValue = function _deserializeValue (value, type) {
      /** @type {any} */
      var outValue;
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
    };

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
    ElementLiteBase.prototype.ready = function ready () {
      this.__dataReady = true;
      this._flushProperties();
    };

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
    ElementLiteBase.prototype.set = function set (path, value) {
      if (path &&
        (!this.__readOnly || !this.__readOnly[root(path)]) &&
        this._setPendingPropertyOrPath(path, value, true)) { this._invalidateProperties(); }
    };

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
    ElementLiteBase.prototype.push = function push (path) {
      var items = [], len = arguments.length - 1;
      while ( len-- > 0 ) items[ len ] = arguments[ len + 1 ];

      var info = {path: ''};
      var array = getProp(this, path, info);
      // use immutability for now
      var ret = array.concat( items );
      if (items.length) { this.set(path, ret); }
      return ret.length;
    };

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
    ElementLiteBase.prototype.pop = function pop (path) {
      var info = {path: ''};
      var array = getProp(this, path, info);
      var hadLength = Boolean(array.length);
      // use immutability for now
      if (hadLength) {
        var ret = array.slice(0, -1);
        this.set(path, ret);
        return array.slice(-1);
      }
    };

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
    ElementLiteBase.prototype.splice = function splice (path, start, deleteCount) {
      var items = [], len = arguments.length - 3;
      while ( len-- > 0 ) items[ len ] = arguments[ len + 3 ];

      var info = {path: ''};
      var array = getProp(this, path, info);
      // Normalize fancy native splice handling of crazy start values
      if (start < 0) { start = array.length - Math.floor(-start); }
      else if (start) { start = Math.floor(start); }
      // array.splice does different things based on the number of arguments
      // you pass in. Therefore, array.splice(0) and array.splice(0, undefined)
      // do different things. In the former, the whole array is cleared. In the
      // latter, no items are removed.
      // This means that we need to detect whether 1. one of the arguments
      // is actually passed in and then 2. determine how many arguments
      // we should pass on to the native array.splice
      //
      var ret;
      // Omit any additional arguments if they were not passed in
      ret = array.slice(0, start).concat( items, array.slice(start + deleteCount) );
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
    };

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
    ElementLiteBase.prototype.shift = function shift (path) {
      var info = {path: ''};
      var array = getProp(this, path, info);
      var hadLength = Boolean(array.length);
      // use immutability for now
      if (hadLength) {
        var ret = array.slice(1);
        this.set(path, ret);
        return array.slice(0, 1);
      }
    };

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
    ElementLiteBase.prototype.unshift = function unshift (path) {
      var items = [], len = arguments.length - 1;
      while ( len-- > 0 ) items[ len ] = arguments[ len + 1 ];

      var info = {path: ''};
      var array = getProp(this, path, info);
      // use immutability for now
      var ret = items.concat( array );
      if (items.length) { this.set(path, ret); }
      return ret.length;
    };

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
    ElementLiteBase.prototype.get = function get (path, root$$1) {
      return getProp(root$$1 || this, path, null);
    };

    Object.defineProperties( ElementLiteBase, staticAccessors );

    return ElementLiteBase;
  }((base)));

  return ElementLiteBase;
});

var ElementLiteStaticShadow = dedupingMixin(function (base) {
  /**
   * ElementLite is a set of methods coming from Polymer Property Mixins and Property Accessor Mixins
   * that automates the creation of setter and getters given a list of properties and
   * allows auto-calling of methods given observers. This uses a static shadow DOM. It doesn't use
   * lit-html
   * @extends {ElementLiteBase}
  */
  var ElementLiteStaticShadow = (function (superclass) {
    function ElementLiteStaticShadow () {
      superclass.apply(this, arguments);
    }

    if ( superclass ) ElementLiteStaticShadow.__proto__ = superclass;
    ElementLiteStaticShadow.prototype = Object.create( superclass && superclass.prototype );
    ElementLiteStaticShadow.prototype.constructor = ElementLiteStaticShadow;

    ElementLiteStaticShadow.prototype.ready = function ready () {
      // attaches shadow
      this.attachShadow({ mode: 'open' });
      superclass.prototype.ready.call(this);

      // renders the shadowRoot statically
      this.shadowRoot = this.render();
    };

    /**
     * Return the html string of the shadowRoot
     */
    ElementLiteStaticShadow.prototype.render = function render () { return ``; };

    return ElementLiteStaticShadow;
  }(ElementLiteBase(base)));

  return ElementLiteStaticShadow;
});

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * TypeScript has a problem with precompiling templates literals
 * https://github.com/Microsoft/TypeScript/issues/17956
 *
 * TODO(justinfagnani): Run tests compiled to ES5 with both Babel and
 * TypeScript to verify correctness.
 */
var envCachesTemplates = (function (t) { return t() === t(); })(function () { return (function (s) { return s; }) ``; });
// The first argument to JS template tags retain identity across multiple
// calls to a tag for the same literal, so we can cache work done per literal
// in a Map.
var templates = new Map();
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
var html = function (strings) {
    var values = [], len = arguments.length - 1;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

    return litTag(strings, values, templates, false);
};
function litTag(strings, values, templates, isSvg) {
    var key = envCachesTemplates ?
        strings :
        strings.join('{{--uniqueness-workaround--}}');
    var template = templates.get(key);
    if (template === undefined) {
        template = new Template(strings, isSvg);
        templates.set(key, template);
    }
    return new TemplateResult(template, values);
}
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
var TemplateResult = function TemplateResult(template, values) {
    this.template = template;
    this.values = values;
};
/**
 * Renders a template to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 */
function render(result, container, partCallback) {
    if ( partCallback === void 0 ) partCallback = defaultPartCallback;

    var instance = container.__templateInstance;
    // Repeat render, just call update()
    if (instance !== undefined && instance.template === result.template &&
        instance._partCallback === partCallback) {
        instance.update(result.values);
        return;
    }
    // First render, create a new TemplateInstance and append it
    instance = new TemplateInstance(result.template, partCallback);
    container.__templateInstance = instance;
    var fragment = instance._clone();
    instance.update(result.values);
    removeNodes(container, container.firstChild);
    container.appendChild(fragment);
}
/**
 * An expression marker with embedded unique key to avoid
 * https://github.com/PolymerLabs/lit-html/issues/62
 */
var marker = `{{lit-${String(Math.random()).slice(2)}}}`;
var nodeMarker = `<!--${marker}-->`;
var markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#attributes-0
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-character
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
var lastAttributeNameRegex = /[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/;
/**
 * Finds the closing index of the last closed HTML tag.
 * This has 3 possible return values:
 *   - `-1`, meaning there is no tag in str.
 *   - `string.length`, meaning the last opened tag is unclosed.
 *   - Some positive number < str.length, meaning the index of the closing '>'.
 */
function findTagClose(str) {
    var close = str.lastIndexOf('>');
    var open = str.indexOf('<', close + 1);
    return open > -1 ? str.length : close;
}
/**
 * A placeholder for a dynamic expression in an HTML template.
 *
 * There are two built-in part types: AttributePart and NodePart. NodeParts
 * always represent a single dynamic expression, while AttributeParts may
 * represent as many expressions are contained in the attribute.
 *
 * A Template's parts are mutable, so parts can be replaced or modified
 * (possibly to implement different template semantics). The contract is that
 * parts can only be replaced, not removed, added or reordered, and parts must
 * always consume the correct number of values in their `update()` method.
 *
 * TODO(justinfagnani): That requirement is a little fragile. A
 * TemplateInstance could instead be more careful about which values it gives
 * to Part.update().
 */
var TemplatePart = function TemplatePart(type, index, name, rawName, strings) {
    this.type = type;
    this.index = index;
    this.name = name;
    this.rawName = rawName;
    this.strings = strings;
};
var Template = function Template(strings, svg) {
    var this$1 = this;
    if ( svg === void 0 ) svg = false;

    this.parts = [];
    var element = this.element = document.createElement('template');
    element.innerHTML = this._getHtml(strings, svg);
    var content = element.content;
    if (svg) {
        var svgElement = content.firstChild;
        content.removeChild(svgElement);
        reparentNodes(content, svgElement.firstChild);
    }
    // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
    var walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
           NodeFilter.SHOW_TEXT */, null, false);
    var index = -1;
    var partIndex = 0;
    var nodesToRemove = [];
    // The actual previous node, accounting for removals: if a node is removed
    // it will never be the previousNode.
    var previousNode;
    // Used to set previousNode at the top of the loop.
    var currentNode;
    while (walker.nextNode()) {
        index++;
        previousNode = currentNode;
        var node = currentNode = walker.currentNode;
        if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
            if (!node.hasAttributes()) {
                continue;
            }
            var attributes = node.attributes;
            // Per https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
            // attributes are not guaranteed to be returned in document order. In
            // particular, Edge/IE can return them out of order, so we cannot assume
            // a correspondance between part index and attribute index.
            var count = 0;
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].value.indexOf(marker) >= 0) {
                    count++;
                }
            }
            while (count-- > 0) {
                // Get the template literal section leading up to the first
                // expression in this attribute attribute
                var stringForPart = strings[partIndex];
                // Find the attribute name
                var attributeNameInPart = lastAttributeNameRegex.exec(stringForPart)[1];
                // Find the corresponding attribute
                var attribute = attributes.getNamedItem(attributeNameInPart);
                var stringsForAttributeValue = attribute.value.split(markerRegex);
                this$1.parts.push(new TemplatePart('attribute', index, attribute.name, attributeNameInPart, stringsForAttributeValue));
                node.removeAttribute(attribute.name);
                partIndex += stringsForAttributeValue.length - 1;
            }
        }
        else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
            var nodeValue = node.nodeValue;
            if (nodeValue.indexOf(marker) < 0) {
                continue;
            }
            var parent = node.parentNode;
            var strings$1 = nodeValue.split(markerRegex);
            var lastIndex = strings$1.length - 1;
            // We have a part for each match found
            partIndex += lastIndex;
            // We keep this current node, but reset its content to the last
            // literal part. We insert new literal nodes before this so that the
            // tree walker keeps its position correctly.
            node.textContent = strings$1[lastIndex];
            // Generate a new text node for each literal section
            // These nodes are also used as the markers for node parts
            for (var i$1 = 0; i$1 < lastIndex; i$1++) {
                parent.insertBefore(document.createTextNode(strings$1[i$1]), node);
                this$1.parts.push(new TemplatePart('node', index++));
            }
        }
        else if (node.nodeType === 8 /* Node.COMMENT_NODE */ &&
            node.nodeValue === marker) {
            var parent$1 = node.parentNode;
            // Add a new marker node to be the startNode of the Part if any of the
            // following are true:
            //  * We don't have a previousSibling
            //  * previousSibling is being removed (thus it's not the
            //`previousNode`)
            //  * previousSibling is not a Text node
            //
            // TODO(justinfagnani): We should be able to use the previousNode here
            // as the marker node and reduce the number of extra nodes we add to a
            // template. See https://github.com/PolymerLabs/lit-html/issues/147
            var previousSibling = node.previousSibling;
            if (previousSibling === null || previousSibling !== previousNode ||
                previousSibling.nodeType !== Node.TEXT_NODE) {
                parent$1.insertBefore(document.createTextNode(''), node);
            }
            else {
                index--;
            }
            this$1.parts.push(new TemplatePart('node', index++));
            nodesToRemove.push(node);
            // If we don't have a nextSibling add a marker node.
            // We don't have to check if the next node is going to be removed,
            // because that node will induce a new marker if so.
            if (node.nextSibling === null) {
                parent$1.insertBefore(document.createTextNode(''), node);
            }
            else {
                index--;
            }
            currentNode = previousNode;
            partIndex++;
        }
    }
    // Remove text binding nodes after the walk to not disturb the TreeWalker
    for (var n of nodesToRemove) {
        n.parentNode.removeChild(n);
    }
};
/**
 * Returns a string of HTML used to create a <template> element.
 */
Template.prototype._getHtml = function _getHtml (strings, svg) {
    var l = strings.length - 1;
    var html = '';
    var isTextBinding = true;
    for (var i = 0; i < l; i++) {
        var s = strings[i];
        html += s;
        // We're in a text position if the previous string closed its tags.
        // If it doesn't have any tags, then we use the previous text position
        // state.
        var closing = findTagClose(s);
        isTextBinding = closing > -1 ? closing < s.length : isTextBinding;
        html += isTextBinding ? nodeMarker : marker;
    }
    html += strings[l];
    return svg ? `<svg>${html}</svg>` : html;
};
/**
 * Returns a value ready to be inserted into a Part from a user-provided value.
 *
 * If the user value is a directive, this invokes the directive with the given
 * part. If the value is null, it's converted to undefined to work better
 * with certain DOM APIs, like textContent.
 */
var getValue = function (part, value) {
    // `null` as the value of a Text node will render the string 'null'
    // so we convert it to undefined
    if (isDirective(value)) {
        value = value(part);
        return directiveValue;
    }
    return value === null ? undefined : value;
};
var isDirective = function (o) { return typeof o === 'function' && o.__litDirective === true; };
var directiveValue = {};
var AttributePart = function AttributePart(instance, element, name, strings) {
    this.instance = instance;
    this.element = element;
    this.name = name;
    this.strings = strings;
    this.size = strings.length - 1;
};
AttributePart.prototype._interpolate = function _interpolate (values, startIndex) {
        var this$1 = this;

    var strings = this.strings;
    var l = strings.length - 1;
    var text = '';
    for (var i = 0; i < l; i++) {
        text += strings[i];
        var v = getValue(this$1, values[startIndex + i]);
        if (v && v !== directiveValue &&
            (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
            for (var t of v) {
                // TODO: we need to recursively call getValue into iterables...
                text += t;
            }
        }
        else {
            text += v;
        }
    }
    return text + strings[l];
};
AttributePart.prototype.setValue = function setValue (values, startIndex) {
    var text = this._interpolate(values, startIndex);
    this.element.setAttribute(this.name, text);
};
var NodePart = function NodePart(instance, startNode, endNode) {
    this.instance = instance;
    this.startNode = startNode;
    this.endNode = endNode;
    this._previousValue = undefined;
};
NodePart.prototype.setValue = function setValue (value) {
    value = getValue(this, value);
    if (value === directiveValue) {
        return;
    }
    if (value === null ||
        !(typeof value === 'object' || typeof value === 'function')) {
        // Handle primitive values
        // If the value didn't change, do nothing
        if (value === this._previousValue) {
            return;
        }
        this._setText(value);
    }
    else if (value instanceof TemplateResult) {
        this._setTemplateResult(value);
    }
    else if (Array.isArray(value) || value[Symbol.iterator]) {
        this._setIterable(value);
    }
    else if (value instanceof Node) {
        this._setNode(value);
    }
    else if (value.then !== undefined) {
        this._setPromise(value);
    }
    else {
        // Fallback, will render the string representation
        this._setText(value);
    }
};
NodePart.prototype._insert = function _insert (node) {
    this.endNode.parentNode.insertBefore(node, this.endNode);
};
NodePart.prototype._setNode = function _setNode (value) {
    if (this._previousValue === value) {
        return;
    }
    this.clear();
    this._insert(value);
    this._previousValue = value;
};
NodePart.prototype._setText = function _setText (value) {
    var node = this.startNode.nextSibling;
    value = value === undefined ? '' : value;
    if (node === this.endNode.previousSibling &&
        node.nodeType === Node.TEXT_NODE) {
        // If we only have a single text node between the markers, we can just
        // set its value, rather than replacing it.
        // TODO(justinfagnani): Can we just check if _previousValue is
        // primitive?
        node.textContent = value;
    }
    else {
        this._setNode(document.createTextNode(value));
    }
    this._previousValue = value;
};
NodePart.prototype._setTemplateResult = function _setTemplateResult (value) {
    var instance;
    if (this._previousValue &&
        this._previousValue.template === value.template) {
        instance = this._previousValue;
    }
    else {
        instance =
            new TemplateInstance(value.template, this.instance._partCallback);
        this._setNode(instance._clone());
        this._previousValue = instance;
    }
    instance.update(value.values);
};
NodePart.prototype._setIterable = function _setIterable (value) {
        var this$1 = this;

    // For an Iterable, we create a new InstancePart per item, then set its
    // value to the item. This is a little bit of overhead for every item in
    // an Iterable, but it lets us recurse easily and efficiently update Arrays
    // of TemplateResults that will be commonly returned from expressions like:
    // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
    // If _previousValue is an array, then the previous render was of an
    // iterable and _previousValue will contain the NodeParts from the previous
    // render. If _previousValue is not an array, clear this part and make a new
    // array for NodeParts.
    if (!Array.isArray(this._previousValue)) {
        this.clear();
        this._previousValue = [];
    }
    // Lets us keep track of how many items we stamped so we can clear leftover
    // items from a previous render
    var itemParts = this._previousValue;
    var partIndex = 0;
    for (var item of value) {
        // Try to reuse an existing part
        var itemPart = itemParts[partIndex];
        // If no existing part, create a new one
        if (itemPart === undefined) {
            // If we're creating the first item part, it's startNode should be the
            // container's startNode
            var itemStart = this$1.startNode;
            // If we're not creating the first part, create a new separator marker
            // node, and fix up the previous part's endNode to point to it
            if (partIndex > 0) {
                var previousPart = itemParts[partIndex - 1];
                itemStart = previousPart.endNode = document.createTextNode('');
                this$1._insert(itemStart);
            }
            itemPart = new NodePart(this$1.instance, itemStart, this$1.endNode);
            itemParts.push(itemPart);
        }
        itemPart.setValue(item);
        partIndex++;
    }
    if (partIndex === 0) {
        this.clear();
        this._previousValue = undefined;
    }
    else if (partIndex < itemParts.length) {
        var lastPart = itemParts[partIndex - 1];
        // Truncate the parts array so _previousValue reflects the current state
        itemParts.length = partIndex;
        this.clear(lastPart.endNode.previousSibling);
        lastPart.endNode = this.endNode;
    }
};
NodePart.prototype._setPromise = function _setPromise (value) {
        var this$1 = this;

    this._previousValue = value;
    value.then(function (v) {
        if (this$1._previousValue === value) {
            this$1.setValue(v);
        }
    });
};
NodePart.prototype.clear = function clear (startNode) {
        if ( startNode === void 0 ) startNode = this.startNode;

    removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
};
var defaultPartCallback = function (instance, templatePart, node) {
    if (templatePart.type === 'attribute') {
        return new AttributePart(instance, node, templatePart.name, templatePart.strings);
    }
    else if (templatePart.type === 'node') {
        return new NodePart(instance, node, node.nextSibling);
    }
    throw new Error(`Unknown part type ${templatePart.type}`);
};
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
var TemplateInstance = function TemplateInstance(template, partCallback) {
    if ( partCallback === void 0 ) partCallback = defaultPartCallback;

    this._parts = [];
    this.template = template;
    this._partCallback = partCallback;
};
TemplateInstance.prototype.update = function update (values) {
        var this$1 = this;

    var valueIndex = 0;
    for (var part of this$1._parts) {
        if (part.size === undefined) {
            part.setValue(values[valueIndex]);
            valueIndex++;
        }
        else {
            part.setValue(values, valueIndex);
            valueIndex += part.size;
        }
    }
};
TemplateInstance.prototype._clone = function _clone () {
        var this$1 = this;

    var fragment = document.importNode(this.template.element.content, true);
    var parts = this.template.parts;
    if (parts.length > 0) {
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
        // null
        var walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
               NodeFilter.SHOW_TEXT */, null, false);
        var index = -1;
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            while (index < part.index) {
                index++;
                walker.nextNode();
            }
            this$1._parts.push(this$1._partCallback(this$1, part, walker.currentNode));
        }
    }
    return fragment;
};
/**
 * Reparents nodes, starting from `startNode` (inclusive) to `endNode`
 * (exclusive), into another container (could be the same container), before
 * `beforeNode`. If `beforeNode` is null, it appends the nodes to the
 * container.
 */
var reparentNodes = function (container, start, end, before) {
    if ( end === void 0 ) end = null;
    if ( before === void 0 ) before = null;

    var node = start;
    while (node !== end) {
        var n = node.nextSibling;
        container.insertBefore(node, before);
        node = n;
    }
};
/**
 * Removes nodes, starting from `startNode` (inclusive) to `endNode`
 * (exclusive), from `container`.
 */
var removeNodes = function (container, startNode, endNode) {
    if ( endNode === void 0 ) endNode = null;

    var node = startNode;
    while (node !== endNode) {
        var n = node.nextSibling;
        container.removeChild(node);
        node = n;
    }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 *
 * @param result Renders a `TemplateResult` to a container using the
 * `extendedPartCallback` PartCallback, which allows templates to set
 * properties and declarative event handlers.
 *
 * Properties are set by default, instead of attributes. Attribute names in
 * lit-html templates preserve case, so properties are case sensitive. If an
 * expression takes up an entire attribute value, then the property is set to
 * that value. If an expression is interpolated with a string or other
 * expressions then the property is set to the string result of the
 * interpolation.
 *
 * To set an attribute instead of a property, append a `$` suffix to the
 * attribute name.
 *
 * Example:
 *
 *     html`<button class$="primary">Buy Now</button>`
 *
 * To set an event handler, prefix the attribute name with `on-`:
 *
 * Example:
 *
 *     html`<button on-click=${(e)=> this.onClickHandler(e)}>Buy Now</button>`
 *
 */
function render$1(result, container) {
    render(result, container, extendedPartCallback);
}
var extendedPartCallback = function (instance, templatePart, node) {
    if (templatePart.type === 'attribute') {
        if (templatePart.rawName.startsWith('on-')) {
            var eventName = templatePart.rawName.slice(3);
            return new EventPart(instance, node, eventName);
        }
        if (templatePart.name.endsWith('$')) {
            var name = templatePart.name.slice(0, -1);
            return new AttributePart(instance, node, name, templatePart.strings);
        }
        return new PropertyPart(instance, node, templatePart.rawName, templatePart.strings);
    }
    return defaultPartCallback(instance, templatePart, node);
};
var PropertyPart = (function (AttributePart$$1) {
    function PropertyPart () {
        AttributePart$$1.apply(this, arguments);
    }

    if ( AttributePart$$1 ) PropertyPart.__proto__ = AttributePart$$1;
    PropertyPart.prototype = Object.create( AttributePart$$1 && AttributePart$$1.prototype );
    PropertyPart.prototype.constructor = PropertyPart;

    PropertyPart.prototype.setValue = function setValue (values, startIndex) {
        var s = this.strings;
        var value;
        if (s.length === 2 && s[0] === '' && s[1] === '') {
            // An expression that occupies the whole attribute value will leave
            // leading and trailing empty strings.
            value = getValue(this, values[startIndex]);
        }
        else {
            // Interpolation, so interpolate
            value = this._interpolate(values, startIndex);
        }
        this.element[this.name] = value;
    };

    return PropertyPart;
}(AttributePart));
var EventPart = function EventPart(instance, element, eventName) {
    this.instance = instance;
    this.element = element;
    this.eventName = eventName;
};
EventPart.prototype.setValue = function setValue (value) {
    var listener = getValue(this, value);
    var previous = this._listener;
    if (listener === previous) {
        return;
    }
    this._listener = listener;
    if (previous != null) {
        this.element.removeEventListener(this.eventName, previous);
    }
    if (listener != null) {
        this.element.addEventListener(this.eventName, listener);
    }
};

/// <reference path="typings-project/global.d.ts"/>
var ElementLiteLitOnly = dedupingMixin(function (base) {
  /**
   * ElementLite is a set of methods coming from Polymer Property Mixins and Property Accessor Mixins
   * that automates the creation of setter and getters given a list of properties and
   * allows auto-calling of methods given observers. This doesn't use the base ElementLite, but uses lit-html
   * only.
   *
   * @extends {HTMLElement}
  */
  var ElementLiteLitOnly = (function (superclass) {
    function ElementLiteLitOnly () {
      superclass.apply(this, arguments);
    }

    if ( superclass ) ElementLiteLitOnly.__proto__ = superclass;
    ElementLiteLitOnly.prototype = Object.create( superclass && superclass.prototype );
    ElementLiteLitOnly.prototype.constructor = ElementLiteLitOnly;

    ElementLiteLitOnly.prototype.connectedCallback = function connectedCallback () {
      if (superclass.prototype.connectedCallback) { superclass.prototype.connectedCallback.call(this); }
      this.attachShadow({ mode: 'open' });

      // renders the shadowRoot statically
      var result = this.render(this);

      if (result && this.shadowRoot) {
        render$1(this.render(this) || html``, /** @type {DocumentFragment} */(this.shadowRoot));
      }
    };

    /**
     * Return a template result to render using lit-html.
     */
    ElementLiteLitOnly.prototype.render = function render (self) { return html``; };

    return ElementLiteLitOnly;
  }((base)));

  return ElementLiteLitOnly;
});

var ElementLite = dedupingMixin(function (base) {
  /**
   * ElementLite is a set of methods coming from Polymer Property Mixins and Property Accessor Mixins
   * that automates the creation of setter and getters given a list of properties and
   * allows auto-calling of methods given observers.
   * @extends {ElementLiteBase}
  */
  var ElementLite = (function (superclass) {
    function ElementLite () {
      superclass.apply(this, arguments);
    }

    if ( superclass ) ElementLite.__proto__ = superclass;
    ElementLite.prototype = Object.create( superclass && superclass.prototype );
    ElementLite.prototype.constructor = ElementLite;

    var prototypeAccessors = { afterRender: { configurable: true } };
    var staticAccessors = { noShadow: { configurable: true } };

    staticAccessors.noShadow.get = function () {
      return false;
    };

    ElementLite.prototype.ready = function ready () {
      if (!this.constructor.noShadow) { this.attachShadow({ mode: 'open' }); }
      superclass.prototype.ready.call(this);
      this._setShadow();
    };

    ElementLite.prototype._setShadow = function _setShadow () {
      var result = this.render(this);
      if (result) {
        render$1(this.render(this) || html``, this.shadowRoot || this);
      }
    };

    /*
     * This is called when the attributes/properties has been changed.
     * This function in particular re-renders parts of the shadowRoot
     * based on lit-html's render function.
     */
    ElementLite.prototype._propertiesChanged = function _propertiesChanged (currentProps, changedProps, oldProps) {
      var this$1 = this;

      this.__isChanging = true;
      superclass.prototype._propertiesChanged.call(this, currentProps, changedProps, oldProps);
      this._setShadow();

      if (this.__resolveRenderComplete) {
        window.requestAnimationFrame(function () {
          this$1.__resolveRenderComplete();
        });
      }

      this.__isChanging = false;
    };

    prototypeAccessors.afterRender.get = function () {
      var this$1 = this;

      if (!this.__renderComplete) {
        this.__renderComplete = new Promise(function (resolve) {
          this$1.__resolveRenderComplete = function () {
            this$1.__resolveRenderComplete = this$1.__renderComplete = null;
            resolve();
          };
        });
        if (!this.__isInvalid && this.__resolveRenderComplete) {
          this.__resolveRenderComplete();
        }
      }
      return this.__renderComplete;
    };

    /**
     * Override which provides tracking of invalidated state.
    */
    ElementLite.prototype._invalidateProperties = function _invalidateProperties () {
      this.__isInvalid = true;
      superclass.prototype._invalidateProperties.call(this);
    };

    /**
     * Return a template result to render using lit-html.
     */
    ElementLite.prototype.render = function render (self) { return html``; };

    /**
     * Helper method to re-render the whole setup.
     */
    ElementLite.prototype.invalidate = function invalidate () {
      this._invalidateProperties();
    };

    Object.defineProperties( ElementLite.prototype, prototypeAccessors );
    Object.defineProperties( ElementLite, staticAccessors );

    return ElementLite;
  }(ElementLiteBase(/** @type {HTMLElement} */(base))));

  return ElementLite;
});

// @ts-nocheck
var sinon = window.sinon;

/**
 * @extends {ElementLite}
*/
var TestElement = (function (superclass) {
  function TestElement () {
    superclass.call(this);
    this._boundedButtonClicked = this._buttonClicked.bind(this);
    sinon.spy(this, '_boundedButtonClicked');
  }

  if ( superclass ) TestElement.__proto__ = superclass;
  TestElement.prototype = Object.create( superclass && superclass.prototype );
  TestElement.prototype.constructor = TestElement;

  var staticAccessors = { is: { configurable: true },properties: { configurable: true } };

  staticAccessors.is.get = function () { return 'test-element-three'; };

  staticAccessors.properties.get = function () {
    return {
      prop1: {
        type: String
      },

      prop2: {
        type: Object,
        value: {}
      }
    };
  };

  TestElement.prototype.render = function render () {
    return html`
      <style>
        #button {
          width: 500px;
        }
      </style>
      <span id="span">${this.prop1}</span>
      <span id="span-two">${this.prop2.attr1}</span>
      <button id="button" type="button" on-click=${this._boundedButtonClicked}>Test</button>
    `;
  };

  TestElement.prototype._buttonClicked = function _buttonClicked () {
    this.prop1 = 'changed';
  };

  Object.defineProperties( TestElement, staticAccessors );

  return TestElement;
}(ElementLite(window.HTMLElement)));

window.customElements.define(TestElement.is, TestElement);

})));
