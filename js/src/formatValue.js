var Nan, Null, Void, formatters, getType, stripAnsi;

require("isNodeJS");

stripAnsi = require("strip-ansi");

getType = require("getType");

Null = require("Null");

Void = require("Void");

Nan = require("Nan");

module.exports = function(value) {
  var format, j, len, ref, test, type;
  type = getType(value);
  for (j = 0, len = formatters.length; j < len; j++) {
    ref = formatters[j], test = ref.test, format = ref.format;
    if (test.call(this, value, type)) {
      format.call(this, value, type);
      return true;
    }
  }
  return false;
};

formatters = [];

formatters.push({
  test: function(value) {
    return value == null;
  },
  format: function(value) {
    return this.push("yellow.dim", "" + value);
  }
});

formatters.push({
  test: function(_, type) {
    return type === String;
  },
  format: function(value) {
    var i, isTruncated, j, len, line, ref;
    value = stripAnsi(value);
    isTruncated = this.depth && value.length > this.maxStringLength;
    if (isTruncated) {
      value = value.slice(0, this.maxStringLength);
    }
    this.push("green", "\"");
    ref = value.split(this.ln);
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      line = ref[i];
      if (i > 0) {
        line = "\\n" + line;
      }
      this.push("green", line);
    }
    if (isTruncated) {
      this.push("cyan", "...");
    }
    return this.push("green", "\"");
  }
});

formatters.push({
  test: function(_, type) {
    return (type === Boolean) || (type === Number);
  },
  format: function(value) {
    return this.push("yellow", "" + value);
  }
});

formatters.push({
  test: function(_, type) {
    return type === Nan;
  },
  format: function() {
    return this.push("red.dim", "NaN");
  }
});

formatters.push({
  test: function(_, type) {
    return type === Date;
  },
  format: function(value) {
    this.push("green.dim.bold", "Date ");
    this.push("green.dim", "{ ");
    this.push("yellow", value.toString());
    return this.push("green.dim", " }");
  }
});

formatters.push({
  test: function(_, type) {
    return type === RegExp;
  },
  format: function(value) {
    this.push("green.dim.bold", "RegExp ");
    this.push("green.dim", "{ ");
    this.push("yellow", "/" + value.source + "/");
    return this.push("green.dim", " }");
  }
});

formatters.push({
  test: function(_, type) {
    return isNodeJS && (type === Buffer);
  },
  format: function(value) {
    this.push("green.dim.bold", "Buffer ");
    this.push("green.dim", "{ ");
    this.push("length");
    this.push("gray.dim", ": ");
    this.push("yellow", "" + value.length);
    return this.push("green.dim", " }");
  }
});

formatters.push({
  test: function(value) {
    return value === Object.prototype;
  },
  format: function() {
    this.push("green.dim.bold", "Object.prototype ");
    return this.push("green.dim", "{}");
  }
});

formatters.push({
  test: function(value) {
    return value === Array;
  },
  format: function() {
    this.push("green.dim.bold", "Array ");
    return this.push("green.dim", "[]");
  }
});

//# sourceMappingURL=../../map/src/formatValue.map
