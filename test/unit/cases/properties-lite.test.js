// @ts-nocheck
/* eslint-disable no-undef */

suite('Properties Mixin', () => {
  test('should have not be a HTMLUnknownElement constructor', () => {
    const el = document.querySelector('#test');
    expect(el.constructor.is).to.equal('test-element');
  });

  test('attributes reflected to properties via upgrade', () => {
    const el = document.querySelector('#test');
    expect(el.prop1).to.equal('a');
    expect(el.prop2).to.equal('b');
  });
});
