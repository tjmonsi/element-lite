(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var nativeShadow = !(window['ShadyDOM'] && window['ShadyDOM']['inUse']);
  var nativeCssVariables_ = void 0;

  /**
   * @param {(ShadyCSSOptions | ShadyCSSInterface)=} settings
   */
  function calcCssVariables(settings) {
    if (settings && settings['shimcssproperties']) {
      nativeCssVariables_ = false;
    } else {
      // chrome 49 has semi-working css vars, check if box-shadow works
      // safari 9.1 has a recalc bug: https://bugs.webkit.org/show_bug.cgi?id=155782
      // However, shim css custom properties are only supported with ShadyDOM enabled,
      // so fall back on native if we do not detect ShadyDOM
      // Edge 15: custom properties used in ::before and ::after will also be used in the parent element
      // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12414257/
      nativeCssVariables_ = nativeShadow || Boolean(!navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/) && window.CSS && CSS.supports && CSS.supports('box-shadow', '0 0 0 var(--foo)'));
    }
  }

  if (window.ShadyCSS && window.ShadyCSS.nativeCss !== undefined) {
    nativeCssVariables_ = window.ShadyCSS.nativeCss;
  } else if (window.ShadyCSS) {
    calcCssVariables(window.ShadyCSS);
    // reset window variable to let ShadyCSS API take its place
    window.ShadyCSS = undefined;
  } else {
    calcCssVariables(window['WebComponents'] && window['WebComponents']['flags']);
  }

  // Hack for type error under new type inference which doesn't like that
  // nativeCssVariables is updated in a function and assigns the type
  // `function(): ?` instead of `boolean`.
  var nativeCssVariables = /** @type {boolean} */nativeCssVariables_;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /** @unrestricted */

  var StyleNode = function StyleNode() {
    classCallCheck(this, StyleNode);

    /** @type {number} */
    this['start'] = 0;
    /** @type {number} */
    this['end'] = 0;
    /** @type {StyleNode} */
    this['previous'] = null;
    /** @type {StyleNode} */
    this['parent'] = null;
    /** @type {Array<StyleNode>} */
    this['rules'] = null;
    /** @type {string} */
    this['parsedCssText'] = '';
    /** @type {string} */
    this['cssText'] = '';
    /** @type {boolean} */
    this['atRule'] = false;
    /** @type {number} */
    this['type'] = 0;
    /** @type {string} */
    this['keyframesName'] = '';
    /** @type {string} */
    this['selector'] = '';
    /** @type {string} */
    this['parsedSelector'] = '';
  };

  // given a string of css, return a simple rule tree
  /**
   * @param {string} text
   * @return {StyleNode}
   */
  function parse(text) {
    text = clean(text);
    return parseCss(lex(text), text);
  }

  // remove stuff we don't care about that may hinder parsing
  /**
   * @param {string} cssText
   * @return {string}
   */
  function clean(cssText) {
    return cssText.replace(RX.comments, '').replace(RX.port, '');
  }

  // super simple {...} lexer that returns a node tree
  /**
   * @param {string} text
   * @return {StyleNode}
   */
  function lex(text) {
    var root = new StyleNode();
    root['start'] = 0;
    root['end'] = text.length;
    var n = root;
    for (var i = 0, l = text.length; i < l; i++) {
      if (text[i] === OPEN_BRACE) {
        if (!n['rules']) {
          n['rules'] = [];
        }
        var p = n;
        var previous = p['rules'][p['rules'].length - 1] || null;
        n = new StyleNode();
        n['start'] = i + 1;
        n['parent'] = p;
        n['previous'] = previous;
        p['rules'].push(n);
      } else if (text[i] === CLOSE_BRACE) {
        n['end'] = i + 1;
        n = n['parent'] || root;
      }
    }
    return root;
  }

  // add selectors/cssText to node tree
  /**
   * @param {StyleNode} node
   * @param {string} text
   * @return {StyleNode}
   */
  function parseCss(node, text) {
    var t = text.substring(node['start'], node['end'] - 1);
    node['parsedCssText'] = node['cssText'] = t.trim();
    if (node['parent']) {
      var ss = node['previous'] ? node['previous']['end'] : node['parent']['start'];
      t = text.substring(ss, node['start'] - 1);
      t = _expandUnicodeEscapes(t);
      t = t.replace(RX.multipleSpaces, ' ');
      // TODO(sorvell): ad hoc; make selector include only after last ;
      // helps with mixin syntax
      t = t.substring(t.lastIndexOf(';') + 1);
      var s = node['parsedSelector'] = node['selector'] = t.trim();
      node['atRule'] = s.indexOf(AT_START) === 0;
      // note, support a subset of rule types...
      if (node['atRule']) {
        if (s.indexOf(MEDIA_START) === 0) {
          node['type'] = types.MEDIA_RULE;
        } else if (s.match(RX.keyframesRule)) {
          node['type'] = types.KEYFRAMES_RULE;
          node['keyframesName'] = node['selector'].split(RX.multipleSpaces).pop();
        }
      } else {
        if (s.indexOf(VAR_START) === 0) {
          node['type'] = types.MIXIN_RULE;
        } else {
          node['type'] = types.STYLE_RULE;
        }
      }
    }
    var r$ = node['rules'];
    if (r$) {
      for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
        parseCss(r, text);
      }
    }
    return node;
  }

  /**
   * conversion of sort unicode escapes with spaces like `\33 ` (and longer) into
   * expanded form that doesn't require trailing space `\000033`
   * @param {string} s
   * @return {string}
   */
  function _expandUnicodeEscapes(s) {
    return s.replace(/\\([0-9a-f]{1,6})\s/gi, function () {
      var code = arguments[1],
          repeat = 6 - code.length;
      while (repeat--) {
        code = '0' + code;
      }
      return '\\' + code;
    });
  }

  /**
   * stringify parsed css.
   * @param {StyleNode} node
   * @param {boolean=} preserveProperties
   * @param {string=} text
   * @return {string}
   */
  function stringify(node, preserveProperties) {
    var text = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    // calc rule cssText
    var cssText = '';
    if (node['cssText'] || node['rules']) {
      var r$ = node['rules'];
      if (r$ && !_hasMixinRules(r$)) {
        for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
          cssText = stringify(r, preserveProperties, cssText);
        }
      } else {
        cssText = preserveProperties ? node['cssText'] : removeCustomProps(node['cssText']);
        cssText = cssText.trim();
        if (cssText) {
          cssText = '  ' + cssText + '\n';
        }
      }
    }
    // emit rule if there is cssText
    if (cssText) {
      if (node['selector']) {
        text += node['selector'] + ' ' + OPEN_BRACE + '\n';
      }
      text += cssText;
      if (node['selector']) {
        text += CLOSE_BRACE + '\n\n';
      }
    }
    return text;
  }

  /**
   * @param {Array<StyleNode>} rules
   * @return {boolean}
   */
  function _hasMixinRules(rules) {
    var r = rules[0];
    return Boolean(r) && Boolean(r['selector']) && r['selector'].indexOf(VAR_START) === 0;
  }

  /**
   * @param {string} cssText
   * @return {string}
   */
  function removeCustomProps(cssText) {
    cssText = removeCustomPropAssignment(cssText);
    return removeCustomPropApply(cssText);
  }

  /**
   * @param {string} cssText
   * @return {string}
   */
  function removeCustomPropAssignment(cssText) {
    return cssText.replace(RX.customProp, '').replace(RX.mixinProp, '');
  }

  /**
   * @param {string} cssText
   * @return {string}
   */
  function removeCustomPropApply(cssText) {
    return cssText.replace(RX.mixinApply, '').replace(RX.varApply, '');
  }

  /** @enum {number} */
  var types = {
    STYLE_RULE: 1,
    KEYFRAMES_RULE: 7,
    MEDIA_RULE: 4,
    MIXIN_RULE: 1000
  };

  var OPEN_BRACE = '{';
  var CLOSE_BRACE = '}';

  // helper regexp's
  var RX = {
    comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
    port: /@import[^;]*;/gim,
    customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
    mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
    mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
    varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
    keyframesRule: /^@[^\s]*keyframes/,
    multipleSpaces: /\s+/g
  };

  var VAR_START = '--';
  var MEDIA_START = '@media';
  var AT_START = '@';

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var VAR_ASSIGN = /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gi;
  var MIXIN_MATCH = /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi;
  var MEDIA_MATCH = /@media\s(.*)/;

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /** @type {!Set<string>} */

  var styleTextSet = new Set();

  var scopingAttribute = 'shady-unscoped';

  /**
   * Add a specifically-marked style to the document directly, and only one copy of that style.
   *
   * @param {!HTMLStyleElement} style
   * @return {undefined}
   */
  function processUnscopedStyle(style) {
    var text = style.textContent;
    if (!styleTextSet.has(text)) {
      styleTextSet.add(text);
      var newStyle = style.cloneNode(true);
      document.head.appendChild(newStyle);
    }
  }

  /**
   * Check if a style is supposed to be unscoped
   * @param {!HTMLStyleElement} style
   * @return {boolean} true if the style has the unscoping attribute
   */
  function isUnscopedStyle(style) {
    return style.hasAttribute(scopingAttribute);
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * @param {string|StyleNode} rules
   * @param {function(StyleNode)=} callback
   * @return {string}
   */
  function toCssText(rules, callback) {
    if (!rules) {
      return '';
    }
    if (typeof rules === 'string') {
      rules = parse(rules);
    }
    if (callback) {
      forEachRule(rules, callback);
    }
    return stringify(rules, nativeCssVariables);
  }

  /**
   * @param {HTMLStyleElement} style
   * @return {StyleNode}
   */
  function rulesForStyle(style) {
    if (!style['__cssRules'] && style.textContent) {
      style['__cssRules'] = parse(style.textContent);
    }
    return style['__cssRules'] || null;
  }

  /**
   * @param {StyleNode} node
   * @param {Function=} styleRuleCallback
   * @param {Function=} keyframesRuleCallback
   * @param {boolean=} onlyActiveRules
   */
  function forEachRule(node, styleRuleCallback, keyframesRuleCallback, onlyActiveRules) {
    if (!node) {
      return;
    }
    var skipRules = false;
    var type = node['type'];
    if (onlyActiveRules) {
      if (type === types.MEDIA_RULE) {
        var matchMedia = node['selector'].match(MEDIA_MATCH);
        if (matchMedia) {
          // if rule is a non matching @media rule, skip subrules
          if (!window.matchMedia(matchMedia[1]).matches) {
            skipRules = true;
          }
        }
      }
    }
    if (type === types.STYLE_RULE) {
      styleRuleCallback(node);
    } else if (keyframesRuleCallback && type === types.KEYFRAMES_RULE) {
      keyframesRuleCallback(node);
    } else if (type === types.MIXIN_RULE) {
      skipRules = true;
    }
    var r$ = node['rules'];
    if (r$ && !skipRules) {
      for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
        forEachRule(r, styleRuleCallback, keyframesRuleCallback, onlyActiveRules);
      }
    }
  }

  /**
   * Walk from text[start] matching parens and
   * returns position of the outer end paren
   * @param {string} text
   * @param {number} start
   * @return {number}
   */
  function findMatchingParen(text, start) {
    var level = 0;
    for (var i = start, l = text.length; i < l; i++) {
      if (text[i] === '(') {
        level++;
      } else if (text[i] === ')') {
        if (--level === 0) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * @param {string} str
   * @param {function(string, string, string, string)} callback
   */
  function processVariableAndFallback(str, callback) {
    // find 'var('
    var start = str.indexOf('var(');
    if (start === -1) {
      // no var?, everything is prefix
      return callback(str, '', '', '');
    }
    //${prefix}var(${inner})${suffix}
    var end = findMatchingParen(str, start + 3);
    var inner = str.substring(start + 4, end);
    var prefix = str.substring(0, start);
    // suffix may have other variables
    var suffix = processVariableAndFallback(str.substring(end + 1), callback);
    var comma = inner.indexOf(',');
    // value and fallback args should be trimmed to match in property lookup
    if (comma === -1) {
      // variable, no fallback
      return callback(prefix, inner.trim(), '', suffix);
    }
    // var(${value},${fallback})
    var value = inner.substring(0, comma).trim();
    var fallback = inner.substring(comma + 1).trim();
    return callback(prefix, value, fallback, suffix);
  }

  /**
   * @param {Element | {is: string, extends: string}} element
   * @return {{is: string, typeExtension: string}}
   */
  function getIsExtends(element) {
    var localName = element['localName'];
    var is = '',
        typeExtension = '';
    /*
    NOTE: technically, this can be wrong for certain svg elements
    with `-` in the name like `<font-face>`
    */
    if (localName) {
      if (localName.indexOf('-') > -1) {
        is = localName;
      } else {
        typeExtension = localName;
        is = element.getAttribute && element.getAttribute('is') || '';
      }
    } else {
      is = /** @type {?} */element.is;
      typeExtension = /** @type {?} */element.extends;
    }
    return { is: is, typeExtension: typeExtension };
  }

  /**
   * @param {Element|DocumentFragment} element
   * @return {string}
   */
  function gatherStyleText(element) {
    /** @type {!Array<string>} */
    var styleTextParts = [];
    var styles = /** @type {!NodeList<!HTMLStyleElement>} */element.querySelectorAll('style');
    for (var i = 0; i < styles.length; i++) {
      var style = styles[i];
      if (isUnscopedStyle(style)) {
        if (!nativeShadow) {
          processUnscopedStyle(style);
          style.parentNode.removeChild(style);
        }
      } else {
        styleTextParts.push(style.textContent);
        style.parentNode.removeChild(style);
      }
    }
    return styleTextParts.join('').trim();
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * @param {Element} element
   * @param {Object=} properties
   */
  function updateNativeProperties(element, properties) {
    // remove previous properties
    for (var p in properties) {
      // NOTE: for bc with shim, don't apply null values.
      if (p === null) {
        element.style.removeProperty(p);
      } else {
        element.style.setProperty(p, properties[p]);
      }
    }
  }

  /**
   * @param {Element} element
   * @param {string} property
   * @return {string}
   */
  function getComputedStyleValue(element, property) {
    /**
     * @const {string}
     */
    var value = window.getComputedStyle(element).getPropertyValue(property);
    if (!value) {
      return '';
    } else {
      return value.trim();
    }
  }

  /**
   * return true if `cssText` contains a mixin definition or consumption
   * @param {string} cssText
   * @return {boolean}
   */
  function detectMixin(cssText) {
    var has = MIXIN_MATCH.test(cssText) || VAR_ASSIGN.test(cssText);
    // reset state of the regexes
    MIXIN_MATCH.lastIndex = 0;
    VAR_ASSIGN.lastIndex = 0;
    return has;
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var APPLY_NAME_CLEAN = /;\s*/m;
  var INITIAL_INHERIT = /^\s*(initial)|(inherit)\s*$/;
  var IMPORTANT = /\s*!important/;

  // separator used between mixin-name and mixin-property-name when producing properties
  // NOTE: plain '-' may cause collisions in user styles
  var MIXIN_VAR_SEP = '_-_';

  // map of mixin to property names
  // --foo: {border: 2px} -> {properties: {(--foo, ['border'])}, dependants: {'element-name': proto}}

  var MixinMap = function () {
    function MixinMap() {
      classCallCheck(this, MixinMap);

      /** @type {!Object<string, !MixinMapEntry>} */
      this._map = {};
    }
    /**
     * @param {string} name
     * @param {!PropertyEntry} props
     */


    createClass(MixinMap, [{
      key: 'set',
      value: function set$$1(name, props) {
        name = name.trim();
        this._map[name] = {
          properties: props,
          dependants: {}
        };
      }
      /**
       * @param {string} name
       * @return {MixinMapEntry}
       */

    }, {
      key: 'get',
      value: function get$$1(name) {
        name = name.trim();
        return this._map[name] || null;
      }
    }]);
    return MixinMap;
  }();

  /**
   * Callback for when an element is marked invalid
   * @type {?function(string)}
   */


  var invalidCallback = null;

  /** @unrestricted */

  var ApplyShim = function () {
    function ApplyShim() {
      classCallCheck(this, ApplyShim);

      /** @type {?string} */
      this._currentElement = null;
      /** @type {HTMLMetaElement} */
      this._measureElement = null;
      this._map = new MixinMap();
    }
    /**
     * return true if `cssText` contains a mixin definition or consumption
     * @param {string} cssText
     * @return {boolean}
     */


    createClass(ApplyShim, [{
      key: 'detectMixin',
      value: function detectMixin$$1(cssText) {
        return detectMixin(cssText);
      }

      /**
       * Gather styles into one style for easier processing
       * @param {!HTMLTemplateElement} template
       * @return {HTMLStyleElement}
       */

    }, {
      key: 'gatherStyles',
      value: function gatherStyles(template) {
        var styleText = gatherStyleText(template.content);
        if (styleText) {
          var style = /** @type {!HTMLStyleElement} */document.createElement('style');
          style.textContent = styleText;
          template.content.insertBefore(style, template.content.firstChild);
          return style;
        }
        return null;
      }
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       * @return {StyleNode}
       */

    }, {
      key: 'transformTemplate',
      value: function transformTemplate(template, elementName) {
        if (template._gatheredStyle === undefined) {
          template._gatheredStyle = this.gatherStyles(template);
        }
        /** @type {HTMLStyleElement} */
        var style = template._gatheredStyle;
        return style ? this.transformStyle(style, elementName) : null;
      }
      /**
       * @param {!HTMLStyleElement} style
       * @param {string} elementName
       * @return {StyleNode}
       */

    }, {
      key: 'transformStyle',
      value: function transformStyle(style) {
        var elementName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        var ast = rulesForStyle(style);
        this.transformRules(ast, elementName);
        style.textContent = toCssText(ast);
        return ast;
      }
      /**
       * @param {!HTMLStyleElement} style
       * @return {StyleNode}
       */

    }, {
      key: 'transformCustomStyle',
      value: function transformCustomStyle(style) {
        var _this = this;

        var ast = rulesForStyle(style);
        forEachRule(ast, function (rule) {
          if (rule['selector'] === ':root') {
            rule['selector'] = 'html';
          }
          _this.transformRule(rule);
        });
        style.textContent = toCssText(ast);
        return ast;
      }
      /**
       * @param {StyleNode} rules
       * @param {string} elementName
       */

    }, {
      key: 'transformRules',
      value: function transformRules(rules, elementName) {
        var _this2 = this;

        this._currentElement = elementName;
        forEachRule(rules, function (r) {
          _this2.transformRule(r);
        });
        this._currentElement = null;
      }
      /**
       * @param {!StyleNode} rule
       */

    }, {
      key: 'transformRule',
      value: function transformRule(rule) {
        rule['cssText'] = this.transformCssText(rule['parsedCssText']);
        // :root was only used for variable assignment in property shim,
        // but generates invalid selectors with real properties.
        // replace with `:host > *`, which serves the same effect
        if (rule['selector'] === ':root') {
          rule['selector'] = ':host > *';
        }
      }
      /**
       * @param {string} cssText
       * @return {string}
       */

    }, {
      key: 'transformCssText',
      value: function transformCssText(cssText) {
        var _this3 = this;

        // produce variables
        cssText = cssText.replace(VAR_ASSIGN, function (matchText, propertyName, valueProperty, valueMixin) {
          return _this3._produceCssProperties(matchText, propertyName, valueProperty, valueMixin);
        });
        // consume mixins
        return this._consumeCssProperties(cssText);
      }
      /**
       * @param {string} property
       * @return {string}
       */

    }, {
      key: '_getInitialValueForProperty',
      value: function _getInitialValueForProperty(property) {
        if (!this._measureElement) {
          this._measureElement = /** @type {HTMLMetaElement} */document.createElement('meta');
          this._measureElement.setAttribute('apply-shim-measure', '');
          this._measureElement.style.all = 'initial';
          document.head.appendChild(this._measureElement);
        }
        return window.getComputedStyle(this._measureElement).getPropertyValue(property);
      }
      /**
       * replace mixin consumption with variable consumption
       * @param {string} text
       * @return {string}
       */

    }, {
      key: '_consumeCssProperties',
      value: function _consumeCssProperties(text) {
        /** @type {Array} */
        var m = null;
        // loop over text until all mixins with defintions have been applied
        while (m = MIXIN_MATCH.exec(text)) {
          var matchText = m[0];
          var mixinName = m[1];
          var idx = m.index;
          // collect properties before apply to be "defaults" if mixin might override them
          // match includes a "prefix", so find the start and end positions of @apply
          var applyPos = idx + matchText.indexOf('@apply');
          var afterApplyPos = idx + matchText.length;
          // find props defined before this @apply
          var textBeforeApply = text.slice(0, applyPos);
          var textAfterApply = text.slice(afterApplyPos);
          var defaults$$1 = this._cssTextToMap(textBeforeApply);
          var replacement = this._atApplyToCssProperties(mixinName, defaults$$1);
          // use regex match position to replace mixin, keep linear processing time
          text = '' + textBeforeApply + replacement + textAfterApply;
          // move regex search to _after_ replacement
          MIXIN_MATCH.lastIndex = idx + replacement.length;
        }
        return text;
      }
      /**
       * produce variable consumption at the site of mixin consumption
       * `@apply` --foo; -> for all props (${propname}: var(--foo_-_${propname}, ${fallback[propname]}}))
       * Example:
       *  border: var(--foo_-_border); padding: var(--foo_-_padding, 2px)
       *
       * @param {string} mixinName
       * @param {Object} fallbacks
       * @return {string}
       */

    }, {
      key: '_atApplyToCssProperties',
      value: function _atApplyToCssProperties(mixinName, fallbacks) {
        mixinName = mixinName.replace(APPLY_NAME_CLEAN, '');
        var vars = [];
        var mixinEntry = this._map.get(mixinName);
        // if we depend on a mixin before it is created
        // make a sentinel entry in the map to add this element as a dependency for when it is defined.
        if (!mixinEntry) {
          this._map.set(mixinName, {});
          mixinEntry = this._map.get(mixinName);
        }
        if (mixinEntry) {
          if (this._currentElement) {
            mixinEntry.dependants[this._currentElement] = true;
          }
          var p = void 0,
              parts = void 0,
              f = void 0;
          var properties = mixinEntry.properties;
          for (p in properties) {
            f = fallbacks && fallbacks[p];
            parts = [p, ': var(', mixinName, MIXIN_VAR_SEP, p];
            if (f) {
              parts.push(',', f.replace(IMPORTANT, ''));
            }
            parts.push(')');
            if (IMPORTANT.test(properties[p])) {
              parts.push(' !important');
            }
            vars.push(parts.join(''));
          }
        }
        return vars.join('; ');
      }

      /**
       * @param {string} property
       * @param {string} value
       * @return {string}
       */

    }, {
      key: '_replaceInitialOrInherit',
      value: function _replaceInitialOrInherit(property, value) {
        var match = INITIAL_INHERIT.exec(value);
        if (match) {
          if (match[1]) {
            // initial
            // replace `initial` with the concrete initial value for this property
            value = this._getInitialValueForProperty(property);
          } else {
            // inherit
            // with this purposfully illegal value, the variable will be invalid at
            // compute time (https://www.w3.org/TR/css-variables/#invalid-at-computed-value-time)
            // and for inheriting values, will behave similarly
            // we cannot support the same behavior for non inheriting values like 'border'
            value = 'apply-shim-inherit';
          }
        }
        return value;
      }

      /**
       * "parse" a mixin definition into a map of properties and values
       * cssTextToMap('border: 2px solid black') -> ('border', '2px solid black')
       * @param {string} text
       * @return {!Object<string, string>}
       */

    }, {
      key: '_cssTextToMap',
      value: function _cssTextToMap(text) {
        var props = text.split(';');
        var property = void 0,
            value = void 0;
        var out = {};
        for (var i = 0, p, sp; i < props.length; i++) {
          p = props[i];
          if (p) {
            sp = p.split(':');
            // ignore lines that aren't definitions like @media
            if (sp.length > 1) {
              property = sp[0].trim();
              // some properties may have ':' in the value, like data urls
              value = this._replaceInitialOrInherit(property, sp.slice(1).join(':'));
              out[property] = value;
            }
          }
        }
        return out;
      }

      /**
       * @param {MixinMapEntry} mixinEntry
       */

    }, {
      key: '_invalidateMixinEntry',
      value: function _invalidateMixinEntry(mixinEntry) {
        if (!invalidCallback) {
          return;
        }
        for (var elementName in mixinEntry.dependants) {
          if (elementName !== this._currentElement) {
            invalidCallback(elementName);
          }
        }
      }

      /**
       * @param {string} matchText
       * @param {string} propertyName
       * @param {?string} valueProperty
       * @param {?string} valueMixin
       * @return {string}
       */

    }, {
      key: '_produceCssProperties',
      value: function _produceCssProperties(matchText, propertyName, valueProperty, valueMixin) {
        var _this4 = this;

        // handle case where property value is a mixin
        if (valueProperty) {
          // form: --mixin2: var(--mixin1), where --mixin1 is in the map
          processVariableAndFallback(valueProperty, function (prefix, value) {
            if (value && _this4._map.get(value)) {
              valueMixin = '@apply ' + value + ';';
            }
          });
        }
        if (!valueMixin) {
          return matchText;
        }
        var mixinAsProperties = this._consumeCssProperties('' + valueMixin);
        var prefix = matchText.slice(0, matchText.indexOf('--'));
        var mixinValues = this._cssTextToMap(mixinAsProperties);
        var combinedProps = mixinValues;
        var mixinEntry = this._map.get(propertyName);
        var oldProps = mixinEntry && mixinEntry.properties;
        if (oldProps) {
          // NOTE: since we use mixin, the map of properties is updated here
          // and this is what we want.
          combinedProps = Object.assign(Object.create(oldProps), mixinValues);
        } else {
          this._map.set(propertyName, combinedProps);
        }
        var out = [];
        var p = void 0,
            v = void 0;
        // set variables defined by current mixin
        var needToInvalidate = false;
        for (p in combinedProps) {
          v = mixinValues[p];
          // if property not defined by current mixin, set initial
          if (v === undefined) {
            v = 'initial';
          }
          if (oldProps && !(p in oldProps)) {
            needToInvalidate = true;
          }
          out.push('' + propertyName + MIXIN_VAR_SEP + p + ': ' + v);
        }
        if (needToInvalidate) {
          this._invalidateMixinEntry(mixinEntry);
        }
        if (mixinEntry) {
          mixinEntry.properties = combinedProps;
        }
        // because the mixinMap is global, the mixin might conflict with
        // a different scope's simple variable definition:
        // Example:
        // some style somewhere:
        // --mixin1:{ ... }
        // --mixin2: var(--mixin1);
        // some other element:
        // --mixin1: 10px solid red;
        // --foo: var(--mixin1);
        // In this case, we leave the original variable definition in place.
        if (valueProperty) {
          prefix = matchText + ';' + prefix;
        }
        return '' + prefix + out.join('; ') + ';';
      }
    }]);
    return ApplyShim;
  }();

  /* exports */


  ApplyShim.prototype['detectMixin'] = ApplyShim.prototype.detectMixin;
  ApplyShim.prototype['transformStyle'] = ApplyShim.prototype.transformStyle;
  ApplyShim.prototype['transformCustomStyle'] = ApplyShim.prototype.transformCustomStyle;
  ApplyShim.prototype['transformRules'] = ApplyShim.prototype.transformRules;
  ApplyShim.prototype['transformRule'] = ApplyShim.prototype.transformRule;
  ApplyShim.prototype['transformTemplate'] = ApplyShim.prototype.transformTemplate;
  ApplyShim.prototype['_separator'] = MIXIN_VAR_SEP;
  Object.defineProperty(ApplyShim.prototype, 'invalidCallback', {
    /** @return {?function(string)} */
    get: function get$$1() {
      return invalidCallback;
    },

    /** @param {?function(string)} cb */
    set: function set$$1(cb) {
      invalidCallback = cb;
    }
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * @const {!Object<string, !HTMLTemplateElement>}
   */

  var templateMap = {};

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /*
   * Utilities for handling invalidating apply-shim mixins for a given template.
   *
   * The invalidation strategy involves keeping track of the "current" version of a template's mixins, and updating that count when a mixin is invalidated.
   * The template
   */

  /** @const {string} */
  var CURRENT_VERSION = '_applyShimCurrentVersion';

  /** @const {string} */
  var NEXT_VERSION = '_applyShimNextVersion';

  /** @const {string} */
  var VALIDATING_VERSION = '_applyShimValidatingVersion';

  /**
   * @const {Promise<void>}
   */
  var promise = Promise.resolve();

  /**
   * @param {string} elementName
   */
  function invalidate(elementName) {
    var template = templateMap[elementName];
    if (template) {
      invalidateTemplate(template);
    }
  }

  /**
   * This function can be called multiple times to mark a template invalid
   * and signal that the style inside must be regenerated.
   *
   * Use `startValidatingTemplate` to begin an asynchronous validation cycle.
   * During that cycle, call `templateIsValidating` to see if the template must
   * be revalidated
   * @param {HTMLTemplateElement} template
   */
  function invalidateTemplate(template) {
    // default the current version to 0
    template[CURRENT_VERSION] = template[CURRENT_VERSION] || 0;
    // ensure the "validating for" flag exists
    template[VALIDATING_VERSION] = template[VALIDATING_VERSION] || 0;
    // increment the next version
    template[NEXT_VERSION] = (template[NEXT_VERSION] || 0) + 1;
  }

  /**
   * @param {HTMLTemplateElement} template
   * @return {boolean}
   */
  function templateIsValid(template) {
    return template[CURRENT_VERSION] === template[NEXT_VERSION];
  }

  /**
   * Returns true if the template is currently invalid and `startValidating` has been called since the last invalidation.
   * If false, the template must be validated.
   * @param {HTMLTemplateElement} template
   * @return {boolean}
   */
  function templateIsValidating(template) {
    return !templateIsValid(template) && template[VALIDATING_VERSION] === template[NEXT_VERSION];
  }

  /**
   * Begin an asynchronous invalidation cycle.
   * This should be called after every validation of a template
   *
   * After one microtask, the template will be marked as valid until the next call to `invalidateTemplate`
   * @param {HTMLTemplateElement} template
   */
  function startValidatingTemplate(template) {
    // remember that the current "next version" is the reason for this validation cycle
    template[VALIDATING_VERSION] = template[NEXT_VERSION];
    // however, there only needs to be one async task to clear the counters
    if (!template._validating) {
      template._validating = true;
      promise.then(function () {
        // sync the current version to let future invalidations cause a refresh cycle
        template[CURRENT_VERSION] = template[NEXT_VERSION];
        template._validating = false;
      });
    }
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /** @type {Promise<void>} */

  var readyPromise = null;

  /** @type {?function(?function())} */
  var whenReady = window['HTMLImports'] && window['HTMLImports']['whenReady'] || null;

  /** @type {function()} */
  var resolveFn = void 0;

  /**
   * @param {?function()} callback
   */
  function documentWait(callback) {
    requestAnimationFrame(function () {
      if (whenReady) {
        whenReady(callback);
      } else {
        if (!readyPromise) {
          readyPromise = new Promise(function (resolve) {
            resolveFn = resolve;
          });
          if (document.readyState === 'complete') {
            resolveFn();
          } else {
            document.addEventListener('readystatechange', function () {
              if (document.readyState === 'complete') {
                resolveFn();
              }
            });
          }
        }
        readyPromise.then(function () {
          callback && callback();
        });
      }
    });
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var SEEN_MARKER = '__seenByShadyCSS';
  var CACHED_STYLE = '__shadyCSSCachedStyle';

  /** @type {?function(!HTMLStyleElement)} */
  var transformFn = null;

  /** @type {?function()} */
  var validateFn = null;

  /**
  This interface is provided to add document-level <style> elements to ShadyCSS for processing.
  These styles must be processed by ShadyCSS to simulate ShadowRoot upper-bound encapsulation from outside styles
  In addition, these styles may also need to be processed for @apply rules and CSS Custom Properties

  To add document-level styles to ShadyCSS, one can call `ShadyCSS.addDocumentStyle(styleElement)` or `ShadyCSS.addDocumentStyle({getStyle: () => styleElement})`

  In addition, if the process used to discover document-level styles can be synchronously flushed, one should set `ShadyCSS.documentStyleFlush`.
  This function will be called when calculating styles.

  An example usage of the document-level styling api can be found in `examples/document-style-lib.js`

  @unrestricted
  */

  var CustomStyleInterface = function () {
    function CustomStyleInterface() {
      classCallCheck(this, CustomStyleInterface);

      /** @type {!Array<!CustomStyleProvider>} */
      this['customStyles'] = [];
      this['enqueued'] = false;
      // NOTE(dfreedm): use quotes here to prevent closure inlining to `function(){}`;
      documentWait(function () {
        if (window['ShadyCSS']['flushCustomStyles']) {
          window['ShadyCSS']['flushCustomStyles']();
        }
      });
    }
    /**
     * Queue a validation for new custom styles to batch style recalculations
     */


    createClass(CustomStyleInterface, [{
      key: 'enqueueDocumentValidation',
      value: function enqueueDocumentValidation() {
        if (this['enqueued'] || !validateFn) {
          return;
        }
        this['enqueued'] = true;
        documentWait(validateFn);
      }
      /**
       * @param {!HTMLStyleElement} style
       */

    }, {
      key: 'addCustomStyle',
      value: function addCustomStyle(style) {
        if (!style[SEEN_MARKER]) {
          style[SEEN_MARKER] = true;
          this['customStyles'].push(style);
          this.enqueueDocumentValidation();
        }
      }
      /**
       * @param {!CustomStyleProvider} customStyle
       * @return {HTMLStyleElement}
       */

    }, {
      key: 'getStyleForCustomStyle',
      value: function getStyleForCustomStyle(customStyle) {
        if (customStyle[CACHED_STYLE]) {
          return customStyle[CACHED_STYLE];
        }
        var style = void 0;
        if (customStyle['getStyle']) {
          style = customStyle['getStyle']();
        } else {
          style = customStyle;
        }
        return style;
      }
      /**
       * @return {!Array<!CustomStyleProvider>}
       */

    }, {
      key: 'processStyles',
      value: function processStyles() {
        var cs = this['customStyles'];
        for (var i = 0; i < cs.length; i++) {
          var customStyle = cs[i];
          if (customStyle[CACHED_STYLE]) {
            continue;
          }
          var style = this.getStyleForCustomStyle(customStyle);
          if (style) {
            // HTMLImports polyfill may have cloned the style into the main document,
            // which is referenced with __appliedElement.
            var styleToTransform = /** @type {!HTMLStyleElement} */style['__appliedElement'] || style;
            if (transformFn) {
              transformFn(styleToTransform);
            }
            customStyle[CACHED_STYLE] = styleToTransform;
          }
        }
        return cs;
      }
    }]);
    return CustomStyleInterface;
  }();


  CustomStyleInterface.prototype['addCustomStyle'] = CustomStyleInterface.prototype.addCustomStyle;
  CustomStyleInterface.prototype['getStyleForCustomStyle'] = CustomStyleInterface.prototype.getStyleForCustomStyle;
  CustomStyleInterface.prototype['processStyles'] = CustomStyleInterface.prototype.processStyles;

  Object.defineProperties(CustomStyleInterface.prototype, {
    'transformCallback': {
      /** @return {?function(!HTMLStyleElement)} */
      get: function get$$1() {
        return transformFn;
      },

      /** @param {?function(!HTMLStyleElement)} fn */
      set: function set$$1(fn) {
        transformFn = fn;
      }
    },
    'validateCallback': {
      /** @return {?function()} */
      get: function get$$1() {
        return validateFn;
      },

      /**
       * @param {?function()} fn
       * @this {CustomStyleInterface}
       */
      set: function set$$1(fn) {
        var needsEnqueue = false;
        if (!validateFn) {
          needsEnqueue = true;
        }
        validateFn = fn;
        if (needsEnqueue) {
          this.enqueueDocumentValidation();
        }
      }
    }
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /** @const {ApplyShim} */
  var applyShim = new ApplyShim();

  var ApplyShimInterface = function () {
    function ApplyShimInterface() {
      classCallCheck(this, ApplyShimInterface);

      /** @type {?CustomStyleInterfaceInterface} */
      this.customStyleInterface = null;
      applyShim['invalidCallback'] = invalidate;
    }

    createClass(ApplyShimInterface, [{
      key: 'ensure',
      value: function ensure() {
        var _this = this;

        if (this.customStyleInterface) {
          return;
        }
        this.customStyleInterface = window.ShadyCSS.CustomStyleInterface;
        if (this.customStyleInterface) {
          this.customStyleInterface['transformCallback'] = function (style) {
            applyShim.transformCustomStyle(style);
          };
          this.customStyleInterface['validateCallback'] = function () {
            requestAnimationFrame(function () {
              if (_this.customStyleInterface['enqueued']) {
                _this.flushCustomStyles();
              }
            });
          };
        }
      }
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       */

    }, {
      key: 'prepareTemplate',
      value: function prepareTemplate(template, elementName) {
        this.ensure();
        templateMap[elementName] = template;
        var ast = applyShim.transformTemplate(template, elementName);
        // save original style ast to use for revalidating instances
        template['_styleAst'] = ast;
      }
    }, {
      key: 'flushCustomStyles',
      value: function flushCustomStyles() {
        this.ensure();
        if (!this.customStyleInterface) {
          return;
        }
        var styles = this.customStyleInterface['processStyles']();
        if (!this.customStyleInterface['enqueued']) {
          return;
        }
        for (var i = 0; i < styles.length; i++) {
          var cs = styles[i];
          var style = this.customStyleInterface['getStyleForCustomStyle'](cs);
          if (style) {
            applyShim.transformCustomStyle(style);
          }
        }
        this.customStyleInterface['enqueued'] = false;
      }
      /**
       * @param {HTMLElement} element
       * @param {Object=} properties
       */

    }, {
      key: 'styleSubtree',
      value: function styleSubtree(element, properties) {
        this.ensure();
        if (properties) {
          updateNativeProperties(element, properties);
        }
        if (element.shadowRoot) {
          this.styleElement(element);
          var shadowChildren = element.shadowRoot.children || element.shadowRoot.childNodes;
          for (var i = 0; i < shadowChildren.length; i++) {
            this.styleSubtree( /** @type {HTMLElement} */shadowChildren[i]);
          }
        } else {
          var children = element.children || element.childNodes;
          for (var _i = 0; _i < children.length; _i++) {
            this.styleSubtree( /** @type {HTMLElement} */children[_i]);
          }
        }
      }
      /**
       * @param {HTMLElement} element
       */

    }, {
      key: 'styleElement',
      value: function styleElement(element) {
        this.ensure();

        var _getIsExtends = getIsExtends(element),
            is = _getIsExtends.is;

        var template = templateMap[is];
        if (template && !templateIsValid(template)) {
          // only revalidate template once
          if (!templateIsValidating(template)) {
            this.prepareTemplate(template, is);
            startValidatingTemplate(template);
          }
          // update this element instance
          var root = element.shadowRoot;
          if (root) {
            var style = /** @type {HTMLStyleElement} */root.querySelector('style');
            if (style) {
              // reuse the template's style ast, it has all the original css text
              style['__cssRules'] = template['_styleAst'];
              style.textContent = toCssText(template['_styleAst']);
            }
          }
        }
      }
      /**
       * @param {Object=} properties
       */

    }, {
      key: 'styleDocument',
      value: function styleDocument(properties) {
        this.ensure();
        this.styleSubtree(document.body, properties);
      }
    }]);
    return ApplyShimInterface;
  }();

  if (!window.ShadyCSS || !window.ShadyCSS.ScopingShim) {
    var applyShimInterface = new ApplyShimInterface();
    var CustomStyleInterface$1 = window.ShadyCSS && window.ShadyCSS.CustomStyleInterface;

    /** @suppress {duplicate} */
    window.ShadyCSS = {
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       * @param {string=} elementExtends
       */
      prepareTemplate: function prepareTemplate(template, elementName, elementExtends) {
        // eslint-disable-line no-unused-vars
        applyShimInterface.flushCustomStyles();
        applyShimInterface.prepareTemplate(template, elementName);
      },


      /**
       * @param {!HTMLElement} element
       * @param {Object=} properties
       */
      styleSubtree: function styleSubtree(element, properties) {
        applyShimInterface.flushCustomStyles();
        applyShimInterface.styleSubtree(element, properties);
      },


      /**
       * @param {!HTMLElement} element
       */
      styleElement: function styleElement(element) {
        applyShimInterface.flushCustomStyles();
        applyShimInterface.styleElement(element);
      },


      /**
       * @param {Object=} properties
       */
      styleDocument: function styleDocument(properties) {
        applyShimInterface.flushCustomStyles();
        applyShimInterface.styleDocument(properties);
      },


      /**
       * @param {Element} element
       * @param {string} property
       * @return {string}
       */
      getComputedStyleValue: function getComputedStyleValue$$1(element, property) {
        return getComputedStyleValue(element, property);
      },
      flushCustomStyles: function flushCustomStyles() {
        applyShimInterface.flushCustomStyles();
      },


      nativeCss: nativeCssVariables,
      nativeShadow: nativeShadow
    };

    if (CustomStyleInterface$1) {
      window.ShadyCSS.CustomStyleInterface = CustomStyleInterface$1;
    }
  }

  window.ShadyCSS.ApplyShim = applyShim;

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  window.JSCompiler_renameProperty = function (prop) {
    return prop;
  };

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var CSS_URL_RX = /(url\()([^)]*)(\))/g;
  var ABS_URL = /(^\/)|(^#)|(^[\w-\d]*:)/;
  var workingURL = void 0;
  var resolveDoc = void 0;
  /**
   * Resolves the given URL against the provided `baseUri'.
   *
   * Note that this function performs no resolution for URLs that start
   * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
   * URL resolution, use `window.URL`.
   *
   * @param {string} url Input URL to resolve
   * @param {?string=} baseURI Base URI to resolve the URL against
   * @return {string} resolved URL
   */
  function resolveUrl(url, baseURI) {
    if (url && ABS_URL.test(url)) {
      return url;
    }
    // Lazy feature detection.
    if (workingURL === undefined) {
      workingURL = false;
      try {
        var u = new URL('b', 'http://a');
        u.pathname = 'c%20d';
        workingURL = u.href === 'http://a/c%20d';
      } catch (e) {
        // silently fail
      }
    }
    if (!baseURI) {
      baseURI = document.baseURI || window.location.href;
    }
    if (workingURL) {
      return new URL(url, baseURI).href;
    }
    // Fallback to creating an anchor into a disconnected document.
    if (!resolveDoc) {
      resolveDoc = document.implementation.createHTMLDocument('temp');
      resolveDoc.base = resolveDoc.createElement('base');
      resolveDoc.head.appendChild(resolveDoc.base);
      resolveDoc.anchor = resolveDoc.createElement('a');
      resolveDoc.body.appendChild(resolveDoc.anchor);
    }
    resolveDoc.base.href = baseURI;
    resolveDoc.anchor.href = url;
    return resolveDoc.anchor.href || url;
  }

  /**
   * Resolves any relative URL's in the given CSS text against the provided
   * `ownerDocument`'s `baseURI`.
   *
   * @param {string} cssText CSS text to process
   * @param {string} baseURI Base URI to resolve the URL against
   * @return {string} Processed CSS text with resolved URL's
   */
  function resolveCss(cssText, baseURI) {
    return cssText.replace(CSS_URL_RX, function (m, pre, url, post) {
      return pre + '\'' + resolveUrl(url.replace(/["']/g, ''), baseURI) + '\'' + post;
    });
  }

  /**
   * Returns a path from a given `url`. The path includes the trailing
   * `/` from the url.
   *
   * @param {string} url Input URL to transform
   * @return {string} resolved path
   */
  function pathFromUrl(url) {
    return url.substring(0, url.lastIndexOf('/') + 1);
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */
  var useShadow = !window.ShadyDOM;
  var useNativeCSSProperties = Boolean(!window.ShadyCSS || window.ShadyCSS.nativeCss);
  var useNativeCustomElements = !window.customElements.polyfillWrapFlushCallback;

  /**
   * Globally settable property that is automatically assigned to
   * `ElementMixin` instances, useful for binding in templates to
   * make URL's relative to an application's root.  Defaults to the main
   * document URL, but can be overridden by users.  It may be useful to set
   * `rootPath` to provide a stable application mount path when
   * using client side routing.
   */
  var rootPath = undefined || pathFromUrl(document.baseURI || window.location.href);

  /**
   * A global callback used to sanitize any value before inserting it into the DOM. The callback signature is:
   *
   *     Polymer = {
   *       sanitizeDOMValue: function(value, name, type, node) { ... }
   *     }
   *
   * Where:
   *
   * `value` is the value to sanitize.
   * `name` is the name of an attribute or property (for example, href).
   * `type` indicates where the value is being inserted: one of property, attribute, or text.
   * `node` is the node where the value is being inserted.
   *
   * @type {(function(*,string,string,Node):*)|undefined}
   */
  var sanitizeDOMValue = undefined;

  /**
   * Globally settable property to make Polymer Gestures use passive TouchEvent listeners when recognizing gestures.
   * When set to `true`, gestures made from touch will not be able to prevent scrolling, allowing for smoother
   * scrolling performance.
   * Defaults to `false` for backwards compatibility.
   */
  var passiveTouchGestures = false;

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  // unique global id for deduping mixins.
  var dedupeId = 0;

  /* eslint-disable valid-jsdoc */
  /**
   * Wraps an ES6 class expression mixin such that the mixin is only applied
   * if it has not already been applied its base argument. Also memoizes mixin
   * applications.
   *
   * @template T
   * @param {T} mixin ES6 class expression mixin to wrap
   * @return {T}
   * @suppress {invalidCasts}
   */
  var dedupingMixin = function dedupingMixin(mixin) {
    var mixinApplications = /** @type {!MixinFunction} */mixin.__mixinApplications;
    if (!mixinApplications) {
      mixinApplications = new WeakMap();
      /** @type {!MixinFunction} */mixin.__mixinApplications = mixinApplications;
    }
    // maintain a unique id for each mixin
    var mixinDedupeId = dedupeId++;
    function dedupingMixin(base) {
      var baseSet = /** @type {!MixinFunction} */base.__mixinSet;
      if (baseSet && baseSet[mixinDedupeId]) {
        return base;
      }
      var map = mixinApplications;
      var extended = map.get(base);
      if (!extended) {
        extended = /** @type {!Function} */mixin(base);
        map.set(base, extended);
      }
      // copy inherited mixin set from the extended class, or the base class
      // NOTE: we avoid use of Set here because some browser (IE11)
      // cannot extend a base Set via the constructor.
      var mixinSet = Object.create( /** @type {!MixinFunction} */extended.__mixinSet || baseSet || null);
      mixinSet[mixinDedupeId] = true;
      /** @type {!MixinFunction} */extended.__mixinSet = mixinSet;
      return extended;
    }

    return (/** @type {T} */dedupingMixin
    );
  };
  /* eslint-enable valid-jsdoc */

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var MODULE_STYLE_LINK_SELECTOR = 'link[rel=import][type~=css]';
  var INCLUDE_ATTR = 'include';
  var SHADY_UNSCOPED_ATTR = 'shady-unscoped';

  function importModule(moduleId) {
    var /** DomModule */PolymerDomModule = customElements.get('dom-module');
    if (!PolymerDomModule) {
      return null;
    }
    return PolymerDomModule.import(moduleId);
  }

  function styleForImport(importDoc) {
    // NOTE: polyfill affordance.
    // under the HTMLImports polyfill, there will be no 'body',
    // but the import pseudo-doc can be used directly.
    var container = importDoc.body ? importDoc.body : importDoc;
    var importCss = resolveCss(container.textContent, importDoc.baseURI);
    var style = document.createElement('style');
    style.textContent = importCss;
    return style;
  }

  /**
   * Returns a list of <style> elements in a space-separated list of `dom-module`s.
   *
   * @function
   * @param {string} moduleIds List of dom-module id's within which to
   * search for css.
   * @return {!Array<!HTMLStyleElement>} Array of contained <style> elements
   * @this {StyleGather}
   */
  function stylesFromModules(moduleIds) {
    var modules = moduleIds.trim().split(/\s+/);
    var styles = [];
    for (var i = 0; i < modules.length; i++) {
      styles.push.apply(styles, toConsumableArray(stylesFromModule(modules[i])));
    }
    return styles;
  }

  /**
   * Returns a list of <style> elements in a given `dom-module`.
   * Styles in a `dom-module` can come either from `<style>`s within the
   * first `<template>`, or else from one or more
   * `<link rel="import" type="css">` links outside the template.
   *
   * @param {string} moduleId dom-module id to gather styles from
   * @return {!Array<!HTMLStyleElement>} Array of contained styles.
   * @this {StyleGather}
   */
  function stylesFromModule(moduleId) {
    var m = importModule(moduleId);

    if (!m) {
      console.warn('Could not find style data in module named', moduleId);
      return [];
    }

    if (m._styles === undefined) {
      var styles = [];
      // module imports: <link rel="import" type="css">
      styles.push.apply(styles, toConsumableArray(_stylesFromModuleImports(m)));
      // include css from the first template in the module
      var template = m.querySelector('template');
      if (template) {
        styles.push.apply(styles, toConsumableArray(stylesFromTemplate(template,
        /** @type {templateWithAssetPath} */m.assetpath)));
      }

      m._styles = styles;
    }

    return m._styles;
  }

  /**
   * Returns the `<style>` elements within a given template.
   *
   * @param {!HTMLTemplateElement} template Template to gather styles from
   * @param {string} baseURI baseURI for style content
   * @return {!Array<!HTMLStyleElement>} Array of styles
   * @this {StyleGather}
   */
  function stylesFromTemplate(template, baseURI) {
    if (!template._styles) {
      var styles = [];
      // if element is a template, get content from its .content
      var e$ = template.content.querySelectorAll('style');
      for (var i = 0; i < e$.length; i++) {
        var e = e$[i];
        // support style sharing by allowing styles to "include"
        // other dom-modules that contain styling
        var include = e.getAttribute(INCLUDE_ATTR);
        if (include) {
          styles.push.apply(styles, toConsumableArray(stylesFromModules(include).filter(function (item, index, self) {
            return self.indexOf(item) === index;
          })));
        }
        if (baseURI) {
          e.textContent = resolveCss(e.textContent, baseURI);
        }
        styles.push(e);
      }
      template._styles = styles;
    }
    return template._styles;
  }

  /**
   * Returns a list of <style> elements  from stylesheets loaded via `<link rel="import" type="css">` links within the specified `dom-module`.
   *
   * @param {string} moduleId Id of `dom-module` to gather CSS from
   * @return {!Array<!HTMLStyleElement>} Array of contained styles.
   * @this {StyleGather}
   */
  function stylesFromModuleImports(moduleId) {
    var m = importModule(moduleId);
    return m ? _stylesFromModuleImports(m) : [];
  }

  /**
   * @this {StyleGather}
   * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
   * @return {!Array<!HTMLStyleElement>} Array of contained styles
   */
  function _stylesFromModuleImports(module) {
    var styles = [];
    var p$ = module.querySelectorAll(MODULE_STYLE_LINK_SELECTOR);
    for (var i = 0; i < p$.length; i++) {
      var p = p$[i];
      if (p.import) {
        var importDoc = p.import;
        var unscoped = p.hasAttribute(SHADY_UNSCOPED_ATTR);
        if (unscoped && !importDoc._unscopedStyle) {
          var style = styleForImport(importDoc);
          style.setAttribute(SHADY_UNSCOPED_ATTR, '');
          importDoc._unscopedStyle = style;
        } else if (!importDoc._style) {
          importDoc._style = styleForImport(importDoc);
        }
        styles.push(unscoped ? importDoc._unscopedStyle : importDoc._style);
      }
    }
    return styles;
  }

  /**
   *
   * Returns CSS text of styles in a space-separated list of `dom-module`s.
   * Note: This method is deprecated, use `stylesFromModules` instead.
   *
   * @deprecated
   * @param {string} moduleIds List of dom-module id's within which to
   * search for css.
   * @return {string} Concatenated CSS content from specified `dom-module`s
   * @this {StyleGather}
   */
  function cssFromModules(moduleIds) {
    var modules = moduleIds.trim().split(/\s+/);
    var cssText = '';
    for (var i = 0; i < modules.length; i++) {
      cssText += cssFromModule(modules[i]);
    }
    return cssText;
  }

  /**
   * Returns CSS text of styles in a given `dom-module`.  CSS in a `dom-module`
   * can come either from `<style>`s within the first `<template>`, or else
   * from one or more `<link rel="import" type="css">` links outside the
   * template.
   *
   * Any `<styles>` processed are removed from their original location.
   * Note: This method is deprecated, use `styleFromModule` instead.
   *
   * @deprecated
   * @param {string} moduleId dom-module id to gather styles from
   * @return {string} Concatenated CSS content from specified `dom-module`
   * @this {StyleGather}
   */
  function cssFromModule(moduleId) {
    var m = importModule(moduleId);
    if (m && m._cssText === undefined) {
      // module imports: <link rel="import" type="css">
      var cssText = _cssFromModuleImports(m);
      // include css from the first template in the module
      var t = m.querySelector('template');
      if (t) {
        cssText += cssFromTemplate(t,
        /** @type {templateWithAssetPath} */m.assetpath);
      }
      m._cssText = cssText || null;
    }
    if (!m) {
      console.warn('Could not find style data in module named', moduleId);
    }
    return m && m._cssText || '';
  }

  /**
   * Returns CSS text of `<styles>` within a given template.
   *
   * Any `<styles>` processed are removed from their original location.
   * Note: This method is deprecated, use `styleFromTemplate` instead.
   *
   * @deprecated
   * @param {!HTMLTemplateElement} template Template to gather styles from
   * @param {string} baseURI Base URI to resolve the URL against
   * @return {string} Concatenated CSS content from specified template
   * @this {StyleGather}
   */
  function cssFromTemplate(template, baseURI) {
    var cssText = '';
    var e$ = stylesFromTemplate(template, baseURI);
    // if element is a template, get content from its .content
    for (var i = 0; i < e$.length; i++) {
      var e = e$[i];
      if (e.parentNode) {
        e.parentNode.removeChild(e);
      }
      cssText += e.textContent;
    }
    return cssText;
  }

  /**
   * @deprecated
   * @this {StyleGather}
   * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
   * @return {string} Concatenated CSS content from links in the dom-module
   */
  function _cssFromModuleImports(module) {
    var cssText = '';
    var styles = _stylesFromModuleImports(module);
    for (var i = 0; i < styles.length; i++) {
      cssText += styles[i].textContent;
    }
    return cssText;
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var modules = {};
  var lcModules = {};
  function findModule(id) {
    return modules[id] || lcModules[id.toLowerCase()];
  }

  function styleOutsideTemplateCheck(inst) {
    if (inst.querySelector('style')) {
      console.warn('dom-module %s has style outside template', inst.id);
    }
  }

  /**
   * The `dom-module` element registers the dom it contains to the name given
   * by the module's id attribute. It provides a unified database of dom
   * accessible via its static `import` API.
   *
   * A key use case of `dom-module` is for providing custom element `<template>`s
   * via HTML imports that are parsed by the native HTML parser, that can be
   * relocated during a bundling pass and still looked up by `id`.
   *
   * Example:
   *
   *     <dom-module id="foo">
   *       <img src="stuff.png">
   *     </dom-module>
   *
   * Then in code in some other location that cannot access the dom-module above
   *
   *     let img = customElements.get('dom-module').import('foo', 'img');
   *
   * @customElement
   * @extends HTMLElement
   * @summary Custom element that provides a registry of relocatable DOM content
   *   by `id` that is agnostic to bundling.
   * @unrestricted
   */
  var DomModule = function (_HTMLElement) {
    inherits(DomModule, _HTMLElement);

    function DomModule() {
      classCallCheck(this, DomModule);
      return possibleConstructorReturn(this, (DomModule.__proto__ || Object.getPrototypeOf(DomModule)).apply(this, arguments));
    }

    createClass(DomModule, [{
      key: 'attributeChangedCallback',


      /* eslint-disable no-unused-vars */
      /**
       * @param {string} name Name of attribute.
       * @param {?string} old Old value of attribute.
       * @param {?string} value Current value of attribute.
       * @param {?string} namespace Attribute namespace.
       * @return {void}
       */
      value: function attributeChangedCallback(name, old, value, namespace) {
        if (old !== value) {
          this.register();
        }
      }
      /* eslint-enable no-unused-args */

      /**
       * The absolute URL of the original location of this `dom-module`.
       *
       * This value will differ from this element's `ownerDocument` in the
       * following ways:
       * - Takes into account any `assetpath` attribute added during bundling
       *   to indicate the original location relative to the bundled location
       * - Uses the HTMLImports polyfill's `importForElement` API to ensure
       *   the path is relative to the import document's location since
       *   `ownerDocument` is not currently polyfilled
       */

    }, {
      key: 'register',


      /**
       * Registers the dom-module at a given id. This method should only be called
       * when a dom-module is imperatively created. For
       * example, `document.createElement('dom-module').register('foo')`.
       * @param {string=} id The id at which to register the dom-module.
       * @return {void}
       */
      value: function register(id) {
        id = id || this.id;
        if (id) {
          this.id = id;
          // store id separate from lowercased id so that
          // in all cases mixedCase id will stored distinctly
          // and lowercase version is a fallback
          modules[id] = this;
          lcModules[id.toLowerCase()] = this;
          styleOutsideTemplateCheck(this);
        }
      }
    }, {
      key: 'assetpath',
      get: function get$$1() {
        // Don't override existing assetpath.
        if (!this.__assetpath) {
          // note: assetpath set via an attribute must be relative to this
          // element's location; accomodate polyfilled HTMLImports
          var owner = window.HTMLImports && HTMLImports.importForElement ? HTMLImports.importForElement(this) || document : this.ownerDocument;
          var url = resolveUrl(this.getAttribute('assetpath') || '', owner.baseURI);
          this.__assetpath = pathFromUrl(url);
        }
        return this.__assetpath;
      }
    }], [{
      key: 'import',


      /**
       * Retrieves the element specified by the css `selector` in the module
       * registered by `id`. For example, this.import('foo', 'img');
       * @param {string} id The id of the dom-module in which to search.
       * @param {string=} selector The css selector by which to find the element.
       * @return {Element} Returns the element which matches `selector` in the
       * module registered at the specified `id`.
       */
      value: function _import(id, selector) {
        if (id) {
          var m = findModule(id);
          if (m && selector) {
            return m.querySelector(selector);
          }
          return m;
        }
        return null;
      }
    }, {
      key: 'observedAttributes',
      get: function get$$1() {
        return ['id'];
      }
    }]);
    return DomModule;
  }(HTMLElement);

  DomModule.prototype['modules'] = modules;

  customElements.define('dom-module', DomModule);

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * Returns true if the given string is a structured data path (has dots).
   *
   * Example:
   *
   * ```
   * isPath('foo.bar.baz') // true
   * isPath('foo')         // false
   * ```
   *
   * @param {string} path Path string
   * @return {boolean} True if the string contained one or more dots
   */
  function isPath(path) {
    return path.indexOf('.') >= 0;
  }

  /**
   * Returns the root property name for the given path.
   *
   * Example:
   *
   * ```
   * root('foo.bar.baz') // 'foo'
   * root('foo')         // 'foo'
   * ```
   *
   * @param {string} path Path string
   * @return {string} Root property name
   */
  function root(path) {
    var dotIndex = path.indexOf('.');
    if (dotIndex === -1) {
      return path;
    }
    return path.slice(0, dotIndex);
  }

  /**
   * Given `base` is `foo.bar`, `foo` is an ancestor, `foo.bar` is not
   * Returns true if the given path is an ancestor of the base path.
   *
   * Example:
   *
   * ```
   * isAncestor('foo.bar', 'foo')         // true
   * isAncestor('foo.bar', 'foo.bar')     // false
   * isAncestor('foo.bar', 'foo.bar.baz') // false
   * ```
   *
   * @param {string} base Path string to test against.
   * @param {string} path Path string to test.
   * @return {boolean} True if `path` is an ancestor of `base`.
   */
  function isAncestor(base, path) {
    //     base.startsWith(path + '.');
    return base.indexOf(path + '.') === 0;
  }

  /**
   * Given `base` is `foo.bar`, `foo.bar.baz` is an descendant
   *
   * Example:
   *
   * ```
   * isDescendant('foo.bar', 'foo.bar.baz') // true
   * isDescendant('foo.bar', 'foo.bar')     // false
   * isDescendant('foo.bar', 'foo')         // false
   * ```
   *
   * @param {string} base Path string to test against.
   * @param {string} path Path string to test.
   * @return {boolean} True if `path` is a descendant of `base`.
   */
  function isDescendant(base, path) {
    //     path.startsWith(base + '.');
    return path.indexOf(base + '.') === 0;
  }

  /**
   * Replaces a previous base path with a new base path, preserving the
   * remainder of the path.
   *
   * User must ensure `path` has a prefix of `base`.
   *
   * Example:
   *
   * ```
   * translate('foo.bar', 'zot', 'foo.bar.baz') // 'zot.baz'
   * ```
   *
   * @param {string} base Current base string to remove
   * @param {string} newBase New base string to replace with
   * @param {string} path Path to translate
   * @return {string} Translated string
   */
  function translate(base, newBase, path) {
    return newBase + path.slice(base.length);
  }

  /**
   * @param {string} base Path string to test against
   * @param {string} path Path string to test
   * @return {boolean} True if `path` is equal to `base`
   * @this {Path}
   */
  function matches(base, path) {
    return base === path || isAncestor(base, path) || isDescendant(base, path);
  }

  /**
   * Converts array-based paths to flattened path.  String-based paths
   * are returned as-is.
   *
   * Example:
   *
   * ```
   * normalize(['foo.bar', 0, 'baz'])  // 'foo.bar.0.baz'
   * normalize('foo.bar.0.baz')        // 'foo.bar.0.baz'
   * ```
   *
   * @param {string | !Array<string|number>} path Input path
   * @return {string} Flattened path
   */
  function normalize(path) {
    if (Array.isArray(path)) {
      var parts = [];
      for (var i = 0; i < path.length; i++) {
        var args = path[i].toString().split('.');
        for (var j = 0; j < args.length; j++) {
          parts.push(args[j]);
        }
      }
      return parts.join('.');
    } else {
      return path;
    }
  }

  /**
   * Splits a path into an array of property names. Accepts either arrays
   * of path parts or strings.
   *
   * Example:
   *
   * ```
   * split(['foo.bar', 0, 'baz'])  // ['foo', 'bar', '0', 'baz']
   * split('foo.bar.0.baz')        // ['foo', 'bar', '0', 'baz']
   * ```
   *
   * @param {string | !Array<string|number>} path Input path
   * @return {!Array<string>} Array of path parts
   * @this {Path}
   * @suppress {checkTypes}
   */
  function split(path) {
    if (Array.isArray(path)) {
      return normalize(path).split('.');
    }
    return path.toString().split('.');
  }

  /**
   * Reads a value from a path.  If any sub-property in the path is `undefined`,
   * this method returns `undefined` (will never throw.
   *
   * @param {Object} root Object from which to dereference path from
   * @param {string | !Array<string|number>} path Path to read
   * @param {Object=} info If an object is provided to `info`, the normalized
   *  (flattened) path will be set to `info.path`.
   * @return {*} Value at path, or `undefined` if the path could not be
   *  fully dereferenced.
   * @this {Path}
   */
  function get$1(root, path, info) {
    var prop = root;
    var parts = split(path);
    // Loop over path parts[0..n-1] and dereference
    for (var i = 0; i < parts.length; i++) {
      if (!prop) {
        return;
      }
      var part = parts[i];
      prop = prop[part];
    }
    if (info) {
      info.path = parts.join('.');
    }
    return prop;
  }

  /**
   * Sets a value to a path.  If any sub-property in the path is `undefined`,
   * this method will no-op.
   *
   * @param {Object} root Object from which to dereference path from
   * @param {string | !Array<string|number>} path Path to set
   * @param {*} value Value to set to path
   * @return {string | undefined} The normalized version of the input path
   * @this {Path}
   */
  function set$1(root, path, value) {
    var prop = root;
    var parts = split(path);
    var last = parts[parts.length - 1];
    if (parts.length > 1) {
      // Loop over path parts[0..n-2] and dereference
      for (var i = 0; i < parts.length - 1; i++) {
        var part = parts[i];
        prop = prop[part];
        if (!prop) {
          return;
        }
      }
      // Set value to object at end of path
      prop[last] = value;
    } else {
      // Simple property set
      prop[path] = value;
    }
    return parts.join('.');
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var caseMap = {};
  var DASH_TO_CAMEL = /-[a-z]/g;
  var CAMEL_TO_DASH = /([A-Z])/g;

  /**
   * Converts "dash-case" identifier (e.g. `foo-bar-baz`) to "camelCase"
   * (e.g. `fooBarBaz`).
   *
   * @param {string} dash Dash-case identifier
   * @return {string} Camel-case representation of the identifier
   */
  function dashToCamelCase(dash) {
    return caseMap[dash] || (caseMap[dash] = dash.indexOf('-') < 0 ? dash : dash.replace(DASH_TO_CAMEL, function (m) {
      return m[1].toUpperCase();
    }));
  }

  /**
   * Converts "camelCase" identifier (e.g. `fooBarBaz`) to "dash-case"
   * (e.g. `foo-bar-baz`).
   *
   * @param {string} camel Camel-case identifier
   * @return {string} Dash-case representation of the identifier
   */
  function camelToDashCase(camel) {
    return caseMap[camel] || (caseMap[camel] = camel.replace(CAMEL_TO_DASH, '-$1').toLowerCase());
  }

  var caseMap$0 = /*#__PURE__*/Object.freeze({
    dashToCamelCase: dashToCamelCase,
    camelToDashCase: camelToDashCase
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  // Microtask implemented using Mutation Observer
  var microtaskCurrHandle = 0;
  var microtaskLastHandle = 0;
  var microtaskCallbacks = [];
  var microtaskNodeContent = 0;
  var microtaskNode = document.createTextNode('');
  new window.MutationObserver(microtaskFlush).observe(microtaskNode, { characterData: true });

  function microtaskFlush() {
    var len = microtaskCallbacks.length;
    for (var i = 0; i < len; i++) {
      var cb = microtaskCallbacks[i];
      if (cb) {
        try {
          cb();
        } catch (e) {
          setTimeout(function () {
            throw e;
          });
        }
      }
    }
    microtaskCallbacks.splice(0, len);
    microtaskLastHandle += len;
  }

  /**
   * Async interface wrapper around `setTimeout`.
   *
   * @namespace
   * @summary Async interface wrapper around `setTimeout`.
   */
  var timeOut = {
    /**
     * Returns a sub-module with the async interface providing the provided
     * delay.
     *
     * @memberof timeOut
     * @param {number=} delay Time to wait before calling callbacks in ms
     * @return {!AsyncInterface} An async timeout interface
     */
    after: function after(delay) {
      return {
        run: function run(fn) {
          return window.setTimeout(fn, delay);
        },
        cancel: function cancel(handle) {
          window.clearTimeout(handle);
        }
      };
    },

    /**
     * Enqueues a function called in the next task.
     *
     * @memberof timeOut
     * @param {!Function} fn Callback to run
     * @param {number=} delay Delay in milliseconds
     * @return {number} Handle used for canceling task
     */
    run: function run(fn, delay) {
      return window.setTimeout(fn, delay);
    },

    /**
     * Cancels a previously enqueued `timeOut` callback.
     *
     * @memberof timeOut
     * @param {number} handle Handle returned from `run` of callback to cancel
     * @return {void}
     */
    cancel: function cancel(handle) {
      window.clearTimeout(handle);
    }
  };

  /**
   * Async interface for enqueuing callbacks that run at microtask timing.
   *
   * Note that microtask timing is achieved via a single `MutationObserver`,
   * and thus callbacks enqueued with this API will all run in a single
   * batch, and not interleaved with other microtasks such as promises.
   * Promises are avoided as an implementation choice for the time being
   * due to Safari bugs that cause Promises to lack microtask guarantees.
   *
   * @namespace
   * @summary Async interface for enqueuing callbacks that run at microtask
   *   timing.
   */
  var microTask = {

    /**
     * Enqueues a function called at microtask timing.
     *
     * @memberof microTask
     * @param {!Function=} callback Callback to run
     * @return {number} Handle used for canceling task
     */
    run: function run(callback) {
      microtaskNode.textContent = microtaskNodeContent++;
      microtaskCallbacks.push(callback);
      return microtaskCurrHandle++;
    },


    /**
     * Cancels a previously enqueued `microTask` callback.
     *
     * @memberof microTask
     * @param {number} handle Handle returned from `run` of callback to cancel
     * @return {void}
     */
    cancel: function cancel(handle) {
      var idx = handle - microtaskLastHandle;
      if (idx >= 0) {
        if (!microtaskCallbacks[idx]) {
          throw new Error('invalid async handle: ' + handle);
        }
        microtaskCallbacks[idx] = null;
      }
    }
  };

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /** @const {!AsyncInterface} */
  var microtask = microTask;

  /**
   * Element class mixin that provides basic meta-programming for creating one
   * or more property accessors (getter/setter pair) that enqueue an async
   * (batched) `_propertiesChanged` callback.
   *
   * For basic usage of this mixin, call `MyClass.createProperties(props)`
   * once at class definition time to create property accessors for properties
   * named in props, implement `_propertiesChanged` to react as desired to
   * property changes, and implement `static get observedAttributes()` and
   * include lowercase versions of any property names that should be set from
   * attributes. Last, call `this._enableProperties()` in the element's
   * `connectedCallback` to enable the accessors.
   *
   * @mixinFunction
   * @polymer
   * @summary Element class mixin for reacting to property changes from
   *   generated property accessors.
   */
  var PropertiesChanged = dedupingMixin(function (superClass) {

    /**
     * @polymer
     * @mixinClass
     * @extends {superClass}
     * @implements {Polymer_PropertiesChanged}
     * @unrestricted
     */
    var PropertiesChanged = function (_superClass) {
      inherits(PropertiesChanged, _superClass);
      createClass(PropertiesChanged, [{
        key: '_createPropertyAccessor',
        //eslint-disable-line no-unused-vars

        /**
         * Creates a setter/getter pair for the named property with its own
         * local storage.  The getter returns the value in the local storage,
         * and the setter calls `_setProperty`, which updates the local storage
         * for the property and enqueues a `_propertiesChanged` callback.
         *
         * This method may be called on a prototype or an instance.  Calling
         * this method may overwrite a property value that already exists on
         * the prototype/instance by creating the accessor.
         *
         * @param {string} property Name of the property
         * @param {boolean=} readOnly When true, no setter is created; the
         *   protected `_setProperty` function must be used to set the property
         * @return {void}
         * @protected
         */
        value: function _createPropertyAccessor(property, readOnly) {
          this._addPropertyToAttributeMap(property);
          if (!this.hasOwnProperty('__dataHasAccessor')) {
            this.__dataHasAccessor = Object.assign({}, this.__dataHasAccessor);
          }
          if (!this.__dataHasAccessor[property]) {
            this.__dataHasAccessor[property] = true;
            this._definePropertyAccessor(property, readOnly);
          }
        }

        /**
         * Adds the given `property` to a map matching attribute names
         * to property names, using `attributeNameForProperty`. This map is
         * used when deserializing attribute values to properties.
         *
         * @param {string} property Name of the property
         */

      }, {
        key: '_addPropertyToAttributeMap',
        value: function _addPropertyToAttributeMap(property) {
          if (!this.hasOwnProperty('__dataAttributes')) {
            this.__dataAttributes = Object.assign({}, this.__dataAttributes);
          }
          if (!this.__dataAttributes[property]) {
            var attr = this.constructor.attributeNameForProperty(property);
            this.__dataAttributes[attr] = property;
          }
        }

        /**
         * Defines a property accessor for the given property.
         * @param {string} property Name of the property
         * @param {boolean=} readOnly When true, no setter is created
         * @return {void}
         */

      }, {
        key: '_definePropertyAccessor',
        value: function _definePropertyAccessor(property, readOnly) {
          Object.defineProperty(this, property, {
            /* eslint-disable valid-jsdoc */
            /** @this {PropertiesChanged} */
            get: function get$$1() {
              return this._getProperty(property);
            },

            /** @this {PropertiesChanged} */
            set: readOnly ? function () {} : function (value) {
              this._setProperty(property, value);
            }
            /* eslint-enable */
          });
        }
      }], [{
        key: 'createProperties',


        /**
         * Creates property accessors for the given property names.
         * @param {!Object} props Object whose keys are names of accessors.
         * @return {void}
         * @protected
         */
        value: function createProperties(props) {
          var proto = this.prototype;
          for (var prop in props) {
            // don't stomp an existing accessor
            if (!(prop in proto)) {
              proto._createPropertyAccessor(prop);
            }
          }
        }

        /**
         * Returns an attribute name that corresponds to the given property.
         * The attribute name is the lowercased property name. Override to
         * customize this mapping.
         * @param {string} property Property to convert
         * @return {string} Attribute name corresponding to the given property.
         *
         * @protected
         */

      }, {
        key: 'attributeNameForProperty',
        value: function attributeNameForProperty(property) {
          return property.toLowerCase();
        }

        /**
         * Override point to provide a type to which to deserialize a value to
         * a given property.
         * @param {string} name Name of property
         *
         * @protected
         */

      }, {
        key: 'typeForProperty',
        value: function typeForProperty(name) {}
      }]);

      function PropertiesChanged() {
        classCallCheck(this, PropertiesChanged);

        var _this = possibleConstructorReturn(this, (PropertiesChanged.__proto__ || Object.getPrototypeOf(PropertiesChanged)).call(this));

        _this.__dataEnabled = false;
        _this.__dataReady = false;
        _this.__dataInvalid = false;
        _this.__data = {};
        _this.__dataPending = null;
        _this.__dataOld = null;
        _this.__dataInstanceProps = null;
        _this.__serializing = false;
        _this._initializeProperties();
        return _this;
      }

      /**
       * Lifecycle callback called when properties are enabled via
       * `_enableProperties`.
       *
       * Users may override this function to implement behavior that is
       * dependent on the element having its property data initialized, e.g.
       * from defaults (initialized from `constructor`, `_initializeProperties`),
       * `attributeChangedCallback`, or values propagated from host e.g. via
       * bindings.  `super.ready()` must be called to ensure the data system
       * becomes enabled.
       *
       * @return {void}
       * @public
       */


      createClass(PropertiesChanged, [{
        key: 'ready',
        value: function ready() {
          this.__dataReady = true;
          this._flushProperties();
        }

        /**
         * Initializes the local storage for property accessors.
         *
         * Provided as an override point for performing any setup work prior
         * to initializing the property accessor system.
         *
         * @return {void}
         * @protected
         */

      }, {
        key: '_initializeProperties',
        value: function _initializeProperties() {
          // Capture instance properties; these will be set into accessors
          // during first flush. Don't set them here, since we want
          // these to overwrite defaults/constructor assignments
          for (var p in this.__dataHasAccessor) {
            if (this.hasOwnProperty(p)) {
              this.__dataInstanceProps = this.__dataInstanceProps || {};
              this.__dataInstanceProps[p] = this[p];
              delete this[p];
            }
          }
        }

        /**
         * Called at ready time with bag of instance properties that overwrote
         * accessors when the element upgraded.
         *
         * The default implementation sets these properties back into the
         * setter at ready time.  This method is provided as an override
         * point for customizing or providing more efficient initialization.
         *
         * @param {Object} props Bag of property values that were overwritten
         *   when creating property accessors.
         * @return {void}
         * @protected
         */

      }, {
        key: '_initializeInstanceProperties',
        value: function _initializeInstanceProperties(props) {
          Object.assign(this, props);
        }

        /**
         * Updates the local storage for a property (via `_setPendingProperty`)
         * and enqueues a `_proeprtiesChanged` callback.
         *
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @return {void}
         * @protected
         */

      }, {
        key: '_setProperty',
        value: function _setProperty(property, value) {
          if (this._setPendingProperty(property, value)) {
            this._invalidateProperties();
          }
        }

        /**
         * Returns the value for the given property.
         * @param {string} property Name of property
         * @return {*} Value for the given property
         * @protected
         */

      }, {
        key: '_getProperty',
        value: function _getProperty(property) {
          return this.__data[property];
        }

        /* eslint-disable no-unused-vars */
        /**
         * Updates the local storage for a property, records the previous value,
         * and adds it to the set of "pending changes" that will be passed to the
         * `_propertiesChanged` callback.  This method does not enqueue the
         * `_propertiesChanged` callback.
         *
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @param {boolean=} ext Not used here; affordance for closure
         * @return {boolean} Returns true if the property changed
         * @protected
         */

      }, {
        key: '_setPendingProperty',
        value: function _setPendingProperty(property, value, ext) {
          var old = this.__data[property];
          var changed = this._shouldPropertyChange(property, value, old);
          if (changed) {
            if (!this.__dataPending) {
              this.__dataPending = {};
              this.__dataOld = {};
            }
            // Ensure old is captured from the last turn
            if (this.__dataOld && !(property in this.__dataOld)) {
              this.__dataOld[property] = old;
            }
            this.__data[property] = value;
            this.__dataPending[property] = value;
          }
          return changed;
        }
        /* eslint-enable */

        /**
         * Marks the properties as invalid, and enqueues an async
         * `_propertiesChanged` callback.
         *
         * @return {void}
         * @protected
         */

      }, {
        key: '_invalidateProperties',
        value: function _invalidateProperties() {
          var _this2 = this;

          if (!this.__dataInvalid && this.__dataReady) {
            this.__dataInvalid = true;
            microtask.run(function () {
              if (_this2.__dataInvalid) {
                _this2.__dataInvalid = false;
                _this2._flushProperties();
              }
            });
          }
        }

        /**
         * Call to enable property accessor processing. Before this method is
         * called accessor values will be set but side effects are
         * queued. When called, any pending side effects occur immediately.
         * For elements, generally `connectedCallback` is a normal spot to do so.
         * It is safe to call this method multiple times as it only turns on
         * property accessors once.
         *
         * @return {void}
         * @protected
         */

      }, {
        key: '_enableProperties',
        value: function _enableProperties() {
          if (!this.__dataEnabled) {
            this.__dataEnabled = true;
            if (this.__dataInstanceProps) {
              this._initializeInstanceProperties(this.__dataInstanceProps);
              this.__dataInstanceProps = null;
            }
            this.ready();
          }
        }

        /**
         * Calls the `_propertiesChanged` callback with the current set of
         * pending changes (and old values recorded when pending changes were
         * set), and resets the pending set of changes. Generally, this method
         * should not be called in user code.
         *
         * @return {void}
         * @protected
         */

      }, {
        key: '_flushProperties',
        value: function _flushProperties() {
          var props = this.__data;
          var changedProps = this.__dataPending;
          var old = this.__dataOld;
          if (this._shouldPropertiesChange(props, changedProps, old)) {
            this.__dataPending = null;
            this.__dataOld = null;
            this._propertiesChanged(props, changedProps, old);
          }
        }

        /**
         * Called in `_flushProperties` to determine if `_propertiesChanged`
         * should be called. The default implementation returns true if
         * properties are pending. Override to customize when
         * `_propertiesChanged` is called.
         * @param {!Object} currentProps Bag of all current accessor values
         * @param {!Object} changedProps Bag of properties changed since the last
         *   call to `_propertiesChanged`
         * @param {!Object} oldProps Bag of previous values for each property
         *   in `changedProps`
         * @return {boolean} true if changedProps is truthy
         */

      }, {
        key: '_shouldPropertiesChange',
        value: function _shouldPropertiesChange(currentProps, changedProps, oldProps) {
          // eslint-disable-line no-unused-vars
          return Boolean(changedProps);
        }

        /**
         * Callback called when any properties with accessors created via
         * `_createPropertyAccessor` have been set.
         *
         * @param {!Object} currentProps Bag of all current accessor values
         * @param {!Object} changedProps Bag of properties changed since the last
         *   call to `_propertiesChanged`
         * @param {!Object} oldProps Bag of previous values for each property
         *   in `changedProps`
         * @return {void}
         * @protected
         */

      }, {
        key: '_propertiesChanged',
        value: function _propertiesChanged(currentProps, changedProps, oldProps) {} // eslint-disable-line no-unused-vars


        /**
         * Method called to determine whether a property value should be
         * considered as a change and cause the `_propertiesChanged` callback
         * to be enqueued.
         *
         * The default implementation returns `true` if a strict equality
         * check fails. The method always returns false for `NaN`.
         *
         * Override this method to e.g. provide stricter checking for
         * Objects/Arrays when using immutable patterns.
         *
         * @param {string} property Property name
         * @param {*} value New property value
         * @param {*} old Previous property value
         * @return {boolean} Whether the property should be considered a change
         *   and enqueue a `_proeprtiesChanged` callback
         * @protected
         */

      }, {
        key: '_shouldPropertyChange',
        value: function _shouldPropertyChange(property, value, old) {
          return (
            // Strict equality check
            old !== value && (
            // This ensures (old==NaN, value==NaN) always returns false
            old === old || value === value)
          );
        }

        /**
         * Implements native Custom Elements `attributeChangedCallback` to
         * set an attribute value to a property via `_attributeToProperty`.
         *
         * @param {string} name Name of attribute that changed
         * @param {?string} old Old attribute value
         * @param {?string} value New attribute value
         * @param {?string} namespace Attribute namespace.
         * @return {void}
         * @suppress {missingProperties} Super may or may not implement the callback
         */

      }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(name, old, value, namespace) {
          if (old !== value) {
            this._attributeToProperty(name, value);
          }
          if (get(PropertiesChanged.prototype.__proto__ || Object.getPrototypeOf(PropertiesChanged.prototype), 'attributeChangedCallback', this)) {
            get(PropertiesChanged.prototype.__proto__ || Object.getPrototypeOf(PropertiesChanged.prototype), 'attributeChangedCallback', this).call(this, name, old, value, namespace);
          }
        }

        /**
         * Deserializes an attribute to its associated property.
         *
         * This method calls the `_deserializeValue` method to convert the string to
         * a typed value.
         *
         * @param {string} attribute Name of attribute to deserialize.
         * @param {?string} value of the attribute.
         * @param {*=} type type to deserialize to, defaults to the value
         * returned from `typeForProperty`
         * @return {void}
         */

      }, {
        key: '_attributeToProperty',
        value: function _attributeToProperty(attribute, value, type) {
          if (!this.__serializing) {
            var map = this.__dataAttributes;
            var property = map && map[attribute] || attribute;
            this[property] = this._deserializeValue(value, type || this.constructor.typeForProperty(property));
          }
        }

        /**
         * Serializes a property to its associated attribute.
         *
         * @suppress {invalidCasts} Closure can't figure out `this` is an element.
         *
         * @param {string} property Property name to reflect.
         * @param {string=} attribute Attribute name to reflect to.
         * @param {*=} value Property value to refect.
         * @return {void}
         */

      }, {
        key: '_propertyToAttribute',
        value: function _propertyToAttribute(property, attribute, value) {
          this.__serializing = true;
          value = arguments.length < 3 ? this[property] : value;
          this._valueToNodeAttribute( /** @type {!HTMLElement} */this, value, attribute || this.constructor.attributeNameForProperty(property));
          this.__serializing = false;
        }

        /**
         * Sets a typed value to an HTML attribute on a node.
         *
         * This method calls the `_serializeValue` method to convert the typed
         * value to a string.  If the `_serializeValue` method returns `undefined`,
         * the attribute will be removed (this is the default for boolean
         * type `false`).
         *
         * @param {Element} node Element to set attribute to.
         * @param {*} value Value to serialize.
         * @param {string} attribute Attribute name to serialize to.
         * @return {void}
         */

      }, {
        key: '_valueToNodeAttribute',
        value: function _valueToNodeAttribute(node, value, attribute) {
          var str = this._serializeValue(value);
          if (str === undefined) {
            node.removeAttribute(attribute);
          } else {
            node.setAttribute(attribute, str);
          }
        }

        /**
         * Converts a typed JavaScript value to a string.
         *
         * This method is called when setting JS property values to
         * HTML attributes.  Users may override this method to provide
         * serialization for custom types.
         *
         * @param {*} value Property value to serialize.
         * @return {string | undefined} String serialized from the provided
         * property  value.
         */

      }, {
        key: '_serializeValue',
        value: function _serializeValue(value) {
          switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
            case 'boolean':
              return value ? '' : undefined;
            default:
              return value != null ? value.toString() : undefined;
          }
        }

        /**
         * Converts a string to a typed JavaScript value.
         *
         * This method is called when reading HTML attribute values to
         * JS properties.  Users may override this method to provide
         * deserialization for custom `type`s. Types for `Boolean`, `String`,
         * and `Number` convert attributes to the expected types.
         *
         * @param {?string} value Value to deserialize.
         * @param {*=} type Type to deserialize the string to.
         * @return {*} Typed value deserialized from the provided string.
         */

      }, {
        key: '_deserializeValue',
        value: function _deserializeValue(value, type) {
          switch (type) {
            case Boolean:
              return value !== null;
            case Number:
              return Number(value);
            default:
              return value;
          }
        }
      }]);
      return PropertiesChanged;
    }(superClass);

    return PropertiesChanged;
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var caseMap$1 = caseMap$0;

  // Save map of native properties; this forms a blacklist or properties
  // that won't have their values "saved" by `saveAccessorValue`, since
  // reading from an HTMLElement accessor from the context of a prototype throws
  var nativeProperties = {};
  var proto = HTMLElement.prototype;
  while (proto) {
    var props = Object.getOwnPropertyNames(proto);
    for (var i = 0; i < props.length; i++) {
      nativeProperties[props[i]] = true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  /**
   * Used to save the value of a property that will be overridden with
   * an accessor. If the `model` is a prototype, the values will be saved
   * in `__dataProto`, and it's up to the user (or downstream mixin) to
   * decide how/when to set these values back into the accessors.
   * If `model` is already an instance (it has a `__data` property), then
   * the value will be set as a pending property, meaning the user should
   * call `_invalidateProperties` or `_flushProperties` to take effect
   *
   * @param {Object} model Prototype or instance
   * @param {string} property Name of property
   * @return {void}
   * @private
   */
  function saveAccessorValue(model, property) {
    // Don't read/store value for any native properties since they could throw
    if (!nativeProperties[property]) {
      var value = model[property];
      if (value !== undefined) {
        if (model.__data) {
          // Adding accessor to instance; update the property
          // It is the user's responsibility to call _flushProperties
          model._setPendingProperty(property, value);
        } else {
          // Adding accessor to proto; save proto's value for instance-time use
          if (!model.__dataProto) {
            model.__dataProto = {};
          } else if (!model.hasOwnProperty(JSCompiler_renameProperty('__dataProto', model))) {
            model.__dataProto = Object.create(model.__dataProto);
          }
          model.__dataProto[property] = value;
        }
      }
    }
  }

  /**
   * Element class mixin that provides basic meta-programming for creating one
   * or more property accessors (getter/setter pair) that enqueue an async
   * (batched) `_propertiesChanged` callback.
   *
   * For basic usage of this mixin:
   *
   * -   Declare attributes to observe via the standard `static get observedAttributes()`. Use
   *     `dash-case` attribute names to represent `camelCase` property names.
   * -   Implement the `_propertiesChanged` callback on the class.
   * -   Call `MyClass.createPropertiesForAttributes()` **once** on the class to generate
   *     property accessors for each observed attribute. This must be called before the first
   *     instance is created, for example, by calling it before calling `customElements.define`.
   *     It can also be called lazily from the element's `constructor`, as long as it's guarded so
   *     that the call is only made once, when the first instance is created.
   * -   Call `this._enableProperties()` in the element's `connectedCallback` to enable
   *     the accessors.
   *
   * Any `observedAttributes` will automatically be
   * deserialized via `attributeChangedCallback` and set to the associated
   * property using `dash-case`-to-`camelCase` convention.
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin PropertiesChanged
   * @summary Element class mixin for reacting to property changes from
   *   generated property accessors.
   */
  var PropertyAccessors = dedupingMixin(function (superClass) {

    /**
     * @constructor
     * @extends {superClass}
     * @implements {Polymer_PropertiesChanged}
     * @unrestricted
     */
    var base = PropertiesChanged(superClass);

    /**
     * @polymer
     * @mixinClass
     * @implements {Polymer_PropertyAccessors}
     * @extends {base}
     * @unrestricted
     */

    var PropertyAccessors = function (_base) {
      inherits(PropertyAccessors, _base);

      function PropertyAccessors() {
        classCallCheck(this, PropertyAccessors);
        return possibleConstructorReturn(this, (PropertyAccessors.__proto__ || Object.getPrototypeOf(PropertyAccessors)).apply(this, arguments));
      }

      createClass(PropertyAccessors, [{
        key: '_initializeProperties',


        /**
         * Overrides PropertiesChanged implementation to initialize values for
         * accessors created for values that already existed on the element
         * prototype.
         *
         * @return {void}
         * @protected
         */
        value: function _initializeProperties() {
          if (this.__dataProto) {
            this._initializeProtoProperties(this.__dataProto);
            this.__dataProto = null;
          }
          get(PropertyAccessors.prototype.__proto__ || Object.getPrototypeOf(PropertyAccessors.prototype), '_initializeProperties', this).call(this);
        }

        /**
         * Called at instance time with bag of properties that were overwritten
         * by accessors on the prototype when accessors were created.
         *
         * The default implementation sets these properties back into the
         * setter at instance time.  This method is provided as an override
         * point for customizing or providing more efficient initialization.
         *
         * @param {Object} props Bag of property values that were overwritten
         *   when creating property accessors.
         * @return {void}
         * @protected
         */

      }, {
        key: '_initializeProtoProperties',
        value: function _initializeProtoProperties(props) {
          for (var p in props) {
            this._setProperty(p, props[p]);
          }
        }

        /**
         * Ensures the element has the given attribute. If it does not,
         * assigns the given value to the attribute.
         *
         * @suppress {invalidCasts} Closure can't figure out `this` is infact an element
         *
         * @param {string} attribute Name of attribute to ensure is set.
         * @param {string} value of the attribute.
         * @return {void}
         */

      }, {
        key: '_ensureAttribute',
        value: function _ensureAttribute(attribute, value) {
          var el = /** @type {!HTMLElement} */this;
          if (!el.hasAttribute(attribute)) {
            this._valueToNodeAttribute(el, value, attribute);
          }
        }

        /**
         * Overrides PropertiesChanged implemention to serialize objects as JSON.
         *
         * @param {*} value Property value to serialize.
         * @return {string | undefined} String serialized from the provided property value.
         */

      }, {
        key: '_serializeValue',
        value: function _serializeValue(value) {
          /* eslint-disable no-fallthrough */
          switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
            case 'object':
              if (value instanceof Date) {
                return value.toString();
              } else if (value) {
                try {
                  return JSON.stringify(value);
                } catch (x) {
                  return '';
                }
              }

            default:
              return get(PropertyAccessors.prototype.__proto__ || Object.getPrototypeOf(PropertyAccessors.prototype), '_serializeValue', this).call(this, value);
          }
        }

        /**
         * Converts a string to a typed JavaScript value.
         *
         * This method is called by Polymer when reading HTML attribute values to
         * JS properties.  Users may override this method on Polymer element
         * prototypes to provide deserialization for custom `type`s.  Note,
         * the `type` argument is the value of the `type` field provided in the
         * `properties` configuration object for a given property, and is
         * by convention the constructor for the type to deserialize.
         *
         *
         * @param {?string} value Attribute value to deserialize.
         * @param {*=} type Type to deserialize the string to.
         * @return {*} Typed value deserialized from the provided string.
         */

      }, {
        key: '_deserializeValue',
        value: function _deserializeValue(value, type) {
          /**
           * @type {*}
           */
          var outValue = void 0;
          switch (type) {
            case Object:
              try {
                outValue = JSON.parse( /** @type {string} */value);
              } catch (x) {
                // allow non-JSON literals like Strings and Numbers
                outValue = value;
              }
              break;
            case Array:
              try {
                outValue = JSON.parse( /** @type {string} */value);
              } catch (x) {
                outValue = null;
                console.warn('Polymer::Attributes: couldn\'t decode Array as JSON: ' + value);
              }
              break;
            case Date:
              outValue = isNaN(value) ? String(value) : Number(value);
              outValue = new Date(outValue);
              break;
            default:
              outValue = get(PropertyAccessors.prototype.__proto__ || Object.getPrototypeOf(PropertyAccessors.prototype), '_deserializeValue', this).call(this, value, type);
              break;
          }
          return outValue;
        }
        /* eslint-enable no-fallthrough */

        /**
         * Overrides PropertiesChanged implementation to save existing prototype
         * property value so that it can be reset.
         * @param {string} property Name of the property
         * @param {boolean=} readOnly When true, no setter is created
         *
         * When calling on a prototype, any overwritten values are saved in
         * `__dataProto`, and it is up to the subclasser to decide how/when
         * to set those properties back into the accessor.  When calling on an
         * instance, the overwritten value is set via `_setPendingProperty`,
         * and the user should call `_invalidateProperties` or `_flushProperties`
         * for the values to take effect.
         * @protected
         * @return {void}
         */

      }, {
        key: '_definePropertyAccessor',
        value: function _definePropertyAccessor(property, readOnly) {
          saveAccessorValue(this, property);
          get(PropertyAccessors.prototype.__proto__ || Object.getPrototypeOf(PropertyAccessors.prototype), '_definePropertyAccessor', this).call(this, property, readOnly);
        }

        /**
         * Returns true if this library created an accessor for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if an accessor was created
         */

      }, {
        key: '_hasAccessor',
        value: function _hasAccessor(property) {
          return this.__dataHasAccessor && this.__dataHasAccessor[property];
        }

        /**
         * Returns true if the specified property has a pending change.
         *
         * @param {string} prop Property name
         * @return {boolean} True if property has a pending change
         * @protected
         */

      }, {
        key: '_isPropertyPending',
        value: function _isPropertyPending(prop) {
          return Boolean(this.__dataPending && prop in this.__dataPending);
        }
      }], [{
        key: 'createPropertiesForAttributes',


        /**
         * Generates property accessors for all attributes in the standard
         * static `observedAttributes` array.
         *
         * Attribute names are mapped to property names using the `dash-case` to
         * `camelCase` convention
         *
         * @return {void}
         */
        value: function createPropertiesForAttributes() {
          var a$ = this.observedAttributes;
          for (var _i = 0; _i < a$.length; _i++) {
            this.prototype._createPropertyAccessor(caseMap$1.dashToCamelCase(a$[_i]));
          }
        }

        /**
         * Returns an attribute name that corresponds to the given property.
         * By default, converts camel to dash case, e.g. `fooBar` to `foo-bar`.
         * @param {string} property Property to convert
         * @return {string} Attribute name corresponding to the given property.
         *
         * @protected
         */

      }, {
        key: 'attributeNameForProperty',
        value: function attributeNameForProperty(property) {
          return caseMap$1.camelToDashCase(property);
        }
      }]);
      return PropertyAccessors;
    }(base);

    return PropertyAccessors;
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  // 1.x backwards-compatible auto-wrapper for template type extensions
  // This is a clear layering violation and gives favored-nation status to
  // dom-if and dom-repeat templates.  This is a conceit we're choosing to keep
  // a.) to ease 1.x backwards-compatibility due to loss of `is`, and
  // b.) to maintain if/repeat capability in parser-constrained elements
  //     (e.g. table, select) in lieu of native CE type extensions without
  //     massive new invention in this space (e.g. directive system)
  var templateExtensions = {
    'dom-if': true,
    'dom-repeat': true
  };
  function wrapTemplateExtension(node) {
    var is = node.getAttribute('is');
    if (is && templateExtensions[is]) {
      var t = node;
      t.removeAttribute('is');
      node = t.ownerDocument.createElement(is);
      t.parentNode.replaceChild(node, t);
      node.appendChild(t);
      while (t.attributes.length) {
        node.setAttribute(t.attributes[0].name, t.attributes[0].value);
        t.removeAttribute(t.attributes[0].name);
      }
    }
    return node;
  }

  function findTemplateNode(root, nodeInfo) {
    // recursively ascend tree until we hit root
    var parent = nodeInfo.parentInfo && findTemplateNode(root, nodeInfo.parentInfo);
    // unwind the stack, returning the indexed node at each level
    if (parent) {
      // note: marginally faster than indexing via childNodes
      // (http://jsperf.com/childnodes-lookup)
      for (var n = parent.firstChild, i = 0; n; n = n.nextSibling) {
        if (nodeInfo.parentIndex === i++) {
          return n;
        }
      }
    } else {
      return root;
    }
  }

  // construct `$` map (from id annotations)
  function applyIdToMap(inst, map, node, nodeInfo) {
    if (nodeInfo.id) {
      map[nodeInfo.id] = node;
    }
  }

  // install event listeners (from event annotations)
  function applyEventListener(inst, node, nodeInfo) {
    if (nodeInfo.events && nodeInfo.events.length) {
      for (var j = 0, e$ = nodeInfo.events, e; j < e$.length && (e = e$[j]); j++) {
        inst._addMethodEventListenerToNode(node, e.name, e.value, inst);
      }
    }
  }

  // push configuration references at configure time
  function applyTemplateContent(inst, node, nodeInfo) {
    if (nodeInfo.templateInfo) {
      node._templateInfo = nodeInfo.templateInfo;
    }
  }

  function createNodeEventHandler(context, eventName, methodName) {
    // Instances can optionally have a _methodHost which allows redirecting where
    // to find methods. Currently used by `templatize`.
    context = context._methodHost || context;
    var handler = function handler(e) {
      if (context[methodName]) {
        context[methodName](e, e.detail);
      } else {
        console.warn('listener method `' + methodName + '` not defined');
      }
    };
    return handler;
  }

  /**
   * Element mixin that provides basic template parsing and stamping, including
   * the following template-related features for stamped templates:
   *
   * - Declarative event listeners (`on-eventname="listener"`)
   * - Map of node id's to stamped node instances (`this.$.id`)
   * - Nested template content caching/removal and re-installation (performance
   *   optimization)
   *
   * @mixinFunction
   * @polymer
   * @summary Element class mixin that provides basic template parsing and stamping
   */
  var TemplateStamp = dedupingMixin(function (superClass) {

    /**
     * @polymer
     * @mixinClass
     * @implements {Polymer_TemplateStamp}
     */
    var TemplateStamp = function (_superClass) {
      inherits(TemplateStamp, _superClass);

      function TemplateStamp() {
        classCallCheck(this, TemplateStamp);
        return possibleConstructorReturn(this, (TemplateStamp.__proto__ || Object.getPrototypeOf(TemplateStamp)).apply(this, arguments));
      }

      createClass(TemplateStamp, [{
        key: '_stampTemplate',


        /**
         * Clones the provided template content and returns a document fragment
         * containing the cloned dom.
         *
         * The template is parsed (once and memoized) using this library's
         * template parsing features, and provides the following value-added
         * features:
         * * Adds declarative event listeners for `on-event="handler"` attributes
         * * Generates an "id map" for all nodes with id's under `$` on returned
         *   document fragment
         * * Passes template info including `content` back to templates as
         *   `_templateInfo` (a performance optimization to avoid deep template
         *   cloning)
         *
         * Note that the memoized template parsing process is destructive to the
         * template: attributes for bindings and declarative event listeners are
         * removed after being noted in notes, and any nested `<template>.content`
         * is removed and stored in notes as well.
         *
         * @param {!HTMLTemplateElement} template Template to stamp
         * @return {!StampedTemplate} Cloned template content
         */
        value: function _stampTemplate(template) {
          // Polyfill support: bootstrap the template if it has not already been
          if (template && !template.content && window.HTMLTemplateElement && HTMLTemplateElement.decorate) {
            HTMLTemplateElement.decorate(template);
          }
          var templateInfo = this.constructor._parseTemplate(template);
          var nodeInfo = templateInfo.nodeInfoList;
          var content = templateInfo.content || template.content;
          var dom = /** @type {DocumentFragment} */document.importNode(content, true);
          // NOTE: ShadyDom optimization indicating there is an insertion point
          dom.__noInsertionPoint = !templateInfo.hasInsertionPoint;
          var nodes = dom.nodeList = new Array(nodeInfo.length);
          dom.$ = {};
          for (var i = 0, l = nodeInfo.length, info; i < l && (info = nodeInfo[i]); i++) {
            var node = nodes[i] = findTemplateNode(dom, info);
            applyIdToMap(this, dom.$, node, info);
            applyTemplateContent(this, node, info);
            applyEventListener(this, node, info);
          }
          dom = /** @type {!StampedTemplate} */dom; // eslint-disable-line no-self-assign
          return dom;
        }

        /**
         * Adds an event listener by method name for the event provided.
         *
         * This method generates a handler function that looks up the method
         * name at handling time.
         *
         * @param {!Node} node Node to add listener on
         * @param {string} eventName Name of event
         * @param {string} methodName Name of method
         * @param {*=} context Context the method will be called on (defaults
         *   to `node`)
         * @return {Function} Generated handler function
         */

      }, {
        key: '_addMethodEventListenerToNode',
        value: function _addMethodEventListenerToNode(node, eventName, methodName, context) {
          context = context || node;
          var handler = createNodeEventHandler(context, eventName, methodName);
          this._addEventListenerToNode(node, eventName, handler);
          return handler;
        }

        /**
         * Override point for adding custom or simulated event handling.
         *
         * @param {!Node} node Node to add event listener to
         * @param {string} eventName Name of event
         * @param {function(!Event):void} handler Listener function to add
         * @return {void}
         */

      }, {
        key: '_addEventListenerToNode',
        value: function _addEventListenerToNode(node, eventName, handler) {
          node.addEventListener(eventName, handler);
        }

        /**
         * Override point for adding custom or simulated event handling.
         *
         * @param {Node} node Node to remove event listener from
         * @param {string} eventName Name of event
         * @param {function(!Event):void} handler Listener function to remove
         * @return {void}
         */

      }, {
        key: '_removeEventListenerFromNode',
        value: function _removeEventListenerFromNode(node, eventName, handler) {
          node.removeEventListener(eventName, handler);
        }
      }], [{
        key: '_parseTemplate',


        /**
         * Scans a template to produce template metadata.
         *
         * Template-specific metadata are stored in the object returned, and node-
         * specific metadata are stored in objects in its flattened `nodeInfoList`
         * array.  Only nodes in the template that were parsed as nodes of
         * interest contain an object in `nodeInfoList`.  Each `nodeInfo` object
         * contains an `index` (`childNodes` index in parent) and optionally
         * `parent`, which points to node info of its parent (including its index).
         *
         * The template metadata object returned from this method has the following
         * structure (many fields optional):
         *
         * ```js
         *   {
         *     // Flattened list of node metadata (for nodes that generated metadata)
         *     nodeInfoList: [
         *       {
         *         // `id` attribute for any nodes with id's for generating `$` map
         *         id: {string},
         *         // `on-event="handler"` metadata
         *         events: [
         *           {
         *             name: {string},   // event name
         *             value: {string},  // handler method name
         *           }, ...
         *         ],
         *         // Notes when the template contained a `<slot>` for shady DOM
         *         // optimization purposes
         *         hasInsertionPoint: {boolean},
         *         // For nested `<template>`` nodes, nested template metadata
         *         templateInfo: {object}, // nested template metadata
         *         // Metadata to allow efficient retrieval of instanced node
         *         // corresponding to this metadata
         *         parentInfo: {number},   // reference to parent nodeInfo>
         *         parentIndex: {number},  // index in parent's `childNodes` collection
         *         infoIndex: {number},    // index of this `nodeInfo` in `templateInfo.nodeInfoList`
         *       },
         *       ...
         *     ],
         *     // When true, the template had the `strip-whitespace` attribute
         *     // or was nested in a template with that setting
         *     stripWhitespace: {boolean},
         *     // For nested templates, nested template content is moved into
         *     // a document fragment stored here; this is an optimization to
         *     // avoid the cost of nested template cloning
         *     content: {DocumentFragment}
         *   }
         * ```
         *
         * This method kicks off a recursive treewalk as follows:
         *
         * ```
         *    _parseTemplate <---------------------+
         *      _parseTemplateContent              |
         *        _parseTemplateNode  <------------|--+
         *          _parseTemplateNestedTemplate --+  |
         *          _parseTemplateChildNodes ---------+
         *          _parseTemplateNodeAttributes
         *            _parseTemplateNodeAttribute
         *
         * ```
         *
         * These methods may be overridden to add custom metadata about templates
         * to either `templateInfo` or `nodeInfo`.
         *
         * Note that this method may be destructive to the template, in that
         * e.g. event annotations may be removed after being noted in the
         * template metadata.
         *
         * @param {!HTMLTemplateElement} template Template to parse
         * @param {TemplateInfo=} outerTemplateInfo Template metadata from the outer
         *   template, for parsing nested templates
         * @return {!TemplateInfo} Parsed template metadata
         */
        value: function _parseTemplate(template, outerTemplateInfo) {
          // since a template may be re-used, memo-ize metadata
          if (!template._templateInfo) {
            var templateInfo = template._templateInfo = {};
            templateInfo.nodeInfoList = [];
            templateInfo.stripWhiteSpace = outerTemplateInfo && outerTemplateInfo.stripWhiteSpace || template.hasAttribute('strip-whitespace');
            this._parseTemplateContent(template, templateInfo, { parent: null });
          }
          return template._templateInfo;
        }
      }, {
        key: '_parseTemplateContent',
        value: function _parseTemplateContent(template, templateInfo, nodeInfo) {
          return this._parseTemplateNode(template.content, templateInfo, nodeInfo);
        }

        /**
         * Parses template node and adds template and node metadata based on
         * the current node, and its `childNodes` and `attributes`.
         *
         * This method may be overridden to add custom node or template specific
         * metadata based on this node.
         *
         * @param {Node} node Node to parse
         * @param {!TemplateInfo} templateInfo Template metadata for current template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         */

      }, {
        key: '_parseTemplateNode',
        value: function _parseTemplateNode(node, templateInfo, nodeInfo) {
          var noted = void 0;
          var element = /** @type {Element} */node;
          if (element.localName == 'template' && !element.hasAttribute('preserve-content')) {
            noted = this._parseTemplateNestedTemplate(element, templateInfo, nodeInfo) || noted;
          } else if (element.localName === 'slot') {
            // For ShadyDom optimization, indicating there is an insertion point
            templateInfo.hasInsertionPoint = true;
          }
          if (element.firstChild) {
            noted = this._parseTemplateChildNodes(element, templateInfo, nodeInfo) || noted;
          }
          if (element.hasAttributes && element.hasAttributes()) {
            noted = this._parseTemplateNodeAttributes(element, templateInfo, nodeInfo) || noted;
          }
          return noted;
        }

        /**
         * Parses template child nodes for the given root node.
         *
         * This method also wraps whitelisted legacy template extensions
         * (`is="dom-if"` and `is="dom-repeat"`) with their equivalent element
         * wrappers, collapses text nodes, and strips whitespace from the template
         * if the `templateInfo.stripWhitespace` setting was provided.
         *
         * @param {Node} root Root node whose `childNodes` will be parsed
         * @param {!TemplateInfo} templateInfo Template metadata for current template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {void}
         */

      }, {
        key: '_parseTemplateChildNodes',
        value: function _parseTemplateChildNodes(root, templateInfo, nodeInfo) {
          if (root.localName === 'script' || root.localName === 'style') {
            return;
          }
          for (var node = root.firstChild, parentIndex = 0, next; node; node = next) {
            // Wrap templates
            if (node.localName == 'template') {
              node = wrapTemplateExtension(node);
            }
            // collapse adjacent textNodes: fixes an IE issue that can cause
            // text nodes to be inexplicably split =(
            // note that root.normalize() should work but does not so we do this
            // manually.
            next = node.nextSibling;
            if (node.nodeType === Node.TEXT_NODE) {
              var /** Node */n = next;
              while (n && n.nodeType === Node.TEXT_NODE) {
                node.textContent += n.textContent;
                next = n.nextSibling;
                root.removeChild(n);
                n = next;
              }
              // optionally strip whitespace
              if (templateInfo.stripWhiteSpace && !node.textContent.trim()) {
                root.removeChild(node);
                continue;
              }
            }
            var childInfo = { parentIndex: parentIndex, parentInfo: nodeInfo };
            if (this._parseTemplateNode(node, templateInfo, childInfo)) {
              childInfo.infoIndex = templateInfo.nodeInfoList.push( /** @type {!NodeInfo} */childInfo) - 1;
            }
            // Increment if not removed
            if (node.parentNode) {
              parentIndex++;
            }
          }
        }

        /**
         * Parses template content for the given nested `<template>`.
         *
         * Nested template info is stored as `templateInfo` in the current node's
         * `nodeInfo`. `template.content` is removed and stored in `templateInfo`.
         * It will then be the responsibility of the host to set it back to the
         * template and for users stamping nested templates to use the
         * `_contentForTemplate` method to retrieve the content for this template
         * (an optimization to avoid the cost of cloning nested template content).
         *
         * @param {HTMLTemplateElement} node Node to parse (a <template>)
         * @param {TemplateInfo} outerTemplateInfo Template metadata for current template
         *   that includes the template `node`
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         */

      }, {
        key: '_parseTemplateNestedTemplate',
        value: function _parseTemplateNestedTemplate(node, outerTemplateInfo, nodeInfo) {
          var templateInfo = this._parseTemplate(node, outerTemplateInfo);
          var content = templateInfo.content = node.content.ownerDocument.createDocumentFragment();
          content.appendChild(node.content);
          nodeInfo.templateInfo = templateInfo;
          return true;
        }

        /**
         * Parses template node attributes and adds node metadata to `nodeInfo`
         * for nodes of interest.
         *
         * @param {Element} node Node to parse
         * @param {TemplateInfo} templateInfo Template metadata for current template
         * @param {NodeInfo} nodeInfo Node metadata for current template.
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         */

      }, {
        key: '_parseTemplateNodeAttributes',
        value: function _parseTemplateNodeAttributes(node, templateInfo, nodeInfo) {
          // Make copy of original attribute list, since the order may change
          // as attributes are added and removed
          var noted = false;
          var attrs = Array.from(node.attributes);
          for (var i = attrs.length - 1, a; a = attrs[i]; i--) {
            noted = this._parseTemplateNodeAttribute(node, templateInfo, nodeInfo, a.name, a.value) || noted;
          }
          return noted;
        }

        /**
         * Parses a single template node attribute and adds node metadata to
         * `nodeInfo` for attributes of interest.
         *
         * This implementation adds metadata for `on-event="handler"` attributes
         * and `id` attributes.
         *
         * @param {Element} node Node to parse
         * @param {!TemplateInfo} templateInfo Template metadata for current template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @param {string} name Attribute name
         * @param {string} value Attribute value
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         */

      }, {
        key: '_parseTemplateNodeAttribute',
        value: function _parseTemplateNodeAttribute(node, templateInfo, nodeInfo, name, value) {
          // events (on-*)
          if (name.slice(0, 3) === 'on-') {
            node.removeAttribute(name);
            nodeInfo.events = nodeInfo.events || [];
            nodeInfo.events.push({
              name: name.slice(3),
              value: value
            });
            return true;
          }
          // static id
          else if (name === 'id') {
              nodeInfo.id = value;
              return true;
            }
          return false;
        }

        /**
         * Returns the `content` document fragment for a given template.
         *
         * For nested templates, Polymer performs an optimization to cache nested
         * template content to avoid the cost of cloning deeply nested templates.
         * This method retrieves the cached content for a given template.
         *
         * @param {HTMLTemplateElement} template Template to retrieve `content` for
         * @return {DocumentFragment} Content fragment
         */

      }, {
        key: '_contentForTemplate',
        value: function _contentForTemplate(template) {
          var templateInfo = /** @type {HTMLTemplateElementWithInfo} */template._templateInfo;
          return templateInfo && templateInfo.content || template.content;
        }
      }]);
      return TemplateStamp;
    }(superClass);

    return TemplateStamp;
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /** @const {Object} */
  var CaseMap = caseMap$0;

  // Monotonically increasing unique ID used for de-duping effects triggered
  // from multiple properties in the same turn
  var dedupeId$1 = 0;

  /**
   * Property effect types; effects are stored on the prototype using these keys
   * @enum {string}
   */
  var TYPES = {
    COMPUTE: '__computeEffects',
    REFLECT: '__reflectEffects',
    NOTIFY: '__notifyEffects',
    PROPAGATE: '__propagateEffects',
    OBSERVE: '__observeEffects',
    READ_ONLY: '__readOnly'
  };

  /** @const {RegExp} */
  var capitalAttributeRegex = /[A-Z]/;

  /**
   * Ensures that the model has an own-property map of effects for the given type.
   * The model may be a prototype or an instance.
   *
   * Property effects are stored as arrays of effects by property in a map,
   * by named type on the model. e.g.
   *
   *   __computeEffects: {
   *     foo: [ ... ],
   *     bar: [ ... ]
   *   }
   *
   * If the model does not yet have an effect map for the type, one is created
   * and returned.  If it does, but it is not an own property (i.e. the
   * prototype had effects), the the map is deeply cloned and the copy is
   * set on the model and returned, ready for new effects to be added.
   *
   * @param {Object} model Prototype or instance
   * @param {string} type Property effect type
   * @return {Object} The own-property map of effects for the given type
   * @private
   */
  function ensureOwnEffectMap(model, type) {
    var effects = model[type];
    if (!effects) {
      effects = model[type] = {};
    } else if (!model.hasOwnProperty(type)) {
      effects = model[type] = Object.create(model[type]);
      for (var p in effects) {
        var protoFx = effects[p];
        var instFx = effects[p] = Array(protoFx.length);
        for (var i = 0; i < protoFx.length; i++) {
          instFx[i] = protoFx[i];
        }
      }
    }
    return effects;
  }

  // -- effects ----------------------------------------------

  /**
   * Runs all effects of a given type for the given set of property changes
   * on an instance.
   *
   * @param {!PropertyEffectsType} inst The instance with effects to run
   * @param {Object} effects Object map of property-to-Array of effects
   * @param {Object} props Bag of current property changes
   * @param {Object=} oldProps Bag of previous values for changed properties
   * @param {boolean=} hasPaths True with `props` contains one or more paths
   * @param {*=} extraArgs Additional metadata to pass to effect function
   * @return {boolean} True if an effect ran for this property
   * @private
   */
  function runEffects(inst, effects, props, oldProps, hasPaths, extraArgs) {
    if (effects) {
      var ran = false;
      var id = dedupeId$1++;
      for (var prop in props) {
        if (runEffectsForProperty(inst, effects, id, prop, props, oldProps, hasPaths, extraArgs)) {
          ran = true;
        }
      }
      return ran;
    }
    return false;
  }

  /**
   * Runs a list of effects for a given property.
   *
   * @param {!PropertyEffectsType} inst The instance with effects to run
   * @param {Object} effects Object map of property-to-Array of effects
   * @param {number} dedupeId Counter used for de-duping effects
   * @param {string} prop Name of changed property
   * @param {*} props Changed properties
   * @param {*} oldProps Old properties
   * @param {boolean=} hasPaths True with `props` contains one or more paths
   * @param {*=} extraArgs Additional metadata to pass to effect function
   * @return {boolean} True if an effect ran for this property
   * @private
   */
  function runEffectsForProperty(inst, effects, dedupeId, prop, props, oldProps, hasPaths, extraArgs) {
    var ran = false;
    var rootProperty = hasPaths ? root(prop) : prop;
    var fxs = effects[rootProperty];
    if (fxs) {
      for (var i = 0, l = fxs.length, fx; i < l && (fx = fxs[i]); i++) {
        if ((!fx.info || fx.info.lastRun !== dedupeId) && (!hasPaths || pathMatchesTrigger(prop, fx.trigger))) {
          if (fx.info) {
            fx.info.lastRun = dedupeId;
          }
          fx.fn(inst, prop, props, oldProps, fx.info, hasPaths, extraArgs);
          ran = true;
        }
      }
    }
    return ran;
  }

  /**
   * Determines whether a property/path that has changed matches the trigger
   * criteria for an effect.  A trigger is a descriptor with the following
   * structure, which matches the descriptors returned from `parseArg`.
   * e.g. for `foo.bar.*`:
   * ```
   * trigger: {
   *   name: 'a.b',
   *   structured: true,
   *   wildcard: true
   * }
   * ```
   * If no trigger is given, the path is deemed to match.
   *
   * @param {string} path Path or property that changed
   * @param {DataTrigger} trigger Descriptor
   * @return {boolean} Whether the path matched the trigger
   */
  function pathMatchesTrigger(path, trigger) {
    if (trigger) {
      var triggerPath = trigger.name;
      return triggerPath == path || trigger.structured && isAncestor(triggerPath, path) || trigger.wildcard && isDescendant(triggerPath, path);
    } else {
      return true;
    }
  }

  /**
   * Implements the "observer" effect.
   *
   * Calls the method with `info.methodName` on the instance, passing the
   * new and old values.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @return {void}
   * @private
   */
  function runObserverEffect(inst, property, props, oldProps, info) {
    var fn = typeof info.method === "string" ? inst[info.method] : info.method;
    var changedProp = info.property;
    if (fn) {
      fn.call(inst, inst.__data[changedProp], oldProps[changedProp]);
    } else if (!info.dynamicFn) {
      console.warn('observer method `' + info.method + '` not defined');
    }
  }

  /**
   * Runs "notify" effects for a set of changed properties.
   *
   * This method differs from the generic `runEffects` method in that it
   * will dispatch path notification events in the case that the property
   * changed was a path and the root property for that path didn't have a
   * "notify" effect.  This is to maintain 1.0 behavior that did not require
   * `notify: true` to ensure object sub-property notifications were
   * sent.
   *
   * @param {!PropertyEffectsType} inst The instance with effects to run
   * @param {Object} notifyProps Bag of properties to notify
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {boolean} hasPaths True with `props` contains one or more paths
   * @return {void}
   * @private
   */
  function runNotifyEffects(inst, notifyProps, props, oldProps, hasPaths) {
    // Notify
    var fxs = inst[TYPES.NOTIFY];
    var notified = void 0;
    var id = dedupeId$1++;
    // Try normal notify effects; if none, fall back to try path notification
    for (var prop in notifyProps) {
      if (notifyProps[prop]) {
        if (fxs && runEffectsForProperty(inst, fxs, id, prop, props, oldProps, hasPaths)) {
          notified = true;
        } else if (hasPaths && notifyPath(inst, prop, props)) {
          notified = true;
        }
      }
    }
    // Flush host if we actually notified and host was batching
    // And the host has already initialized clients; this prevents
    // an issue with a host observing data changes before clients are ready.
    var host = void 0;
    if (notified && (host = inst.__dataHost) && host._invalidateProperties) {
      host._invalidateProperties();
    }
  }

  /**
   * Dispatches {property}-changed events with path information in the detail
   * object to indicate a sub-path of the property was changed.
   *
   * @param {!PropertyEffectsType} inst The element from which to fire the event
   * @param {string} path The path that was changed
   * @param {Object} props Bag of current property changes
   * @return {boolean} Returns true if the path was notified
   * @private
   */
  function notifyPath(inst, path, props) {
    var rootProperty = root(path);
    if (rootProperty !== path) {
      var eventName = camelToDashCase(rootProperty) + '-changed';
      dispatchNotifyEvent(inst, eventName, props[path], path);
      return true;
    }
    return false;
  }

  /**
   * Dispatches {property}-changed events to indicate a property (or path)
   * changed.
   *
   * @param {!PropertyEffectsType} inst The element from which to fire the event
   * @param {string} eventName The name of the event to send ('{property}-changed')
   * @param {*} value The value of the changed property
   * @param {string | null | undefined} path If a sub-path of this property changed, the path
   *   that changed (optional).
   * @return {void}
   * @private
   * @suppress {invalidCasts}
   */
  function dispatchNotifyEvent(inst, eventName, value, path) {
    var detail = {
      value: value,
      queueProperty: true
    };
    if (path) {
      detail.path = path;
    }
    /** @type {!HTMLElement} */inst.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
  }

  /**
   * Implements the "notify" effect.
   *
   * Dispatches a non-bubbling event named `info.eventName` on the instance
   * with a detail object containing the new `value`.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @param {boolean} hasPaths True with `props` contains one or more paths
   * @return {void}
   * @private
   */
  function runNotifyEffect(inst, property, props, oldProps, info, hasPaths) {
    var rootProperty = hasPaths ? root(property) : property;
    var path = rootProperty != property ? property : null;
    var value = path ? get$1(inst, path) : inst.__data[property];
    if (path && value === undefined) {
      value = props[property]; // specifically for .splices
    }
    dispatchNotifyEvent(inst, info.eventName, value, path);
  }

  /**
   * Handler function for 2-way notification events. Receives context
   * information captured in the `addNotifyListener` closure from the
   * `__notifyListeners` metadata.
   *
   * Sets the value of the notified property to the host property or path.  If
   * the event contained path information, translate that path to the host
   * scope's name for that path first.
   *
   * @param {CustomEvent} event Notification event (e.g. '<property>-changed')
   * @param {!PropertyEffectsType} inst Host element instance handling the notification event
   * @param {string} fromProp Child element property that was bound
   * @param {string} toPath Host property/path that was bound
   * @param {boolean} negate Whether the binding was negated
   * @return {void}
   * @private
   */
  function handleNotification(event, inst, fromProp, toPath, negate) {
    var value = void 0;
    var detail = /** @type {Object} */event.detail;
    var fromPath = detail && detail.path;
    if (fromPath) {
      toPath = translate(fromProp, toPath, fromPath);
      value = detail && detail.value;
    } else {
      value = event.target[fromProp];
    }
    value = negate ? !value : value;
    if (!inst[TYPES.READ_ONLY] || !inst[TYPES.READ_ONLY][toPath]) {
      if (inst._setPendingPropertyOrPath(toPath, value, true, Boolean(fromPath)) && (!detail || !detail.queueProperty)) {
        inst._invalidateProperties();
      }
    }
  }

  /**
   * Implements the "reflect" effect.
   *
   * Sets the attribute named `info.attrName` to the given property value.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @return {void}
   * @private
   */
  function runReflectEffect(inst, property, props, oldProps, info) {
    var value = inst.__data[property];
    if (sanitizeDOMValue) {
      value = sanitizeDOMValue(value, info.attrName, 'attribute', /** @type {Node} */inst);
    }
    inst._propertyToAttribute(property, info.attrName, value);
  }

  /**
   * Runs "computed" effects for a set of changed properties.
   *
   * This method differs from the generic `runEffects` method in that it
   * continues to run computed effects based on the output of each pass until
   * there are no more newly computed properties.  This ensures that all
   * properties that will be computed by the initial set of changes are
   * computed before other effects (binding propagation, observers, and notify)
   * run.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {!Object} changedProps Bag of changed properties
   * @param {!Object} oldProps Bag of previous values for changed properties
   * @param {boolean} hasPaths True with `props` contains one or more paths
   * @return {void}
   * @private
   */
  function runComputedEffects(inst, changedProps, oldProps, hasPaths) {
    var computeEffects = inst[TYPES.COMPUTE];
    if (computeEffects) {
      var inputProps = changedProps;
      while (runEffects(inst, computeEffects, inputProps, oldProps, hasPaths)) {
        Object.assign(oldProps, inst.__dataOld);
        Object.assign(changedProps, inst.__dataPending);
        inputProps = inst.__dataPending;
        inst.__dataPending = null;
      }
    }
  }

  /**
   * Implements the "computed property" effect by running the method with the
   * values of the arguments specified in the `info` object and setting the
   * return value to the computed property specified.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @return {void}
   * @private
   */
  function runComputedEffect(inst, property, props, oldProps, info) {
    var result = runMethodEffect(inst, property, props, oldProps, info);
    var computedProp = info.methodInfo;
    if (inst.__dataHasAccessor && inst.__dataHasAccessor[computedProp]) {
      inst._setPendingProperty(computedProp, result, true);
    } else {
      inst[computedProp] = result;
    }
  }

  /**
   * Computes path changes based on path links set up using the `linkPaths`
   * API.
   *
   * @param {!PropertyEffectsType} inst The instance whose props are changing
   * @param {string | !Array<(string|number)>} path Path that has changed
   * @param {*} value Value of changed path
   * @return {void}
   * @private
   */
  function computeLinkedPaths(inst, path, value) {
    var links = inst.__dataLinkedPaths;
    if (links) {
      var link = void 0;
      for (var a in links) {
        var b = links[a];
        if (isDescendant(a, path)) {
          link = translate(a, b, path);
          inst._setPendingPropertyOrPath(link, value, true, true);
        } else if (isDescendant(b, path)) {
          link = translate(b, a, path);
          inst._setPendingPropertyOrPath(link, value, true, true);
        }
      }
    }
  }

  // -- bindings ----------------------------------------------

  /**
   * Adds binding metadata to the current `nodeInfo`, and binding effects
   * for all part dependencies to `templateInfo`.
   *
   * @param {Function} constructor Class that `_parseTemplate` is currently
   *   running on
   * @param {TemplateInfo} templateInfo Template metadata for current template
   * @param {NodeInfo} nodeInfo Node metadata for current template node
   * @param {string} kind Binding kind, either 'property', 'attribute', or 'text'
   * @param {string} target Target property name
   * @param {!Array<!BindingPart>} parts Array of binding part metadata
   * @param {string=} literal Literal text surrounding binding parts (specified
   *   only for 'property' bindings, since these must be initialized as part
   *   of boot-up)
   * @return {void}
   * @private
   */
  function addBinding(constructor, templateInfo, nodeInfo, kind, target, parts, literal) {
    // Create binding metadata and add to nodeInfo
    nodeInfo.bindings = nodeInfo.bindings || [];
    var /** Binding */binding = { kind: kind, target: target, parts: parts, literal: literal, isCompound: parts.length !== 1 };
    nodeInfo.bindings.push(binding);
    // Add listener info to binding metadata
    if (shouldAddListener(binding)) {
      var _binding$parts$ = binding.parts[0],
          event = _binding$parts$.event,
          negate = _binding$parts$.negate;

      binding.listenerEvent = event || CaseMap.camelToDashCase(target) + '-changed';
      binding.listenerNegate = negate;
    }
    // Add "propagate" property effects to templateInfo
    var index = templateInfo.nodeInfoList.length;
    for (var i = 0; i < binding.parts.length; i++) {
      var part = binding.parts[i];
      part.compoundIndex = i;
      addEffectForBindingPart(constructor, templateInfo, binding, part, index);
    }
  }

  /**
   * Adds property effects to the given `templateInfo` for the given binding
   * part.
   *
   * @param {Function} constructor Class that `_parseTemplate` is currently
   *   running on
   * @param {TemplateInfo} templateInfo Template metadata for current template
   * @param {!Binding} binding Binding metadata
   * @param {!BindingPart} part Binding part metadata
   * @param {number} index Index into `nodeInfoList` for this node
   * @return {void}
   */
  function addEffectForBindingPart(constructor, templateInfo, binding, part, index) {
    if (!part.literal) {
      if (binding.kind === 'attribute' && binding.target[0] === '-') {
        console.warn('Cannot set attribute ' + binding.target + ' because "-" is not a valid attribute starting character');
      } else {
        var dependencies = part.dependencies;
        var info = { index: index, binding: binding, part: part, evaluator: constructor };
        for (var j = 0; j < dependencies.length; j++) {
          var trigger = dependencies[j];
          if (typeof trigger == 'string') {
            trigger = parseArg(trigger);
            trigger.wildcard = true;
          }
          constructor._addTemplatePropertyEffect(templateInfo, trigger.rootProperty, {
            fn: runBindingEffect,
            info: info, trigger: trigger
          });
        }
      }
    }
  }

  /**
   * Implements the "binding" (property/path binding) effect.
   *
   * Note that binding syntax is overridable via `_parseBindings` and
   * `_evaluateBinding`.  This method will call `_evaluateBinding` for any
   * non-literal parts returned from `_parseBindings`.  However,
   * there is no support for _path_ bindings via custom binding parts,
   * as this is specific to Polymer's path binding syntax.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} path Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @param {boolean} hasPaths True with `props` contains one or more paths
   * @param {Array} nodeList List of nodes associated with `nodeInfoList` template
   *   metadata
   * @return {void}
   * @private
   */
  function runBindingEffect(inst, path, props, oldProps, info, hasPaths, nodeList) {
    var node = nodeList[info.index];
    var binding = info.binding;
    var part = info.part;
    // Subpath notification: transform path and set to client
    // e.g.: foo="{{obj.sub}}", path: 'obj.sub.prop', set 'foo.prop'=obj.sub.prop
    if (hasPaths && part.source && path.length > part.source.length && binding.kind == 'property' && !binding.isCompound && node.__isPropertyEffectsClient && node.__dataHasAccessor && node.__dataHasAccessor[binding.target]) {
      var value = props[path];
      path = translate(part.source, binding.target, path);
      if (node._setPendingPropertyOrPath(path, value, false, true)) {
        inst._enqueueClient(node);
      }
    } else {
      var _value = info.evaluator._evaluateBinding(inst, part, path, props, oldProps, hasPaths);
      // Propagate value to child
      applyBindingValue(inst, node, binding, part, _value);
    }
  }

  /**
   * Sets the value for an "binding" (binding) effect to a node,
   * either as a property or attribute.
   *
   * @param {!PropertyEffectsType} inst The instance owning the binding effect
   * @param {Node} node Target node for binding
   * @param {!Binding} binding Binding metadata
   * @param {!BindingPart} part Binding part metadata
   * @param {*} value Value to set
   * @return {void}
   * @private
   */
  function applyBindingValue(inst, node, binding, part, value) {
    value = computeBindingValue(node, value, binding, part);
    if (sanitizeDOMValue) {
      value = sanitizeDOMValue(value, binding.target, binding.kind, node);
    }
    if (binding.kind == 'attribute') {
      // Attribute binding
      inst._valueToNodeAttribute( /** @type {Element} */node, value, binding.target);
    } else {
      // Property binding
      var prop = binding.target;
      if (node.__isPropertyEffectsClient && node.__dataHasAccessor && node.__dataHasAccessor[prop]) {
        if (!node[TYPES.READ_ONLY] || !node[TYPES.READ_ONLY][prop]) {
          if (node._setPendingProperty(prop, value)) {
            inst._enqueueClient(node);
          }
        }
      } else {
        inst._setUnmanagedPropertyToNode(node, prop, value);
      }
    }
  }

  /**
   * Transforms an "binding" effect value based on compound & negation
   * effect metadata, as well as handling for special-case properties
   *
   * @param {Node} node Node the value will be set to
   * @param {*} value Value to set
   * @param {!Binding} binding Binding metadata
   * @param {!BindingPart} part Binding part metadata
   * @return {*} Transformed value to set
   * @private
   */
  function computeBindingValue(node, value, binding, part) {
    if (binding.isCompound) {
      var storage = node.__dataCompoundStorage[binding.target];
      storage[part.compoundIndex] = value;
      value = storage.join('');
    }
    if (binding.kind !== 'attribute') {
      // Some browsers serialize `undefined` to `"undefined"`
      if (binding.target === 'textContent' || binding.target === 'value' && (node.localName === 'input' || node.localName === 'textarea')) {
        value = value == undefined ? '' : value;
      }
    }
    return value;
  }

  /**
   * Returns true if a binding's metadata meets all the requirements to allow
   * 2-way binding, and therefore a `<property>-changed` event listener should be
   * added:
   * - used curly braces
   * - is a property (not attribute) binding
   * - is not a textContent binding
   * - is not compound
   *
   * @param {!Binding} binding Binding metadata
   * @return {boolean} True if 2-way listener should be added
   * @private
   */
  function shouldAddListener(binding) {
    return Boolean(binding.target) && binding.kind != 'attribute' && binding.kind != 'text' && !binding.isCompound && binding.parts[0].mode === '{';
  }

  /**
   * Setup compound binding storage structures, notify listeners, and dataHost
   * references onto the bound nodeList.
   *
   * @param {!PropertyEffectsType} inst Instance that bas been previously bound
   * @param {TemplateInfo} templateInfo Template metadata
   * @return {void}
   * @private
   */
  function setupBindings(inst, templateInfo) {
    // Setup compound storage, dataHost, and notify listeners
    var nodeList = templateInfo.nodeList,
        nodeInfoList = templateInfo.nodeInfoList;

    if (nodeInfoList.length) {
      for (var i = 0; i < nodeInfoList.length; i++) {
        var info = nodeInfoList[i];
        var node = nodeList[i];
        var bindings = info.bindings;
        if (bindings) {
          for (var _i = 0; _i < bindings.length; _i++) {
            var binding = bindings[_i];
            setupCompoundStorage(node, binding);
            addNotifyListener(node, inst, binding);
          }
        }
        node.__dataHost = inst;
      }
    }
  }

  /**
   * Initializes `__dataCompoundStorage` local storage on a bound node with
   * initial literal data for compound bindings, and sets the joined
   * literal parts to the bound property.
   *
   * When changes to compound parts occur, they are first set into the compound
   * storage array for that property, and then the array is joined to result in
   * the final value set to the property/attribute.
   *
   * @param {Node} node Bound node to initialize
   * @param {Binding} binding Binding metadata
   * @return {void}
   * @private
   */
  function setupCompoundStorage(node, binding) {
    if (binding.isCompound) {
      // Create compound storage map
      var storage = node.__dataCompoundStorage || (node.__dataCompoundStorage = {});
      var parts = binding.parts;
      // Copy literals from parts into storage for this binding
      var literals = new Array(parts.length);
      for (var j = 0; j < parts.length; j++) {
        literals[j] = parts[j].literal;
      }
      var target = binding.target;
      storage[target] = literals;
      // Configure properties with their literal parts
      if (binding.literal && binding.kind == 'property') {
        node[target] = binding.literal;
      }
    }
  }

  /**
   * Adds a 2-way binding notification event listener to the node specified
   *
   * @param {Object} node Child element to add listener to
   * @param {!PropertyEffectsType} inst Host element instance to handle notification event
   * @param {Binding} binding Binding metadata
   * @return {void}
   * @private
   */
  function addNotifyListener(node, inst, binding) {
    if (binding.listenerEvent) {
      var part = binding.parts[0];
      node.addEventListener(binding.listenerEvent, function (e) {
        handleNotification(e, inst, binding.target, part.source, part.negate);
      });
    }
  }

  // -- for method-based effects (complexObserver & computed) --------------

  /**
   * Adds property effects for each argument in the method signature (and
   * optionally, for the method name if `dynamic` is true) that calls the
   * provided effect function.
   *
   * @param {Element | Object} model Prototype or instance
   * @param {!MethodSignature} sig Method signature metadata
   * @param {string} type Type of property effect to add
   * @param {Function} effectFn Function to run when arguments change
   * @param {*=} methodInfo Effect-specific information to be included in
   *   method effect metadata
   * @param {boolean|Object=} dynamicFn Boolean or object map indicating whether
   *   method names should be included as a dependency to the effect. Note,
   *   defaults to true if the signature is static (sig.static is true).
   * @return {void}
   * @private
   */
  function createMethodEffect(model, sig, type, effectFn, methodInfo, dynamicFn) {
    dynamicFn = sig.static || dynamicFn && ((typeof dynamicFn === 'undefined' ? 'undefined' : _typeof(dynamicFn)) !== 'object' || dynamicFn[sig.methodName]);
    var info = {
      methodName: sig.methodName,
      args: sig.args,
      methodInfo: methodInfo,
      dynamicFn: dynamicFn
    };
    for (var i = 0, arg; i < sig.args.length && (arg = sig.args[i]); i++) {
      if (!arg.literal) {
        model._addPropertyEffect(arg.rootProperty, type, {
          fn: effectFn, info: info, trigger: arg
        });
      }
    }
    if (dynamicFn) {
      model._addPropertyEffect(sig.methodName, type, {
        fn: effectFn, info: info
      });
    }
  }

  /**
   * Calls a method with arguments marshaled from properties on the instance
   * based on the method signature contained in the effect metadata.
   *
   * Multi-property observers, computed properties, and inline computing
   * functions call this function to invoke the method, then use the return
   * value accordingly.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @return {*} Returns the return value from the method invocation
   * @private
   */
  function runMethodEffect(inst, property, props, oldProps, info) {
    // Instances can optionally have a _methodHost which allows redirecting where
    // to find methods. Currently used by `templatize`.
    var context = inst._methodHost || inst;
    var fn = context[info.methodName];
    if (fn) {
      var args = marshalArgs(inst.__data, info.args, property, props);
      return fn.apply(context, args);
    } else if (!info.dynamicFn) {
      console.warn('method `' + info.methodName + '` not defined');
    }
  }

  var emptyArray = [];

  // Regular expressions used for binding
  var IDENT = '(?:' + '[a-zA-Z_$][\\w.:$\\-*]*' + ')';
  var NUMBER = '(?:' + '[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?' + ')';
  var SQUOTE_STRING = '(?:' + '\'(?:[^\'\\\\]|\\\\.)*\'' + ')';
  var DQUOTE_STRING = '(?:' + '"(?:[^"\\\\]|\\\\.)*"' + ')';
  var STRING = '(?:' + SQUOTE_STRING + '|' + DQUOTE_STRING + ')';
  var ARGUMENT = '(?:(' + IDENT + '|' + NUMBER + '|' + STRING + ')\\s*' + ')';
  var ARGUMENTS = '(?:' + ARGUMENT + '(?:,\\s*' + ARGUMENT + ')*' + ')';
  var ARGUMENT_LIST = '(?:' + '\\(\\s*' + '(?:' + ARGUMENTS + '?' + ')' + '\\)\\s*' + ')';
  var BINDING = '(' + IDENT + '\\s*' + ARGUMENT_LIST + '?' + ')'; // Group 3
  var OPEN_BRACKET = '(\\[\\[|{{)' + '\\s*';
  var CLOSE_BRACKET = '(?:]]|}})';
  var NEGATE = '(?:(!)\\s*)?'; // Group 2
  var EXPRESSION = OPEN_BRACKET + NEGATE + BINDING + CLOSE_BRACKET;
  var bindingRegex = new RegExp(EXPRESSION, "g");

  /**
   * Create a string from binding parts of all the literal parts
   *
   * @param {!Array<BindingPart>} parts All parts to stringify
   * @return {string} String made from the literal parts
   */
  function literalFromParts(parts) {
    var s = '';
    for (var i = 0; i < parts.length; i++) {
      var literal = parts[i].literal;
      s += literal || '';
    }
    return s;
  }

  /**
   * Parses an expression string for a method signature, and returns a metadata
   * describing the method in terms of `methodName`, `static` (whether all the
   * arguments are literals), and an array of `args`
   *
   * @param {string} expression The expression to parse
   * @return {?MethodSignature} The method metadata object if a method expression was
   *   found, otherwise `undefined`
   * @private
   */
  function parseMethod(expression) {
    // tries to match valid javascript property names
    var m = expression.match(/([^\s]+?)\(([\s\S]*)\)/);
    if (m) {
      var methodName = m[1];
      var sig = { methodName: methodName, static: true, args: emptyArray };
      if (m[2].trim()) {
        // replace escaped commas with comma entity, split on un-escaped commas
        var args = m[2].replace(/\\,/g, '&comma;').split(',');
        return parseArgs(args, sig);
      } else {
        return sig;
      }
    }
    return null;
  }

  /**
   * Parses an array of arguments and sets the `args` property of the supplied
   * signature metadata object. Sets the `static` property to false if any
   * argument is a non-literal.
   *
   * @param {!Array<string>} argList Array of argument names
   * @param {!MethodSignature} sig Method signature metadata object
   * @return {!MethodSignature} The updated signature metadata object
   * @private
   */
  function parseArgs(argList, sig) {
    sig.args = argList.map(function (rawArg) {
      var arg = parseArg(rawArg);
      if (!arg.literal) {
        sig.static = false;
      }
      return arg;
    }, this);
    return sig;
  }

  /**
   * Parses an individual argument, and returns an argument metadata object
   * with the following fields:
   *
   *   {
   *     value: 'prop',        // property/path or literal value
   *     literal: false,       // whether argument is a literal
   *     structured: false,    // whether the property is a path
   *     rootProperty: 'prop', // the root property of the path
   *     wildcard: false       // whether the argument was a wildcard '.*' path
   *   }
   *
   * @param {string} rawArg The string value of the argument
   * @return {!MethodArg} Argument metadata object
   * @private
   */
  function parseArg(rawArg) {
    // clean up whitespace
    var arg = rawArg.trim()
    // replace comma entity with comma
    .replace(/&comma;/g, ',')
    // repair extra escape sequences; note only commas strictly need
    // escaping, but we allow any other char to be escaped since its
    // likely users will do this
    .replace(/\\(.)/g, '\$1');
    // basic argument descriptor
    var a = {
      name: arg,
      value: '',
      literal: false
    };
    // detect literal value (must be String or Number)
    var fc = arg[0];
    if (fc === '-') {
      fc = arg[1];
    }
    if (fc >= '0' && fc <= '9') {
      fc = '#';
    }
    switch (fc) {
      case "'":
      case '"':
        a.value = arg.slice(1, -1);
        a.literal = true;
        break;
      case '#':
        a.value = Number(arg);
        a.literal = true;
        break;
    }
    // if not literal, look for structured path
    if (!a.literal) {
      a.rootProperty = root(arg);
      // detect structured path (has dots)
      a.structured = isPath(arg);
      if (a.structured) {
        a.wildcard = arg.slice(-2) == '.*';
        if (a.wildcard) {
          a.name = arg.slice(0, -2);
        }
      }
    }
    return a;
  }

  /**
   * Gather the argument values for a method specified in the provided array
   * of argument metadata.
   *
   * The `path` and `value` arguments are used to fill in wildcard descriptor
   * when the method is being called as a result of a path notification.
   *
   * @param {Object} data Instance data storage object to read properties from
   * @param {!Array<!MethodArg>} args Array of argument metadata
   * @param {string} path Property/path name that triggered the method effect
   * @param {Object} props Bag of current property changes
   * @return {Array<*>} Array of argument values
   * @private
   */
  function marshalArgs(data, args, path, props) {
    var values = [];
    for (var i = 0, l = args.length; i < l; i++) {
      var arg = args[i];
      var name = arg.name;
      var v = void 0;
      if (arg.literal) {
        v = arg.value;
      } else {
        if (arg.structured) {
          v = get$1(data, name);
          // when data is not stored e.g. `splices`
          if (v === undefined) {
            v = props[name];
          }
        } else {
          v = data[name];
        }
      }
      if (arg.wildcard) {
        // Only send the actual path changed info if the change that
        // caused the observer to run matched the wildcard
        var baseChanged = name.indexOf(path + '.') === 0;
        var matches$$1 = path.indexOf(name) === 0 && !baseChanged;
        values[i] = {
          path: matches$$1 ? path : name,
          value: matches$$1 ? props[path] : v,
          base: v
        };
      } else {
        values[i] = v;
      }
    }
    return values;
  }

  // data api

  /**
   * Sends array splice notifications (`.splices` and `.length`)
   *
   * Note: this implementation only accepts normalized paths
   *
   * @param {!PropertyEffectsType} inst Instance to send notifications to
   * @param {Array} array The array the mutations occurred on
   * @param {string} path The path to the array that was mutated
   * @param {Array} splices Array of splice records
   * @return {void}
   * @private
   */
  function _notifySplices(inst, array, path, splices) {
    var splicesPath = path + '.splices';
    inst.notifyPath(splicesPath, { indexSplices: splices });
    inst.notifyPath(path + '.length', array.length);
    // Null here to allow potentially large splice records to be GC'ed.
    inst.__data[splicesPath] = { indexSplices: null };
  }

  /**
   * Creates a splice record and sends an array splice notification for
   * the described mutation
   *
   * Note: this implementation only accepts normalized paths
   *
   * @param {!PropertyEffectsType} inst Instance to send notifications to
   * @param {Array} array The array the mutations occurred on
   * @param {string} path The path to the array that was mutated
   * @param {number} index Index at which the array mutation occurred
   * @param {number} addedCount Number of added items
   * @param {Array} removed Array of removed items
   * @return {void}
   * @private
   */
  function notifySplice(inst, array, path, index, addedCount, removed) {
    _notifySplices(inst, array, path, [{
      index: index,
      addedCount: addedCount,
      removed: removed,
      object: array,
      type: 'splice'
    }]);
  }

  /**
   * Returns an upper-cased version of the string.
   *
   * @param {string} name String to uppercase
   * @return {string} Uppercased string
   * @private
   */
  function upper(name) {
    return name[0].toUpperCase() + name.substring(1);
  }

  /**
   * Element class mixin that provides meta-programming for Polymer's template
   * binding and data observation (collectively, "property effects") system.
   *
   * This mixin uses provides the following key static methods for adding
   * property effects to an element class:
   * - `addPropertyEffect`
   * - `createPropertyObserver`
   * - `createMethodObserver`
   * - `createNotifyingProperty`
   * - `createReadOnlyProperty`
   * - `createReflectedProperty`
   * - `createComputedProperty`
   * - `bindTemplate`
   *
   * Each method creates one or more property accessors, along with metadata
   * used by this mixin's implementation of `_propertiesChanged` to perform
   * the property effects.
   *
   * Underscored versions of the above methods also exist on the element
   * prototype for adding property effects on instances at runtime.
   *
   * Note that this mixin overrides several `PropertyAccessors` methods, in
   * many cases to maintain guarantees provided by the Polymer 1.x features;
   * notably it changes property accessors to be synchronous by default
   * whereas the default when using `PropertyAccessors` standalone is to be
   * async by default.
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin TemplateStamp
   * @appliesMixin PropertyAccessors
   * @summary Element class mixin that provides meta-programming for Polymer's
   * template binding and data observation system.
   */
  var PropertyEffects = dedupingMixin(function (superClass) {

    /**
     * @constructor
     * @extends {superClass}
     * @implements {Polymer_PropertyAccessors}
     * @implements {Polymer_TemplateStamp}
     * @unrestricted
     */
    var propertyEffectsBase = TemplateStamp(PropertyAccessors(superClass));

    /**
     * @polymer
     * @mixinClass
     * @implements {Polymer_PropertyEffects}
     * @extends {propertyEffectsBase}
     * @unrestricted
     */

    var PropertyEffects = function (_propertyEffectsBase) {
      inherits(PropertyEffects, _propertyEffectsBase);

      function PropertyEffects() {
        classCallCheck(this, PropertyEffects);

        /** @type {boolean} */
        // Used to identify users of this mixin, ala instanceof
        var _this = possibleConstructorReturn(this, (PropertyEffects.__proto__ || Object.getPrototypeOf(PropertyEffects)).call(this));

        _this.__isPropertyEffectsClient = true;
        /** @type {number} */
        // NOTE: used to track re-entrant calls to `_flushProperties`
        // path changes dirty check against `__dataTemp` only during one "turn"
        // and are cleared when `__dataCounter` returns to 0.
        _this.__dataCounter = 0;
        /** @type {boolean} */
        _this.__dataClientsReady;
        /** @type {Array} */
        _this.__dataPendingClients;
        /** @type {Object} */
        _this.__dataToNotify;
        /** @type {Object} */
        _this.__dataLinkedPaths;
        /** @type {boolean} */
        _this.__dataHasPaths;
        /** @type {Object} */
        _this.__dataCompoundStorage;
        /** @type {Polymer_PropertyEffects} */
        _this.__dataHost;
        /** @type {!Object} */
        _this.__dataTemp;
        /** @type {boolean} */
        _this.__dataClientsInitialized;
        /** @type {!Object} */
        _this.__data;
        /** @type {!Object} */
        _this.__dataPending;
        /** @type {!Object} */
        _this.__dataOld;
        /** @type {Object} */
        _this.__computeEffects;
        /** @type {Object} */
        _this.__reflectEffects;
        /** @type {Object} */
        _this.__notifyEffects;
        /** @type {Object} */
        _this.__propagateEffects;
        /** @type {Object} */
        _this.__observeEffects;
        /** @type {Object} */
        _this.__readOnly;
        /** @type {!TemplateInfo} */
        _this.__templateInfo;
        return _this;
      }

      createClass(PropertyEffects, [{
        key: '_initializeProperties',


        /**
         * @return {void}
         */
        value: function _initializeProperties() {
          get(PropertyEffects.prototype.__proto__ || Object.getPrototypeOf(PropertyEffects.prototype), '_initializeProperties', this).call(this);
          hostStack.registerHost(this);
          this.__dataClientsReady = false;
          this.__dataPendingClients = null;
          this.__dataToNotify = null;
          this.__dataLinkedPaths = null;
          this.__dataHasPaths = false;
          // May be set on instance prior to upgrade
          this.__dataCompoundStorage = this.__dataCompoundStorage || null;
          this.__dataHost = this.__dataHost || null;
          this.__dataTemp = {};
          this.__dataClientsInitialized = false;
        }

        /**
         * Overrides `PropertyAccessors` implementation to provide a
         * more efficient implementation of initializing properties from
         * the prototype on the instance.
         *
         * @override
         * @param {Object} props Properties to initialize on the prototype
         * @return {void}
         */

      }, {
        key: '_initializeProtoProperties',
        value: function _initializeProtoProperties(props) {
          this.__data = Object.create(props);
          this.__dataPending = Object.create(props);
          this.__dataOld = {};
        }

        /**
         * Overrides `PropertyAccessors` implementation to avoid setting
         * `_setProperty`'s `shouldNotify: true`.
         *
         * @override
         * @param {Object} props Properties to initialize on the instance
         * @return {void}
         */

      }, {
        key: '_initializeInstanceProperties',
        value: function _initializeInstanceProperties(props) {
          var readOnly = this[TYPES.READ_ONLY];
          for (var prop in props) {
            if (!readOnly || !readOnly[prop]) {
              this.__dataPending = this.__dataPending || {};
              this.__dataOld = this.__dataOld || {};
              this.__data[prop] = this.__dataPending[prop] = props[prop];
            }
          }
        }

        // Prototype setup ----------------------------------------

        /**
         * Equivalent to static `addPropertyEffect` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property that should trigger the effect
         * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @param {Object=} effect Effect metadata object
         * @return {void}
         * @protected
         */

      }, {
        key: '_addPropertyEffect',
        value: function _addPropertyEffect(property, type, effect) {
          this._createPropertyAccessor(property, type == TYPES.READ_ONLY);
          // effects are accumulated into arrays per property based on type
          var effects = ensureOwnEffectMap(this, type)[property];
          if (!effects) {
            effects = this[type][property] = [];
          }
          effects.push(effect);
        }

        /**
         * Removes the given property effect.
         *
         * @param {string} property Property the effect was associated with
         * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @param {Object=} effect Effect metadata object to remove
         * @return {void}
         */

      }, {
        key: '_removePropertyEffect',
        value: function _removePropertyEffect(property, type, effect) {
          var effects = ensureOwnEffectMap(this, type)[property];
          var idx = effects.indexOf(effect);
          if (idx >= 0) {
            effects.splice(idx, 1);
          }
        }

        /**
         * Returns whether the current prototype/instance has a property effect
         * of a certain type.
         *
         * @param {string} property Property name
         * @param {string=} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasPropertyEffect',
        value: function _hasPropertyEffect(property, type) {
          var effects = this[type];
          return Boolean(effects && effects[property]);
        }

        /**
         * Returns whether the current prototype/instance has a "read only"
         * accessor for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasReadOnlyEffect',
        value: function _hasReadOnlyEffect(property) {
          return this._hasPropertyEffect(property, TYPES.READ_ONLY);
        }

        /**
         * Returns whether the current prototype/instance has a "notify"
         * property effect for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasNotifyEffect',
        value: function _hasNotifyEffect(property) {
          return this._hasPropertyEffect(property, TYPES.NOTIFY);
        }

        /**
         * Returns whether the current prototype/instance has a "reflect to attribute"
         * property effect for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasReflectEffect',
        value: function _hasReflectEffect(property) {
          return this._hasPropertyEffect(property, TYPES.REFLECT);
        }

        /**
         * Returns whether the current prototype/instance has a "computed"
         * property effect for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasComputedEffect',
        value: function _hasComputedEffect(property) {
          return this._hasPropertyEffect(property, TYPES.COMPUTE);
        }

        // Runtime ----------------------------------------

        /**
         * Sets a pending property or path.  If the root property of the path in
         * question had no accessor, the path is set, otherwise it is enqueued
         * via `_setPendingProperty`.
         *
         * This function isolates relatively expensive functionality necessary
         * for the public API (`set`, `setProperties`, `notifyPath`, and property
         * change listeners via {{...}} bindings), such that it is only done
         * when paths enter the system, and not at every propagation step.  It
         * also sets a `__dataHasPaths` flag on the instance which is used to
         * fast-path slower path-matching code in the property effects host paths.
         *
         * `path` can be a path string or array of path parts as accepted by the
         * public API.
         *
         * @param {string | !Array<number|string>} path Path to set
         * @param {*} value Value to set
         * @param {boolean=} shouldNotify Set to true if this change should
         *  cause a property notification event dispatch
         * @param {boolean=} isPathNotification If the path being set is a path
         *   notification of an already changed value, as opposed to a request
         *   to set and notify the change.  In the latter `false` case, a dirty
         *   check is performed and then the value is set to the path before
         *   enqueuing the pending property change.
         * @return {boolean} Returns true if the property/path was enqueued in
         *   the pending changes bag.
         * @protected
         */

      }, {
        key: '_setPendingPropertyOrPath',
        value: function _setPendingPropertyOrPath(path, value, shouldNotify, isPathNotification) {
          if (isPathNotification || root(Array.isArray(path) ? path[0] : path) !== path) {
            // Dirty check changes being set to a path against the actual object,
            // since this is the entry point for paths into the system; from here
            // the only dirty checks are against the `__dataTemp` cache to prevent
            // duplicate work in the same turn only. Note, if this was a notification
            // of a change already set to a path (isPathNotification: true),
            // we always let the change through and skip the `set` since it was
            // already dirty checked at the point of entry and the underlying
            // object has already been updated
            if (!isPathNotification) {
              var old = get$1(this, path);
              path = /** @type {string} */set$1(this, path, value);
              // Use property-accessor's simpler dirty check
              if (!path || !get(PropertyEffects.prototype.__proto__ || Object.getPrototypeOf(PropertyEffects.prototype), '_shouldPropertyChange', this).call(this, path, value, old)) {
                return false;
              }
            }
            this.__dataHasPaths = true;
            if (this._setPendingProperty( /**@type{string}*/path, value, shouldNotify)) {
              computeLinkedPaths(this, path, value);
              return true;
            }
          } else {
            if (this.__dataHasAccessor && this.__dataHasAccessor[path]) {
              return this._setPendingProperty( /**@type{string}*/path, value, shouldNotify);
            } else {
              this[path] = value;
            }
          }
          return false;
        }

        /**
         * Applies a value to a non-Polymer element/node's property.
         *
         * The implementation makes a best-effort at binding interop:
         * Some native element properties have side-effects when
         * re-setting the same value (e.g. setting `<input>.value` resets the
         * cursor position), so we do a dirty-check before setting the value.
         * However, for better interop with non-Polymer custom elements that
         * accept objects, we explicitly re-set object changes coming from the
         * Polymer world (which may include deep object changes without the
         * top reference changing), erring on the side of providing more
         * information.
         *
         * Users may override this method to provide alternate approaches.
         *
         * @param {!Node} node The node to set a property on
         * @param {string} prop The property to set
         * @param {*} value The value to set
         * @return {void}
         * @protected
         */

      }, {
        key: '_setUnmanagedPropertyToNode',
        value: function _setUnmanagedPropertyToNode(node, prop, value) {
          // It is a judgment call that resetting primitives is
          // "bad" and resettings objects is also "good"; alternatively we could
          // implement a whitelist of tag & property values that should never
          // be reset (e.g. <input>.value && <select>.value)
          if (value !== node[prop] || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
            node[prop] = value;
          }
        }

        /**
         * Overrides the `PropertiesChanged` implementation to introduce special
         * dirty check logic depending on the property & value being set:
         *
         * 1. Any value set to a path (e.g. 'obj.prop': 42 or 'obj.prop': {...})
         *    Stored in `__dataTemp`, dirty checked against `__dataTemp`
         * 2. Object set to simple property (e.g. 'prop': {...})
         *    Stored in `__dataTemp` and `__data`, dirty checked against
         *    `__dataTemp` by default implementation of `_shouldPropertyChange`
         * 3. Primitive value set to simple property (e.g. 'prop': 42)
         *    Stored in `__data`, dirty checked against `__data`
         *
         * The dirty-check is important to prevent cycles due to two-way
         * notification, but paths and objects are only dirty checked against any
         * previous value set during this turn via a "temporary cache" that is
         * cleared when the last `_propertiesChanged` exits. This is so:
         * a. any cached array paths (e.g. 'array.3.prop') may be invalidated
         *    due to array mutations like shift/unshift/splice; this is fine
         *    since path changes are dirty-checked at user entry points like `set`
         * b. dirty-checking for objects only lasts one turn to allow the user
         *    to mutate the object in-place and re-set it with the same identity
         *    and have all sub-properties re-propagated in a subsequent turn.
         *
         * The temp cache is not necessarily sufficient to prevent invalid array
         * paths, since a splice can happen during the same turn (with pathological
         * user code); we could introduce a "fixup" for temporarily cached array
         * paths if needed: https://github.com/Polymer/polymer/issues/4227
         *
         * @override
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @param {boolean=} shouldNotify True if property should fire notification
         *   event (applies only for `notify: true` properties)
         * @return {boolean} Returns true if the property changed
         */

      }, {
        key: '_setPendingProperty',
        value: function _setPendingProperty(property, value, shouldNotify) {
          var isPath$$1 = this.__dataHasPaths && isPath(property);
          var prevProps = isPath$$1 ? this.__dataTemp : this.__data;
          if (this._shouldPropertyChange(property, value, prevProps[property])) {
            if (!this.__dataPending) {
              this.__dataPending = {};
              this.__dataOld = {};
            }
            // Ensure old is captured from the last turn
            if (!(property in this.__dataOld)) {
              this.__dataOld[property] = this.__data[property];
            }
            // Paths are stored in temporary cache (cleared at end of turn),
            // which is used for dirty-checking, all others stored in __data
            if (isPath$$1) {
              this.__dataTemp[property] = value;
            } else {
              this.__data[property] = value;
            }
            // All changes go into pending property bag, passed to _propertiesChanged
            this.__dataPending[property] = value;
            // Track properties that should notify separately
            if (isPath$$1 || this[TYPES.NOTIFY] && this[TYPES.NOTIFY][property]) {
              this.__dataToNotify = this.__dataToNotify || {};
              this.__dataToNotify[property] = shouldNotify;
            }
            return true;
          }
          return false;
        }

        /**
         * Overrides base implementation to ensure all accessors set `shouldNotify`
         * to true, for per-property notification tracking.
         *
         * @override
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @return {void}
         */

      }, {
        key: '_setProperty',
        value: function _setProperty(property, value) {
          if (this._setPendingProperty(property, value, true)) {
            this._invalidateProperties();
          }
        }

        /**
         * Overrides `PropertyAccessor`'s default async queuing of
         * `_propertiesChanged`: if `__dataReady` is false (has not yet been
         * manually flushed), the function no-ops; otherwise flushes
         * `_propertiesChanged` synchronously.
         *
         * @override
         * @return {void}
         */

      }, {
        key: '_invalidateProperties',
        value: function _invalidateProperties() {
          if (this.__dataReady) {
            this._flushProperties();
          }
        }

        /**
         * Enqueues the given client on a list of pending clients, whose
         * pending property changes can later be flushed via a call to
         * `_flushClients`.
         *
         * @param {Object} client PropertyEffects client to enqueue
         * @return {void}
         * @protected
         */

      }, {
        key: '_enqueueClient',
        value: function _enqueueClient(client) {
          this.__dataPendingClients = this.__dataPendingClients || [];
          if (client !== this) {
            this.__dataPendingClients.push(client);
          }
        }

        /**
         * Overrides superclass implementation.
         *
         * @return {void}
         * @protected
         */

      }, {
        key: '_flushProperties',
        value: function _flushProperties() {
          this.__dataCounter++;
          get(PropertyEffects.prototype.__proto__ || Object.getPrototypeOf(PropertyEffects.prototype), '_flushProperties', this).call(this);
          this.__dataCounter--;
        }

        /**
         * Flushes any clients previously enqueued via `_enqueueClient`, causing
         * their `_flushProperties` method to run.
         *
         * @return {void}
         * @protected
         */

      }, {
        key: '_flushClients',
        value: function _flushClients() {
          if (!this.__dataClientsReady) {
            this.__dataClientsReady = true;
            this._readyClients();
            // Override point where accessors are turned on; importantly,
            // this is after clients have fully readied, providing a guarantee
            // that any property effects occur only after all clients are ready.
            this.__dataReady = true;
          } else {
            this.__enableOrFlushClients();
          }
        }

        // NOTE: We ensure clients either enable or flush as appropriate. This
        // handles two corner cases:
        // (1) clients flush properly when connected/enabled before the host
        // enables; e.g.
        //   (a) Templatize stamps with no properties and does not flush and
        //   (b) the instance is inserted into dom and
        //   (c) then the instance flushes.
        // (2) clients enable properly when not connected/enabled when the host
        // flushes; e.g.
        //   (a) a template is runtime stamped and not yet connected/enabled
        //   (b) a host sets a property, causing stamped dom to flush
        //   (c) the stamped dom enables.

      }, {
        key: '__enableOrFlushClients',
        value: function __enableOrFlushClients() {
          var clients = this.__dataPendingClients;
          if (clients) {
            this.__dataPendingClients = null;
            for (var i = 0; i < clients.length; i++) {
              var client = clients[i];
              if (!client.__dataEnabled) {
                client._enableProperties();
              } else if (client.__dataPending) {
                client._flushProperties();
              }
            }
          }
        }

        /**
         * Perform any initial setup on client dom. Called before the first
         * `_flushProperties` call on client dom and before any element
         * observers are called.
         *
         * @return {void}
         * @protected
         */

      }, {
        key: '_readyClients',
        value: function _readyClients() {
          this.__enableOrFlushClients();
        }

        /**
         * Sets a bag of property changes to this instance, and
         * synchronously processes all effects of the properties as a batch.
         *
         * Property names must be simple properties, not paths.  Batched
         * path propagation is not supported.
         *
         * @param {Object} props Bag of one or more key-value pairs whose key is
         *   a property and value is the new value to set for that property.
         * @param {boolean=} setReadOnly When true, any private values set in
         *   `props` will be set. By default, `setProperties` will not set
         *   `readOnly: true` root properties.
         * @return {void}
         * @public
         */

      }, {
        key: 'setProperties',
        value: function setProperties(props, setReadOnly) {
          for (var path in props) {
            if (setReadOnly || !this[TYPES.READ_ONLY] || !this[TYPES.READ_ONLY][path]) {
              //TODO(kschaaf): explicitly disallow paths in setProperty?
              // wildcard observers currently only pass the first changed path
              // in the `info` object, and you could do some odd things batching
              // paths, e.g. {'foo.bar': {...}, 'foo': null}
              this._setPendingPropertyOrPath(path, props[path], true);
            }
          }
          this._invalidateProperties();
        }

        /**
         * Overrides `PropertyAccessors` so that property accessor
         * side effects are not enabled until after client dom is fully ready.
         * Also calls `_flushClients` callback to ensure client dom is enabled
         * that was not enabled as a result of flushing properties.
         *
         * @override
         * @return {void}
         */

      }, {
        key: 'ready',
        value: function ready() {
          // It is important that `super.ready()` is not called here as it
          // immediately turns on accessors. Instead, we wait until `readyClients`
          // to enable accessors to provide a guarantee that clients are ready
          // before processing any accessors side effects.
          this._flushProperties();
          // If no data was pending, `_flushProperties` will not `flushClients`
          // so ensure this is done.
          if (!this.__dataClientsReady) {
            this._flushClients();
          }
          // Before ready, client notifications do not trigger _flushProperties.
          // Therefore a flush is necessary here if data has been set.
          if (this.__dataPending) {
            this._flushProperties();
          }
        }

        /**
         * Implements `PropertyAccessors`'s properties changed callback.
         *
         * Runs each class of effects for the batch of changed properties in
         * a specific order (compute, propagate, reflect, observe, notify).
         *
         * @param {!Object} currentProps Bag of all current accessor values
         * @param {!Object} changedProps Bag of properties changed since the last
         *   call to `_propertiesChanged`
         * @param {!Object} oldProps Bag of previous values for each property
         *   in `changedProps`
         * @return {void}
         */

      }, {
        key: '_propertiesChanged',
        value: function _propertiesChanged(currentProps, changedProps, oldProps) {
          // ----------------------------
          // let c = Object.getOwnPropertyNames(changedProps || {});
          // window.debug && console.group(this.localName + '#' + this.id + ': ' + c);
          // if (window.debug) { debugger; }
          // ----------------------------
          var hasPaths = this.__dataHasPaths;
          this.__dataHasPaths = false;
          // Compute properties
          runComputedEffects(this, changedProps, oldProps, hasPaths);
          // Clear notify properties prior to possible reentry (propagate, observe),
          // but after computing effects have a chance to add to them
          var notifyProps = this.__dataToNotify;
          this.__dataToNotify = null;
          // Propagate properties to clients
          this._propagatePropertyChanges(changedProps, oldProps, hasPaths);
          // Flush clients
          this._flushClients();
          // Reflect properties
          runEffects(this, this[TYPES.REFLECT], changedProps, oldProps, hasPaths);
          // Observe properties
          runEffects(this, this[TYPES.OBSERVE], changedProps, oldProps, hasPaths);
          // Notify properties to host
          if (notifyProps) {
            runNotifyEffects(this, notifyProps, changedProps, oldProps, hasPaths);
          }
          // Clear temporary cache at end of turn
          if (this.__dataCounter == 1) {
            this.__dataTemp = {};
          }
          // ----------------------------
          // window.debug && console.groupEnd(this.localName + '#' + this.id + ': ' + c);
          // ----------------------------
        }

        /**
         * Called to propagate any property changes to stamped template nodes
         * managed by this element.
         *
         * @param {Object} changedProps Bag of changed properties
         * @param {Object} oldProps Bag of previous values for changed properties
         * @param {boolean} hasPaths True with `props` contains one or more paths
         * @return {void}
         * @protected
         */

      }, {
        key: '_propagatePropertyChanges',
        value: function _propagatePropertyChanges(changedProps, oldProps, hasPaths) {
          if (this[TYPES.PROPAGATE]) {
            runEffects(this, this[TYPES.PROPAGATE], changedProps, oldProps, hasPaths);
          }
          var templateInfo = this.__templateInfo;
          while (templateInfo) {
            runEffects(this, templateInfo.propertyEffects, changedProps, oldProps, hasPaths, templateInfo.nodeList);
            templateInfo = templateInfo.nextTemplateInfo;
          }
        }

        /**
         * Aliases one data path as another, such that path notifications from one
         * are routed to the other.
         *
         * @param {string | !Array<string|number>} to Target path to link.
         * @param {string | !Array<string|number>} from Source path to link.
         * @return {void}
         * @public
         */

      }, {
        key: 'linkPaths',
        value: function linkPaths(to, from) {
          to = normalize(to);
          from = normalize(from);
          this.__dataLinkedPaths = this.__dataLinkedPaths || {};
          this.__dataLinkedPaths[to] = from;
        }

        /**
         * Removes a data path alias previously established with `_linkPaths`.
         *
         * Note, the path to unlink should be the target (`to`) used when
         * linking the paths.
         *
         * @param {string | !Array<string|number>} path Target path to unlink.
         * @return {void}
         * @public
         */

      }, {
        key: 'unlinkPaths',
        value: function unlinkPaths(path) {
          path = normalize(path);
          if (this.__dataLinkedPaths) {
            delete this.__dataLinkedPaths[path];
          }
        }

        /**
         * Notify that an array has changed.
         *
         * Example:
         *
         *     this.items = [ {name: 'Jim'}, {name: 'Todd'}, {name: 'Bill'} ];
         *     ...
         *     this.items.splice(1, 1, {name: 'Sam'});
         *     this.items.push({name: 'Bob'});
         *     this.notifySplices('items', [
         *       { index: 1, removed: [{name: 'Todd'}], addedCount: 1, object: this.items, type: 'splice' },
         *       { index: 3, removed: [], addedCount: 1, object: this.items, type: 'splice'}
         *     ]);
         *
         * @param {string} path Path that should be notified.
         * @param {Array} splices Array of splice records indicating ordered
         *   changes that occurred to the array. Each record should have the
         *   following fields:
         *    * index: index at which the change occurred
         *    * removed: array of items that were removed from this index
         *    * addedCount: number of new items added at this index
         *    * object: a reference to the array in question
         *    * type: the string literal 'splice'
         *
         *   Note that splice records _must_ be normalized such that they are
         *   reported in index order (raw results from `Object.observe` are not
         *   ordered and must be normalized/merged before notifying).
         * @return {void}
         * @public
        */

      }, {
        key: 'notifySplices',
        value: function notifySplices(path, splices) {
          var info = { path: '' };
          var array = /** @type {Array} */get$1(this, path, info);
          _notifySplices(this, array, info.path, splices);
        }

        /**
         * Convenience method for reading a value from a path.
         *
         * Note, if any part in the path is undefined, this method returns
         * `undefined` (this method does not throw when dereferencing undefined
         * paths).
         *
         * @param {(string|!Array<(string|number)>)} path Path to the value
         *   to read.  The path may be specified as a string (e.g. `foo.bar.baz`)
         *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
         *   bracketed expressions are not supported; string-based path parts
         *   *must* be separated by dots.  Note that when dereferencing array
         *   indices, the index may be used as a dotted part directly
         *   (e.g. `users.12.name` or `['users', 12, 'name']`).
         * @param {Object=} root Root object from which the path is evaluated.
         * @return {*} Value at the path, or `undefined` if any part of the path
         *   is undefined.
         * @public
         */

      }, {
        key: 'get',
        value: function get$$1(path, root$$1) {
          return get$1(root$$1 || this, path);
        }

        /**
         * Convenience method for setting a value to a path and notifying any
         * elements bound to the same path.
         *
         * Note, if any part in the path except for the last is undefined,
         * this method does nothing (this method does not throw when
         * dereferencing undefined paths).
         *
         * @param {(string|!Array<(string|number)>)} path Path to the value
         *   to write.  The path may be specified as a string (e.g. `'foo.bar.baz'`)
         *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
         *   bracketed expressions are not supported; string-based path parts
         *   *must* be separated by dots.  Note that when dereferencing array
         *   indices, the index may be used as a dotted part directly
         *   (e.g. `'users.12.name'` or `['users', 12, 'name']`).
         * @param {*} value Value to set at the specified path.
         * @param {Object=} root Root object from which the path is evaluated.
         *   When specified, no notification will occur.
         * @return {void}
         * @public
        */

      }, {
        key: 'set',
        value: function set$$1(path, value, root$$1) {
          if (root$$1) {
            set$1(root$$1, path, value);
          } else {
            if (!this[TYPES.READ_ONLY] || !this[TYPES.READ_ONLY][/** @type {string} */path]) {
              if (this._setPendingPropertyOrPath(path, value, true)) {
                this._invalidateProperties();
              }
            }
          }
        }

        /**
         * Adds items onto the end of the array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.push`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @param {...*} items Items to push onto array
         * @return {number} New length of the array.
         * @public
         */

      }, {
        key: 'push',
        value: function push(path) {
          var info = { path: '' };
          var array = /** @type {Array}*/get$1(this, path, info);
          var len = array.length;

          for (var _len = arguments.length, items = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            items[_key - 1] = arguments[_key];
          }

          var ret = array.push.apply(array, items);
          if (items.length) {
            notifySplice(this, array, info.path, len, items.length, []);
          }
          return ret;
        }

        /**
         * Removes an item from the end of array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.pop`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @return {*} Item that was removed.
         * @public
         */

      }, {
        key: 'pop',
        value: function pop(path) {
          var info = { path: '' };
          var array = /** @type {Array} */get$1(this, path, info);
          var hadLength = Boolean(array.length);
          var ret = array.pop();
          if (hadLength) {
            notifySplice(this, array, info.path, array.length, 0, [ret]);
          }
          return ret;
        }

        /**
         * Starting from the start index specified, removes 0 or more items
         * from the array and inserts 0 or more new items in their place.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.splice`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @param {number} start Index from which to start removing/inserting.
         * @param {number} deleteCount Number of items to remove.
         * @param {...*} items Items to insert into array.
         * @return {Array} Array of removed items.
         * @public
         */

      }, {
        key: 'splice',
        value: function splice(path, start, deleteCount) {
          for (var _len2 = arguments.length, items = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
            items[_key2 - 3] = arguments[_key2];
          }

          var info = { path: '' };
          var array = /** @type {Array} */get$1(this, path, info);
          // Normalize fancy native splice handling of crazy start values
          if (start < 0) {
            start = array.length - Math.floor(-start);
          } else if (start) {
            start = Math.floor(start);
          }
          // array.splice does different things based on the number of arguments
          // you pass in. Therefore, array.splice(0) and array.splice(0, undefined)
          // do different things. In the former, the whole array is cleared. In the
          // latter, no items are removed.
          // This means that we need to detect whether 1. one of the arguments
          // is actually passed in and then 2. determine how many arguments
          // we should pass on to the native array.splice
          //
          var ret = void 0;
          // Omit any additional arguments if they were not passed in
          if (arguments.length === 2) {
            ret = array.splice(start);
            // Either start was undefined and the others were defined, but in this
            // case we can safely pass on all arguments
            //
            // Note: this includes the case where none of the arguments were passed in,
            // e.g. this.splice('array'). However, if both start and deleteCount
            // are undefined, array.splice will not modify the array (as expected)
          } else {
            ret = array.splice.apply(array, [start, deleteCount].concat(items));
          }
          // At the end, check whether any items were passed in (e.g. insertions)
          // or if the return array contains items (e.g. deletions).
          // Only notify if items were added or deleted.
          if (items.length || ret.length) {
            notifySplice(this, array, info.path, start, items.length, ret);
          }
          return ret;
        }

        /**
         * Removes an item from the beginning of array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.pop`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @return {*} Item that was removed.
         * @public
         */

      }, {
        key: 'shift',
        value: function shift(path) {
          var info = { path: '' };
          var array = /** @type {Array} */get$1(this, path, info);
          var hadLength = Boolean(array.length);
          var ret = array.shift();
          if (hadLength) {
            notifySplice(this, array, info.path, 0, 0, [ret]);
          }
          return ret;
        }

        /**
         * Adds items onto the beginning of the array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.push`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @param {...*} items Items to insert info array
         * @return {number} New length of the array.
         * @public
         */

      }, {
        key: 'unshift',
        value: function unshift(path) {
          var info = { path: '' };
          var array = /** @type {Array} */get$1(this, path, info);

          for (var _len3 = arguments.length, items = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            items[_key3 - 1] = arguments[_key3];
          }

          var ret = array.unshift.apply(array, items);
          if (items.length) {
            notifySplice(this, array, info.path, 0, items.length, []);
          }
          return ret;
        }

        /**
         * Notify that a path has changed.
         *
         * Example:
         *
         *     this.item.user.name = 'Bob';
         *     this.notifyPath('item.user.name');
         *
         * @param {string} path Path that should be notified.
         * @param {*=} value Value at the path (optional).
         * @return {void}
         * @public
        */

      }, {
        key: 'notifyPath',
        value: function notifyPath(path, value) {
          /** @type {string} */
          var propPath = void 0;
          if (arguments.length == 1) {
            // Get value if not supplied
            var info = { path: '' };
            value = get$1(this, path, info);
            propPath = info.path;
          } else if (Array.isArray(path)) {
            // Normalize path if needed
            propPath = normalize(path);
          } else {
            propPath = /** @type{string} */path;
          }
          if (this._setPendingPropertyOrPath(propPath, value, true, true)) {
            this._invalidateProperties();
          }
        }

        /**
         * Equivalent to static `createReadOnlyProperty` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property name
         * @param {boolean=} protectedSetter Creates a custom protected setter
         *   when `true`.
         * @return {void}
         * @protected
         */

      }, {
        key: '_createReadOnlyProperty',
        value: function _createReadOnlyProperty(property, protectedSetter) {
          this._addPropertyEffect(property, TYPES.READ_ONLY);
          if (protectedSetter) {
            this['_set' + upper(property)] = /** @this {PropertyEffects} */function (value) {
              this._setProperty(property, value);
            };
          }
        }

        /**
         * Equivalent to static `createPropertyObserver` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property name
         * @param {string|function(*,*)} method Function or name of observer method to call
         * @param {boolean=} dynamicFn Whether the method name should be included as
         *   a dependency to the effect.
         * @return {void}
         * @protected
         */

      }, {
        key: '_createPropertyObserver',
        value: function _createPropertyObserver(property, method, dynamicFn) {
          var info = { property: property, method: method, dynamicFn: Boolean(dynamicFn) };
          this._addPropertyEffect(property, TYPES.OBSERVE, {
            fn: runObserverEffect, info: info, trigger: { name: property }
          });
          if (dynamicFn) {
            this._addPropertyEffect( /** @type {string} */method, TYPES.OBSERVE, {
              fn: runObserverEffect, info: info, trigger: { name: method }
            });
          }
        }

        /**
         * Equivalent to static `createMethodObserver` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} expression Method expression
         * @param {boolean|Object=} dynamicFn Boolean or object map indicating
         *   whether method names should be included as a dependency to the effect.
         * @return {void}
         * @protected
         */

      }, {
        key: '_createMethodObserver',
        value: function _createMethodObserver(expression, dynamicFn) {
          var sig = parseMethod(expression);
          if (!sig) {
            throw new Error("Malformed observer expression '" + expression + "'");
          }
          createMethodEffect(this, sig, TYPES.OBSERVE, runMethodEffect, null, dynamicFn);
        }

        /**
         * Equivalent to static `createNotifyingProperty` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property name
         * @return {void}
         * @protected
         */

      }, {
        key: '_createNotifyingProperty',
        value: function _createNotifyingProperty(property) {
          this._addPropertyEffect(property, TYPES.NOTIFY, {
            fn: runNotifyEffect,
            info: {
              eventName: CaseMap.camelToDashCase(property) + '-changed',
              property: property
            }
          });
        }

        /**
         * Equivalent to static `createReflectedProperty` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property name
         * @return {void}
         * @protected
         */

      }, {
        key: '_createReflectedProperty',
        value: function _createReflectedProperty(property) {
          var attr = this.constructor.attributeNameForProperty(property);
          if (attr[0] === '-') {
            console.warn('Property ' + property + ' cannot be reflected to attribute ' + attr + ' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.');
          } else {
            this._addPropertyEffect(property, TYPES.REFLECT, {
              fn: runReflectEffect,
              info: {
                attrName: attr
              }
            });
          }
        }

        /**
         * Equivalent to static `createComputedProperty` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Name of computed property to set
         * @param {string} expression Method expression
         * @param {boolean|Object=} dynamicFn Boolean or object map indicating
         *   whether method names should be included as a dependency to the effect.
         * @return {void}
         * @protected
         */

      }, {
        key: '_createComputedProperty',
        value: function _createComputedProperty(property, expression, dynamicFn) {
          var sig = parseMethod(expression);
          if (!sig) {
            throw new Error("Malformed computed expression '" + expression + "'");
          }
          createMethodEffect(this, sig, TYPES.COMPUTE, runComputedEffect, property, dynamicFn);
        }

        // -- static class methods ------------

        /**
         * Ensures an accessor exists for the specified property, and adds
         * to a list of "property effects" that will run when the accessor for
         * the specified property is set.  Effects are grouped by "type", which
         * roughly corresponds to a phase in effect processing.  The effect
         * metadata should be in the following form:
         *
         *     {
         *       fn: effectFunction, // Reference to function to call to perform effect
         *       info: { ... }       // Effect metadata passed to function
         *       trigger: {          // Optional triggering metadata; if not provided
         *         name: string      // the property is treated as a wildcard
         *         structured: boolean
         *         wildcard: boolean
         *       }
         *     }
         *
         * Effects are called from `_propertiesChanged` in the following order by
         * type:
         *
         * 1. COMPUTE
         * 2. PROPAGATE
         * 3. REFLECT
         * 4. OBSERVE
         * 5. NOTIFY
         *
         * Effect functions are called with the following signature:
         *
         *     effectFunction(inst, path, props, oldProps, info, hasPaths)
         *
         * @param {string} property Property that should trigger the effect
         * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @param {Object=} effect Effect metadata object
         * @return {void}
         * @protected
         */

      }, {
        key: '_bindTemplate',


        // -- binding ----------------------------------------------

        /**
         * Equivalent to static `bindTemplate` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * This method may be called on the prototype (for prototypical template
         * binding, to avoid creating accessors every instance) once per prototype,
         * and will be called with `runtimeBinding: true` by `_stampTemplate` to
         * create and link an instance of the template metadata associated with a
         * particular stamping.
         *
         * @param {!HTMLTemplateElement} template Template containing binding
         *   bindings
         * @param {boolean=} instanceBinding When false (default), performs
         *   "prototypical" binding of the template and overwrites any previously
         *   bound template for the class. When true (as passed from
         *   `_stampTemplate`), the template info is instanced and linked into
         *   the list of bound templates.
         * @return {!TemplateInfo} Template metadata object; for `runtimeBinding`,
         *   this is an instance of the prototypical template info
         * @protected
         */
        value: function _bindTemplate(template, instanceBinding) {
          var templateInfo = this.constructor._parseTemplate(template);
          var wasPreBound = this.__templateInfo == templateInfo;
          // Optimization: since this is called twice for proto-bound templates,
          // don't attempt to recreate accessors if this template was pre-bound
          if (!wasPreBound) {
            for (var prop in templateInfo.propertyEffects) {
              this._createPropertyAccessor(prop);
            }
          }
          if (instanceBinding) {
            // For instance-time binding, create instance of template metadata
            // and link into list of templates if necessary
            templateInfo = /** @type {!TemplateInfo} */Object.create(templateInfo);
            templateInfo.wasPreBound = wasPreBound;
            if (!wasPreBound && this.__templateInfo) {
              var last = this.__templateInfoLast || this.__templateInfo;
              this.__templateInfoLast = last.nextTemplateInfo = templateInfo;
              templateInfo.previousTemplateInfo = last;
              return templateInfo;
            }
          }
          return this.__templateInfo = templateInfo;
        }

        /**
         * Adds a property effect to the given template metadata, which is run
         * at the "propagate" stage of `_propertiesChanged` when the template
         * has been bound to the element via `_bindTemplate`.
         *
         * The `effect` object should match the format in `_addPropertyEffect`.
         *
         * @param {Object} templateInfo Template metadata to add effect to
         * @param {string} prop Property that should trigger the effect
         * @param {Object=} effect Effect metadata object
         * @return {void}
         * @protected
         */

      }, {
        key: '_stampTemplate',


        /**
         * Stamps the provided template and performs instance-time setup for
         * Polymer template features, including data bindings, declarative event
         * listeners, and the `this.$` map of `id`'s to nodes.  A document fragment
         * is returned containing the stamped DOM, ready for insertion into the
         * DOM.
         *
         * This method may be called more than once; however note that due to
         * `shadycss` polyfill limitations, only styles from templates prepared
         * using `ShadyCSS.prepareTemplate` will be correctly polyfilled (scoped
         * to the shadow root and support CSS custom properties), and note that
         * `ShadyCSS.prepareTemplate` may only be called once per element. As such,
         * any styles required by in runtime-stamped templates must be included
         * in the main element template.
         *
         * @param {!HTMLTemplateElement} template Template to stamp
         * @return {!StampedTemplate} Cloned template content
         * @override
         * @protected
         */
        value: function _stampTemplate(template) {
          // Ensures that created dom is `_enqueueClient`'d to this element so
          // that it can be flushed on next call to `_flushProperties`
          hostStack.beginHosting(this);
          var dom = get(PropertyEffects.prototype.__proto__ || Object.getPrototypeOf(PropertyEffects.prototype), '_stampTemplate', this).call(this, template);
          hostStack.endHosting(this);
          var templateInfo = /** @type {!TemplateInfo} */this._bindTemplate(template, true);
          // Add template-instance-specific data to instanced templateInfo
          templateInfo.nodeList = dom.nodeList;
          // Capture child nodes to allow unstamping of non-prototypical templates
          if (!templateInfo.wasPreBound) {
            var nodes = templateInfo.childNodes = [];
            for (var n = dom.firstChild; n; n = n.nextSibling) {
              nodes.push(n);
            }
          }
          dom.templateInfo = templateInfo;
          // Setup compound storage, 2-way listeners, and dataHost for bindings
          setupBindings(this, templateInfo);
          // Flush properties into template nodes if already booted
          if (this.__dataReady) {
            runEffects(this, templateInfo.propertyEffects, this.__data, null, false, templateInfo.nodeList);
          }
          return dom;
        }

        /**
         * Removes and unbinds the nodes previously contained in the provided
         * DocumentFragment returned from `_stampTemplate`.
         *
         * @param {!StampedTemplate} dom DocumentFragment previously returned
         *   from `_stampTemplate` associated with the nodes to be removed
         * @return {void}
         * @protected
         */

      }, {
        key: '_removeBoundDom',
        value: function _removeBoundDom(dom) {
          // Unlink template info
          var templateInfo = dom.templateInfo;
          if (templateInfo.previousTemplateInfo) {
            templateInfo.previousTemplateInfo.nextTemplateInfo = templateInfo.nextTemplateInfo;
          }
          if (templateInfo.nextTemplateInfo) {
            templateInfo.nextTemplateInfo.previousTemplateInfo = templateInfo.previousTemplateInfo;
          }
          if (this.__templateInfoLast == templateInfo) {
            this.__templateInfoLast = templateInfo.previousTemplateInfo;
          }
          templateInfo.previousTemplateInfo = templateInfo.nextTemplateInfo = null;
          // Remove stamped nodes
          var nodes = templateInfo.childNodes;
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            node.parentNode.removeChild(node);
          }
        }

        /**
         * Overrides default `TemplateStamp` implementation to add support for
         * parsing bindings from `TextNode`'s' `textContent`.  A `bindings`
         * array is added to `nodeInfo` and populated with binding metadata
         * with information capturing the binding target, and a `parts` array
         * with one or more metadata objects capturing the source(s) of the
         * binding.
         *
         * @override
         * @param {Node} node Node to parse
         * @param {TemplateInfo} templateInfo Template metadata for current template
         * @param {NodeInfo} nodeInfo Node metadata for current template node
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @protected
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */

      }, {
        key: 'PROPERTY_EFFECT_TYPES',
        get: function get$$1() {
          return TYPES;
        }
      }], [{
        key: 'addPropertyEffect',
        value: function addPropertyEffect(property, type, effect) {
          this.prototype._addPropertyEffect(property, type, effect);
        }

        /**
         * Creates a single-property observer for the given property.
         *
         * @param {string} property Property name
         * @param {string|function(*,*)} method Function or name of observer method to call
         * @param {boolean=} dynamicFn Whether the method name should be included as
         *   a dependency to the effect.
         * @return {void}
         * @protected
         */

      }, {
        key: 'createPropertyObserver',
        value: function createPropertyObserver(property, method, dynamicFn) {
          this.prototype._createPropertyObserver(property, method, dynamicFn);
        }

        /**
         * Creates a multi-property "method observer" based on the provided
         * expression, which should be a string in the form of a normal JavaScript
         * function signature: `'methodName(arg1, [..., argn])'`.  Each argument
         * should correspond to a property or path in the context of this
         * prototype (or instance), or may be a literal string or number.
         *
         * @param {string} expression Method expression
         * @param {boolean|Object=} dynamicFn Boolean or object map indicating
         * @return {void}
         *   whether method names should be included as a dependency to the effect.
         * @protected
         */

      }, {
        key: 'createMethodObserver',
        value: function createMethodObserver(expression, dynamicFn) {
          this.prototype._createMethodObserver(expression, dynamicFn);
        }

        /**
         * Causes the setter for the given property to dispatch `<property>-changed`
         * events to notify of changes to the property.
         *
         * @param {string} property Property name
         * @return {void}
         * @protected
         */

      }, {
        key: 'createNotifyingProperty',
        value: function createNotifyingProperty(property) {
          this.prototype._createNotifyingProperty(property);
        }

        /**
         * Creates a read-only accessor for the given property.
         *
         * To set the property, use the protected `_setProperty` API.
         * To create a custom protected setter (e.g. `_setMyProp()` for
         * property `myProp`), pass `true` for `protectedSetter`.
         *
         * Note, if the property will have other property effects, this method
         * should be called first, before adding other effects.
         *
         * @param {string} property Property name
         * @param {boolean=} protectedSetter Creates a custom protected setter
         *   when `true`.
         * @return {void}
         * @protected
         */

      }, {
        key: 'createReadOnlyProperty',
        value: function createReadOnlyProperty(property, protectedSetter) {
          this.prototype._createReadOnlyProperty(property, protectedSetter);
        }

        /**
         * Causes the setter for the given property to reflect the property value
         * to a (dash-cased) attribute of the same name.
         *
         * @param {string} property Property name
         * @return {void}
         * @protected
         */

      }, {
        key: 'createReflectedProperty',
        value: function createReflectedProperty(property) {
          this.prototype._createReflectedProperty(property);
        }

        /**
         * Creates a computed property whose value is set to the result of the
         * method described by the given `expression` each time one or more
         * arguments to the method changes.  The expression should be a string
         * in the form of a normal JavaScript function signature:
         * `'methodName(arg1, [..., argn])'`
         *
         * @param {string} property Name of computed property to set
         * @param {string} expression Method expression
         * @param {boolean|Object=} dynamicFn Boolean or object map indicating whether
         *   method names should be included as a dependency to the effect.
         * @return {void}
         * @protected
         */

      }, {
        key: 'createComputedProperty',
        value: function createComputedProperty(property, expression, dynamicFn) {
          this.prototype._createComputedProperty(property, expression, dynamicFn);
        }

        /**
         * Parses the provided template to ensure binding effects are created
         * for them, and then ensures property accessors are created for any
         * dependent properties in the template.  Binding effects for bound
         * templates are stored in a linked list on the instance so that
         * templates can be efficiently stamped and unstamped.
         *
         * @param {!HTMLTemplateElement} template Template containing binding
         *   bindings
         * @return {!TemplateInfo} Template metadata object
         * @protected
         */

      }, {
        key: 'bindTemplate',
        value: function bindTemplate(template) {
          return this.prototype._bindTemplate(template);
        }
      }, {
        key: '_addTemplatePropertyEffect',
        value: function _addTemplatePropertyEffect(templateInfo, prop, effect) {
          var hostProps = templateInfo.hostProps = templateInfo.hostProps || {};
          hostProps[prop] = true;
          var effects = templateInfo.propertyEffects = templateInfo.propertyEffects || {};
          var propEffects = effects[prop] = effects[prop] || [];
          propEffects.push(effect);
        }
      }, {
        key: '_parseTemplateNode',
        value: function _parseTemplateNode(node, templateInfo, nodeInfo) {
          var noted = get(PropertyEffects.__proto__ || Object.getPrototypeOf(PropertyEffects), '_parseTemplateNode', this).call(this, node, templateInfo, nodeInfo);
          if (node.nodeType === Node.TEXT_NODE) {
            var parts = this._parseBindings(node.textContent, templateInfo);
            if (parts) {
              // Initialize the textContent with any literal parts
              // NOTE: default to a space here so the textNode remains; some browsers
              // (IE) omit an empty textNode following cloneNode/importNode.
              node.textContent = literalFromParts(parts) || ' ';
              addBinding(this, templateInfo, nodeInfo, 'text', 'textContent', parts);
              noted = true;
            }
          }
          return noted;
        }

        /**
         * Overrides default `TemplateStamp` implementation to add support for
         * parsing bindings from attributes.  A `bindings`
         * array is added to `nodeInfo` and populated with binding metadata
         * with information capturing the binding target, and a `parts` array
         * with one or more metadata objects capturing the source(s) of the
         * binding.
         *
         * @override
         * @param {Element} node Node to parse
         * @param {TemplateInfo} templateInfo Template metadata for current template
         * @param {NodeInfo} nodeInfo Node metadata for current template node
         * @param {string} name Attribute name
         * @param {string} value Attribute value
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @protected
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */

      }, {
        key: '_parseTemplateNodeAttribute',
        value: function _parseTemplateNodeAttribute(node, templateInfo, nodeInfo, name, value) {
          var parts = this._parseBindings(value, templateInfo);
          if (parts) {
            // Attribute or property
            var origName = name;
            var kind = 'property';
            // The only way we see a capital letter here is if the attr has
            // a capital letter in it per spec. In this case, to make sure
            // this binding works, we go ahead and make the binding to the attribute.
            if (capitalAttributeRegex.test(name)) {
              kind = 'attribute';
            } else if (name[name.length - 1] == '$') {
              name = name.slice(0, -1);
              kind = 'attribute';
            }
            // Initialize attribute bindings with any literal parts
            var literal = literalFromParts(parts);
            if (literal && kind == 'attribute') {
              node.setAttribute(name, literal);
            }
            // Clear attribute before removing, since IE won't allow removing
            // `value` attribute if it previously had a value (can't
            // unconditionally set '' before removing since attributes with `$`
            // can't be set using setAttribute)
            if (node.localName === 'input' && origName === 'value') {
              node.setAttribute(origName, '');
            }
            // Remove annotation
            node.removeAttribute(origName);
            // Case hackery: attributes are lower-case, but bind targets
            // (properties) are case sensitive. Gambit is to map dash-case to
            // camel-case: `foo-bar` becomes `fooBar`.
            // Attribute bindings are excepted.
            if (kind === 'property') {
              name = dashToCamelCase(name);
            }
            addBinding(this, templateInfo, nodeInfo, kind, name, parts, literal);
            return true;
          } else {
            return get(PropertyEffects.__proto__ || Object.getPrototypeOf(PropertyEffects), '_parseTemplateNodeAttribute', this).call(this, node, templateInfo, nodeInfo, name, value);
          }
        }

        /**
         * Overrides default `TemplateStamp` implementation to add support for
         * binding the properties that a nested template depends on to the template
         * as `_host_<property>`.
         *
         * @override
         * @param {Node} node Node to parse
         * @param {TemplateInfo} templateInfo Template metadata for current template
         * @param {NodeInfo} nodeInfo Node metadata for current template node
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @protected
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */

      }, {
        key: '_parseTemplateNestedTemplate',
        value: function _parseTemplateNestedTemplate(node, templateInfo, nodeInfo) {
          var noted = get(PropertyEffects.__proto__ || Object.getPrototypeOf(PropertyEffects), '_parseTemplateNestedTemplate', this).call(this, node, templateInfo, nodeInfo);
          // Merge host props into outer template and add bindings
          var hostProps = nodeInfo.templateInfo.hostProps;
          var mode = '{';
          for (var source in hostProps) {
            var parts = [{ mode: mode, source: source, dependencies: [source] }];
            addBinding(this, templateInfo, nodeInfo, 'property', '_host_' + source, parts);
          }
          return noted;
        }

        /**
         * Called to parse text in a template (either attribute values or
         * textContent) into binding metadata.
         *
         * Any overrides of this method should return an array of binding part
         * metadata  representing one or more bindings found in the provided text
         * and any "literal" text in between.  Any non-literal parts will be passed
         * to `_evaluateBinding` when any dependencies change.  The only required
         * fields of each "part" in the returned array are as follows:
         *
         * - `dependencies` - Array containing trigger metadata for each property
         *   that should trigger the binding to update
         * - `literal` - String containing text if the part represents a literal;
         *   in this case no `dependencies` are needed
         *
         * Additional metadata for use by `_evaluateBinding` may be provided in
         * each part object as needed.
         *
         * The default implementation handles the following types of bindings
         * (one or more may be intermixed with literal strings):
         * - Property binding: `[[prop]]`
         * - Path binding: `[[object.prop]]`
         * - Negated property or path bindings: `[[!prop]]` or `[[!object.prop]]`
         * - Two-way property or path bindings (supports negation):
         *   `{{prop}}`, `{{object.prop}}`, `{{!prop}}` or `{{!object.prop}}`
         * - Inline computed method (supports negation):
         *   `[[compute(a, 'literal', b)]]`, `[[!compute(a, 'literal', b)]]`
         *
         * The default implementation uses a regular expression for best
         * performance. However, the regular expression uses a white-list of
         * allowed characters in a data-binding, which causes problems for
         * data-bindings that do use characters not in this white-list.
         *
         * Instead of updating the white-list with all allowed characters,
         * there is a StrictBindingParser (see lib/mixins/strict-binding-parser)
         * that uses a state machine instead. This state machine is able to handle
         * all characters. However, it is slightly less performant, therefore we
         * extracted it into a separate optional mixin.
         *
         * @param {string} text Text to parse from attribute or textContent
         * @param {Object} templateInfo Current template metadata
         * @return {Array<!BindingPart>} Array of binding part metadata
         * @protected
         */

      }, {
        key: '_parseBindings',
        value: function _parseBindings(text, templateInfo) {
          var parts = [];
          var lastIndex = 0;
          var m = void 0;
          // Example: "literal1{{prop}}literal2[[!compute(foo,bar)]]final"
          // Regex matches:
          //        Iteration 1:  Iteration 2:
          // m[1]: '{{'          '[['
          // m[2]: ''            '!'
          // m[3]: 'prop'        'compute(foo,bar)'
          while ((m = bindingRegex.exec(text)) !== null) {
            // Add literal part
            if (m.index > lastIndex) {
              parts.push({ literal: text.slice(lastIndex, m.index) });
            }
            // Add binding part
            var mode = m[1][0];
            var negate = Boolean(m[2]);
            var source = m[3].trim();
            var customEvent = false,
                notifyEvent = '',
                colon = -1;
            if (mode == '{' && (colon = source.indexOf('::')) > 0) {
              notifyEvent = source.substring(colon + 2);
              source = source.substring(0, colon);
              customEvent = true;
            }
            var signature = parseMethod(source);
            var dependencies = [];
            if (signature) {
              // Inline computed function
              var args = signature.args,
                  methodName = signature.methodName;

              for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (!arg.literal) {
                  dependencies.push(arg);
                }
              }
              var dynamicFns = templateInfo.dynamicFns;
              if (dynamicFns && dynamicFns[methodName] || signature.static) {
                dependencies.push(methodName);
                signature.dynamicFn = true;
              }
            } else {
              // Property or path
              dependencies.push(source);
            }
            parts.push({
              source: source, mode: mode, negate: negate, customEvent: customEvent, signature: signature, dependencies: dependencies,
              event: notifyEvent
            });
            lastIndex = bindingRegex.lastIndex;
          }
          // Add a final literal part
          if (lastIndex && lastIndex < text.length) {
            var literal = text.substring(lastIndex);
            if (literal) {
              parts.push({
                literal: literal
              });
            }
          }
          if (parts.length) {
            return parts;
          } else {
            return null;
          }
        }

        /**
         * Called to evaluate a previously parsed binding part based on a set of
         * one or more changed dependencies.
         *
         * @param {this} inst Element that should be used as scope for
         *   binding dependencies
         * @param {BindingPart} part Binding part metadata
         * @param {string} path Property/path that triggered this effect
         * @param {Object} props Bag of current property changes
         * @param {Object} oldProps Bag of previous values for changed properties
         * @param {boolean} hasPaths True with `props` contains one or more paths
         * @return {*} Value the binding part evaluated to
         * @protected
         */

      }, {
        key: '_evaluateBinding',
        value: function _evaluateBinding(inst, part, path, props, oldProps, hasPaths) {
          var value = void 0;
          if (part.signature) {
            value = runMethodEffect(inst, path, props, oldProps, part.signature);
          } else if (path != part.source) {
            value = get$1(inst, part.source);
          } else {
            if (hasPaths && isPath(path)) {
              value = get$1(inst, path);
            } else {
              value = inst.__data[path];
            }
          }
          if (part.negate) {
            value = !value;
          }
          return value;
        }
      }]);
      return PropertyEffects;
    }(propertyEffectsBase);

    return PropertyEffects;
  });

  /**
   * Helper api for enqueuing client dom created by a host element.
   *
   * By default elements are flushed via `_flushProperties` when
   * `connectedCallback` is called. Elements attach their client dom to
   * themselves at `ready` time which results from this first flush.
   * This provides an ordering guarantee that the client dom an element
   * creates is flushed before the element itself (i.e. client `ready`
   * fires before host `ready`).
   *
   * However, if `_flushProperties` is called *before* an element is connected,
   * as for example `Templatize` does, this ordering guarantee cannot be
   * satisfied because no elements are connected. (Note: Bound elements that
   * receive data do become enqueued clients and are properly ordered but
   * unbound elements are not.)
   *
   * To maintain the desired "client before host" ordering guarantee for this
   * case we rely on the "host stack. Client nodes registers themselves with
   * the creating host element when created. This ensures that all client dom
   * is readied in the proper order, maintaining the desired guarantee.
   *
   * @private
   */
  var hostStack = {

    stack: [],

    /**
     * @param {*} inst Instance to add to hostStack
     * @return {void}
     * @this {hostStack}
     */
    registerHost: function registerHost(inst) {
      if (this.stack.length) {
        var host = this.stack[this.stack.length - 1];
        host._enqueueClient(inst);
      }
    },


    /**
     * @param {*} inst Instance to begin hosting
     * @return {void}
     * @this {hostStack}
     */
    beginHosting: function beginHosting(inst) {
      this.stack.push(inst);
    },


    /**
     * @param {*} inst Instance to end hosting
     * @return {void}
     * @this {hostStack}
     */
    endHosting: function endHosting(inst) {
      var stackLen = this.stack.length;
      if (stackLen && this.stack[stackLen - 1] == inst) {
        this.stack.pop();
      }
    }
  };

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * Creates a copy of `props` with each property normalized such that
   * upgraded it is an object with at least a type property { type: Type}.
   *
   * @param {Object} props Properties to normalize
   * @return {Object} Copy of input `props` with normalized properties that
   * are in the form {type: Type}
   * @private
   */
  function normalizeProperties(props) {
    var output = {};
    for (var p in props) {
      var o = props[p];
      output[p] = typeof o === 'function' ? { type: o } : o;
    }
    return output;
  }

  /**
   * Mixin that provides a minimal starting point to using the PropertiesChanged
   * mixin by providing a mechanism to declare properties in a static
   * getter (e.g. static get properties() { return { foo: String } }). Changes
   * are reported via the `_propertiesChanged` method.
   *
   * This mixin provides no specific support for rendering. Users are expected
   * to create a ShadowRoot and put content into it and update it in whatever
   * way makes sense. This can be done in reaction to properties changing by
   * implementing `_propertiesChanged`.
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin PropertiesChanged
   * @summary Mixin that provides a minimal starting point for using
   * the PropertiesChanged mixin by providing a declarative `properties` object.
   */
  var PropertiesMixin = dedupingMixin(function (superClass) {

    /**
     * @constructor
     * @extends {superClass}
     * @implements {Polymer_PropertiesChanged}
     */
    var base = PropertiesChanged(superClass);

    /**
     * Returns the super class constructor for the given class, if it is an
     * instance of the PropertiesMixin.
     *
     * @param {!PropertiesMixinConstructor} constructor PropertiesMixin constructor
     * @return {PropertiesMixinConstructor} Super class constructor
     */
    function superPropertiesClass(constructor) {
      var superCtor = Object.getPrototypeOf(constructor);

      // Note, the `PropertiesMixin` class below only refers to the class
      // generated by this call to the mixin; the instanceof test only works
      // because the mixin is deduped and guaranteed only to apply once, hence
      // all constructors in a proto chain will see the same `PropertiesMixin`
      return superCtor.prototype instanceof PropertiesMixin ?
      /** @type {PropertiesMixinConstructor} */superCtor : null;
    }

    /**
     * Returns a memoized version of the `properties` object for the
     * given class. Properties not in object format are converted to at
     * least {type}.
     *
     * @param {PropertiesMixinConstructor} constructor PropertiesMixin constructor
     * @return {Object} Memoized properties object
     */
    function ownProperties(constructor) {
      if (!constructor.hasOwnProperty(JSCompiler_renameProperty('__ownProperties', constructor))) {
        var props = null;

        if (constructor.hasOwnProperty(JSCompiler_renameProperty('properties', constructor)) && constructor.properties) {
          props = normalizeProperties(constructor.properties);
        }

        constructor.__ownProperties = props;
      }
      return constructor.__ownProperties;
    }

    /**
     * @polymer
     * @mixinClass
     * @extends {base}
     * @implements {Polymer_PropertiesMixin}
     * @unrestricted
     */

    var PropertiesMixin = function (_base) {
      inherits(PropertiesMixin, _base);

      function PropertiesMixin() {
        classCallCheck(this, PropertiesMixin);
        return possibleConstructorReturn(this, (PropertiesMixin.__proto__ || Object.getPrototypeOf(PropertiesMixin)).apply(this, arguments));
      }

      createClass(PropertiesMixin, [{
        key: '_initializeProperties',


        /**
         * Overrides `PropertiesChanged` method and adds a call to
         * `finalize` which lazily configures the element's property accessors.
         * @override
         * @return {void}
         */
        value: function _initializeProperties() {
          this.constructor.finalize();
          get(PropertiesMixin.prototype.__proto__ || Object.getPrototypeOf(PropertiesMixin.prototype), '_initializeProperties', this).call(this);
        }

        /**
         * Called when the element is added to a document.
         * Calls `_enableProperties` to turn on property system from
         * `PropertiesChanged`.
         * @suppress {missingProperties} Super may or may not implement the callback
         * @return {void}
         */

      }, {
        key: 'connectedCallback',
        value: function connectedCallback() {
          if (get(PropertiesMixin.prototype.__proto__ || Object.getPrototypeOf(PropertiesMixin.prototype), 'connectedCallback', this)) {
            get(PropertiesMixin.prototype.__proto__ || Object.getPrototypeOf(PropertiesMixin.prototype), 'connectedCallback', this).call(this);
          }
          this._enableProperties();
        }

        /**
         * Called when the element is removed from a document
         * @suppress {missingProperties} Super may or may not implement the callback
         * @return {void}
         */

      }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {
          if (get(PropertiesMixin.prototype.__proto__ || Object.getPrototypeOf(PropertiesMixin.prototype), 'disconnectedCallback', this)) {
            get(PropertiesMixin.prototype.__proto__ || Object.getPrototypeOf(PropertiesMixin.prototype), 'disconnectedCallback', this).call(this);
          }
        }
      }], [{
        key: 'finalize',


        /**
         * Finalizes an element definition, including ensuring any super classes
         * are also finalized. This includes ensuring property
         * accessors exist on the element prototype. This method calls
         * `_finalizeClass` to finalize each constructor in the prototype chain.
         * @return {void}
         */
        value: function finalize() {
          if (!this.hasOwnProperty(JSCompiler_renameProperty('__finalized', this))) {
            var superCtor = superPropertiesClass( /** @type {PropertiesMixinConstructor} */this);
            if (superCtor) {
              superCtor.finalize();
            }
            this.__finalized = true;
            this._finalizeClass();
          }
        }

        /**
         * Finalize an element class. This includes ensuring property
         * accessors exist on the element prototype. This method is called by
         * `finalize` and finalizes the class constructor.
         *
         * @protected
         */

      }, {
        key: '_finalizeClass',
        value: function _finalizeClass() {
          var props = ownProperties( /** @type {PropertiesMixinConstructor} */this);
          if (props) {
            this.createProperties(props);
          }
        }

        /**
         * Returns a memoized version of all properties, including those inherited
         * from super classes. Properties not in object format are converted to
         * at least {type}.
         *
         * @return {Object} Object containing properties for this class
         * @protected
         */

      }, {
        key: 'typeForProperty',


        /**
         * Overrides `PropertiesChanged` method to return type specified in the
         * static `properties` object for the given property.
         * @param {string} name Name of property
         * @return {*} Type to which to deserialize attribute
         *
         * @protected
         */
        value: function typeForProperty(name) {
          var info = this._properties[name];
          return info && info.type;
        }
      }, {
        key: 'observedAttributes',


        /**
         * Implements standard custom elements getter to observes the attributes
         * listed in `properties`.
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */
        get: function get$$1() {
          var _this2 = this;

          var props = this._properties;
          return props ? Object.keys(props).map(function (p) {
            return _this2.attributeNameForProperty(p);
          }) : [];
        }
      }, {
        key: '_properties',
        get: function get$$1() {
          if (!this.hasOwnProperty(JSCompiler_renameProperty('__properties', this))) {
            var superCtor = superPropertiesClass( /** @type {PropertiesMixinConstructor} */this);
            this.__properties = Object.assign({}, superCtor && superCtor._properties, ownProperties( /** @type {PropertiesMixinConstructor} */this));
          }
          return this.__properties;
        }
      }]);
      return PropertiesMixin;
    }(base);

    return PropertiesMixin;
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * Element class mixin that provides the core API for Polymer's meta-programming
   * features including template stamping, data-binding, attribute deserialization,
   * and property change observation.
   *
   * Subclassers may provide the following static getters to return metadata
   * used to configure Polymer's features for the class:
   *
   * - `static get is()`: When the template is provided via a `dom-module`,
   *   users should return the `dom-module` id from a static `is` getter.  If
   *   no template is needed or the template is provided directly via the
   *   `template` getter, there is no need to define `is` for the element.
   *
   * - `static get template()`: Users may provide the template directly (as
   *   opposed to via `dom-module`) by implementing a static `template` getter.
   *   The getter may return an `HTMLTemplateElement` or a string, which will
   *   automatically be parsed into a template.
   *
   * - `static get properties()`: Should return an object describing
   *   property-related metadata used by Polymer features (key: property name
   *   value: object containing property metadata). Valid keys in per-property
   *   metadata include:
   *   - `type` (String|Number|Object|Array|...): Used by
   *     `attributeChangedCallback` to determine how string-based attributes
   *     are deserialized to JavaScript property values.
   *   - `notify` (boolean): Causes a change in the property to fire a
   *     non-bubbling event called `<property>-changed`. Elements that have
   *     enabled two-way binding to the property use this event to observe changes.
   *   - `readOnly` (boolean): Creates a getter for the property, but no setter.
   *     To set a read-only property, use the private setter method
   *     `_setProperty(property, value)`.
   *   - `observer` (string): Observer method name that will be called when
   *     the property changes. The arguments of the method are
   *     `(value, previousValue)`.
   *   - `computed` (string): String describing method and dependent properties
   *     for computing the value of this property (e.g. `'computeFoo(bar, zot)'`).
   *     Computed properties are read-only by default and can only be changed
   *     via the return value of the computing method.
   *
   * - `static get observers()`: Array of strings describing multi-property
   *   observer methods and their dependent properties (e.g.
   *   `'observeABC(a, b, c)'`).
   *
   * The base class provides default implementations for the following standard
   * custom element lifecycle callbacks; users may override these, but should
   * call the super method to ensure
   * - `constructor`: Run when the element is created or upgraded
   * - `connectedCallback`: Run each time the element is connected to the
   *   document
   * - `disconnectedCallback`: Run each time the element is disconnected from
   *   the document
   * - `attributeChangedCallback`: Run each time an attribute in
   *   `observedAttributes` is set or removed (note: this element's default
   *   `observedAttributes` implementation will automatically return an array
   *   of dash-cased attributes based on `properties`)
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin PropertyEffects
   * @appliesMixin PropertiesMixin
   * @property rootPath {string} Set to the value of `rootPath`,
   *   which defaults to the main document path
   * @property importPath {string} Set to the value of the class's static
   *   `importPath` property, which defaults to the path of this element's
   *   `dom-module` (when `is` is used), but can be overridden for other
   *   import strategies.
   * @summary Element class mixin that provides the core API for Polymer's
   * meta-programming features.
   */
  var ElementMixin = dedupingMixin(function (base) {

    /**
     * @constructor
     * @extends {base}
     * @implements {Polymer_PropertyEffects}
     * @implements {Polymer_PropertiesMixin}
     */
    var polymerElementBase = PropertiesMixin(PropertyEffects(base));

    /**
     * Returns a list of properties with default values.
     * This list is created as an optimization since it is a subset of
     * the list returned from `_properties`.
     * This list is used in `_initializeProperties` to set property defaults.
     *
     * @param {PolymerElementConstructor} constructor Element class
     * @return {PolymerElementProperties} Flattened properties for this class
     *   that have default values
     * @private
     */
    function propertyDefaults(constructor) {
      if (!constructor.hasOwnProperty(JSCompiler_renameProperty('__propertyDefaults', constructor))) {
        constructor.__propertyDefaults = null;
        var props = constructor._properties;
        for (var p in props) {
          var info = props[p];
          if ('value' in info) {
            constructor.__propertyDefaults = constructor.__propertyDefaults || {};
            constructor.__propertyDefaults[p] = info;
          }
        }
      }
      return constructor.__propertyDefaults;
    }

    /**
     * Returns a memoized version of the the `observers` array.
     * @param {PolymerElementConstructor} constructor Element class
     * @return {Array} Array containing own observers for the given class
     * @protected
     */
    function ownObservers(constructor) {
      if (!constructor.hasOwnProperty(JSCompiler_renameProperty('__ownObservers', constructor))) {
        constructor.__ownObservers = constructor.hasOwnProperty(JSCompiler_renameProperty('observers', constructor)) ?
        /** @type {PolymerElementConstructor} */constructor.observers : null;
      }
      return constructor.__ownObservers;
    }

    /**
     * Creates effects for a property.
     *
     * Note, once a property has been set to
     * `readOnly`, `computed`, `reflectToAttribute`, or `notify`
     * these values may not be changed. For example, a subclass cannot
     * alter these settings. However, additional `observers` may be added
     * by subclasses.
     *
     * The info object should may contain property metadata as follows:
     *
     * * `type`: {function} type to which an attribute matching the property
     * is deserialized. Note the property is camel-cased from a dash-cased
     * attribute. For example, 'foo-bar' attribute is deserialized to a
     * property named 'fooBar'.
     *
     * * `readOnly`: {boolean} creates a readOnly property and
     * makes a private setter for the private of the form '_setFoo' for a
     * property 'foo',
     *
     * * `computed`: {string} creates a computed property. A computed property
     * also automatically is set to `readOnly: true`. The value is calculated
     * by running a method and arguments parsed from the given string. For
     * example 'compute(foo)' will compute a given property when the
     * 'foo' property changes by executing the 'compute' method. This method
     * must return the computed value.
     *
     * * `reflectToAttribute`: {boolean} If true, the property value is reflected
     * to an attribute of the same name. Note, the attribute is dash-cased
     * so a property named 'fooBar' is reflected as 'foo-bar'.
     *
     * * `notify`: {boolean} sends a non-bubbling notification event when
     * the property changes. For example, a property named 'foo' sends an
     * event named 'foo-changed' with `event.detail` set to the value of
     * the property.
     *
     * * observer: {string} name of a method that runs when the property
     * changes. The arguments of the method are (value, previousValue).
     *
     * Note: Users may want control over modifying property
     * effects via subclassing. For example, a user might want to make a
     * reflectToAttribute property not do so in a subclass. We've chosen to
     * disable this because it leads to additional complication.
     * For example, a readOnly effect generates a special setter. If a subclass
     * disables the effect, the setter would fail unexpectedly.
     * Based on feedback, we may want to try to make effects more malleable
     * and/or provide an advanced api for manipulating them.
     * Also consider adding warnings when an effect cannot be changed.
     *
     * @param {!PolymerElement} proto Element class prototype to add accessors
     *   and effects to
     * @param {string} name Name of the property.
     * @param {Object} info Info object from which to create property effects.
     * Supported keys:
     * @param {Object} allProps Flattened map of all properties defined in this
     *   element (including inherited properties)
     * @return {void}
     * @private
     */
    function createPropertyFromConfig(proto, name, info, allProps) {
      // computed forces readOnly...
      if (info.computed) {
        info.readOnly = true;
      }
      // Note, since all computed properties are readOnly, this prevents
      // adding additional computed property effects (which leads to a confusing
      // setup where multiple triggers for setting a property)
      // While we do have `hasComputedEffect` this is set on the property's
      // dependencies rather than itself.
      if (info.computed && !proto._hasReadOnlyEffect(name)) {
        proto._createComputedProperty(name, info.computed, allProps);
      }
      if (info.readOnly && !proto._hasReadOnlyEffect(name)) {
        proto._createReadOnlyProperty(name, !info.computed);
      }
      if (info.reflectToAttribute && !proto._hasReflectEffect(name)) {
        proto._createReflectedProperty(name);
      }
      if (info.notify && !proto._hasNotifyEffect(name)) {
        proto._createNotifyingProperty(name);
      }
      // always add observer
      if (info.observer) {
        proto._createPropertyObserver(name, info.observer, allProps[info.observer]);
      }
      // always create the mapping from attribute back to property for deserialization.
      proto._addPropertyToAttributeMap(name);
    }

    /**
     * Process all style elements in the element template. Styles with the
     * `include` attribute are processed such that any styles in
     * the associated "style modules" are included in the element template.
     * @param {PolymerElementConstructor} klass Element class
     * @param {!HTMLTemplateElement} template Template to process
     * @param {string} is Name of element
     * @param {string} baseURI Base URI for element
     * @private
     */
    function processElementStyles(klass, template, is, baseURI) {
      var templateStyles = template.content.querySelectorAll('style');
      var stylesWithImports = stylesFromTemplate(template);
      // insert styles from <link rel="import" type="css"> at the top of the template
      var linkedStyles = stylesFromModuleImports(is);
      var firstTemplateChild = template.content.firstElementChild;
      for (var idx = 0; idx < linkedStyles.length; idx++) {
        var s = linkedStyles[idx];
        s.textContent = klass._processStyleText(s.textContent, baseURI);
        template.content.insertBefore(s, firstTemplateChild);
      }
      // keep track of the last "concrete" style in the template we have encountered
      var templateStyleIndex = 0;
      // ensure all gathered styles are actually in this template.
      for (var i = 0; i < stylesWithImports.length; i++) {
        var _s = stylesWithImports[i];
        var templateStyle = templateStyles[templateStyleIndex];
        // if the style is not in this template, it's been "included" and
        // we put a clone of it in the template before the style that included it
        if (templateStyle !== _s) {
          _s = _s.cloneNode(true);
          templateStyle.parentNode.insertBefore(_s, templateStyle);
        } else {
          templateStyleIndex++;
        }
        _s.textContent = klass._processStyleText(_s.textContent, baseURI);
      }
      if (window.ShadyCSS) {
        window.ShadyCSS.prepareTemplate(template, is);
      }
    }

    /**
     * @polymer
     * @mixinClass
     * @unrestricted
     * @implements {Polymer_ElementMixin}
     */

    var PolymerElement = function (_polymerElementBase) {
      inherits(PolymerElement, _polymerElementBase);
      createClass(PolymerElement, null, [{
        key: '_finalizeClass',


        /**
         * Override of PropertiesMixin _finalizeClass to create observers and
         * find the template.
         * @return {void}
         * @protected
         * @override
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */
        value: function _finalizeClass() {
          get(PolymerElement.__proto__ || Object.getPrototypeOf(PolymerElement), '_finalizeClass', this).call(this);
          if (this.hasOwnProperty(JSCompiler_renameProperty('is', this)) && this.is) {
            register(this.prototype);
          }
          var observers = ownObservers(this);
          if (observers) {
            this.createObservers(observers, this._properties);
          }
          // note: create "working" template that is finalized at instance time
          var template = /** @type {PolymerElementConstructor} */this.template;
          if (template) {
            if (typeof template === 'string') {
              console.error('template getter must return HTMLTemplateElement');
              template = null;
            } else {
              template = template.cloneNode(true);
            }
          }

          this.prototype._template = template;
        }

        /**
         * Override of PropertiesChanged createProperties to create accessors
         * and property effects for all of the properties.
         * @return {void}
         * @protected
         * @override
         */

      }, {
        key: 'createProperties',
        value: function createProperties(props) {
          for (var p in props) {
            createPropertyFromConfig(this.prototype, p, props[p], props);
          }
        }

        /**
         * Creates observers for the given `observers` array.
         * Leverages `PropertyEffects` to create observers.
         * @param {Object} observers Array of observer descriptors for
         *   this class
         * @param {Object} dynamicFns Object containing keys for any properties
         *   that are functions and should trigger the effect when the function
         *   reference is changed
         * @return {void}
         * @protected
         */

      }, {
        key: 'createObservers',
        value: function createObservers(observers, dynamicFns) {
          var proto = this.prototype;
          for (var i = 0; i < observers.length; i++) {
            proto._createMethodObserver(observers[i], dynamicFns);
          }
        }

        /**
         * Returns the template that will be stamped into this element's shadow root.
         *
         * If a `static get is()` getter is defined, the default implementation
         * will return the first `<template>` in a `dom-module` whose `id`
         * matches this element's `is`.
         *
         * Users may override this getter to return an arbitrary template
         * (in which case the `is` getter is unnecessary). The template returned
         * may be either an `HTMLTemplateElement` or a string that will be
         * automatically parsed into a template.
         *
         * Note that when subclassing, if the super class overrode the default
         * implementation and the subclass would like to provide an alternate
         * template via a `dom-module`, it should override this getter and
         * return `DomModule.import(this.is, 'template')`.
         *
         * If a subclass would like to modify the super class template, it should
         * clone it rather than modify it in place.  If the getter does expensive
         * work such as cloning/modifying a template, it should memoize the
         * template for maximum performance:
         *
         *   let memoizedTemplate;
         *   class MySubClass extends MySuperClass {
         *     static get template() {
         *       if (!memoizedTemplate) {
         *         memoizedTemplate = super.template.cloneNode(true);
         *         let subContent = document.createElement('div');
         *         subContent.textContent = 'This came from MySubClass';
         *         memoizedTemplate.content.appendChild(subContent);
         *       }
         *       return memoizedTemplate;
         *     }
         *   }
         *
         * @return {HTMLTemplateElement|string} Template to be stamped
         */

      }, {
        key: 'template',
        get: function get$$1() {
          if (!this.hasOwnProperty(JSCompiler_renameProperty('_template', this))) {
            this._template = DomModule && DomModule.import(
            /** @type {PolymerElementConstructor}*/this.is, 'template') ||
            // note: implemented so a subclass can retrieve the super
            // template; call the super impl this way so that `this` points
            // to the superclass.
            Object.getPrototypeOf( /** @type {PolymerElementConstructor}*/this.prototype).constructor.template;
          }
          return this._template;
        }

        /**
         * Path matching the url from which the element was imported.
         *
         * This path is used to resolve url's in template style cssText.
         * The `importPath` property is also set on element instances and can be
         * used to create bindings relative to the import path.
         *
         * For elements defined in ES modules, users should implement
         * `static get importMeta() { return import.meta; }`, and the default
         * implementation of `importPath` will  return `import.meta.url`'s path.
         * For elements defined in HTML imports, this getter will return the path
         * to the document containing a `dom-module` element matching this
         * element's static `is` property.
         *
         * Note, this path should contain a trailing `/`.
         *
         * @return {string} The import path for this element class
         * @suppress {missingProperties}
         */

      }, {
        key: 'importPath',
        get: function get$$1() {
          if (!this.hasOwnProperty(JSCompiler_renameProperty('_importPath', this))) {
            var meta = this.importMeta;
            if (meta) {
              this._importPath = pathFromUrl(meta.url);
            } else {
              var module = DomModule && DomModule.import( /** @type {PolymerElementConstructor} */this.is);
              this._importPath = module && module.assetpath || Object.getPrototypeOf( /** @type {PolymerElementConstructor}*/this.prototype).constructor.importPath;
            }
          }
          return this._importPath;
        }
      }]);

      function PolymerElement() {
        classCallCheck(this, PolymerElement);

        /** @type {HTMLTemplateElement} */
        var _this = possibleConstructorReturn(this, (PolymerElement.__proto__ || Object.getPrototypeOf(PolymerElement)).call(this));

        _this._template;
        /** @type {string} */
        _this._importPath;
        /** @type {string} */
        _this.rootPath;
        /** @type {string} */
        _this.importPath;
        /** @type {StampedTemplate | HTMLElement | ShadowRoot} */
        _this.root;
        /** @type {!Object<string, !Element>} */
        _this.$;
        return _this;
      }

      /**
       * Overrides the default `PropertyAccessors` to ensure class
       * metaprogramming related to property accessors and effects has
       * completed (calls `finalize`).
       *
       * It also initializes any property defaults provided via `value` in
       * `properties` metadata.
       *
       * @return {void}
       * @override
       * @suppress {invalidCasts}
       */


      createClass(PolymerElement, [{
        key: '_initializeProperties',
        value: function _initializeProperties() {
          this.constructor.finalize();
          // note: finalize template when we have access to `localName` to
          // avoid dependence on `is` for polyfilling styling.
          this.constructor._finalizeTemplate( /** @type {!HTMLElement} */this.localName);
          get(PolymerElement.prototype.__proto__ || Object.getPrototypeOf(PolymerElement.prototype), '_initializeProperties', this).call(this);
          // set path defaults
          this.rootPath = rootPath;
          this.importPath = this.constructor.importPath;
          // apply property defaults...
          var p$ = propertyDefaults(this.constructor);
          if (!p$) {
            return;
          }
          for (var p in p$) {
            var info = p$[p];
            // Don't set default value if there is already an own property, which
            // happens when a `properties` property with default but no effects had
            // a property set (e.g. bound) by its host before upgrade
            if (!this.hasOwnProperty(p)) {
              var value = typeof info.value == 'function' ? info.value.call(this) : info.value;
              // Set via `_setProperty` if there is an accessor, to enable
              // initializing readOnly property defaults
              if (this._hasAccessor(p)) {
                this._setPendingProperty(p, value, true);
              } else {
                this[p] = value;
              }
            }
          }
        }

        /**
         * Gather style text for a style element in the template.
         *
         * @param {string} cssText Text containing styling to process
         * @param {string} baseURI Base URI to rebase CSS paths against
         * @return {string} The processed CSS text
         * @protected
         */

      }, {
        key: 'connectedCallback',


        /**
         * Provides a default implementation of the standard Custom Elements
         * `connectedCallback`.
         *
         * The default implementation enables the property effects system and
         * flushes any pending properties, and updates shimmed CSS properties
         * when using the ShadyCSS scoping/custom properties polyfill.
         *
         * @suppress {missingProperties, invalidCasts} Super may or may not implement the callback
         * @return {void}
         */
        value: function connectedCallback() {
          if (window.ShadyCSS && this._template) {
            window.ShadyCSS.styleElement( /** @type {!HTMLElement} */this);
          }
          get(PolymerElement.prototype.__proto__ || Object.getPrototypeOf(PolymerElement.prototype), 'connectedCallback', this).call(this);
        }

        /**
         * Stamps the element template.
         *
         * @return {void}
         * @override
         */

      }, {
        key: 'ready',
        value: function ready() {
          if (this._template) {
            this.root = this._stampTemplate(this._template);
            this.$ = this.root.$;
          }
          get(PolymerElement.prototype.__proto__ || Object.getPrototypeOf(PolymerElement.prototype), 'ready', this).call(this);
        }

        /**
         * Implements `PropertyEffects`'s `_readyClients` call. Attaches
         * element dom by calling `_attachDom` with the dom stamped from the
         * element's template via `_stampTemplate`. Note that this allows
         * client dom to be attached to the element prior to any observers
         * running.
         *
         * @return {void}
         * @override
         */

      }, {
        key: '_readyClients',
        value: function _readyClients() {
          if (this._template) {
            this.root = this._attachDom( /** @type {StampedTemplate} */this.root);
          }
          // The super._readyClients here sets the clients initialized flag.
          // We must wait to do this until after client dom is created/attached
          // so that this flag can be checked to prevent notifications fired
          // during this process from being handled before clients are ready.
          get(PolymerElement.prototype.__proto__ || Object.getPrototypeOf(PolymerElement.prototype), '_readyClients', this).call(this);
        }

        /**
         * Attaches an element's stamped dom to itself. By default,
         * this method creates a `shadowRoot` and adds the dom to it.
         * However, this method may be overridden to allow an element
         * to put its dom in another location.
         *
         * @throws {Error}
         * @suppress {missingReturn}
         * @param {StampedTemplate} dom to attach to the element.
         * @return {ShadowRoot} node to which the dom has been attached.
         */

      }, {
        key: '_attachDom',
        value: function _attachDom(dom) {
          if (this.attachShadow) {
            if (dom) {
              if (!this.shadowRoot) {
                this.attachShadow({ mode: 'open' });
              }
              this.shadowRoot.appendChild(dom);
              return this.shadowRoot;
            }
            return null;
          } else {
            throw new Error('ShadowDOM not available. ' +
            // TODO(sorvell): move to compile-time conditional when supported
            'PolymerElement can create dom as children instead of in ' + 'ShadowDOM by setting `this.root = this;\` before \`ready\`.');
          }
        }

        /**
         * When using the ShadyCSS scoping and custom property shim, causes all
         * shimmed styles in this element (and its subtree) to be updated
         * based on current custom property values.
         *
         * The optional parameter overrides inline custom property styles with an
         * object of properties where the keys are CSS properties, and the values
         * are strings.
         *
         * Example: `this.updateStyles({'--color': 'blue'})`
         *
         * These properties are retained unless a value of `null` is set.
         *
         * Note: This function does not support updating CSS mixins.
         * You can not dynamically change the value of an `@apply`.
         *
         * @param {Object=} properties Bag of custom property key/values to
         *   apply to this element.
         * @return {void}
         * @suppress {invalidCasts}
         */

      }, {
        key: 'updateStyles',
        value: function updateStyles(properties) {
          if (window.ShadyCSS) {
            window.ShadyCSS.styleSubtree( /** @type {!HTMLElement} */this, properties);
          }
        }

        /**
         * Rewrites a given URL relative to a base URL. The base URL defaults to
         * the original location of the document containing the `dom-module` for
         * this element. This method will return the same URL before and after
         * bundling.
         *
         * Note that this function performs no resolution for URLs that start
         * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
         * URL resolution, use `window.URL`.
         *
         * @param {string} url URL to resolve.
         * @param {string=} base Optional base URL to resolve against, defaults
         * to the element's `importPath`
         * @return {string} Rewritten URL relative to base
         */

      }, {
        key: 'resolveUrl',
        value: function resolveUrl$$1(url, base) {
          if (!base && this.importPath) {
            base = resolveUrl(this.importPath);
          }
          return resolveUrl(url, base);
        }

        /**
         * Overrides `PropertyAccessors` to add map of dynamic functions on
         * template info, for consumption by `PropertyEffects` template binding
         * code. This map determines which method templates should have accessors
         * created for them.
         *
         * @override
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */

      }], [{
        key: '_processStyleText',
        value: function _processStyleText(cssText, baseURI) {
          return resolveCss(cssText, baseURI);
        }

        /**
        * Configures an element `proto` to function with a given `template`.
        * The element name `is` and extends `ext` must be specified for ShadyCSS
        * style scoping.
        *
        * @param {string} is Tag name (or type extension name) for this element
        * @return {void}
        * @protected
        */

      }, {
        key: '_finalizeTemplate',
        value: function _finalizeTemplate(is) {
          /** @const {HTMLTemplateElement} */
          var template = this.prototype._template;
          if (template && !template.__polymerFinalized) {
            template.__polymerFinalized = true;
            var importPath = this.importPath;
            var baseURI = importPath ? resolveUrl(importPath) : '';
            // e.g. support `include="module-name"`, and ShadyCSS
            processElementStyles(this, template, is, baseURI);
            this.prototype._bindTemplate(template);
          }
        }
      }, {
        key: '_parseTemplateContent',
        value: function _parseTemplateContent(template, templateInfo, nodeInfo) {
          templateInfo.dynamicFns = templateInfo.dynamicFns || this._properties;
          return get(PolymerElement.__proto__ || Object.getPrototypeOf(PolymerElement), '_parseTemplateContent', this).call(this, template, templateInfo, nodeInfo);
        }
      }]);
      return PolymerElement;
    }(polymerElementBase);

    return PolymerElement;
  });

  /**
   * Registers a class prototype for telemetry purposes.
   * @param {HTMLElement} prototype Element prototype to register
   * @this {this}
   * @protected
   */
  function register(prototype) {
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * @summary Collapse multiple callbacks into one invocation after a timer.
   */
  var Debouncer = function () {
    function Debouncer() {
      classCallCheck(this, Debouncer);

      this._asyncModule = null;
      this._callback = null;
      this._timer = null;
    }
    /**
     * Sets the scheduler; that is, a module with the Async interface,
     * a callback and optional arguments to be passed to the run function
     * from the async module.
     *
     * @param {!AsyncInterface} asyncModule Object with Async interface.
     * @param {function()} callback Callback to run.
     * @return {void}
     */


    createClass(Debouncer, [{
      key: 'setConfig',
      value: function setConfig(asyncModule, callback) {
        var _this = this;

        this._asyncModule = asyncModule;
        this._callback = callback;
        this._timer = this._asyncModule.run(function () {
          _this._timer = null;
          _this._callback();
        });
      }
      /**
       * Cancels an active debouncer and returns a reference to itself.
       *
       * @return {void}
       */

    }, {
      key: 'cancel',
      value: function cancel() {
        if (this.isActive()) {
          this._asyncModule.cancel(this._timer);
          this._timer = null;
        }
      }
      /**
       * Flushes an active debouncer and returns a reference to itself.
       *
       * @return {void}
       */

    }, {
      key: 'flush',
      value: function flush() {
        if (this.isActive()) {
          this.cancel();
          this._callback();
        }
      }
      /**
       * Returns true if the debouncer is active.
       *
       * @return {boolean} True if active.
       */

    }, {
      key: 'isActive',
      value: function isActive() {
        return this._timer != null;
      }
      /**
       * Creates a debouncer if no debouncer is passed as a parameter
       * or it cancels an active debouncer otherwise. The following
       * example shows how a debouncer can be called multiple times within a
       * microtask and "debounced" such that the provided callback function is
       * called once. Add this method to a custom element:
       *
       * ```js
       * import {microtask} from '@polymer/polymer/lib/utils/async.js';
       * import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
       * // ...
       *
       * _debounceWork() {
       *   this._debounceJob = Debouncer.debounce(this._debounceJob,
       *       microTask, () => this._doWork());
       * }
       * ```
       *
       * If the `_debounceWork` method is called multiple times within the same
       * microtask, the `_doWork` function will be called only once at the next
       * microtask checkpoint.
       *
       * Note: In testing it is often convenient to avoid asynchrony. To accomplish
       * this with a debouncer, you can use `enqueueDebouncer` and
       * `flush`. For example, extend the above example by adding
       * `enqueueDebouncer(this._debounceJob)` at the end of the
       * `_debounceWork` method. Then in a test, call `flush` to ensure
       * the debouncer has completed.
       *
       * @param {Debouncer?} debouncer Debouncer object.
       * @param {!AsyncInterface} asyncModule Object with Async interface
       * @param {function()} callback Callback to run.
       * @return {!Debouncer} Returns a debouncer object.
       */

    }], [{
      key: 'debounce',
      value: function debounce(debouncer, asyncModule, callback) {
        if (debouncer instanceof Debouncer) {
          debouncer.cancel();
        } else {
          debouncer = new Debouncer();
        }
        debouncer.setConfig(asyncModule, callback);
        return debouncer;
      }
    }]);
    return Debouncer;
  }();

  // detect native touch action support
  var HAS_NATIVE_TA = typeof document.head.style.touchAction === 'string';
  var GESTURE_KEY = '__polymerGestures';
  var HANDLED_OBJ = '__polymerGesturesHandled';
  var TOUCH_ACTION = '__polymerGesturesTouchAction';
  // radius for tap and track
  var TAP_DISTANCE = 25;
  var TRACK_DISTANCE = 5;
  // number of last N track positions to keep
  var TRACK_LENGTH = 2;

  // Disabling "mouse" handlers for 2500ms is enough
  var MOUSE_TIMEOUT = 2500;
  var MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup', 'click'];
  // an array of bitmask values for mapping MouseEvent.which to MouseEvent.buttons
  var MOUSE_WHICH_TO_BUTTONS = [0, 1, 4, 2];
  var MOUSE_HAS_BUTTONS = function () {
    try {
      return new MouseEvent('test', { buttons: 1 }).buttons === 1;
    } catch (e) {
      return false;
    }
  }();

  /**
   * @param {string} name Possible mouse event name
   * @return {boolean} true if mouse event, false if not
   */
  function isMouseEvent(name) {
    return MOUSE_EVENTS.indexOf(name) > -1;
  }

  /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
  // check for passive event listeners
  var SUPPORTS_PASSIVE = false;
  (function () {
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function get() {
          SUPPORTS_PASSIVE = true;
        }
      });
      window.addEventListener('test', null, opts);
      window.removeEventListener('test', null, opts);
    } catch (e) {}
  })();

  /**
   * Generate settings for event listeners, dependant on `passiveTouchGestures`
   *
   * @param {string} eventName Event name to determine if `{passive}` option is
   *   needed
   * @return {{passive: boolean} | undefined} Options to use for addEventListener
   *   and removeEventListener
   */
  function PASSIVE_TOUCH(eventName) {
    if (isMouseEvent(eventName) || eventName === 'touchend') {
      return;
    }
    if (HAS_NATIVE_TA && SUPPORTS_PASSIVE && passiveTouchGestures) {
      return { passive: true };
    } else {
      return;
    }
  }

  // Check for touch-only devices
  var IS_TOUCH_ONLY = navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);

  // keep track of any labels hit by the mouseCanceller
  /** @type {!Array<!HTMLLabelElement>} */
  var clickedLabels = [];

  /** @type {!Object<boolean>} */
  var labellable = {
    'button': true,
    'input': true,
    'keygen': true,
    'meter': true,
    'output': true,
    'textarea': true,
    'progress': true,
    'select': true
  };

  /**
   * @param {HTMLElement} el Element to check labelling status
   * @return {boolean} element can have labels
   */
  function canBeLabelled(el) {
    return labellable[el.localName] || false;
  }

  /**
   * @param {HTMLElement} el Element that may be labelled.
   * @return {!Array<!HTMLLabelElement>} Relevant label for `el`
   */
  function matchingLabels(el) {
    var labels = Array.prototype.slice.call( /** @type {HTMLInputElement} */el.labels || []);
    // IE doesn't have `labels` and Safari doesn't populate `labels`
    // if element is in a shadowroot.
    // In this instance, finding the non-ancestor labels is enough,
    // as the mouseCancellor code will handle ancstor labels
    if (!labels.length) {
      labels = [];
      var root = el.getRootNode();
      // if there is an id on `el`, check for all labels with a matching `for` attribute
      if (el.id) {
        var matching = root.querySelectorAll('label[for = ' + el.id + ']');
        for (var i = 0; i < matching.length; i++) {
          labels.push( /** @type {!HTMLLabelElement} */matching[i]);
        }
      }
    }
    return labels;
  }

  // touch will make synthetic mouse events
  // `preventDefault` on touchend will cancel them,
  // but this breaks `<input>` focus and link clicks
  // disable mouse handlers for MOUSE_TIMEOUT ms after
  // a touchend to ignore synthetic mouse events
  var mouseCanceller = function mouseCanceller(mouseEvent) {
    // Check for sourceCapabilities, used to distinguish synthetic events
    // if mouseEvent did not come from a device that fires touch events,
    // it was made by a real mouse and should be counted
    // http://wicg.github.io/InputDeviceCapabilities/#dom-inputdevicecapabilities-firestouchevents
    var sc = mouseEvent.sourceCapabilities;
    if (sc && !sc.firesTouchEvents) {
      return;
    }
    // skip synthetic mouse events
    mouseEvent[HANDLED_OBJ] = { skip: true };
    // disable "ghost clicks"
    if (mouseEvent.type === 'click') {
      var clickFromLabel = false;
      var path = mouseEvent.composedPath && mouseEvent.composedPath();
      if (path) {
        for (var i = 0; i < path.length; i++) {
          if (path[i].nodeType === Node.ELEMENT_NODE) {
            if (path[i].localName === 'label') {
              clickedLabels.push(path[i]);
            } else if (canBeLabelled(path[i])) {
              var ownerLabels = matchingLabels(path[i]);
              // check if one of the clicked labels is labelling this element
              for (var j = 0; j < ownerLabels.length; j++) {
                clickFromLabel = clickFromLabel || clickedLabels.indexOf(ownerLabels[j]) > -1;
              }
            }
          }
          if (path[i] === POINTERSTATE.mouse.target) {
            return;
          }
        }
      }
      // if one of the clicked labels was labelling the target element,
      // this is not a ghost click
      if (clickFromLabel) {
        return;
      }
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
    }
  };

  /**
   * @param {boolean=} setup True to add, false to remove.
   * @return {void}
   */
  function setupTeardownMouseCanceller(setup) {
    var events = IS_TOUCH_ONLY ? ['click'] : MOUSE_EVENTS;
    for (var i = 0, en; i < events.length; i++) {
      en = events[i];
      if (setup) {
        // reset clickLabels array
        clickedLabels.length = 0;
        document.addEventListener(en, mouseCanceller, true);
      } else {
        document.removeEventListener(en, mouseCanceller, true);
      }
    }
  }

  function ignoreMouse(e) {
    if (!POINTERSTATE.mouse.mouseIgnoreJob) {
      setupTeardownMouseCanceller(true);
    }
    var unset = function unset() {
      setupTeardownMouseCanceller();
      POINTERSTATE.mouse.target = null;
      POINTERSTATE.mouse.mouseIgnoreJob = null;
    };
    POINTERSTATE.mouse.target = e.composedPath()[0];
    POINTERSTATE.mouse.mouseIgnoreJob = Debouncer.debounce(POINTERSTATE.mouse.mouseIgnoreJob, timeOut.after(MOUSE_TIMEOUT), unset);
  }

  /**
   * @param {MouseEvent} ev event to test for left mouse button down
   * @return {boolean} has left mouse button down
   */
  function hasLeftMouseButton(ev) {
    var type = ev.type;
    // exit early if the event is not a mouse event
    if (!isMouseEvent(type)) {
      return false;
    }
    // ev.button is not reliable for mousemove (0 is overloaded as both left button and no buttons)
    // instead we use ev.buttons (bitmask of buttons) or fall back to ev.which (deprecated, 0 for no buttons, 1 for left button)
    if (type === 'mousemove') {
      // allow undefined for testing events
      var buttons = ev.buttons === undefined ? 1 : ev.buttons;
      if (ev instanceof window.MouseEvent && !MOUSE_HAS_BUTTONS) {
        buttons = MOUSE_WHICH_TO_BUTTONS[ev.which] || 0;
      }
      // buttons is a bitmask, check that the left button bit is set (1)
      return Boolean(buttons & 1);
    } else {
      // allow undefined for testing events
      var button = ev.button === undefined ? 0 : ev.button;
      // ev.button is 0 in mousedown/mouseup/click for left button activation
      return button === 0;
    }
  }

  function isSyntheticClick(ev) {
    if (ev.type === 'click') {
      // ev.detail is 0 for HTMLElement.click in most browsers
      if (ev.detail === 0) {
        return true;
      }
      // in the worst case, check that the x/y position of the click is within
      // the bounding box of the target of the event
      // Thanks IE 10 >:(
      var t = _findOriginalTarget(ev);
      // make sure the target of the event is an element so we can use getBoundingClientRect,
      // if not, just assume it is a synthetic click
      if (!t.nodeType || /** @type {Element} */t.nodeType !== Node.ELEMENT_NODE) {
        return true;
      }
      var bcr = /** @type {Element} */t.getBoundingClientRect();
      // use page x/y to account for scrolling
      var x = ev.pageX,
          y = ev.pageY;
      // ev is a synthetic click if the position is outside the bounding box of the target
      return !(x >= bcr.left && x <= bcr.right && y >= bcr.top && y <= bcr.bottom);
    }
    return false;
  }

  var POINTERSTATE = {
    mouse: {
      target: null,
      mouseIgnoreJob: null
    },
    touch: {
      x: 0,
      y: 0,
      id: -1,
      scrollDecided: false
    }
  };

  function firstTouchAction(ev) {
    var ta = 'auto';
    var path = ev.composedPath && ev.composedPath();
    if (path) {
      for (var i = 0, n; i < path.length; i++) {
        n = path[i];
        if (n[TOUCH_ACTION]) {
          ta = n[TOUCH_ACTION];
          break;
        }
      }
    }
    return ta;
  }

  function trackDocument(stateObj, movefn, upfn) {
    stateObj.movefn = movefn;
    stateObj.upfn = upfn;
    document.addEventListener('mousemove', movefn);
    document.addEventListener('mouseup', upfn);
  }

  function untrackDocument(stateObj) {
    document.removeEventListener('mousemove', stateObj.movefn);
    document.removeEventListener('mouseup', stateObj.upfn);
    stateObj.movefn = null;
    stateObj.upfn = null;
  }

  // use a document-wide touchend listener to start the ghost-click prevention mechanism
  // Use passive event listeners, if supported, to not affect scrolling performance
  document.addEventListener('touchend', ignoreMouse, SUPPORTS_PASSIVE ? { passive: true } : false);

  var gestures = {};
  var recognizers = [];

  /**
   * Finds the element rendered on the screen at the provided coordinates.
   *
   * Similar to `document.elementFromPoint`, but pierces through
   * shadow roots.
   *
   * @param {number} x Horizontal pixel coordinate
   * @param {number} y Vertical pixel coordinate
   * @return {Element} Returns the deepest shadowRoot inclusive element
   * found at the screen position given.
   */
  function deepTargetFind(x, y) {
    var node = document.elementFromPoint(x, y);
    var next = node;
    // this code path is only taken when native ShadowDOM is used
    // if there is a shadowroot, it may have a node at x/y
    // if there is not a shadowroot, exit the loop
    while (next && next.shadowRoot && !window.ShadyDOM) {
      // if there is a node at x/y in the shadowroot, look deeper
      var oldNext = next;
      next = next.shadowRoot.elementFromPoint(x, y);
      // on Safari, elementFromPoint may return the shadowRoot host
      if (oldNext === next) {
        break;
      }
      if (next) {
        node = next;
      }
    }
    return node;
  }

  /**
   * a cheaper check than ev.composedPath()[0];
   *
   * @private
   * @param {Event} ev Event.
   * @return {EventTarget} Returns the event target.
   */
  function _findOriginalTarget(ev) {
    // shadowdom
    if (ev.composedPath) {
      var targets = /** @type {!Array<!EventTarget>} */ev.composedPath();
      // It shouldn't be, but sometimes targets is empty (window on Safari).
      return targets.length > 0 ? targets[0] : ev.target;
    }
    // shadydom
    return ev.target;
  }

  /**
   * @private
   * @param {Event} ev Event.
   * @return {void}
   */
  function _handleNative(ev) {
    var handled = void 0;
    var type = ev.type;
    var node = ev.currentTarget;
    var gobj = node[GESTURE_KEY];
    if (!gobj) {
      return;
    }
    var gs = gobj[type];
    if (!gs) {
      return;
    }
    if (!ev[HANDLED_OBJ]) {
      ev[HANDLED_OBJ] = {};
      if (type.slice(0, 5) === 'touch') {
        ev = /** @type {TouchEvent} */ev; // eslint-disable-line no-self-assign
        var t = ev.changedTouches[0];
        if (type === 'touchstart') {
          // only handle the first finger
          if (ev.touches.length === 1) {
            POINTERSTATE.touch.id = t.identifier;
          }
        }
        if (POINTERSTATE.touch.id !== t.identifier) {
          return;
        }
        if (!HAS_NATIVE_TA) {
          if (type === 'touchstart' || type === 'touchmove') {
            _handleTouchAction(ev);
          }
        }
      }
    }
    handled = ev[HANDLED_OBJ];
    // used to ignore synthetic mouse events
    if (handled.skip) {
      return;
    }
    // reset recognizer state
    for (var i = 0, r; i < recognizers.length; i++) {
      r = recognizers[i];
      if (gs[r.name] && !handled[r.name]) {
        if (r.flow && r.flow.start.indexOf(ev.type) > -1 && r.reset) {
          r.reset();
        }
      }
    }
    // enforce gesture recognizer order
    for (var _i = 0, _r; _i < recognizers.length; _i++) {
      _r = recognizers[_i];
      if (gs[_r.name] && !handled[_r.name]) {
        handled[_r.name] = true;
        _r[type](ev);
      }
    }
  }

  /**
   * @private
   * @param {TouchEvent} ev Event.
   * @return {void}
   */
  function _handleTouchAction(ev) {
    var t = ev.changedTouches[0];
    var type = ev.type;
    if (type === 'touchstart') {
      POINTERSTATE.touch.x = t.clientX;
      POINTERSTATE.touch.y = t.clientY;
      POINTERSTATE.touch.scrollDecided = false;
    } else if (type === 'touchmove') {
      if (POINTERSTATE.touch.scrollDecided) {
        return;
      }
      POINTERSTATE.touch.scrollDecided = true;
      var ta = firstTouchAction(ev);
      var _prevent = false;
      var dx = Math.abs(POINTERSTATE.touch.x - t.clientX);
      var dy = Math.abs(POINTERSTATE.touch.y - t.clientY);
      if (!ev.cancelable) ; else if (ta === 'none') {
        _prevent = true;
      } else if (ta === 'pan-x') {
        _prevent = dy > dx;
      } else if (ta === 'pan-y') {
        _prevent = dx > dy;
      }
      if (_prevent) {
        ev.preventDefault();
      } else {
        _prevent('track');
      }
    }
  }

  /**
   * Adds an event listener to a node for the given gesture type.
   *
   * @param {!Node} node Node to add listener on
   * @param {string} evType Gesture type: `down`, `up`, `track`, or `tap`
   * @param {!function(!Event):void} handler Event listener function to call
   * @return {boolean} Returns true if a gesture event listener was added.
   * @this {Gestures}
   */
  function addListener(node, evType, handler) {
    if (gestures[evType]) {
      _add(node, evType, handler);
      return true;
    }
    return false;
  }

  /**
   * Removes an event listener from a node for the given gesture type.
   *
   * @param {!Node} node Node to remove listener from
   * @param {string} evType Gesture type: `down`, `up`, `track`, or `tap`
   * @param {!function(!Event):void} handler Event listener function previously passed to
   *  `addListener`.
   * @return {boolean} Returns true if a gesture event listener was removed.
   * @this {Gestures}
   */
  function removeListener(node, evType, handler) {
    if (gestures[evType]) {
      _remove(node, evType, handler);
      return true;
    }
    return false;
  }

  /**
   * automate the event listeners for the native events
   *
   * @private
   * @param {!HTMLElement} node Node on which to add the event.
   * @param {string} evType Event type to add.
   * @param {function(!Event)} handler Event handler function.
   * @return {void}
   * @this {Gestures}
   */
  function _add(node, evType, handler) {
    var recognizer = gestures[evType];
    var deps = recognizer.deps;
    var name = recognizer.name;
    var gobj = node[GESTURE_KEY];
    if (!gobj) {
      node[GESTURE_KEY] = gobj = {};
    }
    for (var i = 0, dep, gd; i < deps.length; i++) {
      dep = deps[i];
      // don't add mouse handlers on iOS because they cause gray selection overlays
      if (IS_TOUCH_ONLY && isMouseEvent(dep) && dep !== 'click') {
        continue;
      }
      gd = gobj[dep];
      if (!gd) {
        gobj[dep] = gd = { _count: 0 };
      }
      if (gd._count === 0) {
        node.addEventListener(dep, _handleNative, PASSIVE_TOUCH(dep));
      }
      gd[name] = (gd[name] || 0) + 1;
      gd._count = (gd._count || 0) + 1;
    }
    node.addEventListener(evType, handler);
    if (recognizer.touchAction) {
      setTouchAction(node, recognizer.touchAction);
    }
  }

  /**
   * automate event listener removal for native events
   *
   * @private
   * @param {!HTMLElement} node Node on which to remove the event.
   * @param {string} evType Event type to remove.
   * @param {function(Event?)} handler Event handler function.
   * @return {void}
   * @this {Gestures}
   */
  function _remove(node, evType, handler) {
    var recognizer = gestures[evType];
    var deps = recognizer.deps;
    var name = recognizer.name;
    var gobj = node[GESTURE_KEY];
    if (gobj) {
      for (var i = 0, dep, gd; i < deps.length; i++) {
        dep = deps[i];
        gd = gobj[dep];
        if (gd && gd[name]) {
          gd[name] = (gd[name] || 1) - 1;
          gd._count = (gd._count || 1) - 1;
          if (gd._count === 0) {
            node.removeEventListener(dep, _handleNative, PASSIVE_TOUCH(dep));
          }
        }
      }
    }
    node.removeEventListener(evType, handler);
  }

  /**
   * Registers a new gesture event recognizer for adding new custom
   * gesture event types.
   *
   * @param {!GestureRecognizer} recog Gesture recognizer descriptor
   * @return {void}
   * @this {Gestures}
   */
  function register$1(recog) {
    recognizers.push(recog);
    for (var i = 0; i < recog.emits.length; i++) {
      gestures[recog.emits[i]] = recog;
    }
  }

  /**
   * @private
   * @param {string} evName Event name.
   * @return {Object} Returns the gesture for the given event name.
   * @this {Gestures}
   */
  function _findRecognizerByEvent(evName) {
    for (var i = 0, r; i < recognizers.length; i++) {
      r = recognizers[i];
      for (var j = 0, n; j < r.emits.length; j++) {
        n = r.emits[j];
        if (n === evName) {
          return r;
        }
      }
    }
    return null;
  }

  /**
   * Sets scrolling direction on node.
   *
   * This value is checked on first move, thus it should be called prior to
   * adding event listeners.
   *
   * @param {!Element} node Node to set touch action setting on
   * @param {string} value Touch action value
   * @return {void}
   */
  function setTouchAction(node, value) {
    if (HAS_NATIVE_TA) {
      // NOTE: add touchAction async so that events can be added in
      // custom element constructors. Otherwise we run afoul of custom
      // elements restriction against settings attributes (style) in the
      // constructor.
      microTask.run(function () {
        node.style.touchAction = value;
      });
    }
    node[TOUCH_ACTION] = value;
  }

  /**
   * Dispatches an event on the `target` element of `type` with the given
   * `detail`.
   * @private
   * @param {!EventTarget} target The element on which to fire an event.
   * @param {string} type The type of event to fire.
   * @param {!Object=} detail The detail object to populate on the event.
   * @return {void}
   */
  function _fire2(target, type, detail) {
    var ev = new Event(type, { bubbles: true, cancelable: true, composed: true });
    ev.detail = detail;
    target.dispatchEvent(ev);
    // forward `preventDefault` in a clean way
    if (ev.defaultPrevented) {
      var preventer = detail.preventer || detail.sourceEvent;
      if (preventer && preventer.preventDefault) {
        preventer.preventDefault();
      }
    }
  }

  /**
   * Prevents the dispatch and default action of the given event name.
   *
   * @param {string} evName Event name.
   * @return {void}
   * @this {Gestures}
   */
  function _prevent2(evName) {
    var recognizer = _findRecognizerByEvent(evName);
    if (recognizer.info) {
      recognizer.info.prevent = true;
    }
  }

  /**
   * Reset the 2500ms timeout on processing mouse input after detecting touch input.
   *
   * Touch inputs create synthesized mouse inputs anywhere from 0 to 2000ms after the touch.
   * This method should only be called during testing with simulated touch inputs.
   * Calling this method in production may cause duplicate taps or other Gestures.
   *
   * @return {void}
   */
  function resetMouseCanceller() {
    if (POINTERSTATE.mouse.mouseIgnoreJob) {
      POINTERSTATE.mouse.mouseIgnoreJob.flush();
    }
  }

  /* eslint-disable valid-jsdoc */

  register$1({
    name: 'downup',
    deps: ['mousedown', 'touchstart', 'touchend'],
    flow: {
      start: ['mousedown', 'touchstart'],
      end: ['mouseup', 'touchend']
    },
    emits: ['down', 'up'],

    info: {
      movefn: null,
      upfn: null
    },

    /**
     * @this {GestureRecognizer}
     * @return {void}
     */
    reset: function reset() {
      untrackDocument(this.info);
    },

    /**
     * @this {GestureRecognizer}
     * @param {MouseEvent} e
     * @return {void}
     */
    mousedown: function mousedown(e) {
      if (!hasLeftMouseButton(e)) {
        return;
      }
      var t = _findOriginalTarget(e);
      var self = this;
      var movefn = function movefn(e) {
        if (!hasLeftMouseButton(e)) {
          self._fire('up', t, e);
          untrackDocument(self.info);
        }
      };
      var upfn = function upfn(e) {
        if (hasLeftMouseButton(e)) {
          self._fire('up', t, e);
        }
        untrackDocument(self.info);
      };
      trackDocument(this.info, movefn, upfn);
      this._fire('down', t, e);
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchstart: function touchstart(e) {
      this._fire('down', _findOriginalTarget(e), e.changedTouches[0], e);
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchend: function touchend(e) {
      this._fire('up', _findOriginalTarget(e), e.changedTouches[0], e);
    },
    /**
     * @param {string} type
     * @param {!EventTarget} target
     * @param {Event} event
     * @param {Function} preventer
     * @return {void}
     */
    _fire: function _fire(type, target, event, preventer) {
      _fire2(target, type, {
        x: event.clientX,
        y: event.clientY,
        sourceEvent: event,
        preventer: preventer,
        prevent: function prevent(e) {
          return _prevent2(e);
        }
      });
    }
  });

  register$1({
    name: 'track',
    touchAction: 'none',
    deps: ['mousedown', 'touchstart', 'touchmove', 'touchend'],
    flow: {
      start: ['mousedown', 'touchstart'],
      end: ['mouseup', 'touchend']
    },
    emits: ['track'],

    info: {
      x: 0,
      y: 0,
      state: 'start',
      started: false,
      moves: [],
      /** @this {GestureRecognizer} */
      addMove: function addMove(move) {
        if (this.moves.length > TRACK_LENGTH) {
          this.moves.shift();
        }
        this.moves.push(move);
      },
      movefn: null,
      upfn: null,
      prevent: false
    },

    /**
     * @this {GestureRecognizer}
     * @return {void}
     */
    reset: function reset() {
      this.info.state = 'start';
      this.info.started = false;
      this.info.moves = [];
      this.info.x = 0;
      this.info.y = 0;
      this.info.prevent = false;
      untrackDocument(this.info);
    },

    /**
     * @this {GestureRecognizer}
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    hasMovedEnough: function hasMovedEnough(x, y) {
      if (this.info.prevent) {
        return false;
      }
      if (this.info.started) {
        return true;
      }
      var dx = Math.abs(this.info.x - x);
      var dy = Math.abs(this.info.y - y);
      return dx >= TRACK_DISTANCE || dy >= TRACK_DISTANCE;
    },
    /**
     * @this {GestureRecognizer}
     * @param {MouseEvent} e
     * @return {void}
     */
    mousedown: function mousedown(e) {
      if (!hasLeftMouseButton(e)) {
        return;
      }
      var t = _findOriginalTarget(e);
      var self = this;
      var movefn = function movefn(e) {
        var x = e.clientX,
            y = e.clientY;
        if (self.hasMovedEnough(x, y)) {
          // first move is 'start', subsequent moves are 'move', mouseup is 'end'
          self.info.state = self.info.started ? e.type === 'mouseup' ? 'end' : 'track' : 'start';
          if (self.info.state === 'start') {
            // if and only if tracking, always prevent tap
            _prevent2('tap');
          }
          self.info.addMove({ x: x, y: y });
          if (!hasLeftMouseButton(e)) {
            // always _fire "end"
            self.info.state = 'end';
            untrackDocument(self.info);
          }
          self._fire(t, e);
          self.info.started = true;
        }
      };
      var upfn = function upfn(e) {
        if (self.info.started) {
          movefn(e);
        }

        // remove the temporary listeners
        untrackDocument(self.info);
      };
      // add temporary document listeners as mouse retargets
      trackDocument(this.info, movefn, upfn);
      this.info.x = e.clientX;
      this.info.y = e.clientY;
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchstart: function touchstart(e) {
      var ct = e.changedTouches[0];
      this.info.x = ct.clientX;
      this.info.y = ct.clientY;
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchmove: function touchmove(e) {
      var t = _findOriginalTarget(e);
      var ct = e.changedTouches[0];
      var x = ct.clientX,
          y = ct.clientY;
      if (this.hasMovedEnough(x, y)) {
        if (this.info.state === 'start') {
          // if and only if tracking, always prevent tap
          _prevent2('tap');
        }
        this.info.addMove({ x: x, y: y });
        this._fire(t, ct);
        this.info.state = 'track';
        this.info.started = true;
      }
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchend: function touchend(e) {
      var t = _findOriginalTarget(e);
      var ct = e.changedTouches[0];
      // only trackend if track was started and not aborted
      if (this.info.started) {
        // reset started state on up
        this.info.state = 'end';
        this.info.addMove({ x: ct.clientX, y: ct.clientY });
        this._fire(t, ct, e);
      }
    },

    /**
     * @this {GestureRecognizer}
     * @param {!EventTarget} target
     * @param {Touch} touch
     * @return {void}
     */
    _fire: function _fire(target, touch) {
      var secondlast = this.info.moves[this.info.moves.length - 2];
      var lastmove = this.info.moves[this.info.moves.length - 1];
      var dx = lastmove.x - this.info.x;
      var dy = lastmove.y - this.info.y;
      var ddx = void 0,
          ddy = 0;
      if (secondlast) {
        ddx = lastmove.x - secondlast.x;
        ddy = lastmove.y - secondlast.y;
      }
      _fire2(target, 'track', {
        state: this.info.state,
        x: touch.clientX,
        y: touch.clientY,
        dx: dx,
        dy: dy,
        ddx: ddx,
        ddy: ddy,
        sourceEvent: touch,
        hover: function hover() {
          return deepTargetFind(touch.clientX, touch.clientY);
        }
      });
    }

  });

  register$1({
    name: 'tap',
    deps: ['mousedown', 'click', 'touchstart', 'touchend'],
    flow: {
      start: ['mousedown', 'touchstart'],
      end: ['click', 'touchend']
    },
    emits: ['tap'],
    info: {
      x: NaN,
      y: NaN,
      prevent: false
    },
    /**
     * @this {GestureRecognizer}
     * @return {void}
     */
    reset: function reset() {
      this.info.x = NaN;
      this.info.y = NaN;
      this.info.prevent = false;
    },
    /**
     * @this {GestureRecognizer}
     * @param {MouseEvent} e
     * @return {void}
     */
    save: function save(e) {
      this.info.x = e.clientX;
      this.info.y = e.clientY;
    },
    /**
     * @this {GestureRecognizer}
     * @param {MouseEvent} e
     * @return {void}
     */
    mousedown: function mousedown(e) {
      if (hasLeftMouseButton(e)) {
        this.save(e);
      }
    },
    /**
     * @this {GestureRecognizer}
     * @param {MouseEvent} e
     * @return {void}
     */
    click: function click(e) {
      if (hasLeftMouseButton(e)) {
        this.forward(e);
      }
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchstart: function touchstart(e) {
      this.save(e.changedTouches[0], e);
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchend: function touchend(e) {
      this.forward(e.changedTouches[0], e);
    },
    /**
     * @this {GestureRecognizer}
     * @param {Event | Touch} e
     * @param {Event=} preventer
     * @return {void}
     */
    forward: function forward(e, preventer) {
      var dx = Math.abs(e.clientX - this.info.x);
      var dy = Math.abs(e.clientY - this.info.y);
      // find original target from `preventer` for TouchEvents, or `e` for MouseEvents
      var t = _findOriginalTarget(preventer || e);
      if (!t || t.disabled) {
        return;
      }
      // dx,dy can be NaN if `click` has been simulated and there was no `down` for `start`
      if (isNaN(dx) || isNaN(dy) || dx <= TAP_DISTANCE && dy <= TAP_DISTANCE || isSyntheticClick(e)) {
        // prevent taps from being generated if an event has canceled them
        if (!this.info.prevent) {
          _fire2(t, 'tap', {
            x: e.clientX,
            y: e.clientY,
            sourceEvent: e,
            preventer: preventer
          });
        }
      }
    }
  });

  /* eslint-enable valid-jsdoc */

  /** @deprecated */
  var findOriginalTarget = _findOriginalTarget;

  /** @deprecated */
  var add = addListener;

  /** @deprecated */
  var remove = removeListener;

  var gestures$0 = /*#__PURE__*/Object.freeze({
    prevent: _prevent2,
    gestures: gestures,
    recognizers: recognizers,
    deepTargetFind: deepTargetFind,
    addListener: addListener,
    removeListener: removeListener,
    register: register$1,
    setTouchAction: setTouchAction,
    resetMouseCanceller: resetMouseCanceller,
    findOriginalTarget: findOriginalTarget,
    add: add,
    remove: remove
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var gestures$1 = gestures$0;

  /**
   * Element class mixin that provides API for adding Polymer's cross-platform
   * gesture events to nodes.
   *
   * The API is designed to be compatible with override points implemented
   * in `TemplateStamp` such that declarative event listeners in
   * templates will support gesture events when this mixin is applied along with
   * `TemplateStamp`.
   *
   * @mixinFunction
   * @polymer
   * @summary Element class mixin that provides API for adding Polymer's
   *   cross-platform
   * gesture events to nodes
   */
  var GestureEventListeners = dedupingMixin(function (superClass) {

    /**
     * @polymer
     * @mixinClass
     * @implements {Polymer_GestureEventListeners}
     */
    var GestureEventListeners = function (_superClass) {
      inherits(GestureEventListeners, _superClass);

      function GestureEventListeners() {
        classCallCheck(this, GestureEventListeners);
        return possibleConstructorReturn(this, (GestureEventListeners.__proto__ || Object.getPrototypeOf(GestureEventListeners)).apply(this, arguments));
      }

      createClass(GestureEventListeners, [{
        key: '_addEventListenerToNode',


        /**
         * Add the event listener to the node if it is a gestures event.
         *
         * @param {!Node} node Node to add event listener to
         * @param {string} eventName Name of event
         * @param {function(!Event):void} handler Listener function to add
         * @return {void}
         */
        value: function _addEventListenerToNode(node, eventName, handler) {
          if (!gestures$1.addListener(node, eventName, handler)) {
            get(GestureEventListeners.prototype.__proto__ || Object.getPrototypeOf(GestureEventListeners.prototype), '_addEventListenerToNode', this).call(this, node, eventName, handler);
          }
        }

        /**
         * Remove the event listener to the node if it is a gestures event.
         *
         * @param {!Node} node Node to remove event listener from
         * @param {string} eventName Name of event
         * @param {function(!Event):void} handler Listener function to remove
         * @return {void}
         */

      }, {
        key: '_removeEventListenerFromNode',
        value: function _removeEventListenerFromNode(node, eventName, handler) {
          if (!gestures$1.removeListener(node, eventName, handler)) {
            get(GestureEventListeners.prototype.__proto__ || Object.getPrototypeOf(GestureEventListeners.prototype), '_removeEventListenerFromNode', this).call(this, node, eventName, handler);
          }
        }
      }]);
      return GestureEventListeners;
    }(superClass);

    return GestureEventListeners;
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var HOST_DIR = /:host\(:dir\((ltr|rtl)\)\)/g;
  var HOST_DIR_REPLACMENT = ':host([dir="$1"])';

  var EL_DIR = /([\s\w-#\.\[\]\*]*):dir\((ltr|rtl)\)/g;
  var EL_DIR_REPLACMENT = ':host([dir="$2"]) $1';

  /**
   * @type {!Array<!Polymer_DirMixin>}
   */
  var DIR_INSTANCES = [];

  /** @type {MutationObserver} */
  var observer = null;

  var DOCUMENT_DIR = '';

  function getRTL() {
    DOCUMENT_DIR = document.documentElement.getAttribute('dir');
  }

  /**
   * @param {!Polymer_DirMixin} instance Instance to set RTL status on
   */
  function setRTL(instance) {
    if (!instance.__autoDirOptOut) {
      var el = /** @type {!HTMLElement} */instance;
      el.setAttribute('dir', DOCUMENT_DIR);
    }
  }

  function updateDirection() {
    getRTL();
    DOCUMENT_DIR = document.documentElement.getAttribute('dir');
    for (var i = 0; i < DIR_INSTANCES.length; i++) {
      setRTL(DIR_INSTANCES[i]);
    }
  }

  function takeRecords() {
    if (observer && observer.takeRecords().length) {
      updateDirection();
    }
  }

  /**
   * Element class mixin that allows elements to use the `:dir` CSS Selector to
   * have text direction specific styling.
   *
   * With this mixin, any stylesheet provided in the template will transform
   * `:dir` into `:host([dir])` and sync direction with the page via the
   * element's `dir` attribute.
   *
   * Elements can opt out of the global page text direction by setting the `dir`
   * attribute directly in `ready()` or in HTML.
   *
   * Caveats:
   * - Applications must set `<html dir="ltr">` or `<html dir="rtl">` to sync
   *   direction
   * - Automatic left-to-right or right-to-left styling is sync'd with the
   *   `<html>` element only.
   * - Changing `dir` at runtime is supported.
   * - Opting out of the global direction styling is permanent
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin PropertyAccessors
   */
  var DirMixin = dedupingMixin(function (base) {

    if (!observer) {
      getRTL();
      observer = new MutationObserver(updateDirection);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    }

    /**
     * @constructor
     * @extends {base}
     * @implements {Polymer_PropertyAccessors}
     */
    var elementBase = PropertyAccessors(base);

    /**
     * @polymer
     * @mixinClass
     * @implements {Polymer_DirMixin}
     */

    var Dir = function (_elementBase) {
      inherits(Dir, _elementBase);
      createClass(Dir, null, [{
        key: '_processStyleText',


        /**
         * @override
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */
        value: function _processStyleText(cssText, baseURI) {
          cssText = get(Dir.__proto__ || Object.getPrototypeOf(Dir), '_processStyleText', this).call(this, cssText, baseURI);
          cssText = this._replaceDirInCssText(cssText);
          return cssText;
        }

        /**
         * Replace `:dir` in the given CSS text
         *
         * @param {string} text CSS text to replace DIR
         * @return {string} Modified CSS
         */

      }, {
        key: '_replaceDirInCssText',
        value: function _replaceDirInCssText(text) {
          var replacedText = text;
          replacedText = replacedText.replace(HOST_DIR, HOST_DIR_REPLACMENT);
          replacedText = replacedText.replace(EL_DIR, EL_DIR_REPLACMENT);
          if (text !== replacedText) {
            this.__activateDir = true;
          }
          return replacedText;
        }
      }]);

      function Dir() {
        classCallCheck(this, Dir);

        /** @type {boolean} */
        var _this = possibleConstructorReturn(this, (Dir.__proto__ || Object.getPrototypeOf(Dir)).call(this));

        _this.__autoDirOptOut = false;
        return _this;
      }

      /**
       * @suppress {invalidCasts} Closure doesn't understand that `this` is an HTMLElement
       * @return {void}
       */


      createClass(Dir, [{
        key: 'ready',
        value: function ready() {
          get(Dir.prototype.__proto__ || Object.getPrototypeOf(Dir.prototype), 'ready', this).call(this);
          this.__autoDirOptOut = /** @type {!HTMLElement} */this.hasAttribute('dir');
        }

        /**
         * @suppress {missingProperties} If it exists on elementBase, it can be super'd
         * @return {void}
         */

      }, {
        key: 'connectedCallback',
        value: function connectedCallback() {
          if (elementBase.prototype.connectedCallback) {
            get(Dir.prototype.__proto__ || Object.getPrototypeOf(Dir.prototype), 'connectedCallback', this).call(this);
          }
          if (this.constructor.__activateDir) {
            takeRecords();
            DIR_INSTANCES.push(this);
            setRTL(this);
          }
        }

        /**
         * @suppress {missingProperties} If it exists on elementBase, it can be super'd
         * @return {void}
         */

      }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {
          if (elementBase.prototype.disconnectedCallback) {
            get(Dir.prototype.__proto__ || Object.getPrototypeOf(Dir.prototype), 'disconnectedCallback', this).call(this);
          }
          if (this.constructor.__activateDir) {
            var idx = DIR_INSTANCES.indexOf(this);
            if (idx > -1) {
              DIR_INSTANCES.splice(idx, 1);
            }
          }
        }
      }]);
      return Dir;
    }(elementBase);

    Dir.__activateDir = false;

    return Dir;
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  function resolve() {
    document.body.removeAttribute('unresolved');
  }

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    resolve();
  } else {
    window.addEventListener('DOMContentLoaded', resolve);
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  function newSplice(index, removed, addedCount) {
    return {
      index: index,
      removed: removed,
      addedCount: addedCount
    };
  }

  var EDIT_LEAVE = 0;
  var EDIT_UPDATE = 1;
  var EDIT_ADD = 2;
  var EDIT_DELETE = 3;

  // Note: This function is *based* on the computation of the Levenshtein
  // "edit" distance. The one change is that "updates" are treated as two
  // edits - not one. With Array splices, an update is really a delete
  // followed by an add. By retaining this, we optimize for "keeping" the
  // maximum array items in the original array. For example:
  //
  //   'xxxx123' -> '123yyyy'
  //
  // With 1-edit updates, the shortest path would be just to update all seven
  // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
  // leaves the substring '123' intact.
  function calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd) {
    // "Deletion" columns
    var rowCount = oldEnd - oldStart + 1;
    var columnCount = currentEnd - currentStart + 1;
    var distances = new Array(rowCount);

    // "Addition" rows. Initialize null column.
    for (var i = 0; i < rowCount; i++) {
      distances[i] = new Array(columnCount);
      distances[i][0] = i;
    }

    // Initialize null row
    for (var j = 0; j < columnCount; j++) {
      distances[0][j] = j;
    }for (var _i = 1; _i < rowCount; _i++) {
      for (var _j = 1; _j < columnCount; _j++) {
        if (equals(current[currentStart + _j - 1], old[oldStart + _i - 1])) distances[_i][_j] = distances[_i - 1][_j - 1];else {
          var north = distances[_i - 1][_j] + 1;
          var west = distances[_i][_j - 1] + 1;
          distances[_i][_j] = north < west ? north : west;
        }
      }
    }

    return distances;
  }

  // This starts at the final weight, and walks "backward" by finding
  // the minimum previous weight recursively until the origin of the weight
  // matrix.
  function spliceOperationsFromEditDistances(distances) {
    var i = distances.length - 1;
    var j = distances[0].length - 1;
    var current = distances[i][j];
    var edits = [];
    while (i > 0 || j > 0) {
      if (i == 0) {
        edits.push(EDIT_ADD);
        j--;
        continue;
      }
      if (j == 0) {
        edits.push(EDIT_DELETE);
        i--;
        continue;
      }
      var northWest = distances[i - 1][j - 1];
      var west = distances[i - 1][j];
      var north = distances[i][j - 1];

      var min = void 0;
      if (west < north) min = west < northWest ? west : northWest;else min = north < northWest ? north : northWest;

      if (min == northWest) {
        if (northWest == current) {
          edits.push(EDIT_LEAVE);
        } else {
          edits.push(EDIT_UPDATE);
          current = northWest;
        }
        i--;
        j--;
      } else if (min == west) {
        edits.push(EDIT_DELETE);
        i--;
        current = west;
      } else {
        edits.push(EDIT_ADD);
        j--;
        current = north;
      }
    }

    edits.reverse();
    return edits;
  }

  /**
   * Splice Projection functions:
   *
   * A splice map is a representation of how a previous array of items
   * was transformed into a new array of items. Conceptually it is a list of
   * tuples of
   *
   *   <index, removed, addedCount>
   *
   * which are kept in ascending index order of. The tuple represents that at
   * the |index|, |removed| sequence of items were removed, and counting forward
   * from |index|, |addedCount| items were added.
   */

  /**
   * Lacking individual splice mutation information, the minimal set of
   * splices can be synthesized given the previous state and final state of an
   * array. The basic approach is to calculate the edit distance matrix and
   * choose the shortest path through it.
   *
   * Complexity: O(l * p)
   *   l: The length of the current array
   *   p: The length of the old array
   *
   * @param {!Array} current The current "changed" array for which to
   * calculate splices.
   * @param {number} currentStart Starting index in the `current` array for
   * which splices are calculated.
   * @param {number} currentEnd Ending index in the `current` array for
   * which splices are calculated.
   * @param {!Array} old The original "unchanged" array to compare `current`
   * against to determine splices.
   * @param {number} oldStart Starting index in the `old` array for
   * which splices are calculated.
   * @param {number} oldEnd Ending index in the `old` array for
   * which splices are calculated.
   * @return {!Array} Returns an array of splice record objects. Each of these
   * contains: `index` the location where the splice occurred; `removed`
   * the array of removed items from this location; `addedCount` the number
   * of items added at this location.
   */
  function calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd) {
    var prefixCount = 0;
    var suffixCount = 0;
    var splice = void 0;

    var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
    if (currentStart == 0 && oldStart == 0) prefixCount = sharedPrefix(current, old, minLength);

    if (currentEnd == current.length && oldEnd == old.length) suffixCount = sharedSuffix(current, old, minLength - prefixCount);

    currentStart += prefixCount;
    oldStart += prefixCount;
    currentEnd -= suffixCount;
    oldEnd -= suffixCount;

    if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0) return [];

    if (currentStart == currentEnd) {
      splice = newSplice(currentStart, [], 0);
      while (oldStart < oldEnd) {
        splice.removed.push(old[oldStart++]);
      }return [splice];
    } else if (oldStart == oldEnd) return [newSplice(currentStart, [], currentEnd - currentStart)];

    var ops = spliceOperationsFromEditDistances(calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));

    splice = undefined;
    var splices = [];
    var index = currentStart;
    var oldIndex = oldStart;
    for (var i = 0; i < ops.length; i++) {
      switch (ops[i]) {
        case EDIT_LEAVE:
          if (splice) {
            splices.push(splice);
            splice = undefined;
          }

          index++;
          oldIndex++;
          break;
        case EDIT_UPDATE:
          if (!splice) splice = newSplice(index, [], 0);

          splice.addedCount++;
          index++;

          splice.removed.push(old[oldIndex]);
          oldIndex++;
          break;
        case EDIT_ADD:
          if (!splice) splice = newSplice(index, [], 0);

          splice.addedCount++;
          index++;
          break;
        case EDIT_DELETE:
          if (!splice) splice = newSplice(index, [], 0);

          splice.removed.push(old[oldIndex]);
          oldIndex++;
          break;
      }
    }

    if (splice) {
      splices.push(splice);
    }
    return splices;
  }

  function sharedPrefix(current, old, searchLength) {
    for (var i = 0; i < searchLength; i++) {
      if (!equals(current[i], old[i])) return i;
    }return searchLength;
  }

  function sharedSuffix(current, old, searchLength) {
    var index1 = current.length;
    var index2 = old.length;
    var count = 0;
    while (count < searchLength && equals(current[--index1], old[--index2])) {
      count++;
    }return count;
  }

  /**
   * Returns an array of splice records indicating the minimum edits required
   * to transform the `previous` array into the `current` array.
   *
   * Splice records are ordered by index and contain the following fields:
   * - `index`: index where edit started
   * - `removed`: array of removed items from this index
   * - `addedCount`: number of items added at this index
   *
   * This function is based on the Levenshtein "minimum edit distance"
   * algorithm. Note that updates are treated as removal followed by addition.
   *
   * The worst-case time complexity of this algorithm is `O(l * p)`
   *   l: The length of the current array
   *   p: The length of the previous array
   *
   * However, the worst-case complexity is reduced by an `O(n)` optimization
   * to detect any shared prefix & suffix between the two arrays and only
   * perform the more expensive minimum edit distance calculation over the
   * non-shared portions of the arrays.
   *
   * @function
   * @param {!Array} current The "changed" array for which splices will be
   * calculated.
   * @param {!Array} previous The "unchanged" original array to compare
   * `current` against to determine the splices.
   * @return {!Array} Returns an array of splice record objects. Each of these
   * contains: `index` the location where the splice occurred; `removed`
   * the array of removed items from this location; `addedCount` the number
   * of items added at this location.
   */
  function calculateSplices(current, previous) {
    return calcSplices(current, 0, current.length, previous, 0, previous.length);
  }

  function equals(currentValue, previousValue) {
    return currentValue === previousValue;
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * Returns true if `node` is a slot element
   * @param {Node} node Node to test.
   * @return {boolean} Returns true if the given `node` is a slot
   * @private
   */
  function isSlot(node) {
    return node.localName === 'slot';
  }

  /**
   * Class that listens for changes (additions or removals) to
   * "flattened nodes" on a given `node`. The list of flattened nodes consists
   * of a node's children and, for any children that are `<slot>` elements,
   * the expanded flattened list of `assignedNodes`.
   * For example, if the observed node has children `<a></a><slot></slot><b></b>`
   * and the `<slot>` has one `<div>` assigned to it, then the flattened
   * nodes list is `<a></a><div></div><b></b>`. If the `<slot>` has other
   * `<slot>` elements assigned to it, these are flattened as well.
   *
   * The provided `callback` is called whenever any change to this list
   * of flattened nodes occurs, where an addition or removal of a node is
   * considered a change. The `callback` is called with one argument, an object
   * containing an array of any `addedNodes` and `removedNodes`.
   *
   * Note: the callback is called asynchronous to any changes
   * at a microtask checkpoint. This is because observation is performed using
   * `MutationObserver` and the `<slot>` element's `slotchange` event which
   * are asynchronous.
   *
   * An example:
   * ```js
   * class TestSelfObserve extends PolymerElement {
   *   static get is() { return 'test-self-observe';}
   *   connectedCallback() {
   *     super.connectedCallback();
   *     this._observer = new FlattenedNodesObserver(this, (info) => {
   *       this.info = info;
   *     });
   *   }
   *   disconnectedCallback() {
   *     super.disconnectedCallback();
   *     this._observer.disconnect();
   *   }
   * }
   * customElements.define(TestSelfObserve.is, TestSelfObserve);
   * ```
   *
   * @summary Class that listens for changes (additions or removals) to
   * "flattened nodes" on a given `node`.
   */
  var FlattenedNodesObserver = function () {
    createClass(FlattenedNodesObserver, null, [{
      key: 'getFlattenedNodes',


      /**
       * Returns the list of flattened nodes for the given `node`.
       * This list consists of a node's children and, for any children
       * that are `<slot>` elements, the expanded flattened list of `assignedNodes`.
       * For example, if the observed node has children `<a></a><slot></slot><b></b>`
       * and the `<slot>` has one `<div>` assigned to it, then the flattened
       * nodes list is `<a></a><div></div><b></b>`. If the `<slot>` has other
       * `<slot>` elements assigned to it, these are flattened as well.
       *
       * @param {HTMLElement|HTMLSlotElement} node The node for which to return the list of flattened nodes.
       * @return {Array} The list of flattened nodes for the given `node`.
      */
      value: function getFlattenedNodes(node) {
        if (isSlot(node)) {
          node = /** @type {HTMLSlotElement} */node; // eslint-disable-line no-self-assign
          return node.assignedNodes({ flatten: true });
        } else {
          return Array.from(node.childNodes).map(function (node) {
            if (isSlot(node)) {
              node = /** @type {HTMLSlotElement} */node; // eslint-disable-line no-self-assign
              return node.assignedNodes({ flatten: true });
            } else {
              return [node];
            }
          }).reduce(function (a, b) {
            return a.concat(b);
          }, []);
        }
      }

      /**
       * @param {Element} target Node on which to listen for changes.
       * @param {?function(!Element, { target: !Element, addedNodes: !Array<!Element>, removedNodes: !Array<!Element> }):void} callback Function called when there are additions
       * or removals from the target's list of flattened nodes.
      */

    }]);

    function FlattenedNodesObserver(target, callback) {
      var _this = this;

      classCallCheck(this, FlattenedNodesObserver);

      /**
       * @type {MutationObserver}
       * @private
       */
      this._shadyChildrenObserver = null;
      /**
       * @type {MutationObserver}
       * @private
       */
      this._nativeChildrenObserver = null;
      this._connected = false;
      /**
       * @type {Element}
       * @private
       */
      this._target = target;
      this.callback = callback;
      this._effectiveNodes = [];
      this._observer = null;
      this._scheduled = false;
      /**
       * @type {function()}
       * @private
       */
      this._boundSchedule = function () {
        _this._schedule();
      };
      this.connect();
      this._schedule();
    }

    /**
     * Activates an observer. This method is automatically called when
     * a `FlattenedNodesObserver` is created. It should only be called to
     * re-activate an observer that has been deactivated via the `disconnect` method.
     *
     * @return {void}
     */


    createClass(FlattenedNodesObserver, [{
      key: 'connect',
      value: function connect() {
        var _this2 = this;

        if (isSlot(this._target)) {
          this._listenSlots([this._target]);
        } else if (this._target.children) {
          this._listenSlots(this._target.children);
          if (window.ShadyDOM) {
            this._shadyChildrenObserver = ShadyDOM.observeChildren(this._target, function (mutations) {
              _this2._processMutations(mutations);
            });
          } else {
            this._nativeChildrenObserver = new MutationObserver(function (mutations) {
              _this2._processMutations(mutations);
            });
            this._nativeChildrenObserver.observe(this._target, { childList: true });
          }
        }
        this._connected = true;
      }

      /**
       * Deactivates the flattened nodes observer. After calling this method
       * the observer callback will not be called when changes to flattened nodes
       * occur. The `connect` method may be subsequently called to reactivate
       * the observer.
       *
       * @return {void}
       */

    }, {
      key: 'disconnect',
      value: function disconnect() {
        if (isSlot(this._target)) {
          this._unlistenSlots([this._target]);
        } else if (this._target.children) {
          this._unlistenSlots(this._target.children);
          if (window.ShadyDOM && this._shadyChildrenObserver) {
            ShadyDOM.unobserveChildren(this._shadyChildrenObserver);
            this._shadyChildrenObserver = null;
          } else if (this._nativeChildrenObserver) {
            this._nativeChildrenObserver.disconnect();
            this._nativeChildrenObserver = null;
          }
        }
        this._connected = false;
      }

      /**
       * @return {void}
       * @private
       */

    }, {
      key: '_schedule',
      value: function _schedule() {
        var _this3 = this;

        if (!this._scheduled) {
          this._scheduled = true;
          microTask.run(function () {
            return _this3.flush();
          });
        }
      }

      /**
       * @param {Array<MutationRecord>} mutations Mutations signaled by the mutation observer
       * @return {void}
       * @private
       */

    }, {
      key: '_processMutations',
      value: function _processMutations(mutations) {
        this._processSlotMutations(mutations);
        this.flush();
      }

      /**
       * @param {Array<MutationRecord>} mutations Mutations signaled by the mutation observer
       * @return {void}
       * @private
       */

    }, {
      key: '_processSlotMutations',
      value: function _processSlotMutations(mutations) {
        if (mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var mutation = mutations[i];
            if (mutation.addedNodes) {
              this._listenSlots(mutation.addedNodes);
            }
            if (mutation.removedNodes) {
              this._unlistenSlots(mutation.removedNodes);
            }
          }
        }
      }

      /**
       * Flushes the observer causing any pending changes to be immediately
       * delivered the observer callback. By default these changes are delivered
       * asynchronously at the next microtask checkpoint.
       *
       * @return {boolean} Returns true if any pending changes caused the observer
       * callback to run.
       */

    }, {
      key: 'flush',
      value: function flush() {
        if (!this._connected) {
          return false;
        }
        if (window.ShadyDOM) {
          ShadyDOM.flush();
        }
        if (this._nativeChildrenObserver) {
          this._processSlotMutations(this._nativeChildrenObserver.takeRecords());
        } else if (this._shadyChildrenObserver) {
          this._processSlotMutations(this._shadyChildrenObserver.takeRecords());
        }
        this._scheduled = false;
        var info = {
          target: this._target,
          addedNodes: [],
          removedNodes: []
        };
        var newNodes = this.constructor.getFlattenedNodes(this._target);
        var splices = calculateSplices(newNodes, this._effectiveNodes);
        // process removals
        for (var i = 0, s; i < splices.length && (s = splices[i]); i++) {
          for (var j = 0, n; j < s.removed.length && (n = s.removed[j]); j++) {
            info.removedNodes.push(n);
          }
        }
        // process adds
        for (var _i = 0, _s; _i < splices.length && (_s = splices[_i]); _i++) {
          for (var _j = _s.index; _j < _s.index + _s.addedCount; _j++) {
            info.addedNodes.push(newNodes[_j]);
          }
        }
        // update cache
        this._effectiveNodes = newNodes;
        var didFlush = false;
        if (info.addedNodes.length || info.removedNodes.length) {
          didFlush = true;
          this.callback.call(this._target, info);
        }
        return didFlush;
      }

      /**
       * @param {!Array<Element|Node>|!NodeList<Node>} nodeList Nodes that could change
       * @return {void}
       * @private
       */

    }, {
      key: '_listenSlots',
      value: function _listenSlots(nodeList) {
        for (var i = 0; i < nodeList.length; i++) {
          var n = nodeList[i];
          if (isSlot(n)) {
            n.addEventListener('slotchange', this._boundSchedule);
          }
        }
      }

      /**
       * @param {!Array<Element|Node>|!NodeList<Node>} nodeList Nodes that could change
       * @return {void}
       * @private
       */

    }, {
      key: '_unlistenSlots',
      value: function _unlistenSlots(nodeList) {
        for (var i = 0; i < nodeList.length; i++) {
          var n = nodeList[i];
          if (isSlot(n)) {
            n.removeEventListener('slotchange', this._boundSchedule);
          }
        }
      }
    }]);
    return FlattenedNodesObserver;
  }();

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var debouncerQueue = [];

  /**
   * Adds a `Debouncer` to a list of globally flushable tasks.
   *
   * @param {!Debouncer} debouncer Debouncer to enqueue
   * @return {void}
   */
  var enqueueDebouncer = function enqueueDebouncer(debouncer) {
    debouncerQueue.push(debouncer);
  };

  function flushDebouncers() {
    var didFlush = Boolean(debouncerQueue.length);
    while (debouncerQueue.length) {
      try {
        debouncerQueue.shift().flush();
      } catch (e) {
        setTimeout(function () {
          throw e;
        });
      }
    }
    return didFlush;
  }

  /**
   * Forces several classes of asynchronously queued tasks to flush:
   * - Debouncers added via `enqueueDebouncer`
   * - ShadyDOM distribution
   *
   * @return {void}
   */
  var flush$1 = function flush() {
    var shadyDOM = void 0,
        debouncers = void 0;
    do {
      shadyDOM = window.ShadyDOM && ShadyDOM.flush();
      if (window.ShadyCSS && window.ShadyCSS.ScopingShim) {
        window.ShadyCSS.ScopingShim.flush();
      }
      debouncers = flushDebouncers();
    } while (shadyDOM || debouncers);
  };

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var p = Element.prototype;
  /**
   * @const {function(this:Node, string): boolean}
   */
  var normalizedMatchesSelector = p.matches || p.matchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector || p.webkitMatchesSelector;

  /**
   * Cross-platform `element.matches` shim.
   *
   * @function matchesSelector
   * @param {!Node} node Node to check selector against
   * @param {string} selector Selector to match
   * @return {boolean} True if node matched selector
   */
  var matchesSelector = function matchesSelector(node, selector) {
    return normalizedMatchesSelector.call(node, selector);
  };

  /**
   * Node API wrapper class returned from `Polymer.dom.(target)` when
   * `target` is a `Node`.
   *
   */
  var DomApi = function () {

    /**
     * @param {Node} node Node for which to create a Polymer.dom helper object.
     */
    function DomApi(node) {
      classCallCheck(this, DomApi);

      this.node = node;
    }

    /**
     * Returns an instance of `Polymer.FlattenedNodesObserver` that
     * listens for node changes on this element.
     *
     * @param {function(!Element, { target: !Element, addedNodes: !Array<!Element>, removedNodes: !Array<!Element> }):void} callback Called when direct or distributed children
     *   of this element changes
     * @return {!Polymer.FlattenedNodesObserver} Observer instance
     */


    createClass(DomApi, [{
      key: 'observeNodes',
      value: function observeNodes(callback) {
        return new FlattenedNodesObserver(this.node, callback);
      }

      /**
       * Disconnects an observer previously created via `observeNodes`
       *
       * @param {!Polymer.FlattenedNodesObserver} observerHandle Observer instance
       *   to disconnect.
       * @return {void}
       */

    }, {
      key: 'unobserveNodes',
      value: function unobserveNodes(observerHandle) {
        observerHandle.disconnect();
      }

      /**
       * Provided as a backwards-compatible API only.  This method does nothing.
       * @return {void}
       */

    }, {
      key: 'notifyObserver',
      value: function notifyObserver() {}

      /**
       * Returns true if the provided node is contained with this element's
       * light-DOM children or shadow root, including any nested shadow roots
       * of children therein.
       *
       * @param {Node} node Node to test
       * @return {boolean} Returns true if the given `node` is contained within
       *   this element's light or shadow DOM.
       */

    }, {
      key: 'deepContains',
      value: function deepContains(node) {
        if (this.node.contains(node)) {
          return true;
        }
        var n = node;
        var doc = node.ownerDocument;
        // walk from node to `this` or `document`
        while (n && n !== doc && n !== this.node) {
          // use logical parentnode, or native ShadowRoot host
          n = n.parentNode || n.host;
        }
        return n === this.node;
      }

      /**
       * Returns the root node of this node.  Equivalent to `getRoodNode()`.
       *
       * @return {Node} Top most element in the dom tree in which the node
       * exists. If the node is connected to a document this is either a
       * shadowRoot or the document; otherwise, it may be the node
       * itself or a node or document fragment containing it.
       */

    }, {
      key: 'getOwnerRoot',
      value: function getOwnerRoot() {
        return this.node.getRootNode();
      }

      /**
       * For slot elements, returns the nodes assigned to the slot; otherwise
       * an empty array. It is equivalent to `<slot>.addignedNodes({flatten:true})`.
       *
       * @return {!Array<!Node>} Array of assigned nodes
       */

    }, {
      key: 'getDistributedNodes',
      value: function getDistributedNodes() {
        return this.node.localName === 'slot' ? this.node.assignedNodes({ flatten: true }) : [];
      }

      /**
       * Returns an array of all slots this element was distributed to.
       *
       * @return {!Array<!HTMLSlotElement>} Description
       */

    }, {
      key: 'getDestinationInsertionPoints',
      value: function getDestinationInsertionPoints() {
        var ip$ = [];
        var n = this.node.assignedSlot;
        while (n) {
          ip$.push(n);
          n = n.assignedSlot;
        }
        return ip$;
      }

      /**
       * Calls `importNode` on the `ownerDocument` for this node.
       *
       * @param {!Node} node Node to import
       * @param {boolean} deep True if the node should be cloned deeply during
       *   import
       * @return {Node} Clone of given node imported to this owner document
       */

    }, {
      key: 'importNode',
      value: function importNode(node, deep) {
        var doc = this.node instanceof Document ? this.node : this.node.ownerDocument;
        return doc.importNode(node, deep);
      }

      /**
       * @return {!Array<!Node>} Returns a flattened list of all child nodes and
       * nodes assigned to child slots.
       */

    }, {
      key: 'getEffectiveChildNodes',
      value: function getEffectiveChildNodes() {
        return FlattenedNodesObserver.getFlattenedNodes(this.node);
      }

      /**
       * Returns a filtered list of flattened child elements for this element based
       * on the given selector.
       *
       * @param {string} selector Selector to filter nodes against
       * @return {!Array<!HTMLElement>} List of flattened child elements
       */

    }, {
      key: 'queryDistributedElements',
      value: function queryDistributedElements(selector) {
        var c$ = this.getEffectiveChildNodes();
        var list = [];
        for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
          if (c.nodeType === Node.ELEMENT_NODE && matchesSelector(c, selector)) {
            list.push(c);
          }
        }
        return list;
      }

      /**
       * For shadow roots, returns the currently focused element within this
       * shadow root.
       *
       * @return {Node|undefined} Currently focused element
       */

    }, {
      key: 'activeElement',
      get: function get$$1() {
        var node = this.node;
        return node._activeElement !== undefined ? node._activeElement : node.activeElement;
      }
    }]);
    return DomApi;
  }();

  function forwardMethods(proto, methods) {
    var _loop = function _loop(i) {
      var method = methods[i];
      /* eslint-disable valid-jsdoc */
      proto[method] = /** @this {DomApi} */function () {
        return this.node[method].apply(this.node, arguments);
      };
      /* eslint-enable */
    };

    for (var i = 0; i < methods.length; i++) {
      _loop(i);
    }
  }

  function forwardReadOnlyProperties(proto, properties) {
    var _loop2 = function _loop2(i) {
      var name = properties[i];
      Object.defineProperty(proto, name, {
        get: function get$$1() {
          var domApi = /** @type {DomApi} */this;
          return domApi.node[name];
        },
        configurable: true
      });
    };

    for (var i = 0; i < properties.length; i++) {
      _loop2(i);
    }
  }

  function forwardProperties(proto, properties) {
    var _loop3 = function _loop3(i) {
      var name = properties[i];
      Object.defineProperty(proto, name, {
        get: function get$$1() {
          var domApi = /** @type {DomApi} */this;
          return domApi.node[name];
        },
        set: function set$$1(value) {
          /** @type {DomApi} */this.node[name] = value;
        },
        configurable: true
      });
    };

    for (var i = 0; i < properties.length; i++) {
      _loop3(i);
    }
  }

  forwardMethods(DomApi.prototype, ['cloneNode', 'appendChild', 'insertBefore', 'removeChild', 'replaceChild', 'setAttribute', 'removeAttribute', 'querySelector', 'querySelectorAll']);

  forwardReadOnlyProperties(DomApi.prototype, ['parentNode', 'firstChild', 'lastChild', 'nextSibling', 'previousSibling', 'firstElementChild', 'lastElementChild', 'nextElementSibling', 'previousElementSibling', 'childNodes', 'children', 'classList']);

  forwardProperties(DomApi.prototype, ['textContent', 'innerHTML']);

  /**
   * Event API wrapper class returned from `Polymer.dom.(target)` when
   * `target` is an `Event`.
   */

  var EventApi = function () {
    function EventApi(event) {
      classCallCheck(this, EventApi);

      this.event = event;
    }

    /**
     * Returns the first node on the `composedPath` of this event.
     *
     * @return {!EventTarget} The node this event was dispatched to
     */


    createClass(EventApi, [{
      key: 'rootTarget',
      get: function get$$1() {
        return this.event.composedPath()[0];
      }

      /**
       * Returns the local (re-targeted) target for this event.
       *
       * @return {!EventTarget} The local (re-targeted) target for this event.
       */

    }, {
      key: 'localTarget',
      get: function get$$1() {
        return this.event.target;
      }

      /**
       * Returns the `composedPath` for this event.
       * @return {!Array<!EventTarget>} The nodes this event propagated through
       */

    }, {
      key: 'path',
      get: function get$$1() {
        return this.event.composedPath();
      }
    }]);
    return EventApi;
  }();

  /**
   * Legacy DOM and Event manipulation API wrapper factory used to abstract
   * differences between native Shadow DOM and "Shady DOM" when polyfilling on
   * older browsers.
   *
   * Note that in Polymer 2.x use of `Polymer.dom` is no longer required and
   * in the majority of cases simply facades directly to the standard native
   * API.
   *
   * @summary Legacy DOM and Event manipulation API wrapper factory used to
   * abstract differences between native Shadow DOM and "Shady DOM."
   * @param {(Node|Event)=} obj Node or event to operate on
   * @return {!DomApi|!EventApi} Wrapper providing either node API or event API
   */
  var dom = function dom(obj) {
    obj = obj || document;
    if (!obj.__domApi) {
      var helper = void 0;
      if (obj instanceof Event) {
        helper = new EventApi(obj);
      } else {
        helper = new DomApi(obj);
      }
      obj.__domApi = helper;
    }
    return obj.__domApi;
  };

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var styleInterface = window.ShadyCSS;

  /**
   * Element class mixin that provides Polymer's "legacy" API intended to be
   * backward-compatible to the greatest extent possible with the API
   * found on the Polymer 1.x `Polymer.Base` prototype applied to all elements
   * defined using the `Polymer({...})` function.
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin Polymer.ElementMixin
   * @appliesMixin Polymer.GestureEventListeners
   * @property isAttached {boolean} Set to `true` in this element's
   *   `connectedCallback` and `false` in `disconnectedCallback`
   * @summary Element class mixin that provides Polymer's "legacy" API
   */
  var LegacyElementMixin = dedupingMixin(function (base) {

    /**
     * @constructor
     * @extends {base}
     * @implements {Polymer_ElementMixin}
     * @implements {Polymer_GestureEventListeners}
     * @implements {Polymer_DirMixin}
     */
    var legacyElementBase = DirMixin(GestureEventListeners(ElementMixin(base)));

    /**
     * Map of simple names to touch action names
     * @dict
     */
    var DIRECTION_MAP = {
      'x': 'pan-x',
      'y': 'pan-y',
      'none': 'none',
      'all': 'auto'
    };

    /**
     * @polymer
     * @mixinClass
     * @extends {legacyElementBase}
     * @implements {Polymer_LegacyElementMixin}
     * @unrestricted
     */

    var LegacyElement = function (_legacyElementBase) {
      inherits(LegacyElement, _legacyElementBase);

      function LegacyElement() {
        classCallCheck(this, LegacyElement);

        /** @type {boolean} */
        var _this = possibleConstructorReturn(this, (LegacyElement.__proto__ || Object.getPrototypeOf(LegacyElement)).call(this));

        _this.isAttached;
        /** @type {WeakMap<!Element, !Object<string, !Function>>} */
        _this.__boundListeners;
        /** @type {Object<string, Function>} */
        _this._debouncers;
        // Ensure listeners are applied immediately so that they are
        // added before declarative event listeners. This allows an element to
        // decorate itself via an event prior to any declarative listeners
        // seeing the event. Note, this ensures compatibility with 1.x ordering.
        _this._applyListeners();
        return _this;
      }

      /**
       * Forwards `importMeta` from the prototype (i.e. from the info object
       * passed to `Polymer({...})`) to the static API.
       *
       * @return {!Object} The `import.meta` object set on the prototype
       * @suppress {missingProperties} `this` is always in the instance in
       *  closure for some reason even in a static method, rather than the class
       */


      createClass(LegacyElement, [{
        key: 'created',


        /**
         * Legacy callback called during the `constructor`, for overriding
         * by the user.
         * @return {void}
         */
        value: function created() {}

        /**
         * Provides an implementation of `connectedCallback`
         * which adds Polymer legacy API's `attached` method.
         * @return {void}
         * @override
         */

      }, {
        key: 'connectedCallback',
        value: function connectedCallback() {
          get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), 'connectedCallback', this).call(this);
          this.isAttached = true;
          this.attached();
        }

        /**
         * Legacy callback called during `connectedCallback`, for overriding
         * by the user.
         * @return {void}
         */

      }, {
        key: 'attached',
        value: function attached() {}

        /**
         * Provides an implementation of `disconnectedCallback`
         * which adds Polymer legacy API's `detached` method.
         * @return {void}
         * @override
         */

      }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {
          get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), 'disconnectedCallback', this).call(this);
          this.isAttached = false;
          this.detached();
        }

        /**
         * Legacy callback called during `disconnectedCallback`, for overriding
         * by the user.
         * @return {void}
         */

      }, {
        key: 'detached',
        value: function detached() {}

        /**
         * Provides an override implementation of `attributeChangedCallback`
         * which adds the Polymer legacy API's `attributeChanged` method.
         * @param {string} name Name of attribute.
         * @param {?string} old Old value of attribute.
         * @param {?string} value Current value of attribute.
         * @param {?string} namespace Attribute namespace.
         * @return {void}
         * @override
         */

      }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(name, old, value, namespace) {
          if (old !== value) {
            get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), 'attributeChangedCallback', this).call(this, name, old, value, namespace);
            this.attributeChanged(name, old, value);
          }
        }

        /**
         * Legacy callback called during `attributeChangedChallback`, for overriding
         * by the user.
         * @param {string} name Name of attribute.
         * @param {?string} old Old value of attribute.
         * @param {?string} value Current value of attribute.
         * @return {void}
         */

      }, {
        key: 'attributeChanged',
        value: function attributeChanged(name, old, value) {} // eslint-disable-line no-unused-vars

        /**
         * Overrides the default `Polymer.PropertyEffects` implementation to
         * add support for class initialization via the `_registered` callback.
         * This is called only when the first instance of the element is created.
         *
         * @return {void}
         * @override
         * @suppress {invalidCasts}
         */

      }, {
        key: '_initializeProperties',
        value: function _initializeProperties() {
          var proto = Object.getPrototypeOf(this);
          if (!proto.hasOwnProperty('__hasRegisterFinished')) {
            proto.__hasRegisterFinished = true;
            this._registered();
          }
          get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), '_initializeProperties', this).call(this);
          this.root = /** @type {HTMLElement} */this;
          this.created();
        }

        /**
         * Called automatically when an element is initializing.
         * Users may override this method to perform class registration time
         * work. The implementation should ensure the work is performed
         * only once for the class.
         * @protected
         * @return {void}
         */

      }, {
        key: '_registered',
        value: function _registered() {}

        /**
         * Overrides the default `Polymer.PropertyEffects` implementation to
         * add support for installing `hostAttributes` and `listeners`.
         *
         * @return {void}
         * @override
         */

      }, {
        key: 'ready',
        value: function ready() {
          this._ensureAttributes();
          get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), 'ready', this).call(this);
        }

        /**
         * Ensures an element has required attributes. Called when the element
         * is being readied via `ready`. Users should override to set the
         * element's required attributes. The implementation should be sure
         * to check and not override existing attributes added by
         * the user of the element. Typically, setting attributes should be left
         * to the element user and not done here; reasonable exceptions include
         * setting aria roles and focusability.
         * @protected
         * @return {void}
         */

      }, {
        key: '_ensureAttributes',
        value: function _ensureAttributes() {}

        /**
         * Adds element event listeners. Called when the element
         * is being readied via `ready`. Users should override to
         * add any required element event listeners.
         * In performance critical elements, the work done here should be kept
         * to a minimum since it is done before the element is rendered. In
         * these elements, consider adding listeners asynchronously so as not to
         * block render.
         * @protected
         * @return {void}
         */

      }, {
        key: '_applyListeners',
        value: function _applyListeners() {}

        /**
         * Converts a typed JavaScript value to a string.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features. To customize
         * how properties are serialized to attributes for attribute bindings and
         * `reflectToAttribute: true` properties as well as this method, override
         * the `_serializeValue` method provided by `Polymer.PropertyAccessors`.
         *
         * @param {*} value Value to deserialize
         * @return {string | undefined} Serialized value
         */

      }, {
        key: 'serialize',
        value: function serialize(value) {
          return this._serializeValue(value);
        }

        /**
         * Converts a string to a typed JavaScript value.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.  To customize
         * how attributes are deserialized to properties for in
         * `attributeChangedCallback`, override `_deserializeValue` method
         * provided by `Polymer.PropertyAccessors`.
         *
         * @param {string} value String to deserialize
         * @param {*} type Type to deserialize the string to
         * @return {*} Returns the deserialized value in the `type` given.
         */

      }, {
        key: 'deserialize',
        value: function deserialize(value, type) {
          return this._deserializeValue(value, type);
        }

        /**
         * Serializes a property to its associated attribute.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.
         *
         * @param {string} property Property name to reflect.
         * @param {string=} attribute Attribute name to reflect.
         * @param {*=} value Property value to reflect.
         * @return {void}
         */

      }, {
        key: 'reflectPropertyToAttribute',
        value: function reflectPropertyToAttribute(property, attribute, value) {
          this._propertyToAttribute(property, attribute, value);
        }

        /**
         * Sets a typed value to an HTML attribute on a node.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.
         *
         * @param {*} value Value to serialize.
         * @param {string} attribute Attribute name to serialize to.
         * @param {Element} node Element to set attribute to.
         * @return {void}
         */

      }, {
        key: 'serializeValueToAttribute',
        value: function serializeValueToAttribute(value, attribute, node) {
          this._valueToNodeAttribute( /** @type {Element} */node || this, value, attribute);
        }

        /**
         * Copies own properties (including accessor descriptors) from a source
         * object to a target object.
         *
         * @param {Object} prototype Target object to copy properties to.
         * @param {Object} api Source object to copy properties from.
         * @return {Object} prototype object that was passed as first argument.
         */

      }, {
        key: 'extend',
        value: function extend(prototype, api) {
          if (!(prototype && api)) {
            return prototype || api;
          }
          var n$ = Object.getOwnPropertyNames(api);
          for (var i = 0, n; i < n$.length && (n = n$[i]); i++) {
            var pd = Object.getOwnPropertyDescriptor(api, n);
            if (pd) {
              Object.defineProperty(prototype, n, pd);
            }
          }
          return prototype;
        }

        /**
         * Copies props from a source object to a target object.
         *
         * Note, this method uses a simple `for...in` strategy for enumerating
         * properties.  To ensure only `ownProperties` are copied from source
         * to target and that accessor implementations are copied, use `extend`.
         *
         * @param {!Object} target Target object to copy properties to.
         * @param {!Object} source Source object to copy properties from.
         * @return {!Object} Target object that was passed as first argument.
         */

      }, {
        key: 'mixin',
        value: function mixin(target, source) {
          for (var i in source) {
            target[i] = source[i];
          }
          return target;
        }

        /**
         * Sets the prototype of an object.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.
         * @param {Object} object The object on which to set the prototype.
         * @param {Object} prototype The prototype that will be set on the given
         * `object`.
         * @return {Object} Returns the given `object` with its prototype set
         * to the given `prototype` object.
         */

      }, {
        key: 'chainObject',
        value: function chainObject(object, prototype) {
          if (object && prototype && object !== prototype) {
            object.__proto__ = prototype;
          }
          return object;
        }

        /* **** Begin Template **** */

        /**
         * Calls `importNode` on the `content` of the `template` specified and
         * returns a document fragment containing the imported content.
         *
         * @param {HTMLTemplateElement} template HTML template element to instance.
         * @return {!DocumentFragment} Document fragment containing the imported
         *   template content.
        */

      }, {
        key: 'instanceTemplate',
        value: function instanceTemplate(template) {
          var content = this.constructor._contentForTemplate(template);
          var dom$$1 = /** @type {!DocumentFragment} */
          document.importNode(content, true);
          return dom$$1;
        }

        /* **** Begin Events **** */

        /**
         * Dispatches a custom event with an optional detail value.
         *
         * @param {string} type Name of event type.
         * @param {*=} detail Detail value containing event-specific
         *   payload.
         * @param {{ bubbles: (boolean|undefined), cancelable: (boolean|undefined), composed: (boolean|undefined) }=}
         *  options Object specifying options.  These may include:
         *  `bubbles` (boolean, defaults to `true`),
         *  `cancelable` (boolean, defaults to false), and
         *  `node` on which to fire the event (HTMLElement, defaults to `this`).
         * @return {!Event} The new event that was fired.
         */

      }, {
        key: 'fire',
        value: function fire(type, detail, options) {
          options = options || {};
          detail = detail === null || detail === undefined ? {} : detail;
          var event = new Event(type, {
            bubbles: options.bubbles === undefined ? true : options.bubbles,
            cancelable: Boolean(options.cancelable),
            composed: options.composed === undefined ? true : options.composed
          });
          event.detail = detail;
          var node = options.node || this;
          node.dispatchEvent(event);
          return event;
        }

        /**
         * Convenience method to add an event listener on a given element,
         * late bound to a named method on this element.
         *
         * @param {Element} node Element to add event listener to.
         * @param {string} eventName Name of event to listen for.
         * @param {string} methodName Name of handler method on `this` to call.
         * @return {void}
         */

      }, {
        key: 'listen',
        value: function listen(node, eventName, methodName) {
          node = /** @type {!Element} */node || this;
          var hbl = this.__boundListeners || (this.__boundListeners = new WeakMap());
          var bl = hbl.get(node);
          if (!bl) {
            bl = {};
            hbl.set(node, bl);
          }
          var key = eventName + methodName;
          if (!bl[key]) {
            bl[key] = this._addMethodEventListenerToNode(node, eventName, methodName, this);
          }
        }

        /**
         * Convenience method to remove an event listener from a given element,
         * late bound to a named method on this element.
         *
         * @param {Element} node Element to remove event listener from.
         * @param {string} eventName Name of event to stop listening to.
         * @param {string} methodName Name of handler method on `this` to not call
         anymore.
         * @return {void}
         */

      }, {
        key: 'unlisten',
        value: function unlisten(node, eventName, methodName) {
          node = /** @type {!Element} */node || this;
          var bl = this.__boundListeners && this.__boundListeners.get(node);
          var key = eventName + methodName;
          var handler = bl && bl[key];
          if (handler) {
            this._removeEventListenerFromNode(node, eventName, handler);
            bl[key] = null;
          }
        }

        /**
         * Override scrolling behavior to all direction, one direction, or none.
         *
         * Valid scroll directions:
         *   - 'all': scroll in any direction
         *   - 'x': scroll only in the 'x' direction
         *   - 'y': scroll only in the 'y' direction
         *   - 'none': disable scrolling for this node
         *
         * @param {string=} direction Direction to allow scrolling
         * Defaults to `all`.
         * @param {Element=} node Element to apply scroll direction setting.
         * Defaults to `this`.
         * @return {void}
         */

      }, {
        key: 'setScrollDirection',
        value: function setScrollDirection(direction, node) {
          setTouchAction(node || this, DIRECTION_MAP[direction] || 'auto');
        }
        /* **** End Events **** */

        /**
         * Convenience method to run `querySelector` on this local DOM scope.
         *
         * This function calls `Polymer.dom(this.root).querySelector(slctr)`.
         *
         * @param {string} slctr Selector to run on this local DOM scope
         * @return {Element} Element found by the selector, or null if not found.
         */

      }, {
        key: '$$',
        value: function $$(slctr) {
          return this.root.querySelector(slctr);
        }

        /**
         * Return the element whose local dom within which this element
         * is contained. This is a shorthand for
         * `this.getRootNode().host`.
         * @this {Element}
         */

      }, {
        key: 'distributeContent',


        /**
         * Force this element to distribute its children to its local dom.
         * This should not be necessary as of Polymer 2.0.2 and is provided only
         * for backwards compatibility.
         * @return {void}
         */
        value: function distributeContent() {
          if (window.ShadyDOM && this.shadowRoot) {
            ShadyDOM.flush();
          }
        }

        /**
         * Returns a list of nodes that are the effective childNodes. The effective
         * childNodes list is the same as the element's childNodes except that
         * any `<content>` elements are replaced with the list of nodes distributed
         * to the `<content>`, the result of its `getDistributedNodes` method.
         * @return {!Array<!Node>} List of effective child nodes.
         * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
         */

      }, {
        key: 'getEffectiveChildNodes',
        value: function getEffectiveChildNodes() {
          var thisEl = /** @type {Element} */this;
          var domApi = /** @type {Polymer.DomApi} */dom(thisEl);
          return domApi.getEffectiveChildNodes();
        }

        /**
         * Returns a list of nodes distributed within this element that match
         * `selector`. These can be dom children or elements distributed to
         * children that are insertion points.
         * @param {string} selector Selector to run.
         * @return {!Array<!Node>} List of distributed elements that match selector.
         * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
         */

      }, {
        key: 'queryDistributedElements',
        value: function queryDistributedElements(selector) {
          var thisEl = /** @type {Element} */this;
          var domApi = /** @type {Polymer.DomApi} */dom(thisEl);
          return domApi.queryDistributedElements(selector);
        }

        /**
         * Returns a list of elements that are the effective children. The effective
         * children list is the same as the element's children except that
         * any `<content>` elements are replaced with the list of elements
         * distributed to the `<content>`.
         *
         * @return {!Array<!Node>} List of effective children.
         */

      }, {
        key: 'getEffectiveChildren',
        value: function getEffectiveChildren() {
          var list = this.getEffectiveChildNodes();
          return list.filter(function ( /** @type {!Node} */n) {
            return n.nodeType === Node.ELEMENT_NODE;
          });
        }

        /**
         * Returns a string of text content that is the concatenation of the
         * text content's of the element's effective childNodes (the elements
         * returned by <a href="#getEffectiveChildNodes>getEffectiveChildNodes</a>.
         *
         * @return {string} List of effective children.
         */

      }, {
        key: 'getEffectiveTextContent',
        value: function getEffectiveTextContent() {
          var cn = this.getEffectiveChildNodes();
          var tc = [];
          for (var i = 0, c; c = cn[i]; i++) {
            if (c.nodeType !== Node.COMMENT_NODE) {
              tc.push(c.textContent);
            }
          }
          return tc.join('');
        }

        /**
         * Returns the first effective childNode within this element that
         * match `selector`. These can be dom child nodes or elements distributed
         * to children that are insertion points.
         * @param {string} selector Selector to run.
         * @return {Node} First effective child node that matches selector.
         */

      }, {
        key: 'queryEffectiveChildren',
        value: function queryEffectiveChildren(selector) {
          var e$ = this.queryDistributedElements(selector);
          return e$ && e$[0];
        }

        /**
         * Returns a list of effective childNodes within this element that
         * match `selector`. These can be dom child nodes or elements distributed
         * to children that are insertion points.
         * @param {string} selector Selector to run.
         * @return {!Array<!Node>} List of effective child nodes that match selector.
         */

      }, {
        key: 'queryAllEffectiveChildren',
        value: function queryAllEffectiveChildren(selector) {
          return this.queryDistributedElements(selector);
        }

        /**
         * Returns a list of nodes distributed to this element's `<slot>`.
         *
         * If this element contains more than one `<slot>` in its local DOM,
         * an optional selector may be passed to choose the desired content.
         *
         * @param {string=} slctr CSS selector to choose the desired
         *   `<slot>`.  Defaults to `content`.
         * @return {!Array<!Node>} List of distributed nodes for the `<slot>`.
         */

      }, {
        key: 'getContentChildNodes',
        value: function getContentChildNodes(slctr) {
          var content = this.root.querySelector(slctr || 'slot');
          return content ? /** @type {Polymer.DomApi} */dom(content).getDistributedNodes() : [];
        }

        /**
         * Returns a list of element children distributed to this element's
         * `<slot>`.
         *
         * If this element contains more than one `<slot>` in its
         * local DOM, an optional selector may be passed to choose the desired
         * content.  This method differs from `getContentChildNodes` in that only
         * elements are returned.
         *
         * @param {string=} slctr CSS selector to choose the desired
         *   `<content>`.  Defaults to `content`.
         * @return {!Array<!HTMLElement>} List of distributed nodes for the
         *   `<slot>`.
         * @suppress {invalidCasts}
         */

      }, {
        key: 'getContentChildren',
        value: function getContentChildren(slctr) {
          var children = /** @type {!Array<!HTMLElement>} */this.getContentChildNodes(slctr).filter(function (n) {
            return n.nodeType === Node.ELEMENT_NODE;
          });
          return children;
        }

        /**
         * Checks whether an element is in this element's light DOM tree.
         *
         * @param {?Node} node The element to be checked.
         * @return {boolean} true if node is in this element's light DOM tree.
         * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
         */

      }, {
        key: 'isLightDescendant',
        value: function isLightDescendant(node) {
          var thisNode = /** @type {Node} */this;
          return thisNode !== node && thisNode.contains(node) && thisNode.getRootNode() === node.getRootNode();
        }

        /**
         * Checks whether an element is in this element's local DOM tree.
         *
         * @param {!Element} node The element to be checked.
         * @return {boolean} true if node is in this element's local DOM tree.
         */

      }, {
        key: 'isLocalDescendant',
        value: function isLocalDescendant(node) {
          return this.root === node.getRootNode();
        }

        /**
         * No-op for backwards compatibility. This should now be handled by
         * ShadyCss library.
         * @param  {*} container Unused
         * @param  {*} shouldObserve Unused
         * @return {void}
         */

      }, {
        key: 'scopeSubtree',
        value: function scopeSubtree(container, shouldObserve) {} // eslint-disable-line no-unused-vars


        /**
         * Returns the computed style value for the given property.
         * @param {string} property The css property name.
         * @return {string} Returns the computed css property value for the given
         * `property`.
         * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
         */

      }, {
        key: 'getComputedStyleValue',
        value: function getComputedStyleValue(property) {
          return styleInterface.getComputedStyleValue( /** @type {!Element} */this, property);
        }

        // debounce

        /**
         * Call `debounce` to collapse multiple requests for a named task into
         * one invocation which is made after the wait time has elapsed with
         * no new request.  If no wait time is given, the callback will be called
         * at microtask timing (guaranteed before paint).
         *
         *     debouncedClickAction(e) {
         *       // will not call `processClick` more than once per 100ms
         *       this.debounce('click', function() {
         *        this.processClick();
         *       } 100);
         *     }
         *
         * @param {string} jobName String to identify the debounce job.
         * @param {function():void} callback Function that is called (with `this`
         *   context) when the wait time elapses.
         * @param {number} wait Optional wait time in milliseconds (ms) after the
         *   last signal that must elapse before invoking `callback`
         * @return {!Object} Returns a debouncer object on which exists the
         * following methods: `isActive()` returns true if the debouncer is
         * active; `cancel()` cancels the debouncer if it is active;
         * `flush()` immediately invokes the debounced callback if the debouncer
         * is active.
         */

      }, {
        key: 'debounce',
        value: function debounce(jobName, callback, wait) {
          this._debouncers = this._debouncers || {};
          return this._debouncers[jobName] = Debouncer.debounce(this._debouncers[jobName], wait > 0 ? timeOut.after(wait) : microTask, callback.bind(this));
        }

        /**
         * Returns whether a named debouncer is active.
         *
         * @param {string} jobName The name of the debouncer started with `debounce`
         * @return {boolean} Whether the debouncer is active (has not yet fired).
         */

      }, {
        key: 'isDebouncerActive',
        value: function isDebouncerActive(jobName) {
          this._debouncers = this._debouncers || {};
          var debouncer = this._debouncers[jobName];
          return !!(debouncer && debouncer.isActive());
        }

        /**
         * Immediately calls the debouncer `callback` and inactivates it.
         *
         * @param {string} jobName The name of the debouncer started with `debounce`
         * @return {void}
         */

      }, {
        key: 'flushDebouncer',
        value: function flushDebouncer(jobName) {
          this._debouncers = this._debouncers || {};
          var debouncer = this._debouncers[jobName];
          if (debouncer) {
            debouncer.flush();
          }
        }

        /**
         * Cancels an active debouncer.  The `callback` will not be called.
         *
         * @param {string} jobName The name of the debouncer started with `debounce`
         * @return {void}
         */

      }, {
        key: 'cancelDebouncer',
        value: function cancelDebouncer(jobName) {
          this._debouncers = this._debouncers || {};
          var debouncer = this._debouncers[jobName];
          if (debouncer) {
            debouncer.cancel();
          }
        }

        /**
         * Runs a callback function asynchronously.
         *
         * By default (if no waitTime is specified), async callbacks are run at
         * microtask timing, which will occur before paint.
         *
         * @param {!Function} callback The callback function to run, bound to `this`.
         * @param {number=} waitTime Time to wait before calling the
         *   `callback`.  If unspecified or 0, the callback will be run at microtask
         *   timing (before paint).
         * @return {number} Handle that may be used to cancel the async job.
         */

      }, {
        key: 'async',
        value: function async(callback, waitTime) {
          return waitTime > 0 ? timeOut.run(callback.bind(this), waitTime) : ~microTask.run(callback.bind(this));
        }

        /**
         * Cancels an async operation started with `async`.
         *
         * @param {number} handle Handle returned from original `async` call to
         *   cancel.
         * @return {void}
         */

      }, {
        key: 'cancelAsync',
        value: function cancelAsync(handle) {
          handle < 0 ? microTask.cancel(~handle) : timeOut.cancel(handle);
        }

        // other

        /**
         * Convenience method for creating an element and configuring it.
         *
         * @param {string} tag HTML element tag to create.
         * @param {Object=} props Object of properties to configure on the
         *    instance.
         * @return {!Element} Newly created and configured element.
         */

      }, {
        key: 'create',
        value: function create(tag, props) {
          var elt = document.createElement(tag);
          if (props) {
            if (elt.setProperties) {
              elt.setProperties(props);
            } else {
              for (var n in props) {
                elt[n] = props[n];
              }
            }
          }
          return elt;
        }

        /**
         * Polyfill for Element.prototype.matches, which is sometimes still
         * prefixed.
         *
         * @param {string} selector Selector to test.
         * @param {!Element=} node Element to test the selector against.
         * @return {boolean} Whether the element matches the selector.
         */

      }, {
        key: 'elementMatches',
        value: function elementMatches(selector, node) {
          return matchesSelector(node || this, selector);
        }

        /**
         * Toggles an HTML attribute on or off.
         *
         * @param {string} name HTML attribute name
         * @param {boolean=} bool Boolean to force the attribute on or off.
         *    When unspecified, the state of the attribute will be reversed.
         * @param {Element=} node Node to target.  Defaults to `this`.
         * @return {void}
         */

      }, {
        key: 'toggleAttribute',
        value: function toggleAttribute(name, bool, node) {
          node = /** @type {Element} */node || this;
          if (arguments.length == 1) {
            bool = !node.hasAttribute(name);
          }
          if (bool) {
            node.setAttribute(name, '');
          } else {
            node.removeAttribute(name);
          }
        }

        /**
         * Toggles a CSS class on or off.
         *
         * @param {string} name CSS class name
         * @param {boolean=} bool Boolean to force the class on or off.
         *    When unspecified, the state of the class will be reversed.
         * @param {Element=} node Node to target.  Defaults to `this`.
         * @return {void}
         */

      }, {
        key: 'toggleClass',
        value: function toggleClass(name, bool, node) {
          node = /** @type {Element} */node || this;
          if (arguments.length == 1) {
            bool = !node.classList.contains(name);
          }
          if (bool) {
            node.classList.add(name);
          } else {
            node.classList.remove(name);
          }
        }

        /**
         * Cross-platform helper for setting an element's CSS `transform` property.
         *
         * @param {string} transformText Transform setting.
         * @param {Element=} node Element to apply the transform to.
         * Defaults to `this`
         * @return {void}
         */

      }, {
        key: 'transform',
        value: function transform(transformText, node) {
          node = /** @type {Element} */node || this;
          node.style.webkitTransform = transformText;
          node.style.transform = transformText;
        }

        /**
         * Cross-platform helper for setting an element's CSS `translate3d`
         * property.
         *
         * @param {number} x X offset.
         * @param {number} y Y offset.
         * @param {number} z Z offset.
         * @param {Element=} node Element to apply the transform to.
         * Defaults to `this`.
         * @return {void}
         */

      }, {
        key: 'translate3d',
        value: function translate3d(x, y, z, node) {
          node = /** @type {Element} */node || this;
          this.transform('translate3d(' + x + ',' + y + ',' + z + ')', node);
        }

        /**
         * Removes an item from an array, if it exists.
         *
         * If the array is specified by path, a change notification is
         * generated, so that observers, data bindings and computed
         * properties watching that path can update.
         *
         * If the array is passed directly, **no change
         * notification is generated**.
         *
         * @param {string | !Array<number|string>} arrayOrPath Path to array from which to remove the item
         *   (or the array itself).
         * @param {*} item Item to remove.
         * @return {Array} Array containing item removed.
         */

      }, {
        key: 'arrayDelete',
        value: function arrayDelete(arrayOrPath, item) {
          var index = void 0;
          if (Array.isArray(arrayOrPath)) {
            index = arrayOrPath.indexOf(item);
            if (index >= 0) {
              return arrayOrPath.splice(index, 1);
            }
          } else {
            var arr = get$1(this, arrayOrPath);
            index = arr.indexOf(item);
            if (index >= 0) {
              return this.splice(arrayOrPath, index, 1);
            }
          }
          return null;
        }

        // logging

        /**
         * Facades `console.log`/`warn`/`error` as override point.
         *
         * @param {string} level One of 'log', 'warn', 'error'
         * @param {Array} args Array of strings or objects to log
         * @return {void}
         */

      }, {
        key: '_logger',
        value: function _logger(level, args) {
          var _console;

          // accept ['foo', 'bar'] and [['foo', 'bar']]
          if (Array.isArray(args) && args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
          }
          switch (level) {
            case 'log':
            case 'warn':
            case 'error':
              (_console = console)[level].apply(_console, toConsumableArray(args));
          }
        }

        /**
         * Facades `console.log` as an override point.
         *
         * @param {...*} args Array of strings or objects to log
         * @return {void}
         */

      }, {
        key: '_log',
        value: function _log() {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          this._logger('log', args);
        }

        /**
         * Facades `console.warn` as an override point.
         *
         * @param {...*} args Array of strings or objects to log
         * @return {void}
         */

      }, {
        key: '_warn',
        value: function _warn() {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          this._logger('warn', args);
        }

        /**
         * Facades `console.error` as an override point.
         *
         * @param {...*} args Array of strings or objects to log
         * @return {void}
         */

      }, {
        key: '_error',
        value: function _error() {
          for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          this._logger('error', args);
        }

        /**
         * Formats a message using the element type an a method name.
         *
         * @param {string} methodName Method name to associate with message
         * @param {...*} args Array of strings or objects to log
         * @return {Array} Array with formatting information for `console`
         *   logging.
         */

      }, {
        key: '_logf',
        value: function _logf(methodName) {
          for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            args[_key4 - 1] = arguments[_key4];
          }

          return ['[%s::%s]', this.is, methodName].concat(args);
        }
      }, {
        key: 'domHost',
        get: function get$$1() {
          var root$$1 = this.getRootNode();
          return root$$1 instanceof DocumentFragment ? /** @type {ShadowRoot} */root$$1.host : root$$1;
        }
      }], [{
        key: 'importMeta',
        get: function get$$1() {
          return this.prototype.importMeta;
        }
      }]);
      return LegacyElement;
    }(legacyElementBase);

    LegacyElement.prototype.is = '';

    return LegacyElement;
  });

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  // Common implementation for mixin & behavior
  function mutablePropertyChange(inst, property, value, old, mutableData) {
    var isObject = void 0;
    if (mutableData) {
      isObject = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null;
      // Pull `old` for Objects from temp cache, but treat `null` as a primitive
      if (isObject) {
        old = inst.__dataTemp[property];
      }
    }
    // Strict equality check, but return false for NaN===NaN
    var shouldChange = old !== value && (old === old || value === value);
    // Objects are stored in temporary cache (cleared at end of
    // turn), which is used for dirty-checking
    if (isObject && shouldChange) {
      inst.__dataTemp[property] = value;
    }
    return shouldChange;
  }

  /**
   * Element class mixin to skip strict dirty-checking for objects and arrays
   * (always consider them to be "dirty"), for use on elements utilizing
   * `PropertyEffects`
   *
   * By default, `PropertyEffects` performs strict dirty checking on
   * objects, which means that any deep modifications to an object or array will
   * not be propagated unless "immutable" data patterns are used (i.e. all object
   * references from the root to the mutation were changed).
   *
   * Polymer also provides a proprietary data mutation and path notification API
   * (e.g. `notifyPath`, `set`, and array mutation API's) that allow efficient
   * mutation and notification of deep changes in an object graph to all elements
   * bound to the same object graph.
   *
   * In cases where neither immutable patterns nor the data mutation API can be
   * used, applying this mixin will cause Polymer to skip dirty checking for
   * objects and arrays (always consider them to be "dirty").  This allows a
   * user to make a deep modification to a bound object graph, and then either
   * simply re-set the object (e.g. `this.items = this.items`) or call `notifyPath`
   * (e.g. `this.notifyPath('items')`) to update the tree.  Note that all
   * elements that wish to be updated based on deep mutations must apply this
   * mixin or otherwise skip strict dirty checking for objects/arrays.
   * Specifically, any elements in the binding tree between the source of a
   * mutation and the consumption of it must apply this mixin or enable the
   * `OptionalMutableData` mixin.
   *
   * In order to make the dirty check strategy configurable, see
   * `OptionalMutableData`.
   *
   * Note, the performance characteristics of propagating large object graphs
   * will be worse as opposed to using strict dirty checking with immutable
   * patterns or Polymer's path notification API.
   *
   * @mixinFunction
   * @polymer
   * @summary Element class mixin to skip strict dirty-checking for objects
   *   and arrays
   */
  var MutableData = dedupingMixin(function (superClass) {

    /**
     * @polymer
     * @mixinClass
     * @implements {Polymer_MutableData}
     */
    var MutableData = function (_superClass) {
      inherits(MutableData, _superClass);

      function MutableData() {
        classCallCheck(this, MutableData);
        return possibleConstructorReturn(this, (MutableData.__proto__ || Object.getPrototypeOf(MutableData)).apply(this, arguments));
      }

      createClass(MutableData, [{
        key: '_shouldPropertyChange',

        /**
         * Overrides `PropertyEffects` to provide option for skipping
         * strict equality checking for Objects and Arrays.
         *
         * This method pulls the value to dirty check against from the `__dataTemp`
         * cache (rather than the normal `__data` cache) for Objects.  Since the temp
         * cache is cleared at the end of a turn, this implementation allows
         * side-effects of deep object changes to be processed by re-setting the
         * same object (using the temp cache as an in-turn backstop to prevent
         * cycles due to 2-way notification).
         *
         * @param {string} property Property name
         * @param {*} value New property value
         * @param {*} old Previous property value
         * @return {boolean} Whether the property should be considered a change
         * @protected
         */
        value: function _shouldPropertyChange(property, value, old) {
          return mutablePropertyChange(this, property, value, old, true);
        }
      }]);
      return MutableData;
    }(superClass);

    return MutableData;
  });

  /**
   * Element class mixin to add the optional ability to skip strict
   * dirty-checking for objects and arrays (always consider them to be
   * "dirty") by setting a `mutable-data` attribute on an element instance.
   *
   * By default, `PropertyEffects` performs strict dirty checking on
   * objects, which means that any deep modifications to an object or array will
   * not be propagated unless "immutable" data patterns are used (i.e. all object
   * references from the root to the mutation were changed).
   *
   * Polymer also provides a proprietary data mutation and path notification API
   * (e.g. `notifyPath`, `set`, and array mutation API's) that allow efficient
   * mutation and notification of deep changes in an object graph to all elements
   * bound to the same object graph.
   *
   * In cases where neither immutable patterns nor the data mutation API can be
   * used, applying this mixin will allow Polymer to skip dirty checking for
   * objects and arrays (always consider them to be "dirty").  This allows a
   * user to make a deep modification to a bound object graph, and then either
   * simply re-set the object (e.g. `this.items = this.items`) or call `notifyPath`
   * (e.g. `this.notifyPath('items')`) to update the tree.  Note that all
   * elements that wish to be updated based on deep mutations must apply this
   * mixin or otherwise skip strict dirty checking for objects/arrays.
   * Specifically, any elements in the binding tree between the source of a
   * mutation and the consumption of it must enable this mixin or apply the
   * `MutableData` mixin.
   *
   * While this mixin adds the ability to forgo Object/Array dirty checking,
   * the `mutableData` flag defaults to false and must be set on the instance.
   *
   * Note, the performance characteristics of propagating large object graphs
   * will be worse by relying on `mutableData: true` as opposed to using
   * strict dirty checking with immutable patterns or Polymer's path notification
   * API.
   *
   * @mixinFunction
   * @polymer
   * @summary Element class mixin to optionally skip strict dirty-checking
   *   for objects and arrays
   */
  var OptionalMutableData = dedupingMixin(function (superClass) {

    /**
     * @mixinClass
     * @polymer
     * @implements {Polymer_OptionalMutableData}
     */
    var OptionalMutableData = function (_superClass2) {
      inherits(OptionalMutableData, _superClass2);

      function OptionalMutableData() {
        classCallCheck(this, OptionalMutableData);
        return possibleConstructorReturn(this, (OptionalMutableData.__proto__ || Object.getPrototypeOf(OptionalMutableData)).apply(this, arguments));
      }

      createClass(OptionalMutableData, [{
        key: '_shouldPropertyChange',


        /**
         * Overrides `PropertyEffects` to provide option for skipping
         * strict equality checking for Objects and Arrays.
         *
         * When `this.mutableData` is true on this instance, this method
         * pulls the value to dirty check against from the `__dataTemp` cache
         * (rather than the normal `__data` cache) for Objects.  Since the temp
         * cache is cleared at the end of a turn, this implementation allows
         * side-effects of deep object changes to be processed by re-setting the
         * same object (using the temp cache as an in-turn backstop to prevent
         * cycles due to 2-way notification).
         *
         * @param {string} property Property name
         * @param {*} value New property value
         * @param {*} old Previous property value
         * @return {boolean} Whether the property should be considered a change
         * @protected
         */
        value: function _shouldPropertyChange(property, value, old) {
          return mutablePropertyChange(this, property, value, old, this.mutableData);
        }
      }], [{
        key: 'properties',
        get: function get$$1() {
          return {
            /**
             * Instance-level flag for configuring the dirty-checking strategy
             * for this element.  When true, Objects and Arrays will skip dirty
             * checking, otherwise strict equality checking will be used.
             */
            mutableData: Boolean
          };
        }
      }]);
      return OptionalMutableData;
    }(superClass);

    return OptionalMutableData;
  });

  // Export for use by legacy behavior
  MutableData._mutablePropertyChange = mutablePropertyChange;

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  // Base class for HTMLTemplateElement extension that has property effects
  // machinery for propagating host properties to children. This is an ES5
  // class only because Babel (incorrectly) requires super() in the class
  // constructor even though no `this` is used and it returns an instance.
  var newInstance = null;
  /**
   * @constructor
   * @extends {HTMLTemplateElement}
   */
  function HTMLTemplateElementExtension() {
    return newInstance;
  }
  HTMLTemplateElementExtension.prototype = Object.create(HTMLTemplateElement.prototype, {
    constructor: {
      value: HTMLTemplateElementExtension,
      writable: true
    }
  });
  /**
   * @constructor
   * @implements {Polymer_PropertyEffects}
   * @extends {HTMLTemplateElementExtension}
   */
  var DataTemplate = PropertyEffects(HTMLTemplateElementExtension);
  /**
   * @constructor
   * @implements {Polymer_MutableData}
   * @extends {DataTemplate}
   */
  var MutableDataTemplate = MutableData(DataTemplate);

  // Applies a DataTemplate subclass to a <template> instance
  function upgradeTemplate(template, constructor) {
    newInstance = template;
    Object.setPrototypeOf(template, constructor.prototype);
    new constructor();
    newInstance = null;
  }

  // Base class for TemplateInstance's
  /**
   * @constructor
   * @implements {Polymer_PropertyEffects}
   */
  var base = PropertyEffects(function () {
    function _class() {
      classCallCheck(this, _class);
    }

    return _class;
  }());

  /**
   * @polymer
   * @customElement
   * @appliesMixin PropertyEffects
   * @unrestricted
   */

  var TemplateInstanceBase = function (_base) {
    inherits(TemplateInstanceBase, _base);

    function TemplateInstanceBase(props) {
      classCallCheck(this, TemplateInstanceBase);

      var _this = possibleConstructorReturn(this, (TemplateInstanceBase.__proto__ || Object.getPrototypeOf(TemplateInstanceBase)).call(this));

      _this._configureProperties(props);
      _this.root = _this._stampTemplate(_this.__dataHost);
      // Save list of stamped children
      var children = _this.children = [];
      for (var n = _this.root.firstChild; n; n = n.nextSibling) {
        children.push(n);
        n.__templatizeInstance = _this;
      }
      if (_this.__templatizeOwner && _this.__templatizeOwner.__hideTemplateChildren__) {
        _this._showHideChildren(true);
      }
      // Flush props only when props are passed if instance props exist
      // or when there isn't instance props.
      var options = _this.__templatizeOptions;
      if (props && options.instanceProps || !options.instanceProps) {
        _this._enableProperties();
      }
      return _this;
    }
    /**
     * Configure the given `props` by calling `_setPendingProperty`. Also
     * sets any properties stored in `__hostProps`.
     * @private
     * @param {Object} props Object of property name-value pairs to set.
     * @return {void}
     */


    createClass(TemplateInstanceBase, [{
      key: '_configureProperties',
      value: function _configureProperties(props) {
        var options = this.__templatizeOptions;
        if (options.forwardHostProp) {
          for (var hprop in this.__hostProps) {
            this._setPendingProperty(hprop, this.__dataHost['_host_' + hprop]);
          }
        }
        // Any instance props passed in the constructor will overwrite host props;
        // normally this would be a user error but we don't specifically filter them
        for (var iprop in props) {
          this._setPendingProperty(iprop, props[iprop]);
        }
      }
      /**
       * Forwards a host property to this instance.  This method should be
       * called on instances from the `options.forwardHostProp` callback
       * to propagate changes of host properties to each instance.
       *
       * Note this method enqueues the change, which are flushed as a batch.
       *
       * @param {string} prop Property or path name
       * @param {*} value Value of the property to forward
       * @return {void}
       */

    }, {
      key: 'forwardHostProp',
      value: function forwardHostProp(prop, value) {
        if (this._setPendingPropertyOrPath(prop, value, false, true)) {
          this.__dataHost._enqueueClient(this);
        }
      }

      /**
       * Override point for adding custom or simulated event handling.
       *
       * @param {!Node} node Node to add event listener to
       * @param {string} eventName Name of event
       * @param {function(!Event):void} handler Listener function to add
       * @return {void}
       */

    }, {
      key: '_addEventListenerToNode',
      value: function _addEventListenerToNode(node, eventName, handler) {
        var _this2 = this;

        if (this._methodHost && this.__templatizeOptions.parentModel) {
          // If this instance should be considered a parent model, decorate
          // events this template instance as `model`
          this._methodHost._addEventListenerToNode(node, eventName, function (e) {
            e.model = _this2;
            handler(e);
          });
        } else {
          // Otherwise delegate to the template's host (which could be)
          // another template instance
          var templateHost = this.__dataHost.__dataHost;
          if (templateHost) {
            templateHost._addEventListenerToNode(node, eventName, handler);
          }
        }
      }
      /**
       * Shows or hides the template instance top level child elements. For
       * text nodes, `textContent` is removed while "hidden" and replaced when
       * "shown."
       * @param {boolean} hide Set to true to hide the children;
       * set to false to show them.
       * @return {void}
       * @protected
       */

    }, {
      key: '_showHideChildren',
      value: function _showHideChildren(hide) {
        var c = this.children;
        for (var i = 0; i < c.length; i++) {
          var n = c[i];
          // Ignore non-changes
          if (Boolean(hide) != Boolean(n.__hideTemplateChildren__)) {
            if (n.nodeType === Node.TEXT_NODE) {
              if (hide) {
                n.__polymerTextContent__ = n.textContent;
                n.textContent = '';
              } else {
                n.textContent = n.__polymerTextContent__;
              }
              // remove and replace slot
            } else if (n.localName === 'slot') {
              if (hide) {
                n.__polymerReplaced__ = document.createComment('hidden-slot');
                n.parentNode.replaceChild(n.__polymerReplaced__, n);
              } else {
                var replace = n.__polymerReplaced__;
                if (replace) {
                  replace.parentNode.replaceChild(n, replace);
                }
              }
            } else if (n.style) {
              if (hide) {
                n.__polymerDisplay__ = n.style.display;
                n.style.display = 'none';
              } else {
                n.style.display = n.__polymerDisplay__;
              }
            }
          }
          n.__hideTemplateChildren__ = hide;
          if (n._showHideChildren) {
            n._showHideChildren(hide);
          }
        }
      }
      /**
       * Overrides default property-effects implementation to intercept
       * textContent bindings while children are "hidden" and cache in
       * private storage for later retrieval.
       *
       * @param {!Node} node The node to set a property on
       * @param {string} prop The property to set
       * @param {*} value The value to set
       * @return {void}
       * @protected
       */

    }, {
      key: '_setUnmanagedPropertyToNode',
      value: function _setUnmanagedPropertyToNode(node, prop, value) {
        if (node.__hideTemplateChildren__ && node.nodeType == Node.TEXT_NODE && prop == 'textContent') {
          node.__polymerTextContent__ = value;
        } else {
          get(TemplateInstanceBase.prototype.__proto__ || Object.getPrototypeOf(TemplateInstanceBase.prototype), '_setUnmanagedPropertyToNode', this).call(this, node, prop, value);
        }
      }
      /**
       * Find the parent model of this template instance.  The parent model
       * is either another templatize instance that had option `parentModel: true`,
       * or else the host element.
       *
       * @return {!Polymer_PropertyEffects} The parent model of this instance
       */

    }, {
      key: 'dispatchEvent',


      /**
       * Stub of HTMLElement's `dispatchEvent`, so that effects that may
       * dispatch events safely no-op.
       *
       * @param {Event} event Event to dispatch
       * @return {boolean} Always true.
       */
      value: function dispatchEvent(event) {
        // eslint-disable-line no-unused-vars
        return true;
      }
    }, {
      key: 'parentModel',
      get: function get$$1() {
        var model = this.__parentModel;
        if (!model) {
          var options = void 0;
          model = this;
          do {
            // A template instance's `__dataHost` is a <template>
            // `model.__dataHost.__dataHost` is the template's host
            model = model.__dataHost.__dataHost;
          } while ((options = model.__templatizeOptions) && !options.parentModel);
          this.__parentModel = model;
        }
        return model;
      }
    }]);
    return TemplateInstanceBase;
  }(base);

  /**
   * @constructor
   * @extends {TemplateInstanceBase}
   * @implements {Polymer_MutableData}
   */
  var MutableTemplateInstanceBase = MutableData(TemplateInstanceBase);

  function findMethodHost(template) {
    // Technically this should be the owner of the outermost template.
    // In shadow dom, this is always getRootNode().host, but we can
    // approximate this via cooperation with our dataHost always setting
    // `_methodHost` as long as there were bindings (or id's) on this
    // instance causing it to get a dataHost.
    var templateHost = template.__dataHost;
    return templateHost && templateHost._methodHost || templateHost;
  }

  /* eslint-disable valid-jsdoc */
  /**
   * @suppress {missingProperties} class.prototype is not defined for some reason
   */
  function createTemplatizerClass(template, templateInfo, options) {
    // Anonymous class created by the templatize
    var base = options.mutableData ? MutableTemplateInstanceBase : TemplateInstanceBase;
    /**
     * @constructor
     * @extends {base}
     * @private
     */
    var klass = function (_base2) {
      inherits(klass, _base2);

      function klass() {
        classCallCheck(this, klass);
        return possibleConstructorReturn(this, (klass.__proto__ || Object.getPrototypeOf(klass)).apply(this, arguments));
      }

      return klass;
    }(base);
    klass.prototype.__templatizeOptions = options;
    klass.prototype._bindTemplate(template);
    addNotifyEffects(klass, template, templateInfo, options);
    return klass;
  }

  /**
   * @suppress {missingProperties} class.prototype is not defined for some reason
   */
  function addPropagateEffects(template, templateInfo, options) {
    var userForwardHostProp = options.forwardHostProp;
    if (userForwardHostProp) {
      // Provide data API and property effects on memoized template class
      var klass = templateInfo.templatizeTemplateClass;
      if (!klass) {
        var _base3 = options.mutableData ? MutableDataTemplate : DataTemplate;
        klass = templateInfo.templatizeTemplateClass = function (_base4) {
          inherits(TemplatizedTemplate, _base4);

          function TemplatizedTemplate() {
            classCallCheck(this, TemplatizedTemplate);
            return possibleConstructorReturn(this, (TemplatizedTemplate.__proto__ || Object.getPrototypeOf(TemplatizedTemplate)).apply(this, arguments));
          }

          return TemplatizedTemplate;
        }(_base3);
        // Add template - >instances effects
        // and host <- template effects
        var hostProps = templateInfo.hostProps;
        for (var prop in hostProps) {
          klass.prototype._addPropertyEffect('_host_' + prop, klass.prototype.PROPERTY_EFFECT_TYPES.PROPAGATE, { fn: createForwardHostPropEffect(prop, userForwardHostProp) });
          klass.prototype._createNotifyingProperty('_host_' + prop);
        }
      }
      upgradeTemplate(template, klass);
      // Mix any pre-bound data into __data; no need to flush this to
      // instances since they pull from the template at instance-time
      if (template.__dataProto) {
        // Note, generally `__dataProto` could be chained, but it's guaranteed
        // to not be since this is a vanilla template we just added effects to
        Object.assign(template.__data, template.__dataProto);
      }
      // Clear any pending data for performance
      template.__dataTemp = {};
      template.__dataPending = null;
      template.__dataOld = null;
      template._enableProperties();
    }
  }
  /* eslint-enable valid-jsdoc */

  function createForwardHostPropEffect(hostProp, userForwardHostProp) {
    return function forwardHostProp(template, prop, props) {
      userForwardHostProp.call(template.__templatizeOwner, prop.substring('_host_'.length), props[prop]);
    };
  }

  function addNotifyEffects(klass, template, templateInfo, options) {
    var hostProps = templateInfo.hostProps || {};
    for (var iprop in options.instanceProps) {
      delete hostProps[iprop];
      var userNotifyInstanceProp = options.notifyInstanceProp;
      if (userNotifyInstanceProp) {
        klass.prototype._addPropertyEffect(iprop, klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY, { fn: createNotifyInstancePropEffect(iprop, userNotifyInstanceProp) });
      }
    }
    if (options.forwardHostProp && template.__dataHost) {
      for (var hprop in hostProps) {
        klass.prototype._addPropertyEffect(hprop, klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY, { fn: createNotifyHostPropEffect() });
      }
    }
  }

  function createNotifyInstancePropEffect(instProp, userNotifyInstanceProp) {
    return function notifyInstanceProp(inst, prop, props) {
      userNotifyInstanceProp.call(inst.__templatizeOwner, inst, prop, props[prop]);
    };
  }

  function createNotifyHostPropEffect() {
    return function notifyHostProp(inst, prop, props) {
      inst.__dataHost._setPendingPropertyOrPath('_host_' + prop, props[prop], true, true);
    };
  }

  /**
   * Returns an anonymous `PropertyEffects` class bound to the
   * `<template>` provided.  Instancing the class will result in the
   * template being stamped into a document fragment stored as the instance's
   * `root` property, after which it can be appended to the DOM.
   *
   * Templates may utilize all Polymer data-binding features as well as
   * declarative event listeners.  Event listeners and inline computing
   * functions in the template will be called on the host of the template.
   *
   * The constructor returned takes a single argument dictionary of initial
   * property values to propagate into template bindings.  Additionally
   * host properties can be forwarded in, and instance properties can be
   * notified out by providing optional callbacks in the `options` dictionary.
   *
   * Valid configuration in `options` are as follows:
   *
   * - `forwardHostProp(property, value)`: Called when a property referenced
   *   in the template changed on the template's host. As this library does
   *   not retain references to templates instanced by the user, it is the
   *   templatize owner's responsibility to forward host property changes into
   *   user-stamped instances.  The `instance.forwardHostProp(property, value)`
   *    method on the generated class should be called to forward host
   *   properties into the template to prevent unnecessary property-changed
   *   notifications. Any properties referenced in the template that are not
   *   defined in `instanceProps` will be notified up to the template's host
   *   automatically.
   * - `instanceProps`: Dictionary of property names that will be added
   *   to the instance by the templatize owner.  These properties shadow any
   *   host properties, and changes within the template to these properties
   *   will result in `notifyInstanceProp` being called.
   * - `mutableData`: When `true`, the generated class will skip strict
   *   dirty-checking for objects and arrays (always consider them to be
   *   "dirty").
   * - `notifyInstanceProp(instance, property, value)`: Called when
   *   an instance property changes.  Users may choose to call `notifyPath`
   *   on e.g. the owner to notify the change.
   * - `parentModel`: When `true`, events handled by declarative event listeners
   *   (`on-event="handler"`) will be decorated with a `model` property pointing
   *   to the template instance that stamped it.  It will also be returned
   *   from `instance.parentModel` in cases where template instance nesting
   *   causes an inner model to shadow an outer model.
   *
   * All callbacks are called bound to the `owner`. Any context
   * needed for the callbacks (such as references to `instances` stamped)
   * should be stored on the `owner` such that they can be retrieved via
   * `this`.
   *
   * When `options.forwardHostProp` is declared as an option, any properties
   * referenced in the template will be automatically forwarded from the host of
   * the `<template>` to instances, with the exception of any properties listed in
   * the `options.instanceProps` object.  `instanceProps` are assumed to be
   * managed by the owner of the instances, either passed into the constructor
   * or set after the fact.  Note, any properties passed into the constructor will
   * always be set to the instance (regardless of whether they would normally
   * be forwarded from the host).
   *
   * Note that `templatize()` can be run only once for a given `<template>`.
   * Further calls will result in an error. Also, there is a special
   * behavior if the template was duplicated through a mechanism such as
   * `<dom-repeat>` or `<test-fixture>`. In this case, all calls to
   * `templatize()` return the same class for all duplicates of a template.
   * The class returned from `templatize()` is generated only once using
   * the `options` from the first call. This means that any `options`
   * provided to subsequent calls will be ignored. Therefore, it is very
   * important not to close over any variables inside the callbacks. Also,
   * arrow functions must be avoided because they bind the outer `this`.
   * Inside the callbacks, any contextual information can be accessed
   * through `this`, which points to the `owner`.
   *
   * @param {!HTMLTemplateElement} template Template to templatize
   * @param {Polymer_PropertyEffects=} owner Owner of the template instances;
   *   any optional callbacks will be bound to this owner.
   * @param {Object=} options Options dictionary (see summary for details)
   * @return {function(new:TemplateInstanceBase)} Generated class bound to the template
   *   provided
   * @suppress {invalidCasts}
   */
  function templatize(template, owner, options) {
    options = /** @type {!TemplatizeOptions} */options || {};
    if (template.__templatizeOwner) {
      throw new Error('A <template> can only be templatized once');
    }
    template.__templatizeOwner = owner;
    var ctor = owner ? owner.constructor : TemplateInstanceBase;
    var templateInfo = ctor._parseTemplate(template);
    // Get memoized base class for the prototypical template, which
    // includes property effects for binding template & forwarding
    var baseClass = templateInfo.templatizeInstanceClass;
    if (!baseClass) {
      baseClass = createTemplatizerClass(template, templateInfo, options);
      templateInfo.templatizeInstanceClass = baseClass;
    }
    // Host property forwarding must be installed onto template instance
    addPropagateEffects(template, templateInfo, options);
    // Subclass base class and add reference for this specific template
    /** @private */
    var klass = function (_baseClass) {
      inherits(TemplateInstance, _baseClass);

      function TemplateInstance() {
        classCallCheck(this, TemplateInstance);
        return possibleConstructorReturn(this, (TemplateInstance.__proto__ || Object.getPrototypeOf(TemplateInstance)).apply(this, arguments));
      }

      return TemplateInstance;
    }(baseClass);
    klass.prototype._methodHost = findMethodHost(template);
    klass.prototype.__dataHost = template;
    klass.prototype.__templatizeOwner = owner;
    klass.prototype.__hostProps = templateInfo.hostProps;
    klass = /** @type {function(new:TemplateInstanceBase)} */klass; //eslint-disable-line no-self-assign
    return klass;
  }

  /**
   * Returns the template "model" associated with a given element, which
   * serves as the binding scope for the template instance the element is
   * contained in. A template model is an instance of
   * `TemplateInstanceBase`, and should be used to manipulate data
   * associated with this template instance.
   *
   * Example:
   *
   *   let model = modelForElement(el);
   *   if (model.index < 10) {
   *     model.set('item.checked', true);
   *   }
   *
   * @param {HTMLTemplateElement} template The model will be returned for
   *   elements stamped from this template
   * @param {Node=} node Node for which to return a template model.
   * @return {TemplateInstanceBase} Template instance representing the
   *   binding scope for the element
   */
  function modelForElement(template, node) {
    var model = void 0;
    while (node) {
      // An element with a __templatizeInstance marks the top boundary
      // of a scope; walk up until we find one, and then ensure that
      // its __dataHost matches `this`, meaning this dom-repeat stamped it
      if (model = node.__templatizeInstance) {
        // Found an element stamped by another template; keep walking up
        // from its __dataHost
        if (model.__dataHost != template) {
          node = model.__dataHost;
        } else {
          return model;
        }
      } else {
        // Still in a template scope, keep going up until
        // a __templatizeInstance is found
        node = node.parentNode;
      }
    }
    return null;
  }

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * @constructor
   * @extends {HTMLElement}
   * @implements {Polymer_PropertyEffects}
   * @implements {Polymer_OptionalMutableData}
   * @implements {Polymer_GestureEventListeners}
   */
  var domBindBase = GestureEventListeners(OptionalMutableData(PropertyEffects(HTMLElement)));

  /**
   * Custom element to allow using Polymer's template features (data binding,
   * declarative event listeners, etc.) in the main document without defining
   * a new custom element.
   *
   * `<template>` tags utilizing bindings may be wrapped with the `<dom-bind>`
   * element, which will immediately stamp the wrapped template into the main
   * document and bind elements to the `dom-bind` element itself as the
   * binding scope.
   *
   * @polymer
   * @customElement
   * @appliesMixin PropertyEffects
   * @appliesMixin OptionalMutableData
   * @appliesMixin GestureEventListeners
   * @extends {domBindBase}
   * @summary Custom element to allow using Polymer's template features (data
   *   binding, declarative event listeners, etc.) in the main document.
   */
  var DomBind = function (_domBindBase) {
    inherits(DomBind, _domBindBase);
    createClass(DomBind, null, [{
      key: 'observedAttributes',
      get: function get$$1() {
        return ['mutable-data'];
      }
    }]);

    function DomBind() {
      classCallCheck(this, DomBind);

      var _this = possibleConstructorReturn(this, (DomBind.__proto__ || Object.getPrototypeOf(DomBind)).call(this));

      _this.root = null;
      _this.$ = null;
      _this.__children = null;
      return _this;
    }

    /** @return {void} */


    createClass(DomBind, [{
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback() {
        // assumes only one observed attribute
        this.mutableData = true;
      }

      /** @return {void} */

    }, {
      key: 'connectedCallback',
      value: function connectedCallback() {
        this.style.display = 'none';
        this.render();
      }

      /** @return {void} */

    }, {
      key: 'disconnectedCallback',
      value: function disconnectedCallback() {
        this.__removeChildren();
      }
    }, {
      key: '__insertChildren',
      value: function __insertChildren() {
        this.parentNode.insertBefore(this.root, this);
      }
    }, {
      key: '__removeChildren',
      value: function __removeChildren() {
        if (this.__children) {
          for (var i = 0; i < this.__children.length; i++) {
            this.root.appendChild(this.__children[i]);
          }
        }
      }

      /**
       * Forces the element to render its content. This is typically only
       * necessary to call if HTMLImports with the async attribute are used.
       * @return {void}
       */

    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var template = void 0;
        if (!this.__children) {
          template = /** @type {HTMLTemplateElement} */template || this.querySelector('template');
          if (!template) {
            // Wait until childList changes and template should be there by then
            var observer = new MutationObserver(function () {
              template = /** @type {HTMLTemplateElement} */_this2.querySelector('template');
              if (template) {
                observer.disconnect();
                _this2.render();
              } else {
                throw new Error('dom-bind requires a <template> child');
              }
            });
            observer.observe(this, { childList: true });
            return;
          }
          this.root = this._stampTemplate(template);
          this.$ = this.root.$;
          this.__children = [];
          for (var n = this.root.firstChild; n; n = n.nextSibling) {
            this.__children[this.__children.length] = n;
          }
          this._enableProperties();
        }
        this.__insertChildren();
        this.dispatchEvent(new CustomEvent('dom-change', {
          bubbles: true,
          composed: true
        }));
      }
    }]);
    return DomBind;
  }(domBindBase);

  customElements.define('dom-bind', DomBind);

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * Class representing a static string value which can be used to filter
   * strings by asseting that they have been created via this class. The
   * `value` property returns the string passed to the constructor.
   */

  var LiteralString = function () {
    function LiteralString(string) {
      classCallCheck(this, LiteralString);

      /** @type {string} */
      this.value = string.toString();
    }
    /**
     * @return {string} LiteralString string value
     */


    createClass(LiteralString, [{
      key: 'toString',
      value: function toString() {
        return this.value;
      }
    }]);
    return LiteralString;
  }();

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * Base class that provides the core API for Polymer's meta-programming
   * features including template stamping, data-binding, attribute deserialization,
   * and property change observation.
   *
   * @customElement
   * @polymer
   * @constructor
   * @implements {Polymer_ElementMixin}
   * @extends HTMLElement
   * @appliesMixin ElementMixin
   * @summary Custom element base class that provides the core API for Polymer's
   *   key meta-programming features including template stamping, data-binding,
   *   attribute deserialization, and property change observation
   */
  var PolymerElement = ElementMixin(HTMLElement);

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * @constructor
   * @implements {Polymer_OptionalMutableData}
   * @extends {PolymerElement}
   */
  var domRepeatBase = OptionalMutableData(PolymerElement);

  /**
   * The `<dom-repeat>` element will automatically stamp and binds one instance
   * of template content to each object in a user-provided array.
   * `dom-repeat` accepts an `items` property, and one instance of the template
   * is stamped for each item into the DOM at the location of the `dom-repeat`
   * element.  The `item` property will be set on each instance's binding
   * scope, thus templates should bind to sub-properties of `item`.
   *
   * Example:
   *
   * ```html
   * <dom-module id="employee-list">
   *
   *   <template>
   *
   *     <div> Employee list: </div>
   *     <dom-repeat items="{{employees}}">
   *       <template>
   *         <div>First name: <span>{{item.first}}</span></div>
   *         <div>Last name: <span>{{item.last}}</span></div>
   *       </template>
   *     </dom-repeat>
   *
   *   </template>
   *
   * </dom-module>
   * ```
   *
   * With the following custom element definition:
   *
   * ```js
   * class EmployeeList extends PolymerElement {
   *   static get is() { return 'employee-list'; }
   *   static get properties() {
   *     return {
   *       employees: {
   *         value() {
   *           return [
   *             {first: 'Bob', last: 'Smith'},
   *             {first: 'Sally', last: 'Johnson'},
   *             ...
   *           ];
   *         }
   *       }
   *     };
   *   }
   * }
   * ```
   *
   * Notifications for changes to items sub-properties will be forwarded to template
   * instances, which will update via the normal structured data notification system.
   *
   * Mutations to the `items` array itself should be made using the Array
   * mutation API's on the PropertyEffects mixin (`push`, `pop`, `splice`,
   * `shift`, `unshift`), and template instances will be kept in sync with the
   * data in the array.
   *
   * Events caught by event handlers within the `dom-repeat` template will be
   * decorated with a `model` property, which represents the binding scope for
   * each template instance.  The model should be used to manipulate data on the
   * instance, for example `event.model.set('item.checked', true);`.
   *
   * Alternatively, the model for a template instance for an element stamped by
   * a `dom-repeat` can be obtained using the `modelForElement` API on the
   * `dom-repeat` that stamped it, for example
   * `this.$.domRepeat.modelForElement(event.target).set('item.checked', true);`.
   * This may be useful for manipulating instance data of event targets obtained
   * by event handlers on parents of the `dom-repeat` (event delegation).
   *
   * A view-specific filter/sort may be applied to each `dom-repeat` by supplying a
   * `filter` and/or `sort` property.  This may be a string that names a function on
   * the host, or a function may be assigned to the property directly.  The functions
   * should implemented following the standard `Array` filter/sort API.
   *
   * In order to re-run the filter or sort functions based on changes to sub-fields
   * of `items`, the `observe` property may be set as a space-separated list of
   * `item` sub-fields that should cause a re-filter/sort when modified.  If
   * the filter or sort function depends on properties not contained in `items`,
   * the user should observe changes to those properties and call `render` to update
   * the view based on the dependency change.
   *
   * For example, for an `dom-repeat` with a filter of the following:
   *
   * ```js
   * isEngineer(item) {
   *   return item.type == 'engineer' || item.manager.type == 'engineer';
   * }
   * ```
   *
   * Then the `observe` property should be configured as follows:
   *
   * ```html
   * <dom-repeat items="{{employees}}" filter="isEngineer" observe="type manager.type">
   * ```
   *
   * @customElement
   * @polymer
   * @extends {domRepeatBase}
   * @appliesMixin OptionalMutableData
   * @summary Custom element for stamping instance of a template bound to
   *   items in an array.
   */
  var DomRepeat = function (_domRepeatBase) {
    inherits(DomRepeat, _domRepeatBase);
    createClass(DomRepeat, null, [{
      key: 'is',


      // Not needed to find template; can be removed once the analyzer
      // can find the tag name from customElements.define call
      get: function get$$1() {
        return 'dom-repeat';
      }
    }, {
      key: 'template',
      get: function get$$1() {
        return null;
      }
    }, {
      key: 'properties',
      get: function get$$1() {

        /**
         * Fired whenever DOM is added or removed by this template (by
         * default, rendering occurs lazily).  To force immediate rendering, call
         * `render`.
         *
         * @event dom-change
         */
        return {

          /**
           * An array containing items determining how many instances of the template
           * to stamp and that that each template instance should bind to.
           */
          items: {
            type: Array
          },

          /**
           * The name of the variable to add to the binding scope for the array
           * element associated with a given template instance.
           */
          as: {
            type: String,
            value: 'item'
          },

          /**
           * The name of the variable to add to the binding scope with the index
           * of the instance in the sorted and filtered list of rendered items.
           * Note, for the index in the `this.items` array, use the value of the
           * `itemsIndexAs` property.
           */
          indexAs: {
            type: String,
            value: 'index'
          },

          /**
           * The name of the variable to add to the binding scope with the index
           * of the instance in the `this.items` array. Note, for the index of
           * this instance in the sorted and filtered list of rendered items,
           * use the value of the `indexAs` property.
           */
          itemsIndexAs: {
            type: String,
            value: 'itemsIndex'
          },

          /**
           * A function that should determine the sort order of the items.  This
           * property should either be provided as a string, indicating a method
           * name on the element's host, or else be an actual function.  The
           * function should match the sort function passed to `Array.sort`.
           * Using a sort function has no effect on the underlying `items` array.
           */
          sort: {
            type: Function,
            observer: '__sortChanged'
          },

          /**
           * A function that can be used to filter items out of the view.  This
           * property should either be provided as a string, indicating a method
           * name on the element's host, or else be an actual function.  The
           * function should match the sort function passed to `Array.filter`.
           * Using a filter function has no effect on the underlying `items` array.
           */
          filter: {
            type: Function,
            observer: '__filterChanged'
          },

          /**
           * When using a `filter` or `sort` function, the `observe` property
           * should be set to a space-separated list of the names of item
           * sub-fields that should trigger a re-sort or re-filter when changed.
           * These should generally be fields of `item` that the sort or filter
           * function depends on.
           */
          observe: {
            type: String,
            observer: '__observeChanged'
          },

          /**
           * When using a `filter` or `sort` function, the `delay` property
           * determines a debounce time in ms after a change to observed item
           * properties that must pass before the filter or sort is re-run.
           * This is useful in rate-limiting shuffling of the view when
           * item changes may be frequent.
           */
          delay: Number,

          /**
           * Count of currently rendered items after `filter` (if any) has been applied.
           * If "chunking mode" is enabled, `renderedItemCount` is updated each time a
           * set of template instances is rendered.
           *
           */
          renderedItemCount: {
            type: Number,
            notify: true,
            readOnly: true
          },

          /**
           * Defines an initial count of template instances to render after setting
           * the `items` array, before the next paint, and puts the `dom-repeat`
           * into "chunking mode".  The remaining items will be created and rendered
           * incrementally at each animation frame therof until all instances have
           * been rendered.
           */
          initialCount: {
            type: Number,
            observer: '__initializeChunking'
          },

          /**
           * When `initialCount` is used, this property defines a frame rate (in
           * fps) to target by throttling the number of instances rendered each
           * frame to not exceed the budget for the target frame rate.  The
           * framerate is effectively the number of `requestAnimationFrame`s that
           * it tries to allow to actually fire in a given second. It does this
           * by measuring the time between `rAF`s and continuously adjusting the
           * number of items created each `rAF` to maintain the target framerate.
           * Setting this to a higher number allows lower latency and higher
           * throughput for event handlers and other tasks, but results in a
           * longer time for the remaining items to complete rendering.
           */
          targetFramerate: {
            type: Number,
            value: 20
          },

          _targetFrameTime: {
            type: Number,
            computed: '__computeFrameTime(targetFramerate)'
          }

        };
      }
    }, {
      key: 'observers',
      get: function get$$1() {
        return ['__itemsChanged(items.*)'];
      }
    }]);

    function DomRepeat() {
      classCallCheck(this, DomRepeat);

      var _this = possibleConstructorReturn(this, (DomRepeat.__proto__ || Object.getPrototypeOf(DomRepeat)).call(this));

      _this.__instances = [];
      _this.__limit = Infinity;
      _this.__pool = [];
      _this.__renderDebouncer = null;
      _this.__itemsIdxToInstIdx = {};
      _this.__chunkCount = null;
      _this.__lastChunkTime = null;
      _this.__sortFn = null;
      _this.__filterFn = null;
      _this.__observePaths = null;
      _this.__ctor = null;
      _this.__isDetached = true;
      _this.template = null;
      return _this;
    }

    /**
     * @return {void}
     */


    createClass(DomRepeat, [{
      key: 'disconnectedCallback',
      value: function disconnectedCallback() {
        get(DomRepeat.prototype.__proto__ || Object.getPrototypeOf(DomRepeat.prototype), 'disconnectedCallback', this).call(this);
        this.__isDetached = true;
        for (var i = 0; i < this.__instances.length; i++) {
          this.__detachInstance(i);
        }
      }

      /**
       * @return {void}
       */

    }, {
      key: 'connectedCallback',
      value: function connectedCallback() {
        get(DomRepeat.prototype.__proto__ || Object.getPrototypeOf(DomRepeat.prototype), 'connectedCallback', this).call(this);
        this.style.display = 'none';
        // only perform attachment if the element was previously detached.
        if (this.__isDetached) {
          this.__isDetached = false;
          var parent = this.parentNode;
          for (var i = 0; i < this.__instances.length; i++) {
            this.__attachInstance(i, parent);
          }
        }
      }
    }, {
      key: '__ensureTemplatized',
      value: function __ensureTemplatized() {
        var _this2 = this;

        // Templatizing (generating the instance constructor) needs to wait
        // until ready, since won't have its template content handed back to
        // it until then
        if (!this.__ctor) {
          var template = this.template = /** @type {HTMLTemplateElement} */this.querySelector('template');
          if (!template) {
            // // Wait until childList changes and template should be there by then
            var observer = new MutationObserver(function () {
              if (_this2.querySelector('template')) {
                observer.disconnect();
                _this2.__render();
              } else {
                throw new Error('dom-repeat requires a <template> child');
              }
            });
            observer.observe(this, { childList: true });
            return false;
          }
          // Template instance props that should be excluded from forwarding
          var instanceProps = {};
          instanceProps[this.as] = true;
          instanceProps[this.indexAs] = true;
          instanceProps[this.itemsIndexAs] = true;
          this.__ctor = templatize(template, this, {
            mutableData: this.mutableData,
            parentModel: true,
            instanceProps: instanceProps,
            /**
             * @this {this}
             * @param {string} prop Property to set
             * @param {*} value Value to set property to
             */
            forwardHostProp: function forwardHostProp(prop, value) {
              var i$ = this.__instances;
              for (var i = 0, inst; i < i$.length && (inst = i$[i]); i++) {
                inst.forwardHostProp(prop, value);
              }
            },
            /**
             * @this {this}
             * @param {Object} inst Instance to notify
             * @param {string} prop Property to notify
             * @param {*} value Value to notify
             */
            notifyInstanceProp: function notifyInstanceProp(inst, prop, value) {
              if (matches(this.as, prop)) {
                var idx = inst[this.itemsIndexAs];
                if (prop == this.as) {
                  this.items[idx] = value;
                }
                var path = translate(this.as, 'items.' + idx, prop);
                this.notifyPath(path, value);
              }
            }
          });
        }
        return true;
      }
    }, {
      key: '__getMethodHost',
      value: function __getMethodHost() {
        // Technically this should be the owner of the outermost template.
        // In shadow dom, this is always getRootNode().host, but we can
        // approximate this via cooperation with our dataHost always setting
        // `_methodHost` as long as there were bindings (or id's) on this
        // instance causing it to get a dataHost.
        return this.__dataHost._methodHost || this.__dataHost;
      }
    }, {
      key: '__functionFromPropertyValue',
      value: function __functionFromPropertyValue(functionOrMethodName) {
        if (typeof functionOrMethodName === 'string') {
          var methodName = functionOrMethodName;
          var obj = this.__getMethodHost();
          return function () {
            return obj[methodName].apply(obj, arguments);
          };
        }

        return functionOrMethodName;
      }
    }, {
      key: '__sortChanged',
      value: function __sortChanged(sort) {
        this.__sortFn = this.__functionFromPropertyValue(sort);
        if (this.items) {
          this.__debounceRender(this.__render);
        }
      }
    }, {
      key: '__filterChanged',
      value: function __filterChanged(filter) {
        this.__filterFn = this.__functionFromPropertyValue(filter);
        if (this.items) {
          this.__debounceRender(this.__render);
        }
      }
    }, {
      key: '__computeFrameTime',
      value: function __computeFrameTime(rate) {
        return Math.ceil(1000 / rate);
      }
    }, {
      key: '__initializeChunking',
      value: function __initializeChunking() {
        if (this.initialCount) {
          this.__limit = this.initialCount;
          this.__chunkCount = this.initialCount;
          this.__lastChunkTime = performance.now();
        }
      }
    }, {
      key: '__tryRenderChunk',
      value: function __tryRenderChunk() {
        // Debounced so that multiple calls through `_render` between animation
        // frames only queue one new rAF (e.g. array mutation & chunked render)
        if (this.items && this.__limit < this.items.length) {
          this.__debounceRender(this.__requestRenderChunk);
        }
      }
    }, {
      key: '__requestRenderChunk',
      value: function __requestRenderChunk() {
        var _this3 = this;

        requestAnimationFrame(function () {
          return _this3.__renderChunk();
        });
      }
    }, {
      key: '__renderChunk',
      value: function __renderChunk() {
        // Simple auto chunkSize throttling algorithm based on feedback loop:
        // measure actual time between frames and scale chunk count by ratio
        // of target/actual frame time
        var currChunkTime = performance.now();
        var ratio = this._targetFrameTime / (currChunkTime - this.__lastChunkTime);
        this.__chunkCount = Math.round(this.__chunkCount * ratio) || 1;
        this.__limit += this.__chunkCount;
        this.__lastChunkTime = currChunkTime;
        this.__debounceRender(this.__render);
      }
    }, {
      key: '__observeChanged',
      value: function __observeChanged() {
        this.__observePaths = this.observe && this.observe.replace('.*', '.').split(' ');
      }
    }, {
      key: '__itemsChanged',
      value: function __itemsChanged(change) {
        if (this.items && !Array.isArray(this.items)) {
          console.warn('dom-repeat expected array for `items`, found', this.items);
        }
        // If path was to an item (e.g. 'items.3' or 'items.3.foo'), forward the
        // path to that instance synchronously (returns false for non-item paths)
        if (!this.__handleItemPath(change.path, change.value)) {
          // Otherwise, the array was reset ('items') or spliced ('items.splices'),
          // so queue a full refresh
          this.__initializeChunking();
          this.__debounceRender(this.__render);
        }
      }
    }, {
      key: '__handleObservedPaths',
      value: function __handleObservedPaths(path) {
        // Handle cases where path changes should cause a re-sort/filter
        if (this.__sortFn || this.__filterFn) {
          if (!path) {
            // Always re-render if the item itself changed
            this.__debounceRender(this.__render, this.delay);
          } else if (this.__observePaths) {
            // Otherwise, re-render if the path changed matches an observed path
            var paths = this.__observePaths;
            for (var i = 0; i < paths.length; i++) {
              if (path.indexOf(paths[i]) === 0) {
                this.__debounceRender(this.__render, this.delay);
              }
            }
          }
        }
      }

      /**
       * @param {function(this:DomRepeat)} fn Function to debounce.
       * @param {number=} delay Delay in ms to debounce by.
       */

    }, {
      key: '__debounceRender',
      value: function __debounceRender(fn) {
        var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        this.__renderDebouncer = Debouncer.debounce(this.__renderDebouncer, delay > 0 ? timeOut.after(delay) : microTask, fn.bind(this));
        enqueueDebouncer(this.__renderDebouncer);
      }

      /**
       * Forces the element to render its content. Normally rendering is
       * asynchronous to a provoking change. This is done for efficiency so
       * that multiple changes trigger only a single render. The render method
       * should be called if, for example, template rendering is required to
       * validate application state.
       * @return {void}
       */

    }, {
      key: 'render',
      value: function render() {
        // Queue this repeater, then flush all in order
        this.__debounceRender(this.__render);
        flush$1();
      }
    }, {
      key: '__render',
      value: function __render() {
        if (!this.__ensureTemplatized()) {
          // No template found yet
          return;
        }
        this.__applyFullRefresh();
        // Reset the pool
        // TODO(kschaaf): Reuse pool across turns and nested templates
        // Now that objects/arrays are re-evaluated when set, we can safely
        // reuse pooled instances across turns, however we still need to decide
        // semantics regarding how long to hold, how many to hold, etc.
        this.__pool.length = 0;
        // Set rendered item count
        this._setRenderedItemCount(this.__instances.length);
        // Notify users
        this.dispatchEvent(new CustomEvent('dom-change', {
          bubbles: true,
          composed: true
        }));
        // Check to see if we need to render more items
        this.__tryRenderChunk();
      }
    }, {
      key: '__applyFullRefresh',
      value: function __applyFullRefresh() {
        var _this4 = this;

        var items = this.items || [];
        var isntIdxToItemsIdx = new Array(items.length);
        for (var i = 0; i < items.length; i++) {
          isntIdxToItemsIdx[i] = i;
        }
        // Apply user filter
        if (this.__filterFn) {
          isntIdxToItemsIdx = isntIdxToItemsIdx.filter(function (i, idx, array) {
            return _this4.__filterFn(items[i], idx, array);
          });
        }
        // Apply user sort
        if (this.__sortFn) {
          isntIdxToItemsIdx.sort(function (a, b) {
            return _this4.__sortFn(items[a], items[b]);
          });
        }
        // items->inst map kept for item path forwarding
        var itemsIdxToInstIdx = this.__itemsIdxToInstIdx = {};
        var instIdx = 0;
        // Generate instances and assign items
        var limit = Math.min(isntIdxToItemsIdx.length, this.__limit);
        for (; instIdx < limit; instIdx++) {
          var inst = this.__instances[instIdx];
          var itemIdx = isntIdxToItemsIdx[instIdx];
          var item = items[itemIdx];
          itemsIdxToInstIdx[itemIdx] = instIdx;
          if (inst) {
            inst._setPendingProperty(this.as, item);
            inst._setPendingProperty(this.indexAs, instIdx);
            inst._setPendingProperty(this.itemsIndexAs, itemIdx);
            inst._flushProperties();
          } else {
            this.__insertInstance(item, instIdx, itemIdx);
          }
        }
        // Remove any extra instances from previous state
        for (var _i = this.__instances.length - 1; _i >= instIdx; _i--) {
          this.__detachAndRemoveInstance(_i);
        }
      }
    }, {
      key: '__detachInstance',
      value: function __detachInstance(idx) {
        var inst = this.__instances[idx];
        for (var i = 0; i < inst.children.length; i++) {
          var el = inst.children[i];
          inst.root.appendChild(el);
        }
        return inst;
      }
    }, {
      key: '__attachInstance',
      value: function __attachInstance(idx, parent) {
        var inst = this.__instances[idx];
        parent.insertBefore(inst.root, this);
      }
    }, {
      key: '__detachAndRemoveInstance',
      value: function __detachAndRemoveInstance(idx) {
        var inst = this.__detachInstance(idx);
        if (inst) {
          this.__pool.push(inst);
        }
        this.__instances.splice(idx, 1);
      }
    }, {
      key: '__stampInstance',
      value: function __stampInstance(item, instIdx, itemIdx) {
        var model = {};
        model[this.as] = item;
        model[this.indexAs] = instIdx;
        model[this.itemsIndexAs] = itemIdx;
        return new this.__ctor(model);
      }
    }, {
      key: '__insertInstance',
      value: function __insertInstance(item, instIdx, itemIdx) {
        var inst = this.__pool.pop();
        if (inst) {
          // TODO(kschaaf): If the pool is shared across turns, hostProps
          // need to be re-set to reused instances in addition to item
          inst._setPendingProperty(this.as, item);
          inst._setPendingProperty(this.indexAs, instIdx);
          inst._setPendingProperty(this.itemsIndexAs, itemIdx);
          inst._flushProperties();
        } else {
          inst = this.__stampInstance(item, instIdx, itemIdx);
        }
        var beforeRow = this.__instances[instIdx + 1];
        var beforeNode = beforeRow ? beforeRow.children[0] : this;
        this.parentNode.insertBefore(inst.root, beforeNode);
        this.__instances[instIdx] = inst;
        return inst;
      }

      // Implements extension point from Templatize mixin
      /**
       * Shows or hides the template instance top level child elements. For
       * text nodes, `textContent` is removed while "hidden" and replaced when
       * "shown."
       * @param {boolean} hidden Set to true to hide the children;
       * set to false to show them.
       * @return {void}
       * @protected
       */

    }, {
      key: '_showHideChildren',
      value: function _showHideChildren(hidden) {
        for (var i = 0; i < this.__instances.length; i++) {
          this.__instances[i]._showHideChildren(hidden);
        }
      }

      // Called as a side effect of a host items.<key>.<path> path change,
      // responsible for notifying item.<path> changes to inst for key

    }, {
      key: '__handleItemPath',
      value: function __handleItemPath(path, value) {
        var itemsPath = path.slice(6); // 'items.'.length == 6
        var dot = itemsPath.indexOf('.');
        var itemsIdx = dot < 0 ? itemsPath : itemsPath.substring(0, dot);
        // If path was index into array...
        if (itemsIdx == parseInt(itemsIdx, 10)) {
          var itemSubPath = dot < 0 ? '' : itemsPath.substring(dot + 1);
          // If the path is observed, it will trigger a full refresh
          this.__handleObservedPaths(itemSubPath);
          // Note, even if a rull refresh is triggered, always do the path
          // notification because unless mutableData is used for dom-repeat
          // and all elements in the instance subtree, a full refresh may
          // not trigger the proper update.
          var instIdx = this.__itemsIdxToInstIdx[itemsIdx];
          var inst = this.__instances[instIdx];
          if (inst) {
            var itemPath = this.as + (itemSubPath ? '.' + itemSubPath : '');
            // This is effectively `notifyPath`, but avoids some of the overhead
            // of the public API
            inst._setPendingPropertyOrPath(itemPath, value, false, true);
            inst._flushProperties();
          }
          return true;
        }
      }

      /**
       * Returns the item associated with a given element stamped by
       * this `dom-repeat`.
       *
       * Note, to modify sub-properties of the item,
       * `modelForElement(el).set('item.<sub-prop>', value)`
       * should be used.
       *
       * @param {!HTMLElement} el Element for which to return the item.
       * @return {*} Item associated with the element.
       */

    }, {
      key: 'itemForElement',
      value: function itemForElement(el) {
        var instance = this.modelForElement(el);
        return instance && instance[this.as];
      }

      /**
       * Returns the inst index for a given element stamped by this `dom-repeat`.
       * If `sort` is provided, the index will reflect the sorted order (rather
       * than the original array order).
       *
       * @param {!HTMLElement} el Element for which to return the index.
       * @return {?number} Row index associated with the element (note this may
       *   not correspond to the array index if a user `sort` is applied).
       */

    }, {
      key: 'indexForElement',
      value: function indexForElement(el) {
        var instance = this.modelForElement(el);
        return instance && instance[this.indexAs];
      }

      /**
       * Returns the template "model" associated with a given element, which
       * serves as the binding scope for the template instance the element is
       * contained in. A template model
       * should be used to manipulate data associated with this template instance.
       *
       * Example:
       *
       *   let model = modelForElement(el);
       *   if (model.index < 10) {
       *     model.set('item.checked', true);
       *   }
       *
       * @param {!HTMLElement} el Element for which to return a template model.
       * @return {TemplateInstanceBase} Model representing the binding scope for
       *   the element.
       */

    }, {
      key: 'modelForElement',
      value: function modelForElement$$1(el) {
        return modelForElement(this.template, el);
      }
    }]);
    return DomRepeat;
  }(domRepeatBase);

  customElements.define(DomRepeat.is, DomRepeat);

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * The `<dom-if>` element will stamp a light-dom `<template>` child when
   * the `if` property becomes truthy, and the template can use Polymer
   * data-binding and declarative event features when used in the context of
   * a Polymer element's template.
   *
   * When `if` becomes falsy, the stamped content is hidden but not
   * removed from dom. When `if` subsequently becomes truthy again, the content
   * is simply re-shown. This approach is used due to its favorable performance
   * characteristics: the expense of creating template content is paid only
   * once and lazily.
   *
   * Set the `restamp` property to true to force the stamped content to be
   * created / destroyed when the `if` condition changes.
   *
   * @customElement
   * @polymer
   * @extends PolymerElement
   * @summary Custom element that conditionally stamps and hides or removes
   *   template content based on a boolean flag.
   */
  var DomIf = function (_PolymerElement) {
    inherits(DomIf, _PolymerElement);
    createClass(DomIf, null, [{
      key: 'is',


      // Not needed to find template; can be removed once the analyzer
      // can find the tag name from customElements.define call
      get: function get$$1() {
        return 'dom-if';
      }
    }, {
      key: 'template',
      get: function get$$1() {
        return null;
      }
    }, {
      key: 'properties',
      get: function get$$1() {

        return {

          /**
           * Fired whenever DOM is added or removed/hidden by this template (by
           * default, rendering occurs lazily).  To force immediate rendering, call
           * `render`.
           *
           * @event dom-change
           */

          /**
           * A boolean indicating whether this template should stamp.
           */
          if: {
            type: Boolean,
            observer: '__debounceRender'
          },

          /**
           * When true, elements will be removed from DOM and discarded when `if`
           * becomes false and re-created and added back to the DOM when `if`
           * becomes true.  By default, stamped elements will be hidden but left
           * in the DOM when `if` becomes false, which is generally results
           * in better performance.
           */
          restamp: {
            type: Boolean,
            observer: '__debounceRender'
          }

        };
      }
    }]);

    function DomIf() {
      classCallCheck(this, DomIf);

      var _this = possibleConstructorReturn(this, (DomIf.__proto__ || Object.getPrototypeOf(DomIf)).call(this));

      _this.__renderDebouncer = null;
      _this.__invalidProps = null;
      _this.__instance = null;
      _this._lastIf = false;
      _this.__ctor = null;
      return _this;
    }

    createClass(DomIf, [{
      key: '__debounceRender',
      value: function __debounceRender() {
        var _this2 = this;

        // Render is async for 2 reasons:
        // 1. To eliminate dom creation trashing if user code thrashes `if` in the
        //    same turn. This was more common in 1.x where a compound computed
        //    property could result in the result changing multiple times, but is
        //    mitigated to a large extent by batched property processing in 2.x.
        // 2. To avoid double object propagation when a bag including values bound
        //    to the `if` property as well as one or more hostProps could enqueue
        //    the <dom-if> to flush before the <template>'s host property
        //    forwarding. In that scenario creating an instance would result in
        //    the host props being set once, and then the enqueued changes on the
        //    template would set properties a second time, potentially causing an
        //    object to be set to an instance more than once.  Creating the
        //    instance async from flushing data ensures this doesn't happen. If
        //    we wanted a sync option in the future, simply having <dom-if> flush
        //    (or clear) its template's pending host properties before creating
        //    the instance would also avoid the problem.
        this.__renderDebouncer = Debouncer.debounce(this.__renderDebouncer, microTask, function () {
          return _this2.__render();
        });
        enqueueDebouncer(this.__renderDebouncer);
      }

      /**
       * @return {void}
       */

    }, {
      key: 'disconnectedCallback',
      value: function disconnectedCallback() {
        get(DomIf.prototype.__proto__ || Object.getPrototypeOf(DomIf.prototype), 'disconnectedCallback', this).call(this);
        if (!this.parentNode || this.parentNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE && !this.parentNode.host) {
          this.__teardownInstance();
        }
      }

      /**
       * @return {void}
       */

    }, {
      key: 'connectedCallback',
      value: function connectedCallback() {
        get(DomIf.prototype.__proto__ || Object.getPrototypeOf(DomIf.prototype), 'connectedCallback', this).call(this);
        this.style.display = 'none';
        if (this.if) {
          this.__debounceRender();
        }
      }

      /**
       * Forces the element to render its content. Normally rendering is
       * asynchronous to a provoking change. This is done for efficiency so
       * that multiple changes trigger only a single render. The render method
       * should be called if, for example, template rendering is required to
       * validate application state.
       * @return {void}
       */

    }, {
      key: 'render',
      value: function render() {
        flush$1();
      }
    }, {
      key: '__render',
      value: function __render() {
        if (this.if) {
          if (!this.__ensureInstance()) {
            // No template found yet
            return;
          }
          this._showHideChildren();
        } else if (this.restamp) {
          this.__teardownInstance();
        }
        if (!this.restamp && this.__instance) {
          this._showHideChildren();
        }
        if (this.if != this._lastIf) {
          this.dispatchEvent(new CustomEvent('dom-change', {
            bubbles: true,
            composed: true
          }));
          this._lastIf = this.if;
        }
      }
    }, {
      key: '__ensureInstance',
      value: function __ensureInstance() {
        var _this3 = this;

        var parentNode = this.parentNode;
        // Guard against element being detached while render was queued
        if (parentNode) {
          if (!this.__ctor) {
            var template = /** @type {HTMLTemplateElement} */this.querySelector('template');
            if (!template) {
              // Wait until childList changes and template should be there by then
              var observer = new MutationObserver(function () {
                if (_this3.querySelector('template')) {
                  observer.disconnect();
                  _this3.__render();
                } else {
                  throw new Error('dom-if requires a <template> child');
                }
              });
              observer.observe(this, { childList: true });
              return false;
            }
            this.__ctor = templatize(template, this, {
              // dom-if templatizer instances require `mutable: true`, as
              // `__syncHostProperties` relies on that behavior to sync objects
              mutableData: true,
              /**
               * @param {string} prop Property to forward
               * @param {*} value Value of property
               * @this {this}
               */
              forwardHostProp: function forwardHostProp(prop, value) {
                if (this.__instance) {
                  if (this.if) {
                    this.__instance.forwardHostProp(prop, value);
                  } else {
                    // If we have an instance but are squelching host property
                    // forwarding due to if being false, note the invalidated
                    // properties so `__syncHostProperties` can sync them the next
                    // time `if` becomes true
                    this.__invalidProps = this.__invalidProps || Object.create(null);
                    this.__invalidProps[root(prop)] = true;
                  }
                }
              }
            });
          }
          if (!this.__instance) {
            this.__instance = new this.__ctor();
            parentNode.insertBefore(this.__instance.root, this);
          } else {
            this.__syncHostProperties();
            var c$ = this.__instance.children;
            if (c$ && c$.length) {
              // Detect case where dom-if was re-attached in new position
              var lastChild = this.previousSibling;
              if (lastChild !== c$[c$.length - 1]) {
                for (var i = 0, n; i < c$.length && (n = c$[i]); i++) {
                  parentNode.insertBefore(n, this);
                }
              }
            }
          }
        }
        return true;
      }
    }, {
      key: '__syncHostProperties',
      value: function __syncHostProperties() {
        var props = this.__invalidProps;
        if (props) {
          for (var prop in props) {
            this.__instance._setPendingProperty(prop, this.__dataHost[prop]);
          }
          this.__invalidProps = null;
          this.__instance._flushProperties();
        }
      }
    }, {
      key: '__teardownInstance',
      value: function __teardownInstance() {
        if (this.__instance) {
          var c$ = this.__instance.children;
          if (c$ && c$.length) {
            // use first child parent, for case when dom-if may have been detached
            var parent = c$[0].parentNode;
            for (var i = 0, n; i < c$.length && (n = c$[i]); i++) {
              parent.removeChild(n);
            }
          }
          this.__instance = null;
          this.__invalidProps = null;
        }
      }

      /**
       * Shows or hides the template instance top level child elements. For
       * text nodes, `textContent` is removed while "hidden" and replaced when
       * "shown."
       * @return {void}
       * @protected
       */

    }, {
      key: '_showHideChildren',
      value: function _showHideChildren() {
        var hidden = this.__hideTemplateChildren__ || !this.if;
        if (this.__instance) {
          this.__instance._showHideChildren(hidden);
        }
      }
    }]);
    return DomIf;
  }(PolymerElement);

  customElements.define(DomIf.is, DomIf);

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * Element mixin for recording dynamic associations between item paths in a
   * master `items` array and a `selected` array such that path changes to the
   * master array (at the host) element or elsewhere via data-binding) are
   * correctly propagated to items in the selected array and vice-versa.
   *
   * The `items` property accepts an array of user data, and via the
   * `select(item)` and `deselect(item)` API, updates the `selected` property
   * which may be bound to other parts of the application, and any changes to
   * sub-fields of `selected` item(s) will be kept in sync with items in the
   * `items` array.  When `multi` is false, `selected` is a property
   * representing the last selected item.  When `multi` is true, `selected`
   * is an array of multiply selected items.
   *
   * @polymer
   * @mixinFunction
   * @appliesMixin ElementMixin
   * @summary Element mixin for recording dynamic associations between item paths in a
   * master `items` array and a `selected` array
   */
  var ArraySelectorMixin = dedupingMixin(function (superClass) {

    /**
     * @constructor
     * @extends {superClass}
     * @implements {Polymer_ElementMixin}
     */
    var elementBase = ElementMixin(superClass);

    /**
     * @polymer
     * @mixinClass
     * @implements {Polymer_ArraySelectorMixin}
     * @unrestricted
     */

    var ArraySelectorMixin = function (_elementBase) {
      inherits(ArraySelectorMixin, _elementBase);
      createClass(ArraySelectorMixin, null, [{
        key: 'properties',
        get: function get$$1() {

          return {

            /**
             * An array containing items from which selection will be made.
             */
            items: {
              type: Array
            },

            /**
             * When `true`, multiple items may be selected at once (in this case,
             * `selected` is an array of currently selected items).  When `false`,
             * only one item may be selected at a time.
             */
            multi: {
              type: Boolean,
              value: false
            },

            /**
             * When `multi` is true, this is an array that contains any selected.
             * When `multi` is false, this is the currently selected item, or `null`
             * if no item is selected.
             * @type {?(Object|Array<!Object>)}
             */
            selected: {
              type: Object,
              notify: true
            },

            /**
             * When `multi` is false, this is the currently selected item, or `null`
             * if no item is selected.
             * @type {?Object}
             */
            selectedItem: {
              type: Object,
              notify: true
            },

            /**
             * When `true`, calling `select` on an item that is already selected
             * will deselect the item.
             */
            toggle: {
              type: Boolean,
              value: false
            }

          };
        }
      }, {
        key: 'observers',
        get: function get$$1() {
          return ['__updateSelection(multi, items.*)'];
        }
      }]);

      function ArraySelectorMixin() {
        classCallCheck(this, ArraySelectorMixin);

        var _this = possibleConstructorReturn(this, (ArraySelectorMixin.__proto__ || Object.getPrototypeOf(ArraySelectorMixin)).call(this));

        _this.__lastItems = null;
        _this.__lastMulti = null;
        _this.__selectedMap = null;
        return _this;
      }

      createClass(ArraySelectorMixin, [{
        key: '__updateSelection',
        value: function __updateSelection(multi, itemsInfo) {
          var path = itemsInfo.path;
          if (path == 'items') {
            // Case 1 - items array changed, so diff against previous array and
            // deselect any removed items and adjust selected indices
            var newItems = itemsInfo.base || [];
            var lastItems = this.__lastItems;
            var lastMulti = this.__lastMulti;
            if (multi !== lastMulti) {
              this.clearSelection();
            }
            if (lastItems) {
              var splices = calculateSplices(newItems, lastItems);
              this.__applySplices(splices);
            }
            this.__lastItems = newItems;
            this.__lastMulti = multi;
          } else if (itemsInfo.path == 'items.splices') {
            // Case 2 - got specific splice information describing the array mutation:
            // deselect any removed items and adjust selected indices
            this.__applySplices(itemsInfo.value.indexSplices);
          } else {
            // Case 3 - an array element was changed, so deselect the previous
            // item for that index if it was previously selected
            var part = path.slice('items.'.length);
            var idx = parseInt(part, 10);
            if (part.indexOf('.') < 0 && part == idx) {
              this.__deselectChangedIdx(idx);
            }
          }
        }
      }, {
        key: '__applySplices',
        value: function __applySplices(splices) {
          var _this2 = this;

          var selected = this.__selectedMap;
          // Adjust selected indices and mark removals

          var _loop = function _loop(i) {
            var s = splices[i];
            selected.forEach(function (idx, item) {
              if (idx < s.index) ; else if (idx >= s.index + s.removed.length) {
                // adjust index
                selected.set(item, idx + s.addedCount - s.removed.length);
              } else {
                // remove index
                selected.set(item, -1);
              }
            });
            for (var j = 0; j < s.addedCount; j++) {
              var idx = s.index + j;
              if (selected.has(_this2.items[idx])) {
                selected.set(_this2.items[idx], idx);
              }
            }
          };

          for (var i = 0; i < splices.length; i++) {
            _loop(i);
          }
          // Update linked paths
          this.__updateLinks();
          // Remove selected items that were removed from the items array
          var sidx = 0;
          selected.forEach(function (idx, item) {
            if (idx < 0) {
              if (_this2.multi) {
                _this2.splice('selected', sidx, 1);
              } else {
                _this2.selected = _this2.selectedItem = null;
              }
              selected.delete(item);
            } else {
              sidx++;
            }
          });
        }
      }, {
        key: '__updateLinks',
        value: function __updateLinks() {
          var _this3 = this;

          this.__dataLinkedPaths = {};
          if (this.multi) {
            var sidx = 0;
            this.__selectedMap.forEach(function (idx) {
              if (idx >= 0) {
                _this3.linkPaths('items.' + idx, 'selected.' + sidx++);
              }
            });
          } else {
            this.__selectedMap.forEach(function (idx) {
              _this3.linkPaths('selected', 'items.' + idx);
              _this3.linkPaths('selectedItem', 'items.' + idx);
            });
          }
        }

        /**
         * Clears the selection state.
         * @return {void}
         */

      }, {
        key: 'clearSelection',
        value: function clearSelection() {
          // Unbind previous selection
          this.__dataLinkedPaths = {};
          // The selected map stores 3 pieces of information:
          // key: items array object
          // value: items array index
          // order: selected array index
          this.__selectedMap = new Map();
          // Initialize selection
          this.selected = this.multi ? [] : null;
          this.selectedItem = null;
        }

        /**
         * Returns whether the item is currently selected.
         *
         * @param {*} item Item from `items` array to test
         * @return {boolean} Whether the item is selected
         */

      }, {
        key: 'isSelected',
        value: function isSelected(item) {
          return this.__selectedMap.has(item);
        }

        /**
         * Returns whether the item is currently selected.
         *
         * @param {number} idx Index from `items` array to test
         * @return {boolean} Whether the item is selected
         */

      }, {
        key: 'isIndexSelected',
        value: function isIndexSelected(idx) {
          return this.isSelected(this.items[idx]);
        }
      }, {
        key: '__deselectChangedIdx',
        value: function __deselectChangedIdx(idx) {
          var _this4 = this;

          var sidx = this.__selectedIndexForItemIndex(idx);
          if (sidx >= 0) {
            var i = 0;
            this.__selectedMap.forEach(function (idx, item) {
              if (sidx == i++) {
                _this4.deselect(item);
              }
            });
          }
        }
      }, {
        key: '__selectedIndexForItemIndex',
        value: function __selectedIndexForItemIndex(idx) {
          var selected = this.__dataLinkedPaths['items.' + idx];
          if (selected) {
            return parseInt(selected.slice('selected.'.length), 10);
          }
        }

        /**
         * Deselects the given item if it is already selected.
         *
         * @param {*} item Item from `items` array to deselect
         * @return {void}
         */

      }, {
        key: 'deselect',
        value: function deselect(item) {
          var idx = this.__selectedMap.get(item);
          if (idx >= 0) {
            this.__selectedMap.delete(item);
            var sidx = void 0;
            if (this.multi) {
              sidx = this.__selectedIndexForItemIndex(idx);
            }
            this.__updateLinks();
            if (this.multi) {
              this.splice('selected', sidx, 1);
            } else {
              this.selected = this.selectedItem = null;
            }
          }
        }

        /**
         * Deselects the given index if it is already selected.
         *
         * @param {number} idx Index from `items` array to deselect
         * @return {void}
         */

      }, {
        key: 'deselectIndex',
        value: function deselectIndex(idx) {
          this.deselect(this.items[idx]);
        }

        /**
         * Selects the given item.  When `toggle` is true, this will automatically
         * deselect the item if already selected.
         *
         * @param {*} item Item from `items` array to select
         * @return {void}
         */

      }, {
        key: 'select',
        value: function select(item) {
          this.selectIndex(this.items.indexOf(item));
        }

        /**
         * Selects the given index.  When `toggle` is true, this will automatically
         * deselect the item if already selected.
         *
         * @param {number} idx Index from `items` array to select
         * @return {void}
         */

      }, {
        key: 'selectIndex',
        value: function selectIndex(idx) {
          var item = this.items[idx];
          if (!this.isSelected(item)) {
            if (!this.multi) {
              this.__selectedMap.clear();
            }
            this.__selectedMap.set(item, idx);
            this.__updateLinks();
            if (this.multi) {
              this.push('selected', item);
            } else {
              this.selected = this.selectedItem = item;
            }
          } else if (this.toggle) {
            this.deselectIndex(idx);
          }
        }
      }]);
      return ArraySelectorMixin;
    }(elementBase);

    return ArraySelectorMixin;
  });

  /**
   * @constructor
   * @extends {PolymerElement}
   * @implements {Polymer_ArraySelectorMixin}
   */
  var baseArraySelector = ArraySelectorMixin(PolymerElement);

  /**
   * Element implementing the `ArraySelector` mixin, which records
   * dynamic associations between item paths in a master `items` array and a
   * `selected` array such that path changes to the master array (at the host)
   * element or elsewhere via data-binding) are correctly propagated to items
   * in the selected array and vice-versa.
   *
   * The `items` property accepts an array of user data, and via the
   * `select(item)` and `deselect(item)` API, updates the `selected` property
   * which may be bound to other parts of the application, and any changes to
   * sub-fields of `selected` item(s) will be kept in sync with items in the
   * `items` array.  When `multi` is false, `selected` is a property
   * representing the last selected item.  When `multi` is true, `selected`
   * is an array of multiply selected items.
   *
   * Example:
   *
   * ```js
   * import {PolymerElement} from '@polymer/polymer';
   * import '@polymer/polymer/lib/elements/array-selector.js';
   *
   * class EmployeeList extends PolymerElement {
   *   static get _template() {
   *     return html`
   *         <div> Employee list: </div>
   *         <dom-repeat id="employeeList" items="{{employees}}">
   *           <template>
   *             <div>First name: <span>{{item.first}}</span></div>
   *               <div>Last name: <span>{{item.last}}</span></div>
   *               <button on-click="toggleSelection">Select</button>
   *           </template>
   *         </dom-repeat>
   *
   *         <array-selector id="selector"
   *                         items="{{employees}}"
   *                         selected="{{selected}}"
   *                         multi toggle></array-selector>
   *
   *         <div> Selected employees: </div>
   *         <dom-repeat items="{{selected}}">
   *           <template>
   *             <div>First name: <span>{{item.first}}</span></div>
   *             <div>Last name: <span>{{item.last}}</span></div>
   *           </template>
   *         </dom-repeat>`;
   *   }
   *   static get is() { return 'employee-list'; }
   *   static get properties() {
   *     return {
   *       employees: {
   *         value() {
   *           return [
   *             {first: 'Bob', last: 'Smith'},
   *             {first: 'Sally', last: 'Johnson'},
   *             ...
   *           ];
   *         }
   *       }
   *     };
   *   }
   *   toggleSelection(e) {
   *     const item = this.$.employeeList.itemForElement(e.target);
   *     this.$.selector.select(item);
   *   }
   * }
   * ```
   *
   * @polymer
   * @customElement
   * @extends {baseArraySelector}
   * @appliesMixin ArraySelectorMixin
   * @summary Custom element that links paths between an input `items` array and
   *   an output `selected` item or array based on calls to its selection API.
   */

  var ArraySelector = function (_baseArraySelector) {
    inherits(ArraySelector, _baseArraySelector);

    function ArraySelector() {
      classCallCheck(this, ArraySelector);
      return possibleConstructorReturn(this, (ArraySelector.__proto__ || Object.getPrototypeOf(ArraySelector)).apply(this, arguments));
    }

    createClass(ArraySelector, null, [{
      key: 'is',

      // Not needed to find template; can be removed once the analyzer
      // can find the tag name from customElements.define call
      get: function get$$1() {
        return 'array-selector';
      }
    }]);
    return ArraySelector;
  }(baseArraySelector);

  customElements.define(ArraySelector.is, ArraySelector);

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var customStyleInterface = new CustomStyleInterface();

  if (!window.ShadyCSS) {
    window.ShadyCSS = {
      /**
       * @param {HTMLTemplateElement} template
       * @param {string} elementName
       * @param {string=} elementExtends
       */
      prepareTemplate: function prepareTemplate(template, elementName, elementExtends) {},
      // eslint-disable-line no-unused-vars

      /**
       * @param {Element} element
       * @param {Object=} properties
       */
      styleSubtree: function styleSubtree(element, properties) {
        customStyleInterface.processStyles();
        updateNativeProperties(element, properties);
      },


      /**
       * @param {Element} element
       */
      styleElement: function styleElement(element) {
        // eslint-disable-line no-unused-vars
        customStyleInterface.processStyles();
      },


      /**
       * @param {Object=} properties
       */
      styleDocument: function styleDocument(properties) {
        customStyleInterface.processStyles();
        updateNativeProperties(document.body, properties);
      },


      /**
       * @param {Element} element
       * @param {string} property
       * @return {string}
       */
      getComputedStyleValue: function getComputedStyleValue$$1(element, property) {
        return getComputedStyleValue(element, property);
      },
      flushCustomStyles: function flushCustomStyles() {},

      nativeCss: nativeCssVariables,
      nativeShadow: nativeShadow
    };
  }

  window.ShadyCSS.CustomStyleInterface = customStyleInterface;

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var attr = 'include';

  var CustomStyleInterface$2 = window.ShadyCSS.CustomStyleInterface;

  /**
   * Custom element for defining styles in the main document that can take
   * advantage of [shady DOM](https://github.com/webcomponents/shadycss) shims
   * for style encapsulation, custom properties, and custom mixins.
   *
   * - Document styles defined in a `<custom-style>` are shimmed to ensure they
   *   do not leak into local DOM when running on browsers without native
   *   Shadow DOM.
   * - Custom properties can be defined in a `<custom-style>`. Use the `html` selector
   *   to define custom properties that apply to all custom elements.
   * - Custom mixins can be defined in a `<custom-style>`, if you import the optional
   *   [apply shim](https://github.com/webcomponents/shadycss#about-applyshim)
   *   (`shadycss/apply-shim.html`).
   *
   * To use:
   *
   * - Import `custom-style.html`.
   * - Place a `<custom-style>` element in the main document, wrapping an inline `<style>` tag that
   *   contains the CSS rules you want to shim.
   *
   * For example:
   *
   * ```html
   * <!-- import apply shim--only required if using mixins -->
   * <link rel="import" href="bower_components/shadycss/apply-shim.html">
   * <!-- import custom-style element -->
   * <link rel="import" href="bower_components/polymer/lib/elements/custom-style.html">
   *
   * <custom-style>
   *   <style>
   *     html {
   *       --custom-color: blue;
   *       --custom-mixin: {
   *         font-weight: bold;
   *         color: red;
   *       };
   *     }
   *   </style>
   * </custom-style>
   * ```
   *
   * @customElement
   * @extends HTMLElement
   * @summary Custom element for defining styles in the main document that can
   *   take advantage of Polymer's style scoping and custom properties shims.
   */
  var CustomStyle = function (_HTMLElement) {
    inherits(CustomStyle, _HTMLElement);

    function CustomStyle() {
      classCallCheck(this, CustomStyle);

      var _this = possibleConstructorReturn(this, (CustomStyle.__proto__ || Object.getPrototypeOf(CustomStyle)).call(this));

      _this._style = null;
      CustomStyleInterface$2.addCustomStyle(_this);
      return _this;
    }
    /**
     * Returns the light-DOM `<style>` child this element wraps.  Upon first
     * call any style modules referenced via the `include` attribute will be
     * concatenated to this element's `<style>`.
     *
     * @return {HTMLStyleElement} This element's light-DOM `<style>`
     */


    createClass(CustomStyle, [{
      key: 'getStyle',
      value: function getStyle() {
        if (this._style) {
          return this._style;
        }
        var style = /** @type {HTMLStyleElement} */this.querySelector('style');
        if (!style) {
          return null;
        }
        this._style = style;
        var include = style.getAttribute(attr);
        if (include) {
          style.removeAttribute(attr);
          style.textContent = cssFromModules(include) + style.textContent;
        }
        /*
        HTML Imports styling the main document are deprecated in Chrome
        https://crbug.com/523952
         If this element is not in the main document, then it must be in an HTML Import document.
        In that case, move the custom style to the main document.
         The ordering of `<custom-style>` should stay the same as when loaded by HTML Imports, but there may be odd
        cases of ordering w.r.t the main document styles.
        */
        if (this.ownerDocument !== window.document) {
          window.document.head.appendChild(this);
        }
        return this._style;
      }
    }]);
    return CustomStyle;
  }(HTMLElement);

  window.customElements.define('custom-style', CustomStyle);

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  var mutablePropertyChange$1 = void 0;
  /** @suppress {missingProperties} */
  (function () {
    mutablePropertyChange$1 = MutableData._mutablePropertyChange;
  })();

  /**
  @license
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  // bc
  var Base = LegacyElementMixin(HTMLElement).prototype;

  /**
  @license
  Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */

  /**
   * @license
   * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */

  // We declare it as a namespace to be compatible with JSCompiler.
  /** @const */var MockInteractions = {};

  (function (scope, global) {

    // In case the var above was not global, or if it was renamed.

    global.MockInteractions = scope;

    var HAS_NEW_MOUSE = function () {
      var has = false;
      try {
        has = Boolean(new MouseEvent('x'));
      } catch (_) {}
      return has;
    }();

    var HAS_NEW_TOUCH = function () {
      var has = false;
      try {
        has = Boolean(new TouchEvent('x'));
      } catch (_) {}
      return has;
    }();

    /**
     * Returns the (x,y) coordinates representing the middle of a node.
     *
     * @param {!Element} node An element.
     */
    function middleOfNode(node) {
      var bcr = node.getBoundingClientRect();
      return {
        y: bcr.top + bcr.height / 2,
        x: bcr.left + bcr.width / 2
      };
    }

    /**
     * Returns the (x,y) coordinates representing the top left corner of a node.
     *
     * @param {!Element} node An element.
     */
    function topLeftOfNode(node) {
      var bcr = node.getBoundingClientRect();
      return {
        y: bcr.top,
        x: bcr.left
      };
    }

    /**
     * Returns a list of Touch objects that correspond to an array of positions
     * and a target node. The Touch instances will each have a unique Touch
     * identifier.
     *
     * @param {!Array<{ x: number, y: number }>} xyList A list of (x,y) coordinate objects.
     * @param {!Element} node A target element node.
     */
    function makeTouches(xyList, node) {
      var id = 0;

      return xyList.map(function (xy) {
        var touchInit = {
          identifier: id++,
          target: node,
          clientX: xy.x,
          clientY: xy.y
        };

        return HAS_NEW_TOUCH ? new window.Touch(touchInit) : touchInit;
      });
    }

    /**
     * Generates and dispatches a TouchEvent of a given type, at a specified
     * position of a target node.
     *
     * @param {string} type The type of TouchEvent to generate.
     * @param {{ x: number, y: number }} xy An (x,y) coordinate for the generated
     * TouchEvent.
     * @param {!Element} node The target element node for the generated
     * TouchEvent to be dispatched on.
     */
    function makeSoloTouchEvent(type, xy, node) {
      xy = xy || middleOfNode(node);
      var touches = makeTouches([xy], node);
      var touchEventInit = {
        touches: touches,
        targetTouches: touches,
        changedTouches: touches
      };
      var event;

      if (HAS_NEW_TOUCH) {
        touchEventInit.bubbles = true;
        touchEventInit.cancelable = true;
        event = new TouchEvent(type, touchEventInit);
      } else {
        event = new CustomEvent(type, {
          bubbles: true,
          cancelable: true,
          // Allow event to go outside a ShadowRoot.
          composed: true
        });
        for (var property in touchEventInit) {
          event[property] = touchEventInit[property];
        }
      }

      node.dispatchEvent(event);
    }

    /**
     * Fires a mouse event on a specific node, at a given set of coordinates.
     * This event bubbles and is cancellable.
     *
     * @param {string} type The type of mouse event (such as 'tap' or 'down').
     * @param {{ x: number, y: number }} xy The (x,y) coordinates the mouse event should be fired from.
     * @param {!Element} node The node to fire the event on.
     */
    function makeMouseEvent(type, xy, node) {
      var props = {
        bubbles: true,
        cancelable: true,
        clientX: xy.x,
        clientY: xy.y,
        // Allow event to go outside a ShadowRoot.
        composed: true,
        // Make this a primary input.
        buttons: 1 // http://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
      };
      var e;
      if (HAS_NEW_MOUSE) {
        e = new MouseEvent(type, props);
      } else {
        e = document.createEvent('MouseEvent');
        e.initMouseEvent(type, props.bubbles, props.cancelable, null, /* view */
        null, /* detail */
        0, /* screenX */
        0, /* screenY */
        props.clientX, props.clientY, false, /*ctrlKey */
        false, /*altKey */
        false, /*shiftKey */
        false, /*metaKey */
        0, /*button */
        null /*relatedTarget*/);
      }
      node.dispatchEvent(e);
    }

    /**
     * Simulates a mouse move action by firing a `move` mouse event on a
     * specific node, between a set of coordinates.
     *
     * @param {!Element} node The node to fire the event on.
     * @param {Object} fromXY The (x,y) coordinates the dragging should start from.
     * @param {Object} toXY The (x,y) coordinates the dragging should end at.
     * @param {?number=} steps Optional. The numbers of steps in the move motion.
     *    If not specified, the default is 5.
     */
    function move(node, fromXY, toXY, steps) {
      steps = steps || 5;
      var dx = Math.round((fromXY.x - toXY.x) / steps);
      var dy = Math.round((fromXY.y - toXY.y) / steps);
      var xy = {
        x: fromXY.x,
        y: fromXY.y
      };
      for (var i = steps; i > 0; i--) {
        makeMouseEvent('mousemove', xy, node);
        xy.x += dx;
        xy.y += dy;
      }
      makeMouseEvent('mousemove', {
        x: toXY.x,
        y: toXY.y
      }, node);
    }

    /**
     * Simulates a mouse dragging action originating in the middle of a specific node.
     *
     * @param {!Element} target The node to fire the event on.
     * @param {?number} dx The horizontal displacement.
     * @param {?number} dy The vertical displacement
     * @param {?number=} steps Optional. The numbers of steps in the dragging motion.
     *    If not specified, the default is 5.
     */
    function track(target, dx, dy, steps) {
      dx = dx | 0;
      dy = dy | 0;
      steps = steps || 5;
      down(target);
      var xy = middleOfNode(target);
      var xy2 = {
        x: xy.x + dx,
        y: xy.y + dy
      };
      move(target, xy, xy2, steps);
      up(target, xy2);
    }

    /**
     * Fires a `down` mouse event on a specific node, at a given set of coordinates.
     * This event bubbles and is cancellable. If the (x,y) coordinates are
     * not specified, the middle of the node will be used instead.
     *
     * @param {!Element} node The node to fire the event on.
     * @param {{ x: number, y: number }=} xy Optional. The (x,y) coordinates the mouse event should be fired from.
     */
    function down(node, xy) {
      xy = xy || middleOfNode(node);
      makeMouseEvent('mousedown', xy, node);
    }

    /**
     * Fires an `up` mouse event on a specific node, at a given set of coordinates.
     * This event bubbles and is cancellable. If the (x,y) coordinates are
     * not specified, the middle of the node will be used instead.
     *
     * @param {!Element} node The node to fire the event on.
     * @param {{ x: number, y: number }=} xy Optional. The (x,y) coordinates the mouse event should be fired from.
     */
    function up(node, xy) {
      xy = xy || middleOfNode(node);
      makeMouseEvent('mouseup', xy, node);
    }

    /**
     * Generate a click event on a given node, optionally at a given coordinate.
     * @param {!Element} node The node to fire the click event on.
     * @param {{ x: number, y: number }=} xy Optional. The (x,y) coordinates the mouse event should
     * be fired from.
     */
    function click(node, xy) {
      xy = xy || middleOfNode(node);
      makeMouseEvent('click', xy, node);
    }

    /**
     * Generate a touchstart event on a given node, optionally at a given coordinate.
     * @param {!Element} node The node to fire the click event on.
     * @param {{ x: number, y: number }=} xy Optional. The (x,y) coordinates the touch event should
     * be fired from.
     */
    function touchstart(node, xy) {
      xy = xy || middleOfNode(node);
      makeSoloTouchEvent('touchstart', xy, node);
    }

    /**
     * Generate a touchend event on a given node, optionally at a given coordinate.
     * @param {!Element} node The node to fire the click event on.
     * @param {{ x: number, y: number }=} xy Optional. The (x,y) coordinates the touch event should
     * be fired from.
     */
    function touchend(node, xy) {
      xy = xy || middleOfNode(node);
      makeSoloTouchEvent('touchend', xy, node);
    }

    /**
     * Simulates a complete mouse click by firing a `down` mouse event, followed
     * by an asynchronous `up` and `tap` events on a specific node. Calls the
     *`callback` after the `tap` event is fired.
     *
     * @param {!Element} target The node to fire the event on.
     * @param {?Function=} callback Optional. The function to be called after the action ends.
     * @param {?{
     *   emulateTouch: boolean
     * }=} options Optional. Configure the emulation fidelity of the mouse events.
     */
    function downAndUp(target, callback, options) {
      if (options && options.emulateTouch) {
        touchstart(target);
        touchend(target);
      }

      down(target);
      Base.async(function () {
        up(target);
        click(target);
        callback && callback();
      });
    }

    /**
     * Fires a 'tap' mouse event on a specific node. This respects the pointer-events
     * set on the node, and will not fire on disabled nodes.
     *
     * @param {!Element} node The node to fire the event on.
     * @param {?{
     *   emulateTouch: boolean
     * }=} options Optional. Configure the emulation fidelity of the mouse event.
     */
    function tap(node, options) {
      // Respect nodes that are disabled in the UI.
      if (window.getComputedStyle(node)['pointer-events'] === 'none') return;

      var xy = middleOfNode(node);

      if (options && options.emulateTouch) {
        touchstart(node, xy);
        touchend(node, xy);
      }

      down(node, xy);
      up(node, xy);
      click(node, xy);
    }

    /**
     * Focuses a node by firing a `focus` event. This event does not bubble.
     *
     * @param {!Element} target The node to fire the event on.
     */
    function focus(target) {
      Base.fire('focus', {}, {
        bubbles: false,
        node: target
      });
    }

    /**
     * Blurs a node by firing a `blur` event. This event does not bubble.
     *
     * @param {!Element} target The node to fire the event on.
     */
    function blur(target) {
      Base.fire('blur', {}, {
        bubbles: false,
        node: target
      });
    }

    /**
     * Returns a keyboard event. This event bubbles and is cancellable.
     *
     * @param {string} type The type of keyboard event (such as 'keyup' or 'keydown').
     * @param {number} keyCode The keyCode for the event.
     * @param {(string|Array<string>)=} modifiers The key modifiers for the event.
     *     Accepted values are shift, ctrl, alt, meta.
     * @param {string=} key The KeyboardEvent.key value for the event.
     */
    function keyboardEventFor(type, keyCode, modifiers, key) {
      var event = new CustomEvent(type, {
        detail: 0,
        bubbles: true,
        cancelable: true,
        // Allow event to go outside a ShadowRoot.
        composed: true
      });

      event.keyCode = keyCode;
      event.code = keyCode;

      modifiers = modifiers || [];
      if (typeof modifiers === 'string') {
        modifiers = [modifiers];
      }
      event.shiftKey = modifiers.indexOf('shift') !== -1;
      event.altKey = modifiers.indexOf('alt') !== -1;
      event.ctrlKey = modifiers.indexOf('ctrl') !== -1;
      event.metaKey = modifiers.indexOf('meta') !== -1;

      event.key = key;

      return event;
    }

    /**
     * Fires a keyboard event on a specific node. This event bubbles and is cancellable.
     *
     * @param {!Element} target The node to fire the event on.
     * @param {string} type The type of keyboard event (such as 'keyup' or 'keydown').
     * @param {number} keyCode The keyCode for the event.
     * @param {(string|Array<string>)=} modifiers The key modifiers for the event.
     *     Accepted values are shift, ctrl, alt, meta.
     * @param {string=} key The KeyboardEvent.key value for the event.
     */
    function keyEventOn(target, type, keyCode, modifiers, key) {
      target.dispatchEvent(keyboardEventFor(type, keyCode, modifiers, key));
    }

    /**
     * Fires a 'keydown' event on a specific node. This event bubbles and is cancellable.
     *
     * @param {!Element} target The node to fire the event on.
     * @param {number} keyCode The keyCode for the event.
     * @param {(string|Array<string>)=} modifiers The key modifiers for the event.
     *     Accepted values are shift, ctrl, alt, meta.
     * @param {string=} key The KeyboardEvent.key value for the event.
     */
    function keyDownOn(target, keyCode, modifiers, key) {
      keyEventOn(target, 'keydown', keyCode, modifiers, key);
    }

    /**
     * Fires a 'keyup' event on a specific node. This event bubbles and is cancellable.
     *
     * @param {!Element} target The node to fire the event on.
     * @param {number} keyCode The keyCode for the event.
     * @param {(string|Array<string>)=} modifiers The key modifiers for the event.
     *     Accepted values are shift, ctrl, alt, meta.
     * @param {string=} key The KeyboardEvent.key value for the event.
     */
    function keyUpOn(target, keyCode, modifiers, key) {
      keyEventOn(target, 'keyup', keyCode, modifiers, key);
    }

    /**
     * Simulates a complete key press by firing a `keydown` keyboard event, followed
     * by an asynchronous `keyup` event on a specific node.
     *
     * @param {!Element} target The node to fire the event on.
     * @param {number} keyCode The keyCode for the event.
     * @param {(string|Array<string>)=} modifiers The key modifiers for the event.
     *     Accepted values are shift, ctrl, alt, meta.
     * @param {string=} key The KeyboardEvent.key value for the event.
     */
    function pressAndReleaseKeyOn(target, keyCode, modifiers, key) {
      keyDownOn(target, keyCode, modifiers, key);
      Base.async(function () {
        keyUpOn(target, keyCode, modifiers, key);
      }, 1);
    }

    /**
     * Simulates a complete 'enter' key press by firing a `keydown` keyboard event,
     * followed by an asynchronous `keyup` event on a specific node.
     *
     * @param {!Element} target The node to fire the event on.
     */
    function pressEnter(target) {
      pressAndReleaseKeyOn(target, 13);
    }

    /**
     * Simulates a complete 'space' key press by firing a `keydown` keyboard event,
     * followed by an asynchronous `keyup` event on a specific node.
     *
     * @param {!Element} target The node to fire the event on.
     */
    function pressSpace(target) {
      pressAndReleaseKeyOn(target, 32);
    }

    scope.focus = focus;
    scope.blur = blur;
    scope.down = down;
    scope.up = up;
    scope.downAndUp = downAndUp;
    scope.tap = tap;
    scope.move = move;
    scope.touchstart = touchstart;
    scope.touchend = touchend;
    scope.makeSoloTouchEvent = makeSoloTouchEvent;
    scope.track = track;
    scope.pressAndReleaseKeyOn = pressAndReleaseKeyOn;
    scope.pressEnter = pressEnter;
    scope.pressSpace = pressSpace;
    scope.keyDownOn = keyDownOn;
    scope.keyUpOn = keyUpOn;
    scope.keyboardEventFor = keyboardEventFor;
    scope.keyEventOn = keyEventOn;
    scope.middleOfNode = middleOfNode;
    scope.topLeftOfNode = topLeftOfNode;
  })(MockInteractions, window);

})));
