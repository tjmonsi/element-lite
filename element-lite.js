import { ElementLiteBase } from './element-lite-base.js';
import { ElementLiteStaticShadow } from './element-lite-static-shadow.js';
import { ElementLiteLitOnly } from './element-lite-lit-only.js';
import { dedupingMixin } from './lib/deduping-mixin.js';
import { render, html } from '../../lit-html/lib/lit-extended.js';

export { html, ElementLiteBase, ElementLiteStaticShadow, ElementLiteLitOnly };
export const ElementLite = dedupingMixin(base => {
  /**
   * ElementLite is a set of methods coming from Polymer Property Mixins and Property Accessor Mixins
   * that automates the creation of setter and getters given a list of properties and
   * allows auto-calling of methods given observers.
   * @extends {ElementLiteBase}
  */
  class ElementLite extends ElementLiteBase(/** @type {HTMLElement} */(base)) {
    static get noShadow () {
      return false;
    }

    ready () {
      if (!this.constructor.noShadow) this.attachShadow({ mode: 'open' });
      super.ready();
      this._setShadow();
    }

    _setShadow () {
      const result = this.render(this);
      if (result) {
        render(this.render(this) || html``, this.shadowRoot || this);
      }
    }

    /*
     * This is called when the attributes/properties has been changed.
     * This function in particular re-renders parts of the shadowRoot
     * based on lit-html's render function.
     */
    _propertiesChanged (currentProps, changedProps, oldProps) {
      this.__isChanging = true;
      super._propertiesChanged(currentProps, changedProps, oldProps);
      this._setShadow();

      if (this.__resolveRenderComplete) {
        window.requestAnimationFrame(() => {
          this.__resolveRenderComplete();
        });
      }

      this.__isChanging = false;
    }

    get afterRender () {
      if (!this.__renderComplete) {
        this.__renderComplete = new Promise(resolve => {
          this.__resolveRenderComplete = () => {
            this.__resolveRenderComplete = this.__renderComplete = null;
            resolve();
          };
        });
        if (!this.__isInvalid && this.__resolveRenderComplete) {
          this.__resolveRenderComplete();
        }
      }
      return this.__renderComplete;
    }

    /**
     * Override which provides tracking of invalidated state.
    */
    _invalidateProperties () {
      this.__isInvalid = true;
      super._invalidateProperties();
    }

    /**
     * Return a template result to render using lit-html.
     */
    render (self) { return html``; }

    /**
     * Helper method to re-render the whole setup.
     */
    invalidate () {
      this._invalidateProperties();
    }
  }

  return ElementLite;
});
