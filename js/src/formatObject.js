var KeyMirror, Kind, PureObject, Type, Validator, assertType, findInherited, formatDuplicate, formatInherited, formatKey, formatKeys, formatObject, formatType, formatValue, getKind, getType, hasKeys, isType;

PureObject = require("PureObject");

assertType = require("assertType");

Validator = require("Validator");

KeyMirror = require("keymirror");

hasKeys = require("hasKeys");

getKind = require("getKind");

getType = require("getType");

isType = require("isType");

Kind = require("Kind");

Type = require("Type");

formatValue = require("./formatValue");

module.exports = formatObject = function(obj, isCollapsed) {
  var maxKeys, type;
  if (isCollapsed == null) {
    isCollapsed = false;
  }
  type = getType(obj);
  if (type !== PureObject) {
    formatType.call(this, obj, type);
  }
  if (!(this.showHidden || hasKeys(obj))) {
    this.push("green.dim", type === Array ? "[]" : "{}");
    return;
  }
  this.push("green.dim", type === Array ? "[" : "{");
  maxKeys = type === Array ? this.maxArrayKeys : this.maxObjectKeys;
  if (!isCollapsed) {
    isCollapsed = (maxKeys === 0) || (this.depth >= this.maxObjectDepth);
  }
  if (isCollapsed) {
    this.push("cyan", " ... ");
  } else {
    formatKeys.call(this, obj, maxKeys);
  }
  return this.push("green.dim", type === Array ? "]" : "}");
};

formatType = function(obj, type) {
  var name, objName, regex;
  assertType(type, [Function.Kind, Kind(Validator)]);
  name = type.getName();
  if (obj === type.prototype) {
    if (!name) {
      return;
    }
    this.push("green.dim.bold", name + ".prototype ");
  } else if (type === Function) {
    regex = /^function\s*([^\(]*)\(([^\)]*)\)/;
    regex.results = regex.exec(obj.toString());
    this.push("green.dim", "function " + regex.results[1] + "(" + regex.results[2] + ") ");
  } else if ((type === Type) || (type.prototype instanceof Type)) {
    objName = obj.getName();
    if (!objName) {
      return;
    }
    this.push("green.dim.bold", objName + ".constructor ");
  } else if (name && name.length) {
    this.push("green.dim.bold", name + " ");
  }
};

formatKeys = function(obj, maxKeys) {
  var hasInherited, i, index, inherited, isRoot, isTruncated, key, keys, len, ref, totalKeys;
  assertType(maxKeys, Number);
  isRoot = this.keyPath === "";
  if (isRoot && this.showHidden) {
    keys = KeyMirror(Object.getOwnPropertyNames(obj));
    keys._remove("prototype", "constructor");
  } else {
    keys = KeyMirror(Object.keys(obj));
  }
  if (isRoot && this.showInherited) {
    inherited = findInherited.call(this, obj);
  }
  hasInherited = inherited && inherited.count;
  if (isType(obj, Array)) {
    keys._add("length");
  } else if (isType(obj, Error.Kind)) {
    keys._add("code", "message");
  }
  if (keys._length === 0) {
    if (!hasInherited) {
      return;
    }
  }
  isTruncated = false;
  totalKeys = keys._length;
  maxKeys = Math.max(0, maxKeys);
  if (keys._length > maxKeys) {
    isTruncated = true;
    keys._length = maxKeys;
    keys._keys = keys._keys.slice(0, maxKeys);
  }
  this.objects.push(obj);
  this.keyPaths.push(this.keyPath);
  this.push(this.compact ? " " : this.ln);
  this.depth += 1;
  ref = keys._keys;
  for (index = i = 0, len = ref.length; i < len; index = ++i) {
    key = ref[index];
    formatKey.call(this, obj, key);
    if (!this.compact) {
      this.push(this.ln);
    } else if (index < (totalKeys - 1)) {
      this.push(", ");
    }
  }
  if (isTruncated) {
    this.push("cyan", "...");
    if (!this.compact) {
      this.push(this.ln);
    }
  }
  if (hasInherited) {
    formatInherited.call(this, inherited.values);
    if (!this.compact) {
      this.push(this.ln);
    }
  }
  this.depth -= 1;
  if (this.compact) {
    this.push(" ");
  }
  return true;
};

formatKey = function(obj, key) {
  var desc, error, isCollapsed, oldValue, value;
  this.push(key);
  this.push("gray.dim", ": ");
  if (this.avoidGetters) {
    desc = Object.getOwnPropertyDescriptor(obj, key);
    if (desc.get) {
      this.push("gray.dim", desc.set ? "{ get, set }" : "{ get }");
      return;
    }
    value = obj[key];
  } else {
    try {
      value = obj[key];
    } catch (error1) {
      error = error1;
      this.push("red", error.message);
      return;
    }
  }
  if (formatValue.call(this, value)) {
    return;
  }
  if (formatDuplicate.call(this, value)) {
    return;
  }
  oldValue = this.keyPath;
  if (this.keyPath.length) {
    this.keyPath += ".";
  }
  this.keyPath += key;
  isCollapsed = this.collapse(value, key, obj);
  formatObject.call(this, value, isCollapsed);
  this.keyPath = oldValue;
};

formatInherited = function(values) {
  var oldValue;
  this.push("green.dim.bold", "inherited ");
  oldValue = this.showInherited;
  this.showInherited = false;
  formatObject.call(this, values);
  this.showInherited = oldValue;
};

findInherited = function(obj) {
  var count, i, key, len, prototype, ref, type, values;
  count = 0;
  values = Object.create(null);
  type = getType(obj);
  while (true) {
    prototype = type.prototype;
    if (prototype) {
      ref = Object.getOwnPropertyNames(prototype);
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        if (key === "constructor") {
          continue;
        }
        if (key === "__proto__") {
          continue;
        }
        if (has(values, key)) {
          continue;
        }
        if (has(obj, key)) {
          continue;
        }
        values[key] = prototype[key];
        count += 1;
      }
    }
    type = getKind(type);
    if (!type) {
      break;
    }
  }
  return {
    count: count,
    values: values
  };
};

formatDuplicate = function(obj) {
  var index, keyPath;
  index = this.objects.indexOf(obj);
  if (index < 0) {
    return false;
  }
  keyPath = this.keyPaths[index];
  this.push("cyan", keyPath.length ? "this." + keyPath : "this");
  return true;
};

//# sourceMappingURL=../../map/src/formatObject.map
