import { dedupingMixin } from './lib/deduping-mixin.js';
import { render } from '../../lit-html/lib/lit-extended.js';
import { html } from '../../lit-html/lit-html.js';

export { html };
export const ElementLiteLitOnly = dedupingMixin(base => {
  /**
   * ElementLite is a set of methods
   * @extends {HTMLElement}
  */
  class ElementLiteLitOnly extends /** @type {HTMLElement} */(base) {
    connectedCallback () {
      if (super.connectedCallback) super.connectedCallback();
      this.attachShadow({ mode: 'open' });

      // renders the shadowRoot statically
      const result = this.render(this);

      if (result && this.shadowRoot) {
        render(this.render(this) || html``, /** @type {DocumentFragment} */(this.shadowRoot));
      }
    }

    /**
     * Return a template result to render using lit-html.
     */
    render (self) { return html``; }
  }

  return ElementLiteLitOnly;
});
