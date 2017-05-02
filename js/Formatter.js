// Generated by CoffeeScript 1.12.4
var Formatting, Type, assertType, formatObject, formatValue, isType, steal, type;

assertType = require("assertType");

isType = require("isType");

steal = require("steal");

Type = require("Type");

formatObject = require("./formatObject");

formatValue = require("./formatValue");

Formatting = require("./Formatting");

type = Type("Formatter");

type.defineArgs({
  colors: Object
});

type.defineValues(function(options) {
  return {
    _colors: options.colors
  };
});

type.defineFunction(function(value, options) {
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
});

module.exports = type.build();
