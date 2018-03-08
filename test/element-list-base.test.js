import { expect } from 'chai';
import { TestElement } from './test-element.js';

describe('Test Element', () => {
  it('should exist', () => {
    expect(TestElement).to.exist;
  });

  it('should work', () => {
    const el = document.createElement('test-element');
    expect(el.constructor.is).to.equal('test-element');
  });
});
