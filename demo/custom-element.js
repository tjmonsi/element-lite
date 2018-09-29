class CustomElement extends window.HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  set prop1 (prop1) {
    this._prop1 = prop1;
    this._render();
  }

  get prop1 () {
    return this._prop1;
  }

  _render () {
    this.shadowRoot.innerHTML = `Hello ${this.prop1 || 'World'}`;
  }
}

window.customElements.define('custom-element', CustomElement);
