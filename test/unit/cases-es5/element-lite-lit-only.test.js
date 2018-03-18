(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// @ts-nocheck
/* eslint-disable no-undef */

suite('ElementLiteLitOnly Mixin', function () {
  test('should have not be a HTMLUnknownElement constructor', function () {
    var el = document.querySelector('#test');
    expect(el.constructor.is).to.equal('test-element-two');
  });

  test('shadow root elements should exist', function () {
    var el = document.querySelector('#test');
    var input = el.shadowRoot.querySelector('#input');
    var button = el.shadowRoot.querySelector('#button');
    expect(input).to.exist;
    expect(button).to.exist;
  });

  test('button can be clicked', function (done) {
    var el = document.createElement('test-element-two');
    document.body.append(el);
    var button = el.shadowRoot.querySelector('#button');
    expect(button).to.exist;
    MockInteractions.tap(button);
    setTimeout(function () {
      expect(el._boundedButtonClicked.calledOnce).to.be.true;
      document.body.removeChild(el);
      done();
    });
  });

  test('button style is changed', function () {
    var el = document.createElement('test-element-two');
    document.body.append(el);
    var button = el.shadowRoot.querySelector('#button');
    expect(button).to.exist;
    expect(button.getBoundingClientRect().width).to.equal(500);
  });
});

})));
