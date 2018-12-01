/// <reference path="typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from './lib/deduping-mixin.js';
import { root, isPath } from './lib/path.js';
import { ownProperties } from './lib/own-properties.js';
import { camelToDashCase } from './lib/case-map.js';
import { InvalidatePropertiesMixin } from './lib/invalidate-properties-mixin.js';

// Save map of native properties; this forms a blacklist of properties
// that won't have their values "saved".
const nativeProperties = {};
let proto = window.HTMLElement.prototype;

while (proto) {
  let props = Object.getOwnPropertyNames(proto);
  for (let i = 0; i < props.length; i++) { nativeProperties[props[i]] = true; }
  proto = Object.getPrototypeOf(proto);
}

export const PropertiesLite = dedupingMixin(base => {
  class PropertiesLite extends /** @type {HTMLElement} */InvalidatePropertiesMixin(base) {
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
      * Implements standard custom elements getter to observes the attributes
      * listed in `properties`.
      * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
      */
    static get observedAttributes () {
      const props = this._properties;
      return props ? Object.keys(props).map(p => camelToDashCase(p)) : [];
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
        const { readOnly, reflectToAttribute, notify } = props[prop];

        // don't stomp an existing accessor
        if (!(prop in proto)) {
          proto._createPropertyAccessor(prop, readOnly, reflectToAttribute, notify);
        }
      }
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

      // flags
      this._finalized = false;

      // This holds the data of the object, but is hidden on console log
      // this._dataProps = {};
      // this._dataOldProps = {};
      Object.defineProperty(this, '_dataProps', {
        configurable: false,
        writable: false,
        enumerable: false,
        value: {}
      });

      // This holds the old data of the object
      Object.defineProperty(this, '_dataOldProps', {
        configurable: false,
        writable: false,
        enumerable: false,
        value: {}
      });

      // This holds the data path of the object's data properties
      this._dataHasPaths = false;
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

      if (!this.hasOwnProperty('_finalized') || !this._finalized) {
        this._finalized = true;
        if (props) {
          this.constructor.createProperties(props);
          this._setDefaultValues(props);
        }
      }
    }

    /**
     * Sets default values given in props
     *
     * @param {!Object} props Object whose keys are names of accessors.
     * @return {void}
     * @protected
     */
    _setDefaultValues (props) {
      // set default value
      for (let prop in props) {
        const { value } = props[prop];
        if (value !== undefined && value !== null) {
          this._setProperty(prop, value);
          // this[prop] = value;

          // // if native property, force invalidate using _setProperty method
          // if (nativeProperties[prop])
        }

        // get attributes if there's any
        const attrValue = this.getAttribute(camelToDashCase(prop));
        if (attrValue !== undefined && attrValue !== null) {
          this._setProperty(prop, this._deserializeValue(attrValue));
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
     * @param {boolean=} reflectToAttribute When true, sets flag to `_dataReflectToAttribute`;
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

      if (!this.hasOwnProperty(_dataHasAccessor)) {
        Object.defineProperty(this, _dataHasAccessor, {
          configurable: false,
          writable: false,
          enumerable: false,
          value: {}
        });
      }

      if (!this.hasOwnProperty(_readOnly)) {
        Object.defineProperty(this, _readOnly, {
          configurable: false,
          writable: false,
          enumerable: false,
          value: {}
        });
      }

      if (!this.hasOwnProperty(_dataReflectToAttribute)) {
        Object.defineProperty(this, _dataReflectToAttribute, {
          configurable: false,
          writable: false,
          enumerable: false,
          value: {}
        });
      }

      if (!this.hasOwnProperty(_dataNotify)) {
        Object.defineProperty(this, _dataNotify, {
          configurable: false,
          writable: false,
          enumerable: false,
          value: {}
        });
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
     * Adds the given `property` to a map matching attribute names
     * to property names, using `camelToDashCase`. This map is
     * used when deserializing attribute values to properties.
     *
     * @param {string} property Name of the property
     */
    _addPropertyToAttributeMap (property) {
      const attr = camelToDashCase(property);
      const _dataAttributes = '_dataAttributes';
      const _dataAttributeProperties = '_dataAttributeProperties';

      if (!this.hasOwnProperty(_dataAttributes)) {
        Object.defineProperty(this, _dataAttributes, {
          configurable: false,
          writable: false,
          enumerable: false,
          value: {}
        });
      }

      if (!this.hasOwnProperty(_dataAttributeProperties)) {
        Object.defineProperty(this, _dataAttributeProperties, {
          configurable: false,
          writable: false,
          enumerable: false,
          value: {}
        });
      }

      if (!this._dataAttributes[attr]) {
        this._dataAttributes[attr] = property;
      }

      if (!this._dataAttributeProperties[property]) {
        this._dataAttributeProperties[property] = attr;
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
      // saveAccessorValue(this, property);
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
     * Returns the value for the given property.
     *
     * @param {string} property Name of property
     * @return {*} Value for the given property
     * @protected
     */
    _getProperty (property) {
      return this._dataProps[property];
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
      // get old data from _dataProps to _dataOldProps
      this._dataOldProps[property] = this._dataProps[property];

      let path = this._dataHasPaths && isPath(property);
      const prevProps = path ? this._dataTemp : this._dataOldProps;

      if (!this._shouldPropertyChange(property, value, prevProps[property])) {
        return false;
      }

      if (!this._dataPending) {
        this._dataPending = {};
      }

      if (path) {
        this._dataTemp[property] = value;
      } else {
        this._dataProps[property] = value;
      }

      this._dataPending[property] = value;

      return true;
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

    _flushProperties (forceFlush) {
      const props = this._dataProps;
      const changedProps = Object.assign({}, this._dataPending);
      this._dataPending = {};
      this._propertiesChanged(props, forceFlush ? props : changedProps, this._dataOldProps);
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
    _propertiesChanged (currentProps, changedProps, oldProps) {
      let keys = Object.keys(changedProps);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        const prop = root(key);

        if (this._dataReflectToAttribute[prop]) {
          this._propertyToAttribute(prop, this._dataAttributeProperties[prop], this._dataProps[prop]);
        }

        if (this._dataNotify[root(prop)]) {
          this.dispatchEvent(new window.CustomEvent(`${camelToDashCase(root(prop))}-change`, { detail: this._dataProps[root(prop)] }));
        }
      }
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

        // checks if the property is native property
        // if it is native property, it just uses the _setProperty method
        // to invalidate the properties to run the changedProperties method
        if (nativeProperties[property]) {
          this._setProperty(property, this[property]);
        } else {
          this[property] = this._deserializeValue(value, this.constructor.typeForProperty(property));
        }
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
  }

  return PropertiesLite;
});
