import { ElementLiteBase } from './element-lite-base.js';
import { dedupingMixin } from '../../@polymer/polymer/lib/utils/mixin.js';

export const ElementLiteStaticShadow = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends ElementLiteBase(base) {
    ready () {
      // attaches shadow
      this.attachShadow({ mode: 'open' });
      super.ready();

      // renders the shadowRoot statically
      this.shadowRoot = this.render();

      // checks if there is a ShadyCSS polyfill and then uses that
      // polyfill to render CSS for this element;
      if (window.ShadyCSS) {
        window.ShadyCSS.prepareTemplate(this.shadowRoot, this.constructor.is);
        window.ShadyCSS.styleElement(this);
      }
    }

    /**
     * Return the html string of the shadowRoot
     */
    render () { return ``; }
  }

  return ElementMixin;
});
