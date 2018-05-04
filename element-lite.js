import { ElementLiteBase } from './element-lite-base.js';
import { ElementLiteStatic } from './element-lite-static.js';
import { ElementLiteLit } from './element-lite-lit.js';
import { dedupingMixin } from './lib/deduping-mixin.js';
import { render, html } from './lib/lit-html/lib/lit-extended.js';

export { html, ElementLiteBase, ElementLiteStatic, ElementLiteLit };
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
      this.__isInvalid = false;
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
    _invalidateProperties (forceInvalidate) {
      this.__isInvalid = true;
      super._invalidateProperties(forceInvalidate);
    }

    /**
     * Return a template result to render using lit-html.
     */
    render (self) { return html``; }

    /**
     * Helper method to re-render the whole setup.
     */
    invalidate () {
      this._invalidateProperties(true);
    }
  }

  return ElementLite;
});
