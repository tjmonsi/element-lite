// @ts-nocheck

import { ElementLiteLitOnly, html } from '../../../element-lite-lit-only.js';
var sinon = window.sinon;

/**
 * @extends {ElementLiteLitOnly}
*/
class TestElement extends ElementLiteLitOnly(window.HTMLElement) {
  static get is () { return 'test-element-two'; }

  constructor () {
    super();
    this._boundedButtonClicked = this._buttonClicked.bind(this);
    sinon.spy(this, '_boundedButtonClicked');
  }

  render () {
    return html`
      <style>
        #button {
          width: 500px;
        }
      </style>
      <input id="input" type="text">
      <button id="button" type="button" on-click=${this._boundedButtonClicked}>Test</button>
    `;
  }

  _buttonClicked () {
    this.shadowRoot.querySelector('#input').value = Math.random();
  }
}

window.customElements.define(TestElement.is, TestElement);
