(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// @ts-nocheck

var ElementLiteBase = window.ElementLite.ElementLiteBase;
var sinon = window.sinon;

/**
 * @extends {ElementLiteBase}
*/
var TestElement = (function (superclass) {
  function TestElement () {
    superclass.call(this);
    sinon.spy(this, '_propertiesChanged');
    this._prop4Changed = sinon.spy();
    this._propChanged = sinon.spy();
    this._prop7Changed = sinon.spy();
  }

  if ( superclass ) TestElement.__proto__ = superclass;
  TestElement.prototype = Object.create( superclass && superclass.prototype );
  TestElement.prototype.constructor = TestElement;

  var staticAccessors = { is: { configurable: true },properties: { configurable: true },observers: { configurable: true } };

  staticAccessors.is.get = function () { return 'test-element'; };

  staticAccessors.properties.get = function () {
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
  };

  staticAccessors.observers.get = function () {
    return [
      '_propChanged(prop5.attr1, prop6.attr2)'
    ];
  };

  Object.defineProperties( TestElement, staticAccessors );

  return TestElement;
}(ElementLiteBase(window.HTMLElement)));

window.customElements.define(TestElement.is, TestElement);

})));
