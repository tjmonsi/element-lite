(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// @ts-nocheck

var ElementLite = window.ElementLite.ElementLite;
var html = window.ElementLite.html;
var sinon = window.sinon;

/**
 * @extends {ElementLite}
*/
var TestElementThree = (function (superclass) {
  function TestElementThree () {
    superclass.call(this);
    this._boundedButtonClicked = this._buttonClicked.bind(this);
    sinon.spy(this, '_boundedButtonClicked');
  }

  if ( superclass ) TestElementThree.__proto__ = superclass;
  TestElementThree.prototype = Object.create( superclass && superclass.prototype );
  TestElementThree.prototype.constructor = TestElementThree;

  var staticAccessors = { is: { configurable: true },properties: { configurable: true } };

  staticAccessors.is.get = function () { return 'test-element-three'; };

  staticAccessors.properties.get = function () {
    return {
      prop1: {
        type: String
      },

      prop2: {
        type: Object,
        value: {}
      }
    };
  };

  TestElementThree.prototype.render = function render () {
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
  };

  TestElementThree.prototype._buttonClicked = function _buttonClicked () {
    this.prop1 = 'changed';
  };

  Object.defineProperties( TestElementThree, staticAccessors );

  return TestElementThree;
}(ElementLite(window.HTMLElement)));

window.customElements.define(TestElementThree.is, TestElementThree);

})));
