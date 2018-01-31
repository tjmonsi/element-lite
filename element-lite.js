import { PropertiesMixin } from '../../@polymer/polymer/lib/mixins/properties-mixin.js';
import { dedupingMixin } from '../../@polymer/polymer/lib/utils/mixin.js';
import { render } from '../../lit-html/lib/lit-extended.js';

export { html } from '../../lit-html/lit-html.js';
export const ElementLite = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends PropertiesMixin(base) {

    constructor () {
      super();
      Object.entries(this.constructor._properties)
        .forEach(item => item[1].value !== undefined ? this[item[0]] = item[1].value : '');
    }

    ready () {
      this.attachShadow({ mode: 'open' });
      super.ready();
    }

    connectedCallback () {
      if (super.connectedCallback) super.connectedCallback();
      if (window.ShadyCSS) {
        const template = document.createElement('template');
        render(this.render(), template.content);
        window.ShadyCSS.prepareTemplate(template, this.constructor.is);
        window.ShadyCSS.styleElement(this);
      }
    }

    _flushProperties () {
      super._flushProperties();
      render(this.render(this) || html``, this.shadowRoot);
      if (this._nextRenderedResolver) {
        this._nextRenderedResolver();
        this._nextRenderedResolver = null;
        this._nextRendered = null;
      }
    }

    /**
     * Return a template result to render using lit-html.
     */
    render () { return html`` }

    invalidate () { this._invalidateProperties(); }

    get nextRendered () {
      if (!this._nextRendered) this._nextRendered = new Promise(resolve => this._nextRenderedResolver = resolve);
      return this._nextRendered;
    }
  }

  return ElementMixin;
});

