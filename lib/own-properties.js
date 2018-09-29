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

export { normalizeProperties, ownProperties };
