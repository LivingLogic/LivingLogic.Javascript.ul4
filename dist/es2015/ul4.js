function _get2(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get2 = Reflect.get; } else { _get2 = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get2(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

export var version = "46";
var _registry = {};

var _havemap = typeof Map === "function" && typeof Map.prototype.forEach === "function";

var _havemapconstructor = function () {
  if (_havemap) {
    try {
      if (new Map([[1, 2]]).size == 1) return true;
    } catch (error) {}
  }

  return false;
}();

var _haveset = typeof Set === "function" && typeof Set.prototype.forEach === "function";

var _havesetconstructor = function () {
  if (_haveset) {
    try {
      if (new Set([1, 2]).size == 2) return true;
    } catch (error) {}

    return false;
  } else return false;
}();

export var _makemap;
export var _setmap;
export var _emptymap;
export var _getmap;

if (_havemap) {
  _makemap = function _makemap() {
    var map = new Map();

    for (var i = 0; i < arguments.length; ++i) {
      var _ref = i < 0 || arguments.length <= i ? undefined : arguments[i],
          _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      map.set(key, value);
    }

    return map;
  };

  _setmap = function _setmap(map, key, value) {
    if (map.__proto__ === Map.prototype) map.set(key, value);else map[key] = value;
  };

  _emptymap = function _emptymap() {
    return new Map();
  };

  _getmap = function _getmap(map, key, value) {
    if (map.__proto__ === Map.prototype) return map.get(key);else return map[key];
  };
} else {
  _makemap = function _makemap() {
    var map = {};

    for (var i = 0; i < arguments.length; ++i) {
      var _ref3 = i < 0 || arguments.length <= i ? undefined : arguments[i],
          _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1];

      map[key] = value;
    }

    return map;
  };

  _setmap = function _setmap(map, key, value) {
    map[key] = value;
  };

  _emptymap = function _emptymap() {
    return {};
  };

  _getmap = function _getmap(map, key, value) {
    return map[key];
  };
}

export var _emptyset;

if (_haveset) {
  _emptyset = function _emptyset() {
    return new Set();
  };
} else {
  _emptyset = function _emptyset() {
    return new _Set();
  };
}

export var _makeset = function _makeset() {
  var set = _emptyset();

  for (var i = 0; i < arguments.length; ++i) {
    set.add(i < 0 || arguments.length <= i ? undefined : arguments[i]);
  }

  return set;
};
export function register(name, f) {
  f.prototype.ul4onname = name;
  _registry[name] = f;
}
;
export function dumps(obj, indent) {
  var encoder = new Encoder(indent);
  encoder.dump(obj);
  return encoder.finish();
}
;

function _loads(data, registry) {
  var decoder = new Decoder(data, registry);
  return decoder.load();
}

export { _loads as loads };
;
export var Encoder = function () {
  function Encoder() {
    var indent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, Encoder);

    this.indent = indent;
    this.data = [];
    this._level = 0;
    this._strings2index = {};
    this._ids2index = {};
    this._backrefs = 0;
  }

  _createClass(Encoder, [{
    key: "_line",
    value: function _line(line) {
      if (this.indent !== null) {
        for (var i = 0; i < this._level; ++i) {
          this.data.push(this.indent);
        }
      } else {
        if (this.data.length) this.data.push(" ");
      }

      this.data.push(line);

      if (arguments.length <= 1 ? 0 : arguments.length - 1) {
        var oldindent = this.indent;
        this.indent = null;

        for (var _i2 = 0; _i2 < (arguments.length <= 1 ? 0 : arguments.length - 1); ++_i2) {
          this.dump(_i2 + 1 < 1 || arguments.length <= _i2 + 1 ? undefined : arguments[_i2 + 1]);
        }

        this.indent = oldindent;
      }

      if (this.indent !== null) this.data.push("\n");
    }
  }, {
    key: "finish",
    value: function finish() {
      return this.data.join("");
    }
  }, {
    key: "dump",
    value: function dump(obj) {
      if (obj === null) this._line("n");else if (typeof obj == "boolean") this._line(obj ? "bT" : "bF");else if (typeof obj == "number") {
        var type = Math.round(obj) == obj ? "i" : "f";

        this._line(type + obj);
      } else if (typeof obj == "string") {
        var index = this._strings2index[obj];

        if (typeof index !== "undefined") {
          this._line("^" + index);
        } else {
          this._strings2index[obj] = this._backrefs++;

          var dump = _str_repr(obj).replace("<", "\\x3c");

          this._line("S" + dump);
        }
      } else if (_iscolor(obj)) this._line("c", obj.r(), obj.g(), obj.b(), obj.a());else if (_isdate(obj)) this._line("x", obj.year(), obj.month(), obj.day());else if (_isdatetime(obj)) this._line("z", obj.getFullYear(), obj.getMonth() + 1, obj.getDate(), obj.getHours(), obj.getMinutes(), obj.getSeconds(), obj.getMilliseconds() * 1000);else if (_istimedelta(obj)) this._line("t", obj.days(), obj.seconds(), obj.microseconds());else if (_ismonthdelta(obj)) this._line("m", obj.months());else if (obj instanceof slice) this._line("r", obj.start, obj.stop);else if (obj.ul4onname && obj.ul4ondump) {
        if (obj.__id__) {
          var _index = this._ids2index[obj.__id__];

          if (typeof _index != "undefined") {
            this._line("^" + _index);

            return;
          }

          this._ids2index[obj.__id__] = this._backrefs++;
        }

        this._line("O", obj.ul4onname);

        ++this._level;
        obj.ul4ondump(this);
        --this._level;

        this._line(")");
      } else if (_islist(obj)) {
        this._line("l");

        ++this._level;

        for (var i = 0; i < obj.length; ++i) {
          this.dump(obj[i]);
        }

        --this._level;

        this._line("]");
      } else if (_ismap(obj)) {
        this._line("e");

        ++this._level;
        obj.forEach(function (value, key) {
          this.dump(key);
          this.dump(value);
        }, this);
        --this._level;

        this._line("}");
      } else if (_isdict(obj)) {
        this._line("d");

        ++this._level;

        for (var key in obj) {
          this.dump(key);
          this.dump(obj[key]);
        }

        --this._level;

        this._line("}");
      } else if (_isset(obj)) {
        this._line("y");

        ++this._level;
        obj.forEach(function (value) {
          this.dump(value);
        }, this);
        --this._level;

        this._line("}");
      } else throw new ValueError("can't create UL4ON dump of object " + _repr2(obj));
    }
  }]);

  return Encoder;
}();
;
export var Decoder = function () {
  function Decoder(data, registry) {
    _classCallCheck(this, Decoder);

    this.data = data;
    this.pos = 0;
    this.backrefs = [];
    this.registry = typeof registry === "undefined" ? null : registry;
    this.stack = [];
  }

  _createClass(Decoder, [{
    key: "readchar",
    value: function readchar() {
      if (this.pos >= this.data.length) throw new ValueError("UL4 decoder at EOF");
      return this.data.charAt(this.pos++);
    }
  }, {
    key: "readcharoreof",
    value: function readcharoreof() {
      if (this.pos >= this.data.length) return null;
      return this.data.charAt(this.pos++);
    }
  }, {
    key: "readblackchar",
    value: function readblackchar() {
      var re_white = /\s/;

      for (;;) {
        if (this.pos >= this.data.length) throw new ValueError("UL4 decoder at EOF at position " + this.pos + " with path " + this.stack.join("/"));
        var c = this.data.charAt(this.pos++);
        if (!c.match(re_white)) return c;
      }
    }
  }, {
    key: "read",
    value: function read(size) {
      if (this.pos + size > this.length) size = this.length - this.pos;
      var result = this.data.substring(this.pos, this.pos + size);
      this.pos += size;
      return result;
    }
  }, {
    key: "backup",
    value: function backup() {
      --this.pos;
    }
  }, {
    key: "readnumber",
    value: function readnumber() {
      var re_digits = /[-+0123456789.eE]/,
          value = "";

      for (;;) {
        var c = this.readcharoreof();
        if (c !== null && c.match(re_digits)) value += c;else {
          var result = parseFloat(value);
          if (isNaN(result)) throw new ValueError("invalid number, got " + _repr2("value") + " at position " + this.pos + " with path " + this.stack.join("/"));
          return result;
        }
      }
    }
  }, {
    key: "_beginfakeloading",
    value: function _beginfakeloading() {
      var oldpos = this.backrefs.length;
      this.backrefs.push(null);
      return oldpos;
    }
  }, {
    key: "_endfakeloading",
    value: function _endfakeloading(oldpos, value) {
      this.backrefs[oldpos] = value;
    }
  }, {
    key: "_readescape",
    value: function _readescape(escapechar, length) {
      var chars = this.read(length);
      if (chars.length != length) throw new ValueError("broken escape " + _repr2("\\" + escapechar + chars) + " at position " + this.pos + " with path " + this.stack.join("/"));
      var codepoint = parseInt(chars, 16);
      if (isNaN(codepoint)) throw new ValueError("broken escape " + _repr2("\\" + escapechar + chars) + " at position " + this.pos + " with path " + this.stack.join("/"));
      return String.fromCharCode(codepoint);
    }
  }, {
    key: "load",
    value: function load() {
      var typecode = this.readblackchar();
      var result;

      switch (typecode) {
        case "^":
          return this.backrefs[this.readnumber()];

        case "n":
        case "N":
          if (typecode === "N") this.backrefs.push(null);
          return null;

        case "b":
        case "B":
          result = this.readchar();
          if (result === "T") result = true;else if (result === "F") result = false;else throw new ValueError("wrong value for boolean, expected 'T' or 'F', got " + _repr2(result) + " at position " + this.pos + " with path " + this.stack.join("/"));
          if (typecode === "B") this.backrefs.push(result);
          return result;

        case "i":
        case "I":
        case "f":
        case "F":
          result = this.readnumber();
          if (typecode === "I" || typecode === "F") this.backrefs.push(result);
          return result;

        case "s":
        case "S":
          result = [];
          var delimiter = this.readblackchar();

          for (;;) {
            var c = this.readchar();
            if (c == delimiter) break;

            if (c == "\\") {
              var c2 = this.readchar();
              if (c2 == "\\") result.push("\\");else if (c2 == "n") result.push("\n");else if (c2 == "r") result.push("\r");else if (c2 == "t") result.push("\t");else if (c2 == "f") result.push("\f");else if (c2 == "b") result.push("\b");else if (c2 == "a") result.push("\x07");else if (c2 == "'") result.push("'");else if (c2 == '"') result.push('"');else if (c2 == "x") result.push(this._readescape("x", 2));else if (c2 == "u") result.push(this._readescape("u", 4));else if (c2 == "U") result.push(this._readescape("U", 8));else result.push("\\" + c2);
            } else result.push(c);
          }

          result = result.join("");
          if (typecode === "S") this.backrefs.push(result);
          return result;

        case "c":
        case "C":
          result = new Color();
          if (typecode === "C") this.backrefs.push(result);
          result._r = this.load();
          result._g = this.load();
          result._b = this.load();
          result._a = this.load();
          return result;

        case "x":
        case "X":
          {
            var year = this.load();
            var month = this.load();
            var day = this.load();
            result = new Date_(year, month, day);
            if (typecode === "X") this.backrefs.push(result);
            return result;
          }

        case "z":
        case "Z":
          result = new Date();
          result.setFullYear(this.load());
          result.setDate(1);
          result.setMonth(this.load() - 1);
          result.setDate(this.load());
          result.setHours(this.load());
          result.setMinutes(this.load());
          result.setSeconds(this.load());
          result.setMilliseconds(this.load() / 1000);
          if (typecode === "Z") this.backrefs.push(result);
          return result;

        case "t":
        case "T":
          result = new TimeDelta();
          result._days = this.load();
          result._seconds = this.load();
          result._microseconds = this.load();
          if (typecode === "T") this.backrefs.push(result);
          return result;

        case "r":
        case "R":
          result = new slice();
          if (typecode === "R") this.backrefs.push(result);
          result.start = this.load();
          result.stop = this.load();
          return result;

        case "m":
        case "M":
          result = new MonthDelta();
          if (typecode === "M") this.backrefs.push(result);
          result._months = this.load();
          return result;

        case "l":
        case "L":
          this.stack.push("list");
          result = [];
          if (typecode === "L") this.backrefs.push(result);

          for (;;) {
            typecode = this.readblackchar();
            if (typecode === "]") break;
            this.backup();
            result.push(this.load());
          }

          this.stack.pop();
          return result;

        case "d":
        case "D":
        case "e":
        case "E":
          if (!_havemap && (typecode == "e" || typecode == "E")) throw new ValueError("ordered dictionaries are not supported at position " + this.pos + " with path " + this.stack.join("/"));
          result = _emptymap();
          this.stack.push(typecode === "d" || typecode === "D" ? "dict" : "odict");
          if (typecode === "D" || typecode === "E") this.backrefs.push(result);

          for (;;) {
            typecode = this.readblackchar();
            if (typecode === "}") break;
            this.backup();
            var key = this.load();
            var value = this.load();

            _setmap(result, key, value);
          }

          this.stack.pop();
          return result;

        case "y":
        case "Y":
          this.stack.push("set");
          result = _makeset();
          if (typecode === "Y") this.backrefs.push(result);

          for (;;) {
            typecode = this.readblackchar();
            if (typecode === "}") break;
            this.backup();
            result.add(this.load());
          }

          this.stack.pop();
          return result;

        case "o":
        case "O":
          {
            var oldpos;
            if (typecode === "O") oldpos = this._beginfakeloading();
            var name = this.load();
            this.stack.push(name);

            var _constructor;

            if (this.registry !== null) {
              _constructor = this.registry[name];
              if (typeof _constructor === "undefined") _constructor = _registry[name];
            } else _constructor = _registry[name];

            if (typeof _constructor === "undefined") throw new ValueError("can't load object of type " + _repr2(name) + " at position " + this.pos + " with path " + this.stack.join("/"));
            result = new _constructor();
            if (typecode === "O") this._endfakeloading(oldpos, result);
            result.ul4onload(this);
            typecode = this.readblackchar();
            if (typecode !== ")") throw new ValueError("object terminator ')' for object of type '" + name + "' expected, got " + _repr2(typecode) + " at position " + this.pos + " with path " + this.stack.join("/"));
            this.stack.pop();
            return result;
          }

        default:
          throw new ValueError("unknown typecode " + _repr2(typecode) + " at position " + this.pos + " with path " + this.stack.join("/"));
      }
    }
  }, {
    key: "loadcontent",
    value: function loadcontent() {
      var self = this;
      return {
        next: function next() {
          var typecode = self.readblackchar();
          self.backup();
          if (typecode == ")") return {
            done: true
          };else return {
            done: false,
            value: self.load()
          };
        }
      };
    }
  }]);

  return Decoder;
}();
;
var _rvalidchars = /^[\],:{}\s]*$/;
var _rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var _rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var _rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
export function _map2object(obj) {
  if (_ismap(obj)) {
    var newobj = {};
    obj.forEach(function (value, key) {
      if (typeof key !== "string") throw new _TypeError("keys must be strings");
      newobj[key] = value;
    });
    return newobj;
  }

  return obj;
}
;
export function _bound(value, upper) {
  if (value < 0) return 0;else if (value > upper) return upper;else return value;
}
;
export function _stacktrace(exc) {
  var output = (exc instanceof Exception ? exc.constructor.name + ": " : "") + exc.toString();
  if (exc.context) output = _stacktrace(exc.context) + "\n\n" + output;
  return output;
}
;
export function _internal_call(context, f, name, functioncontext, signature, needscontext, needsobject, args, kwargs) {
  var finalargs;

  if (needsobject) {
    if (signature === null) {
      if (args.length) throw new ArgumentError(_repr2(f) + " doesn't support positional arguments!");
      finalargs = [kwargs];
    } else finalargs = [signature.bindObject(name, args, kwargs)];
  } else {
    if (signature === null) throw new ArgumentError(_repr2(f) + " doesn't support positional arguments!");
    finalargs = signature.bindArray(name, args, kwargs);
  }

  if (needscontext) finalargs.unshift(context);
  return f.apply(functioncontext, finalargs);
}
;
export function _callfunction(context, f, args, kwargs) {
  var name = f._ul4_name || f.name;
  if (typeof f._ul4_signature === "undefined" || typeof f._ul4_needsobject === "undefined" || typeof f._ul4_needscontext === "undefined") throw new _TypeError(_repr2(f) + " is not callable by UL4");
  return _internal_call(context, f, name, null, f._ul4_signature, f._ul4_needscontext, f._ul4_needsobject, args, kwargs);
}
;
export function _callobject(context, obj, args, kwargs) {
  if (typeof obj._ul4_callsignature === "undefined" || typeof obj._ul4_callneedsobject === "undefined" || typeof obj._ul4_callneedscontext === "undefined") throw new _TypeError(_repr2(obj) + " is not callable by UL4");
  return _internal_call(context, obj.__call__, obj.name, obj, obj._ul4_callsignature, obj._ul4_callneedscontext, obj._ul4_callneedsobject, args, kwargs);
}
;
export function _callrender(context, obj, args, kwargs) {
  if (typeof obj._ul4_rendersignature === "undefined" || typeof obj._ul4_renderneedsobject === "undefined" || typeof obj._ul4_renderneedscontext === "undefined") throw new _TypeError(_repr2(obj) + " is not renderable by UL4");
  return _internal_call(context, obj.__render__, obj.name, obj, obj._ul4_rendersignature, obj._ul4_renderneedscontext, obj._ul4_renderneedsobject, args, kwargs);
}
;
export function _call(context, f, args, kwargs) {
  if (typeof f === "function") return _callfunction(context, f, args, kwargs);else if (f && typeof f.__call__ === "function") return _callobject(context, f, args, kwargs);else throw new _TypeError(_type(f) + " is not callable");
}
;
export function _unpackvar(lvalue, value) {
  if (!_islist(lvalue)) return [[lvalue, value]];else {
    var newvalue = [];

    var iter = _iter(value);

    for (var i = 0;; ++i) {
      var item = iter.next();

      if (item.done) {
        if (i === lvalue.length) break;else throw new ValueError("need " + lvalue.length + " value" + (lvalue.length === 1 ? "" : "s") + " to unpack, got " + i);
      } else {
        if (i < lvalue.length) newvalue = newvalue.concat(_unpackvar(lvalue[i], item.value));else throw new ValueError("too many values to unpack (expected " + lvalue.length + ")");
      }
    }

    return newvalue;
  }
}
;
export function _formatsource(out) {
  var finalout = [];
  var level = 0,
      needlf = false;

  for (var i = 0; i < out.length; ++i) {
    var part = out[i];

    if (typeof part === "number") {
      level += part;
      needlf = true;
    } else {
      if (needlf) {
        finalout.push("\n");

        for (var j = 0; j < level; ++j) {
          finalout.push("\t");
        }

        needlf = false;
      }

      finalout.push(part);
    }
  }

  if (needlf) finalout.push("\n");
  return finalout.join("");
}
;
export function _eq(obj1, obj2) {
  var numbertypes = ["boolean", "number"];
  if (obj1 && typeof obj1.__eq__ === "function") return obj1.__eq__(obj2);else if (obj2 && typeof obj2.__eq__ === "function") return obj2.__eq__(obj1);else if (obj1 === null) return obj2 === null;else if (numbertypes.indexOf(_typeof(obj1)) != -1) {
    if (numbertypes.indexOf(_typeof(obj2)) != -1) return obj1 == obj2;else return false;
  } else if (typeof obj1 === "string") {
    if (typeof obj2 === "string") return obj1 == obj2;else return false;
  } else if (_isdatetime(obj1)) {
    if (_isdatetime(obj2)) return obj1.getTime() == obj2.getTime();else return false;
  } else if (_islist(obj1)) {
    if (_islist(obj2)) {
      if (obj1 === obj2) return true;
      if (obj1.length != obj2.length) return false;

      for (var i = 0; i < obj1.length; ++i) {
        if (!_eq(obj1[i], obj2[i])) return false;
      }

      return true;
    } else return false;
  } else if (_isobject(obj1)) {
    if (_isobject(obj2)) {
      if (obj1 === obj2) return true;

      for (var key in obj1) {
        if (obj2.hasOwnProperty(key)) {
          if (!_eq(obj1[key], obj2[key])) return false;
        } else return false;
      }

      for (var _key in obj2) {
        if (!obj1.hasOwnProperty(_key)) return false;
      }

      return true;
    } else if (_ismap(obj2)) {
      for (var _key2 in obj1) {
        if (obj2.has(_key2)) {
          if (!_eq(obj1[_key2], obj2.get(_key2))) return false;
        } else return false;
      }

      var result = true;
      obj2.forEach(function (value, key) {
        if (!obj1.hasOwnProperty(key)) result = false;
      }, this);
      return result;
    } else return false;
  } else if (_ismap(obj1)) {
    if (_isobject(obj2)) {
      obj1.forEach(function (value, key) {
        if (!obj2.hasOwnProperty(key)) return false;else if (!_eq(obj1.get(key), obj2[key])) return false;
      }, this);

      for (var _key3 in obj2) {
        if (!obj1.has(_key3)) return false;
      }

      return true;
    } else if (_ismap(obj2)) {
      if (obj1 === obj2) return true;
      if (obj1.size != obj2.size) return false;
      var _result = true;
      obj1.forEach(function (value, key) {
        if (!obj2.has(key)) _result = false;else if (!_eq(obj1.get(key), obj2.get(key))) _result = false;
      });
      return _result;
    } else return false;
  } else if (_isset(obj1)) {
    if (_isset(obj2)) {
      if (obj1 === obj2) return true;
      if (obj1.size != obj2.size) return false;
      var _result2 = true;
      obj1.forEach(function (value) {
        if (!obj2.has(value)) _result2 = false;
      });
      return _result2;
    } else return false;
  } else return obj1 === obj2;
}
;
export function _ne(obj1, obj2) {
  if (obj1 && typeof obj1.__ne__ === "function") return obj1.__ne__(obj2);else if (obj2 && typeof obj2.__ne__ === "function") return obj2.__ne__(obj1);else return !_eq(obj1, obj2);
}
;
export function _unorderable(operator, obj1, obj2) {
  throw new _TypeError("unorderable types: " + _type(obj1) + " " + operator + " " + _type(obj2));
}
;
export function _cmp(operator, obj1, obj2) {
  var numbertypes = ["boolean", "number"];

  if (numbertypes.indexOf(_typeof(obj1)) != -1) {
    if (numbertypes.indexOf(_typeof(obj2)) != -1) return (obj1 > obj2) - (obj1 < obj2);
  } else if (typeof obj1 === "string") {
    if (typeof obj2 === "string") return (obj1 > obj2) - (obj1 < obj2);
  } else if (_isdatetime(obj1)) {
    if (_isdatetime(obj2)) {
      var v1 = obj1.getTime(),
          v2 = obj2.getTime();
      return (v1 > v2) - (v1 < v2);
    }
  } else if (_islist(obj1)) {
    if (_islist(obj2)) {
      if (obj1 === obj2) return 0;

      for (var i = 0; i < obj1.length; ++i) {
        if (i >= obj2.length) return 1;

        var res = _cmp(operator, obj1[i], obj2[i]);

        if (res) return res;
      }

      return obj2.length > obj1.length ? -1 : 0;
    }
  } else if (_isset(obj1) || _isul4set(obj1)) {
    if (_isset(obj2) || _isul4set(obj2)) {
      var _in1only = false;
      var _in2only = false;

      for (var iter = _iter(obj1);;) {
        var item = iter.next();
        if (item.done) break;

        if (!obj2.has(item.value)) {
          _in1only = true;
          break;
        }
      }

      for (var _iter2 = _iter(obj2);;) {
        var _item = _iter2.next();

        if (_item.done) break;

        if (!obj1.has(_item.value)) {
          _in2only = true;
          break;
        }
      }

      if (_in1only) {
        if (_in2only) return null;else return 1;
      } else {
        if (_in2only) return -1;else return 0;
      }
    }
  }

  return _unorderable(operator, obj1, obj2);
}
;
export function _lt(obj1, obj2) {
  var numbertypes = ["boolean", "number"];
  if (obj1 && typeof obj1.__lt__ === "function") return obj1.__lt__(obj2);else if (numbertypes.indexOf(_typeof(obj1)) != -1) {
    if (numbertypes.indexOf(_typeof(obj2)) != -1) return obj1 < obj2;
  } else if (typeof obj1 === "string") {
    if (typeof obj2 === "string") return obj1 < obj2;
  } else if (_isdatetime(obj1)) {
    if (_isdatetime(obj2)) return obj1.getTime() < obj2.getTime();
  } else if (_islist(obj1)) {
    if (_islist(obj2)) {
      if (obj1 === obj2) return false;

      for (var i = 0; i < obj1.length; ++i) {
        if (i >= obj2.length) return false;

        var eq = _eq(obj1[i], obj2[i]);

        if (!eq) return _lt(obj1[i], obj2[i]);
      }

      return obj1.length < obj2.length;
    }
  } else if (_isset(obj1)) {
      if (_isset(obj2)) {
        if (_isset(obj2)) {
          for (var key in obj1) {
            if (!obj2.has(obj1[key])) in1only = true;
          }

          for (var _key4 in obj2) {
            if (!obj1.has(obj2[_key4])) in2only = true;
          }
        } else if (_isul4set(obj2)) {
          for (var _key5 in obj1) {
            if (!obj2.items[obj1[_key5]]) in1only = true;
          }

          for (var value in obj2.items) {
            if (!obj1.has(value)) {
              in2only = true;
              break;
            }
          }
        }
      } else if (_isul4set(obj2)) {
        if (_isset(obj2)) {
          for (var _value in obj1.items) {
            if (!obj2.has(_value)) {
              in1only = true;
              break;
            }
          }

          for (var _key6 in obj2) {
            if (!obj1.items[obj2[_key6]]) in2only = true;
          }
        } else if (_isul4set(obj2)) {
          for (var _value2 in obj1.items) {
            if (!obj2.items[_value2]) {
              in1only = true;
              break;
            }
          }

          for (var _value3 in obj2.items) {
            if (!obj1.items[_value3]) {
              in2only = true;
              break;
            }
          }
        }
      } else _unorderable(operator, obj1, obj2);

      if (in1only) {
        if (in2only) return null;else return 1;
      } else {
        if (in2only) return -1;else return 0;
      }
    }

  _unorderable("<", obj1, obj2);
}
;
export function _le(obj1, obj2) {
  var numbertypes = ["boolean", "number"];
  if (obj1 && typeof obj1.__le__ === "function") return obj1.__le__(obj2);

  if (numbertypes.indexOf(_typeof(obj1)) != -1) {
    if (numbertypes.indexOf(_typeof(obj2)) != -1) return obj1 <= obj2;
  } else if (typeof obj1 === "string") {
    if (typeof obj2 === "string") return obj1 <= obj2;
  } else if (_isdatetime(obj1)) {
    if (_isdatetime(obj2)) return obj1.getTime() <= obj2.getTime();
  } else if (_islist(obj1)) {
    if (_islist(obj2)) {
      if (obj1 === obj2) return true;

      for (var i = 0; i < obj1.length; ++i) {
        if (i >= obj2.length) return false;

        var eq = _eq(obj1[i], obj2[i]);

        if (!eq) return _lt(obj1[i], obj2[i]);
      }

      return obj1.length <= obj2.length;
    }
  } else if (_isset(obj1) || _isul4set(obj1)) {
      var _in1only2 = false;
      var _in2only2 = false;

      if (_isset(obj2)) {
        if (_isset(obj2)) {
          obj1.forEach(function (value) {
            if (!obj2.has(value)) _in1only2 = true;
          });
          obj2.forEach(function (value) {
            if (!obj1.has(value)) _in2only2 = true;
          });
        } else if (_isul4set(obj2)) {
          obj1.forEach(function (value) {
            if (!obj2.items[value]) _in1only2 = true;
          });

          for (var value in obj2.items) {
            if (!obj1.has(value)) {
              _in2only2 = true;
              break;
            }
          }
        }
      } else if (_isul4set(obj2)) {
        if (_isset(obj2)) {
          for (var _value4 in obj1.items) {
            if (!obj2.has(_value4)) {
              _in1only2 = true;
              break;
            }
          }

          obj2.forEach(function (value) {
            if (!obj1.items[value]) _in2only2 = true;
          });
        } else if (_isul4set(obj2)) {
          for (var _value5 in obj1.items) {
            if (!obj2.items[_value5]) {
              _in1only2 = true;
              break;
            }
          }

          for (var _value6 in obj2.items) {
            if (!obj1.items[_value6]) {
              _in2only2 = true;
              break;
            }
          }
        }
      } else _unorderable(operator, obj1, obj2);

      if (_in1only2) {
        if (_in2only2) return null;else return 1;
      } else {
        if (_in2only2) return -1;else return 0;
      }
    }

  _unorderable("<=", obj1, obj2);
}
;
export function _gt(obj1, obj2) {
  var numbertypes = ["boolean", "number"];
  if (obj1 && typeof obj1.__gt__ === "function") return obj1.__gt__(obj2);

  if (numbertypes.indexOf(_typeof(obj1)) != -1) {
    if (numbertypes.indexOf(_typeof(obj2)) != -1) return obj1 > obj2;
  } else if (typeof obj1 === "string") {
    if (typeof obj2 === "string") return obj1 > obj2;
  } else if (_isdatetime(obj1)) {
    if (_isdatetime(obj2)) return obj1.getTime() > obj2.getTime();
  } else if (_islist(obj1)) {
    if (_islist(obj2)) {
      if (obj1 === obj2) return false;

      for (var i = 0; i < obj1.length; ++i) {
        if (i >= obj2.length) return true;

        var eq = _eq(obj1[i], obj2[i]);

        if (!eq) return _gt(obj1[i], obj2[i]);
      }

      return obj1.length > obj2.length;
    }
  } else if (_isset(obj1) || _isul4set(obj1)) {
      var _in1only3 = false;
      var _in2only3 = false;

      if (_isset(obj2)) {
        if (_isset(obj2)) {
          obj1.forEach(function (value) {
            if (!obj2.has(value)) _in1only3 = true;
          });
          obj2.forEach(function (value) {
            if (!obj1.has(value)) _in2only3 = true;
          });
        } else if (_isul4set(obj2)) {
          obj1.forEach(function (value) {
            if (!obj2.items[value]) _in1only3 = true;
          });
          obj2.forEach(function (value) {
            if (!obj1.has(value)) {
              _in2only3 = true;
            }
          });
        }
      } else if (_isul4set(obj2)) {
        if (_isset(obj2)) {
          for (var value in obj1.items) {
            if (!obj2.has(value)) {
              _in1only3 = true;
              break;
            }
          }

          obj2.forEach(function (value) {
            if (!obj1.items[value]) _in2only3 = true;
          });
        } else if (_isul4set(obj2)) {
          for (var _value7 in obj1.items) {
            if (!obj2.items[_value7]) {
              _in1only3 = true;
              break;
            }
          }

          for (var _value8 in obj2.items) {
            if (!obj1.items[_value8]) {
              _in2only3 = true;
              break;
            }
          }
        }
      } else _unorderable(operator, obj1, obj2);

      if (_in1only3) {
        if (_in2only3) return null;else return 1;
      } else {
        if (_in2only3) return -1;else return 0;
      }
    }

  _unorderable(">", obj1, obj2);
}
;
export function _ge(obj1, obj2) {
  var numbertypes = ["boolean", "number"];
  if (obj1 && typeof obj1.__ge__ === "function") return obj1.__ge__(obj2);else if (numbertypes.indexOf(_typeof(obj1)) != -1) {
    if (numbertypes.indexOf(_typeof(obj2)) != -1) return obj1 >= obj2;
  } else if (typeof obj1 === "string") {
    if (typeof obj2 === "string") return obj1 >= obj2;
  } else if (_isdatetime(obj1)) {
    if (_isdatetime(obj2)) return obj1.getTime() >= obj2.getTime();
  } else if (_islist(obj1)) {
    if (_islist(obj2)) {
      if (obj1 === obj2) return true;

      for (var i = 0; i < obj1.length; ++i) {
        if (i >= obj2.length) return true;

        var eq = _eq(obj1[i], obj2[i]);

        if (!eq) return _gt(obj1[i], obj2[i]);
      }

      return obj1.length >= obj2.length;
    }
  } else if (_isset(obj1) || _isul4set(obj1)) {
      var _in1only4 = false;
      var _in2only4 = false;

      if (_isset(obj2)) {
        if (_isset(obj2)) {
          obj1.forEach(function (value) {
            if (!obj2.has(value)) _in1only4 = true;
          });
          obj2.forEach(function (value) {
            if (!obj1.has(value)) _in2only4 = true;
          });
        } else if (_isul4set(obj2)) {
          obj1.forEach(function (value) {
            if (!obj2.items[value]) _in1only4 = true;
          });

          for (var value in obj2.items) {
            if (!obj1.has(value)) {
              _in2only4 = true;
              break;
            }
          }
        }
      } else if (_isul4set(obj2)) {
        if (_isset(obj2)) {
          for (var _value9 in obj1.items) {
            if (!obj2.has(_value9)) {
              _in1only4 = true;
              break;
            }
          }

          obj2.forEach(function (value, key) {
            if (!obj1.items[value]) _in2only4 = true;
          });
        } else if (_isul4set(obj2)) {
          for (var _value10 in obj1.items) {
            if (!obj2.items[_value10]) {
              _in1only4 = true;
              break;
            }
          }

          for (var _value11 in obj2.items) {
            if (!obj1.items[_value11]) {
              _in2only4 = true;
              break;
            }
          }
        }
      } else _unorderable(operator, obj1, obj2);

      if (_in1only4) {
        if (_in2only4) return null;else return 1;
      } else {
        if (_in2only4) return -1;else return 0;
      }
    }

  _unorderable(">=", obj1, obj2);
}
;
export function _iter(obj) {
  if (typeof obj === "string" || _islist(obj)) {
    return {
      index: 0,
      next: function next() {
        if (this.index < obj.length) return {
          value: obj[this.index++],
          done: false
        };else return {
          done: true
        };
      }
    };
  } else if (_isiter(obj)) return obj;else if (obj !== null && typeof obj.__iter__ === "function") return obj.__iter__();else if (_ismap(obj)) {
    var keys = [];
    obj.forEach(function (value, key) {
      keys.push(key);
    });
    return {
      index: 0,
      next: function next() {
        if (this.index >= keys.length) return {
          done: true
        };
        return {
          value: keys[this.index++],
          done: false
        };
      }
    };
  } else if (_isset(obj)) {
    var values = [];
    obj.forEach(function (item) {
      values.push(item);
    });
    return {
      index: 0,
      next: function next() {
        if (this.index >= values.length) return {
          done: true
        };
        return {
          value: values[this.index++],
          done: false
        };
      }
    };
  } else if (_isul4set(obj)) {
    return _iter(obj.items);
  } else if (_isobject(obj)) {
    var _keys = [];

    for (var key in obj) {
      _keys.push(key);
    }

    return {
      index: 0,
      next: function next() {
        if (this.index >= _keys.length) return {
          done: true
        };
        return {
          value: _keys[this.index++],
          done: false
        };
      }
    };
  }

  throw new _TypeError(_type(obj) + " object is not iterable");
}
;

function _str_repr(str, ascii) {
  var result = "";
  var squote = false,
      dquote = false;

  for (var i = 0; i < str.length; ++i) {
    var c = str[i];

    if (c == '"') {
      dquote = true;
      if (squote) break;
    } else if (c == "'") {
      squote = true;
      if (dquote) break;
    }
  }

  var quote = squote && !dquote ? '"' : "'";

  for (var _i3 = 0; _i3 < str.length; ++_i3) {
    var _c = str[_i3];

    switch (_c) {
      case '"':
        result += quote == _c ? '\\"' : _c;
        break;

      case "'":
        result += quote == _c ? "\\'" : _c;
        break;

      case "\\":
        result += "\\\\";
        break;

      case "\t":
        result += "\\t";
        break;

      case "\n":
        result += "\\n";
        break;

      case "\r":
        result += "\\r";
        break;

      default:
        var code = _c.charCodeAt(0);

        var _escape = void 0;

        if (code < 32) _escape = 2;else if (code < 0x7f) _escape = 0;else if (!ascii && !/[\u007f-\u00a0\u00ad\u0378-\u0379\u0380-\u0383\u038b\u038d\u03a2\u0530\u0557-\u0558\u0560\u0588\u058b-\u058c\u0590\u05c8-\u05cf\u05eb-\u05ef\u05f5-\u0605\u061c-\u061d\u06dd\u070e-\u070f\u074b-\u074c\u07b2-\u07bf\u07fb-\u07ff\u082e-\u082f\u083f\u085c-\u085d\u085f-\u089f\u08b5-\u08e2\u0984\u098d-\u098e\u0991-\u0992\u09a9\u09b1\u09b3-\u09b5\u09ba-\u09bb\u09c5-\u09c6\u09c9-\u09ca\u09cf-\u09d6\u09d8-\u09db\u09de\u09e4-\u09e5\u09fc-\u0a00\u0a04\u0a0b-\u0a0e\u0a11-\u0a12\u0a29\u0a31\u0a34\u0a37\u0a3a-\u0a3b\u0a3d\u0a43-\u0a46\u0a49-\u0a4a\u0a4e-\u0a50\u0a52-\u0a58\u0a5d\u0a5f-\u0a65\u0a76-\u0a80\u0a84\u0a8e\u0a92\u0aa9\u0ab1\u0ab4\u0aba-\u0abb\u0ac6\u0aca\u0ace-\u0acf\u0ad1-\u0adf\u0ae4-\u0ae5\u0af2-\u0af8\u0afa-\u0b00\u0b04\u0b0d-\u0b0e\u0b11-\u0b12\u0b29\u0b31\u0b34\u0b3a-\u0b3b\u0b45-\u0b46\u0b49-\u0b4a\u0b4e-\u0b55\u0b58-\u0b5b\u0b5e\u0b64-\u0b65\u0b78-\u0b81\u0b84\u0b8b-\u0b8d\u0b91\u0b96-\u0b98\u0b9b\u0b9d\u0ba0-\u0ba2\u0ba5-\u0ba7\u0bab-\u0bad\u0bba-\u0bbd\u0bc3-\u0bc5\u0bc9\u0bce-\u0bcf\u0bd1-\u0bd6\u0bd8-\u0be5\u0bfb-\u0bff\u0c04\u0c0d\u0c11\u0c29\u0c3a-\u0c3c\u0c45\u0c49\u0c4e-\u0c54\u0c57\u0c5b-\u0c5f\u0c64-\u0c65\u0c70-\u0c77\u0c80\u0c84\u0c8d\u0c91\u0ca9\u0cb4\u0cba-\u0cbb\u0cc5\u0cc9\u0cce-\u0cd4\u0cd7-\u0cdd\u0cdf\u0ce4-\u0ce5\u0cf0\u0cf3-\u0d00\u0d04\u0d0d\u0d11\u0d3b-\u0d3c\u0d45\u0d49\u0d4f-\u0d56\u0d58-\u0d5e\u0d64-\u0d65\u0d76-\u0d78\u0d80-\u0d81\u0d84\u0d97-\u0d99\u0db2\u0dbc\u0dbe-\u0dbf\u0dc7-\u0dc9\u0dcb-\u0dce\u0dd5\u0dd7\u0de0-\u0de5\u0df0-\u0df1\u0df5-\u0e00\u0e3b-\u0e3e\u0e5c-\u0e80\u0e83\u0e85-\u0e86\u0e89\u0e8b-\u0e8c\u0e8e-\u0e93\u0e98\u0ea0\u0ea4\u0ea6\u0ea8-\u0ea9\u0eac\u0eba\u0ebe-\u0ebf\u0ec5\u0ec7\u0ece-\u0ecf\u0eda-\u0edb\u0ee0-\u0eff\u0f48\u0f6d-\u0f70\u0f98\u0fbd\u0fcd\u0fdb-\u0fff\u10c6\u10c8-\u10cc\u10ce-\u10cf\u1249\u124e-\u124f\u1257\u1259\u125e-\u125f\u1289\u128e-\u128f\u12b1\u12b6-\u12b7\u12bf\u12c1\u12c6-\u12c7\u12d7\u1311\u1316-\u1317\u135b-\u135c\u137d-\u137f\u139a-\u139f\u13f6-\u13f7\u13fe-\u13ff\u1680\u169d-\u169f\u16f9-\u16ff\u170d\u1715-\u171f\u1737-\u173f\u1754-\u175f\u176d\u1771\u1774-\u177f\u17de-\u17df\u17ea-\u17ef\u17fa-\u17ff\u180e-\u180f\u181a-\u181f\u1878-\u187f\u18ab-\u18af\u18f6-\u18ff\u191f\u192c-\u192f\u193c-\u193f\u1941-\u1943\u196e-\u196f\u1975-\u197f\u19ac-\u19af\u19ca-\u19cf\u19db-\u19dd\u1a1c-\u1a1d\u1a5f\u1a7d-\u1a7e\u1a8a-\u1a8f\u1a9a-\u1a9f\u1aae-\u1aaf\u1abf-\u1aff\u1b4c-\u1b4f\u1b7d-\u1b7f\u1bf4-\u1bfb\u1c38-\u1c3a\u1c4a-\u1c4c\u1c80-\u1cbf\u1cc8-\u1ccf\u1cf7\u1cfa-\u1cff\u1df6-\u1dfb\u1f16-\u1f17\u1f1e-\u1f1f\u1f46-\u1f47\u1f4e-\u1f4f\u1f58\u1f5a\u1f5c\u1f5e\u1f7e-\u1f7f\u1fb5\u1fc5\u1fd4-\u1fd5\u1fdc\u1ff0-\u1ff1\u1ff5\u1fff-\u200f\u2028-\u202f\u205f-\u206f\u2072-\u2073\u208f\u209d-\u209f\u20bf-\u20cf\u20f1-\u20ff\u218c-\u218f\u23fb-\u23ff\u2427-\u243f\u244b-\u245f\u2b74-\u2b75\u2b96-\u2b97\u2bba-\u2bbc\u2bc9\u2bd2-\u2beb\u2bf0-\u2bff\u2c2f\u2c5f\u2cf4-\u2cf8\u2d26\u2d28-\u2d2c\u2d2e-\u2d2f\u2d68-\u2d6e\u2d71-\u2d7e\u2d97-\u2d9f\u2da7\u2daf\u2db7\u2dbf\u2dc7\u2dcf\u2dd7\u2ddf\u2e43-\u2e7f\u2e9a\u2ef4-\u2eff\u2fd6-\u2fef\u2ffc-\u3000\u3040\u3097-\u3098\u3100-\u3104\u312e-\u3130\u318f\u31bb-\u31bf\u31e4-\u31ef\u321f\u32ff\u4db6-\u4dbf\u9fd6-\u9fff\ua48d-\ua48f\ua4c7-\ua4cf\ua62c-\ua63f\ua6f8-\ua6ff\ua7ae-\ua7af\ua7b8-\ua7f6\ua82c-\ua82f\ua83a-\ua83f\ua878-\ua87f\ua8c5-\ua8cd\ua8da-\ua8df\ua8fe-\ua8ff\ua954-\ua95e\ua97d-\ua97f\ua9ce\ua9da-\ua9dd\ua9ff\uaa37-\uaa3f\uaa4e-\uaa4f\uaa5a-\uaa5b\uaac3-\uaada\uaaf7-\uab00\uab07-\uab08\uab0f-\uab10\uab17-\uab1f\uab27\uab2f\uab66-\uab6f\uabee-\uabef\uabfa-\uabff\ud7a4-\ud7af\ud7c7-\ud7ca\ud7fc-\uf8ff\ufa6e-\ufa6f\ufada-\ufaff\ufb07-\ufb12\ufb18-\ufb1c\ufb37\ufb3d\ufb3f\ufb42\ufb45\ufbc2-\ufbd2\ufd40-\ufd4f\ufd90-\ufd91\ufdc8-\ufdef\ufdfe-\ufdff\ufe1a-\ufe1f\ufe53\ufe67\ufe6c-\ufe6f\ufe75\ufefd-\uff00\uffbf-\uffc1\uffc8-\uffc9\uffd0-\uffd1\uffd8-\uffd9\uffdd-\uffdf\uffe7\uffef-\ufffb\ufffe-\uffff]/.test(_c)) _escape = 0;else if (code <= 0xff) _escape = 2;else if (code <= 0xffff) _escape = 4;else _escape = 8;
        if (_escape === 0) result += _c;else if (_escape === 2) result += "\\x" + _lpad(code.toString(16), "0", 2);else if (_escape === 4) result += "\\u" + _lpad(code.toString(16), "0", 4);else result += "\\U" + _lpad(code.toString(16), "0", 8);
        break;
    }
  }

  return quote + result + quote;
}

;

function _date_repr(obj, ascii) {
  var year = obj._date.getFullYear();

  var month = obj._date.getMonth() + 1;

  var day = obj._date.getDate();

  var result = "@(" + year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2) + ")";
  return result;
}

;

function _datetime_repr(obj, ascii) {
  var year = obj.getFullYear();
  var month = obj.getMonth() + 1;
  var day = obj.getDate();
  var hour = obj.getHours();
  var minute = obj.getMinutes();
  var second = obj.getSeconds();
  var ms = obj.getMilliseconds();
  var result = "@(" + year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2) + "T";

  if (hour || minute || second || ms) {
    result += _lpad(hour.toString(), "0", 2) + ":" + _lpad(minute.toString(), "0", 2);

    if (second || ms) {
      result += ":" + _lpad(second.toString(), "0", 2);
      if (ms) result += "." + _lpad(ms.toString(), "0", 3) + "000";
    }
  }

  result += ")";
  return result;
}

;

function _map_repr(obj, ascii) {
  var v = [];
  v.push("{");
  var i = 0;
  obj.forEach(function (value, key) {
    if (i++) v.push(", ");
    v.push(_repr_internal(key, ascii));
    v.push(": ");
    v.push(_repr_internal(value, ascii));
  });
  v.push("}");
  return v.join("");
}

;

function _list_repr(obj, ascii) {
  var v = [];
  v.push("[");

  for (var i = 0; i < obj.length; ++i) {
    var item = obj[i];
    if (i) v.push(", ");
    v.push(_repr_internal(item, ascii));
  }

  v.push("]");
  return v.join("");
}

;

function _set_repr(obj, ascii) {
  var v = [];
  v.push("{");
  if (!obj.size) v.push("/");else {
    var i = 0;
    obj.forEach(function (value) {
      if (i++) v.push(", ");
      v.push(_repr_internal(value, ascii));
    });
  }
  v.push("}");
  return v.join("");
}

;

function _object_repr(obj, ascii) {
  var v = [];
  v.push("{");
  var i = 0;

  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    if (i++) v.push(", ");
    v.push(_repr_internal(key, ascii));
    v.push(": ");
    v.push(_repr_internal(obj[key], ascii));
  }

  v.push("}");
  return v.join("");
}

;

function _repr_internal(obj, ascii) {
  if (obj === null) return "None";else if (obj === false) return "False";else if (obj === true) return "True";else if (typeof obj === "string") return _str_repr(obj, ascii);else if (typeof obj === "number") return "" + obj;else if (typeof obj === "function") {
    if (obj._ul4_name || obj.name) return "<function " + (obj._ul4_name || obj.name) + ">";else return "<anonymous function>";
  } else if (_isdate(obj)) return _date_repr(obj, ascii);else if (_isdatetime(obj)) return _datetime_repr(obj, ascii);else if (typeof obj === "undefined") return "<undefined>";else if (_typeof(obj) === "object" && typeof obj.__repr__ === "function") return obj.__repr__();else if (_islist(obj)) return _list_repr(obj, ascii);else if (_ismap(obj)) return _map_repr(obj, ascii);else if (_isset(obj)) return _set_repr(obj, ascii);else if (_isobject(obj)) return _object_repr(obj, ascii);
  return "?";
}

;

function _repr2(obj) {
  return _repr_internal(obj, false);
}

export { _repr2 as _repr };
;
export function _ascii(obj) {
  return _repr_internal(obj, true);
}
;

function _date_str(obj) {
  var year = obj._date.getFullYear();

  var month = obj._date.getMonth() + 1;

  var day = obj._date.getDate();

  return year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2);
}

;

function _datetime_str(obj) {
  var year = obj.getFullYear();
  var month = obj.getMonth() + 1;
  var day = obj.getDate();
  var hour = obj.getHours();
  var minute = obj.getMinutes();
  var second = obj.getSeconds();
  var ms = obj.getMilliseconds();

  var result = year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2) + " " + _lpad(hour.toString(), "0", 2) + ":" + _lpad(minute.toString(), "0", 2);

  if (second || ms) {
    result += ":" + _lpad(second.toString(), "0", 2);
    if (ms) result += "." + _lpad(ms.toString(), "0", 3) + "000";
  }

  return result;
}

;
export function _str(obj) {
  if (typeof obj === "undefined") return "";else if (obj === null) return "";else if (obj === false) return "False";else if (obj === true) return "True";else if (typeof obj === "string") return obj;else if (typeof obj === "number") return obj.toString();else if (_isdate(obj)) return _date_str(obj);else if (_isdatetime(obj)) return _datetime_str(obj);else if (_islist(obj)) return _list_repr(obj);else if (_isset(obj)) return _set_repr(obj);else if (_ismap(obj)) return _map_repr(obj);else if (_typeof(obj) === "object" && typeof obj.__str__ === "function") return obj.__str__();else if (_typeof(obj) === "object" && typeof obj.__repr__ === "function") return obj.__repr__();else if (_isobject(obj)) return _object_repr(obj);
  return "?";
}
;
export function _bool(obj) {
  if (typeof obj === "undefined" || obj === null || obj === false || obj === 0 || obj === "") return false;else {
    if (_typeof(obj) === "object", typeof obj.__bool__ === "function") return obj.__bool__();
    if (_islist(obj)) return obj.length !== 0;else if (_ismap(obj) || _isset(obj)) return obj.size != 0;else if (_isobject(obj)) {
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        return true;
      }

      return false;
    }
    return true;
  }
}
;
export function _int(obj, base) {
  var result;

  if (base !== null) {
    if (typeof obj !== "string" || !_isint(base)) throw new _TypeError("int() requires a string and an integer");
    result = parseInt(obj, base);
    if (result.toString() == "NaN") throw new _TypeError("invalid literal for int()");
    return result;
  } else {
    if (typeof obj == "string") {
      result = parseInt(obj);
      if (result.toString() == "NaN") throw new _TypeError("invalid literal for int()");
      return result;
    } else if (typeof obj == "number") return Math.floor(obj);else if (obj === true) return 1;else if (obj === false) return 0;

    throw new _TypeError("int() argument must be a string or a number");
  }
}
;
export function _float(obj) {
  if (typeof obj === "string") return parseFloat(obj);else if (typeof obj === "number") return obj;else if (obj === true) return 1.0;else if (obj === false) return 0.0;
  throw new _TypeError("float() argument must be a string or a number");
}
;
export function _list(obj) {
  var iter = _iter(obj);

  var result = [];

  for (;;) {
    var value = iter.next();
    if (value.done) return result;
    result.push(value.value);
  }
}
;
export function _set(obj) {
  var iter = _iter(obj);

  var result = _emptyset();

  for (;;) {
    var value = iter.next();
    if (value.done) return result;
    result.add(value.value);
  }
}
;
export function _len(sequence) {
  if (typeof sequence == "string" || _islist(sequence)) return sequence.length;else if (_ismap(sequence) || _isset(sequence)) return sequence.size;else if (_isobject(sequence)) {
    var i = 0;

    for (var key in sequence) {
      ++i;
    }

    return i;
  }
  throw new _TypeError("object of type '" + _type(sequence) + "' has no len()");
}
;
export function _type(obj) {
  if (obj === null) return "none";else if (obj === false || obj === true) return "bool";else if (typeof obj === "undefined") return "undefined";else if (typeof obj === "number") return Math.round(obj) == obj ? "int" : "float";else if (typeof obj === "function") return "function";else {
    if (typeof obj.ul4type === "function") return obj.ul4type();else return Protocol.get(obj).ul4type(obj);
  }
}
;
export function _mod(obj1, obj2) {
  var div = Math.floor(obj1 / obj2);
  var mod = obj1 - div * obj2;

  if (mod !== 0 && (obj2 < 0 && mod > 0 || obj2 > 0 && mod < 0)) {
    mod += obj2;
    --div;
  }

  return obj1 - div * obj2;
}
;
export function _getattr(obj, attrname) {
  var default_ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var proto = Protocol.get(obj);

  try {
    return proto.getattr(obj, attrname);
  } catch (exc) {
    if (exc instanceof AttributeError && exc.obj === obj) return default_;else throw exc;
  }
}
;
export function _hasattr(obj, attrname) {
  var proto = Protocol.get(obj);
  return proto.hasattr(obj, attrname);
}
;
export function _dir(obj) {
  var proto = Protocol.get(obj);
  return proto.dir();
}
;
export function _any(iterable) {
  if (typeof iterable == "string") {
    for (var i = 0; i < iterable.length; ++i) {
      if (iterable[i] !== '\x00') return true;
    }

    return false;
  } else {
    for (var iter = _iter(iterable);;) {
      var item = iter.next();
      if (item.done) return false;
      if (_bool(item.value)) return true;
    }
  }
}
;
export function _all(iterable) {
  if (typeof iterable == "string") {
    for (var i = 0; i < iterable.length; ++i) {
      if (iterable[i] === '\x00') return false;
    }

    return true;
  } else {
    for (var iter = _iter(iterable);;) {
      var item = iter.next();
      if (item.done) return true;
      if (!_bool(item.value)) return false;
    }
  }
}
;
export function _isundefined(obj) {
  return typeof obj === "undefined";
}
;
export function _isdefined(obj) {
  return typeof obj !== "undefined";
}
;
export function _isnone(obj) {
  return obj === null;
}
;
export function _isbool(obj) {
  return typeof obj == "boolean";
}
;
export function _isint(obj) {
  return typeof obj == "number" && Math.round(obj) == obj;
}
;
export function _isfloat(obj) {
  return typeof obj == "number" && Math.round(obj) != obj;
}
;
export function _isstr(obj) {
  return typeof obj == "string";
}
;
export function _isdatetime(obj) {
  return Object.prototype.toString.call(obj) == "[object Date]";
}
;
export function _isdate(obj) {
  return obj instanceof Date_;
}
;
export function _iscolor(obj) {
  return obj instanceof Color;
}
;
export function _istimedelta(obj) {
  return obj instanceof TimeDelta;
}
;
export function _ismonthdelta(obj) {
  return obj instanceof MonthDelta;
}
;
export function _istemplate(obj) {
  return obj instanceof Template || obj instanceof TemplateClosure;
}
;
export function _isfunction(obj) {
  return typeof obj === "function" || Object.prototype.toString.call(obj) == "[object Object]" && (obj instanceof Template || obj instanceof TemplateClosure);
}
;
export function _islist(obj) {
  return Object.prototype.toString.call(obj) == "[object Array]";
}
;
export function _isset(obj) {
  return Object.prototype.toString.call(obj) == "[object Set]";
}
;
export function _isexception(obj) {
  return obj instanceof Exception;
}
;
export function _isul4set(obj) {
  return obj instanceof _Set;
}
;
export function _isanyset(obj) {
  return _isset(obj) || _isul4set(obj);
}
;
export function _isiter(obj) {
  return obj !== null && _typeof(obj) === "object" && typeof obj.next === "function";
}
;
export function _isobject(obj) {
  return Object.prototype.toString.call(obj) == "[object Object]" && typeof obj.__type__ === "undefined" && !(obj instanceof Proto);
}
;
export var _ismap = _havemap ? function _ismap(obj) {
  return obj !== null && _typeof(obj) === "object" && _typeof(obj.__proto__) === "object" && obj.__proto__ === Map.prototype;
} : function _ismap(obj) {
  return false;
};
export var _isdict = _havemap ? function _isdict(obj) {
  return _isobject(obj) || _ismap(obj);
} : function _isdict(obj) {
  return _isobject(obj);
};
export function _str_repeat(str, rep) {
  var result = "";

  for (; rep > 0; --rep) {
    result += str;
  }

  return result;
}
;
export function _list_repeat(list, rep) {
  var result = [];

  for (; rep > 0; --rep) {
    for (var i = 0; i < list.length; ++i) {
      result.push(list[i]);
    }
  }

  return result;
}
;

function _str_json(str) {
  var result = "";

  for (var i = 0; i < str.length; ++i) {
    var c = str[i];

    switch (c) {
      case "\r":
        result += "\\r";
        break;

      case "\n":
        result += "\\n";
        break;

      case "\t":
        result += "\\t";
        break;

      case "\\":
        result += "\\\\";
        break;

      case '"':
        result += '\\"';
        break;

      case '<':
        result += "\\u003c";
        break;

      default:
        var code = c.charCodeAt(0);
        if (code >= 32 && code < 128) result += c;else result += "\\u" + _lpad(code.toString(16), "0", 4);
        break;
    }
  }

  return '"' + result + '"';
}

;
export function _asjson(obj) {
  if (obj === null) return "null";else if (typeof obj === "undefined") return "undefined";else if (obj === false) return "false";else if (obj === true) return "true";else if (typeof obj === "string") return _str_json(obj);else if (typeof obj === "number") {
    return "" + obj;
  } else if (_islist(obj)) {
    var v = [];
    v.push("[");

    for (var i = 0; i < obj.length; ++i) {
      if (i != 0) v.push(", ");
      v.push(_asjson(obj[i]));
    }

    v.push("]");
    return v.join("");
  } else if (_ismap(obj)) {
    var _v2 = [];

    _v2.push("{");

    var _i4 = 0;
    obj.forEach(function (value, key) {
      if (_i4++) _v2.push(", ");

      _v2.push(_asjson(key));

      _v2.push(": ");

      _v2.push(_asjson(value));
    });

    _v2.push("}");

    return _v2.join("");
  } else if (_isobject(obj)) {
    var _v3 = [];

    _v3.push("{");

    var _i5 = 0;

    for (var key in obj) {
      if (_i5++) _v3.push(", ");

      _v3.push(_asjson(key));

      _v3.push(": ");

      _v3.push(_asjson(obj[key]));
    }

    _v3.push("}");

    return _v3.join("");
  } else if (_isdate(obj)) {
    return "new ul4.Date_(" + obj._date.getFullYear() + ", " + (obj._date.getMonth() + 1) + ", " + obj._date.getDate() + ")";
  } else if (_isdatetime(obj)) {
    return "new Date(" + obj.getFullYear() + ", " + obj.getMonth() + ", " + obj.getDate() + ", " + obj.getHours() + ", " + obj.getMinutes() + ", " + obj.getSeconds() + ", " + obj.getMilliseconds() + ")";
  } else if (_istimedelta(obj)) {
    return "new ul4.TimeDelta(" + obj._days + ", " + obj._seconds + ", " + obj._microseconds + ")";
  } else if (_ismonthdelta(obj)) {
    return "new ul4.MonthDelta(" + obj._months + ")";
  } else if (_iscolor(obj)) {
    return "new ul4.Color(" + obj._r + ", " + obj._g + ", " + obj._b + ", " + obj._a + ")";
  } else if (_istemplate(obj)) {
    return "ul4.Template.loads(" + _repr2(obj.dumps()) + ")";
  }
  throw new _TypeError("asjson() requires a serializable object");
}
;
export function _fromjson(string) {
  string = StrProtocol.strip(string);
  if (JSON && JSON.parse) return JSON.parse(string);
  if (_rvalidchars.test(string.replace(_rvalidescape, "@").replace(_rvalidtokens, "]").replace(_rvalidbraces, ""))) return new Function("return " + string)();
  throw new _TypeError("invalid JSON");
}
;
export function _asul4on(obj) {
  return dumps(obj);
}
;
export function _fromul4on(string) {
  return _loads(string);
}
;

function _format_datetime(obj, fmt, lang) {
  var translations = {
    de: {
      ms: ["Jan", "Feb", "M\xE4r", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
      ml: ["Januar", "Februar", "M\xE4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
      ws: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      wl: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      xf: "%d.%m.%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    en: {
      ms: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      ml: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      ws: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      wl: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      xf: "%m/%d/%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %I:%M:%S %p"
    },
    fr: {
      ms: ["janv.", "f\xE9vr.", "mars", "avril", "mai", "juin", "juil.", "ao\xFBt", "sept.", "oct.", "nov.", "d\xE9c."],
      ml: ["janvier", "f\xE9vrier", "mars", "avril", "mai", "juin", "juillet", "ao\xFBt", "septembre", "octobre", "novembre", "d\xE9cembre"],
      ws: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
      wl: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
      xf: "%d/%m/%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    es: {
      ms: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
      ml: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
      ws: ["dom", "lun", "mar", "mi\xE9", "jue", "vie", "s\xE1b"],
      wl: ["domingo", "lunes", "martes", "mi\xE9rcoles", "jueves", "viernes", "s\xE1bado"],
      xf: "%d/%m/%y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    it: {
      ms: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
      ml: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
      ws: ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
      wl: ["domenica", "luned\xEC", "marted\xEC", "mercoled\xEC", "gioved\xEC", "venerd\xEC", "sabato"],
      xf: "%d/%m/%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    da: {
      ms: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
      ml: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
      ws: ["s\xF8n", "man", "tir", "ons", "tor", "fre", "l\xF8r"],
      wl: ["s\xF8ndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "l\xF8rdag"],
      xf: "%d-%m-%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    sv: {
      ms: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
      ml: ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
      ws: ["s\xF6n", "m\xE5n", "tis", "ons", "tor", "fre", "l\xF6r"],
      wl: ["s\xF6ndag", "m\xE5ndag", "tisdag", "onsdag", "torsdag", "fredag", "l\xF6rdag"],
      xf: "%Y-%m-%d",
      Xf: "%H.%M.%S",
      cf: "%a %d %b %Y %H.%M.%S"
    },
    nl: {
      ms: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
      ml: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
      ws: ["zo", "ma", "di", "wo", "do", "vr", "za"],
      wl: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
      xf: "%d-%m-%y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    pt: {
      ms: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      ml: ["Janeiro", "Fevereiro", "Mar\xE7o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
      ws: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\xE1b"],
      wl: ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"],
      xf: "%d-%m-%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    cs: {
      ms: ["led", "\xFAno", "b\u0159e", "dub", "kv\u011B", "\u010Den", "\u010Dec", "srp", "z\xE1\u0159", "\u0159\xEDj", "lis", "pro"],
      ml: ["leden", "\xFAnor", "b\u0159ezen", "duben", "kv\u011Bten", "\u010Derven", "\u010Dervenec", "srpen", "z\xE1\u0159\xED", "\u0159\xEDjen", "listopad", "prosinec"],
      ws: ["Ne", "Po", "\xDAt", "St", "\u010Ct", "P\xE1", "So"],
      wl: ["Ned\u011Ble", "Pond\u011Bl\xED", "\xDAter\xFD", "St\u0159eda", "\u010Ctvrtek", "P\xE1tek", "Sobota"],
      xf: "%d.%m.%Y",
      Xf: "%H:%M:%S",
      cf: "%a\xA0%d.\xA0%B\xA0%Y,\xA0%H:%M:%S"
    },
    sk: {
      ms: ["jan", "feb", "mar", "apr", "m\xE1j", "j\xFAn", "j\xFAl", "aug", "sep", "okt", "nov", "dec"],
      ml: ["janu\xE1r", "febru\xE1r", "marec", "apr\xEDl", "m\xE1j", "j\xFAn", "j\xFAl", "august", "september", "okt\xF3ber", "november", "december"],
      ws: ["Ne", "Po", "Ut", "St", "\u0160t", "Pi", "So"],
      wl: ["Nede\u013Ea", "Pondelok", "Utorok", "Streda", "\u0160tvrtok", "Piatok", "Sobota"],
      xf: "%d.%m.%Y",
      Xf: "%H:%M:%S",
      cf: "%a\xA0%d.\xA0%B\xA0%Y,\xA0%H:%M:%S"
    },
    pl: {
      ms: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "pa\u017A", "lis", "gru"],
      ml: ["stycze\u0144", "luty", "marzec", "kwiecie\u0144", "maj", "czerwiec", "lipiec", "sierpie\u0144", "wrzesie\u0144", "pa\u017Adziernik", "listopad", "grudzie\u0144"],
      ws: ["nie", "pon", "wto", "\u015Bro", "czw", "pi\u0105", "sob"],
      wl: ["niedziela", "poniedzia\u0142ek", "wtorek", "\u015Broda", "czwartek", "pi\u0105tek", "sobota"],
      xf: "%d.%m.%Y",
      Xf: "%H:%M:%S",
      cf: "%a, %d %b %Y, %H:%M:%S"
    },
    hr: {
      ms: ["Sij", "Vel", "O\u017Eu", "Tra", "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro"],
      ml: ["Sije\u010Danj", "Velja\u010Da", "O\u017Eujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"],
      ws: ["Ned", "Pon", "Uto", "Sri", "\u010Cet", "Pet", "Sub"],
      wl: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "\u010Cetvrtak", "Petak", "Subota"],
      xf: "%d.%m.%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    sr: {
      ms: ["\u0458\u0430\u043D", "\u0444\u0435\u0431", "\u043C\u0430\u0440", "\u0430\u043F\u0440", "\u043C\u0430\u0458", "\u0458\u0443\u043D", "\u0458\u0443\u043B", "\u0430\u0432\u0433", "\u0441\u0435\u043F", "\u043E\u043A\u0442", "\u043D\u043E\u0432", "\u0434\u0435\u0446"],
      ml: ["\u0458\u0430\u043D\u0443\u0430\u0440", "\u0444\u0435\u0431\u0440\u0443\u0430\u0440", "\u043C\u0430\u0440\u0442", "\u0430\u043F\u0440\u0438\u043B", "\u043C\u0430\u0458", "\u0458\u0443\u043D", "\u0458\u0443\u043B", "\u0430\u0432\u0433\u0443\u0441\u0442", "\u0441\u0435\u043F\u0442\u0435\u043C\u0431\u0430\u0440", "\u043E\u043A\u0442\u043E\u0431\u0430\u0440", "\u043D\u043E\u0432\u0435\u043C\u0431\u0430\u0440", "\u0434\u0435\u0446\u0435\u043C\u0431\u0430\u0440"],
      ws: ["\u043D\u0435\u0434", "\u043F\u043E\u043D", "\u0443\u0442\u043E", "\u0441\u0440\u0435", "\u0447\u0435\u0442", "\u043F\u0435\u0442", "\u0441\u0443\u0431"],
      wl: ["\u043D\u0435\u0434\u0435\u0459\u0430", "\u043F\u043E\u043D\u0435\u0434\u0435\u0459\u0430\u043A", "\u0443\u0442\u043E\u0440\u0430\u043A", "\u0441\u0440\u0435\u0434\u0430", "\u0447\u0435\u0442\u0432\u0440\u0442\u0430\u043A", "\u043F\u0435\u0442\u0430\u043A", "\u0441\u0443\u0431\u043E\u0442\u0430"],
      xf: "%d.%m.%Y.",
      Xf: "%H:%M:%S",
      cf: "%A, %d. %B %Y. %H:%M:%S"
    },
    ro: {
      ms: ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"],
      ml: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
      ws: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sb"],
      wl: ["duminic\u0103", "luni", "mar\u0163i", "miercuri", "joi", "vineri", "s\xE2mb\u0103t\u0103"],
      xf: "%d.%m.%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    hu: {
      ms: ["jan", "febr", "m\xE1rc", "\xE1pr", "m\xE1j", "j\xFAn", "j\xFAl", "aug", "szept", "okt", "nov", "dec"],
      ml: ["janu\xE1r", "febru\xE1r", "m\xE1rcius", "\xE1prilis", "m\xE1jus", "j\xFAnius", "j\xFAlius", "augusztus", "szeptember", "okt\xF3ber", "november", "december"],
      ws: ["v", "h", "k", "sze", "cs", "p", "szo"],
      wl: ["vas\xE1rnap", "h\xE9tf\u0151", "kedd", "szerda", "cs\xFCt\xF6rt\xF6k", "p\xE9ntek", "szombat"],
      xf: "%Y-%m-%d",
      Xf: "%H.%M.%S",
      cf: "%Y. %b. %d., %A, %H.%M.%S"
    },
    tr: {
      ms: ["Oca", "\u015Eub", "Mar", "Nis", "May", "Haz", "Tem", "A\u011Fu", "Eyl", "Eki", "Kas", "Ara"],
      ml: ["Ocak", "\u015Eubat", "Mart", "Nisan", "May\u0131s", "Haziran", "Temmuz", "A\u011Fustos", "Eyl\xFCl", "Ekim", "Kas\u0131m", "Aral\u0131k"],
      ws: ["Paz", "Pzt", "Sal", "\xC7r\u015F", "Pr\u015F", "Cum", "Cts"],
      wl: ["Pazar", "Pazartesi", "Sal\u0131", "\xC7ar\u015Famba", "Per\u015Fembe", "Cuma", "Cumartesi"],
      xf: "%d-%m-%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    ru: {
      ms: ["\u042F\u043D\u0432", "\u0424\u0435\u0432", "\u041C\u0430\u0440", "\u0410\u043F\u0440", "\u041C\u0430\u0439", "\u0418\u044E\u043D", "\u0418\u044E\u043B", "\u0410\u0432\u0433", "\u0421\u0435\u043D", "\u041E\u043A\u0442", "\u041D\u043E\u044F", "\u0414\u0435\u043A"],
      ml: ["\u042F\u043D\u0432\u0430\u0440\u044C", "\u0424\u0435\u0432\u0440\u0430\u043B\u044C", "\u041C\u0430\u0440\u0442", "\u0410\u043F\u0440\u0435\u043B\u044C", "\u041C\u0430\u0439", "\u0418\u044E\u043D\u044C", "\u0418\u044E\u043B\u044C", "\u0410\u0432\u0433\u0443\u0441\u0442", "\u0421\u0435\u043D\u0442\u044F\u0431\u0440\u044C", "\u041E\u043A\u0442\u044F\u0431\u0440\u044C", "\u041D\u043E\u044F\u0431\u0440\u044C", "\u0414\u0435\u043A\u0430\u0431\u0440\u044C"],
      ws: ["\u0412\u0441\u043A", "\u041F\u043D\u0434", "\u0412\u0442\u0440", "\u0421\u0440\u0434", "\u0427\u0442\u0432", "\u041F\u0442\u043D", "\u0421\u0431\u0442"],
      wl: ["\u0412\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435", "\u041F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A", "\u0412\u0442\u043E\u0440\u043D\u0438\u043A", "\u0421\u0440\u0435\u0434\u0430", "\u0427\u0435\u0442\u0432\u0435\u0440\u0433", "\u041F\u044F\u0442\u043D\u0438\u0446\u0430", "\u0421\u0443\u0431\u0431\u043E\u0442\u0430"],
      xf: "%d.%m.%Y",
      Xf: "%H:%M:%S",
      cf: "%a %d %b %Y %H:%M:%S"
    },
    zh: {
      ms: [" 1\u6708", " 2\u6708", " 3\u6708", " 4\u6708", " 5\u6708", " 6\u6708", " 7\u6708", " 8\u6708", " 9\u6708", "10\u6708", "11\u6708", "12\u6708"],
      ml: ["\u4E00\u6708", "\u4E8C\u6708", "\u4E09\u6708", "\u56DB\u6708", "\u4E94\u6708", "\u516D\u6708", "\u4E03\u6708", "\u516B\u6708", "\u4E5D\u6708", "\u5341\u6708", "\u5341\u4E00\u6708", "\u5341\u4E8C\u6708"],
      ws: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
      wl: ["\u661F\u671F\u65E5", "\u661F\u671F\u4E00", "\u661F\u671F\u4E8C", "\u661F\u671F\u4E09", "\u661F\u671F\u56DB", "\u661F\u671F\u4E94", "\u661F\u671F\u516D"],
      xf: "%Y\u5E74%b%d\u65E5",
      Xf: "%H\u65F6%M\u5206%S\u79D2",
      cf: "%Y\u5E74%b%d\u65E5 %A %H\u65F6%M\u5206%S\u79D2"
    },
    ko: {
      ms: [" 1\uC6D4", " 2\uC6D4", " 3\uC6D4", " 4\uC6D4", " 5\uC6D4", " 6\uC6D4", " 7\uC6D4", " 8\uC6D4", " 9\uC6D4", "10\uC6D4", "11\uC6D4", "12\uC6D4"],
      ml: ["1\uC6D4", "2\uC6D4", "3\uC6D4", "4\uC6D4", "5\uC6D4", "6\uC6D4", "7\uC6D4", "8\uC6D4", "9\uC6D4", "10\uC6D4", "11\uC6D4", "12\uC6D4"],
      ws: ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"],
      wl: ["\uC77C\uC694\uC77C", "\uC6D4\uC694\uC77C", "\uD654\uC694\uC77C", "\uC218\uC694\uC77C", "\uBAA9\uC694\uC77C", "\uAE08\uC694\uC77C", "\uD1A0\uC694\uC77C"],
      xf: "%Y\uB144 %B %d\uC77C",
      Xf: "%H\uC2DC %M\uBD84 %S\uCD08",
      cf: "%Y\uB144 %B %d\uC77C (%a) %p %I\uC2DC %M\uBD84 %S\uCD08"
    },
    ja: {
      ms: [" 1\u6708", " 2\u6708", " 3\u6708", " 4\u6708", " 5\u6708", " 6\u6708", " 7\u6708", " 8\u6708", " 9\u6708", "10\u6708", "11\u6708", "12\u6708"],
      ml: ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],
      ws: ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"],
      wl: ["\u65E5\u66DC\u65E5", "\u6708\u66DC\u65E5", "\u706B\u66DC\u65E5", "\u6C34\u66DC\u65E5", "\u6728\u66DC\u65E5", "\u91D1\u66DC\u65E5", "\u571F\u66DC\u65E5"],
      xf: "%Y\u5E74%B%d\u65E5",
      Xf: "%H\u6642%M\u5206%S\u79D2",
      cf: "%Y\u5E74%B%d\u65E5 %H\u6642%M\u5206%S\u79D2"
    }
  };
  var translation = translations[lang];
  var result = [];
  var inspec = false;

  for (var i = 0; i < fmt.length; ++i) {
    var c = fmt[i];

    if (inspec) {
      switch (c) {
        case "a":
          c = translation.ws[obj.getDay()];
          break;

        case "A":
          c = translation.wl[obj.getDay()];
          break;

        case "b":
          c = translation.ms[obj.getMonth()];
          break;

        case "B":
          c = translation.ml[obj.getMonth()];
          break;

        case "c":
          c = _format(obj, translation.cf, lang);
          break;

        case "d":
          c = _lpad(obj.getDate(), "0", 2);
          break;

        case "f":
          c = _lpad(obj.getMilliseconds(), "0", 3) + "000";
          break;

        case "H":
          c = _lpad(obj.getHours(), "0", 2);
          break;

        case "I":
          c = _lpad((obj.getHours() - 1) % 12 + 1, "0", 2);
          break;

        case "j":
          c = _lpad(DateTimeProtocol.yearday(obj), "0", 3);
          break;

        case "m":
          c = _lpad(obj.getMonth() + 1, "0", 2);
          break;

        case "M":
          c = _lpad(obj.getMinutes(), "0", 2);
          break;

        case "p":
          c = obj.getHours() < 12 ? "AM" : "PM";
          break;

        case "S":
          c = _lpad(obj.getSeconds(), "0", 2);
          break;

        case "U":
          c = _lpad(_week4format(obj, 6), "0", 2);
          break;

        case "w":
          c = obj.getDay();
          break;

        case "W":
          c = _lpad(_week4format(obj, 0), "0", 2);
          break;

        case "x":
          c = _format(obj, translation.xf, lang);
          break;

        case "X":
          c = _format(obj, translation.Xf, lang);
          break;

        case "y":
          c = (obj.getFullYear() % 100).toString();
          break;

        case "Y":
          c = obj.getFullYear().toString();
          break;

        case "z":
          c = "";
          break;

        case "Z":
          c = "";
          break;
      }

      result.push(c);
      inspec = false;
    } else {
      if (c == "%") inspec = true;else result.push(c);
    }
  }

  return result.join("");
}

;

function _format_int(obj, fmt, lang) {
  var work = fmt;
  var fill = ' ';
  var align = '>';
  var sign = '-';
  var alternate = false;
  var minimumwidth = 0;
  var type = 'd';

  if (/[bcdoxXn]$/.test(work)) {
    type = work.substring(work.length - 1);
    work = work.substring(0, work.length - 1);
  }

  if (/\d+$/.test(work)) {
    var minimumwidthStr = /\d+$/.exec(work);
    work = work.replace(/\d+$/, "");

    if (/^0/.test(minimumwidthStr)) {
      align = '=';
      fill = '0';
    }

    minimumwidth = parseInt(minimumwidthStr);
  }

  if (/#$/.test(work)) {
    alternate = true;
    work = work.substring(0, work.length - 1);
  }

  if (/[+ -]$/.test(work)) {
    if (type == 'c') throw new ValueError("sign not allowed for integer format type 'c'");
    sign = work.substring(work.length - 1);
    work = work.substring(0, work.length - 1);
  }

  if (work.length >= 3) throw new ValueError("illegal integer format string " + _repr2(fmt));else if (work.length == 2) {
    if (/[<>=^]$/.test(work)) {
      align = work[1];
      fill = work[0];
    } else throw new ValueError("illegal integer format string " + _repr2(fmt));
  } else if (work.length == 1) {
    if (/^[<>=^]$/.test(work)) align = work;else throw new ValueError("illegal integer format string " + _repr2(fmt));
  }
  var neg = obj < 0;
  if (neg) obj = -obj;
  var output;

  switch (type) {
    case 'b':
      output = obj.toString(2);
      break;

    case 'c':
      if (neg || obj > 65535) throw new ValueError("value out of bounds for c format");
      output = String.fromCharCode(obj);
      break;

    case 'd':
      output = obj.toString();
      break;

    case 'o':
      output = obj.toString(8);
      break;

    case 'x':
      output = obj.toString(16);
      break;

    case 'X':
      output = obj.toString(16).toUpperCase();
      break;

    case 'n':
      output = obj.toString();
      break;
  }

  if (align === '=') {
    if (neg || sign !== '-') --minimumwidth;
    if (alternate && (type === 'b' || type === 'o' || type === 'x' || type === 'X')) minimumwidth -= 2;
    if (output.length < minimumwidth) output = _str_repeat(fill, minimumwidth - output.length) + output;
    if (alternate && (type === 'b' || type === 'o' || type === 'x' || type === 'X')) output = "0" + type + output;
    if (neg) output = "-" + output;else if (sign != '-') output = sign + output;
  } else {
    if (alternate && (type == 'b' || type == 'o' || type == 'x' || type == 'X')) output = "0" + type + output;
    if (neg) output = "-" + output;else if (sign != '-') output = sign + output;

    if (output.length < minimumwidth) {
      if (align == '<') output = output + _str_repeat(fill, minimumwidth - output.length);else if (align == '>') output = _str_repeat(fill, minimumwidth - output.length) + output;else {
          var pad = minimumwidth - output.length;
          var padBefore = Math.floor(pad / 2);
          var padAfter = pad - padBefore;
          output = _str_repeat(fill, padBefore) + output + _str_repeat(fill, padAfter);
        }
    }
  }

  return output;
}

;
export function _format(obj, fmt, lang) {
  if (typeof lang === "undefined" || lang === null) lang = "en";else {
    var translations = {
      de: null,
      en: null,
      fr: null,
      es: null,
      it: null,
      da: null,
      sv: null,
      nl: null,
      pt: null,
      cs: null,
      sk: null,
      pl: null,
      hr: null,
      sr: null,
      ro: null,
      hu: null,
      tr: null,
      ru: null,
      zh: null,
      ko: null,
      ja: null
    };
    lang = lang.toLowerCase();

    if (typeof translations[lang] === "undefined") {
      lang = lang.split(/_/)[0];
      if (typeof translations[lang] === "undefined") lang = "en";
    }
  }
  if (_isdate(obj)) return _format_datetime(obj._date, fmt, lang);
  if (_isdatetime(obj)) return _format_datetime(obj, fmt, lang);else if (_isint(obj)) return _format_int(obj, fmt, lang);else if (obj === true) return _format_int(1, fmt, lang);else if (obj === false) return _format_int(0, fmt, lang);
}
;
export function _lpad(string, pad, len) {
  if (typeof string === "number") string = string.toString();

  while (string.length < len) {
    string = pad + string;
  }

  return string;
}
;
export function _rpad(string, pad, len) {
  if (typeof string === "number") string = string.toString();

  while (string.length < len) {
    string = string + pad;
  }

  return string;
}
;
var _nextid = 1;
export var Proto = function () {
  function Proto() {
    _classCallCheck(this, Proto);

    this.__id__ = _nextid++;
  }

  _createClass(Proto, [{
    key: "ul4type",
    value: function ul4type() {
      return this.constructor.name;
    }
  }, {
    key: "__eq__",
    value: function __eq__(other) {
      return this === other;
    }
  }, {
    key: "__ne__",
    value: function __ne__(other) {
      return !this.__eq__(other);
    }
  }, {
    key: "__bool__",
    value: function __bool__() {
      return true;
    }
  }]);

  return Proto;
}();
;
export var Signature = function (_Proto) {
  _inherits(Signature, _Proto);

  function Signature() {
    var _this;

    _classCallCheck(this, Signature);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Signature).call(this));
    _this.args = [];
    _this.argNames = {};
    _this.remargs = null;
    _this.remkwargs = null;
    var nextDefault = false;
    var lastArgname = null;

    for (var i = 0; i < arguments.length; ++i) {
      var argName = i < 0 || arguments.length <= i ? undefined : arguments[i];

      if (nextDefault) {
        _this.args.push({
          name: lastArgname,
          defaultValue: argName
        });

        _this.argNames[lastArgname] = true;
        nextDefault = false;
      } else {
        if (argName.substr(argName.length - 1) === "=") {
          lastArgname = argName.substr(0, argName.length - 1);
          nextDefault = true;
        } else if (argName.substr(0, 2) === "**") _this.remkwargs = argName.substr(2);else if (argName.substr(0, 1) === "*") _this.remargs = argName.substr(1);else {
          _this.args.push({
            name: argName
          });

          _this.argNames[argName] = true;
        }
      }
    }

    return _this;
  }

  _createClass(Signature, [{
    key: "bindArray",
    value: function bindArray(name, args, kwargs) {
      var finalargs = [];
      var decname = name !== null ? name + "() " : "";

      for (var i = 0; i < this.args.length; ++i) {
        var arg = this.args[i];

        if (i < args.length) {
          if (kwargs.hasOwnProperty(arg.name)) throw new ArgumentError(decname + "argument " + _repr2(arg.name) + " (position " + i + ") specified multiple times");
          finalargs.push(args[i]);
        } else {
          if (kwargs.hasOwnProperty(arg.name)) finalargs.push(kwargs[arg.name]);else {
            if (arg.hasOwnProperty("defaultValue")) finalargs.push(arg.defaultValue);else throw new ArgumentError("required " + decname + "argument " + _repr2(arg.name) + " (position " + i + ") missing");
          }
        }
      }

      if (this.remargs === null) {
        if (args.length > this.args.length) {
          var prefix = name === null ? "expected" : name + "() expects";
          throw new ArgumentError(prefix + " at most " + this.args.length + " positional argument" + (this.args.length != 1 ? "s" : "") + ", " + args.length + " given");
        }
      } else {
        finalargs.push(args.slice(this.args.length));
      }

      if (this.remkwargs === null) {
        for (var key in kwargs) {
          if (!this.argNames[key]) {
            if (name === null) throw new ArgumentError("an argument named " + _repr2(key) + " isn't supported");else throw new ArgumentError(name + "() doesn't support an argument named " + _repr2(key));
          }
        }
      } else {
        var remkwargs = _emptymap();

        for (var _key7 in kwargs) {
          if (!this.argNames[_key7]) _setmap(remkwargs, _key7, kwargs[_key7]);
        }

        finalargs.push(remkwargs);
      }

      return finalargs;
    }
  }, {
    key: "bindObject",
    value: function bindObject(name, args, kwargs) {
      args = this.bindArray(name, args, kwargs);
      var argObject = {};
      var i;

      for (i = 0; i < this.args.length; ++i) {
        argObject[this.args[i].name] = args[i];
      }

      if (this.remargs !== null) argObject[this.remargs] = args[i++];
      if (this.remkwargs !== null) argObject[this.remkwargs] = args[i++];
      return argObject;
    }
  }, {
    key: "__repr__",
    value: function __repr__() {
      return "<Signature " + this.toString() + ">";
    }
  }, {
    key: "__str__",
    value: function __str__() {
      return this.toString();
    }
  }, {
    key: "toString",
    value: function toString() {
      var v = [];

      for (var i = 0; i < this.args.length; ++i) {
        var arg = this.args[i];
        if (arg.hasOwnProperty("defaultValue")) v.push(arg.name + "=" + _repr2(arg.defaultValue));else v.push(arg.name);
      }

      if (this.remargs !== null) v.push("*" + this.remargs);
      if (this.remkwargs !== null) v.push("**" + this.remkwargs);
      return "(" + v.join(", ") + ")";
    }
  }]);

  return Signature;
}(Proto);
;
export var _Set = function () {
  function _Set() {
    _classCallCheck(this, _Set);

    this.items = {};
    this.add.apply(this, arguments);
  }

  _createClass(_Set, [{
    key: "add",
    value: function add() {
      for (var _len2 = arguments.length, items = new Array(_len2), _key8 = 0; _key8 < _len2; _key8++) {
        items[_key8] = arguments[_key8];
      }

      for (var i = 0; i < items.length; ++i) {
        this.items[items[i]] = true;
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.items = {};
    }
  }, {
    key: "__getattr__",
    value: function __getattr__(attrname) {
      var self = this;

      switch (attrname) {
        case "add":
          return expose(function add(items) {
            self.add.apply(self, _toConsumableArray(items));
          }, ["*items"]);

        default:
          throw new AttributeError(this, attrname);
      }
    }
  }, {
    key: "__contains__",
    value: function __contains__(item) {
      return this.items[item] || false;
    }
  }, {
    key: "has",
    value: function has(item) {
      return this.items[item] || false;
    }
  }, {
    key: "__bool__",
    value: function __bool__() {
      for (var item in this.items) {
        if (!this.items.hasOwnProperty(item)) continue;
        return true;
      }

      return false;
    }
  }, {
    key: "__repr__",
    value: function __repr__() {
      var v = [];
      v.push("{");
      var i = 0;

      for (var item in this.items) {
        if (!this.items.hasOwnProperty(item)) continue;
        if (i++) v.push(", ");
        v.push(_repr2(item));
      }

      if (!i) v.push("/");
      v.push("}");
      return v.join("");
    }
  }, {
    key: "__eq__",
    value: function __eq__(other) {
      if (_isset(other)) {
        var count = 0;

        for (var item in this.items) {
          if (!other.has(item)) return false;
          ++count;
        }

        return other.size == count;
      } else if (_isul4set(other)) {
        var _count2 = 0;

        for (var _item2 in this.items) {
          if (!other[_item2]) return false;
          ++_count2;
        }

        for (var _item3 in other.items) {
          --_count2;
        }

        return _count2 == 0;
      } else return false;
    }
  }, {
    key: "__le__",
    value: function __le__(other) {
      if (_isset(other)) {
        var count = 0;

        for (var item in this.items) {
          if (!other.has(item)) return false;
        }

        return true;
      } else if (_isul4set(other)) {
        var _count3 = 0;

        for (var _item4 in this.items) {
          if (!other.items[_item4]) return false;
        }

        return true;
      } else _unorderable("<", this, other);
    }
  }, {
    key: "__ge__",
    value: function __ge__(other) {
      if (_isset(other)) {
        other.forEach(function (value) {
          if (!this.items[value]) return false;
        }, this);
        return true;
      } else if (_isul4set(other)) {
        var count = 0;

        for (var key in other.items) {
          if (!this.items[key]) return false;
        }

        return true;
      } else _unorderable("<=", this, other);
    }
  }]);

  return _Set;
}();
;
_Set.prototype.__type__ = "set";
export function expose(f, signature, options) {
  options = options || {};
  if (options.name) f._ul4_name = options.name;
  if (_islist(signature)) signature = _construct(Signature, _toConsumableArray(signature));
  f._ul4_signature = signature;
  f._ul4_needsobject = options.needsobject || false;
  f._ul4_needscontext = options.needscontext || false;
}
;
export function _extend(baseobj, attrs) {
  return _extends(Object.create(baseobj), attrs);
}
;
export var Protocol = {
  attrs: _emptyset(),
  ul4type: function ul4type() {
    return "Protocol";
  },
  dir: function dir() {
    return this.attrs;
  },
  get: function get(obj) {
    if (_isstr(obj)) return StrProtocol;else if (_islist(obj)) return ListProtocol;else if (_isdate(obj)) return DateProtocol;else if (_isset(obj)) return SetProtocol;else if (_ismap(obj)) return MapProtocol;else if (_isdatetime(obj)) return DateTimeProtocol;else if (_isobject(obj)) return ObjectProtocol;else return Protocol;
  },
  getattr: function getattr(obj, attrname) {
    if (obj === null || typeof obj === "undefined") throw new AttributeError(obj, attrname);else if (typeof obj.__getattr__ === "function") return obj.__getattr__(attrname);else if (this.attrs.has(attrname)) {
      var attr = this[attrname];

      var realattr = function realattr() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key9 = 0; _key9 < _len3; _key9++) {
          args[_key9] = arguments[_key9];
        }

        return attr.apply(this, [obj].concat(args));
      };

      realattr._ul4_name = attr._ul4_name || attr.name;
      realattr._ul4_signature = attr._ul4_signature;
      realattr._ul4_needsobject = attr._ul4_needsobject;
      realattr._ul4_needscontext = attr._ul4_needscontext;
      return realattr;
    } else throw new AttributeError(obj, attrname);
  },
  hasattr: function hasattr(obj, attrname) {
    if (obj === null || typeof obj === "undefined") return false;else if (typeof obj.__getattr__ === "function") {
      try {
        obj.__getattr__(attrname);

        return true;
      } catch (exc) {
        if (exc instanceof AttributeError && exc.obj === object) return false;else throw exc;
      }
    } else return this.attrs.has(attrname);
  }
};
export var StrProtocol = _extend(Protocol, {
  attrs: _makeset("split", "rsplit", "splitlines", "strip", "lstrip", "rstrip", "upper", "lower", "capitalize", "startswith", "endswith", "replace", "count", "find", "rfind", "join"),
  ul4type: function ul4type(obj) {
    return "str";
  },
  count: function count(obj, sub) {
    var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    return _count(obj, sub, start, end);
  },
  find: function find(obj, sub) {
    var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    return _find(obj, sub, start, end);
  },
  rfind: function rfind(obj, sub) {
    var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    return _rfind(obj, sub, start, end);
  },
  replace: function replace(obj, old, new_) {
    var count = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    if (count === null) count = obj.length;
    var result = [];

    while (obj.length) {
      var pos = obj.indexOf(old);

      if (pos === -1 || !count--) {
        result.push(obj);
        break;
      }

      result.push(obj.substr(0, pos));
      result.push(new_);
      obj = obj.substr(pos + old.length);
    }

    return result.join("");
  },
  strip: function strip(obj) {
    var chars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    chars = chars || " \r\n\t";
    if (typeof chars !== "string") throw new _TypeError("strip() requires a string argument");

    while (obj && chars.indexOf(obj[0]) >= 0) {
      obj = obj.substr(1);
    }

    while (obj && chars.indexOf(obj[obj.length - 1]) >= 0) {
      obj = obj.substr(0, obj.length - 1);
    }

    return obj;
  },
  lstrip: function lstrip(obj) {
    var chars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    chars = chars || " \r\n\t";
    if (typeof chars !== "string") throw new _TypeError("lstrip() requires a string argument");

    while (obj && chars.indexOf(obj[0]) >= 0) {
      obj = obj.substr(1);
    }

    return obj;
  },
  rstrip: function rstrip(obj) {
    var chars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    chars = chars || " \r\n\t";
    if (typeof chars !== "string") throw new _TypeError("rstrip() requires a string argument");

    while (obj && chars.indexOf(obj[obj.length - 1]) >= 0) {
      obj = obj.substr(0, obj.length - 1);
    }

    return obj;
  },
  split: function split(obj) {
    var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (sep !== null && typeof sep !== "string") throw new _TypeError("split() requires a string");

    if (count === null) {
      var result = obj.split(sep !== null ? sep : /[ \n\r\t]+/);

      if (sep === null) {
        if (result.length && !result[0].length) result.splice(0, 1);
        if (result.length && !result[result.length - 1].length) result.splice(-1);
      }

      return result;
    } else {
      if (sep !== null) {
        var _result3 = [];

        while (obj.length) {
          var pos = obj.indexOf(sep);

          if (pos === -1 || !count--) {
            _result3.push(obj);

            break;
          }

          _result3.push(obj.substr(0, pos));

          obj = obj.substr(pos + sep.length);
        }

        return _result3;
      } else {
        var _result4 = [];

        while (obj.length) {
          obj = StrProtocol.lstrip(obj, null);
          var part = void 0;
          if (!count--) part = obj;else part = obj.split(/[ \n\r\t]+/, 1)[0];
          if (part.length) _result4.push(part);
          obj = obj.substr(part.length);
        }

        return _result4;
      }
    }
  },
  rsplit: function rsplit(obj) {
    var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (sep !== null && typeof sep !== "string") throw new _TypeError("rsplit() requires a string as second argument");

    if (count === null) {
      var result = obj.split(sep !== null ? sep : /[ \n\r\t]+/);

      if (sep === null) {
        if (result.length && !result[0].length) result.splice(0, 1);
        if (result.length && !result[result.length - 1].length) result.splice(-1);
      }

      return result;
    } else {
      if (sep !== null) {
        var _result5 = [];

        while (obj.length) {
          var pos = obj.lastIndexOf(sep);

          if (pos === -1 || !count--) {
            _result5.unshift(obj);

            break;
          }

          _result5.unshift(obj.substr(pos + sep.length));

          obj = obj.substr(0, pos);
        }

        return _result5;
      } else {
        var _result6 = [];

        while (obj.length) {
          obj = StrProtocol.rstrip(obj);
          var part = void 0;
          if (!count--) part = obj;else {
              part = obj.split(/[ \n\r\t]+/);
              part = part[part.length - 1];
            }
          if (part.length) _result6.unshift(part);
          obj = obj.substr(0, obj.length - part.length);
        }

        return _result6;
      }
    }
  },
  splitlines: function splitlines(obj) {
    var keepends = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var pos = 0;
    var startpos;

    var lookingAtLineEnd = function lookingAtLineEnd() {
      var c = obj[pos];
      if (c === '\n' || c == "\x0B" || c == "\f" || c == "\x1C" || c == "\x1D" || c == "\x1E" || c == "\x85" || c == "\u2028" || c == "\u2029") return 1;

      if (c === '\r') {
        if (pos == length - 1) return 1;
        if (obj[pos + 1] === '\n') return 2;
        return 1;
      }

      return 0;
    };

    var result = [],
        length = obj.length;

    for (pos = 0, startpos = 0;;) {
      if (pos >= length) {
        if (startpos != pos) result.push(obj.substring(startpos));
        return result;
      }

      var lineendlen = lookingAtLineEnd();
      if (!lineendlen) ++pos;else {
        var endpos = pos + (keepends ? lineendlen : 0);
        result.push(obj.substring(startpos, endpos));
        pos += lineendlen;
        startpos = pos;
      }
    }
  },
  lower: function lower(obj) {
    return obj.toLowerCase();
  },
  upper: function upper(obj) {
    return obj.toUpperCase();
  },
  capitalize: function capitalize(obj) {
    if (obj.length) obj = obj[0].toUpperCase() + obj.slice(1).toLowerCase();
    return obj;
  },
  join: function join(obj, iterable) {
    var resultlist = [];

    for (var iter = _iter(iterable);;) {
      var item = iter.next();
      if (item.done) break;
      resultlist.push(item.value);
    }

    return resultlist.join(obj);
  },
  startswith: function startswith(obj, prefix) {
    if (typeof prefix === "string") return obj.substr(0, prefix.length) === prefix;else if (_islist(prefix)) {
      for (var i = 0; i < prefix.length; ++i) {
        var singlepre = prefix[i];
        if (obj.substr(0, singlepre.length) === singlepre) return true;
      }

      return false;
    } else throw new _TypeError("startswith() argument must be string");
  },
  endswith: function endswith(obj, suffix) {
    if (typeof suffix === "string") return obj.substr(obj.length - suffix.length) === suffix;else if (_islist(suffix)) {
      for (var i = 0; i < suffix.length; ++i) {
        var singlesuf = suffix[i];
        if (obj.substr(obj.length - singlesuf.length) === singlesuf) return true;
      }

      return false;
    } else throw new _TypeError("endswith() argument must be string or list of strings");
  }
});
expose(StrProtocol.count, ["sub", "start=", null, "end=", null]);
expose(StrProtocol.find, ["sub", "start=", null, "end=", null]);
expose(StrProtocol.rfind, ["sub", "start=", null, "end=", null]);
expose(StrProtocol.replace, ["old", "new", "count=", null]);
expose(StrProtocol.strip, ["chars=", null]);
expose(StrProtocol.lstrip, ["chars=", null]);
expose(StrProtocol.rstrip, ["chars=", null]);
expose(StrProtocol.split, ["sep=", null, "count=", null]);
expose(StrProtocol.rsplit, ["sep=", null, "count=", null]);
expose(StrProtocol.splitlines, ["keepends=", false]);
expose(StrProtocol.lower, []);
expose(StrProtocol.upper, []);
expose(StrProtocol.capitalize, []);
expose(StrProtocol.join, ["iterable"]);
expose(StrProtocol.startswith, ["prefix"]);
expose(StrProtocol.endswith, ["suffix"]);
export var ListProtocol = _extend(Protocol, {
  attrs: _makeset("append", "insert", "pop", "count", "find", "rfind"),
  ul4type: function ul4type(obj) {
    return "list";
  },
  append: function append(obj, items) {
    for (var i = 0; i < items.length; ++i) {
      obj.push(items[i]);
    }

    return null;
  },
  insert: function insert(obj, pos, items) {
    if (pos < 0) pos += obj.length;

    for (var i = 0; i < items.length; ++i) {
      obj.splice(pos++, 0, items[i]);
    }

    return null;
  },
  pop: function pop(obj, pos) {
    if (pos < 0) pos += obj.length;
    var result = obj[pos];
    obj.splice(pos, 1);
    return result;
  },
  count: function count(obj, sub) {
    var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    return _count(obj, sub, start, end);
  },
  find: function find(obj, sub) {
    var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    return _find(obj, sub, start, end);
  },
  rfind: function rfind(obj, sub) {
    var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    return _rfind(obj, sub, start, end);
  }
});
expose(ListProtocol.append, ["*items"]);
expose(ListProtocol.insert, ["pos", "*items"]);
expose(ListProtocol.pop, ["pos=", -1]);
expose(ListProtocol.count, ["sub", "start=", null, "end=", null]);
expose(ListProtocol.find, ["sub", "start=", null, "end=", null]);
expose(ListProtocol.rfind, ["sub", "start=", null, "end=", null]);
export var MapProtocol = _extend(Protocol, {
  attrs: _makeset("get", "items", "values", "update", "clear"),
  ul4type: function ul4type(obj) {
    return "dict";
  },
  getattr: function getattr(obj, attrname) {
    if (this.attrs.has(attrname)) {
      var attr = this[attrname];

      var realattr = function realattr() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key10 = 0; _key10 < _len4; _key10++) {
          args[_key10] = arguments[_key10];
        }

        return attr.apply(this, [obj].concat(args));
      };

      realattr._ul4_name = attr._ul4_name || attr.name;
      realattr._ul4_signature = attr._ul4_signature;
      realattr._ul4_needsobject = attr._ul4_needsobject;
      realattr._ul4_needscontext = attr._ul4_needscontext;
      return realattr;
    } else return obj.get(attrname);
  },
  get: function get(obj, key) {
    var default_ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (obj.has(key)) return obj.get(key);
    return default_;
  },
  items: function items(obj) {
    var result = [];
    obj.forEach(function (value, key) {
      result.push([key, value]);
    });
    return result;
  },
  values: function values(obj) {
    var result = [];
    obj.forEach(function (value, key) {
      result.push(value);
    });
    return result;
  },
  update: function update(obj, other, kwargs) {
    return _update(obj, other, kwargs);
  },
  clear: function clear(obj) {
    obj.clear();
    return null;
  }
});
expose(MapProtocol.get, ["key", "default=", null]);
expose(MapProtocol.items, []);
expose(MapProtocol.values, []);
expose(MapProtocol.update, ["*other", "**kwargs"]);
expose(MapProtocol.clear, []);
export var SetProtocol = _extend(Protocol, {
  attrs: _makeset("add", "clear"),
  ul4type: function ul4type(obj) {
    return "set";
  },
  add: function add(obj, items) {
    for (var i = 0; i < items.length; ++i) {
      obj.add(items[i]);
    }
  },
  clear: function clear(obj) {
    obj.clear();
    return null;
  }
});
expose(SetProtocol.add, ["*items"]);
expose(SetProtocol.clear, []);
export var DateProtocol = _extend(Protocol, {
  attrs: _makeset("weekday", "week", "calendar", "day", "month", "year", "mimeformat", "isoformat", "yearday"),
  ul4type: function ul4type(obj) {
    return "date";
  },
  weekday: function weekday(obj) {
    return DateTimeProtocol.weekday(obj._date);
  },
  calendar: function calendar(obj) {
    var firstweekday = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var mindaysinfirstweek = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
    return DateTimeProtocol.calendar(obj._date, firstweekday, mindaysinfirstweek);
  },
  week: function week(obj) {
    var firstweekday = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var mindaysinfirstweek = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
    return DateTimeProtocol.calendar(obj._date, firstweekday, mindaysinfirstweek)[1];
  },
  day: function day(obj) {
    return obj._date.getDate();
  },
  month: function month(obj) {
    return obj._date.getMonth() + 1;
  },
  year: function year(obj) {
    return obj._date.getFullYear();
  },
  mimeformat: function mimeformat(obj) {
    var weekdayname = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var monthname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var d = obj._date;
    return weekdayname[DateTimeProtocol.weekday(d)] + ", " + _lpad(d.getDate(), "0", 2) + " " + monthname[d.getMonth()] + " " + d.getFullYear();
  },
  isoformat: function isoformat(obj) {
    var d = obj._date;
    return d.getFullYear() + "-" + _lpad((d.getMonth() + 1).toString(), "0", 2) + "-" + _lpad(d.getDate().toString(), "0", 2);
  },
  yearday: function yearday(obj) {
    return DateTimeProtocol.yearday(obj._date);
  }
});
expose(DateProtocol.weekday, []);
expose(DateProtocol.calendar, ["firstweekday=", 0, "mindaysinfirstweek=", 4]);
expose(DateProtocol.week, ["firstweekday=", 0, "mindaysinfirstweek=", 4]);
expose(DateProtocol.day, []);
expose(DateProtocol.month, []);
expose(DateProtocol.year, []);
expose(DateProtocol.mimeformat, []);
expose(DateProtocol.isoformat, []);
expose(DateProtocol.yearday, []);
export var DateTimeProtocol = _extend(Protocol, {
  attrs: _makeset("weekday", "week", "calendar", "day", "month", "year", "hour", "minute", "second", "microsecond", "mimeformat", "isoformat", "yearday"),
  ul4type: function ul4type(obj) {
    return "datetime";
  },
  weekday: function weekday(obj) {
    var d = obj.getDay();
    return d ? d - 1 : 6;
  },
  calendar: function calendar(obj) {
    var firstweekday = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var mindaysinfirstweek = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
    firstweekday = _mod(firstweekday, 7);
    if (mindaysinfirstweek < 1) mindaysinfirstweek = 1;else if (mindaysinfirstweek > 7) mindaysinfirstweek = 7;

    for (var offset = +1; offset >= -1; --offset) {
      var year = obj.getFullYear() + offset;
      var refDate = new Date(year, 0, mindaysinfirstweek);

      var weekDayDiff = _mod(DateTimeProtocol.weekday(refDate) - firstweekday, 7);

      var weekStartYear = refDate.getFullYear();
      var weekStartMonth = refDate.getMonth();
      var weekStartDay = refDate.getDate() - weekDayDiff;
      var weekStart = new Date(weekStartYear, weekStartMonth, weekStartDay);

      if (obj.getTime() >= weekStart.getTime()) {
        var diff = SubAST.prototype._do(obj, weekStart);

        var week = Math.floor(diff.days() / 7) + 1;
        return [year, week, DateTimeProtocol.weekday(obj)];
      }
    }
  },
  week: function week(obj) {
    var firstweekday = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var mindaysinfirstweek = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
    return DateTimeProtocol.calendar(obj, firstweekday, mindaysinfirstweek)[1];
  },
  day: function day(obj) {
    return obj.getDate();
  },
  month: function month(obj) {
    return obj.getMonth() + 1;
  },
  year: function year(obj) {
    return obj.getFullYear();
  },
  hour: function hour(obj) {
    return obj.getHours();
  },
  minute: function minute(obj) {
    return obj.getMinutes();
  },
  second: function second(obj) {
    return obj.getSeconds();
  },
  microsecond: function microsecond(obj) {
    return obj.getMilliseconds() * 1000;
  },
  mimeformat: function mimeformat(obj) {
    var weekdayname = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var monthname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return weekdayname[DateTimeProtocol.weekday(obj)] + ", " + _lpad(obj.getDate(), "0", 2) + " " + monthname[obj.getMonth()] + " " + obj.getFullYear() + " " + _lpad(obj.getHours(), "0", 2) + ":" + _lpad(obj.getMinutes(), "0", 2) + ":" + _lpad(obj.getSeconds(), "0", 2) + " GMT";
  },
  isoformat: function isoformat(obj) {
    var year = obj.getFullYear();
    var month = obj.getMonth() + 1;
    var day = obj.getDate();
    var hour = obj.getHours();
    var minute = obj.getMinutes();
    var second = obj.getSeconds();
    var ms = obj.getMilliseconds();

    var result = year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2) + "T" + _lpad(hour.toString(), "0", 2) + ":" + _lpad(minute.toString(), "0", 2) + ":" + _lpad(second.toString(), "0", 2);

    if (ms) result += "." + _lpad(ms.toString(), "0", 3) + "000";
    return result;
  },
  yearday: function yearday(obj) {
    var leap = _isleap(obj) ? 1 : 0;
    var day = obj.getDate();

    switch (obj.getMonth()) {
      case 0:
        return day;

      case 1:
        return 31 + day;

      case 2:
        return 31 + 28 + leap + day;

      case 3:
        return 31 + 28 + leap + 31 + day;

      case 4:
        return 31 + 28 + leap + 31 + 30 + day;

      case 5:
        return 31 + 28 + leap + 31 + 30 + 31 + day;

      case 6:
        return 31 + 28 + leap + 31 + 30 + 31 + 30 + day;

      case 7:
        return 31 + 28 + leap + 31 + 30 + 31 + 30 + 31 + day;

      case 8:
        return 31 + 28 + leap + 31 + 30 + 31 + 30 + 31 + 31 + day;

      case 9:
        return 31 + 28 + leap + 31 + 30 + 31 + 30 + 31 + 31 + 30 + day;

      case 10:
        return 31 + 28 + leap + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + day;

      case 11:
        return 31 + 28 + leap + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30 + day;
    }
  }
});
expose(DateTimeProtocol.weekday, []);
expose(DateTimeProtocol.calendar, ["firstweekday=", 0, "mindaysinfirstweek=", 4]);
expose(DateTimeProtocol.week, ["firstweekday=", 0, "mindaysinfirstweek=", 4]);
expose(DateTimeProtocol.day, []);
expose(DateTimeProtocol.month, []);
expose(DateTimeProtocol.year, []);
expose(DateTimeProtocol.hour, []);
expose(DateTimeProtocol.minute, []);
expose(DateTimeProtocol.second, []);
expose(DateTimeProtocol.microsecond, []);
expose(DateTimeProtocol.mimeformat, []);
expose(DateTimeProtocol.isoformat, []);
expose(DateTimeProtocol.yearday, []);
export var ObjectProtocol = _extend(Protocol, {
  attrs: _makeset("get", "items", "values", "update", "clear"),
  ul4type: function ul4type(obj) {
    return "dict";
  },
  getattr: function getattr(obj, attrname) {
    var result;
    if (obj && typeof obj.__getattr__ === "function") result = obj.__getattr__(attrname);else result = obj[attrname];
    if (typeof result !== "function") return result;

    var realresult = function realresult() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key11 = 0; _key11 < _len5; _key11++) {
        args[_key11] = arguments[_key11];
      }

      return result.apply(obj, args);
    };

    realresult._ul4_name = result._ul4_name || result.name;
    realresult._ul4_signature = result._ul4_signature;
    realresult._ul4_needsobject = result._ul4_needsobject;
    realresult._ul4_needscontext = result._ul4_needscontext;
    return realresult;
  },
  get: function get(obj, key) {
    var default_ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var result = obj[key];
    if (typeof result === "undefined") return default_;
    return result;
  },
  items: function items(obj) {
    var result = [];

    for (var key in obj) {
      result.push([key, obj[key]]);
    }

    return result;
  },
  values: function values(obj) {
    var result = [];

    for (var key in obj) {
      result.push(obj[key]);
    }

    return result;
  },
  clear: function clear(obj) {
    for (var key in obj) {
      delete obj[key];
    }
  }
});
expose(ObjectProtocol.get, ["key", "default=", null]);
expose(ObjectProtocol.items, []);
expose(ObjectProtocol.values, []);
expose(ObjectProtocol.clear, []);
export var Context = function () {
  function Context(vars) {
    _classCallCheck(this, Context);

    if (vars === null || typeof vars === "undefined") vars = {};
    this.vars = vars;
    this.indents = [];
    this.escapes = [];
    this._output = [];
  }

  _createClass(Context, [{
    key: "inheritvars",
    value: function inheritvars() {
      var context = Object.create(this);
      context.vars = Object.create(this.vars);
      return context;
    }
  }, {
    key: "withindent",
    value: function withindent(indent) {
      var context = Object.create(this);

      if (indent !== null) {
        context.indents = this.indents.slice();
        context.indents.push(indent);
      }

      return context;
    }
  }, {
    key: "replaceoutput",
    value: function replaceoutput() {
      var context = Object.create(this);
      context._output = [];
      return context;
    }
  }, {
    key: "clone",
    value: function clone(vars) {
      return Object.create(this);
    }
  }, {
    key: "output",
    value: function output(value) {
      for (var i = 0; i < this.escapes.length; ++i) {
        var _escape2 = this.escapes[i];
        value = _escape2(value);
      }

      this._output.push(value);
    }
  }, {
    key: "getoutput",
    value: function getoutput() {
      return this._output.join("");
    }
  }, {
    key: "get",
    value: function get(name) {
      return this.vars[name];
    }
  }, {
    key: "set",
    value: function set(name, value) {
      this.vars[name] = value;
    }
  }]);

  return Context;
}();
;
export function Exception(message, fileName, lineNumber) {
  var instance = new Error(message, fileName, lineNumber);
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  instance.__id__ = _nextid++;
  instance.context = null;
  return instance;
}
;
Exception.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
});
if (Object.setPrototypeOf) Object.setPrototypeOf(Exception, Error);else Exception.__proto__ = Error;

Exception.prototype.__getattr__ = function __getattr__(attrname) {
  switch (attrname) {
    case "context":
      return this.context;

    default:
      throw new AttributeError(this, attrname);
  }
};

export var InternalException = function (_Exception) {
  _inherits(InternalException, _Exception);

  function InternalException() {
    _classCallCheck(this, InternalException);

    return _possibleConstructorReturn(this, _getPrototypeOf(InternalException).apply(this, arguments));
  }

  return InternalException;
}(Exception);
;
export var ReturnException = function (_InternalException) {
  _inherits(ReturnException, _InternalException);

  function ReturnException(result) {
    var _this2;

    _classCallCheck(this, ReturnException);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(ReturnException).call(this, "return"));
    _this2.result = result;
    return _this2;
  }

  return ReturnException;
}(InternalException);
;
export var BreakException = function (_InternalException2) {
  _inherits(BreakException, _InternalException2);

  function BreakException() {
    _classCallCheck(this, BreakException);

    return _possibleConstructorReturn(this, _getPrototypeOf(BreakException).call(this, "break"));
  }

  return BreakException;
}(InternalException);
;
export var ContinueException = function (_InternalException3) {
  _inherits(ContinueException, _InternalException3);

  function ContinueException() {
    _classCallCheck(this, ContinueException);

    return _possibleConstructorReturn(this, _getPrototypeOf(ContinueException).call(this, "continue"));
  }

  return ContinueException;
}(InternalException);
;
export var SyntaxError = function (_Exception2) {
  _inherits(SyntaxError, _Exception2);

  function SyntaxError() {
    _classCallCheck(this, SyntaxError);

    return _possibleConstructorReturn(this, _getPrototypeOf(SyntaxError).apply(this, arguments));
  }

  return SyntaxError;
}(Exception);
;
export var LValueRequiredError = function (_SyntaxError) {
  _inherits(LValueRequiredError, _SyntaxError);

  function LValueRequiredError() {
    _classCallCheck(this, LValueRequiredError);

    return _possibleConstructorReturn(this, _getPrototypeOf(LValueRequiredError).call(this, "lvalue required"));
  }

  return LValueRequiredError;
}(SyntaxError);
;

var _TypeError = function (_Exception3) {
  _inherits(_TypeError, _Exception3);

  function _TypeError() {
    _classCallCheck(this, _TypeError);

    return _possibleConstructorReturn(this, _getPrototypeOf(_TypeError).apply(this, arguments));
  }

  return _TypeError;
}(Exception);

export { _TypeError as TypeError };
;
export var ValueError = function (_Exception4) {
  _inherits(ValueError, _Exception4);

  function ValueError() {
    _classCallCheck(this, ValueError);

    return _possibleConstructorReturn(this, _getPrototypeOf(ValueError).apply(this, arguments));
  }

  return ValueError;
}(Exception);
;
export var ArgumentError = function (_Exception5) {
  _inherits(ArgumentError, _Exception5);

  function ArgumentError() {
    _classCallCheck(this, ArgumentError);

    return _possibleConstructorReturn(this, _getPrototypeOf(ArgumentError).apply(this, arguments));
  }

  return ArgumentError;
}(Exception);
;
export var NotSubscriptableError = function (_Exception6) {
  _inherits(NotSubscriptableError, _Exception6);

  function NotSubscriptableError(obj) {
    var _this3;

    _classCallCheck(this, NotSubscriptableError);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(NotSubscriptableError).call(this, "Object of type " + _type(obj) + " is not subscriptable"));
    _this3.obj = obj;
    return _this3;
  }

  _createClass(NotSubscriptableError, [{
    key: "toString",
    value: function toString() {
      return "Object of type " + _type(this.obj) + " is not subscriptable";
    }
  }]);

  return NotSubscriptableError;
}(Exception);
;
export var ZeroDivisionError = function (_Exception7) {
  _inherits(ZeroDivisionError, _Exception7);

  function ZeroDivisionError() {
    _classCallCheck(this, ZeroDivisionError);

    return _possibleConstructorReturn(this, _getPrototypeOf(ZeroDivisionError).call(this, "division by zero"));
  }

  return ZeroDivisionError;
}(Exception);
;
export var IndexError = function (_Exception8) {
  _inherits(IndexError, _Exception8);

  function IndexError(obj, index) {
    var _this4;

    _classCallCheck(this, IndexError);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(IndexError).call(this, "index " + _repr2(index) + " out of range"));
    _this4.obj = obj;
    _this4.index = index;
    return _this4;
  }

  _createClass(IndexError, [{
    key: "toString",
    value: function toString() {
      return "index " + this.index + " out of range for " + _type(this.obj);
    }
  }]);

  return IndexError;
}(Exception);
;
export var AttributeError = function (_Exception9) {
  _inherits(AttributeError, _Exception9);

  function AttributeError(obj, attrname) {
    var _this5;

    _classCallCheck(this, AttributeError);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(AttributeError).call(this, "object of type " + _type(obj) + " has no attribute " + _repr2(attrname)));
    _this5.obj = obj;
    _this5.attrname = attrname;
    return _this5;
  }

  return AttributeError;
}(Exception);
;
export var LocationError = function (_Exception10) {
  _inherits(LocationError, _Exception10);

  function LocationError(location) {
    var _this6;

    _classCallCheck(this, LocationError);

    _this6 = _possibleConstructorReturn(this, _getPrototypeOf(LocationError).call(this, "nested exception in " + _repr2(location)));
    _this6.location = location;
    return _this6;
  }

  _createClass(LocationError, [{
    key: "_templateprefix",
    value: function _templateprefix() {
      var template = this.location.template;
      var out = [];
      if (template.parenttemplate !== null) out.push("in local template ");else out.push("in template ");
      var first = true;

      while (template != null) {
        if (first) first = false;else out.push(" in ");
        out.push(template.name ? _repr2(template.name) : "(unnamed)");
        template = template.parenttemplate;
      }

      return out.join("");
    }
  }, {
    key: "toString",
    value: function toString() {
      var template = this.location.template;

      var templateprefix = this._templateprefix();

      var prefix = this.location.sourceprefix;
      var code = this.location.source;
      var suffix = this.location.sourcesuffix;
      prefix = _repr2(prefix).slice(1, -1);
      code = _repr2(code).slice(1, -1);
      suffix = _repr2(suffix).slice(1, -1);
      var text = prefix + code + suffix;

      var underline = _str_repeat("\xA0", prefix.length) + _str_repeat("~", code.length);

      var pos = "offset " + this.location.pos.start + ":" + this.location.pos.stop + "; line " + this.location.line + "; col " + this.location.col;
      var message = templateprefix + ": " + pos + "\n" + text + "\n" + underline;
      return message;
    }
  }, {
    key: "__getattr__",
    value: function __getattr__(attrname) {
      switch (attrname) {
        case "context":
          return this.context;

        case "location":
          return this.location;

        default:
          throw new AttributeError(this, attrname);
      }
    }
  }]);

  return LocationError;
}(Exception);
;
export var AST = function (_Proto2) {
  _inherits(AST, _Proto2);

  function AST(template, pos) {
    var _this7;

    _classCallCheck(this, AST);

    _this7 = _possibleConstructorReturn(this, _getPrototypeOf(AST).call(this));
    _this7.template = template;
    _this7.pos = pos;
    _this7._line = null;
    _this7._col = null;
    return _this7;
  }

  _createClass(AST, [{
    key: "_calculateLineCol",
    value: function _calculateLineCol() {
      this._line = 1;
      this._col = 1;
      var stop = this.pos.start;

      for (var i = 0; i < stop; ++i) {
        if (this.template.source[i] === "\n") {
          ++this._line;
          this._col = 1;
        } else ++this._col;
      }
    }
  }, {
    key: "__getattr__",
    value: function __getattr__(attrname) {
      if (attrname === "type" || attrname === "fullsource" || attrname === "source" || attrname === "sourceprefix" || attrname === "sourcesuffix" || attrname === "line" || attrname === "col") return this[attrname];else if (this._ul4onattrs.indexOf(attrname) >= 0) return this[attrname];
      throw new AttributeError(this, attrname);
    }
  }, {
    key: "__setitem__",
    value: function __setitem__(attrname, value) {
      throw new _TypeError("object is immutable");
    }
  }, {
    key: "__str__",
    value: function __str__() {
      var out = [];

      this._str(out);

      return _formatsource(out);
    }
  }, {
    key: "__repr__",
    value: function __repr__() {
      var out = [];

      this._repr(out);

      return _formatsource(out);
    }
  }, {
    key: "_decorate_exception",
    value: function _decorate_exception(exc) {
      while (exc.context !== undefined && exc.context !== null) {
        exc = exc.context;
      }

      exc.context = new LocationError(this);
    }
  }, {
    key: "_handle_eval",
    value: function _handle_eval(context) {
      try {
        return this._eval(context);
      } catch (exc) {
        if (!(exc instanceof InternalException) && !(exc instanceof LocationError)) this._decorate_exception(exc);
        throw exc;
      }
    }
  }, {
    key: "_handle_eval_set",
    value: function _handle_eval_set(context, value) {
      try {
        return this._eval_set(context, value);
      } catch (exc) {
        if (!(exc instanceof LocationError)) this._decorate_exception(exc);
        throw exc;
      }
    }
  }, {
    key: "_eval_set",
    value: function _eval_set(context, value) {
      throw new LValueRequiredError();
    }
  }, {
    key: "_handle_eval_modify",
    value: function _handle_eval_modify(context, operator, value) {
      try {
        return this._eval_modify(context, operator, value);
      } catch (exc) {
        if (!(exc instanceof LocationError)) this._decorate_exception(exc);
        throw exc;
      }
    }
  }, {
    key: "_eval_modify",
    value: function _eval_modify(context, operator, value) {
      throw new LValueRequiredError();
    }
  }, {
    key: "_repr",
    value: function _repr(out) {}
  }, {
    key: "_str",
    value: function _str(out) {
      out.push(this.source.replace(/\r?\n/g, ' '));
    }
  }, {
    key: "ul4ondump",
    value: function ul4ondump(encoder) {
      for (var i = 0; i < this._ul4onattrs.length; ++i) {
        var attrname = this._ul4onattrs[i];
        encoder.dump(this[attrname]);
      }
    }
  }, {
    key: "ul4onload",
    value: function ul4onload(decoder) {
      for (var i = 0; i < this._ul4onattrs.length; ++i) {
        var attrname = this._ul4onattrs[i];
        this[attrname] = decoder.load();
      }
    }
  }, {
    key: "fullsource",
    get: function get() {
      return this.template._source;
    }
  }, {
    key: "source",
    get: function get() {
      return this.pos.of(this.template._source);
    }
  }, {
    key: "sourceprefix",
    get: function get() {
      var outerstartpos = this.pos.start;
      var innerstartpos = outerstartpos;
      var source = this.fullsource;
      var maxprefix = 40;
      var preprefix = "\u2026";

      while (maxprefix > 0) {
        if (outerstartpos === 0) {
          preprefix = "";
          break;
        }

        if (source.charAt(outerstartpos - 1) === "\n") {
          preprefix = "";
          break;
        }

        --maxprefix;
        --outerstartpos;
      }

      return preprefix + source.substring(outerstartpos, innerstartpos);
    }
  }, {
    key: "sourcesuffix",
    get: function get() {
      var outerstoppos = this.pos.stop;
      var innerstoppos = outerstoppos;
      var source = this.fullsource;
      var maxsuffix = 40;
      var postsuffix = "\u2026";

      while (maxsuffix > 0) {
        if (outerstoppos >= source.length) {
          postsuffix = "";
          break;
        }

        if (source.charAt(outerstoppos) === "\n") {
          postsuffix = "";
          break;
        }

        --maxsuffix;
        ++outerstoppos;
      }

      return source.substring(innerstoppos, outerstoppos) + postsuffix;
    }
  }, {
    key: "line",
    get: function get() {
      if (this._line === null) this._calculateLineCol();
      return this._line;
    }
  }, {
    key: "col",
    get: function get() {
      if (this._col === null) this._calculateLineCol();
      return this._col;
    }
  }]);

  return AST;
}(Proto);
;
AST.prototype._ul4onattrs = ["template", "pos"];
export var TextAST = function (_AST) {
  _inherits(TextAST, _AST);

  function TextAST(template, pos) {
    _classCallCheck(this, TextAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(TextAST).call(this, template, pos));
  }

  _createClass(TextAST, [{
    key: "_eval",
    value: function _eval(context) {
      context.output(this.text);
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("text ");
      out.push(_repr2(this.text));
    }
  }, {
    key: "_repr",
    value: function _repr(out) {
      out.push("<TextAST ");
      out.push(_repr2(this.text));
      out.push(">");
    }
  }, {
    key: "text",
    get: function get() {
      return this.source;
    }
  }]);

  return TextAST;
}(AST);
;
export var IndentAST = function (_TextAST) {
  _inherits(IndentAST, _TextAST);

  function IndentAST(template, pos, text) {
    var _this8;

    _classCallCheck(this, IndentAST);

    _this8 = _possibleConstructorReturn(this, _getPrototypeOf(IndentAST).call(this, template, pos));
    _this8._text = text;
    return _this8;
  }

  _createClass(IndentAST, [{
    key: "_eval",
    value: function _eval(context) {
      for (var i = 0; i < context.indents.length; ++i) {
        var indent = context.indents[i];
        context.output(indent);
      }

      context.output(this.text);
    }
  }, {
    key: "ul4ondump",
    value: function ul4ondump(encoder) {
      _get2(_getPrototypeOf(IndentAST.prototype), "ul4ondump", this).call(this, encoder);

      if (this._text === this.source) encoder.dump(null);else encoder.dump(this._text);
    }
  }, {
    key: "ul4onload",
    value: function ul4onload(decoder) {
      _get2(_getPrototypeOf(IndentAST.prototype), "ul4onload", this).call(this, decoder);

      this._text = decoder.load();
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("indent ");
      out.push(_repr2(this.text));
    }
  }, {
    key: "_repr",
    value: function _repr(out) {
      out.push("<IndentAST ");
      out.push(_repr2(this.text));
      out.push(">");
    }
  }, {
    key: "text",
    get: function get() {
      if (typeof this.template !== "undefined") return this._text === null ? this.source : this._text;else return null;
    }
  }]);

  return IndentAST;
}(TextAST);
;
export var LineEndAST = function (_TextAST2) {
  _inherits(LineEndAST, _TextAST2);

  function LineEndAST() {
    _classCallCheck(this, LineEndAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(LineEndAST).apply(this, arguments));
  }

  _createClass(LineEndAST, [{
    key: "_str",
    value: function _str(out) {
      out.push("lineend ");
      out.push(_repr2(this.text));
    }
  }, {
    key: "_repr",
    value: function _repr(out) {
      out.push("<LineEndAST ");
      out.push(_repr2(this.text));
      out.push(">");
    }
  }]);

  return LineEndAST;
}(TextAST);
;
export var CodeAST = function (_AST2) {
  _inherits(CodeAST, _AST2);

  function CodeAST() {
    _classCallCheck(this, CodeAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(CodeAST).apply(this, arguments));
  }

  return CodeAST;
}(AST);
;
export var ConstAST = function (_CodeAST) {
  _inherits(ConstAST, _CodeAST);

  function ConstAST(template, pos, value) {
    var _this9;

    _classCallCheck(this, ConstAST);

    _this9 = _possibleConstructorReturn(this, _getPrototypeOf(ConstAST).call(this, template, pos));
    _this9.value = value;
    return _this9;
  }

  _createClass(ConstAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<ConstAST value=");
      out.push(_repr2(this.value));
      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      return this.value;
    }
  }]);

  return ConstAST;
}(CodeAST);
;
ConstAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["value"]);
export var ItemArgBase = function (_CodeAST2) {
  _inherits(ItemArgBase, _CodeAST2);

  function ItemArgBase() {
    _classCallCheck(this, ItemArgBase);

    return _possibleConstructorReturn(this, _getPrototypeOf(ItemArgBase).apply(this, arguments));
  }

  _createClass(ItemArgBase, [{
    key: "_handle_eval_list",
    value: function _handle_eval_list(context, result) {
      try {
        return this._eval_list(context, result);
      } catch (exc) {
        if (!(exc instanceof InternalException) && !(exc instanceof LocationError)) this._decorate_exception(exc);
        throw exc;
      }
    }
  }, {
    key: "_handle_eval_set",
    value: function _handle_eval_set(context, result) {
      try {
        return this._eval_set(context, result);
      } catch (exc) {
        if (!(exc instanceof InternalException) && !(exc instanceof LocationError)) this._decorate_exception(exc);
        throw exc;
      }
    }
  }, {
    key: "_handle_eval_dict",
    value: function _handle_eval_dict(context, result) {
      try {
        return this._eval_dict(context, result);
      } catch (exc) {
        if (!(exc instanceof InternalException) && !(exc instanceof LocationError)) this._decorate_exception(exc);
        throw exc;
      }
    }
  }, {
    key: "_handle_eval_call",
    value: function _handle_eval_call(context, args, kwargs) {
      try {
        return this._eval_call(context, args, kwargs);
      } catch (exc) {
        if (!(exc instanceof InternalException) && !(exc instanceof LocationError)) this._decorate_exception(exc);
        throw exc;
      }
    }
  }]);

  return ItemArgBase;
}(CodeAST);
;
export var SeqItemAST = function (_ItemArgBase) {
  _inherits(SeqItemAST, _ItemArgBase);

  function SeqItemAST(template, pos, value) {
    var _this10;

    _classCallCheck(this, SeqItemAST);

    _this10 = _possibleConstructorReturn(this, _getPrototypeOf(SeqItemAST).call(this, template, pos));
    _this10.value = value;
    return _this10;
  }

  _createClass(SeqItemAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<SeqItemAST value=");
      out.push(_repr2(this.value));
      out.push(">");
    }
  }, {
    key: "_eval_list",
    value: function _eval_list(context, result) {
      var value = this.value._handle_eval(context);

      result.push(value);
    }
  }, {
    key: "_eval_set",
    value: function _eval_set(context, result) {
      var value = this.value._handle_eval(context);

      result.add(value);
    }
  }]);

  return SeqItemAST;
}(ItemArgBase);
;
SeqItemAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["value"]);
export var UnpackSeqItemAST = function (_ItemArgBase2) {
  _inherits(UnpackSeqItemAST, _ItemArgBase2);

  function UnpackSeqItemAST(template, pos, value) {
    var _this11;

    _classCallCheck(this, UnpackSeqItemAST);

    _this11 = _possibleConstructorReturn(this, _getPrototypeOf(UnpackSeqItemAST).call(this, template, pos));
    _this11.value = value;
    return _this11;
  }

  _createClass(UnpackSeqItemAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<UnpackSeqItemAST value=");
      out.push(_repr2(this.value));
      out.push(">");
    }
  }, {
    key: "_eval_list",
    value: function _eval_list(context, result) {
      var value = this.value._handle_eval(context);

      for (var iter = _iter(value);;) {
        var item = iter.next();
        if (item.done) break;
        result.push(item.value);
      }
    }
  }, {
    key: "_eval_set",
    value: function _eval_set(context, result) {
      var value = this.value._handle_eval(context);

      for (var iter = _iter(value);;) {
        var item = iter.next();
        if (item.done) break;
        result.add(item.value);
      }
    }
  }]);

  return UnpackSeqItemAST;
}(ItemArgBase);
;
UnpackSeqItemAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["value"]);
export var DictItemAST = function (_ItemArgBase3) {
  _inherits(DictItemAST, _ItemArgBase3);

  function DictItemAST(template, pos, key, value) {
    var _this12;

    _classCallCheck(this, DictItemAST);

    _this12 = _possibleConstructorReturn(this, _getPrototypeOf(DictItemAST).call(this, template, pos));
    _this12.key = key;
    _this12.value = value;
    return _this12;
  }

  _createClass(DictItemAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<DictItemAST key=");
      out.push(_repr2(this.key));
      out.push(" value=");
      out.push(_repr2(this.value));
      out.push(">");
    }
  }, {
    key: "_eval_dict",
    value: function _eval_dict(context, result) {
      var key = this.key._handle_eval(context);

      var value = this.value._handle_eval(context);

      _setmap(result, key, value);
    }
  }]);

  return DictItemAST;
}(ItemArgBase);
;
DictItemAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["key", "value"]);
export var UnpackDictItemAST = function (_ItemArgBase4) {
  _inherits(UnpackDictItemAST, _ItemArgBase4);

  function UnpackDictItemAST(template, pos, item) {
    var _this13;

    _classCallCheck(this, UnpackDictItemAST);

    _this13 = _possibleConstructorReturn(this, _getPrototypeOf(UnpackDictItemAST).call(this, template, pos));
    _this13.item = item;
    return _this13;
  }

  _createClass(UnpackDictItemAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<UnpackDictItemAST item=");
      out.push(_repr2(this.item));
      out.push(">");
    }
  }, {
    key: "_eval_dict",
    value: function _eval_dict(context, result) {
      var item = this.item._handle_eval(context);

      if (_islist(item)) {
        for (var i = 0; i < item.length; ++i) {
          var subitem = item[i];
          if (!_islist(subitem) || subitem.length != 2) throw new ArgumentError("** requires a list of (key, value) pairs");

          _setmap(result, subitem[0], subitem[1]);
        }
      } else if (_ismap(item)) {
        item.forEach(function (value, key) {
          _setmap(result, key, value);
        });
      } else if (_isobject(item)) {
        for (var key in item) {
          _setmap(result, key, item[key]);
        }
      }
    }
  }]);

  return UnpackDictItemAST;
}(ItemArgBase);
;
UnpackDictItemAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["item"]);
export var PosArgAST = function (_ItemArgBase5) {
  _inherits(PosArgAST, _ItemArgBase5);

  function PosArgAST(template, pos, value) {
    var _this14;

    _classCallCheck(this, PosArgAST);

    _this14 = _possibleConstructorReturn(this, _getPrototypeOf(PosArgAST).call(this, template, pos));
    _this14.value = value;
    return _this14;
  }

  _createClass(PosArgAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<PosArgAST value=");

      this.value._repr(out);

      out.push(">");
    }
  }, {
    key: "_eval_call",
    value: function _eval_call(context, args, kwargs) {
      var value = this.value._handle_eval(context);

      args.push(value);
    }
  }]);

  return PosArgAST;
}(ItemArgBase);
;
PosArgAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["value"]);
export var KeywordArgAST = function (_ItemArgBase6) {
  _inherits(KeywordArgAST, _ItemArgBase6);

  function KeywordArgAST(template, pos, name, value) {
    var _this15;

    _classCallCheck(this, KeywordArgAST);

    _this15 = _possibleConstructorReturn(this, _getPrototypeOf(KeywordArgAST).call(this, template, pos));
    _this15.name = name;
    _this15.value = value;
    return _this15;
  }

  _createClass(KeywordArgAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<KeywordArgAST name=");
      out.push(_repr2(this.name));
      out.push(" value=");

      this.value._repr(out);

      out.push(">");
    }
  }, {
    key: "_eval_call",
    value: function _eval_call(context, args, kwargs) {
      if (kwargs.hasOwnProperty(this.name)) throw new ArgumentError("duplicate keyword argument " + this.name);

      var value = this.value._handle_eval(context);

      kwargs[this.name] = value;
    }
  }]);

  return KeywordArgAST;
}(ItemArgBase);
;
KeywordArgAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["name", "value"]);
export var UnpackListArgAST = function (_ItemArgBase7) {
  _inherits(UnpackListArgAST, _ItemArgBase7);

  function UnpackListArgAST(template, pos, item) {
    var _this16;

    _classCallCheck(this, UnpackListArgAST);

    _this16 = _possibleConstructorReturn(this, _getPrototypeOf(UnpackListArgAST).call(this, template, pos));
    _this16.item = item;
    return _this16;
  }

  _createClass(UnpackListArgAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<UnpackListArgAST item=");

      this.item._repr(out);

      out.push(">");
    }
  }, {
    key: "_eval_call",
    value: function _eval_call(context, args, kwargs) {
      var item = this.item._handle_eval(context);

      args.push.apply(args, _toConsumableArray(item));
    }
  }]);

  return UnpackListArgAST;
}(ItemArgBase);
;
UnpackListArgAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["item"]);
export var UnpackDictArgAST = function (_ItemArgBase8) {
  _inherits(UnpackDictArgAST, _ItemArgBase8);

  function UnpackDictArgAST(template, pos, item) {
    var _this17;

    _classCallCheck(this, UnpackDictArgAST);

    _this17 = _possibleConstructorReturn(this, _getPrototypeOf(UnpackDictArgAST).call(this, template, pos));
    _this17.item = item;
    return _this17;
  }

  _createClass(UnpackDictArgAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<UnpackDictArgAST item=");

      this.item._repr(out);

      out.push(">");
    }
  }, {
    key: "_eval_call",
    value: function _eval_call(context, args, kwargs) {
      var item = this.item._handle_eval(context);

      if (_islist(item)) {
        for (var i = 0; i < item.length; ++i) {
          var subitem = item[i];
          if (!_islist(subitem) || subitem.length != 2) throw new ArgumentError("** requires a list of (key, value) pairs");

          var _subitem = _slicedToArray(subitem, 2),
              key = _subitem[0],
              value = _subitem[1];

          if (kwargs.hasOwnProperty(key)) throw new ArgumentError("duplicate keyword argument " + key);
          kwargs[key] = value;
        }
      } else if (_ismap(item)) {
        item.forEach(function (value, key) {
          if (kwargs.hasOwnProperty(key)) throw new ArgumentError("duplicate keyword argument " + key);
          kwargs[key] = value;
        });
      } else if (_isobject(item)) {
        for (var key in item) {
          if (kwargs.hasOwnProperty(key)) throw new ArgumentError("duplicate keyword argument " + key);
          kwargs[key] = item[key];
        }
      }
    }
  }]);

  return UnpackDictArgAST;
}(ItemArgBase);
;
UnpackDictArgAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["item"]);
export var ListAST = function (_CodeAST3) {
  _inherits(ListAST, _CodeAST3);

  function ListAST(template, pos) {
    var _this18;

    _classCallCheck(this, ListAST);

    _this18 = _possibleConstructorReturn(this, _getPrototypeOf(ListAST).call(this, template, pos));
    _this18.items = [];
    return _this18;
  }

  _createClass(ListAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<ListAST");

      for (var i = 0; i < this.items.length; ++i) {
        var item = this.items[i];
        out.push(" ");

        item._repr(out);
      }

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var result = [];

      for (var i = 0; i < this.items.length; ++i) {
        var item = this.items[i];

        item._handle_eval_list(context, result);
      }

      return result;
    }
  }]);

  return ListAST;
}(CodeAST);
;
ListAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["items"]);
export var ListCompAST = function (_CodeAST4) {
  _inherits(ListCompAST, _CodeAST4);

  function ListCompAST(template, pos, item, varname, container, condition) {
    var _this19;

    _classCallCheck(this, ListCompAST);

    _this19 = _possibleConstructorReturn(this, _getPrototypeOf(ListCompAST).call(this, template, pos));
    _this19.item = item;
    _this19.varname = varname;
    _this19.container = container;
    _this19.condition = condition;
    return _this19;
  }

  _createClass(ListCompAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<ListCompAST");
      out.push(" item=");

      this.item._repr(out);

      out.push(" varname=");
      out.push(_repr2(this.varname));
      out.push(" container=");

      this.container._repr(out);

      if (this.condition !== null) {
        out.push(" condition=");

        this.condition._repr(out);
      }

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var container = this.container._handle_eval(context);

      var localcontext = context.inheritvars();
      var result = [];

      for (var iter = _iter(container);;) {
        var item = iter.next();
        if (item.done) break;

        var varitems = _unpackvar(this.varname, item.value);

        for (var i = 0; i < varitems.length; ++i) {
          var _varitems$i = _slicedToArray(varitems[i], 2),
              lvalue = _varitems$i[0],
              value = _varitems$i[1];

          lvalue._handle_eval_set(localcontext, value);
        }

        if (this.condition === null || _bool(this.condition._handle_eval(localcontext))) result.push(this.item._handle_eval(localcontext));
      }

      return result;
    }
  }]);

  return ListCompAST;
}(CodeAST);
;
ListCompAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["item", "varname", "container", "condition"]);
export var SetAST = function (_CodeAST5) {
  _inherits(SetAST, _CodeAST5);

  function SetAST(template, pos) {
    var _this20;

    _classCallCheck(this, SetAST);

    _this20 = _possibleConstructorReturn(this, _getPrototypeOf(SetAST).call(this, template, pos));
    _this20.items = [];
    return _this20;
  }

  _createClass(SetAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<SetAST");

      for (var i = 0; i < this.items.length; ++i) {
        var item = this.items[i];
        out.push(" ");

        item._repr(out);
      }

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var result = _emptyset();

      for (var i = 0; i < this.items.length; ++i) {
        var item = this.items[i];

        item._handle_eval_set(context, result);
      }

      return result;
    }
  }]);

  return SetAST;
}(CodeAST);
;
SetAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["items"]);
export var SetCompAST = function (_CodeAST6) {
  _inherits(SetCompAST, _CodeAST6);

  function SetCompAST(template, pos, item, varname, container, condition) {
    var _this21;

    _classCallCheck(this, SetCompAST);

    _this21 = _possibleConstructorReturn(this, _getPrototypeOf(SetCompAST).call(this, template, pos));
    _this21.item = item;
    _this21.varname = varname;
    _this21.container = container;
    _this21.condition = condition;
    return _this21;
  }

  _createClass(SetCompAST, [{
    key: "__getattr__",
    value: function __getattr__(attrname) {
      switch (attrname) {
        case "item":
          return this.item;

        case "varname":
          return this.varname;

        case "container":
          return this.container;

        case "condition":
          return this.condition;

        default:
          return _get2(_getPrototypeOf(SetCompAST.prototype), "__getattr__", this).call(this, attrname);
      }
    }
  }, {
    key: "_repr",
    value: function _repr(out) {
      out.push("<SetCompAST");
      out.push(" item=");

      this.item._repr(out);

      out.push(" varname=");

      this.varname._repr(out);

      out.push(" container=");

      this.container._repr(out);

      if (this.condition !== null) {
        out.push(" condition=");

        this.condition._repr(out);
      }

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var container = this.container._handle_eval(context);

      var localcontext = context.inheritvars();

      var result = _emptyset();

      for (var iter = _iter(container);;) {
        var item = iter.next();
        if (item.done) break;

        var varitems = _unpackvar(this.varname, item.value);

        for (var i = 0; i < varitems.length; ++i) {
          var _varitems$i2 = _slicedToArray(varitems[i], 2),
              lvalue = _varitems$i2[0],
              value = _varitems$i2[1];

          lvalue._handle_eval_set(localcontext, value);
        }

        if (this.condition === null || _bool(this.condition._handle_eval(localcontext))) result.add(this.item._handle_eval(localcontext));
      }

      return result;
    }
  }]);

  return SetCompAST;
}(CodeAST);
;
SetCompAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["item", "varname", "container", "condition"]);
export var DictAST = function (_CodeAST7) {
  _inherits(DictAST, _CodeAST7);

  function DictAST(template, pos) {
    var _this22;

    _classCallCheck(this, DictAST);

    _this22 = _possibleConstructorReturn(this, _getPrototypeOf(DictAST).call(this, template, pos));
    _this22.items = [];
    return _this22;
  }

  _createClass(DictAST, [{
    key: "__getattr__",
    value: function __getattr__(attrname) {
      switch (attrname) {
        case "items":
          return this.items;

        default:
          return _get2(_getPrototypeOf(DictAST.prototype), "__getattr__", this).call(this, attrname);
      }
    }
  }, {
    key: "_repr",
    value: function _repr(out) {
      out.push("<DictAST");

      for (var i = 0; i < this.items.length; ++i) {
        var item = this.items[i];
        out.push(" ");

        item._repr(out);
      }

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var result = _emptymap();

      for (var i = 0; i < this.items.length; ++i) {
        var item = this.items[i];

        item._handle_eval_dict(context, result);
      }

      return result;
    }
  }]);

  return DictAST;
}(CodeAST);
;
DictAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["items"]);
export var DictCompAST = function (_CodeAST8) {
  _inherits(DictCompAST, _CodeAST8);

  function DictCompAST(template, pos, key, value, varname, container, condition) {
    var _this23;

    _classCallCheck(this, DictCompAST);

    _this23 = _possibleConstructorReturn(this, _getPrototypeOf(DictCompAST).call(this, template, pos));
    _this23.key = key;
    _this23.value = value;
    _this23.varname = varname;
    _this23.container = container;
    _this23.condition = condition;
    return _this23;
  }

  _createClass(DictCompAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<DictCompAST");
      out.push(" key=");

      this.key._repr(out);

      out.push(" value=");

      this.value._repr(out);

      out.push(" varname=");

      this.varname._repr(out);

      out.push(" container=");

      this.container._repr(out);

      if (this.condition !== null) {
        out.push(" condition=");

        this.condition._repr(out);
      }

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var container = this.container._handle_eval(context);

      var localcontext = context.inheritvars();

      var result = _emptymap();

      for (var iter = _iter(container);;) {
        var item = iter.next();
        if (item.done) break;

        var varitems = _unpackvar(this.varname, item.value);

        for (var i = 0; i < varitems.length; ++i) {
          var _varitems$i3 = _slicedToArray(varitems[i], 2),
              lvalue = _varitems$i3[0],
              value = _varitems$i3[1];

          lvalue._handle_eval_set(localcontext, value);
        }

        if (this.condition === null || _bool(this.condition._handle_eval(localcontext))) {
          var key = this.key._handle_eval(localcontext);

          var value = this.value._handle_eval(localcontext);

          _setmap(result, key, value);
        }
      }

      return result;
    }
  }]);

  return DictCompAST;
}(CodeAST);
;
DictCompAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["key", "value", "varname", "container", "condition"]);
export var GenExprAST = function (_CodeAST9) {
  _inherits(GenExprAST, _CodeAST9);

  function GenExprAST(template, pos, item, varname, container, condition) {
    var _this24;

    _classCallCheck(this, GenExprAST);

    _this24 = _possibleConstructorReturn(this, _getPrototypeOf(GenExprAST).call(this, template, pos));
    _this24.item = item;
    _this24.varname = varname;
    _this24.container = container;
    _this24.condition = condition;
    return _this24;
  }

  _createClass(GenExprAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<GenExprAST");
      out.push(" item=");

      this.item._repr(out);

      out.push(" varname=");

      this.varname._repr(out);

      out.push(" container=");

      this.container._repr(out);

      if (this.condition !== null) {
        out.push(" condition=");

        this.condition._repr(out);
      }

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var container = this.container._handle_eval(context);

      var iter = _iter(container);

      var localcontext = context.inheritvars();
      var self = this;
      var result = {
        next: function next() {
          while (true) {
            var item = iter.next();
            if (item.done) return item;

            var varitems = _unpackvar(self.varname, item.value);

            for (var i = 0; i < varitems.length; ++i) {
              var _varitems$i4 = _slicedToArray(varitems[i], 2),
                  lvalue = _varitems$i4[0],
                  value = _varitems$i4[1];

              lvalue._handle_eval_set(localcontext, value);
            }

            if (self.condition === null || _bool(self.condition._handle_eval(localcontext))) {
              var value = self.item._handle_eval(localcontext);

              return {
                value: value,
                done: false
              };
            }
          }
        }
      };
      return result;
    }
  }]);

  return GenExprAST;
}(CodeAST);
;
GenExprAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["item", "varname", "container", "condition"]);
export var VarAST = function (_CodeAST10) {
  _inherits(VarAST, _CodeAST10);

  function VarAST(template, pos, name) {
    var _this25;

    _classCallCheck(this, VarAST);

    _this25 = _possibleConstructorReturn(this, _getPrototypeOf(VarAST).call(this, template, pos));
    _this25.name = name;
    return _this25;
  }

  _createClass(VarAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<VarAST name=");
      out.push(_repr2(this.name));
      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      return this._get(context, this.name);
    }
  }, {
    key: "_eval_set",
    value: function _eval_set(context, value) {
      this._set(context, this.name, value);
    }
  }, {
    key: "_eval_modify",
    value: function _eval_modify(context, operator, value) {
      this._modify(context, operator, this.name, value);
    }
  }, {
    key: "_get",
    value: function _get(context, name) {
      var result = context.get(name);
      if (typeof result === "undefined") result = functions[name];
      return result;
    }
  }, {
    key: "_set",
    value: function _set(context, name, value) {
      context.set(name, value);
    }
  }, {
    key: "_modify",
    value: function _modify(context, operator, name, value) {
      var newvalue = operator._ido(context.get(name), value);

      context.set(name, newvalue);
    }
  }]);

  return VarAST;
}(CodeAST);
;
VarAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["name"]);
export var UnaryAST = function (_CodeAST11) {
  _inherits(UnaryAST, _CodeAST11);

  function UnaryAST(template, pos, obj) {
    var _this26;

    _classCallCheck(this, UnaryAST);

    _this26 = _possibleConstructorReturn(this, _getPrototypeOf(UnaryAST).call(this, template, pos));
    _this26.obj = obj;
    return _this26;
  }

  _createClass(UnaryAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<");
      out.push(this.constructor.name);
      out.push(" obj=");

      this.obj._repr(out);

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var obj = this.obj._handle_eval(context);

      return this._do(obj);
    }
  }]);

  return UnaryAST;
}(CodeAST);
;
UnaryAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["obj"]);
export var NegAST = function (_UnaryAST) {
  _inherits(NegAST, _UnaryAST);

  function NegAST() {
    _classCallCheck(this, NegAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(NegAST).apply(this, arguments));
  }

  _createClass(NegAST, [{
    key: "_do",
    value: function _do(obj) {
      if (obj !== null && typeof obj.__neg__ === "function") return obj.__neg__();
      return -obj;
    }
  }]);

  return NegAST;
}(UnaryAST);
;
export var BitNotAST = function (_UnaryAST2) {
  _inherits(BitNotAST, _UnaryAST2);

  function BitNotAST() {
    _classCallCheck(this, BitNotAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(BitNotAST).apply(this, arguments));
  }

  _createClass(BitNotAST, [{
    key: "_do",
    value: function _do(obj) {
      return -obj - 1;
    }
  }]);

  return BitNotAST;
}(UnaryAST);
;
export var NotAST = function (_UnaryAST3) {
  _inherits(NotAST, _UnaryAST3);

  function NotAST() {
    _classCallCheck(this, NotAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(NotAST).apply(this, arguments));
  }

  _createClass(NotAST, [{
    key: "_do",
    value: function _do(obj) {
      return !_bool(obj);
    }
  }]);

  return NotAST;
}(UnaryAST);
;
export var IfAST = function (_CodeAST12) {
  _inherits(IfAST, _CodeAST12);

  function IfAST(template, pos, objif, objcond, objelse) {
    var _this27;

    _classCallCheck(this, IfAST);

    _this27 = _possibleConstructorReturn(this, _getPrototypeOf(IfAST).call(this, template, pos));
    _this27.objif = objif;
    _this27.objcond = objcond;
    _this27.objelse = objelse;
    return _this27;
  }

  _createClass(IfAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<");
      out.push(this.constructor.name);
      out.push(+1);
      out.push("objif=");

      this.objif._repr(out);

      out.push(0);
      out.push("objcond=");

      this.objcond._repr(out);

      out.push(0);
      out.push("objelse=");

      this.objelse._repr(out);

      out.push(-1);
      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var result;

      var condvalue = this.objcond._handle_eval(context);

      if (_bool(condvalue)) result = this.objif._handle_eval(context);else result = this.objelse._handle_eval(context);
      return result;
    }
  }]);

  return IfAST;
}(CodeAST);
;
IfAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["objif", "objcond", "objelse"]);
export var ReturnAST = function (_UnaryAST4) {
  _inherits(ReturnAST, _UnaryAST4);

  function ReturnAST() {
    _classCallCheck(this, ReturnAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ReturnAST).apply(this, arguments));
  }

  _createClass(ReturnAST, [{
    key: "_eval",
    value: function _eval(context) {
      var result = this.obj._handle_eval(context);

      throw new ReturnException(result);
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("return ");

      this.obj._str(out);
    }
  }]);

  return ReturnAST;
}(UnaryAST);
;
export var PrintAST = function (_UnaryAST5) {
  _inherits(PrintAST, _UnaryAST5);

  function PrintAST() {
    _classCallCheck(this, PrintAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(PrintAST).apply(this, arguments));
  }

  _createClass(PrintAST, [{
    key: "_eval",
    value: function _eval(context) {
      var obj = this.obj._handle_eval(context);

      var output = _str(obj);

      context.output(output);
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("print ");

      this.obj._str(out);
    }
  }]);

  return PrintAST;
}(UnaryAST);
;
export var PrintXAST = function (_UnaryAST6) {
  _inherits(PrintXAST, _UnaryAST6);

  function PrintXAST() {
    _classCallCheck(this, PrintXAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(PrintXAST).apply(this, arguments));
  }

  _createClass(PrintXAST, [{
    key: "_eval",
    value: function _eval(context) {
      var obj = this.obj._handle_eval(context);

      var output = _xmlescape(obj);

      context.output(output);
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("printx ");

      this.obj._str(out);
    }
  }]);

  return PrintXAST;
}(UnaryAST);
;
export var BinaryAST = function (_CodeAST13) {
  _inherits(BinaryAST, _CodeAST13);

  function BinaryAST(template, pos, obj1, obj2) {
    var _this28;

    _classCallCheck(this, BinaryAST);

    _this28 = _possibleConstructorReturn(this, _getPrototypeOf(BinaryAST).call(this, template, pos));
    _this28.obj1 = obj1;
    _this28.obj2 = obj2;
    return _this28;
  }

  _createClass(BinaryAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<");
      out.push(this.constructor.name);
      out.push(" obj1=");

      this.obj1._repr(out);

      out.push(" obj2=");

      this.obj2._repr(out);

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var obj1 = this.obj1._handle_eval(context);

      var obj2 = this.obj2._handle_eval(context);

      return this._do(obj1, obj2);
    }
  }]);

  return BinaryAST;
}(CodeAST);
;
BinaryAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["obj1", "obj2"]);
export var ItemAST = function (_BinaryAST) {
  _inherits(ItemAST, _BinaryAST);

  function ItemAST() {
    _classCallCheck(this, ItemAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ItemAST).apply(this, arguments));
  }

  _createClass(ItemAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      var result = this._get(obj1, obj2);

      return result;
    }
  }, {
    key: "_eval_set",
    value: function _eval_set(context, value) {
      var obj1 = this.obj1._handle_eval(context);

      var obj2 = this.obj2._handle_eval(context);

      this._set(obj1, obj2, value);
    }
  }, {
    key: "_eval_modify",
    value: function _eval_modify(context, operator, value) {
      var obj1 = this.obj1._handle_eval(context);

      var obj2 = this.obj2._handle_eval(context);

      this._modify(operator, obj1, obj2, value);
    }
  }, {
    key: "_get",
    value: function _get(container, key) {
      if (typeof container === "string" || _islist(container)) {
        if (key instanceof slice) {
          var start = key.start,
              stop = key.stop;
          if (typeof start === "undefined" || start === null) start = 0;
          if (typeof stop === "undefined" || stop === null) stop = container.length;
          return container.slice(start, stop);
        } else {
          var orgkey = key;
          if (key < 0) key += container.length;
          if (key < 0 || key >= container.length) throw new IndexError(container, orgkey);
          return container[key];
        }
      } else if (container && typeof container.__getitem__ === "function") return container.__getitem__(key);else if (_ismap(container)) return container.get(key);else throw new _TypeError(_type(container) + " object is not subscriptable");
    }
  }, {
    key: "_set",
    value: function _set(container, key, value) {
      if (_islist(container)) {
        if (key instanceof slice) {
          var start = key.start,
              stop = key.stop;
          if (start === null) start = 0;else if (start < 0) start += container.length;
          if (start < 0) start = 0;else if (start > container.length) start = container.length;
          if (stop === null) stop = container.length;else if (stop < 0) stop += container.length;
          if (stop < 0) stop = 0;else if (stop > container.length) stop = container.length;
          if (stop < start) stop = start;
          container.splice(start, stop - start);

          for (var iter = _iter(value);;) {
            var item = iter.next();
            if (item.done) break;
            container.splice(start++, 0, item.value);
          }
        } else {
          var orgkey = key;
          if (key < 0) key += container.length;
          if (key < 0 || key >= container.length) throw new IndexError(container, orgkey);
          container[key] = value;
        }
      } else if (container && typeof container.__setitem__ === "function") container.__setitem__(key, value);else if (_ismap(container)) container.set(key, value);else if (_isobject(container)) container[key] = value;else throw new NotSubscriptableError(container);
    }
  }, {
    key: "_modify",
    value: function _modify(operator, container, key, value) {
      this._set(container, key, operator._ido(this._get(container, key), value));
    }
  }]);

  return ItemAST;
}(BinaryAST);
;
export var IsAST = function (_BinaryAST2) {
  _inherits(IsAST, _BinaryAST2);

  function IsAST() {
    _classCallCheck(this, IsAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(IsAST).apply(this, arguments));
  }

  _createClass(IsAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      return obj1 === obj2;
    }
  }]);

  return IsAST;
}(BinaryAST);
;
export var IsNotAST = function (_BinaryAST3) {
  _inherits(IsNotAST, _BinaryAST3);

  function IsNotAST() {
    _classCallCheck(this, IsNotAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(IsNotAST).apply(this, arguments));
  }

  _createClass(IsNotAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      return obj1 !== obj2;
    }
  }]);

  return IsNotAST;
}(BinaryAST);
;
export var EQAST = function (_BinaryAST4) {
  _inherits(EQAST, _BinaryAST4);

  function EQAST() {
    _classCallCheck(this, EQAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(EQAST).apply(this, arguments));
  }

  _createClass(EQAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      return _eq(obj1, obj2);
    }
  }]);

  return EQAST;
}(BinaryAST);
;
export var NEAST = function (_BinaryAST5) {
  _inherits(NEAST, _BinaryAST5);

  function NEAST() {
    _classCallCheck(this, NEAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(NEAST).apply(this, arguments));
  }

  _createClass(NEAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      return _ne(obj1, obj2);
    }
  }]);

  return NEAST;
}(BinaryAST);
;
export var LTAST = function (_BinaryAST6) {
  _inherits(LTAST, _BinaryAST6);

  function LTAST() {
    _classCallCheck(this, LTAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(LTAST).apply(this, arguments));
  }

  _createClass(LTAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      return _lt(obj1, obj2);
    }
  }]);

  return LTAST;
}(BinaryAST);
;
export var LEAST = function (_BinaryAST7) {
  _inherits(LEAST, _BinaryAST7);

  function LEAST() {
    _classCallCheck(this, LEAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(LEAST).apply(this, arguments));
  }

  _createClass(LEAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      return _le(obj1, obj2);
    }
  }]);

  return LEAST;
}(BinaryAST);
;
export var GTAST = function (_BinaryAST8) {
  _inherits(GTAST, _BinaryAST8);

  function GTAST() {
    _classCallCheck(this, GTAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(GTAST).apply(this, arguments));
  }

  _createClass(GTAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      return _gt(obj1, obj2);
    }
  }]);

  return GTAST;
}(BinaryAST);
;
export var GEAST = function (_BinaryAST9) {
  _inherits(GEAST, _BinaryAST9);

  function GEAST() {
    _classCallCheck(this, GEAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(GEAST).apply(this, arguments));
  }

  _createClass(GEAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      return _ge(obj1, obj2);
    }
  }]);

  return GEAST;
}(BinaryAST);
;
export var ContainsAST = function (_BinaryAST10) {
  _inherits(ContainsAST, _BinaryAST10);

  function ContainsAST() {
    _classCallCheck(this, ContainsAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ContainsAST).apply(this, arguments));
  }

  _createClass(ContainsAST, [{
    key: "_do",
    value: function _do(obj, container) {
      if (typeof obj === "string" && typeof container === "string") {
        return container.indexOf(obj) !== -1;
      } else if (_islist(container)) {
        return container.indexOf(obj) !== -1;
      } else if (container && typeof container.__contains__ === "function") return container.__contains__(obj);else if (_ismap(container) || _isset(container)) return container.has(obj);else if (_isobject(container)) {
        for (var key in container) {
          if (key === obj) return true;
        }

        return false;
      } else if (_iscolor(container)) {
        return container._r === obj || container._g === obj || container._b === obj || container._a === obj;
      }

      throw new _TypeError(_type(container) + " object is not iterable");
    }
  }]);

  return ContainsAST;
}(BinaryAST);
;
export var NotContainsAST = function (_BinaryAST11) {
  _inherits(NotContainsAST, _BinaryAST11);

  function NotContainsAST() {
    _classCallCheck(this, NotContainsAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(NotContainsAST).apply(this, arguments));
  }

  _createClass(NotContainsAST, [{
    key: "_do",
    value: function _do(obj, container) {
      return !ContainsAST.prototype._do(obj, container);
    }
  }]);

  return NotContainsAST;
}(BinaryAST);
;
export var AddAST = function (_BinaryAST12) {
  _inherits(AddAST, _BinaryAST12);

  function AddAST() {
    _classCallCheck(this, AddAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(AddAST).apply(this, arguments));
  }

  _createClass(AddAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj1 && typeof obj1.__add__ === "function") return obj1.__add__(obj2);else if (obj2 && typeof obj2.__radd__ === "function") return obj2.__radd__(obj1);
      if (obj1 === null || obj2 === null) throw new _TypeError(_type(this.obj1) + " + " + _type(this.obj2) + " is not supported");
      if (_islist(obj1) && _islist(obj2)) return [].concat(_toConsumableArray(obj1), _toConsumableArray(obj2));else return obj1 + obj2;
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      if (_islist(obj1) && _islist(obj2)) {
        ListProtocol.append(obj1, obj2);
        return obj1;
      } else return this._do(obj1, obj2);
    }
  }]);

  return AddAST;
}(BinaryAST);
;
export var SubAST = function (_BinaryAST13) {
  _inherits(SubAST, _BinaryAST13);

  function SubAST() {
    _classCallCheck(this, SubAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(SubAST).apply(this, arguments));
  }

  _createClass(SubAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj1 && typeof obj1.__sub__ === "function") return obj1.__sub__(obj2);else if (obj2 && typeof obj2.__rsub__ === "function") return obj2.__rsub__(obj1);else if (_isdate(obj1) && _isdate(obj2)) return this._date_sub(obj1, obj2);else if (_isdatetime(obj1) && _isdatetime(obj2)) return this._datetime_sub(obj1, obj2);
      if (obj1 === null || obj2 === null) throw new _TypeError(_type(this.obj1) + " - " + _type(this.obj2) + " is not supported");
      return obj1 - obj2;
    }
  }, {
    key: "_date_sub",
    value: function _date_sub(obj1, obj2) {
      return this._datetime_sub(obj1._date, obj2._date);
    }
  }, {
    key: "_datetime_sub",
    value: function _datetime_sub(obj1, obj2) {
      var swap = obj2 > obj1;

      if (swap) {
        var t = obj1;
        obj1 = obj2;
        obj2 = t;
      }

      var year1 = obj1.getFullYear();
      var yearday1 = DateTimeProtocol.yearday(obj1);
      var year2 = obj2.getFullYear();
      var yearday2 = DateTimeProtocol.yearday(obj2);
      var diffdays = 0;

      while (year1 > year2) {
        diffdays += DateProtocol.yearday(_date(year2, 12, 31));
        ++year2;
      }

      diffdays += yearday1 - yearday2;
      var hours1 = obj1.getHours();
      var minutes1 = obj1.getMinutes();
      var seconds1 = obj1.getSeconds();
      var hours2 = obj2.getHours();
      var minutes2 = obj2.getMinutes();
      var seconds2 = obj2.getSeconds();
      var diffseconds = seconds1 - seconds2 + 60 * (minutes1 - minutes2 + 60 * (hours1 - hours2));
      var diffmilliseconds = obj1.getMilliseconds() - obj2.getMilliseconds();

      if (swap) {
        diffdays = -diffdays;
        diffseconds = -diffseconds;
        diffmilliseconds = -diffmilliseconds;
      }

      return new TimeDelta(diffdays, diffseconds, 1000 * diffmilliseconds);
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      return this._do(obj1, obj2);
    }
  }]);

  return SubAST;
}(BinaryAST);
;
export var MulAST = function (_BinaryAST14) {
  _inherits(MulAST, _BinaryAST14);

  function MulAST() {
    _classCallCheck(this, MulAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(MulAST).apply(this, arguments));
  }

  _createClass(MulAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj1 && typeof obj1.__mul__ === "function") return obj1.__mul__(obj2);else if (obj2 && typeof obj2.__rmul__ === "function") return obj2.__rmul__(obj1);
      if (obj1 === null || obj2 === null) throw new _TypeError(_type(obj1) + " * " + _type(obj2) + " not supported");else if (_isint(obj1) || _isbool(obj1)) {
        if (typeof obj2 === "string") {
          if (obj1 < 0) throw new ValueError("repetition counter must be positive");
          return _str_repeat(obj2, obj1);
        } else if (_islist(obj2)) {
          if (obj1 < 0) throw new ValueError("repetition counter must be positive");
          return _list_repeat(obj2, obj1);
        }
      } else if (_isint(obj2) || _isbool(obj2)) {
        if (typeof obj1 === "string") {
          if (obj2 < 0) throw new ValueError("repetition counter must be positive");
          return _str_repeat(obj1, obj2);
        } else if (_islist(obj1)) {
          if (obj2 < 0) throw new ValueError("repetition counter must be positive");
          return _list_repeat(obj1, obj2);
        }
      }
      return obj1 * obj2;
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      if (_islist(obj1) && _isint(obj2)) {
        if (obj2 > 0) {
          var i = 0;
          var targetsize = obj1.length * obj2;

          while (obj1.length < targetsize) {
            obj1.push(obj1[i++]);
          }
        } else obj1.splice(0, obj1.length);

        return obj1;
      } else return this._do(obj1, obj2);
    }
  }]);

  return MulAST;
}(BinaryAST);
;
export var FloorDivAST = function (_BinaryAST15) {
  _inherits(FloorDivAST, _BinaryAST15);

  function FloorDivAST() {
    _classCallCheck(this, FloorDivAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(FloorDivAST).apply(this, arguments));
  }

  _createClass(FloorDivAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj1 && typeof obj1.__floordiv__ === "function") return obj1.__floordiv__(obj2);else if (obj2 && typeof obj2.__rfloordiv__ === "function") return obj2.__rfloordiv__(obj1);
      if (obj1 === null || obj2 === null) throw new _TypeError(_type(obj1) + " // " + _type(obj2) + " not supported");else if (typeof obj1 === "number" && typeof obj2 === "number" && obj2 === 0) throw new ZeroDivisionError();
      return Math.floor(obj1 / obj2);
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      return this._do(obj1, obj2);
    }
  }]);

  return FloorDivAST;
}(BinaryAST);
;
export var TrueDivAST = function (_BinaryAST16) {
  _inherits(TrueDivAST, _BinaryAST16);

  function TrueDivAST() {
    _classCallCheck(this, TrueDivAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(TrueDivAST).apply(this, arguments));
  }

  _createClass(TrueDivAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj1 && typeof obj1.__truediv__ === "function") return obj1.__truediv__(obj2);else if (obj2 && typeof obj2.__rtruediv__ === "function") return obj2.__rtruediv__(obj1);
      if (obj1 === null || obj2 === null) throw new _TypeError(_type(obj1) + " / " + _type(obj2) + " not supported");else if (typeof obj1 === "number" && typeof obj2 === "number" && obj2 === 0) throw new ZeroDivisionError();
      return obj1 / obj2;
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      return this._do(obj1, obj2);
    }
  }]);

  return TrueDivAST;
}(BinaryAST);
;
export var ModAST = function (_BinaryAST17) {
  _inherits(ModAST, _BinaryAST17);

  function ModAST() {
    _classCallCheck(this, ModAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ModAST).apply(this, arguments));
  }

  _createClass(ModAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      return _mod(obj1, obj2);
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      return this._do(obj1, obj2);
    }
  }]);

  return ModAST;
}(BinaryAST);
;
export var ShiftLeftAST = function (_BinaryAST18) {
  _inherits(ShiftLeftAST, _BinaryAST18);

  function ShiftLeftAST() {
    _classCallCheck(this, ShiftLeftAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ShiftLeftAST).apply(this, arguments));
  }

  _createClass(ShiftLeftAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj2 === false) obj2 = 0;else if (obj2 === true) obj2 = 1;
      if (obj2 < 0) return ShiftRightAST.prototype._do(obj1, -obj2);
      if (obj1 === false) obj1 = 0;else if (obj1 === true) obj1 = 1;

      while (obj2--) {
        obj1 *= 2;
      }

      return obj1;
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      return this._do(obj1, obj2);
    }
  }]);

  return ShiftLeftAST;
}(BinaryAST);
;
export var ShiftRightAST = function (_BinaryAST19) {
  _inherits(ShiftRightAST, _BinaryAST19);

  function ShiftRightAST() {
    _classCallCheck(this, ShiftRightAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ShiftRightAST).apply(this, arguments));
  }

  _createClass(ShiftRightAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj2 === false) obj2 = 0;else if (obj2 === true) obj2 = 1;
      if (obj2 < 0) return ShiftLeftAST.prototype._do(obj1, -obj2);
      if (obj1 === false) obj1 = 0;else if (obj1 === true) obj1 = 1;

      while (obj2--) {
        obj1 /= 2;
      }

      return Math.floor(obj1);
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      return this._do(obj1, obj2);
    }
  }]);

  return ShiftRightAST;
}(BinaryAST);
;
export var BitAndAST = function (_BinaryAST20) {
  _inherits(BitAndAST, _BinaryAST20);

  function BitAndAST() {
    _classCallCheck(this, BitAndAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(BitAndAST).apply(this, arguments));
  }

  _createClass(BitAndAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj2 === false) obj2 = 0;else if (obj2 === true) obj2 = 1;
      return obj1 & obj2;
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      return this._do(obj1, obj2);
    }
  }]);

  return BitAndAST;
}(BinaryAST);
;
export var BitXOrAST = function (_BinaryAST21) {
  _inherits(BitXOrAST, _BinaryAST21);

  function BitXOrAST() {
    _classCallCheck(this, BitXOrAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(BitXOrAST).apply(this, arguments));
  }

  _createClass(BitXOrAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj2 === false) obj2 = 0;else if (obj2 === true) obj2 = 1;
      return obj1 ^ obj2;
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      return this._do(obj1, obj2);
    }
  }]);

  return BitXOrAST;
}(BinaryAST);
;
export var BitOrAST = function (_BinaryAST22) {
  _inherits(BitOrAST, _BinaryAST22);

  function BitOrAST() {
    _classCallCheck(this, BitOrAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(BitOrAST).apply(this, arguments));
  }

  _createClass(BitOrAST, [{
    key: "_do",
    value: function _do(obj1, obj2) {
      if (obj2 === false) obj2 = 0;else if (obj2 === true) obj2 = 1;
      return obj1 | obj2;
    }
  }, {
    key: "_ido",
    value: function _ido(obj1, obj2) {
      return this._do(obj1, obj2);
    }
  }]);

  return BitOrAST;
}(BinaryAST);
;
export var AndAST = function (_BinaryAST23) {
  _inherits(AndAST, _BinaryAST23);

  function AndAST() {
    _classCallCheck(this, AndAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(AndAST).apply(this, arguments));
  }

  _createClass(AndAST, [{
    key: "_eval",
    value: function _eval(context) {
      var obj1 = this.obj1._handle_eval(context);

      if (!_bool(obj1)) return obj1;

      var obj2 = this.obj2._handle_eval(context);

      return obj2;
    }
  }]);

  return AndAST;
}(BinaryAST);
;
export var OrAST = function (_BinaryAST24) {
  _inherits(OrAST, _BinaryAST24);

  function OrAST() {
    _classCallCheck(this, OrAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(OrAST).apply(this, arguments));
  }

  _createClass(OrAST, [{
    key: "_eval",
    value: function _eval(context) {
      var obj1 = this.obj1._handle_eval(context);

      if (_bool(obj1)) return obj1;

      var obj2 = this.obj2._handle_eval(context);

      return obj2;
    }
  }]);

  return OrAST;
}(BinaryAST);
;
export var AttrAST = function (_CodeAST14) {
  _inherits(AttrAST, _CodeAST14);

  function AttrAST(template, pos, obj, attrname) {
    var _this29;

    _classCallCheck(this, AttrAST);

    _this29 = _possibleConstructorReturn(this, _getPrototypeOf(AttrAST).call(this, template, pos));
    _this29.obj = obj;
    _this29.attrname = attrname;
    return _this29;
  }

  _createClass(AttrAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<AttrAST");
      out.push(" obj=");

      this.obj._repr(out);

      out.push(" attrname=");
      out.push(_repr2(this.attrname));
      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var obj = this.obj._handle_eval(context);

      var result = this._get(obj, this.attrname);

      return result;
    }
  }, {
    key: "_eval_set",
    value: function _eval_set(context, value) {
      var obj = this.obj._handle_eval(context);

      this._set(obj, this.attrname, value);
    }
  }, {
    key: "_eval_modify",
    value: function _eval_modify(context, operator, value) {
      var obj = this.obj._handle_eval(context);

      this._modify(operator, obj, this.attrname, value);
    }
  }, {
    key: "_get",
    value: function _get(object, attrname) {
      var proto = Protocol.get(object);

      try {
        return proto.getattr(object, attrname);
      } catch (exc) {
        if (exc instanceof AttributeError && exc.obj === object) return undefined;else throw exc;
      }
    }
  }, {
    key: "_set",
    value: function _set(object, attrname, value) {
      if (_typeof(object) === "object" && typeof object.__setattr__ === "function") object.__setattr__(attrname, value);else if (_ismap(object)) object.set(attrname, value);else if (_isobject(object)) object[attrname] = value;else throw new _TypeError(_type(object) + " object has no writable attributes");
    }
  }, {
    key: "_modify",
    value: function _modify(operator, object, attrname, value) {
      var oldvalue = this._get(object, attrname);

      var newvalue = operator._ido(oldvalue, value);

      this._set(object, attrname, newvalue);
    }
  }]);

  return AttrAST;
}(CodeAST);
;
AttrAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["obj", "attrname"]);
export var CallAST = function (_CodeAST15) {
  _inherits(CallAST, _CodeAST15);

  function CallAST(template, pos, obj, args) {
    var _this30;

    _classCallCheck(this, CallAST);

    _this30 = _possibleConstructorReturn(this, _getPrototypeOf(CallAST).call(this, template, pos));
    _this30.obj = obj;
    _this30.args = args;
    return _this30;
  }

  _createClass(CallAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<CallAST");
      out.push(" obj=");

      this.obj._repr(out);

      for (var i = 0; i < this.args.length; ++i) {
        var arg = this.args[i];
        out.push(" ");

        arg._repr(out);
      }

      out.push(">");
    }
  }, {
    key: "_makeargs",
    value: function _makeargs(context) {
      var args = [],
          kwargs = {};

      for (var i = 0; i < this.args.length; ++i) {
        var arg = this.args[i];

        arg._handle_eval_call(context, args, kwargs);
      }

      return {
        args: args,
        kwargs: kwargs
      };
    }
  }, {
    key: "_handle_eval",
    value: function _handle_eval(context) {
      try {
        return this._eval(context);
      } catch (exc) {
        this._decorate_exception(exc);

        throw exc;
      }
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var obj = this.obj._handle_eval(context);

      var args = this._makeargs(context);

      var result = _call(context, obj, args.args, args.kwargs);

      return result;
    }
  }]);

  return CallAST;
}(CodeAST);
;
CallAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["obj", "args"]);
export var RenderAST = function (_CallAST) {
  _inherits(RenderAST, _CallAST);

  function RenderAST(template, pos, obj, args) {
    var _this31;

    _classCallCheck(this, RenderAST);

    _this31 = _possibleConstructorReturn(this, _getPrototypeOf(RenderAST).call(this, template, pos, obj, args));
    _this31.indent = null;
    return _this31;
  }

  _createClass(RenderAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<");
      out.push(this._reprname);
      out.push("<RenderAST");
      out.push(" indent=");
      out.push(_repr2(this.indent));
      out.push(" obj=");

      this.obj._repr(out);

      out.push(0);

      for (var i = 0; i < this.args.length; ++i) {
        var arg = this.args[i];
        out.push(" ");

        arg._repr(out);

        out.push(0);
      }

      out.push(-1);
      out.push(">");
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("render ");
      out.push(this.tag.code.replace(/\r?\n/g, ' '));

      if (this.indent !== null) {
        out.push(" with indent ");
        out.push(_repr2(this.indent.text));
      }
    }
  }, {
    key: "_handle_eval",
    value: function _handle_eval(context) {
      var localcontext = context.withindent(this.indent !== null ? this.indent.text : null);

      var obj = this.obj._handle_eval(localcontext);

      var args = this._makeargs(localcontext);

      this._handle_additional_arguments(localcontext, args);

      try {
        var result = _callrender(localcontext, obj, args.args, args.kwargs);

        return result;
      } catch (exc) {
        this._decorate_exception(exc);

        throw exc;
      }
    }
  }, {
    key: "_handle_additional_arguments",
    value: function _handle_additional_arguments(context, args) {}
  }]);

  return RenderAST;
}(CallAST);
;
RenderAST.prototype._ul4onattrs = CallAST.prototype._ul4onattrs.concat(["indent"]);
RenderAST.prototype._reprname = "RenderAST";
export var RenderXAST = function (_RenderAST) {
  _inherits(RenderXAST, _RenderAST);

  function RenderXAST() {
    _classCallCheck(this, RenderXAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(RenderXAST).apply(this, arguments));
  }

  _createClass(RenderXAST, [{
    key: "_handle_eval",
    value: function _handle_eval(context) {
      context.escapes.push(_xmlescape);
      var result = null;

      try {
        result = _get2(_getPrototypeOf(RenderXAST.prototype), "_handle_eval", this).call(this, context);
      } finally {
        context.escapes.splice(context.escapes.length - 1, 1);
      }

      return result;
    }
  }]);

  return RenderXAST;
}(RenderAST);
;
export var RenderBlockAST = function (_RenderAST2) {
  _inherits(RenderBlockAST, _RenderAST2);

  function RenderBlockAST() {
    _classCallCheck(this, RenderBlockAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(RenderBlockAST).apply(this, arguments));
  }

  _createClass(RenderBlockAST, [{
    key: "_handle_additional_arguments",
    value: function _handle_additional_arguments(context, args) {
      if (args.kwargs.hasOwnProperty("content")) throw new ArgumentError("duplicate keyword argument content");
      var closure = new TemplateClosure(this.content, this.content.signature, context.vars);
      args.kwargs.content = closure;
    }
  }]);

  return RenderBlockAST;
}(RenderAST);
;
RenderBlockAST.prototype._ul4onattrs = RenderAST.prototype._ul4onattrs.concat(["content"]);
export var RenderBlocksAST = function (_RenderAST3) {
  _inherits(RenderBlocksAST, _RenderAST3);

  function RenderBlocksAST() {
    _classCallCheck(this, RenderBlocksAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(RenderBlocksAST).apply(this, arguments));
  }

  _createClass(RenderBlocksAST, [{
    key: "_handle_additional_arguments",
    value: function _handle_additional_arguments(context, args) {
      var localcontext = context.inheritvars();

      BlockAST.prototype._eval.call(this, localcontext);

      for (var key in localcontext.vars) {
        if (localcontext.vars.hasOwnProperty(key)) {
          if (key in args.kwargs) throw new ArgumentError("duplicate keyword argument " + key);
          args.kwargs[key] = localcontext.get(key);
        }
      }
    }
  }]);

  return RenderBlocksAST;
}(RenderAST);
;
RenderBlocksAST.prototype._ul4onattrs = RenderAST.prototype._ul4onattrs.concat(["content"]);
export var slice = function (_Proto3) {
  _inherits(slice, _Proto3);

  function slice(start, stop) {
    var _this32;

    _classCallCheck(this, slice);

    _this32 = _possibleConstructorReturn(this, _getPrototypeOf(slice).call(this));
    _this32.start = start;
    _this32.stop = stop;
    return _this32;
  }

  _createClass(slice, [{
    key: "of",
    value: function of(string) {
      var start = this.start || 0;
      var stop = this.stop === null ? string.length : this.stop;
      return string.slice(start, stop);
    }
  }, {
    key: "__repr__",
    value: function __repr__() {
      return "slice(" + _repr2(this.start) + ", " + _repr2(this.stop) + ", None)";
    }
  }, {
    key: "__getattr__",
    value: function __getattr__(attrname) {
      switch (attrname) {
        case "start":
          return this.start;

        case "stop":
          return this.stop;

        default:
          throw new AttributeError(this, attrname);
      }
    }
  }]);

  return slice;
}(Proto);
;
export var SliceAST = function (_CodeAST16) {
  _inherits(SliceAST, _CodeAST16);

  function SliceAST(template, pos, index1, index2) {
    var _this33;

    _classCallCheck(this, SliceAST);

    _this33 = _possibleConstructorReturn(this, _getPrototypeOf(SliceAST).call(this, template, pos));
    _this33.index1 = index1;
    _this33.index2 = index2;
    return _this33;
  }

  _createClass(SliceAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<SliceAST");

      if (this.index1 !== null) {
        out.push(" index1=");

        this.index1._repr(out);
      }

      if (this.index2 !== null) {
        out.push(" index2=");

        this.index2._repr(out);
      }

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var index1 = this.index1 !== null ? this.index1._handle_eval(context) : null;
      var index2 = this.index2 !== null ? this.index2._handle_eval(context) : null;
      return new slice(index1, index2);
    }
  }]);

  return SliceAST;
}(CodeAST);
;
SliceAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["index1", "index2"]);
export var SetVarAST = function (_CodeAST17) {
  _inherits(SetVarAST, _CodeAST17);

  function SetVarAST(template, pos, lvalue, value) {
    var _this34;

    _classCallCheck(this, SetVarAST);

    _this34 = _possibleConstructorReturn(this, _getPrototypeOf(SetVarAST).call(this, template, pos));
    _this34.lvalue = lvalue;
    _this34.value = value;
    return _this34;
  }

  _createClass(SetVarAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<");
      out.push(this.constructor.name);
      out.push(" lvalue=");
      out.push(_repr2(this.lvalue));
      out.push(" value=");

      this.value._repr(out);

      out.push(">");
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var value = this.value._handle_eval(context);

      var items = _unpackvar(this.lvalue, value);

      for (var i = 0; i < items.length; ++i) {
        var _items$i = _slicedToArray(items[i], 2),
            lvalue = _items$i[0],
            _value12 = _items$i[1];

        lvalue._handle_eval_set(context, _value12);
      }
    }
  }]);

  return SetVarAST;
}(CodeAST);
;
SetVarAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["lvalue", "value"]);
export var ModifyVarAST = function (_SetVarAST) {
  _inherits(ModifyVarAST, _SetVarAST);

  function ModifyVarAST() {
    _classCallCheck(this, ModifyVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ModifyVarAST).apply(this, arguments));
  }

  _createClass(ModifyVarAST, [{
    key: "_eval",
    value: function _eval(context) {
      var value = this.value._handle_eval(context);

      var items = _unpackvar(this.lvalue, value);

      for (var i = 0; i < items.length; ++i) {
        var _items$i2 = _slicedToArray(items[i], 2),
            lvalue = _items$i2[0],
            _value13 = _items$i2[1];

        lvalue._handle_eval_modify(context, this._operator, _value13);
      }
    }
  }]);

  return ModifyVarAST;
}(SetVarAST);
;
export var AddVarAST = function (_ModifyVarAST) {
  _inherits(AddVarAST, _ModifyVarAST);

  function AddVarAST() {
    _classCallCheck(this, AddVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(AddVarAST).apply(this, arguments));
  }

  return AddVarAST;
}(ModifyVarAST);
;
AddVarAST.prototype._operator = AddAST.prototype;
export var SubVarAST = function (_ModifyVarAST2) {
  _inherits(SubVarAST, _ModifyVarAST2);

  function SubVarAST() {
    _classCallCheck(this, SubVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(SubVarAST).apply(this, arguments));
  }

  return SubVarAST;
}(ModifyVarAST);
;
SubVarAST.prototype._operator = SubAST.prototype;
export var MulVarAST = function (_ModifyVarAST3) {
  _inherits(MulVarAST, _ModifyVarAST3);

  function MulVarAST() {
    _classCallCheck(this, MulVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(MulVarAST).apply(this, arguments));
  }

  return MulVarAST;
}(ModifyVarAST);
;
MulVarAST.prototype._operator = MulAST.prototype;
export var TrueDivVarAST = function (_ModifyVarAST4) {
  _inherits(TrueDivVarAST, _ModifyVarAST4);

  function TrueDivVarAST() {
    _classCallCheck(this, TrueDivVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(TrueDivVarAST).apply(this, arguments));
  }

  return TrueDivVarAST;
}(ModifyVarAST);
;
TrueDivVarAST.prototype._operator = TrueDivAST.prototype;
export var FloorDivVarAST = function (_ModifyVarAST5) {
  _inherits(FloorDivVarAST, _ModifyVarAST5);

  function FloorDivVarAST() {
    _classCallCheck(this, FloorDivVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(FloorDivVarAST).apply(this, arguments));
  }

  return FloorDivVarAST;
}(ModifyVarAST);
;
FloorDivVarAST.prototype._operator = FloorDivAST.prototype;
export var ModVarAST = function (_ModifyVarAST6) {
  _inherits(ModVarAST, _ModifyVarAST6);

  function ModVarAST() {
    _classCallCheck(this, ModVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ModVarAST).apply(this, arguments));
  }

  return ModVarAST;
}(ModifyVarAST);
;
ModVarAST.prototype._operator = ModAST.prototype;
export var ShiftLeftVarAST = function (_ModifyVarAST7) {
  _inherits(ShiftLeftVarAST, _ModifyVarAST7);

  function ShiftLeftVarAST() {
    _classCallCheck(this, ShiftLeftVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ShiftLeftVarAST).apply(this, arguments));
  }

  return ShiftLeftVarAST;
}(ModifyVarAST);
;
ShiftLeftVarAST.prototype._operator = ShiftLeftAST.prototype;
export var ShiftRightVarAST = function (_ModifyVarAST8) {
  _inherits(ShiftRightVarAST, _ModifyVarAST8);

  function ShiftRightVarAST() {
    _classCallCheck(this, ShiftRightVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ShiftRightVarAST).apply(this, arguments));
  }

  return ShiftRightVarAST;
}(ModifyVarAST);
;
ShiftRightVarAST.prototype._operator = ShiftRightAST.prototype;
export var BitAndVarAST = function (_ModifyVarAST9) {
  _inherits(BitAndVarAST, _ModifyVarAST9);

  function BitAndVarAST() {
    _classCallCheck(this, BitAndVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(BitAndVarAST).apply(this, arguments));
  }

  return BitAndVarAST;
}(ModifyVarAST);
;
BitAndVarAST.prototype._operator = BitAndAST.prototype;
export var BitXOrVarAST = function (_ModifyVarAST10) {
  _inherits(BitXOrVarAST, _ModifyVarAST10);

  function BitXOrVarAST() {
    _classCallCheck(this, BitXOrVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(BitXOrVarAST).apply(this, arguments));
  }

  return BitXOrVarAST;
}(ModifyVarAST);
;
BitXOrVarAST.prototype._operator = BitXOrAST.prototype;
export var BitOrVarAST = function (_ModifyVarAST11) {
  _inherits(BitOrVarAST, _ModifyVarAST11);

  function BitOrVarAST() {
    _classCallCheck(this, BitOrVarAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(BitOrVarAST).apply(this, arguments));
  }

  return BitOrVarAST;
}(ModifyVarAST);
;
BitOrVarAST.prototype._operator = BitOrAST.prototype;
export var BlockAST = function (_CodeAST18) {
  _inherits(BlockAST, _CodeAST18);

  function BlockAST(template, pos) {
    var _this35;

    _classCallCheck(this, BlockAST);

    _this35 = _possibleConstructorReturn(this, _getPrototypeOf(BlockAST).call(this, template, pos));
    _this35.content = [];
    return _this35;
  }

  _createClass(BlockAST, [{
    key: "_eval",
    value: function _eval(context) {
      for (var i = 0; i < this.content.length; ++i) {
        var item = this.content[i];

        item._handle_eval(context);
      }
    }
  }, {
    key: "_str",
    value: function _str(out) {
      if (this.content.length) {
        for (var i = 0; i < this.content.length; ++i) {
          var item = this.content[i];

          item._str(out);

          out.push(0);
        }
      } else {
        out.push("pass");
        out.push(0);
      }
    }
  }]);

  return BlockAST;
}(CodeAST);
;
BlockAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["content"]);
export var ForBlockAST = function (_BlockAST) {
  _inherits(ForBlockAST, _BlockAST);

  function ForBlockAST(template, pos, varname, container) {
    var _this36;

    _classCallCheck(this, ForBlockAST);

    _this36 = _possibleConstructorReturn(this, _getPrototypeOf(ForBlockAST).call(this, template, pos));
    _this36.varname = varname;
    _this36.container = container;
    return _this36;
  }

  _createClass(ForBlockAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<ForBlockAST");
      out.push(" varname=");
      out.push(_repr2(this.varname));
      out.push(" container=");

      this.container._repr(out);

      out.push(">");
    }
  }, {
    key: "_str_varname",
    value: function _str_varname(out, varname) {
      if (_islist(varname)) {
        out.push("(");

        for (var i = 0; i < varname.length; ++i) {
          if (i) out.push(", ");

          this._str_varname(out, varname[i]);
        }

        if (varname.length == 1) out.push(",");
        out.push(")");
      } else varname._str(out);
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var container = this.container._handle_eval(context);

      for (var iter = _iter(container);;) {
        var value = iter.next();
        if (value.done) break;

        var varitems = _unpackvar(this.varname, value.value);

        for (var i = 0; i < varitems.length; ++i) {
          var _varitems$i5 = _slicedToArray(varitems[i], 2),
              lvalue = _varitems$i5[0],
              _value14 = _varitems$i5[1];

          lvalue._handle_eval_set(context, _value14);
        }

        try {
          _get2(_getPrototypeOf(ForBlockAST.prototype), "_eval", this).call(this, context);
        } catch (exc) {
          if (exc instanceof BreakException) break;else if (exc instanceof ContinueException) ;else throw exc;
        }
      }
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("for ");

      this._str_varname(out, this.varname);

      out.push(" in ");

      this.container._str(out);

      out.push(":");
      out.push(+1);

      BlockAST.prototype._str.call(this, out);

      out.push(-1);
    }
  }]);

  return ForBlockAST;
}(BlockAST);
;
ForBlockAST.prototype._ul4onattrs = BlockAST.prototype._ul4onattrs.concat(["varname", "container"]);
export var WhileBlockAST = function (_BlockAST2) {
  _inherits(WhileBlockAST, _BlockAST2);

  function WhileBlockAST(template, pos, condition) {
    var _this37;

    _classCallCheck(this, WhileBlockAST);

    _this37 = _possibleConstructorReturn(this, _getPrototypeOf(WhileBlockAST).call(this, template, pos));
    _this37.condition = condition;
    return _this37;
  }

  _createClass(WhileBlockAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<WhileAST");
      out.push(" condition=");

      this.condition._repr(out);

      out.push(">");
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("while ");

      this.condition._repr(out);

      out.push(":");
      out.push(+1);

      BlockAST.prototype._str.call(this, out);

      out.push(-1);
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      while (true) {
        var cond = this.condition._handle_eval(context);

        if (!_bool(cond)) break;

        try {
          _get2(_getPrototypeOf(WhileBlockAST.prototype), "_eval", this).call(this, context);
        } catch (exc) {
          if (exc instanceof BreakException) break;else if (exc instanceof ContinueException) ;else throw exc;
        }
      }
    }
  }]);

  return WhileBlockAST;
}(BlockAST);
;
WhileBlockAST.prototype._ul4onattrs = BlockAST.prototype._ul4onattrs.concat(["condition"]);
export var BreakAST = function (_CodeAST19) {
  _inherits(BreakAST, _CodeAST19);

  function BreakAST() {
    _classCallCheck(this, BreakAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(BreakAST).apply(this, arguments));
  }

  _createClass(BreakAST, [{
    key: "_eval",
    value: function _eval(context) {
      throw new BreakException();
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("break");
      out.push(0);
    }
  }, {
    key: "_repr",
    value: function _repr(out) {
      out.push("<BreakAST>");
    }
  }]);

  return BreakAST;
}(CodeAST);
;
export var ContinueAST = function (_CodeAST20) {
  _inherits(ContinueAST, _CodeAST20);

  function ContinueAST() {
    _classCallCheck(this, ContinueAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ContinueAST).apply(this, arguments));
  }

  _createClass(ContinueAST, [{
    key: "_eval",
    value: function _eval(context) {
      throw new ContinueException();
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("continue");
      out.push(0);
    }
  }, {
    key: "_repr",
    value: function _repr(out) {
      out.push("<ContinueAST>");
    }
  }]);

  return ContinueAST;
}(CodeAST);
;
export var CondBlockAST = function (_BlockAST3) {
  _inherits(CondBlockAST, _BlockAST3);

  function CondBlockAST() {
    _classCallCheck(this, CondBlockAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(CondBlockAST).apply(this, arguments));
  }

  _createClass(CondBlockAST, [{
    key: "_eval",
    value: function _eval(context) {
      for (var i = 0; i < this.content.length; ++i) {
        var block = this.content[i];

        var execute = block._execute(context);

        if (execute) {
          block._handle_eval(context);

          break;
        }
      }
    }
  }]);

  return CondBlockAST;
}(BlockAST);
;
export var ConditionalBlockAST = function (_BlockAST4) {
  _inherits(ConditionalBlockAST, _BlockAST4);

  function ConditionalBlockAST(template, pos, condition) {
    var _this38;

    _classCallCheck(this, ConditionalBlockAST);

    _this38 = _possibleConstructorReturn(this, _getPrototypeOf(ConditionalBlockAST).call(this, template, pos));
    _this38.condition = condition;
    return _this38;
  }

  _createClass(ConditionalBlockAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<");
      out.push(this.constructor.name);
      out.push(" condition=");

      this.condition._repr(out);

      out.push(">");
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push(this._strname);
      out.push(" ");

      this.condition._str(out);

      out.push(":");
      out.push(+1);

      BlockAST.prototype._str.call(this, out);

      out.push(-1);
    }
  }, {
    key: "_execute",
    value: function _execute(context) {
      var cond = this.condition._handle_eval(context);

      var result = _bool(cond);

      return result;
    }
  }]);

  return ConditionalBlockAST;
}(BlockAST);
;
ConditionalBlockAST.prototype._ul4onattrs = BlockAST.prototype._ul4onattrs.concat(["condition"]);
export var IfBlockAST = function (_ConditionalBlockAST) {
  _inherits(IfBlockAST, _ConditionalBlockAST);

  function IfBlockAST() {
    _classCallCheck(this, IfBlockAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(IfBlockAST).apply(this, arguments));
  }

  return IfBlockAST;
}(ConditionalBlockAST);
;
IfBlockAST.prototype._strname = "if";
export var ElIfBlockAST = function (_ConditionalBlockAST2) {
  _inherits(ElIfBlockAST, _ConditionalBlockAST2);

  function ElIfBlockAST() {
    _classCallCheck(this, ElIfBlockAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ElIfBlockAST).apply(this, arguments));
  }

  return ElIfBlockAST;
}(ConditionalBlockAST);
;
ElIfBlockAST.prototype._strname = "else if";
export var ElseBlockAST = function (_BlockAST5) {
  _inherits(ElseBlockAST, _BlockAST5);

  function ElseBlockAST() {
    _classCallCheck(this, ElseBlockAST);

    return _possibleConstructorReturn(this, _getPrototypeOf(ElseBlockAST).apply(this, arguments));
  }

  _createClass(ElseBlockAST, [{
    key: "_repr",
    value: function _repr(out) {
      out.push("<ElseAST");
      out.push(">");
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("else:");
      out.push(+1);

      BlockAST.prototype._str.call(this, out);

      out.push(-1);
    }
  }, {
    key: "_execute",
    value: function _execute(context) {
      return true;
    }
  }]);

  return ElseBlockAST;
}(BlockAST);
;
export var Template = function (_BlockAST6) {
  _inherits(Template, _BlockAST6);

  function Template(template, pos, source, name, whitespace, startdelim, enddelim, signature) {
    var _this39;

    _classCallCheck(this, Template);

    _this39 = _possibleConstructorReturn(this, _getPrototypeOf(Template).call(this, template, pos));
    _this39._source = source;
    _this39.name = name;
    _this39.whitespace = whitespace;
    _this39.startdelim = startdelim;
    _this39.enddelim = enddelim;
    _this39.docpos = null;
    _this39.signature = signature;
    _this39._asts = null;
    _this39._ul4_callsignature = signature;
    _this39._ul4_rendersignature = signature;
    _this39.parenttemplate = null;
    return _this39;
  }

  _createClass(Template, [{
    key: "__getattr__",
    value: function __getattr__(attrname) {
      var self = this;

      switch (attrname) {
        case "content":
          return this.content;

        case "source":
          return this.source;

        case "name":
          return this.name;

        case "whitespace":
          return this.whitespace;

        case "startdelim":
          return this.startdelim;

        case "enddelim":
          return this.enddelim;

        case "doc":
          return this.doc();

        case "signature":
          return this.signature;

        case "parenttemplate":
          return this.parenttemplate;

        case "render":
          var render = function render(context, vars) {
            self._renderbound(context, vars);
          };

          expose(render, this.signature, {
            needscontext: true,
            needsobject: true
          });
          return render;

        case "renders":
          var renders = function renders(context, vars) {
            return self._rendersbound(context, vars);
          };

          expose(renders, this.signature, {
            needscontext: true,
            needsobject: true
          });
          return renders;

        default:
          return _get2(_getPrototypeOf(Template.prototype), "__getattr__", this).call(this, attrname);
      }
    }
  }, {
    key: "ul4ondump",
    value: function ul4ondump(encoder) {
      var signature;
      encoder.dump(version);
      encoder.dump(this.name);
      encoder.dump(this._source);
      encoder.dump(this.whitespace);
      encoder.dump(this.startdelim);
      encoder.dump(this.enddelim);
      encoder.dump(this.docpos);
      encoder.dump(this.parenttemplate);
      if (this.signature === null || this.signature instanceof SignatureAST) signature = this.signature;else {
        signature = [];

        for (var i = 0; i < this.signature.args.length; ++i) {
          var arg = this.signature.args[i];
          if (typeof arg.defaultValue === "undefined") signature.push(arg.name);else signature.push(arg.name + "=", arg.defaultValue);
        }

        if (this.signature.remargs !== null) signature.push("*" + this.signature.remargs);
        if (this.signature.remkwargs !== null) signature.push("**" + this.signature.remkwargs);
      }
      encoder.dump(signature);

      _get2(_getPrototypeOf(Template.prototype), "ul4ondump", this).call(this, encoder);
    }
  }, {
    key: "ul4onload",
    value: function ul4onload(decoder) {
      var version = decoder.load();
      var signature;
      if (version === null) throw new ValueError("UL4ON doesn't support templates in 'source' format in Javascript implementation");
      if (version !== version) throw new ValueError("invalid version, expected " + version + ", got " + version);
      this.name = decoder.load();
      this._source = decoder.load();
      this.whitespace = decoder.load();
      this.startdelim = decoder.load();
      this.enddelim = decoder.load();
      this.docpos = decoder.load();
      this.parenttemplate = decoder.load();
      signature = decoder.load();
      if (_islist(signature)) signature = _construct(Signature, _toConsumableArray(signature));
      this.signature = signature;
      this._ul4_callsignature = signature;
      this._ul4_rendersignature = signature;

      _get2(_getPrototypeOf(Template.prototype), "ul4onload", this).call(this, decoder);
    }
  }, {
    key: "loads",
    value: function loads(string) {
      return _loads(string);
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var signature = null;
      if (this.signature !== null) signature = this.signature._handle_eval(context);
      var closure = new TemplateClosure(this, signature, context.vars);
      context.set(this.name, closure);
    }
  }, {
    key: "_repr",
    value: function _repr(out) {
      out.push("<Template");

      if (this.name !== null) {
        out.push(" name=");
        out.push(_repr2(this.name));
      }

      out.push(" whitespace=");
      out.push(_repr2(this.whitespace));

      if (this.startdelim !== "<?") {
        out.push(" startdelim=");
        out.push(_repr2(this.startdelim));
      }

      if (this.enddelim !== "?>") {
        out.push(" enddelim=");
        out.push(_repr2(this.enddelim));
      }

      out.push(">");
    }
  }, {
    key: "_str",
    value: function _str(out) {
      out.push("def ");
      out.push(this.name ? this.name : "unnamed");
      out.push(":");
      out.push(+1);

      BlockAST.prototype._str.call(this, out);

      out.push(-1);
    }
  }, {
    key: "_renderbound",
    value: function _renderbound(context, vars) {
      var localcontext = context.clone();
      localcontext.vars = vars;

      try {
        BlockAST.prototype._eval.call(this, localcontext);
      } catch (exc) {
        if (!(exc instanceof ReturnException)) throw exc;
      }
    }
  }, {
    key: "__render__",
    value: function __render__(context, vars) {
      this._renderbound(context, vars);
    }
  }, {
    key: "render",
    value: function render(context, vars) {
      this._renderbound(context, vars);
    }
  }, {
    key: "_rendersbound",
    value: function _rendersbound(context, vars) {
      var localcontext = context.replaceoutput();

      this._renderbound(localcontext, vars);

      return localcontext.getoutput();
    }
  }, {
    key: "renders",
    value: function renders(vars) {
      vars = vars || {};
      var context = new Context();
      if (this.signature !== null) vars = this.signature.bindObject(this.name, [], vars);
      return this._rendersbound(context, vars);
    }
  }, {
    key: "doc",
    value: function doc() {
      return this.docpos != null ? this.docpos.of(this._source) : null;
    }
  }, {
    key: "_callbound",
    value: function _callbound(context, vars) {
      var localcontext = context.clone();
      localcontext.vars = vars;

      try {
        BlockAST.prototype._eval.call(this, localcontext);
      } catch (exc) {
        if (exc instanceof ReturnException) return exc.result;else throw exc;
      }

      return null;
    }
  }, {
    key: "call",
    value: function call(vars) {
      vars = vars || {};
      var context = new Context();
      if (this.signature !== null) vars = this.signature.bindObject(this.name, [], vars);
      return this._callbound(context, vars);
    }
  }, {
    key: "__call__",
    value: function __call__(context, vars) {
      return this._callbound(context, vars);
    }
  }, {
    key: "ul4type",
    value: function ul4type() {
      return "template";
    }
  }]);

  return Template;
}(BlockAST);
;
Template.prototype._ul4_callneedsobject = true;
Template.prototype._ul4_callneedscontext = true;
Template.prototype._ul4_renderneedsobject = true;
Template.prototype._ul4_renderneedscontext = true;
export var SignatureAST = function (_CodeAST21) {
  _inherits(SignatureAST, _CodeAST21);

  function SignatureAST(template, pos) {
    var _this40;

    _classCallCheck(this, SignatureAST);

    _this40 = _possibleConstructorReturn(this, _getPrototypeOf(SignatureAST).call(this, template, pos));
    _this40.params = [];
    return _this40;
  }

  _createClass(SignatureAST, [{
    key: "ul4ondump",
    value: function ul4ondump(encoder) {
      _get2(_getPrototypeOf(SignatureAST.prototype), "ul4ondump", this).call(this, encoder);

      var dump = [];

      for (var i = 0; i < this.params.length; ++i) {
        var param = this.params[i];
        if (param[1] === null) dump.push(param[0]);else dump.push(param);
      }

      encoder.dump(dump);
    }
  }, {
    key: "ul4onload",
    value: function ul4onload(decoder) {
      _get2(_getPrototypeOf(SignatureAST.prototype), "ul4onload", this).call(this, decoder);

      var dump = decoder.load();
      this.params = [];

      for (var i = 0; i < dump.length; ++i) {
        var param = dump[i];
        if (typeof param === "string") this.params.push([param, null]);else this.params.push(param);
      }
    }
  }, {
    key: "_eval",
    value: function _eval(context) {
      var args = [];

      for (var i = 0; i < this.params.length; ++i) {
        var param = this.params[i];
        if (param[1] === null) args.push(param[0]);else {
          args.push(param[0] + "=");
          args.push(param[1]._handle_eval(context));
        }
      }

      return _construct(Signature, args);
    }
  }, {
    key: "_repr",
    value: function _repr(out) {
      out.push("<");
      out.push(this.constructor.name);
      out.push(" params=");

      this.params._repr(out);

      out.push(">");
    }
  }]);

  return SignatureAST;
}(CodeAST);
;
export var TemplateClosure = function (_Proto4) {
  _inherits(TemplateClosure, _Proto4);

  function TemplateClosure(template, signature, vars) {
    var _this41;

    _classCallCheck(this, TemplateClosure);

    _this41 = _possibleConstructorReturn(this, _getPrototypeOf(TemplateClosure).call(this));
    _this41.template = template;
    _this41.signature = signature;
    _this41.vars = vars;
    _this41._ul4_callsignature = signature;
    _this41._ul4_rendersignature = signature;
    _this41.name = template.name;
    _this41.tag = template.tag;
    _this41.endtag = template.endtag;
    _this41._source = template._source;
    _this41.startdelim = template.startdelim;
    _this41.enddelim = template.enddelim;
    _this41.docpos = template.docpos;
    _this41.content = template.content;
    return _this41;
  }

  _createClass(TemplateClosure, [{
    key: "__render__",
    value: function __render__(context, vars) {
      this.template._renderbound(context, _extend(this.vars, vars));
    }
  }, {
    key: "render",
    value: function render(context, vars) {
      this.template._renderbound(context, _extend(this.vars, vars));
    }
  }, {
    key: "__call__",
    value: function __call__(context, vars) {
      return this.template._callbound(context, _extend(this.vars, vars));
    }
  }, {
    key: "_renderbound",
    value: function _renderbound(context, vars) {
      this.template._renderbound(context, _extend(this.vars, vars));
    }
  }, {
    key: "_rendersbound",
    value: function _rendersbound(context, vars) {
      return this.template._rendersbound(context, _extend(this.vars, vars));
    }
  }, {
    key: "__getattr__",
    value: function __getattr__(attrname) {
      var self = this;

      switch (attrname) {
        case "render":
          var render = function render(context, vars) {
            self._renderbound(context, vars);
          };

          expose(render, this.signature, {
            needscontext: true,
            needsobject: true
          });
          return render;

        case "renders":
          var renders = function renders(context, vars) {
            return self._rendersbound(context, vars);
          };

          expose(renders, this.signature, {
            needscontext: true,
            needsobject: true
          });
          return renders;

        case "signature":
          return this.signature;

        default:
          return this.template.__getattr__(attrname);
      }
    }
  }, {
    key: "ul4type",
    value: function ul4type() {
      return "template";
    }
  }]);

  return TemplateClosure;
}(Proto);
;
TemplateClosure.prototype._ul4_callneedsobject = true;
TemplateClosure.prototype._ul4_callneedscontext = true;
TemplateClosure.prototype._ul4_renderneedsobject = true;
TemplateClosure.prototype._ul4_renderneedscontext = true;
export function _rgb(r, g, b, a) {
  return new Color(255 * r, 255 * g, 255 * b, 255 * a);
}
;
export function _xmlescape(obj) {
  obj = _str(obj);
  obj = obj.replace(/&/g, "&amp;");
  obj = obj.replace(/</g, "&lt;");
  obj = obj.replace(/>/g, "&gt;");
  obj = obj.replace(/'/g, "&#39;");
  obj = obj.replace(/"/g, "&quot;");
  return obj;
}
;
export function _csv(obj) {
  if (obj === null) return "";else if (typeof obj !== "string") obj = _repr2(obj);
  if (obj.indexOf(",") !== -1 || obj.indexOf('"') !== -1 || obj.indexOf("\n") !== -1) obj = '"' + obj.replace(/"/g, '""') + '"';
  return obj;
}
;
export function _chr(i) {
  if (typeof i != "number") throw new _TypeError("chr() requires an int");
  return String.fromCharCode(i);
}
;
export function _ord(c) {
  if (typeof c != "string" || c.length != 1) throw new _TypeError("ord() requires a string of length 1");
  return c.charCodeAt(0);
}
;
export function _hex(number) {
  if (typeof number != "number") throw new _TypeError("hex() requires an int");
  if (number < 0) return "-0x" + number.toString(16).substr(1);else return "0x" + number.toString(16);
}
;
export function _oct(number) {
  if (typeof number != "number") throw new _TypeError("oct() requires an int");
  if (number < 0) return "-0o" + number.toString(8).substr(1);else return "0o" + number.toString(8);
}
;
export function _bin(number) {
  if (typeof number != "number") throw new _TypeError("bin() requires an int");
  if (number < 0) return "-0b" + number.toString(2).substr(1);else return "0b" + number.toString(2);
}
;
export function _min(obj) {
  if (obj.length == 0) throw new ArgumentError("min() requires at least 1 argument, 0 given");else if (obj.length == 1) obj = obj[0];

  var iter = _iter(obj);

  var result;
  var first = true;

  while (true) {
    var item = iter.next();

    if (item.done) {
      if (first) throw new ValueError("min() argument is an empty sequence!");
      return result;
    }

    if (first || item.value < result) result = item.value;
    first = false;
  }
}
;
export function _max(obj) {
  if (obj.length == 0) throw new ArgumentError("max() requires at least 1 argument, 0 given");else if (obj.length == 1) obj = obj[0];

  var iter = _iter(obj);

  var result;
  var first = true;

  while (true) {
    var item = iter.next();

    if (item.done) {
      if (first) throw new ValueError("max() argument is an empty sequence!");
      return result;
    }

    if (first || item.value > result) result = item.value;
    first = false;
  }
}
;
export function _sum(iterable) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  for (var iter = _iter(iterable);;) {
    var item = iter.next();
    if (item.done) break;
    start += item.value;
  }

  return start;
}
;
export function _first(iterable) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var item = _iter(iterable).next();

  return item.done ? defaultValue : item.value;
}
;
export function _last(iterable) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var value = defaultValue;

  for (var iter = _iter(iterable);;) {
    var item = iter.next();
    if (item.done) break;
    value = item.value;
  }

  return value;
}
;
export function _sorted(context, iterable) {
  var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var reverse = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (key === null) {
    var cmp = reverse ? function cmp(a, b) {
      return -_cmp("<=>", a, b);
    } : function cmp(a, b) {
      return _cmp("<=>", a, b);
    };

    var result = _list(iterable);

    result.sort(cmp);
    return result;
  } else {
    var _cmp2 = function _cmp2(s1, s2) {
      var res = _cmp("<=>", s1[0], s2[0]);

      if (res) return reverse ? -res : res;
      res = _cmp("<=>", s1[1], s2[1]);
      return reverse ? -res : res;
    };

    var sort = [];

    for (var i = 0, iter = _iter(iterable);; ++i) {
      var item = iter.next();
      if (item.done) break;

      var keyvalue = _call(context, key, [item.value], {});

      sort.push([keyvalue, reverse ? -i : i, item.value]);
    }

    ;
    sort.sort(_cmp2);
    var _result7 = [];

    for (var _i6 = 0; _i6 < sort.length; ++_i6) {
      var _item5 = sort[_i6];

      _result7.push(_item5[2]);
    }

    return _result7;
  }
}
;
export function _range(args) {
  var start, stop, step;
  if (args.length < 1) throw new ArgumentError("required range() argument missing");else if (args.length > 3) throw new ArgumentError("range() expects at most 3 positional arguments, " + args.length + " given");else if (args.length == 1) {
    start = 0;
    stop = args[0];
    step = 1;
  } else if (args.length == 2) {
    start = args[0];
    stop = args[1];
    step = 1;
  } else if (args.length == 3) {
    start = args[0];
    stop = args[1];
    step = args[2];
  }
  var lower, higher;
  if (step === 0) throw new ValueError("range() requires a step argument != 0");else if (step > 0) {
    lower = start;
    higher = stop;
  } else {
    lower = stop;
    higher = start;
  }
  var length = lower < higher ? Math.floor((higher - lower - 1) / Math.abs(step)) + 1 : 0;
  return {
    index: 0,
    next: function next() {
      if (this.index >= length) return {
        done: true
      };
      return {
        value: start + this.index++ * step,
        done: false
      };
    }
  };
}
;
export function _slice(args) {
  var iterable, start, stop, step;
  if (args.length < 2) throw new ArgumentError("required slice() argument missing");else if (args.length > 4) throw new ArgumentError("slice() expects at most 4 positional arguments, " + args.length + " given");else if (args.length == 2) {
    iterable = args[0];
    start = 0;
    stop = args[1];
    step = 1;
  } else if (args.length == 3) {
    iterable = args[0];
    start = args[1] !== null ? args[1] : 0;
    stop = args[2];
    step = 1;
  } else if (args.length == 4) {
    iterable = args[0];
    start = args[1] !== null ? args[1] : 0;
    stop = args[2];
    step = args[3] !== null ? args[3] : 1;
  }
  if (start < 0) throw new ValueError("slice() requires a start argument >= 0");
  if (stop < 0) throw new ValueError("slice() requires a stop argument >= 0");
  if (step <= 0) throw new ValueError("slice() requires a step argument > 0");
  var _next = start,
      count = 0;

  var iter = _iter(iterable);

  return {
    next: function next() {
      var result;

      while (count < _next) {
        result = iter.next();
        if (result.done) return result;
        ++count;
      }

      if (stop !== null && count >= stop) return {
        done: true
      };
      result = iter.next();
      if (result.done) return result;
      ++count;
      _next += step;
      if (stop !== null && _next > stop) _next = stop;
      return result;
    }
  };
}
;
export function _urlquote(string) {
  return encodeURIComponent(string);
}
;
export function _urlunquote(string) {
  return decodeURIComponent(string);
}
;
export function _reversed(sequence) {
  if (typeof sequence != "string" && !_islist(sequence)) sequence = _list(sequence);
  return {
    index: sequence.length - 1,
    next: function next() {
      return this.index >= 0 ? {
        value: sequence[this.index--],
        done: false
      } : {
        done: true
      };
    }
  };
}
;
export function _random() {
  return Math.random();
}
;
export function _randrange(args) {
  var start, stop, step;
  if (args.length < 1) throw new ArgumentError("required randrange() argument missing");else if (args.length > 3) throw new ArgumentError("randrange() expects at most 3 positional arguments, " + args.length + " given");else if (args.length == 1) {
    start = 0;
    stop = args[0];
    step = 1;
  } else if (args.length == 2) {
    start = args[0];
    stop = args[1];
    step = 1;
  } else if (args.length == 3) {
    start = args[0];
    stop = args[1];
    step = args[2];
  }
  var width = stop - start;
  var value = Math.random();
  var n;
  if (step > 0) n = Math.floor((width + step - 1) / step);else if (step < 0) n = Math.floor((width + step + 1) / step);else throw new ValueError("randrange() requires a step argument != 0");
  return start + step * Math.floor(value * n);
}
;
export function _randchoice(sequence) {
  var iscolor = _iscolor(sequence);

  if (typeof sequence !== "string" && !_islist(sequence) && !iscolor) throw new _TypeError("randchoice() requires a string or list");
  if (iscolor) sequence = _list(sequence);
  return sequence[Math.floor(Math.random() * sequence.length)];
}
;
export function _round(x) {
  var digits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (digits) {
    var threshold = Math.pow(10, digits);
    return Math.round(x * threshold) / threshold;
  } else return Math.round(x);
}
;
export var _md5;

if (0) {
  _md5 = function _md5(string) {
    var md5 = require('blueimp-md5');

    return md5(string);
  };
} else {
  _md5 = function _md5(string) {
    return md5(string);
  };
}

export function _enumerate(iterable) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return {
    iter: _iter(iterable),
    index: start,
    next: function next() {
      var item = this.iter.next();
      return item.done ? item : {
        value: [this.index++, item.value],
        done: false
      };
    }
  };
}
;
export function _isfirst(iterable) {
  var iter = _iter(iterable);

  var isfirst = true;
  return {
    next: function next() {
      var item = iter.next();
      var result = item.done ? item : {
        value: [isfirst, item.value],
        done: false
      };
      isfirst = false;
      return result;
    }
  };
}
;
export function _islast(iterable) {
  var iter = _iter(iterable);

  var lastitem = iter.next();
  return {
    next: function next() {
      if (lastitem.done) return lastitem;
      var item = iter.next();
      var result = {
        value: [item.done, lastitem.value],
        done: false
      };
      lastitem = item;
      return result;
    }
  };
}
;
export function _isfirstlast(iterable) {
  var iter = _iter(iterable);

  var isfirst = true;
  var lastitem = iter.next();
  return {
    next: function next() {
      if (lastitem.done) return lastitem;
      var item = iter.next();
      var result = {
        value: [isfirst, item.done, lastitem.value],
        done: false
      };
      lastitem = item;
      isfirst = false;
      return result;
    }
  };
}
;
export function _enumfl(iterable) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  var iter = _iter(iterable);

  var i = start;
  var isfirst = true;
  var lastitem = iter.next();
  return {
    next: function next() {
      if (lastitem.done) return lastitem;
      var item = iter.next();
      var result = {
        value: [i++, isfirst, item.done, lastitem.value],
        done: false
      };
      lastitem = item;
      isfirst = false;
      return result;
    }
  };
}
;
export function _zip(iterables) {
  var result;

  if (iterables.length) {
    var iters = [];

    for (var i = 0; i < iterables.length; ++i) {
      iters.push(_iter(iterables[i]));
    }

    return {
      next: function next() {
        var items = [];

        for (var _i7 = 0; _i7 < iters.length; ++_i7) {
          var item = iters[_i7].next();

          if (item.done) return item;
          items.push(item.value);
        }

        return {
          value: items,
          done: false
        };
      }
    };
  } else {
    return {
      next: function next() {
        return {
          done: true
        };
      }
    };
  }
}
;
export function _abs(number) {
  if (number !== null && typeof number.__abs__ === "function") return number.__abs__();
  return Math.abs(number);
}
;
export function _date(year, month, day) {
  return new Date_(year, month, day);
}
;
export function _datetime(year, month, day) {
  var hour = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var minute = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var second = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  var microsecond = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
  return new Date(year, month - 1, day, hour, minute, second, microsecond / 1000);
}
;
export function _timedelta() {
  var days = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var seconds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var microseconds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  return new TimeDelta(days, seconds, microseconds);
}
;
export function _monthdelta() {
  var months = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return new MonthDelta(months);
}
;
export function _hls(h, l, s, a) {
  var _v = function _v(m1, m2, hue) {
    hue = hue % 1.0;
    if (hue < 1 / 6) return m1 + (m2 - m1) * hue * 6.0;else if (hue < 0.5) return m2;else if (hue < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - hue) * 6.0;
    return m1;
  };

  var m1, m2;
  if (typeof a === "undefined") a = 1;
  if (s === 0.0) return _rgb(l, l, l, a);
  if (l <= 0.5) m2 = l * (1.0 + s);else m2 = l + s - l * s;
  m1 = 2.0 * l - m2;
  return _rgb(_v(m1, m2, h + 1 / 3), _v(m1, m2, h), _v(m1, m2, h - 1 / 3), a);
}
;
export function _hsv(h, s, v, a) {
  if (s === 0.0) return _rgb(v, v, v, a);
  var i = Math.floor(h * 6.0);
  var f = h * 6.0 - i;
  var p = v * (1.0 - s);
  var q = v * (1.0 - s * f);
  var t = v * (1.0 - s * (1.0 - f));

  switch (i % 6) {
    case 0:
      return _rgb(v, t, p, a);

    case 1:
      return _rgb(q, v, p, a);

    case 2:
      return _rgb(p, v, t, a);

    case 3:
      return _rgb(p, q, v, a);

    case 4:
      return _rgb(t, p, v, a);

    case 5:
      return _rgb(v, p, q, a);
  }
}
;
export function _get(container, key, defaultvalue) {
  if (_ismap(container)) {
    if (container.has(key)) return container.get(key);
    return defaultvalue;
  } else if (_isobject(container)) {
    var result = container[key];
    if (typeof result === "undefined") return defaultvalue;
    return result;
  }

  throw new _TypeError("get() requires a dict");
}
;
export function now() {
  return new Date();
}
;
export function utcnow() {
  var now = new Date();
  return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
}
;
export function today() {
  var now = new Date();
  return new Date_(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
;
export var functions = {
  repr: _repr2,
  ascii: _ascii,
  str: _str,
  int: _int,
  float: _float,
  list: _list,
  set: _set,
  bool: _bool,
  len: _len,
  type: _type,
  format: _format,
  any: _any,
  all: _all,
  zip: _zip,
  getattr: _getattr,
  hasattr: _hasattr,
  dir: _dir,
  isundefined: _isundefined,
  isdefined: _isdefined,
  isnone: _isnone,
  isbool: _isbool,
  isint: _isint,
  isfloat: _isfloat,
  isstr: _isstr,
  isdate: _isdate,
  isdatetime: _isdatetime,
  iscolor: _iscolor,
  istimedelta: _istimedelta,
  ismonthdelta: _ismonthdelta,
  istemplate: _istemplate,
  isfunction: _isfunction,
  islist: _islist,
  isset: _isanyset,
  isdict: _isdict,
  isexception: _isexception,
  asjson: _asjson,
  fromjson: _fromjson,
  asul4on: _asul4on,
  fromul4on: _fromul4on,
  now: now,
  utcnow: utcnow,
  today: today,
  enumerate: _enumerate,
  isfirst: _isfirst,
  islast: _islast,
  isfirstlast: _isfirstlast,
  enumfl: _enumfl,
  abs: _abs,
  date: _date,
  datetime: _datetime,
  timedelta: _timedelta,
  monthdelta: _monthdelta,
  rgb: _rgb,
  hls: _hls,
  hsv: _hsv,
  xmlescape: _xmlescape,
  csv: _csv,
  chr: _chr,
  ord: _ord,
  hex: _hex,
  oct: _oct,
  bin: _bin,
  min: _min,
  max: _max,
  sum: _sum,
  first: _first,
  last: _last,
  sorted: _sorted,
  range: _range,
  slice: _slice,
  urlquote: _urlquote,
  urlunquote: _urlunquote,
  reversed: _reversed,
  random: _random,
  randrange: _randrange,
  randchoice: _randchoice,
  round: _round,
  md5: _md5
};
expose(_repr2, ["obj"], {
  name: "repr"
});
expose(_ascii, ["obj"], {
  name: "ascii"
});
expose(_str, ["obj=", ""], {
  name: "str"
});
expose(_int, ["obj=", 0, "base=", null], {
  name: "int"
});
expose(_float, ["obj=", 0.0], {
  name: "float"
});
expose(_list, ["iterable=", []], {
  name: "list"
});
expose(_set, ["iterable=", []], {
  name: "set"
});
expose(_bool, ["obj=", false], {
  name: "bool"
});
expose(_len, ["sequence"], {
  name: "len"
});
expose(_type, ["obj"], {
  name: "type"
});
expose(_format, ["obj", "fmt", "lang=", null], {
  name: "format"
});
expose(_any, ["iterable"], {
  name: "any"
});
expose(_all, ["iterable"], {
  name: "all"
});
expose(_zip, ["*iterables"], {
  name: "zip"
});
expose(_getattr, ["obj", "attrname", "default=", null], {
  name: "getattr"
});
expose(_hasattr, ["obj", "attrname"], {
  name: "hasattr"
});
expose(_dir, ["obj"], {
  name: "dir"
});
expose(_isundefined, ["obj"], {
  name: "isundefined"
});
expose(_isdefined, ["obj"], {
  name: "isdefined"
});
expose(_isnone, ["obj"], {
  name: "isnone"
});
expose(_isbool, ["obj"], {
  name: "isbool"
});
expose(_isint, ["obj"], {
  name: "isint"
});
expose(_isfloat, ["obj"], {
  name: "isfloat"
});
expose(_isstr, ["obj"], {
  name: "isstr"
});
expose(_isdate, ["obj"], {
  name: "isdate"
});
expose(_isdatetime, ["obj"], {
  name: "isdatetime"
});
expose(_iscolor, ["obj"], {
  name: "iscolor"
});
expose(_istimedelta, ["obj"], {
  name: "istimedelta"
});
expose(_ismonthdelta, ["obj"], {
  name: "ismonthdelta"
});
expose(_istemplate, ["obj"], {
  name: "istemplate"
});
expose(_isfunction, ["obj"], {
  name: "isfunction"
});
expose(_islist, ["obj"], {
  name: "islist"
});
expose(_isanyset, ["obj"], {
  name: "isset"
});
expose(_isdict, ["obj"], {
  name: "isdict"
});
expose(_isexception, ["obj"], {
  name: "isexception"
});
expose(_asjson, ["obj"], {
  name: "asjson"
});
expose(_fromjson, ["string"], {
  name: "fromjson"
});
expose(_asul4on, ["obj"], {
  name: "asul4on"
});
expose(_fromul4on, ["string"], {
  name: "fromul4on"
});
expose(now, []);
expose(utcnow, []);
expose(today, []);
expose(_enumerate, ["iterable", "start=", 0], {
  name: "enumerate"
});
expose(_isfirst, ["iterable"], {
  name: "isfirst"
});
expose(_islast, ["iterable"], {
  name: "islast"
});
expose(_isfirstlast, ["iterable"], {
  name: "isfirstlast"
});
expose(_enumfl, ["iterable", "start=", 0], {
  name: "enumfl"
});
expose(_abs, ["number"], {
  name: "abs"
});
expose(_date, ["year", "month", "day"], {
  name: "date"
});
expose(_datetime, ["year", "month", "day", "hour=", 0, "minute=", 0, "second=", 0, "microsecond=", 0], {
  name: "datetime"
});
expose(_timedelta, ["days=", 0, "seconds=", 0, "microseconds=", 0], {
  name: "timedelta"
});
expose(_monthdelta, ["months=", 0], {
  name: "monthdelta"
});
expose(_rgb, ["r", "g", "b", "a=", 1.0], {
  name: "rgb"
});
expose(_hls, ["h", "l", "s", "a=", 1.0], {
  name: "hls"
});
expose(_hsv, ["h", "s", "v", "a=", 1.0], {
  name: "hsv"
});
expose(_xmlescape, ["obj"], {
  name: "xmlescape"
});
expose(_csv, ["obj"], {
  name: "csv"
});
expose(_chr, ["i"], {
  name: "chr"
});
expose(_ord, ["c"], {
  name: "ord"
});
expose(_hex, ["number"], {
  name: "hex"
});
expose(_oct, ["number"], {
  name: "oct"
});
expose(_bin, ["number"], {
  name: "bin"
});
expose(_min, ["*obj"], {
  name: "min"
});
expose(_max, ["*obj"], {
  name: "max"
});
expose(_sum, ["iterable", "start=", 0], {
  name: "sum"
});
expose(_first, ["iterable", "default=", null], {
  name: "first"
});
expose(_last, ["iterable", "default=", null], {
  name: "last"
});
expose(_sorted, ["iterable", "key=", null, "reverse=", false], {
  name: "sorted",
  needscontext: true
});
expose(_range, ["*args"], {
  name: "range"
});
expose(_slice, ["*args"], {
  name: "slice"
});
expose(_urlquote, ["string"], {
  name: "urlquote"
});
expose(_urlunquote, ["string"], {
  name: "urlunquote"
});
expose(_reversed, ["sequence"], {
  name: "reversed"
});
expose(_random, [], {
  name: "random"
});
expose(_randrange, ["*args"], {
  name: "randrange"
});
expose(_randchoice, ["sequence"], {
  name: "randchoice"
});
expose(_round, ["x", "digit=", 0], {
  name: "round"
});
expose(_md5, ["string"], {
  name: "md5"
});
export function _count(obj, sub) {
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  if (start < 0) start += obj.length;
  if (start === null) start = 0;
  if (end < 0) end += obj.length;
  if (end === null) end = obj.length;

  var isstr = _isstr(obj);

  if (isstr && !sub.length) {
    if (end < 0 || start > obj.length || start > end) return 0;
    var result = end - start + 1;
    if (result > obj.length + 1) result = obj.length + 1;
    return result;
  }

  start = _bound(start, obj.length);
  end = _bound(end, obj.length);
  var count = 0;

  if (_islist(obj)) {
    for (var i = start; i < end; ++i) {
      if (_eq(obj[i], sub)) ++count;
    }

    return count;
  } else {
      var lastIndex = start;

      for (;;) {
        lastIndex = obj.indexOf(sub, lastIndex);
        if (lastIndex == -1) break;
        if (lastIndex + sub.length > end) break;
        ++count;
        lastIndex += sub.length;
      }

      return count;
    }
}
;
export function _find(obj, sub) {
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  if (start < 0) start += obj.length;
  if (start === null) start = 0;
  if (end < 0) end += obj.length;
  if (end === null) end = obj.length;
  start = _bound(start, obj.length);
  end = _bound(end, obj.length);

  if (start !== 0 || end !== obj.length) {
    if (typeof obj == "string") obj = obj.substring(start, end);else obj = obj.slice(start, end);
  }

  var result = obj.indexOf(sub);
  if (result !== -1) result += start;
  return result;
}
;
export function _rfind(obj, sub) {
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  if (start < 0) start += obj.length;
  if (start === null) start = 0;
  if (end < 0) end += obj.length;
  if (end === null) end = obj.length;
  start = _bound(start, obj.length);
  end = _bound(end, obj.length);

  if (start !== 0 || end !== obj.length) {
    if (typeof obj == "string") obj = obj.substring(start, end);else obj = obj.slice(start, end);
  }

  var result = obj.lastIndexOf(sub);
  if (result !== -1) result += start;
  return result;
}
;
export function _week4format(obj) {
  var firstweekday = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  if (firstweekday === null) firstweekday = 0;else firstweekday %= 7;
  var yearday = DateTimeProtocol.yearday(obj) + 6;
  var jan1 = new Date(obj.getFullYear(), 0, 1);
  var jan1weekday = jan1.getDay();
  if (--jan1weekday < 0) jan1weekday = 6;

  while (jan1weekday != firstweekday) {
    --yearday;
    if (++jan1weekday == 7) jan1weekday = 0;
  }

  return Math.floor(yearday / 7);
}
;
export function _isleap(obj) {
  return new Date(obj.getFullYear(), 1, 29).getMonth() === 1;
}
;
export function _update(obj, others, kwargs) {
  if (!_isdict(obj)) throw new _TypeError("update() requires a dict");

  for (var i = 0; i < others.length; ++i) {
    var other = others[i];

    if (_ismap(other)) {
      other.forEach(function (value, key) {
        _setmap(obj, key, value);
      });
    } else if (_isobject(other)) {
      for (var key in other) {
        _setmap(obj, key, other[key]);
      }
    } else if (_islist(other)) {
      for (var _i8 = 0; _i8 < other.length; ++_i8) {
        var item = other[_i8];
        if (!_islist(item) || item.length != 2) throw new _TypeError("update() requires a dict or a list of (key, value) pairs");

        _setmap(obj, item[0], item[1]);
      }
    } else throw new _TypeError("update() requires a dict or a list of (key, value) pairs");
  }

  kwargs.forEach(function (value, key) {
    _setmap(obj, key, value);
  });
  return null;
}
;
export var Color = function (_Proto5) {
  _inherits(Color, _Proto5);

  function Color() {
    var _this42;

    var r = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var g = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var b = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 255;

    _classCallCheck(this, Color);

    _this42 = _possibleConstructorReturn(this, _getPrototypeOf(Color).call(this));
    _this42._r = r;
    _this42._g = g;
    _this42._b = b;
    _this42._a = a;
    return _this42;
  }

  _createClass(Color, [{
    key: "__repr__",
    value: function __repr__() {
      var r = _lpad(this._r.toString(16), "0", 2);

      var g = _lpad(this._g.toString(16), "0", 2);

      var b = _lpad(this._b.toString(16), "0", 2);

      var a = _lpad(this._a.toString(16), "0", 2);

      if (this._a !== 0xff) {
        if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1] && a[0] === a[1]) return "#" + r[0] + g[0] + b[0] + a[0];else return "#" + r + g + b + a;
      } else {
        if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1]) return "#" + r[0] + g[0] + b[0];else return "#" + r + g + b;
      }
    }
  }, {
    key: "__str__",
    value: function __str__() {
      if (this._a !== 0xff) {
        return "rgba(" + this._r + ", " + this._g + ", " + this._b + ", " + this._a / 255 + ")";
      } else {
        var r = _lpad(this._r.toString(16), "0", 2);

        var g = _lpad(this._g.toString(16), "0", 2);

        var b = _lpad(this._b.toString(16), "0", 2);

        if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1]) return "#" + r[0] + g[0] + b[0];else return "#" + r + g + b;
      }
    }
  }, {
    key: "__iter__",
    value: function __iter__() {
      return {
        obj: this,
        index: 0,
        next: function next() {
          if (this.index == 0) {
            ++this.index;
            return {
              value: this.obj._r,
              done: false
            };
          } else if (this.index == 1) {
            ++this.index;
            return {
              value: this.obj._g,
              done: false
            };
          } else if (this.index == 2) {
            ++this.index;
            return {
              value: this.obj._b,
              done: false
            };
          } else if (this.index == 3) {
            ++this.index;
            return {
              value: this.obj._a,
              done: false
            };
          } else return {
            done: true
          };
        }
      };
    }
  }, {
    key: "__getattr__",
    value: function __getattr__(attrname) {
      var self = this;

      switch (attrname) {
        case "r":
          var r = function r() {
            return self._r;
          };

          expose(r, []);
          return r;

        case "g":
          var g = function g() {
            return self._g;
          };

          expose(g, []);
          return g;

        case "b":
          var b = function b() {
            return self._b;
          };

          expose(b, []);
          return b;

        case "a":
          var a = function a() {
            return self._a;
          };

          expose(a, []);
          return a;

        case "lum":
          var lum = function lum() {
            return self.lum();
          };

          expose(lum, []);
          return lum;

        case "hls":
          var hls = function hls() {
            return self.hls();
          };

          expose(hls, []);
          return hls;

        case "hlsa":
          var hlsa = function hlsa() {
            return self.hlsa();
          };

          expose(hlsa, []);
          return hlsa;

        case "hsv":
          var hsv = function hsv() {
            return self.hsv();
          };

          expose(hsv, []);
          return hsv;

        case "hsva":
          var hsva = function hsva() {
            return self.hsva();
          };

          expose(hsva, []);
          return hsva;

        case "witha":
          var witha = function witha(a) {
            return self.witha(a);
          };

          expose(witha, ["a"]);
          return witha;

        case "withlum":
          var withlum = function withlum(lum) {
            return self.withlum(lum);
          };

          expose(withlum, ["lum"]);
          return withlum;

        case "abslum":
          var abslum = function abslum(lum) {
            return self.abslum(lum);
          };

          expose(abslum, ["lum"]);
          return abslum;

        case "rellum":
          var rellum = function rellum(lum) {
            return self.rellum(lum);
          };

          expose(rellum, ["lum"]);
          return rellum;

        default:
          throw new AttributeError(this, attrname);
      }
    }
  }, {
    key: "__getitem__",
    value: function __getitem__(key) {
      var orgkey = key;
      if (key < 0) key += 4;

      switch (key) {
        case 0:
          return this._r;

        case 1:
          return this._g;

        case 2:
          return this._b;

        case 3:
          return this._a;

        default:
          throw new IndexError(this, orgkey);
      }
    }
  }, {
    key: "__eq__",
    value: function __eq__(other) {
      if (other instanceof Color) return this._r == other._r && this._g == other._g && this._b == other._b && this._a == other._a;
      return false;
    }
  }, {
    key: "r",
    value: function r() {
      return this._r;
    }
  }, {
    key: "g",
    value: function g() {
      return this._g;
    }
  }, {
    key: "b",
    value: function b() {
      return this._b;
    }
  }, {
    key: "a",
    value: function a() {
      return this._a;
    }
  }, {
    key: "lum",
    value: function lum() {
      return this.hls()[1];
    }
  }, {
    key: "hls",
    value: function hls() {
      var r = this._r / 255.0;
      var g = this._g / 255.0;
      var b = this._b / 255.0;
      var maxc = Math.max(r, g, b);
      var minc = Math.min(r, g, b);
      var h, l, s;
      var rc, gc, bc;
      l = (minc + maxc) / 2.0;
      if (minc == maxc) return [0.0, l, 0.0];
      if (l <= 0.5) s = (maxc - minc) / (maxc + minc);else s = (maxc - minc) / (2.0 - maxc - minc);
      rc = (maxc - r) / (maxc - minc);
      gc = (maxc - g) / (maxc - minc);
      bc = (maxc - b) / (maxc - minc);
      if (r == maxc) h = bc - gc;else if (g == maxc) h = 2.0 + rc - bc;else h = 4.0 + gc - rc;
      h = h / 6.0 % 1.0;
      return [h, l, s];
    }
  }, {
    key: "hlsa",
    value: function hlsa() {
      var hls = this.hls();
      return hls.concat(this._a / 255.0);
    }
  }, {
    key: "hsv",
    value: function hsv() {
      var r = this._r / 255.0;
      var g = this._g / 255.0;
      var b = this._b / 255.0;
      var maxc = Math.max(r, g, b);
      var minc = Math.min(r, g, b);
      var v = maxc;
      if (minc == maxc) return [0.0, 0.0, v];
      var s = (maxc - minc) / maxc;
      var rc = (maxc - r) / (maxc - minc);
      var gc = (maxc - g) / (maxc - minc);
      var bc = (maxc - b) / (maxc - minc);
      var h;
      if (r == maxc) h = bc - gc;else if (g == maxc) h = 2.0 + rc - bc;else h = 4.0 + gc - rc;
      h = h / 6.0 % 1.0;
      return [h, s, v];
    }
  }, {
    key: "hsva",
    value: function hsva() {
      var hsv = this.hsv();
      return hsv.concat(this._a / 255.0);
    }
  }, {
    key: "witha",
    value: function witha(a) {
      if (typeof a !== "number") throw new _TypeError("witha() requires a number");
      return new Color(this._r, this._g, this._b, a);
    }
  }, {
    key: "withlum",
    value: function withlum(lum) {
      if (typeof lum !== "number") throw new _TypeError("witha() requires a number");
      var hlsa = this.hlsa();
      return _hls(hlsa[0], lum, hlsa[2], hlsa[3]);
    }
  }, {
    key: "ul4type",
    value: function ul4type() {
      return "color";
    }
  }]);

  return Color;
}(Proto);
;
expose(Color.prototype.r, []);
expose(Color.prototype.g, []);
expose(Color.prototype.b, []);
expose(Color.prototype.a, []);
expose(Color.prototype.lum, []);
expose(Color.prototype.hls, []);
expose(Color.prototype.hlsa, []);
expose(Color.prototype.hsv, []);
expose(Color.prototype.hsva, []);
expose(Color.prototype.witha, ["a"]);
expose(Color.prototype.withlum, ["lum"]);
export var Date_ = function (_Proto6) {
  _inherits(Date_, _Proto6);

  function Date_(year, month, day) {
    var _this43;

    _classCallCheck(this, Date_);

    _this43 = _possibleConstructorReturn(this, _getPrototypeOf(Date_).call(this));
    _this43._date = new Date(year, month - 1, day);
    return _this43;
  }

  _createClass(Date_, [{
    key: "__repr__",
    value: function __repr__() {
      return '@(' + this.__str__() + ")";
    }
  }, {
    key: "__str__",
    value: function __str__() {
      return _lpad(this._date.getFullYear(), "0", 4) + "-" + _lpad(this._date.getMonth() + 1, "0", 2) + "-" + _lpad(this._date.getDate(), "0", 2);
    }
  }, {
    key: "__eq__",
    value: function __eq__(other) {
      if (other instanceof Date_) return this._date.getTime() === other._date.getTime();
      return false;
    }
  }, {
    key: "__lt__",
    value: function __lt__(other) {
      if (other instanceof Date_) return this._date < other._date;

      _unorderable("<", this, other);
    }
  }, {
    key: "__le__",
    value: function __le__(other) {
      if (other instanceof Date_) return this._date <= other._date;

      _unorderable("<=", this, other);
    }
  }, {
    key: "__gt__",
    value: function __gt__(other) {
      if (other instanceof Date_) return this._date > other._date;

      _unorderable(">", this, other);
    }
  }, {
    key: "__ge__",
    value: function __ge__(other) {
      if (other instanceof Date_) return this._date >= other._date;

      _unorderable(">=", this, other);
    }
  }, {
    key: "year",
    value: function year() {
      return this._date.getFullYear();
    }
  }, {
    key: "month",
    value: function month() {
      return this._date.getMonth() + 1;
    }
  }, {
    key: "day",
    value: function day() {
      return this._date.getDate();
    }
  }, {
    key: "ul4type",
    value: function ul4type() {
      return "date";
    }
  }]);

  return Date_;
}(Proto);
;
export var TimeDelta = function (_Proto7) {
  _inherits(TimeDelta, _Proto7);

  function TimeDelta() {
    var _this44;

    var days = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var seconds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var microseconds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    _classCallCheck(this, TimeDelta);

    _this44 = _possibleConstructorReturn(this, _getPrototypeOf(TimeDelta).call(this));
    var total_microseconds = Math.floor((days * 86400 + seconds) * 1000000 + microseconds);
    microseconds = ModAST.prototype._do(total_microseconds, 1000000);
    var total_seconds = Math.floor(total_microseconds / 1000000);
    seconds = ModAST.prototype._do(total_seconds, 86400);
    days = Math.floor(total_seconds / 86400);

    if (seconds < 0) {
      seconds += 86400;
      --days;
    }

    _this44._microseconds = microseconds;
    _this44._seconds = seconds;
    _this44._days = days;
    return _this44;
  }

  _createClass(TimeDelta, [{
    key: "__repr__",
    value: function __repr__() {
      var v = [],
          first = true;
      v.push("timedelta(");

      if (this._days) {
        v.push("days=" + this._days);
        first = false;
      }

      if (this._seconds) {
        if (!first) v.push(", ");
        v.push("seconds=" + this._seconds);
        first = false;
      }

      if (this._microseconds) {
        if (!first) v.push(", ");
        v.push("microseconds=" + this._microseconds);
      }

      v.push(")");
      return v.join("");
    }
  }, {
    key: "__str__",
    value: function __str__() {
      var v = [];

      if (this._days) {
        v.push(this._days + " day");
        if (this._days !== -1 && this._days !== 1) v.push("s");
        v.push(", ");
      }

      var seconds = this._seconds % 60;
      var minutes = Math.floor(this._seconds / 60);
      var hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
      v.push("" + hours);
      v.push(":");
      v.push(_lpad(minutes.toString(), "0", 2));
      v.push(":");
      v.push(_lpad(seconds.toString(), "0", 2));

      if (this._microseconds) {
        v.push(".");
        v.push(_lpad(this._microseconds.toString(), "0", 6));
      }

      return v.join("");
    }
  }, {
    key: "__bool__",
    value: function __bool__() {
      return this._days !== 0 || this._seconds !== 0 || this._microseconds !== 0;
    }
  }, {
    key: "__abs__",
    value: function __abs__() {
      return this._days < 0 ? new TimeDelta(-this._days, -this._seconds, -this._microseconds) : this;
    }
  }, {
    key: "__eq__",
    value: function __eq__(other) {
      if (other instanceof TimeDelta) return this._days === other._days && this._seconds === other._seconds && this._microseconds === other._microseconds;
      return false;
    }
  }, {
    key: "__lt__",
    value: function __lt__(other) {
      if (other instanceof TimeDelta) {
        if (this._days != other._days) return this._days < other._days;
        if (this._seconds != other._seconds) return this._seconds < other._seconds;
        return this._microseconds < other._microseconds;
      }

      _unorderable("<", this, other);
    }
  }, {
    key: "__le__",
    value: function __le__(other) {
      if (other instanceof TimeDelta) {
        if (this._days != other._days) return this._days < other._days;
        if (this._seconds != other._seconds) return this._seconds < other._seconds;
        return this._microseconds <= other._microseconds;
      }

      _unorderable("<=", this, other);
    }
  }, {
    key: "__gt__",
    value: function __gt__(other) {
      if (other instanceof TimeDelta) {
        if (this._days != other._days) return this._days > other._days;
        if (this._seconds != other._seconds) return this._seconds > other._seconds;
        return this._microseconds > other._microseconds;
      }

      _unorderable(">", this, other);
    }
  }, {
    key: "__ge__",
    value: function __ge__(other) {
      if (other instanceof TimeDelta) {
        if (this._days != other._days) return this._days > other._days;
        if (this._seconds != other._seconds) return this._seconds > other._seconds;
        return this._microseconds >= other._microseconds;
      }

      _unorderable(">=", this, other);
    }
  }, {
    key: "__neg__",
    value: function __neg__() {
      return new TimeDelta(-this._days, -this._seconds, -this._microseconds);
    }
  }, {
    key: "_adddate",
    value: function _adddate(date, days) {
      var year = date._date.getFullYear();

      var month = date._date.getMonth();

      var day = date._date.getDate() + days;
      return new Date(year, month, day);
    }
  }, {
    key: "_adddatetime",
    value: function _adddatetime(date, days, seconds, microseconds) {
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate() + days;
      var hour = date.getHours();
      var minute = date.getMinutes();
      var second = date.getSeconds() + seconds;
      var millisecond = date.getMilliseconds() + microseconds / 1000;
      return new Date(year, month, day, hour, minute, second, millisecond);
    }
  }, {
    key: "__add__",
    value: function __add__(other) {
      if (other instanceof TimeDelta) return new TimeDelta(this._days + other._days, this._seconds + other._seconds, this._microseconds + other._microseconds);else if (_isdate(other)) return this._adddate(other, this._days);else if (_isdatetime(other)) return this._adddatetime(other, this._days, this._seconds, this._microseconds);
      throw new _TypeError(_type(this) + " + " + _type(other) + " not supported");
    }
  }, {
    key: "__radd__",
    value: function __radd__(other) {
      if (_isdate(other)) return this._adddate(other, this._days);else if (_isdatetime(other)) return this._adddatetime(other, this._days, this._seconds, this._microseconds);
      throw new _TypeError(_type(this) + " + " + _type(other) + " not supported");
    }
  }, {
    key: "__sub__",
    value: function __sub__(other) {
      if (other instanceof TimeDelta) return new TimeDelta(this._days - other._days, this._seconds - other._seconds, this._microseconds - other._microseconds);
      throw new _TypeError(_type(this) + " - " + _type(other) + " not supported");
    }
  }, {
    key: "__rsub__",
    value: function __rsub__(other) {
      if (_isdate(other)) return this._adddate(other, -this._days);else if (_isdatetime(other)) return this._adddatetime(other, -this._days, -this._seconds, -this._microseconds);
      throw new _TypeError(_type(this) + " - " + _type(other) + " not supported");
    }
  }, {
    key: "__mul__",
    value: function __mul__(other) {
      if (typeof other === "number") return new TimeDelta(this._days * other, this._seconds * other, this._microseconds * other);
      throw new _TypeError(_type(this) + " * " + _type(other) + " not supported");
    }
  }, {
    key: "__rmul__",
    value: function __rmul__(other) {
      if (typeof other === "number") return new TimeDelta(this._days * other, this._seconds * other, this._microseconds * other);
      throw new _TypeError(_type(this) + " * " + _type(other) + " not supported");
    }
  }, {
    key: "__truediv__",
    value: function __truediv__(other) {
      if (typeof other === "number") {
        return new TimeDelta(this._days / other, this._seconds / other, this._microseconds / other);
      } else if (other instanceof TimeDelta) {
        var myValue = this._days;
        var otherValue = other._days;
        var hasSeconds = this._seconds || other._seconds;
        var hasMicroseconds = this._microseconds || other._microseconds;

        if (hasSeconds || hasMicroseconds) {
          myValue = myValue * 86400 + this._seconds;
          otherValue = otherValue * 86400 + other._seconds;

          if (hasMicroseconds) {
            myValue = myValue * 1000000 + this._microseconds;
            otherValue = otherValue * 1000000 + other._microseconds;
          }
        }

        return myValue / otherValue;
      }

      throw new _TypeError(_type(this) + " / " + _type(other) + " not supported");
    }
  }, {
    key: "__getattr__",
    value: function __getattr__(attrname) {
      var self = this;

      switch (attrname) {
        case "days":
          var days = function days() {
            return self._days;
          };

          expose(days, []);
          return days;

        case "seconds":
          var seconds = function seconds() {
            return self._seconds;
          };

          expose(seconds, []);
          return seconds;

        case "microseconds":
          var microseconds = function microseconds() {
            return self._microseconds;
          };

          expose(microseconds, []);
          return microseconds;

        default:
          throw new AttributeError(this, attrname);
      }
    }
  }, {
    key: "days",
    value: function days() {
      return this._days;
    }
  }, {
    key: "seconds",
    value: function seconds() {
      return this._seconds;
    }
  }, {
    key: "microseconds",
    value: function microseconds() {
      return this._microseconds;
    }
  }, {
    key: "ul4type",
    value: function ul4type() {
      return "timedelta";
    }
  }]);

  return TimeDelta;
}(Proto);
;
export var MonthDelta = function (_Proto8) {
  _inherits(MonthDelta, _Proto8);

  function MonthDelta() {
    var _this45;

    var months = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    _classCallCheck(this, MonthDelta);

    _this45 = _possibleConstructorReturn(this, _getPrototypeOf(MonthDelta).call(this));
    _this45._months = months;
    return _this45;
  }

  _createClass(MonthDelta, [{
    key: "__repr__",
    value: function __repr__() {
      if (!this._months) return "monthdelta()";
      return "monthdelta(" + this._months + ")";
    }
  }, {
    key: "__str__",
    value: function __str__() {
      if (this._months) {
        if (this._months !== -1 && this._months !== 1) return this._months + " months";
        return this._months + " month";
      }

      return "0 months";
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.__str__();
    }
  }, {
    key: "__bool__",
    value: function __bool__() {
      return this._months !== 0;
    }
  }, {
    key: "__abs__",
    value: function __abs__() {
      return this._months < 0 ? new MonthDelta(-this._months) : this;
    }
  }, {
    key: "__eq__",
    value: function __eq__(other) {
      if (other instanceof MonthDelta) return this._months === other._months;
      return false;
    }
  }, {
    key: "__lt__",
    value: function __lt__(other) {
      if (other instanceof MonthDelta) return this._months < other._months;

      _unorderable("<", this, other);
    }
  }, {
    key: "__le__",
    value: function __le__(other) {
      if (other instanceof MonthDelta) return this._months <= other._months;

      _unorderable("<=", this, other);
    }
  }, {
    key: "__gt__",
    value: function __gt__(other) {
      if (other instanceof MonthDelta) return this._months > other._months;

      _unorderable(">", this, other);
    }
  }, {
    key: "__ge__",
    value: function __ge__(other) {
      if (other instanceof MonthDelta) return this._months >= other._months;

      _unorderable(">=", this, other);
    }
  }, {
    key: "__neg__",
    value: function __neg__() {
      return new MonthDelta(-this._months);
    }
  }, {
    key: "_adddate",
    value: function _adddate(date, months) {
      var result = this._adddatetime(date._date, months);

      return new Date_(result.getFullYear(), result.getMonth() + 1, result.getDate());
    }
  }, {
    key: "_adddatetime",
    value: function _adddatetime(date, months) {
      var year = date.getFullYear();
      var month = date.getMonth() + months;
      var day = date.getDate();
      var hour = date.getHours();
      var minute = date.getMinutes();
      var second = date.getSeconds();
      var millisecond = date.getMilliseconds();

      while (true) {
        var targetmonth = new Date(year, month, 1, hour, minute, second, millisecond).getMonth();
        var result = new Date(year, month, day, hour, minute, second, millisecond);
        if (result.getMonth() === targetmonth) return result;
        --day;
      }
    }
  }, {
    key: "__add__",
    value: function __add__(other) {
      if (_ismonthdelta(other)) return new MonthDelta(this._months + other._months);else if (_isdate(other)) return this._adddate(other, this._months);else if (_isdatetime(other)) return this._adddatetime(other, this._months);
      throw new ArgumentError(_type(this) + " + " + _type(other) + " not supported");
    }
  }, {
    key: "__radd__",
    value: function __radd__(other) {
      if (_isdate(other)) return this._adddate(other, this._months);else if (_isdatetime(other)) return this._adddatetime(other, this._months);
      throw new ArgumentError(_type(this) + " + " + _type(other) + " not supported");
    }
  }, {
    key: "__sub__",
    value: function __sub__(other) {
      if (_ismonthdelta(other)) return new MonthDelta(this._months - other._months);
      throw new ArgumentError(_type(this) + " - " + _type(other) + " not supported");
    }
  }, {
    key: "__rsub__",
    value: function __rsub__(other) {
      if (_isdate(other)) return this._adddate(other, -this._months);else if (_isdatetime(other)) return this._adddatetime(other, -this._months);
      throw new ArgumentError(_type(this) + " - " + _type(other) + " not supported");
    }
  }, {
    key: "__mul__",
    value: function __mul__(other) {
      if (typeof other === "number") return new MonthDelta(this._months * Math.floor(other));
      throw new ArgumentError(_type(this) + " * " + _type(other) + " not supported");
    }
  }, {
    key: "__rmul__",
    value: function __rmul__(other) {
      if (typeof other === "number") return new MonthDelta(this._months * Math.floor(other));
      throw new ArgumentError(_type(this) + " * " + _type(other) + " not supported");
    }
  }, {
    key: "__floordiv__",
    value: function __floordiv__(other) {
      if (typeof other === "number") return new MonthDelta(Math.floor(this._months / other));else if (_ismonthdelta(other)) return Math.floor(this._months / other._months);
      throw new ArgumentError(_type(this) + " // " + _type(other) + " not supported");
    }
  }, {
    key: "__truediv__",
    value: function __truediv__(other) {
      if (_ismonthdelta(other)) return this._months / other._months;
      throw new ArgumentError(_type(this) + " / " + _type(other) + " not supported");
    }
  }, {
    key: "__getattr__",
    value: function __getattr__(attrname) {
      var self = this;

      switch (attrname) {
        case "months":
          var months = function months() {
            return self._months;
          };

          expose(months, []);
          return months;

        default:
          throw new AttributeError(this, attrname);
      }
    }
  }, {
    key: "months",
    value: function months() {
      return this._months;
    }
  }, {
    key: "ul4type",
    value: function ul4type() {
      return "monthdelta";
    }
  }]);

  return MonthDelta;
}(Proto);
;
var constructors = [TextAST, IndentAST, LineEndAST, ConstAST, SeqItemAST, UnpackSeqItemAST, DictItemAST, UnpackDictItemAST, PosArgAST, KeywordArgAST, UnpackListArgAST, UnpackDictArgAST, ListAST, ListCompAST, DictAST, DictCompAST, SetAST, SetCompAST, GenExprAST, VarAST, NotAST, NegAST, BitNotAST, IfAST, ReturnAST, PrintAST, PrintXAST, ItemAST, IsAST, IsNotAST, EQAST, NEAST, LTAST, LEAST, GTAST, GEAST, NotContainsAST, ContainsAST, AddAST, SubAST, MulAST, FloorDivAST, TrueDivAST, ModAST, ShiftLeftAST, ShiftRightAST, BitAndAST, BitXOrAST, BitOrAST, AndAST, OrAST, SliceAST, AttrAST, CallAST, RenderAST, RenderXAST, RenderBlockAST, RenderBlocksAST, SetVarAST, AddVarAST, SubVarAST, MulVarAST, TrueDivVarAST, FloorDivVarAST, ModVarAST, ShiftLeftVarAST, ShiftRightVarAST, BitAndVarAST, BitXOrVarAST, BitOrVarAST, ForBlockAST, WhileBlockAST, BreakAST, ContinueAST, CondBlockAST, IfBlockAST, ElIfBlockAST, ElseBlockAST, SignatureAST, Template];

for (var _i9 = 0, _constructors = constructors; _i9 < _constructors.length; _i9++) {
  var _constructor2 = _constructors[_i9];
  var name = _constructor2.name;
  if (name.substr(name.length - 3) === "AST") name = name.substr(0, name.length - 3);
  name = name.toLowerCase();
  _constructor2.prototype.type = name;
  register("de.livinglogic.ul4." + name, _constructor2);
}
//# sourceMappingURL=ul4.js.map