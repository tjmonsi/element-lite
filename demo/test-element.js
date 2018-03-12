import { ElementLiteBase } from '../element-lite-base.js';

/**
 * @extends {ElementLiteBase}
*/
class TestElement extends ElementLiteBase(window.HTMLElement) {
  static get is () { return 'test-element'; }

  static get properties () {
    return {
      hello: {
        type: String,
        value: 'world'
      },

      output: {
        type: String
      },

      test: {
        type: String,
        observer: '_testChanged'
      }
    };
  }

  _testChanged (test, oldTest) {
    console.log(oldTest);
    this.output = test;
  }
}

window.customElements.define(TestElement.is, TestElement);

export { TestElement };
