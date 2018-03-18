// @ts-nocheck

import { ElementLiteBase } from '../../../element-lite-base.js';
const sinon = window.sinon;

/**
 * @extends {ElementLiteBase}
*/
class TestElement extends ElementLiteBase(window.HTMLElement) {
  static get is () { return 'test-element'; }

  static get properties () {
    return {
      prop1: {
        type: String
      },

      prop2: {
        type: String
      },

      prop3: {
        type: String,
        value: 'c'
      },

      prop4: {
        type: String,
        observer: '_prop4Changed'
      },

      prop5: {
        type: Object
      },

      prop6: {
        type: Object
      },

      prop7: {
        type: Array,
        observer: '_prop7Changed'
      },

      prop8: {
        type: String,
        value: 'j',
        readOnly: true
      },

      prop9: {
        type: String,
        reflectToAttribute: true
      }
    };
  }

  static get observers () {
    return [
      '_propChanged(prop5.attr1, prop6.attr2)'
    ];
  }

  constructor () {
    super();
    sinon.spy(this, '_propertiesChanged');
    this._prop4Changed = sinon.spy();
    this._propChanged = sinon.spy();
    this._prop7Changed = sinon.spy();
  }
}

window.customElements.define(TestElement.is, TestElement);
