// @ts-nocheck

import { ElementLite, html } from '../../../element-lite.js';
var sinon = window.sinon;

/**
 * @extends {ElementLite}
*/
class TestElement extends ElementLite(window.HTMLElement) {
  static get is () { return 'test-element-three'; }

  static get properties () {
    return {
      prop1: {
        type: String
      },

      prop2: {
        type: Object,
        value: {}
      }
    };
  }

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
      <span id="span">${this.prop1}</span>
      <span id="span-two">${this.prop2.attr1}</span>
      <button id="button" type="button" on-click=${this._boundedButtonClicked}>Test</button>
    `;
  }

  _buttonClicked () {
    this.prop1 = 'changed';
  }
}

window.customElements.define(TestElement.is, TestElement);
