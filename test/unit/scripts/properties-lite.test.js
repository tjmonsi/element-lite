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
      },
      title: {
        type: String
      },
      prop3: {
        type: String,
        value: 'c'
      },
      prop4: {
        type: String,
        reflectToAttribute: true
      },
      prop5: {
        type: Boolean,
        value: true,
        readOnly: true
      },
      prop6: {
        type: String,
        notify: true
      }
    };
  }
}

window.customElements.define(TestElement.is, TestElement);
