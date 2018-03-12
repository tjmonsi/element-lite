/// <reference path="../typings/global.d.ts"/>

import { expect } from 'chai';
import { TestElement } from './component/test-element.js';

describe('Test Element', () => {
  it('should exist', () => {
    expect(TestElement).to.exist;
  });

  it('constructor name is the same using the `is`', () => {
    const el = document.createElement('test-element');
    expect(el.constructor.is).to.equal('test-element');
  });

  it('el.output should have a value: `test`', () => {
    /** @type {TestElement} */
    // @ts-ignore
    const el = document.createElement('test-element');
    el.output = 'test';
    expect(el.output).to.equal('test');
  });

  it('el.hello should have a default value: `world`', () => {
    /** @type {TestElement} */
    // @ts-ignore
    const el = document.createElement('test-element');
    expect(el.hello).to.equal('world');
  });

  it('el.output should have a value: `test-2` when el.test has the value `test-2` because observer method has been called', done => {
    /** @type {TestElement} */
    // @ts-ignore
    const el = document.createElement('test-element');
    el.connectedCallback();
    el.test = 'test-2';
    setTimeout(() => {
      expect(el.output).to.equal('test-2');
      done();
    }, 200);
  });
});
