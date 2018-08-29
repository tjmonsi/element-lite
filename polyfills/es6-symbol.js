(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var validTypes = { object: true, symbol: true };

  var isImplemented = function isImplemented() {
  	if (typeof Symbol !== 'function') return false;
  	try {
  	} catch (e) {
  		return false;
  	}

  	// Return 'true' also for polyfills
  	if (!validTypes[_typeof(Symbol.iterator)]) return false;
  	if (!validTypes[_typeof(Symbol.toPrimitive)]) return false;
  	if (!validTypes[_typeof(Symbol.toStringTag)]) return false;

  	return true;
  };

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var isImplemented$1 = function isImplemented() {
  	var assign = Object.assign,
  	    obj;
  	if (typeof assign !== "function") return false;
  	obj = { foo: "raz" };
  	assign(obj, { bar: "dwa" }, { trzy: "trzy" });
  	return obj.foo + obj.bar + obj.trzy === "razdwatrzy";
  };

  var isImplemented$2 = function isImplemented() {
  	try {
  		return true;
  	} catch (e) {
  		return false;
  	}
  };

  // eslint-disable-next-line no-empty-function

  var noop = function noop() {};

  var _undefined = noop(); // Support ES3 engines

  var isValue = function isValue(val) {
    return val !== _undefined && val !== null;
  };

  var keys = Object.keys;

  var shim = function shim(object) {
    return keys(isValue(object) ? Object(object) : object);
  };

  var keys$1 = isImplemented$2() ? Object.keys : shim;

  var validValue = function validValue(value) {
  	if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
  	return value;
  };

  var max = Math.max;

  var shim$1 = function shim(dest, src /*, …srcn*/) {
  	var error,
  	    i,
  	    length = max(arguments.length, 2),
  	    assign;
  	dest = Object(validValue(dest));
  	assign = function assign(key) {
  		try {
  			dest[key] = src[key];
  		} catch (e) {
  			if (!error) error = e;
  		}
  	};
  	for (i = 1; i < length; ++i) {
  		src = arguments[i];
  		keys$1(src).forEach(assign);
  	}
  	if (error !== undefined) throw error;
  	return dest;
  };

  var assign = isImplemented$1() ? Object.assign : shim$1;

  var forEach = Array.prototype.forEach,
      create = Object.create;

  var process = function process(src, obj) {
  	var key;
  	for (key in src) {
  		obj[key] = src[key];
  	}
  };

  // eslint-disable-next-line no-unused-vars
  var normalizeOptions = function normalizeOptions(opts1 /*, …options*/) {
  	var result = create(null);
  	forEach.call(arguments, function (options) {
  		if (!isValue(options)) return;
  		process(Object(options), result);
  	});
  	return result;
  };

  // Deprecated

  var isCallable = function isCallable(obj) {
    return typeof obj === "function";
  };

  var str = "razdwatrzy";

  var isImplemented$3 = function isImplemented() {
  	if (typeof str.contains !== "function") return false;
  	return str.contains("dwa") === true && str.contains("foo") === false;
  };

  var indexOf = String.prototype.indexOf;

  var shim$2 = function shim(searchString /*, position*/) {
  	return indexOf.call(this, searchString, arguments[1]) > -1;
  };

  var contains = isImplemented$3() ? String.prototype.contains : shim$2;

  var d_1 = createCommonjsModule(function (module) {

  	var d;

  	d = module.exports = function (dscr, value /*, options*/) {
  		var c, e, w, options, desc;
  		if (arguments.length < 2 || typeof dscr !== 'string') {
  			options = value;
  			value = dscr;
  			dscr = null;
  		} else {
  			options = arguments[2];
  		}
  		if (dscr == null) {
  			c = w = true;
  			e = false;
  		} else {
  			c = contains.call(dscr, 'c');
  			e = contains.call(dscr, 'e');
  			w = contains.call(dscr, 'w');
  		}

  		desc = { value: value, configurable: c, enumerable: e, writable: w };
  		return !options ? desc : assign(normalizeOptions(options), desc);
  	};

  	d.gs = function (dscr, get, set /*, options*/) {
  		var c, e, options, desc;
  		if (typeof dscr !== 'string') {
  			options = set;
  			set = get;
  			get = dscr;
  			dscr = null;
  		} else {
  			options = arguments[3];
  		}
  		if (get == null) {
  			get = undefined;
  		} else if (!isCallable(get)) {
  			options = get;
  			get = set = undefined;
  		} else if (set == null) {
  			set = undefined;
  		} else if (!isCallable(set)) {
  			options = set;
  			set = undefined;
  		}
  		if (dscr == null) {
  			c = true;
  			e = false;
  		} else {
  			c = contains.call(dscr, 'c');
  			e = contains.call(dscr, 'e');
  		}

  		desc = { get: get, set: set, configurable: c, enumerable: e };
  		return !options ? desc : assign(normalizeOptions(options), desc);
  	};
  });

  var isSymbol = function isSymbol(x) {
  	if (!x) return false;
  	if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'symbol') return true;
  	if (!x.constructor) return false;
  	if (x.constructor.name !== 'Symbol') return false;
  	return x[x.constructor.toStringTag] === 'Symbol';
  };

  var validateSymbol = function validateSymbol(value) {
  	if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
  	return value;
  };

  var create$1 = Object.create,
      defineProperties = Object.defineProperties,
      defineProperty$1 = Object.defineProperty,
      objPrototype = Object.prototype,
      NativeSymbol,
      SymbolPolyfill,
      HiddenSymbol,
      globalSymbols = create$1(null),
      isNativeSafe;

  if (typeof Symbol === 'function') {
  	NativeSymbol = Symbol;
  	try {
  		String(NativeSymbol());
  		isNativeSafe = true;
  	} catch (ignore) {}
  }

  var generateName = function () {
  	var created = create$1(null);
  	return function (desc) {
  		var postfix = 0,
  		    name,
  		    ie11BugWorkaround;
  		while (created[desc + (postfix || '')]) {
  			++postfix;
  		}desc += postfix || '';
  		created[desc] = true;
  		name = '@@' + desc;
  		defineProperty$1(objPrototype, name, d_1.gs(null, function (value) {
  			// For IE11 issue see:
  			// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
  			//    ie11-broken-getters-on-dom-objects
  			// https://github.com/medikoo/es6-symbol/issues/12
  			if (ie11BugWorkaround) return;
  			ie11BugWorkaround = true;
  			defineProperty$1(this, name, d_1(value));
  			ie11BugWorkaround = false;
  		}));
  		return name;
  	};
  }();

  // Internal constructor (not one exposed) for creating Symbol instances.
  // This one is used to ensure that `someSymbol instanceof Symbol` always return false
  HiddenSymbol = function _Symbol(description) {
  	if (this instanceof HiddenSymbol) throw new TypeError('Symbol is not a constructor');
  	return SymbolPolyfill(description);
  };

  // Exposed `Symbol` constructor
  // (returns instances of HiddenSymbol)
  var polyfill = SymbolPolyfill = function _Symbol2(description) {
  	var symbol;
  	if (this instanceof _Symbol2) throw new TypeError('Symbol is not a constructor');
  	if (isNativeSafe) return NativeSymbol(description);
  	symbol = create$1(HiddenSymbol.prototype);
  	description = description === undefined ? '' : String(description);
  	return defineProperties(symbol, {
  		__description__: d_1('', description),
  		__name__: d_1('', generateName(description))
  	});
  };
  defineProperties(SymbolPolyfill, {
  	for: d_1(function (key) {
  		if (globalSymbols[key]) return globalSymbols[key];
  		return globalSymbols[key] = SymbolPolyfill(String(key));
  	}),
  	keyFor: d_1(function (s) {
  		var key;
  		validateSymbol(s);
  		for (key in globalSymbols) {
  			if (globalSymbols[key] === s) return key;
  		}
  	}),

  	// To ensure proper interoperability with other native functions (e.g. Array.from)
  	// fallback to eventual native implementation of given symbol
  	hasInstance: d_1('', NativeSymbol && NativeSymbol.hasInstance || SymbolPolyfill('hasInstance')),
  	isConcatSpreadable: d_1('', NativeSymbol && NativeSymbol.isConcatSpreadable || SymbolPolyfill('isConcatSpreadable')),
  	iterator: d_1('', NativeSymbol && NativeSymbol.iterator || SymbolPolyfill('iterator')),
  	match: d_1('', NativeSymbol && NativeSymbol.match || SymbolPolyfill('match')),
  	replace: d_1('', NativeSymbol && NativeSymbol.replace || SymbolPolyfill('replace')),
  	search: d_1('', NativeSymbol && NativeSymbol.search || SymbolPolyfill('search')),
  	species: d_1('', NativeSymbol && NativeSymbol.species || SymbolPolyfill('species')),
  	split: d_1('', NativeSymbol && NativeSymbol.split || SymbolPolyfill('split')),
  	toPrimitive: d_1('', NativeSymbol && NativeSymbol.toPrimitive || SymbolPolyfill('toPrimitive')),
  	toStringTag: d_1('', NativeSymbol && NativeSymbol.toStringTag || SymbolPolyfill('toStringTag')),
  	unscopables: d_1('', NativeSymbol && NativeSymbol.unscopables || SymbolPolyfill('unscopables'))
  });

  // Internal tweaks for real symbol producer
  defineProperties(HiddenSymbol.prototype, {
  	constructor: d_1(SymbolPolyfill),
  	toString: d_1('', function () {
  		return this.__name__;
  	})
  });

  // Proper implementation of methods exposed on Symbol.prototype
  // They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
  defineProperties(SymbolPolyfill.prototype, {
  	toString: d_1(function () {
  		return 'Symbol (' + validateSymbol(this).__description__ + ')';
  	}),
  	valueOf: d_1(function () {
  		return validateSymbol(this);
  	})
  });
  defineProperty$1(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d_1('', function () {
  	var symbol = validateSymbol(this);
  	if ((typeof symbol === 'undefined' ? 'undefined' : _typeof(symbol)) === 'symbol') return symbol;
  	return symbol.toString();
  }));
  defineProperty$1(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d_1('c', 'Symbol'));

  // Proper implementaton of toPrimitive and toStringTag for returned symbol instances
  defineProperty$1(HiddenSymbol.prototype, SymbolPolyfill.toStringTag, d_1('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

  // Note: It's important to define `toPrimitive` as last one, as some implementations
  // implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
  // And that may invoke error in definition flow:
  // See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
  defineProperty$1(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive, d_1('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));

  var es6Symbol = isImplemented() ? Symbol : polyfill;

  // @ts-nocheck
  if (!window.Symbol) window.Symbol = es6Symbol;

})));
