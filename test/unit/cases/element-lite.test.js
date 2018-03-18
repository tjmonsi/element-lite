// @ts-nocheck
/* eslint-disable no-undef */

suite('ElementLite Mixin', () => {
  test('should have not be a HTMLUnknownElement constructor', () => {
    const el = document.querySelector('#test');
    expect(el.constructor.is).to.equal('test-element-three');
  });

  test('shadow root elements should exist', () => {
    const el = document.querySelector('#test');
    const span = el.shadowRoot.querySelector('#span');
    const span2 = el.shadowRoot.querySelector('#span-two');
    const button = el.shadowRoot.querySelector('#button');
    expect(span).to.exist;
    expect(span2).to.exist;
    expect(button).to.exist;
  });

  test('shadowRoot changes when props changed', done => {
    const el = document.createElement('test-element-three');
    document.body.appendChild(el);
    el.prop1 = 'a';
    el.set('prop2.attr1', 'b');
    setTimeout(() => {
      expect(el.shadowRoot.querySelector('#span').textContent.trim()).to.equal('a');
      expect(el.shadowRoot.querySelector('#span-two').textContent.trim()).to.equal('b');
      document.body.removeChild(el);
      done();
    });
  });

  test('button can be clicked', done => {
    const el = document.createElement('test-element-three');
    document.body.appendChild(el);
    const button = el.shadowRoot.querySelector('#button');
    expect(button).to.exist;
    MockInteractions.tap(button);
    setTimeout(() => {
      expect(el._boundedButtonClicked.calledOnce).to.be.true;
      expect(el.prop1).to.equal('changed');
      expect(el.shadowRoot.querySelector('#span').textContent.trim()).to.equal('changed');
      document.body.removeChild(el);
      done();
    });
  });

  test('button style is changed', () => {
    const el = document.createElement('test-element-three');
    document.body.append(el);
    const button = el.shadowRoot.querySelector('#button');
    expect(button).to.exist;
    expect(button.getBoundingClientRect().width).to.equal(500);
  });
});
