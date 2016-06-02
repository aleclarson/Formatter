var Formatting, Tracer, Type, Validator, assertType, formatObject, formatValue, getArgProp, isType, steal, throwFailure, type;

throwFailure = require("failure").throwFailure;

assertType = require("assertType");

getArgProp = require("getArgProp");

Validator = require("Validator");

Tracer = require("tracer");

isType = require("isType");

steal = require("steal");

Type = require("Type");

formatObject = require("./formatObject");

formatValue = require("./formatValue");

Formatting = require("./Formatting");

type = Type("Formatter", function(value, options) {
  var error;
  if (options == null) {
    options = {};
  }
  this._tracer = Tracer("Formatter::call()");
  try {
    return this._format(value, options);
  } catch (error1) {
    error = error1;
    return throwFailure(error, {
      stack: this._tracer()
    });
  }
});

type.optionTypes = {
  colors: Object.Maybe
};

type.defineValues({
  _colors: getArgProp("colors"),
  _tracer: null
});

type.defineMethods({
  _format: function(value, options) {
    var label, parts, raw;
    if (isType(options, String)) {
      options = {
        label: options
      };
    } else {
      assertType(options, Object);
    }
    raw = steal(options, "raw", false);
    label = steal(options, "label");
    if (this._colors && !options.hasOwnProperty("colors")) {
      options.colors = this._colors;
    }
    parts = Formatting(options);
    assertType(parts, Formatting);
    if (label) {
      parts.push(label);
    }
    if (!formatValue.call(parts, value)) {
      formatObject.call(parts, value);
    }
    parts = parts.flush();
    if (raw) {
      return parts;
    }
    return parts.join("");
  }
});

module.exports = type.build();

//# sourceMappingURL=../../map/src/Formatter.map
