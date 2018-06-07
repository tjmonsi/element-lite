/// <reference path="typings-project/global.d.ts"/>

import { dedupingMixin } from './lib/deduping-mixin.js';
import { render, html } from './lib/lit-html/lib/lit-extended.js';

export { prepareShadyCSS } from './lib/prepare-shady-css.js';
export { html };
export const ElementLiteLit = dedupingMixin(base => {
  /**
   * ElementLite is a set of methods coming from Polymer Property Mixins and Property Accessor Mixins
   * that automates the creation of setter and getters given a list of properties and
   * allows auto-calling of methods given observers. This doesn't use the base ElementLite, but uses lit-html
   * only.
   *
   * @extends {HTMLElement}
  */

  class ElementLiteLit extends /** @type {HTMLElement} */(base) {
    connectedCallback () {
      if (super.connectedCallback) super.connectedCallback();
      this.attachShadow({ mode: 'open' });
      this.invalidate();
    }

    /**
     * Return a template result to render using lit-html.
     */
    render (self) { return html``; }

    /**
     * Invalidates the shadowDOM and re-renders it.
     */
    invalidate () {
      // renders the shadowRoot statically
      const result = this.render(this);

      if (result && this.shadowRoot) {
        render(this.render(this) || html``, /** @type {DocumentFragment} */(this.shadowRoot));
        if (window.ShadyCSS) window.ShadyCSS.styleElement(this);
      }
    }
  }

  return ElementLiteLit;
});
