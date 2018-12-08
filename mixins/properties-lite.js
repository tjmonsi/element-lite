/// <reference path="../typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from '../lib/deduping-mixin.js';
import { root, getProp } from '../lib/path.js';
// import { ownProperties } from '../lib/own-properties.js';
import { dashToCamelCase, camelToDashCase } from '../lib/case-map.js';

const microtaskPromise = new Promise(resolve => resolve(true));

const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING = 1 << 3;

const notEqual = (value, old) => {
  // This ensures (old==NaN, value==NaN) always returns false
  return old !== value && (old === old || value === value); // eslint-disable-line no-self-compare
};

const defaultPropertyDeclaration = {
  attribute: true,
  type: String,
  reflect: false,
  notify: false, // added
  hasChanged: notEqual
};

export const PropertiesLite = dedupingMixin(base => {
  class PropertiesLite extends /** @type {HTMLElement} */(base) {
    /**
     * Returns a list of attributes corresponding to the registered properties.
     * -- lit-element
     */
    static get observedAttributes () {
      // note: piggy backing on this to ensure we're _finalized.
      this._finalize();
      const attributes = [];
      for (const [prop, options] of this._classProperties) {
        const attr = this._attributeNameForProperty(prop, options);
        if (attr !== undefined) {
          this._attributeToPropertyMap.set(attr, prop);
          attributes.push(attr);
        }
      }
      return attributes;
    }

    /**
     * Creates property accessors for registered properties and ensures
     * any superclasses are also finalized. -- lit-element
     */
    static _finalize () {
      if (this.hasOwnProperty('_finalized') && this._finalized) {
        return;
      }

      /// finalize any superclasses
      const superCtor = Object.getPrototypeOf(this);
      if (typeof superCtor._finalize === 'function') {
        superCtor._finalize();
      }
      this._finalized = true;
      // initialize Map populated in observedAttributes
      this._attributeToPropertyMap = new Map();
      // make any properties
      const props = this.properties;

      // support symbols in properties (IE11 does not support this)
      const propKeys = [
        ...Object.getOwnPropertyNames(props),
        ...(typeof Object.getOwnPropertySymbols === 'function')
          ? Object.getOwnPropertySymbols(props)
          : []
      ];

      for (const p of propKeys) {
        this.createProperty(p, props[p]);
      }
    }

    /**
     * Creates a property accessor on the element prototype if one does not exist.
     * The property setter calls the property's `hasChanged` property option
     * or uses a strict identity check to determine whether or not to request
     * an update. -- lit-element
     */
    static createProperty (name, options = defaultPropertyDeclaration) {
      // ensure private storage for property declarations.
      if (!this.hasOwnProperty('_classProperties')) {
        this._classProperties = new Map(null);
        // NOTE: Workaround IE11 not supporting Map constructor argument.
        const superProperties = Object.getPrototypeOf(this)._classProperties;
        if (superProperties !== undefined) {
          superProperties.forEach((v, k) => this._classProperties.set(k, v));
        }
      }

      this._classProperties.set(name, options);
      // Allow user defined accessors by not replacing an existing own-property
      // accessor.
      if (this.prototype.hasOwnProperty(name)) {
        return;
      }

      const key = typeof name === 'symbol' ? Symbol(name) : `__${name}`;
      Object.defineProperty(this.prototype, name, {
        get () { return this[key]; },
        set (value) {
          const oldValue = this[name];
          this[key] = value;
          this._requestPropertyUpdate(name, oldValue, options);
        },
        configurable: true,
        enumerable: true
      });
    }

    /**
     * Returns the property name for the given attribute `name`.
     */
    static _attributeNameForProperty (name, options) {
      const attribute = options !== undefined && options.attribute;
      return attribute === false
        ? undefined
        : (typeof attribute === 'string'
          ? attribute
          // CHANGED: changed from original lit-element procedure to get a dash-to-camel attribute to dashToCamel property
          : (typeof name === 'string' ? camelToDashCase(name)
            : undefined));
    }

    /**
     * Returns true if a property should request an update.
     * Called when a property value is set and uses the `hasChanged`
     * option for the property if present or a strict identity check. -- lit-element
     */
    static _valueHasChanged (value, old, hasChanged = notEqual) {
      return hasChanged(value, old);
    }

    /**
     * Returns the property value for the given attribute value.
     * Called via the `attributeChangedCallback` and uses the property's `type`
     * or `type.fromAttribute` property option.
     */
    static _propertyValueFromAttribute (value, options) {
      const type = options && options.type;
      if (type === undefined) {
        return value;
      }
      // Note: special case `Boolean` so users can use it as a `type`.
      return this._deserializeValue(value, type);
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
    static _deserializeValue (value, type) {
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
            console.warn(`Couldn't decode Array as JSON: ${value}`);
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
     * Returns the attribute value for the given property value. If this
     * returns undefined, the property will *not* be reflected to an attribute.
     * If this returns null, the attribute will be removed, otherwise the
     * attribute will be set to the value.
     * This uses the property's `reflect` and `type.toAttribute` property options.
     */
    static _propertyValueToAttribute (value, options) {
      if (options === undefined || options.reflect === undefined) {
        return;
      }
      // CHANGED: to use the _serializeValue than the simplified version of Boolean() or String()
      return this._serializeValue(value);
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
    static _serializeValue (value) {
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

    // static _propertyValueToNotofy (value, options) {
    //   if (options === undefined || options.notify === undefined) {
    //     return;
    //   }
    // }

    constructor () {
      super();

      this._updateState = 0;
      this._instanceProperties = undefined;
      this._updatePromise = microtaskPromise;

      /**
       * Map with keys for any properties that have changed since the last
       * update cycle with previous values.
       */
      this._changedProperties = new Map(null);
      /**
       * Map with keys of properties that should be reflected when updated.
       */
      this._reflectingProperties = undefined;
      this.initialize();
    }

    /**
     * Initializes the whole setup
     */
    initialize () {
      this._setInitialValue();
      this._saveInstanceProperties();
    }

    /**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
     * (<=41), properties created for native platform properties like (`id` or
     * `name`) may not have default values set in the element constructor. On
     * these browsers native properties appear on instances and therefore their
     * default value will overwrite any element default (e.g. if the element sets
     * this.id = 'id' in the constructor, the 'id' will become '' since this is
     * the native platform default). -- From lit-element
     */

    _saveInstanceProperties () {
      for (const [p] of this.constructor._classProperties) {
        if (this.hasOwnProperty(p)) {
          const value = this[p];
          delete this[p];
          if (!this._instanceProperties) {
            this._instanceProperties = new Map();
          }
          this._instanceProperties.set(p, value);
        }
      }
    }

    _setInitialValue () {
      for (const [prop, options] of this.constructor._classProperties) {
        if (options && options.value !== undefined && options.value !== null) {
          this[prop] = this.getAttribute(camelToDashCase(prop)) || options.value;
        }
      }
    }

    /**
     * Applies previously saved instance properties.
     */
    _applyInstanceProperties () {
      for (const [prop, value] of this._instanceProperties) {
        this[prop] = value;
      }
      this._instanceProperties = undefined;
    }

    /**
     * Uses ShadyCSS to keep element DOM updated.
     */
    connectedCallback () {
      if (!(this._updateState & STATE_HAS_UPDATED)) {
        this.requestUpdate();
      }
    }

    disconnectedCallback () {}

    /**
     * Synchronizes property values when attributes change.
     */
    attributeChangedCallback (name, old, value) {
      if (old !== value) {
        this._attributeToProperty(dashToCamelCase(name), value);
      }
    }

    _propertyToAttribute (name, value, options = defaultPropertyDeclaration) {
      const ctor = this.constructor;
      const attrValue = ctor._propertyValueToAttribute(value, options);
      if (attrValue !== undefined) {
        const attr = ctor._attributeNameForProperty(name, options);
        if (attr !== undefined) {
          // Track if the property is being reflected to avoid
          // setting the property again via `attributeChangedCallback`. Note:
          // 1. this takes advantage of the fact that the callback is synchronous.
          // 2. will behave incorrectly if multiple attributes are in the reaction
          // stack at time of calling. However, since we process attributes
          // in `update` this should not be possible (or an extreme corner case
          // that we'd like to discover).
          // mark state reflecting
          this._updateState = this._updateState | STATE_IS_REFLECTING;
          if (attrValue === null) {
            this.removeAttribute(attr);
          } else {
            this.setAttribute(attr, attrValue);
          }
          // mark state not reflecting
          this._updateState = this._updateState & ~STATE_IS_REFLECTING;
        }
      }
    }

    _propertyNotify (name, value) {
      this.dispatchEvent(new window.CustomEvent(`${camelToDashCase(root(name))}-change`, { detail: value }));
    }

    _attributeToProperty (name, value) {
      // Use tracking info to avoid deserializing attribute value if it was
      // just set from a property setter.
      if (!(this._updateState & STATE_IS_REFLECTING)) {
        const ctor = this.constructor;
        const propName = ctor._attributeToPropertyMap.get(name);
        if (propName !== undefined) {
          const options = ctor._classProperties.get(propName);
          this[propName] = ctor._propertyValueFromAttribute(value, options);
        }
      }
    }

    /**
     * Requests an update which is processed asynchronously. This should
     * be called when an element should update based on some state not triggered
     * by setting a property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored. Returns the `updateComplete` Promise which is resolved
     * when the update completes.
     *
     * @param name {PropertyKey} (optional) name of requesting property
     * @param oldValue {any} (optional) old value of requesting property
     * @returns {Promise} A Promise that is resolved when the update completes.
     */
    requestUpdate (name, oldValue) {
      if (name !== undefined) {
        const options = this.constructor._classProperties.get(root(name)) || defaultPropertyDeclaration;
        return this._requestPropertyUpdate(name, oldValue, options);
      }
      return this._invalidate();
    }

    /**
     * Requests an update for a specific property and records change information.
     * @param name {PropertyKey} name of requesting property
     * @param oldValue {any} old value of requesting property
     * @param options {PropertyDeclaration}
     */
    _requestPropertyUpdate (name, oldValue, options) {
      if (!this.constructor._valueHasChanged(getProp(this, name), oldValue, options.hasChanged)) {
        return this.updateComplete;
      }
      // track old value when changing.
      if (!this._changedProperties.has(name)) {
        this._changedProperties.set(name, oldValue);
      }

      this._requestPropertyUpdateOptions(name, options);

      return this._invalidate();
    }

    _requestPropertyUpdateOptions (name, options) {
      // add to reflecting properties set
      if (options && options.reflect === true) {
        if (this._reflectingProperties === undefined) {
          this._reflectingProperties = new Map();
        }
        this._reflectingProperties.set(root(name), options);
      }

      // ADDED: to add notify
      if (options && options.notify === true) {
        if (this._notifyProperties === undefined) {
          this._notifyProperties = new Map();
        }
        this._notifyProperties.set(root(name), options);
      }
    }

    /**
     * Invalidates the element causing it to asynchronously update regardless
     * of whether or not any property changes are pending. This method is
     * automatically called when any registered property changes.
     */
    async _invalidate () {
      if (!this._hasRequestedUpdate) {
        // mark state updating...
        this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
        let resolver;
        const previousValidatePromise = this._updatePromise;
        this._updatePromise = new Promise(r => { resolver = r; }); // eslint-disable-line promise/param-names
        await previousValidatePromise;
        this._validate();
        resolver(!this._hasRequestedUpdate);
      }
      return this.updateComplete;
    }

    get _hasRequestedUpdate () {
      return (this._updateState & STATE_UPDATE_REQUESTED);
    }

    /**
     * Validates the element by updating it.
     */
    _validate () {
      // Mixin instance properties once, if they exist.
      if (this._instanceProperties) {
        this._applyInstanceProperties();
      }
      if (this.shouldUpdate(this._changedProperties)) {
        const changedProperties = this._changedProperties;
        this.update(changedProperties);
        this._markUpdated();
        if (!(this._updateState & STATE_HAS_UPDATED)) {
          this._updateState = this._updateState | STATE_HAS_UPDATED;
          this.firstUpdated(changedProperties);
        }
        this.updated(changedProperties);
      } else {
        this._markUpdated();
      }
    }

    _markUpdated () {
      this._changedProperties = new Map();
      this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    /**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. This getter can be implemented to
     * await additional state. For example, it is sometimes useful to await a
     * rendered element before fulfilling this Promise. To do this, first await
     * `super.updateComplete` then any subsequent state.
     *
     * @returns {Promise} The Promise returns a boolean that indicates if the
     * update resolved without triggering another update.
     */
    get updateComplete () { return this._updatePromise; }

    /**
     * Controls whether or not `update` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * * @param _changedProperties Map of changed properties with old values
     */
    shouldUpdate (_changedProperties) {
      return true;
    }
    /**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated DOM in the element's
     * `renderRoot`. Setting properties inside this method will *not* trigger
     * another update.
     *
     * * @param _changedProperties Map of changed properties with old values
     */
    update (_changedProperties) {
      if (this._reflectingProperties !== undefined && this._reflectingProperties.size > 0) {
        for (const [prop, value] of this._reflectingProperties) {
          this._propertyToAttribute(prop, this[prop], value);
        }
        this._reflectingProperties = undefined;
      }

      if (this._notifyProperties !== undefined && this._notifyProperties.size > 0) {
        for (const [prop, value] of this._notifyProperties) {
          this._propertyNotify(prop, this[prop], value);
        }
        this._notifyProperties = undefined;
      }
    }
    /**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * * @param _changedProperties Map of changed properties with old values
     */
    updated (_changedProperties) { }
    /**
     * Invoked when the element is first updated. Implement to perform one time
     * work on the element after update.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * * @param _changedProperties Map of changed properties with old values
     */
    firstUpdated (_changedProperties) { }
  }

  // /**
  //  * Maps attribute names to properties; for example `foobar` attribute
  //  * to `fooBar` property.
  //  */
  PropertiesLite._attributeToPropertyMap = new Map();
  // /**
  //  * Marks class as having finished creating properties.
  //  */
  PropertiesLite._finalized = true;
  // /**
  //  * Memoized list of all class properties, including any superclass properties.
  //  */
  PropertiesLite._classProperties = new Map(null);
  PropertiesLite.properties = {};

  return PropertiesLite;
});
