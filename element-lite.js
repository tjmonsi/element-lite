/// <reference path="typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from './lib/deduping-mixin.js';
import { TemplateLite } from './mixins/template-lite.js';
import { ArrayAccessorsLite } from './mixins/array-accessors-lite.js';
import { ObserversLite } from './mixins/observers-lite.js';

export const ElementLite = dedupingMixin(base =>
  class extends /** @type {HTMLElement} */TemplateLite(ArrayAccessorsLite(ObserversLite(base))) {});
