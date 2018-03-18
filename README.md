# element-lite
Master: [![Build Status](https://travis-ci.org/tjmonsi/element-lite.svg?branch=master)](https://travis-ci.org/tjmonsi/element-lite)
Develop: [![Build Status](https://travis-ci.org/tjmonsi/element-lite.svg?branch=develop)](https://travis-ci.org/tjmonsi/element-lite)

A take on using lit-html and using methods coming from Polymer.

This is based on https://github.com/PolymerLabs/lit-element and added my own take on creating my own
simple library. You can freely use it on your own projects.

Most of the methods and its internals came from Polymer's properties-mixin, properties-changed, property-accessors mixin, and property-effects mixin (You can see each file on where parts are copied/modified from).

The reason for copying rather than depending on files is the added overhead of extending classes and
the number of method overrides, making some inherited methods not used in the final part of
upgrading the element. This is to squeeze out unused parts from the mixins.


## How to install:

### Using npm

This is the recommended way. To install, just do this:
```
npm i --save @littleq/element-lite
```


## Out of the box, what can I do?

### On evergreen browsers that support ES6 and import (Latest Firefox and Chrome)

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
<script src="main.js" type="module"></script>
```

### Usage on bundlers like Webpack

Same as above.

### For non-Chrome evergreen browsers (Latest Firefox, Safari, and Edge)

You need to add this additional script for polyfill

```html
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js">
```

And then wrap around the files after the `WebComponentsReady` event has been fired

```html
<script>
  window.addEventListener('WebComponentsReady', function() {
    var component = document.createElement('script');
    component.src = 'main.js';
    component.type = 'module';
    document.head.appendChild(component);
  });
</script>
```

### If you compiled and bundled the elements to ES5

if you are using Webpack and you have bundled it in ES5 for older browsers, you also need:

```html
<script src="node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js">
```

### If you don't need a bundler but is capable for use in older browsers

```html
<script src="/node_modules/@littleq/element-lite/dist/element-lite.umd.es5.min.js">
<script>
  window.addEventListener('WebComponentsReady', function() {
    var component = document.createElement('script');
    component.src = 'main.js';
    document.head.appendChild(component);
  });
</script>
```

```js
// main.js
// wrap in anonymous function
// Bundle this in ES5 either using Rollup or Webpack
(function(){
  // get ElementLite from window.ElementLite;
  var ElementLite = window.ElementLite.ElementLite;
  class Component extends ElementLite(HTMLElement) {
    render () {
      return html`Whatever you want to put in the ShadowDom`;
    }
  }
})();
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
// you can get lit-html's `html` from the bundle as well
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

## Element-lite-lit-only

If you don't need the power of element-lite-base but need to the power of lit-html,
use `element-lite-lit-only`

```js
// main-static.js
import { ElementLiteLitOnly } from 'node_modules/@littleq/element-lite/element-lite-lit-only.js'

class Component extends ElementLiteLitOnly(HTMLElement) {
  render () {
    return `Hello World!`
  }
}

customElement.define('web-component-static', Component);
```


## What files to import and how?

If you are going to use it on Evergreen Browsers that allows `<script type="module">`,
then you can just do this on your `js` files

```js
import { ElementLite } from './node_modules/@littleq/element-lite/element-lite.js';
```

If you are going to use it on Webpack or Rollup, you can do any of these

```js
// provided that node_modules is resolved in your configurations
import { ElementLite } from 'element-lite/@littleq/element-lite.js';
```

or

```js
import { ElementLite } from './node_modules/@littleq/element-lite';
```

or

```js
import { ElementLite } from './node_modules/@littleq/element-lite/dist/element-lite.esm.js';
```

If you are going to use `require` and not `import` you can do any of these

```js
// provided that node_modules is resolved in your configurations
var ElementLite = require('@littleq/element-lite').ElementLite;
```

or

```js
// provided that node_modules is resolved in your configurations
var ElementLite = require('@littleq/element-lite/dist/element-lite.cjs.js').ElementLite;
```

If you are going to load it via the `<script>` tag, you need to do these

For ES6

```html
<script src="/node_modules/@littleq/element-lite/dist/element-lite.umd.es6.js">
<!-- <script src="/node_modules/@littleq/element-lite/dist/element-lite.umd.es6.min.js">
if you need the minified file -->
```

For ES5

```html
<script src="/node_modules/@littleq/element-lite/dist/element-lite.umd.es5.js">
<!-- <script src="/node_modules/@littleq/element-lite/dist/element-lite.umd.es5.min.js">
if you need the minified file -->
```

and then can access it here

```js
var ElementLite = window.ElementLite.ElementLite
```

You can also load ElementLiteBase, ElementLiteStaticShadow and ElementLiteLitOnly from ElementLite as well

```js
// right from the box
import { ElementLiteBase, ElementLiteStaticShadow, ElementLiteLitOnly } from './node_modules/element-lite/element-lite.js';
```

using `require`

```js
// provided that node_modules is resolved in your configurations
var ElementLiteBase = require('@littleq/element-lite/dist/element-lite.cjs.js').ElementLiteBase;
var ElementLiteStaticShadow = require('@littleq/element-lite/dist/element-lite.cjs.js').ElementLiteStaticShadow;
var ElementLiteLitOnly = require('@littleq/element-lite/dist/element-lite.cjs.js').ElementLiteLitOnly;
```

using `<script>`

```js
var ElementLiteBase = window.ElementLite.ElementLiteBase
var ElementLiteStaticShadow = window.ElementLite.ElementLiteStaticShadow
var ElementLiteLitOnly = window.ElementLite.ElementLiteLitOnly
```


## And does it work on?

It works on all major evergreen Browsers (Edge, Safari, Chrome, Firefox) as long as you have the Polyfills
set (make sure to add `webcomponents-lite` or `webcomponents-loader` and create the components after the
`WebComponentsReady` event has been fired)

It also works on IE 11, Safari 11, Safari 10.1, Safari 9, and Safari 8.

Still checking on IE 10, 9, 8 and Safari 7, 6. (Need polyfills for `Map` and `WeakMap`).


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
  Package size: 5.33 KB
  Size limit:   5.5 KB

  With all dependencies, minified and gzipped
```

## Known Issues

1. Not yet tested for Production #9
2. Not yet tested using Webpack on older browsers #10
3. Haven't tested a proper loop and if-then-else in #11