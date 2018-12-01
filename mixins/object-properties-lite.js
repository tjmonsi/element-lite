/// <reference path="../typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from '../lib/deduping-mixin.js';
import { PropertiesLite } from './properties-lite.js';
import { ObjectAccessorsLite } from './object-accessors-lite.js';

export const ObjectPropertiesLite = dedupingMixin(base => {
  class ObjectPropertiesLite extends /** @type {HTMLElement} */ObjectAccessorsLite(PropertiesLite(base)) {}

  return ObjectPropertiesLite;
});
