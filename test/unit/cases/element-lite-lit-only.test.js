// @ts-nocheck
/* eslint-disable no-undef */

suite('ElementLiteLitOnly Mixin', () => {
  test('should have not be a HTMLUnknownElement constructor', () => {
    const el = document.querySelector('#test');
    expect(el.constructor.is).to.equal('test-element-two');
  });

  test('shadow root elements should exist', () => {
    const el = document.querySelector('#test');
    const input = el.shadowRoot.querySelector('#input');
    const button = el.shadowRoot.querySelector('#button');
    expect(input).to.exist;
    expect(button).to.exist;
  });

  test('button can be clicked', done => {
    const el = document.createElement('test-element-two');
    document.body.append(el);
    const button = el.shadowRoot.querySelector('#button');
    expect(button).to.exist;
    MockInteractions.tap(button);
    setTimeout(() => {
      expect(el._boundedButtonClicked.calledOnce).to.be.true;
      document.body.removeChild(el);
      done();
    });
  });

  test('button style is changed', () => {
    const el = document.createElement('test-element-two');
    document.body.append(el);
    const button = el.shadowRoot.querySelector('#button');
    expect(button).to.exist;
    expect(button.getBoundingClientRect().width).to.equal(500);
  });
});
