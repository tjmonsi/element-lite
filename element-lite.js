/// <reference path="typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from './lib/deduping-mixin.js';
import { TemplateLite } from './template-lite.js';
import { ArrayAccessorsLite } from './array-accessors-lite.js';
import { ObserversLite } from './observers-lite.js';

export const ElementLite = dedupingMixin(base =>
  class extends /** @type {HTMLElement} */TemplateLite(ArrayAccessorsLite(ObserversLite(base))) {});
