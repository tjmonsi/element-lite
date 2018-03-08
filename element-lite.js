import { ElementLiteBase } from './element-lite-base.js';
import { dedupingMixin } from './lib/deduping-mixin.js';
import { render } from '../../lit-html/lib/lit-extended.js';
import { html } from '../../lit-html/lit-html.js';

export { html };
export const ElementLite = dedupingMixin(base => {
  /**
   * ElementLite is a set of methods
   * @extends {ElementLiteBase}
  */
  class ElementLite extends ElementLiteBase(/** @type {HTMLElement} */(base)) {
    ready () {
      this.attachShadow({ mode: 'open' });
      super.ready();
    }

    /*
     * This is called when the attributes/properties has been changed.
     * This function in particular re-renders parts of the shadowRoot
     * based on lit-html's render function.
     */
    _propertiesChanged (currentProps, changedProps, oldProps) {
      this.__isChanging = true;
      super._propertiesChanged(currentProps, changedProps, oldProps);
      const result = this.render(this);

      if (result && this.shadowRoot) {
        render(this.render(this) || html``, this.shadowRoot);
      }

      if (this.__resolveRenderComplete) {
        window.requestAnimationFrame(() => {
          this.__resolveRenderComplete();
        });
      }

      this.__isChanging = false;
    }

    get renderComplete () {
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
