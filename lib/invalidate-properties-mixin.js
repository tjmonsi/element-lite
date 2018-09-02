/// <reference path="../typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from './deduping-mixin.js';

export const InvalidatePropertiesMixin = dedupingMixin(base => {
  class InvalidatePropertiesMixin extends /** @type {HTMLElement} */(base) {
    constructor () {
      super();
      this._dataInvalid = false;
    }

    _invalidateProperties () {
      if (!this._dataInvalid) {
        this._dataInvalid = true;

        Promise.resolve().then(() => {
          if (this._dataInvalid) {
            this._dataInvalid = false;
            this._flushProperties();
          }
        });
      }
    }
  }

  return InvalidatePropertiesMixin;
});
