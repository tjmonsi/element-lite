// @ts-nocheck
/* eslint-disable no-undef */

suite('ElementLiteBase Mixin', () => {
  test('should have not be a HTMLUnknownElement constructor', () => {
    const el = document.querySelector('#test');
    expect(el.constructor.is).to.equal('test-element');
  });

  /**
   * Checking if attributes is reflected to properties
   * https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/test/unit/properties-changed.html
   */

  test('attributes reflected to properties via upgrade', () => {
    const el = document.querySelector('#test');
    expect(el.prop1).to.equal('a');
    expect(el.prop2).to.equal('b');
  });

  /**
   * Checking if the _propertiesChanged method is called
   * https://github.com/Polymer/polymer/blob/__auto_generated_3.0_preview/test/unit/properties-changed.html
   */

  test('setting properties results in _propertiesChanged', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop1 = 'a';
    el.prop2 = 'b';
    assert.equal(el._propertiesChanged.callCount, 1, '_propertiesChanged is not async');
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      // currentProps
      expect(el._propertiesChanged.getCall(1).args[0].prop1).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[0].prop2).to.equal('b');

      // changedProps
      expect(el._propertiesChanged.getCall(1).args[1].prop1).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[1].prop2).to.equal('b');

      // oldProps
      expect(el._propertiesChanged.getCall(1).args[2].prop1).to.equal(undefined);
      expect(el._propertiesChanged.getCall(1).args[2].prop2).to.equal(undefined);

      // reflect on property
      expect(el.prop1).to.equal('a');
      expect(el.prop2).to.equal('b');

      el.prop1 = 'aa';
      setTimeout(() => {
        expect(el._propertiesChanged.calledThrice).to.be.true;

        // currentProps
        expect(el._propertiesChanged.getCall(2).args[0].prop1).to.equal('aa');
        expect(el._propertiesChanged.getCall(2).args[0].prop2).to.equal('b');

        // changedProps
        expect(el._propertiesChanged.getCall(2).args[1].prop1).to.equal('aa');
        expect('prop2' in el._propertiesChanged.getCall(2).args[1]).to.be.false;

        // oldProps
        expect(el._propertiesChanged.getCall(2).args[2].prop1).to.equal('a');
        expect('prop2' in el._propertiesChanged.getCall(2).args[2]).to.be.false;

        document.body.removeChild(el);
        done();
      });
    });
  });

  test('setting attributes results in _propertiesChanged', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.setAttribute('prop1', 'a');
    el.setAttribute('prop2', 'b');
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      // currentProps
      expect(el._propertiesChanged.getCall(1).args[0].prop1).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[0].prop2).to.equal('b');

      // changedProps
      expect(el._propertiesChanged.getCall(1).args[1].prop1).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[1].prop2).to.equal('b');

      // oldProps
      expect(el._propertiesChanged.getCall(1).args[2].prop1).to.equal(undefined);
      expect(el._propertiesChanged.getCall(1).args[2].prop2).to.equal(undefined);

      // reflect on property
      expect(el.prop1).to.equal('a');
      expect(el.prop2).to.equal('b');

      el.setAttribute('prop1', 'aa');
      setTimeout(() => {
        expect(el._propertiesChanged.calledThrice).to.be.true;

        // currentProps
        expect(el._propertiesChanged.getCall(2).args[0].prop1).to.equal('aa');
        expect(el._propertiesChanged.getCall(2).args[0].prop2).to.equal('b');

        // changedProps
        expect(el._propertiesChanged.getCall(2).args[1].prop1).to.equal('aa');
        expect('prop2' in el._propertiesChanged.getCall(2).args[1]).to.be.false;

        // oldProps
        expect(el._propertiesChanged.getCall(2).args[2].prop1).to.equal('a');
        expect('prop2' in el._propertiesChanged.getCall(2).args[2]).to.be.false;
        document.body.removeChild(el);
        done();
      });
    });
  });

  /**
   * Checking if default value is called
   */
  test('defualt value is set using the attribute `value` in props', () => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    expect(el.prop3).to.equal('c');
    document.body.removeChild(el);
  });

  /**
   * Checking if observer method is called if the value of the prop has changed
   */
  test('observer method is called if the value of the prop has changed and should also get old data', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop4 = 'd';
    setTimeout(() => {
      expect(el._prop4Changed.calledTwice).to.be.true;
      expect(el._prop4Changed.getCall(1).args[0]).to.equal('d');
      expect(el._prop4Changed.getCall(1).args[1]).to.equal(undefined);
      el.prop4 = 'dd';
      setTimeout(() => {
        expect(el._prop4Changed.calledThrice).to.be.true;
        expect(el._prop4Changed.getCall(2).args[0]).to.equal('dd');
        expect(el._prop4Changed.getCall(2).args[1]).to.equal('d');
        document.body.removeChild(el);
        done();
      });
    });
  });

  test('observer method in the observers list is called if the value of the props have changed', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop5 = {
      attr1: 'e'
    };
    el.prop6 = {
      attr2: 'f'
    };
    setTimeout(() => {
      expect(el.prop5.attr1).to.equal('e');
      expect(el.prop6.attr2).to.equal('f');

      expect(el._propChanged.calledTwice).to.be.true;
      expect(el._propChanged.getCall(1).args[0]).to.equal('e');
      expect(el._propChanged.getCall(1).args[1]).to.equal('f');

      document.body.removeChild(el);
      done();
    });
  });

  test('setting value on a path works', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop5 = {
      attr1: 'g'
    };
    setTimeout(() => {
      expect(el.prop5.attr1).to.equal('g');
      el.set('prop5.attr1', 'gg');

      setTimeout(() => {
        expect(el.prop5.attr1).to.equal('gg');
        document.body.removeChild(el);
        done();
      });
    });
  });

  test('setting value on a path works and results in _propertiesChanged', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop5 = {
      attr1: 'g'
    };

    assert.equal(el._propertiesChanged.callCount, 1, '_propertiesChanged is not async');
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      // currentProps
      expect(el._propertiesChanged.getCall(1).args[0].prop5.attr1).to.equal('g');

      // changedProps
      expect(el._propertiesChanged.getCall(1).args[1].prop5.attr1).to.equal('g');

      // oldProps
      expect(el._propertiesChanged.getCall(1).args[2].prop5).to.equal(undefined);

      // reflect on property
      expect(el.prop5.attr1).to.equal('g');

      el.set('prop5.attr1', 'gg');
      setTimeout(() => {
        expect(el._propertiesChanged.calledThrice).to.be.true;

        // currentProps
        expect(el._propertiesChanged.getCall(1).args[0].prop5.attr1).to.equal('gg');

        // changedProps
        expect(el._propertiesChanged.getCall(2).args[1]['prop5.attr1']).to.equal('gg');

        // reflect on property
        expect(el.prop5.attr1).to.equal('gg');

        document.body.removeChild(el);
        done();
      });
    });
  });

  test('observer method in the observers list is called twice if the value of the props have changed using set', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop5 = {
      attr1: 'h'
    };
    el.prop6 = {
      attr2: 'i'
    };
    setTimeout(() => {
      expect(el.prop5.attr1).to.equal('h');
      expect(el.prop6.attr2).to.equal('i');

      expect(el._propChanged.calledTwice).to.be.true;
      expect(el._propChanged.getCall(1).args[0]).to.equal('h');
      expect(el._propChanged.getCall(1).args[1]).to.equal('i');

      el.set('prop5.attr1', 'hh');
      setTimeout(() => {
        expect(el.prop5.attr1).to.equal('hh');

        expect(el._propChanged.calledThrice).to.be.true;
        expect(el._propChanged.getCall(2).args[0]).to.equal('hh');
        expect(el._propChanged.getCall(2).args[1]).to.equal('i');
        document.body.removeChild(el);
        done();
      });
    });
  });

  /**
   * Called _propertiesChanged is called on array mutations
   */

  test('array push mutations work and _propertiesChanged are called', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop7 = ['a', 'b', 'c'];
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      expect(el._propertiesChanged.getCall(1).args[1].prop7.length).to.equal(3);
      expect(el._propertiesChanged.getCall(1).args[1].prop7[0]).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[1]).to.equal('b');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[2]).to.equal('c');

      expect(el._propertiesChanged.getCall(1).args[2].prop7).to.equal(undefined);

      el.push('prop7', 'd');
      setTimeout(() => {
        expect(el.prop7.length).to.equal(4);
        expect(el.prop7[0]).to.equal('a');
        expect(el.prop7[1]).to.equal('b');
        expect(el.prop7[2]).to.equal('c');
        expect(el.prop7[3]).to.equal('d');

        expect(el._propertiesChanged.calledThrice).to.be.true;

        expect(el._propertiesChanged.getCall(2).args[1].prop7.length).to.equal(4);
        expect(el._propertiesChanged.getCall(2).args[1].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[1]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[2]).to.equal('c');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[3]).to.equal('d');

        expect(el._propertiesChanged.getCall(2).args[2].prop7.length).to.equal(3);
        expect(el._propertiesChanged.getCall(2).args[2].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[1]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[2]).to.equal('c');
        done();
      });
    });
  });

  test('array pop mutations work and _propertiesChanged are called', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    expect(el._propertiesChanged.calledOnce).to.be.true;
    el.prop7 = ['a', 'b', 'c'];
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      expect(el._propertiesChanged.getCall(1).args[1].prop7.length).to.equal(3);
      expect(el._propertiesChanged.getCall(1).args[1].prop7[0]).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[1]).to.equal('b');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[2]).to.equal('c');

      expect(el._propertiesChanged.getCall(1).args[2].prop7).to.equal(undefined);

      el.pop('prop7');
      setTimeout(() => {
        expect(el.prop7.length).to.equal(2);
        expect(el.prop7[0]).to.equal('a');
        expect(el.prop7[1]).to.equal('b');

        expect(el._propertiesChanged.calledThrice).to.be.true;

        expect(el._propertiesChanged.getCall(2).args[1].prop7.length).to.equal(2);
        expect(el._propertiesChanged.getCall(2).args[1].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[1]).to.equal('b');

        expect(el._propertiesChanged.getCall(2).args[2].prop7.length).to.equal(3);
        expect(el._propertiesChanged.getCall(2).args[2].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[1]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[2]).to.equal('c');
        done();
      });
    });
  });

  test('array unshift mutations work and _propertiesChanged are called', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop7 = ['a', 'b', 'c'];
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      expect(el._propertiesChanged.getCall(1).args[1].prop7.length).to.equal(3);
      expect(el._propertiesChanged.getCall(1).args[1].prop7[0]).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[1]).to.equal('b');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[2]).to.equal('c');

      expect(el._propertiesChanged.getCall(1).args[2].prop7).to.equal(undefined);

      el.unshift('prop7', 'd');
      setTimeout(() => {
        expect(el.prop7.length).to.equal(4);
        expect(el.prop7[1]).to.equal('a');
        expect(el.prop7[2]).to.equal('b');
        expect(el.prop7[3]).to.equal('c');
        expect(el.prop7[0]).to.equal('d');

        expect(el._propertiesChanged.calledThrice).to.be.true;

        expect(el._propertiesChanged.getCall(2).args[1].prop7.length).to.equal(4);
        expect(el._propertiesChanged.getCall(2).args[1].prop7[1]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[2]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[3]).to.equal('c');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[0]).to.equal('d');

        expect(el._propertiesChanged.getCall(2).args[2].prop7.length).to.equal(3);
        expect(el._propertiesChanged.getCall(2).args[2].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[1]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[2]).to.equal('c');
        done();
      });
    });
  });

  test('array shift mutations work and _propertiesChanged are called', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop7 = ['a', 'b', 'c'];
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      expect(el._propertiesChanged.getCall(1).args[1].prop7.length).to.equal(3);
      expect(el._propertiesChanged.getCall(1).args[1].prop7[0]).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[1]).to.equal('b');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[2]).to.equal('c');

      expect(el._propertiesChanged.getCall(1).args[2].prop7).to.equal(undefined);

      el.shift('prop7');
      setTimeout(() => {
        expect(el.prop7.length).to.equal(2);
        expect(el.prop7[0]).to.equal('b');
        expect(el.prop7[1]).to.equal('c');

        expect(el._propertiesChanged.calledThrice).to.be.true;

        expect(el._propertiesChanged.getCall(2).args[1].prop7.length).to.equal(2);
        expect(el._propertiesChanged.getCall(2).args[1].prop7[0]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[1]).to.equal('c');

        expect(el._propertiesChanged.getCall(2).args[2].prop7.length).to.equal(3);
        expect(el._propertiesChanged.getCall(2).args[2].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[1]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[2]).to.equal('c');
        done();
      });
    });
  });

  test('array splice (remove only) mutations work and _propertiesChanged are called', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop7 = ['a', 'b', 'c'];
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      expect(el._propertiesChanged.getCall(1).args[1].prop7.length).to.equal(3);
      expect(el._propertiesChanged.getCall(1).args[1].prop7[0]).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[1]).to.equal('b');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[2]).to.equal('c');

      expect(el._propertiesChanged.getCall(1).args[2].prop7).to.equal(undefined);

      el.splice('prop7', 1, 1);
      setTimeout(() => {
        expect(el.prop7.length).to.equal(2);
        expect(el.prop7[0]).to.equal('a');
        expect(el.prop7[1]).to.equal('c');

        expect(el._propertiesChanged.calledThrice).to.be.true;

        expect(el._propertiesChanged.getCall(2).args[1].prop7.length).to.equal(2);
        expect(el._propertiesChanged.getCall(2).args[1].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[1]).to.equal('c');

        expect(el._propertiesChanged.getCall(2).args[2].prop7.length).to.equal(3);
        expect(el._propertiesChanged.getCall(2).args[2].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[1]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[2]).to.equal('c');
        done();
      });
    });
  });

  test('array splice (with insert only) mutations work and _propertiesChanged are called', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop7 = ['a', 'b', 'c'];
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      expect(el._propertiesChanged.getCall(1).args[1].prop7.length).to.equal(3);
      expect(el._propertiesChanged.getCall(1).args[1].prop7[0]).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[1]).to.equal('b');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[2]).to.equal('c');

      expect(el._propertiesChanged.getCall(1).args[2].prop7).to.equal(undefined);

      el.splice('prop7', 1, 0, 'd', 'e');
      setTimeout(() => {
        expect(el.prop7.length).to.equal(5);
        expect(el.prop7[0]).to.equal('a');
        expect(el.prop7[1]).to.equal('d');
        expect(el.prop7[2]).to.equal('e');
        expect(el.prop7[3]).to.equal('b');
        expect(el.prop7[4]).to.equal('c');

        expect(el._propertiesChanged.calledThrice).to.be.true;

        expect(el._propertiesChanged.getCall(2).args[1].prop7.length).to.equal(5);
        expect(el._propertiesChanged.getCall(2).args[1].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[1]).to.equal('d');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[2]).to.equal('e');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[3]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[4]).to.equal('c');

        expect(el._propertiesChanged.getCall(2).args[2].prop7.length).to.equal(3);
        expect(el._propertiesChanged.getCall(2).args[2].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[1]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[2]).to.equal('c');
        done();
      });
    });
  });

  test('array splice (with insert and remove) mutations work and _propertiesChanged are called', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop7 = ['a', 'b', 'c'];
    setTimeout(() => {
      expect(el._propertiesChanged.calledTwice).to.be.true;

      expect(el._propertiesChanged.getCall(1).args[1].prop7.length).to.equal(3);
      expect(el._propertiesChanged.getCall(1).args[1].prop7[0]).to.equal('a');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[1]).to.equal('b');
      expect(el._propertiesChanged.getCall(1).args[1].prop7[2]).to.equal('c');

      expect(el._propertiesChanged.getCall(1).args[2].prop7).to.equal(undefined);

      el.splice('prop7', 1, 1, 'd', 'e');
      setTimeout(() => {
        expect(el.prop7.length).to.equal(4);
        expect(el.prop7[0]).to.equal('a');
        expect(el.prop7[1]).to.equal('d');
        expect(el.prop7[2]).to.equal('e');
        expect(el.prop7[3]).to.equal('c');

        expect(el._propertiesChanged.calledThrice).to.be.true;

        expect(el._propertiesChanged.getCall(2).args[1].prop7.length).to.equal(4);
        expect(el._propertiesChanged.getCall(2).args[1].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[1]).to.equal('d');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[2]).to.equal('e');
        expect(el._propertiesChanged.getCall(2).args[1].prop7[3]).to.equal('c');

        expect(el._propertiesChanged.getCall(2).args[2].prop7.length).to.equal(3);
        expect(el._propertiesChanged.getCall(2).args[2].prop7[0]).to.equal('a');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[1]).to.equal('b');
        expect(el._propertiesChanged.getCall(2).args[2].prop7[2]).to.equal('c');
        done();
      });
    });
  });

  /**
   * Checking if observer method is called on array mutations
   */

  test('array push mutations work and observer called', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop7 = ['a', 'b', 'c'];
    setTimeout(() => {
      expect(el._prop7Changed.calledTwice).to.be.true;

      expect(el._prop7Changed.getCall(1).args[0].length).to.equal(3);
      expect(el._prop7Changed.getCall(1).args[0][0]).to.equal('a');
      expect(el._prop7Changed.getCall(1).args[0][1]).to.equal('b');
      expect(el._prop7Changed.getCall(1).args[0][2]).to.equal('c');

      expect(el._prop7Changed.getCall(1).args[1]).to.equal(undefined);

      el.splice('prop7', 1, 1, 'd', 'e');
      setTimeout(() => {
        expect(el.prop7.length).to.equal(4);
        expect(el.prop7[0]).to.equal('a');
        expect(el.prop7[1]).to.equal('d');
        expect(el.prop7[2]).to.equal('e');
        expect(el.prop7[3]).to.equal('c');

        expect(el._prop7Changed.calledThrice).to.be.true;

        expect(el._prop7Changed.getCall(2).args[0].length).to.equal(4);
        expect(el._prop7Changed.getCall(2).args[0][0]).to.equal('a');
        expect(el._prop7Changed.getCall(2).args[0][1]).to.equal('d');
        expect(el._prop7Changed.getCall(2).args[0][2]).to.equal('e');
        expect(el._prop7Changed.getCall(2).args[0][3]).to.equal('c');

        expect(el._prop7Changed.getCall(2).args[1].length).to.equal(3);
        expect(el._prop7Changed.getCall(2).args[1][0]).to.equal('a');
        expect(el._prop7Changed.getCall(2).args[1][1]).to.equal('b');
        expect(el._prop7Changed.getCall(2).args[1][2]).to.equal('c');
        done();
      });
    });
  });

  /**
   * Check on readOnly attribute
   */

  test('readOnly should not be set and should throw an error', () => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    expect(el.prop8).to.equal('j');
    const bad = () => { el.prop8 = 'k'; };
    expect(bad).to.throw();
    document.body.removeChild(el);
  });

  /**
   * Check on reflectToAttribute attribute
   */

  test('reflectToAttribute should reflect to attribute', done => {
    const el = document.createElement('test-element');
    document.body.appendChild(el);
    el.prop9 = 'k';
    setTimeout(() => {
      expect(el.prop9).to.equal('k');
      expect(el.getAttribute('prop9')).to.equal('k');
      document.body.removeChild(el);
      done();
    });
  });
});
