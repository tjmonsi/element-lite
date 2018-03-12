import { ElementLiteBase } from './element-lite-base.js';
import { dedupingMixin } from './lib/deduping-mixin.js';

export const ElementLiteStaticShadow = dedupingMixin(base => {
  /**
   * ElementLite is a set of methods
   * @extends {ElementLiteBase}
  */
  class ElementLiteStaticShadow extends ElementLiteBase(base) {
    ready () {
      // attaches shadow
      this.attachShadow({ mode: 'open' });
      super.ready();

      // renders the shadowRoot statically
      this.shadowRoot = this.render();
    }

    /**
     * Return the html string of the shadowRoot
     */
    render () { return ``; }
  }

  return ElementLiteStaticShadow;
});
