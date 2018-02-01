import { PropertiesMixin } from '../../@polymer/polymer/lib/mixins/properties-mixin.js';
import { dedupingMixin } from '../../@polymer/polymer/lib/utils/mixin.js';

export const ElementLiteBase = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends PropertiesMixin(base) {

    constructor () {
      super();

      // sets default value of property based on "value" attribute on static properties
      Object.entries(this.constructor._properties)
        .forEach(item => item[1].value !== undefined ? (this[item[0]] = item[1].value) : '');
    }

    /**
     * Can call this to manually re-render the shadowRoot
     */
    invalidate () { this._invalidateProperties(); }

    // TODO: Have to add a simple and proper get static observer checker

    // TODO: How do we add Polymer's Gestures on-tap? Do we need it?
  }

  return ElementMixin;
});
