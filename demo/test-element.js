import { ElementLiteBase } from '../element-lite-base.js';

/**
 * @extends {ElementLiteBase}
*/
class TestElement extends ElementLiteBase(window.HTMLElement) {
  static get is () { return 'test-element'; }
}

window.customElements.define(TestElement.is, TestElement);

export { TestElement };
