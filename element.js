/// <reference path="typings-project/global.d.ts"/>
'use strict';

import { ElementLite } from './element-lite.js';
import { render, html } from './node_modules/lit-html/lit-html.js';

export class Element extends ElementLite {
  static get renderer () {
    return render;
  }

  template () {
    return html``;
  }
}
