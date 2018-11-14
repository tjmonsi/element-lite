/// <reference path="typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from './lib/deduping-mixin.js';
import { ObserversLite } from './observers-lite.js';
import { ObjectAccessorsLite } from './object-accessors-lite.js';

export const ObjectObserversLite = dedupingMixin(base => {
  class ObjectObserversLite extends /** @type {HTMLElement} */ObjectAccessorsLite(ObserversLite(base)) {}

  return ObjectObserversLite;
});
