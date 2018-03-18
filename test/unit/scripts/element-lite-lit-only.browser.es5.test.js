(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// @ts-nocheck

var ElementLiteLitOnly = window.ElementLite.ElementLiteLitOnly;
var html = window.ElementLite.html;
var sinon = window.sinon;

/**
 * @extends {ElementLiteLitOnly}
*/
var TestElementTwo = (function (superclass) {
  function TestElementTwo () {
    superclass.call(this);
    this._boundedButtonClicked = this._buttonClicked.bind(this);
    sinon.spy(this, '_boundedButtonClicked');
  }

  if ( superclass ) TestElementTwo.__proto__ = superclass;
  TestElementTwo.prototype = Object.create( superclass && superclass.prototype );
  TestElementTwo.prototype.constructor = TestElementTwo;

  var staticAccessors = { is: { configurable: true } };

  staticAccessors.is.get = function () { return 'test-element-two'; };

  TestElementTwo.prototype.render = function render () {
    return html`
      <style>
        #button {
          width: 500px;
        }
      </style>
      <input id="input" type="text">
      <button id="button" type="button" on-click=${this._boundedButtonClicked}>Test</button>
    `;
  };

  TestElementTwo.prototype._buttonClicked = function _buttonClicked () {
    this.shadowRoot.querySelector('#input').value = Math.random();
  };

  Object.defineProperties( TestElementTwo, staticAccessors );

  return TestElementTwo;
}(ElementLiteLitOnly(window.HTMLElement)));

window.customElements.define(TestElementTwo.is, TestElementTwo);

})));
