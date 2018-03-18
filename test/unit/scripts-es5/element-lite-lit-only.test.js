(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// @ts-check

// unique global id for deduping mixins.
/** @type {number} */
var dedupeId = 0;

/**
 * @type {Function}
 * @param {!MixinFunction} [mixin]
 * @return {Function}
 */
var dedupingMixin = function (mixin) {
  var mixinApplications = mixin.__mixinApplications;
  if (!mixinApplications) {
    mixinApplications = new WeakMap();
    mixin.__mixinApplications = mixinApplications;
  }
  // maintain a unique id for each mixin
  var mixinDedupeId = dedupeId++;

  /**
 * @type {Function}
 * @param {!MixinFunction} base
 * @return {MixinFunction}
 */
  function dedupingMixin (base) {
    /** @type {(Object | undefined)} */
    var baseSet = base.__mixinSet;
    if (baseSet && baseSet[mixinDedupeId]) {
      return base;
    }

    var map = mixinApplications;

    /** @type {MixinFunction} */
    var extended = map.get(base);
    if (!extended) {
      // @ts-ignore
      extended = mixin(base);
      map.set(base, extended);
    }
    // copy inherited mixin set from the extended class, or the base class
    // NOTE: we avoid use of Set here because some browser (IE11)
    // cannot extend a base Set via the constructor.

    /** @type {(Object | undefined)} */
    var mixinSet = Object.create(extended.__mixinSet || baseSet || null);
    mixinSet[mixinDedupeId] = true;

    /** @type {!MixinFunction} */
    extended.__mixinSet = mixinSet;
    return extended;
  }

  return dedupingMixin;
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * TypeScript has a problem with precompiling templates literals
 * https://github.com/Microsoft/TypeScript/issues/17956
 *
 * TODO(justinfagnani): Run tests compiled to ES5 with both Babel and
 * TypeScript to verify correctness.
 */
var envCachesTemplates = (function (t) { return t() === t(); })(function () { return (function (s) { return s; }) ``; });
// The first argument to JS template tags retain identity across multiple
// calls to a tag for the same literal, so we can cache work done per literal
// in a Map.
var templates = new Map();
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
var html = function (strings) {
    var values = [], len = arguments.length - 1;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

    return litTag(strings, values, templates, false);
};
function litTag(strings, values, templates, isSvg) {
    var key = envCachesTemplates ?
        strings :
        strings.join('{{--uniqueness-workaround--}}');
    var template = templates.get(key);
    if (template === undefined) {
        template = new Template(strings, isSvg);
        templates.set(key, template);
    }
    return new TemplateResult(template, values);
}
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
var TemplateResult = function TemplateResult(template, values) {
    this.template = template;
    this.values = values;
};
/**
 * Renders a template to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 */
function render(result, container, partCallback) {
    if ( partCallback === void 0 ) partCallback = defaultPartCallback;

    var instance = container.__templateInstance;
    // Repeat render, just call update()
    if (instance !== undefined && instance.template === result.template &&
        instance._partCallback === partCallback) {
        instance.update(result.values);
        return;
    }
    // First render, create a new TemplateInstance and append it
    instance = new TemplateInstance(result.template, partCallback);
    container.__templateInstance = instance;
    var fragment = instance._clone();
    instance.update(result.values);
    removeNodes(container, container.firstChild);
    container.appendChild(fragment);
}
/**
 * An expression marker with embedded unique key to avoid
 * https://github.com/PolymerLabs/lit-html/issues/62
 */
var marker = `{{lit-${String(Math.random()).slice(2)}}}`;
var nodeMarker = `<!--${marker}-->`;
var markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#attributes-0
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-character
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
var lastAttributeNameRegex = /[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/;
/**
 * Finds the closing index of the last closed HTML tag.
 * This has 3 possible return values:
 *   - `-1`, meaning there is no tag in str.
 *   - `string.length`, meaning the last opened tag is unclosed.
 *   - Some positive number < str.length, meaning the index of the closing '>'.
 */
function findTagClose(str) {
    var close = str.lastIndexOf('>');
    var open = str.indexOf('<', close + 1);
    return open > -1 ? str.length : close;
}
/**
 * A placeholder for a dynamic expression in an HTML template.
 *
 * There are two built-in part types: AttributePart and NodePart. NodeParts
 * always represent a single dynamic expression, while AttributeParts may
 * represent as many expressions are contained in the attribute.
 *
 * A Template's parts are mutable, so parts can be replaced or modified
 * (possibly to implement different template semantics). The contract is that
 * parts can only be replaced, not removed, added or reordered, and parts must
 * always consume the correct number of values in their `update()` method.
 *
 * TODO(justinfagnani): That requirement is a little fragile. A
 * TemplateInstance could instead be more careful about which values it gives
 * to Part.update().
 */
var TemplatePart = function TemplatePart(type, index, name, rawName, strings) {
    this.type = type;
    this.index = index;
    this.name = name;
    this.rawName = rawName;
    this.strings = strings;
};
var Template = function Template(strings, svg) {
    var this$1 = this;
    if ( svg === void 0 ) svg = false;

    this.parts = [];
    var element = this.element = document.createElement('template');
    element.innerHTML = this._getHtml(strings, svg);
    var content = element.content;
    if (svg) {
        var svgElement = content.firstChild;
        content.removeChild(svgElement);
        reparentNodes(content, svgElement.firstChild);
    }
    // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
    var walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
           NodeFilter.SHOW_TEXT */, null, false);
    var index = -1;
    var partIndex = 0;
    var nodesToRemove = [];
    // The actual previous node, accounting for removals: if a node is removed
    // it will never be the previousNode.
    var previousNode;
    // Used to set previousNode at the top of the loop.
    var currentNode;
    while (walker.nextNode()) {
        index++;
        previousNode = currentNode;
        var node = currentNode = walker.currentNode;
        if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
            if (!node.hasAttributes()) {
                continue;
            }
            var attributes = node.attributes;
            // Per https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
            // attributes are not guaranteed to be returned in document order. In
            // particular, Edge/IE can return them out of order, so we cannot assume
            // a correspondance between part index and attribute index.
            var count = 0;
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].value.indexOf(marker) >= 0) {
                    count++;
                }
            }
            while (count-- > 0) {
                // Get the template literal section leading up to the first
                // expression in this attribute attribute
                var stringForPart = strings[partIndex];
                // Find the attribute name
                var attributeNameInPart = lastAttributeNameRegex.exec(stringForPart)[1];
                // Find the corresponding attribute
                var attribute = attributes.getNamedItem(attributeNameInPart);
                var stringsForAttributeValue = attribute.value.split(markerRegex);
                this$1.parts.push(new TemplatePart('attribute', index, attribute.name, attributeNameInPart, stringsForAttributeValue));
                node.removeAttribute(attribute.name);
                partIndex += stringsForAttributeValue.length - 1;
            }
        }
        else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
            var nodeValue = node.nodeValue;
            if (nodeValue.indexOf(marker) < 0) {
                continue;
            }
            var parent = node.parentNode;
            var strings$1 = nodeValue.split(markerRegex);
            var lastIndex = strings$1.length - 1;
            // We have a part for each match found
            partIndex += lastIndex;
            // We keep this current node, but reset its content to the last
            // literal part. We insert new literal nodes before this so that the
            // tree walker keeps its position correctly.
            node.textContent = strings$1[lastIndex];
            // Generate a new text node for each literal section
            // These nodes are also used as the markers for node parts
            for (var i$1 = 0; i$1 < lastIndex; i$1++) {
                parent.insertBefore(document.createTextNode(strings$1[i$1]), node);
                this$1.parts.push(new TemplatePart('node', index++));
            }
        }
        else if (node.nodeType === 8 /* Node.COMMENT_NODE */ &&
            node.nodeValue === marker) {
            var parent$1 = node.parentNode;
            // Add a new marker node to be the startNode of the Part if any of the
            // following are true:
            //  * We don't have a previousSibling
            //  * previousSibling is being removed (thus it's not the
            //`previousNode`)
            //  * previousSibling is not a Text node
            //
            // TODO(justinfagnani): We should be able to use the previousNode here
            // as the marker node and reduce the number of extra nodes we add to a
            // template. See https://github.com/PolymerLabs/lit-html/issues/147
            var previousSibling = node.previousSibling;
            if (previousSibling === null || previousSibling !== previousNode ||
                previousSibling.nodeType !== Node.TEXT_NODE) {
                parent$1.insertBefore(document.createTextNode(''), node);
            }
            else {
                index--;
            }
            this$1.parts.push(new TemplatePart('node', index++));
            nodesToRemove.push(node);
            // If we don't have a nextSibling add a marker node.
            // We don't have to check if the next node is going to be removed,
            // because that node will induce a new marker if so.
            if (node.nextSibling === null) {
                parent$1.insertBefore(document.createTextNode(''), node);
            }
            else {
                index--;
            }
            currentNode = previousNode;
            partIndex++;
        }
    }
    // Remove text binding nodes after the walk to not disturb the TreeWalker
    for (var n of nodesToRemove) {
        n.parentNode.removeChild(n);
    }
};
/**
 * Returns a string of HTML used to create a <template> element.
 */
Template.prototype._getHtml = function _getHtml (strings, svg) {
    var l = strings.length - 1;
    var html = '';
    var isTextBinding = true;
    for (var i = 0; i < l; i++) {
        var s = strings[i];
        html += s;
        // We're in a text position if the previous string closed its tags.
        // If it doesn't have any tags, then we use the previous text position
        // state.
        var closing = findTagClose(s);
        isTextBinding = closing > -1 ? closing < s.length : isTextBinding;
        html += isTextBinding ? nodeMarker : marker;
    }
    html += strings[l];
    return svg ? `<svg>${html}</svg>` : html;
};
/**
 * Returns a value ready to be inserted into a Part from a user-provided value.
 *
 * If the user value is a directive, this invokes the directive with the given
 * part. If the value is null, it's converted to undefined to work better
 * with certain DOM APIs, like textContent.
 */
var getValue = function (part, value) {
    // `null` as the value of a Text node will render the string 'null'
    // so we convert it to undefined
    if (isDirective(value)) {
        value = value(part);
        return directiveValue;
    }
    return value === null ? undefined : value;
};
var isDirective = function (o) { return typeof o === 'function' && o.__litDirective === true; };
var directiveValue = {};
var AttributePart = function AttributePart(instance, element, name, strings) {
    this.instance = instance;
    this.element = element;
    this.name = name;
    this.strings = strings;
    this.size = strings.length - 1;
};
AttributePart.prototype._interpolate = function _interpolate (values, startIndex) {
        var this$1 = this;

    var strings = this.strings;
    var l = strings.length - 1;
    var text = '';
    for (var i = 0; i < l; i++) {
        text += strings[i];
        var v = getValue(this$1, values[startIndex + i]);
        if (v && v !== directiveValue &&
            (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
            for (var t of v) {
                // TODO: we need to recursively call getValue into iterables...
                text += t;
            }
        }
        else {
            text += v;
        }
    }
    return text + strings[l];
};
AttributePart.prototype.setValue = function setValue (values, startIndex) {
    var text = this._interpolate(values, startIndex);
    this.element.setAttribute(this.name, text);
};
var NodePart = function NodePart(instance, startNode, endNode) {
    this.instance = instance;
    this.startNode = startNode;
    this.endNode = endNode;
    this._previousValue = undefined;
};
NodePart.prototype.setValue = function setValue (value) {
    value = getValue(this, value);
    if (value === directiveValue) {
        return;
    }
    if (value === null ||
        !(typeof value === 'object' || typeof value === 'function')) {
        // Handle primitive values
        // If the value didn't change, do nothing
        if (value === this._previousValue) {
            return;
        }
        this._setText(value);
    }
    else if (value instanceof TemplateResult) {
        this._setTemplateResult(value);
    }
    else if (Array.isArray(value) || value[Symbol.iterator]) {
        this._setIterable(value);
    }
    else if (value instanceof Node) {
        this._setNode(value);
    }
    else if (value.then !== undefined) {
        this._setPromise(value);
    }
    else {
        // Fallback, will render the string representation
        this._setText(value);
    }
};
NodePart.prototype._insert = function _insert (node) {
    this.endNode.parentNode.insertBefore(node, this.endNode);
};
NodePart.prototype._setNode = function _setNode (value) {
    if (this._previousValue === value) {
        return;
    }
    this.clear();
    this._insert(value);
    this._previousValue = value;
};
NodePart.prototype._setText = function _setText (value) {
    var node = this.startNode.nextSibling;
    value = value === undefined ? '' : value;
    if (node === this.endNode.previousSibling &&
        node.nodeType === Node.TEXT_NODE) {
        // If we only have a single text node between the markers, we can just
        // set its value, rather than replacing it.
        // TODO(justinfagnani): Can we just check if _previousValue is
        // primitive?
        node.textContent = value;
    }
    else {
        this._setNode(document.createTextNode(value));
    }
    this._previousValue = value;
};
NodePart.prototype._setTemplateResult = function _setTemplateResult (value) {
    var instance;
    if (this._previousValue &&
        this._previousValue.template === value.template) {
        instance = this._previousValue;
    }
    else {
        instance =
            new TemplateInstance(value.template, this.instance._partCallback);
        this._setNode(instance._clone());
        this._previousValue = instance;
    }
    instance.update(value.values);
};
NodePart.prototype._setIterable = function _setIterable (value) {
        var this$1 = this;

    // For an Iterable, we create a new InstancePart per item, then set its
    // value to the item. This is a little bit of overhead for every item in
    // an Iterable, but it lets us recurse easily and efficiently update Arrays
    // of TemplateResults that will be commonly returned from expressions like:
    // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
    // If _previousValue is an array, then the previous render was of an
    // iterable and _previousValue will contain the NodeParts from the previous
    // render. If _previousValue is not an array, clear this part and make a new
    // array for NodeParts.
    if (!Array.isArray(this._previousValue)) {
        this.clear();
        this._previousValue = [];
    }
    // Lets us keep track of how many items we stamped so we can clear leftover
    // items from a previous render
    var itemParts = this._previousValue;
    var partIndex = 0;
    for (var item of value) {
        // Try to reuse an existing part
        var itemPart = itemParts[partIndex];
        // If no existing part, create a new one
        if (itemPart === undefined) {
            // If we're creating the first item part, it's startNode should be the
            // container's startNode
            var itemStart = this$1.startNode;
            // If we're not creating the first part, create a new separator marker
            // node, and fix up the previous part's endNode to point to it
            if (partIndex > 0) {
                var previousPart = itemParts[partIndex - 1];
                itemStart = previousPart.endNode = document.createTextNode('');
                this$1._insert(itemStart);
            }
            itemPart = new NodePart(this$1.instance, itemStart, this$1.endNode);
            itemParts.push(itemPart);
        }
        itemPart.setValue(item);
        partIndex++;
    }
    if (partIndex === 0) {
        this.clear();
        this._previousValue = undefined;
    }
    else if (partIndex < itemParts.length) {
        var lastPart = itemParts[partIndex - 1];
        // Truncate the parts array so _previousValue reflects the current state
        itemParts.length = partIndex;
        this.clear(lastPart.endNode.previousSibling);
        lastPart.endNode = this.endNode;
    }
};
NodePart.prototype._setPromise = function _setPromise (value) {
        var this$1 = this;

    this._previousValue = value;
    value.then(function (v) {
        if (this$1._previousValue === value) {
            this$1.setValue(v);
        }
    });
};
NodePart.prototype.clear = function clear (startNode) {
        if ( startNode === void 0 ) startNode = this.startNode;

    removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
};
var defaultPartCallback = function (instance, templatePart, node) {
    if (templatePart.type === 'attribute') {
        return new AttributePart(instance, node, templatePart.name, templatePart.strings);
    }
    else if (templatePart.type === 'node') {
        return new NodePart(instance, node, node.nextSibling);
    }
    throw new Error(`Unknown part type ${templatePart.type}`);
};
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
var TemplateInstance = function TemplateInstance(template, partCallback) {
    if ( partCallback === void 0 ) partCallback = defaultPartCallback;

    this._parts = [];
    this.template = template;
    this._partCallback = partCallback;
};
TemplateInstance.prototype.update = function update (values) {
        var this$1 = this;

    var valueIndex = 0;
    for (var part of this$1._parts) {
        if (part.size === undefined) {
            part.setValue(values[valueIndex]);
            valueIndex++;
        }
        else {
            part.setValue(values, valueIndex);
            valueIndex += part.size;
        }
    }
};
TemplateInstance.prototype._clone = function _clone () {
        var this$1 = this;

    var fragment = document.importNode(this.template.element.content, true);
    var parts = this.template.parts;
    if (parts.length > 0) {
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
        // null
        var walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
               NodeFilter.SHOW_TEXT */, null, false);
        var index = -1;
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            while (index < part.index) {
                index++;
                walker.nextNode();
            }
            this$1._parts.push(this$1._partCallback(this$1, part, walker.currentNode));
        }
    }
    return fragment;
};
/**
 * Reparents nodes, starting from `startNode` (inclusive) to `endNode`
 * (exclusive), into another container (could be the same container), before
 * `beforeNode`. If `beforeNode` is null, it appends the nodes to the
 * container.
 */
var reparentNodes = function (container, start, end, before) {
    if ( end === void 0 ) end = null;
    if ( before === void 0 ) before = null;

    var node = start;
    while (node !== end) {
        var n = node.nextSibling;
        container.insertBefore(node, before);
        node = n;
    }
};
/**
 * Removes nodes, starting from `startNode` (inclusive) to `endNode`
 * (exclusive), from `container`.
 */
var removeNodes = function (container, startNode, endNode) {
    if ( endNode === void 0 ) endNode = null;

    var node = startNode;
    while (node !== endNode) {
        var n = node.nextSibling;
        container.removeChild(node);
        node = n;
    }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 *
 * @param result Renders a `TemplateResult` to a container using the
 * `extendedPartCallback` PartCallback, which allows templates to set
 * properties and declarative event handlers.
 *
 * Properties are set by default, instead of attributes. Attribute names in
 * lit-html templates preserve case, so properties are case sensitive. If an
 * expression takes up an entire attribute value, then the property is set to
 * that value. If an expression is interpolated with a string or other
 * expressions then the property is set to the string result of the
 * interpolation.
 *
 * To set an attribute instead of a property, append a `$` suffix to the
 * attribute name.
 *
 * Example:
 *
 *     html`<button class$="primary">Buy Now</button>`
 *
 * To set an event handler, prefix the attribute name with `on-`:
 *
 * Example:
 *
 *     html`<button on-click=${(e)=> this.onClickHandler(e)}>Buy Now</button>`
 *
 */
function render$1(result, container) {
    render(result, container, extendedPartCallback);
}
var extendedPartCallback = function (instance, templatePart, node) {
    if (templatePart.type === 'attribute') {
        if (templatePart.rawName.startsWith('on-')) {
            var eventName = templatePart.rawName.slice(3);
            return new EventPart(instance, node, eventName);
        }
        if (templatePart.name.endsWith('$')) {
            var name = templatePart.name.slice(0, -1);
            return new AttributePart(instance, node, name, templatePart.strings);
        }
        return new PropertyPart(instance, node, templatePart.rawName, templatePart.strings);
    }
    return defaultPartCallback(instance, templatePart, node);
};
var PropertyPart = (function (AttributePart$$1) {
    function PropertyPart () {
        AttributePart$$1.apply(this, arguments);
    }

    if ( AttributePart$$1 ) PropertyPart.__proto__ = AttributePart$$1;
    PropertyPart.prototype = Object.create( AttributePart$$1 && AttributePart$$1.prototype );
    PropertyPart.prototype.constructor = PropertyPart;

    PropertyPart.prototype.setValue = function setValue (values, startIndex) {
        var s = this.strings;
        var value;
        if (s.length === 2 && s[0] === '' && s[1] === '') {
            // An expression that occupies the whole attribute value will leave
            // leading and trailing empty strings.
            value = getValue(this, values[startIndex]);
        }
        else {
            // Interpolation, so interpolate
            value = this._interpolate(values, startIndex);
        }
        this.element[this.name] = value;
    };

    return PropertyPart;
}(AttributePart));
var EventPart = function EventPart(instance, element, eventName) {
    this.instance = instance;
    this.element = element;
    this.eventName = eventName;
};
EventPart.prototype.setValue = function setValue (value) {
    var listener = getValue(this, value);
    var previous = this._listener;
    if (listener === previous) {
        return;
    }
    this._listener = listener;
    if (previous != null) {
        this.element.removeEventListener(this.eventName, previous);
    }
    if (listener != null) {
        this.element.addEventListener(this.eventName, listener);
    }
};

/// <reference path="typings-project/global.d.ts"/>
var ElementLiteLitOnly = dedupingMixin(function (base) {
  /**
   * ElementLite is a set of methods coming from Polymer Property Mixins and Property Accessor Mixins
   * that automates the creation of setter and getters given a list of properties and
   * allows auto-calling of methods given observers. This doesn't use the base ElementLite, but uses lit-html
   * only.
   *
   * @extends {HTMLElement}
  */
  var ElementLiteLitOnly = (function (superclass) {
    function ElementLiteLitOnly () {
      superclass.apply(this, arguments);
    }

    if ( superclass ) ElementLiteLitOnly.__proto__ = superclass;
    ElementLiteLitOnly.prototype = Object.create( superclass && superclass.prototype );
    ElementLiteLitOnly.prototype.constructor = ElementLiteLitOnly;

    ElementLiteLitOnly.prototype.connectedCallback = function connectedCallback () {
      if (superclass.prototype.connectedCallback) { superclass.prototype.connectedCallback.call(this); }
      this.attachShadow({ mode: 'open' });

      // renders the shadowRoot statically
      var result = this.render(this);

      if (result && this.shadowRoot) {
        render$1(this.render(this) || html``, /** @type {DocumentFragment} */(this.shadowRoot));
      }
    };

    /**
     * Return a template result to render using lit-html.
     */
    ElementLiteLitOnly.prototype.render = function render (self) { return html``; };

    return ElementLiteLitOnly;
  }((base)));

  return ElementLiteLitOnly;
});

// @ts-nocheck
var sinon = window.sinon;

/**
 * @extends {ElementLiteLitOnly}
*/
var TestElement = (function (superclass) {
  function TestElement () {
    superclass.call(this);
    this._boundedButtonClicked = this._buttonClicked.bind(this);
    sinon.spy(this, '_boundedButtonClicked');
  }

  if ( superclass ) TestElement.__proto__ = superclass;
  TestElement.prototype = Object.create( superclass && superclass.prototype );
  TestElement.prototype.constructor = TestElement;

  var staticAccessors = { is: { configurable: true } };

  staticAccessors.is.get = function () { return 'test-element-two'; };

  TestElement.prototype.render = function render () {
    return html`
      <style>
        #button {
          width: 500px;
        }
      </style>
      <input id="input" type="text">
      <button id="button" type="button" on-click=${this._boundedButtonClicked}>Test</button>
    `;
  };

  TestElement.prototype._buttonClicked = function _buttonClicked () {
    this.shadowRoot.querySelector('#input').value = Math.random();
  };

  Object.defineProperties( TestElement, staticAccessors );

  return TestElement;
}(ElementLiteLitOnly(window.HTMLElement)));

window.customElements.define(TestElement.is, TestElement);

})));
