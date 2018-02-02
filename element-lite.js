import { ElementLiteBase } from './element-lite-base.js';
import { dedupingMixin } from '../../@polymer/polymer/lib/utils/mixin.js';
import { render } from '../../lit-html/lib/lit-extended.js';
import { html } from '../../lit-html/lit-html.js';

export { html };
export const ElementLite = dedupingMixin(base => {
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
    }

    /*
     * This is called when the attributes/properties has been changed.
     * This function in particular re-renders parts of the shadowRoot
     * based on lit-html's render function.
     */

    _flushProperties () {
      super._flushProperties();
      render(this.render(this) || html``, this.shadowRoot);

      // TODO: Have to ask the PolymerLabs guys what these does
      if (this._nextRenderedResolver) {
        this._nextRenderedResolver();
        this._nextRenderedResolver = null;
        this._nextRendered = null;
      }
    }

    /**
     * Return a template result to render using lit-html.
     */
    render () { return html``; }

    // TODO: Have to ask the PolymerLabs guys what these does
    get nextRendered () {
      if (!this._nextRendered) this._nextRendered = new Promise(resolve => (this._nextRenderedResolver = resolve));
      return this._nextRendered;
    }

    // TODO: Have to add a simple and proper get static observer checker

    // TODO: How do we add Polymer's Gestures on-tap? Do we need it?
  }

  return ElementMixin;
});
