# element-lite
[![Build Status](https://travis-ci.org/tjmonsi/element-lite.svg?branch=master)](https://travis-ci.org/tjmonsi/element-lite)

A take on using lit-html and using methods coming from Polymer.

This is based on https://github.com/PolymerLabs/lit-element and added my own take on creating my own
simple library.

This is a work in progress but I will use it on my own projects. You can freely use it on your own projects.


## How to install:

To install, just do this:
```
npm i --save @littleq/element-lite
```


## Out of the box, what can I do?

You can add this to your JS

```js
// main.js
import { ElementLite, html } from 'node_modules/@littleq/element-lite/element-lite.js'

class Component extends ElementLite(HTMLElement) {
  render () {
    return html`Whatever you want to put in the ShadowDom`;
  }
}

customElement.define('web-component', Component);
```

and add this to your HTML

```html
<script src="main.js" type="module">
```

You can also add these additional scripts for polyfill

```html
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js">
```

And if you are using Webpack and you have bundled it in ES5 for older browsers, you also need:

```html
<script src="node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js">
```

## What else can it do?

You can put a default value on a property.

```js
class Component extends ElementLite(HTMLElement) {
  static get properties () {
    return {
      prop1: {
        type: String,
        value: 'default value'
      }
    }
  }
}
```

You can put auto reflect it on the attribute

```js
class Component extends ElementLite(HTMLElement) {
  static get properties () {
    return {
      prop1: {
        type: String,
        reflectToAttribute: true
      }
    }
  }
}
```

You can set the property to be read only (only settable by _setProperty method)

```js
class Component extends ElementLite(HTMLElement) {
  static get properties () {
    return {
      prop1: {
        type: String,
        readOnly: true
      }
    }
  }
}
```

You can call a method when the property changes...

```js
class Component extends ElementLite(HTMLElement) {
  static get properties () {
    return {
      prop1: {
        type: String,
        observer: '_prop1Changed'
      }
    }
  }

  _prop1Changed (newValue, oldValue) {
    // method goes here
  }
}
```

You can call a method when a set of property changes...

```js
class Component extends ElementLite(HTMLElement) {
  static get properties () {
    return {
      prop1: {
        type: String
      },
      prop2: {
        type: Object
      }
    }
  }

  static get observers () {
    return [
      '_propChanges(prop1, prop2.attr1)'
    ];
  }

  _propChanges (prop1, attr1) {
    // method goes here
  }
}

// ...

el.prop1 = 'a'
el.set('prop2.attr1', 'b')
// _propChanges('new', 'b')

```

It has helper methods for array mutations...

```js
class Component extends ElementLite(HTMLElement) {
  static get properties () {
    return {
      prop1: {
        type: Array,
        value: [],
        observer: '_arrayChanged'
      }
    }
  }

  _arrayChanged (newArray, oldArray) {
    // method goes here
  }
}

// ...

el.prop1 = ['a', 'b', 'c'];

// ...

el.push('prop1', 'd') // el.prop1 = ['a', 'b', 'c', 'd']

// ...

el.pop('prop1') // el.prop1 = ['a', 'b', 'c']

// ...

el.unshift('prop1', 'z') // el.prop1 = ['z', 'a', 'b', 'c']

// ...

el.shift('prop1') // el.prop1 = ['a', 'b', 'c']

// ...

el.splice('prop1', 1, 0, '1', '2') // el.prop1 = ['a', '1', '2', 'b', 'c']

// ...

el.splice('prop1', 1, 1) // el.prop1 = ['a', '2', 'b', 'c']
```

## Example usage

index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <title>Testing</title>
  </head>

  <body>
    <test-element></test-element>
    <script type="module" src="test-element.js" async></script>
  </body>
</html>
```

test-element.js
```js
import { ElementLite, html } from './node_modules/@littleq/element-lite/element-lite.js';
const { customElements } = window;

class Component extends ElementLite(HTMLElement) {
  static get is () { return 'test-element'; }

  static get properties () {
    return {
      test: {
        type: Object,
        value: {}
      },
      testtwo: {
        type: Boolean,
        value: false
      },
      number: {
        type: Number,
        value: 0
      }
    }
  }

  /**
   * Return a template result to render using lit-html.
   */
  render ({test: { name }, testFx, testtwo, number, addNumber}) {
    return html`
      Hello World ${testFx(name)} ${testtwo} ${number}
      <button on-click=${addNumber.bind(this)}>
        Click
      </button>
    `;
  }

  // We can use functions as variables in the rendered system
  testFx (name) {
    return `${name}!`
  }

  // We can call functions on event-handlers. Remember to add .bind(this)
  addNumber () {
    this.number++;
  }
}

// defines the element
customElements.define(Component.is, Component);

// Just changes the test object inside the test-element
setTimeout(() => {
  document.querySelector('test-element').test = {
    name: 'hello'
  };
}, 1000)

```

## Element-lite-base

If you need only the power to track changes in properties and use the additional parts like providing default
and (in the future) call functions based on observed variables, without the need of shadow DOM,
use `element-lite-base`

```js
// main-base.js
import { ElementLiteBase } from 'node_modules/@littleq/element-lite/element-lite-base.js'

class Component extends ElementLiteBase(HTMLElement) {
  ...
}

customElement.define('web-component-base', Component);
```


## Element-lite-static-shadow

If you need the power of element-lite-base but doesn't need to re-render the shadow DOM based on property changes,
use `element-lite-static-shadow`

```js
// main-static.js
import { ElementLiteStaticShadow } from 'node_modules/@littleq/element-lite/element-lite-static-shadow.js'

class Component extends ElementLiteStaticShadow(HTMLElement) {
  render () {
    return `Hello World!`
  }
}

customElement.define('web-component-static', Component);
```

## Size

Based on size-limit

```
npm run size

> @littleq/element-lite@0.0.2 size /home/tjmonsi/Projects/own-projects/element-lite
> size-limit

  element-lite-lit-only.js
  Package size: 2.49 KB
  Size limit:   2.5 KB

  element-lite-base.js
  Package size: 2.91 KB
  Size limit:   3 KB

  element-lite-static-shadow.js
  Package size: 2.98 KB
  Size limit:   3 KB

  element-lite.js
  Package size: 5.23 KB
  Size limit:   5.5 KB

  With all dependencies, minified and gzipped
```

## Known Issues

1. Not yet tested for Production #2
2. Not yet tested using Webpack on older browsers #2
4. Haven't tested a proper loop and if-then-else in #2