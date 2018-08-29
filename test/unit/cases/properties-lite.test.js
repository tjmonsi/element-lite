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
    expect(el.title).to.equal('text');
  });

  test('default value should exist', () => {
    const el = document.querySelector('#test');
    expect(el.prop3).to.equal('c');
  });

  test('property change should reflect to attribute when reflectToAttribute flag is true', done => {
    const el = document.querySelector('#test');
    el.prop4 = 'hey';
    // enclosed in timeout because invalidateProperties runs in a microtask
    // using Promise after the change in property
    setTimeout(() => {
      expect(el.getAttribute('prop4')).to.equal('hey');
      done();
    });
  });

  test('changes in attribute should reflect in property', () => {
    const el = document.querySelector('#test');
    el.setAttribute('prop1', 'd');
    expect(el.prop1).to.equal('d');
  });
});
