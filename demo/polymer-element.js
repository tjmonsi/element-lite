class CustomElement extends PolymerElement {
  static get properties () {
    return {
      prop1: {
        type: String,
        value: 'World'
      }
    };
  }

  static get template () {
    return html`Hello [[prop1]]`;
  }
}

window.customElements.define('custom-element', CustomElement);