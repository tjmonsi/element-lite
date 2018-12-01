/// <reference path="../typings-project/global.d.ts"/>
'use strict';

import { dedupingMixin } from '../lib/deduping-mixin.js';

const shadyCSS = {};
const STATE_HAS_UPDATED = 1;
// const STATE_UPDATE_REQUESTED = 1 << 2;
// // const STATE_IS_REFLECTING = 1 << 3;

export const TemplateLite = dedupingMixin(base => {
  class TemplateLite extends /** @type {any} */(base) {
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

    initialize () {
      this.renderRoot = this.createRenderRoot();

      const result = this.template();
      const template = document.createElement('template');
      const ctor = this.constructor;
      const { renderer } = ctor;

      if (renderer) {
        renderer(result, template.content);
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
      super.initialize();
    }

    connectedCallback () {
      if ((this._updateState & STATE_HAS_UPDATED)) {
        if (window.ShadyCSS !== undefined) {
          window.ShadyCSS.styleElement(this);
        }
      }
      if (super.connectedCallback && typeof super.coonectedCallback === 'function') {
        super.connectedCallback();
      } else {
        this._render();
      }
    }

    /**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     * @returns {Element|DocumentFragment} Returns a node into which to render.
     */
    createRenderRoot () {
      return (!this.constructor.noShadow) ? this.attachShadow({ mode: 'open' }) : this;
    }

    /**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * * @param _changedProperties Map of changed properties with old values
     */
    update (changedProperties) {
      if (super.update) super.update(changedProperties);
      this._render();
    }

    _render () {
      const result = this.template();

      if (!this.constructor.renderer) {
        const template = document.createElement('template');
        template.innerHTML = result || '';
        while (this.renderRoot.firstChild) { // reset innerHTML
          this.renderRoot.removeChild(this.renderRoot.firstChild);
        }
        this.renderRoot.appendChild(document.importNode(template.content, true));
      } else if (result) {
        this.constructor.renderer(result, this.renderRoot);
      }
    }
  }

  return TemplateLite;
});
