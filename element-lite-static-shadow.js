import { ElementLiteBase } from './element-lite-base.js';
import { dedupingMixin } from './lib/deduping-mixin.js';

export const ElementLiteStaticShadow = dedupingMixin(base => {
  /**
   * ElementLite is a set of methods coming from Polymer Property Mixins and Property Accessor Mixins
   * that automates the creation of setter and getters given a list of properties and
   * allows auto-calling of methods given observers. This uses a static shadow DOM. It doesn't use
   * lit-html
   * @extends {ElementLiteBase}
  */
  class ElementLiteStaticShadow extends ElementLiteBase(base) {
    constructor () {
      super();
      this.attachShadow({ mode: 'open' });
      this.__template = document.createElement('template');
      this.__template.innerHTML = this.render();
      
      if (window.ShadyCSS) {
        window.ShadyCSS.prepareTemplate(this.__template, this.constructor.is || this.tagName.toLowerCase())
      }
    }
    
    ready () {
      // attaches shadow
      super.ready();
      // renders the shadowRoot statically
      if (window.ShadyCSS && this.__template) {
        window.ShadyCSS.styleElement(this);
      }
      this.shadowRoot.appendChild(document.importNode(this.__template.content, true));
    }

    /**
     * Return the html string of the shadowRoot
     */
    render () { return ``; }
  }

  return ElementLiteStaticShadow;
});
