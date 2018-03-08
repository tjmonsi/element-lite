// Save map of native properties; this forms a blacklist or properties
// that won't have their values "saved" by `saveAccessorValue`, since
// reading from an HTMLElement accessor from the context of a prototype throws
const nativeProperties = {};
let proto = window.HTMLElement.prototype;

while (proto) {
  let props = Object.getOwnPropertyNames(proto);
  for (let i = 0; i < props.length; i++) { nativeProperties[props[i]] = true; }
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
export function saveAccessorValue (model, property) {
// Don't read/store value for any native properties since they could throw
  if (!nativeProperties[property]) {
    let value = model[property];
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
