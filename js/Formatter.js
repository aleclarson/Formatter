var Formatting, Tracer, Type, Validator, assertType, formatObject, formatValue, isType, steal, type;

assertType = require("assertType");

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

type.defineOptions({
  colors: Object
});

type.defineValues(function(options) {
  return {
    _colors: options.colors,
    _tracer: null
  };
});

type.defineMethods({
  _format: function(value, options) {
    var label, parts, raw;
    if (options == null) {
      options = {};
    }
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

//# sourceMappingURL=map/Formatter.map
