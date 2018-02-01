# element-lite
A take on using lit-html and polymer's property mixin

This is based on https://github.com/PolymerLabs/lit-element and added my own take on creating my own
simple library.

This is a work in progress but I will use it on my own projects once I have made it stable (and created simple tests for it)


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

Out of the box, without minifying and compressing the code, element-lite and its dependencies are under 56KB.
This file is about 2.7KB

Based on size-limit (have to add lit-html folders and @polymer folders 2 directories above to solve resolution problems)

```
npm run size

> @littleq/element-lite@0.0.2 size /home/tjmonsi/Projects/own-projects/element-lite
> size-limit

  element-lite.js
  Package size: 4.1 KB
  Size limit:   7 KB

  element-lite-static-shadow.js
  Package size: 1.84 KB
  Size limit:   5 KB

  element-lite-base.js
  Package size: 1.74 KB
  Size limit:   5 KB

  With all dependencies, minified and gzipped
```

## Known Issues

1. Not yet tested for Production #2
2. Not yet tested using Webpack on older browsers #2
3. No ability to do static get observers or something equivalent #3
4. Haven't tested a proper loop and if-then-else in #2
5. Doesn't track changes on attribute level of an object property #1