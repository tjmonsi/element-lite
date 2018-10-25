/// <reference path="typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from './lib/deduping-mixin.js';
import { InvalidatePropertiesMixin } from './lib/invalidate-properties-mixin.js';

const shadyCSS = {};

export const TemplateLite = dedupingMixin(base => {
  class TemplateLite extends /** @type {HTMLElement} */InvalidatePropertiesMixin(base) {
    static get renderer () {
      return null;
    }

    template () {
      console.warn('The `template()` method is not set');
      return '';
    }

    static get noShadow () {
      return false;
    }

    constructor () {
      super();
      this._root = this.constructor.noShadow ? this : this.attachShadow({ mode: 'open' });

      const result = this.template();
      const template = document.createElement('template');

      if (this.constructor.renderer) {
        this.constructor.renderer(result, template.content);
      } else {
        template.innerHTML = result || '';
      }

      if (window.ShadyCSS) {
        const name = this.constructor.is || this.tagName.toLowerCase();
        if (!shadyCSS[name]) {
          window.ShadyCSS.prepareTemplate(template, name);
          shadyCSS[name] = true;
        }
      }

      this._flushProperties();
    }

    _render () {
      const result = this.template();
      if (!this.constructor.renderer) {
        const template = document.createElement('template');
        template.innerHTML = result || '';
        while (this._root.firstChild) { // reset innerHTML
          this._root.removeChild(this._root.firstChild);
        }
        this._root.appendChild(document.importNode(template.content, true));
      } else if (result) {
        this.constructor.renderer(result, this._root);
      }

      if (window.ShadyCSS) {
        window.ShadyCSS.styleElement(this);
      }
    }

    _flushProperties () {
      this._isChanging = true;
      this._isInvalid = false;
      if (super._flushProperties) {
        super._flushProperties();
      } else {
        this._propertiesChanged();
      }
      this._isChanging = false;
    }

    /*
     * This is called when the attributes/properties has been changed.
     * This function in particular re-renders parts of the shadowRoot
     * based on lit-html's render function.
     *
     * @param currentProps Current element properties
     * @param changedProps Changing element properties
     * @param oldProps Previous element properties
     */
    _propertiesChanged (currentProps, changedProps, oldProps) {
      if (super._propertiesChanged) super._propertiesChanged(currentProps, changedProps, oldProps);
      this._render();
      this._didRender(currentProps, changedProps, oldProps);
    }

    /**
     * Called after element DOM has been rendered. Implement to
     * directly control rendered DOM. Typically this is not needed as `lit-html`
     * can be used in the `_render` method to set properties, attributes, and
     * event listeners. However, it is sometimes useful for calling methods on
     * rendered elements, like calling `focus()` on an element to focus it.
     * @param currentProps Current element properties
     * @param changedProps Changing element properties
     * @param oldProps Previous element properties
     */
    _didRender (currentProps, changedProps, oldProps) { }

    requestRender () {
      this._invalidateProperties();
    }

    /**
     * Override which provides tracking of invalidated state.
     */
    _invalidateProperties () {
      this._isInvalid = true;
      super._invalidateProperties();
    }
  }

  return TemplateLite;
});
