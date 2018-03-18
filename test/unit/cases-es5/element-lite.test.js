(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// @ts-nocheck
/* eslint-disable no-undef */

suite('ElementLite Mixin', function () {
  test('should have not be a HTMLUnknownElement constructor', function () {
    var el = document.querySelector('#test');
    expect(el.constructor.is).to.equal('test-element-three');
  });

  test('shadow root elements should exist', function () {
    var el = document.querySelector('#test');
    var span = el.shadowRoot.querySelector('#span');
    var span2 = el.shadowRoot.querySelector('#span-two');
    var button = el.shadowRoot.querySelector('#button');
    expect(span).to.exist;
    expect(span2).to.exist;
    expect(button).to.exist;
  });

  test('shadowRoot changes when props changed', function (done) {
    var el = document.createElement('test-element-three');
    document.body.appendChild(el);
    el.prop1 = 'a';
    el.set('prop2.attr1', 'b');
    setTimeout(function () {
      expect(el.shadowRoot.querySelector('#span').textContent.trim()).to.equal('a');
      expect(el.shadowRoot.querySelector('#span-two').textContent.trim()).to.equal('b');
      document.body.removeChild(el);
      done();
    });
  });

  test('button can be clicked', function (done) {
    var el = document.createElement('test-element-three');
    document.body.appendChild(el);
    var button = el.shadowRoot.querySelector('#button');
    expect(button).to.exist;
    MockInteractions.tap(button);
    setTimeout(function () {
      expect(el._boundedButtonClicked.calledOnce).to.be.true;
      expect(el.prop1).to.equal('changed');
      expect(el.shadowRoot.querySelector('#span').textContent.trim()).to.equal('changed');
      document.body.removeChild(el);
      done();
    });
  });

  test('button style is changed', function () {
    var el = document.createElement('test-element-three');
    document.body.append(el);
    var button = el.shadowRoot.querySelector('#button');
    expect(button).to.exist;
    expect(button.getBoundingClientRect().width).to.equal(500);
  });
});

})));
