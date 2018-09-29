# element-lite
Master: [![Build Status](https://travis-ci.org/tjmonsi/element-lite.svg?branch=master)](https://travis-ci.org/tjmonsi/element-lite)
Develop: [![Build Status](https://travis-ci.org/tjmonsi/element-lite.svg?branch=develop)](https://travis-ci.org/tjmonsi/element-lite)

A take on using lit-html and using methods coming from Polymer.

This is based on https://github.com/PolymerLabs/lit-element and added my own take on creating my own
simple library. You can freely use it on your own projects.

Most of the methods and its internals came from Polymer's properties-mixin, properties-changed, property-accessors mixin, and property-effects mixin.

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
import { ElementLite } from 'node_modules/@littleq/element-lite/element-lite.js';

class Component extends ElementLite(HTMLElement) {
  template () {
    return 'Whatever you want to put in the ShadowDom';
  }
}

customElement.define('web-component', Component);
```

and add this to your HTML

```html
<script src="main.js" type="module"></script>
```

If you are going to use it with lit-html...

```js
// main.js
import { ElementLite } from 'node_modules/@littleq/element-lite/element-lite.js';
import { render, html } from 'node_modules/lit-html/lit-html.js';

class Component extends ElementLite(HTMLElement) {
  static get renderer () { return render; }

  template () {
    return html`Whatever you want to put in the ShadowDom`;
  }
}

customElement.define('web-component', Component);
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
import { ElementLite } from './node_modules/@littleq/element-lite/element-lite.js';
import { html, render } from './node_modules/lit-html/lit-html.js';
const { customElements } = window;

class Component extends ElementLite(HTMLElement) {
  static get is () { return 'test-element'; }

  static get renderer () { return render; }

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
  template () {
    const {test: { name }, testFx, testtwo, number, addNumber} = this;
    return html`
      Hello World ${testFx(name)} ${testtwo} ${number}
      <button @click=${addNumber.bind(this)}>
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

## Properties-Lite
If you need only the power to track changes in properties without the need of shadow DOM,
use `PropertiesLite`

```js
// main-base.js
import { PropertiesLite } from 'node_modules/@littleq/element-lite/properties-lite.js'

class Component extends PropertiesLite(HTMLElement) {
  static get properties () {
    return {
      prop1: {
        type: String,
        // sets up an event propagation upwards with the event name called 'prop1-change', anyone can listen to this to get change on the value of prop1 by using this:
        // thisElement.addEventListener('prop1-change', (event) => { console.log(event.detail) })
        // the value can be found in detail
        notify: true,
        // sets up the changes on the attribute itself. Will show up on DOM.
        reflectToAttribute: true,
        value: 'default'
      },
      prop2: {
        type: String,
        value: 'prop2',
        // will not setup a setter from the outside.
        // to change this value, you can only do thisElement._setProperty('prop2', value)
        // which is considered as a private method
        readOnly: true
      }
    }
  }
}

customElement.define('web-component-properties', Component);
```

## Observers-Lite

If you need only the power of `PropertiesLite` and use the additional parts like providing default and (in the future) call functions based on observed variables without the need of shadow DOM. Automatically extends `PropertiesLite`

```js
// main-base.js
import { ObserversLite } from 'node_modules/@littleq/element-lite/observers-lite.js'

class Component extends ObserversLite(HTMLElement) {
  static get properties () {
    return {
      prop1: {
        type: String,
        observer: 'prop1Changed', // calls this method if there are changes in prop1
        value: 'default'
      },
      prop2: {
        type: String,
        value: 'prop2',
      }
    }
  }

  static get observers () {
    return [
      'propsChanged(prop1, prop2)' // calls this method if there are changes in prop1 or prop2
    ];
  }

  // if called in observer only, it will put in both newValue and oldValue
  prop1Changed (newValue, oldValue) {
    console.log(newValue, oldValue)
  }

  // if calle in observers, it will put only the newValue of the parameters
  propsChanged (prop1, prop2) {
    console.log(prop1, prop2)
  }
}

customElement.define('web-component-observers', Component);
```


## TemplateLite

If you need the power of templating without tracking properties,
use `TemplateLite`

```js
// main-static.js
import { TemplateLite } from 'node_modules/@littleq/element-lite/template-lite.js'

class Component extends TemplateLite(HTMLElement) {
  template () {
    return `Hello World!`
  }
}

customElement.define('web-component-template', Component);
```

If you want to use `lit-html`, you need to define the `renderer` of `TemplateLite` to use `lit-html`'s `render` method

```js
// main-static.js
import { TemplateLite } from 'node_modules/@littleq/element-lite/template-lite.js'
import { render, html } from 'node_modules/@littleq/lit-html/lit-html.js'

class Component extends TemplateLite(HTMLElement) {
  static get renderer () { return render; }

  template () {
    return html`Hello World!`
  }
}

customElement.define('web-component-template', Component);
```

## ObjectAccessrorsLite

Documentation to be added...

## ArrayAccessorsLite

Documentation to be added...

## What files to import and how?

If you are going to use it on Evergreen Browsers that allows `<script type="module">`,
then you can just do this on your `js` files

```js
import { ElementLite } from './node_modules/@littleq/element-lite/element-lite.js';
```

If you are going to use it on Webpack or Rollup, you can do any of these

```js
// provided that node_modules is resolved in your configurations
import { ElementLite } from '@littleq/element-lite.js';
```

or

```js
import { ElementLite } from './node_modules/@littleq/element-lite';
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
<script src="/node_modules/@littleq/element-lite/dist/element-lite.umd.js">
<!-- <script src="/node_modules/@littleq/element-lite/dist/element-lite.umd.min.js">
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

## And does it work on?

It works on all major evergreen Browsers (Edge, Safari, Chrome, Firefox) as long as you have the Polyfills
set (make sure to add `webcomponents-lite` or `webcomponents-loader` and create the components after the
`WebComponentsReady` event has been fired)

It also works on Safari 11, Safari 10.1, and Safari 9.

This doesn't work on IE 11 below as of the moment. (It should work on IE 11 but the polyfill is different and currently on the works on creating a smooth documentation for it).

For IE 11. You need to use `lib/native-shim.es5.js` instead of `custom-element-es5-adapter` for it to work.

## Size

Based on size-limit

```
  properties-lite.js
  Package size: 1.78 KB
  Size limit:   2 KB

  observers-lite.js
  Package size: 2.25 KB
  Size limit:   2.5 KB

  object-accessors-lite.js // this is without properties-lite
  Package size: 775 B // should be around 2.6 KB if with properties-lite
  Size limit:   1 KB

  array-accessors-lite.js // this is without properties-lite
  Package size: 970 B // should be around 3 KB if with properties-lite
  Size limit:   1 KB

  template-lite.js // this is without lit-html
  Package size: 669 B // should be around 3.5 KB if with lit-html
  Size limit:   1 KB

  element-lite.js
  Package size: 3.2 KB
  Size limit:   3.5 KB

  element.js // using element-lite and lit-html
  Package size: 6.09 KB
  Size limit:   6.5 KB
```

## Known Issues

1. Not yet tested for Production https://github.com/tjmonsi/element-lite/issues/9
2. Not yet tested using Webpack on older browsers https://github.com/tjmonsi/element-lite/issues/10
3. Haven't tested a proper loop and if-then-else in https://github.com/tjmonsi/element-lite/issues/11
