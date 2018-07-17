// @ts-nocheck

import { PropertiesLite } from '../../../properties-lite.js';
// const sinon = window.sinon;

/**
 * @extends {ElementLiteBase}
*/
class TestElement extends PropertiesLite(window.HTMLElement) {
  static get is () { return 'test-element'; }

  static get properties () {
    return {
      prop1: {
        type: String
      },
      prop2: {
        type: String
      }
    };
  }
}

window.customElements.define(TestElement.is, TestElement);
