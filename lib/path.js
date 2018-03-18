// @ts-check

// Copied from https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/lib/utils/path.js

/**
 * @param {string[]} path
 * @return {string} normalized path
 */
const normalizeArray = path => {
  /** @type {string[]} */
  let parts = [];
  for (let i = 0; i < path.length; i++) {
    /** @type {string[]} */
    let args = path[i].toString().split('.');
    for (let j = 0; j < args.length; j++) { parts.push(args[j]); }
  }

  return parts.join('.');
};

/**
 * @param {string} path
 * @return {boolean} if it is a path
 */
export const isPath = path => path.indexOf('.') >= 0;

/**
 * @param {string} path
 * @return {string} path's root
 */
export const root = path => path.indexOf('.') === -1 ? path : path.slice(0, path.indexOf('.'));

/**
 * @param {string | string[]} path
 * @return {string} normalize path
 */
export const normalize = path => Array.isArray(path) ? normalizeArray(path) : path;

/**
 * @param {string | string[]} path
 * @return {string[]} split path into array
 */
export const split = path => Array.isArray(path) ? normalize(path).split('.') : path.toString().split('.');

/**
 * @param {object} obj
 * @param {string|array} path
 * @param {?object} info
 * @return {any} the data given a path
 */
export const getProp = (obj, path, info) => {
  let prop = obj;
  let parts = split(path);
  // Loop over path parts[0..n-1] and dereference
  for (let i = 0; i < parts.length; i++) {
    if (!prop) return;
    let part = parts[i];
    prop = prop[part];
  }
  if (info) info.path = parts.join('.');
  return prop;
};

/**
 * @param {object} obj
 * @param {string} path
 * @param {any} value
 * @return {string} path
 */
export const setProp = (obj, path, value) => {
  let prop = obj;
  let parts = split(path);
  let last = parts[parts.length - 1];
  if (parts.length > 1) {
    // Loop over path parts[0..n-2] and dereference
    for (let i = 0; i < parts.length - 1; i++) {
      let part = parts[i];
      prop = prop[part];
      if (!prop) return;
    }
    // Set value to object at end of path
    prop[last] = value;
  } else {
    // Simple property set
    prop[path] = value;
  }
  return parts.join('.');
};

/**
 * @param {string} base
 * @param {string} path
 * @return {boolean} if base is a descendant of path
 */
export const isDescendant = (base, path) => path.indexOf(base + '.') === 0;

/**
 * @param {string[]} base
 * @param {string} newBase
 * @param {string} path
 * @return {string}
 */
export const translate = (base, newBase, path) => newBase + path.slice(base.length);
