var NEWLINE, StrictMap, Type, assert, assertType, emptyFunction, isType, propDefaults, propTypes, repeatString, replace, steal, sync, type;

require("isNodeJS");

emptyFunction = require("emptyFunction");

repeatString = require("repeat-string");

assertType = require("assertType");

StrictMap = require("StrictMap");

replace = require("replace");

isType = require("isType");

assert = require("assert");

steal = require("steal");

Type = require("Type");

sync = require("sync");

NEWLINE = isNodeJS ? require("os").EOL : "\n";

propTypes = {
  maxStringLength: Number,
  maxObjectDepth: Number,
  maxObjectKeys: Number,
  maxArrayKeys: Number,
  showInherited: Boolean,
  showHidden: Boolean
};

propDefaults = {
  maxStringLength: 60,
  maxObjectDepth: 2,
  maxObjectKeys: 30,
  maxArrayKeys: 10,
  showInherited: false,
  showHidden: false
};

type = Type("Formatting");

type.inherits(StrictMap);

type.createInstance(function() {
  return StrictMap({
    types: propTypes,
    values: propDefaults
  });
});

type.optionTypes = {
  colors: [Boolean, Object.Maybe],
  compact: Boolean.Maybe,
  collapse: Function.Maybe,
  unlimited: Boolean.Maybe,
  avoidGetters: Boolean.Maybe
};

type.defineValues({
  ln: NEWLINE,
  depth: 0,
  keyPath: "",
  compact: function(options) {
    return steal(options, "compact", false);
  },
  collapse: function(options) {
    return steal(options, "collapse", emptyFunction.thatReturnsFalse);
  },
  avoidGetters: function(options) {
    return steal(options, "avoidGetters", false);
  },
  _parts: function() {
    return [];
  },
  _isIndented: false
});

type.defineFrozenValues({
  keyPaths: function() {
    return [];
  },
  objects: function() {
    return [];
  },
  _colors: function(options) {
    return steal(options, "colors");
  }
});

type.initInstance(function(options) {
  var key, value;
  if (steal(options, "unlimited")) {
    options.maxStringLength = 2e308;
    options.maxObjectDepth = 2e308;
    options.maxObjectKeys = 2e308;
    options.maxArrayKeys = 2e308;
  }
  for (key in options) {
    value = options[key];
    assert(propTypes[key], "'" + key + "' is not a valid key!");
    this[key] = value;
  }
});

type.defineMethods({
  push: function(style, message) {
    var applyStyle, styles;
    if (arguments.length === 1) {
      message = style;
      style = null;
    } else if (this._colors && isType(style, String)) {
      styles = style.split(".");
      applyStyle = sync.reduce(styles, this._colors, function(style, key) {
        return style[key];
      });
      message = applyStyle(message);
    }
    if (!this.compact) {
      if (message === NEWLINE) {
        this._isIndented = false;
      } else if (this.depth && !this._isIndented) {
        this._isIndented = true;
        message = repeatString("  ", this.depth) + message;
      }
    }
    this._parts.push(message);
  },
  flush: function() {
    return replace(this, "_parts", []);
  }
});

module.exports = type.build();

//# sourceMappingURL=map/Formatting.map
