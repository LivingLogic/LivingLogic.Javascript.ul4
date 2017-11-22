/*!
 * UL4/UL4ON JavaScript Library
 * http://www.livinglogic.de/Python/ul4c/
 * http://www.livinglogic.de/Python/ul4on/
 *
 * Copyright 2011-2017 by LivingLogic AG, Bayreuth/Germany
 * Copyright 2011-2017 by Walter Dörwald
 *
 * All Rights Reserved
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jslint vars: true */


;(function(undefined){
	var root = this, ul4 = {}, ul4on = {};

	var isamd = typeof(define) === "function" && define.amd;
	var iscommon = typeof(module) === "object" && module.exports;

	if (isamd)
	{
		// AMD
		define(['../../node_modules/blueimp-md5/js/md5.min'], function (md5F)
		{
			window.md5 = md5F;

			return {ul4: ul4, ul4on: ul4on};
		});
	}
	else if (iscommon)
	{
		// COMMONJS
		module.exports.ul4 = ul4;
		module.exports.ul4on = ul4on;
	}
	else
	{
		// DEFAULT
		root.ul4 = ul4;
		root.ul4on = ul4on;
	}

	ul4.version = "43";

	//
	// UL4ON
	//

	ul4on._registry = {};

	ul4on._havemap = (typeof(Map) === "function" && typeof(Map.prototype.forEach) === "function");

	ul4on._havemapconstructor = false;

	if (ul4on._havemap)
	{
		try
		{
			if (new Map([[1, 2]]).size == 1)
				ul4on._havemapconstructor = true;
		}
		catch (error)
		{
		}
	}

	ul4on._haveset = (typeof(Set) === "function" && typeof(Set.prototype.forEach) === "function");

	ul4on._havesetconstructor = false;

	if (ul4on._haveset)
	{
		try
		{
			if (new Set([1, 2]).size == 2)
				ul4on._havesetconstructor = true;
		}
		catch (error)
		{
		}
	}

	// helper functions that work with Maps and objects
	if (ul4on._havemap)
	{
		ul4on._makemap = function _makemap(...items)
		{
			let map = new Map();

			for (let i = 0; i < items.length; ++i)
				map.set(items[i][0], items[i][1]);
			return map;
		};

		ul4on._setmap = function _setmap(map, key, value)
		{
			if (map.__proto__ === Map.prototype)
				map.set(key, value);
			else
				map[key] = value;
		};

		ul4on._emptymap = function _emptymap()
		{
			return new Map();
		};

		ul4on._getmap = function _getmap(map, key, value)
		{
			if (map.__proto__ === Map.prototype)
				return map.get(key);
			else
				return map[key];
		};
	}
	else
	{
		ul4on._makemap = function _makemap(...items)
		{
			let map = {};

			for (let i = 0; i < items.length; ++i)
				map[items[i][0]] = items[i][1];
			return map;
		};

		ul4on._setmap = function _setmap(map, key, value)
		{
			map[key] = value;
		};

		ul4on._emptymap = function _emptymap()
		{
			return {};
		};

		ul4on._getmap = function _getmap(map, key, value)
		{
			return map[key];
		};
	}

	// Function used for making sets, when the Set constructor doesn't work (or we don't have sets)
	if (ul4on._haveset)
	{
		ul4on._emptyset = function _emptyset()
		{
			return new Set();
		};
	}
	else
	{
		ul4on._emptyset = function _emptyset()
		{
			return ul4._Set.create();
		};
	}

	ul4on._makeset = function _makeset(...items)
	{
		let set = ul4on._emptyset();

		for (let i = 0; i < items.length; ++i)
			set.add(items[i]);
		return set;
	};

	// Register the object ``obj`` under the name ``name`` with the UL4ON machinery
	ul4on.register = function register(name, obj)
	{
		obj.ul4onname = name;
		ul4on._registry[name] = function(){return obj.create();};
	};

	// Return a string that contains the object ``obj`` in the UL4ON serialization format
	ul4on.dumps = function dumps(obj, indent)
	{
		let encoder = ul4on.Encoder.create(indent);
		encoder.dump(obj);
		return encoder.finish();
	};

	// Load an object from the string ``data``.
	// ``data`` must contain the object in the UL4ON serialization format
	// ``registry`` may be null or a dictionary mapping type names to objects with a create method
	ul4on.loads = function loads(data, registry)
	{
		let decoder = ul4on.Decoder.create(data, registry);
		return decoder.load();
	};

	// Helper "class" for encoding
	ul4on.Encoder = {
		// Create a new Encoder object
		create: function create(indent)
		{
			let encoder = ul4._clone(this);
			encoder.indent = indent || null;
			encoder.data = [];
			encoder._level = 0;
			encoder._strings2index = {};
			encoder._ids2index = {};
			encoder._backrefs = 0;
			return encoder;
		},

		_line: function _line(line, ...args)
		{
			if (this.indent !== null)
			{
				for (let i = 0; i < this._level; ++i)
					this.data.push(this.indent);
			}
			else
			{
				if (this.data.length)
					this.data.push(" ");
			}
			this.data.push(line);

			if (args.length)
			{
				let oldindent = this.indent;
				this.indent = null;
				for (let i = 0; i < args.length; ++i)
					this.dump(args[i]);
				this.indent = oldindent;
			}

			if (this.indent !== null)
				this.data.push("\n");
		},

		// Return the complete string written to the buffer
		finish: function finish()
		{
			return this.data.join("");
		},

		dump: function dump(obj)
		{
			if (obj === null)
				this._line("n");
			else if (typeof(obj) == "boolean")
				this._line(obj ? "bT" : "bF");
			else if (typeof(obj) == "number")
			{
				let type = (Math.round(obj) == obj) ? "i" : "f";
				this._line(type + obj);
			}
			else if (typeof(obj) == "string")
			{
				let index = this._strings2index[obj];
				if (typeof(index) !== "undefined")
				{
					this._line("^" + index);
				}
				else
				{
					this._strings2index[obj] = this._backrefs++;
					let dump = ul4._str_repr(obj).replace("<", "\\x3c");
					this._line("S" + dump);
				}
			}
			else if (ul4._iscolor(obj))
				this._line("c", obj.r(), obj.g(), obj.b(), obj.a());
			else if (ul4._isdate(obj))
				this._line("z", obj.getFullYear(), obj.getMonth()+1, obj.getDate(), obj.getHours(), obj.getMinutes(), obj.getSeconds(), obj.getMilliseconds() * 1000);
			else if (ul4._istimedelta(obj))
				this._line("t", obj.days(), obj.seconds(), obj.microseconds());
			else if (ul4._ismonthdelta(obj))
				this._line("m", obj.months());
			else if (typeof(obj) === "object" && typeof(obj.isa) === "function" && obj.isa(ul4.slice))
				this._line("r", obj.start, obj.stop);
			else if (obj.ul4onname && obj.ul4ondump)
			{
				if (obj.__id__)
				{
					let index = this._ids2index[obj.__id__];
					if (typeof(index) != "undefined")
					{
						this._line("^" + index);
						return;
					}
				}
				if (obj.__id__)
					this._ids2index[obj.__id__] = this._backrefs++;
				this._line("O", obj.ul4onname);
				++this._level;
				obj.ul4ondump(this);
				--this._level;
				this._line(")");
			}
			else if (ul4._islist(obj))
			{
				this._line("l");
				++this._level;
				for (let i = 0; i < obj.length; ++i)
					this.dump(obj[i]);
				--this._level;
				this._line("]");
			}
			else if (ul4._ismap(obj))
			{
				this._line("e");
				++this._level;
				obj.forEach(function(value, key) {
					this.dump(key);
					this.dump(value);
				}, this);
				--this._level;
				this._line("}");
			}
			else if (ul4._isdict(obj))
			{
				this._line("d");
				++this._level;
				for (let key in obj)
				{
					this.dump(key);
					this.dump(obj[key]);
				}
				--this._level;
				this._line("}");
			}
			else if (ul4._isset(obj))
			{
				this._line("y");
				++this._level;
				obj.forEach(function(value) {
					this.dump(value);
				}, this);
				--this._level;
				this._line("}");
			}
			else
				throw "can't handle object";
		}
	};

	// Helper "class" for decoding
	ul4on.Decoder = {
		// Creates a new decoder for reading from the string ``data``
		create: function create(data, registry)
		{
			let decoder = ul4._clone(this);
			decoder.data = data;
			decoder.pos = 0;
			decoder.backrefs = [];
			decoder.registry = typeof(registry) === "undefined" ? null : registry;
			return decoder;
		},

		// Read a character from the buffer
		readchar: function readchar()
		{
			if (this.pos >= this.data.length)
				throw "UL4 decoder at EOF";
			return this.data.charAt(this.pos++);
		},

		// Read a character from the buffer (return null on eof)
		readcharoreof: function readcharoreof()
		{
			if (this.pos >= this.data.length)
				return null;
			return this.data.charAt(this.pos++);
		},

		// Read next not-whitespace character from the buffer
		readblackchar: function readblackchar()
		{
			let re_white = /\s/;

			for (;;)
			{
				if (this.pos >= this.data.length)
					throw "UL4 decoder at EOF";
				let c = this.data.charAt(this.pos++);
				if (!c.match(re_white))
					return c;
			}
		},

		// Read ``size`` characters from the buffer
		read: function read(size)
		{
			if (this.pos+size > this.length)
				size = this.length-this.pos;
			let result = this.data.substring(this.pos, this.pos+size);
			this.pos += size;
			return result;
		},

		// "unread" one character
		backup: function backup()
		{
			--this.pos;
		},

		// Read a number from the buffer
		readnumber: function readnumber()
		{
			let re_digits = /[-+0123456789.eE]/, value = "";
			for (;;)
			{
				let c = this.readcharoreof();
				if (c !== null && c.match(re_digits))
					value += c;
				else
				{
					let result = parseFloat(value);
					if (isNaN(result))
						throw "invalid number, got " + ul4._repr("value") + " at position " + this.pos;
					return result;
				}
			}
		},

		_beginfakeloading: function _beginfakeloading()
		{
			let oldpos = this.backrefs.length;
			this.backrefs.push(null);
			return oldpos;
		},

		_endfakeloading: function _endfakeloading(oldpos, value)
		{
			this.backrefs[oldpos] = value;
		},

		_readescape: function _readescape(escapechar, length)
		{
			let chars = this.read(length);
			if (chars.length != length)
				throw "broken escape " + ul4._repr("\\" + escapechar + chars) + " at position " + this.pos;
			let codepoint = parseInt(chars, 16);
			if (isNaN(codepoint))
				throw "broken escape " + ul4._repr("\\" + escapechar + chars) + " at position " + this.pos;
			return String.fromCharCode(codepoint);
		},

		// Load the next object from the buffer
		load: function load()
		{
			let typecode = this.readblackchar();
			let result;
			switch (typecode)
			{
				case "^":
					return this.backrefs[this.readnumber()];
				case "n":
				case "N":
					if (typecode === "N")
						this.backrefs.push(null);
					return null;
				case "b":
				case "B":
					result = this.readchar();
					if (result === "T")
						result = true;
					else if (result === "F")
						result = false;
					else
						throw "wrong value for boolean, expected 'T' or 'F', got " + ul4._repr(result) + " at position " + this.pos;
					if (typecode === "B")
						this.backrefs.push(result);
					return result;
				case "i":
				case "I":
				case "f":
				case "F":
					result = this.readnumber();
					if (typecode === "I" || typecode === "F")
						this.backrefs.push(result);
					return result;
				case "s":
				case "S":
					result = [];
					let delimiter = this.readblackchar();
					for (;;)
					{
						let c = this.readchar();
						if (c == delimiter)
							break;
						if (c == "\\")
						{
							let c2 = this.readchar();
							if (c2 == "\\")
								result.push("\\");
							else if (c2 == "n")
								result.push("\n");
							else if (c2 == "r")
								result.push("\r");
							else if (c2 == "t")
								result.push("\t");
							else if (c2 == "f")
								result.push("\u000c");
							else if (c2 == "b")
								result.push("\u0008");
							else if (c2 == "a")
								result.push("\u0007");
							else if (c2 == "'")
								result.push("'");
							else if (c2 == '"')
								result.push('"');
							else if (c2 == "x")
								result.push(this._readescape("x", 2));
							else if (c2 == "u")
								result.push(this._readescape("u", 4));
							else if (c2 == "U")
								result.push(this._readescape("U", 8));
							else
								result.push("\\" + c2);
						}
						else
							result.push(c);
					}
					result = result.join("");
					if (typecode === "S")
						this.backrefs.push(result);
					return result;
				case "c":
				case "C":
					result = ul4.Color.create();
					if (typecode === "C")
						this.backrefs.push(result);
					result._r = this.load();
					result._g = this.load();
					result._b = this.load();
					result._a = this.load();
					return result;
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
					result.setMilliseconds(this.load()/1000);
					if (typecode === "Z")
						this.backrefs.push(result);
					return result;
				case "t":
				case "T":
					result = ul4.TimeDelta.create();
					result._days = this.load();
					result._seconds = this.load();
					result._microseconds = this.load();
					if (typecode === "T")
						this.backrefs.push(result);
					return result;
				case "r":
				case "R":
					result = ul4.slice.create();
					if (typecode === "R")
						this.backrefs.push(result);
					result.start = this.load();
					result.stop = this.load();
					return result;
				case "m":
				case "M":
					result = ul4.MonthDelta.create();
					if (typecode === "M")
						this.backrefs.push(result);
					result._months = this.load();
					return result;
				case "l":
				case "L":
					result = [];
					if (typecode === "L")
						this.backrefs.push(result);
					for (;;)
					{
						typecode = this.readblackchar();
						if (typecode === "]")
							return result;
						this.backup();
						result.push(this.load());
					}
					return result;
				case "d":
				case "D":
				case "e":
				case "E":
					if (!ul4on._havemap && (typecode == "e" || typecode == "E"))
						throw "ordered dictionaries are not supported!";
					result = ul4on._emptymap();
					if (typecode === "D" || typecode === "E")
						this.backrefs.push(result);
					for (;;)
					{
						typecode = this.readblackchar();
						if (typecode === "}")
							return result;
						this.backup();
						let key = this.load();
						let value = this.load();
						ul4on._setmap(result, key, value);
					}
					return result;
				case "y":
				case "Y":
					result = ul4on._makeset();
					if (typecode === "Y")
						this.backrefs.push(result);
					for (;;)
					{
						typecode = this.readblackchar();
						if (typecode === "}")
							return result;
						this.backup();
						result.add(this.load());
					}
					return result;
				case "o":
				case "O":
					let oldpos;
					if (typecode === "O")
						oldpos = this._beginfakeloading();
					let name = this.load();
					let proto;
					if (this.registry !== null)
					{
						proto = this.registry[name];
						if (typeof(proto) === "undefined")
							proto = ul4on._registry[name];
					}
					else
						proto = ul4on._registry[name];
					if (typeof(proto) === "undefined")
						throw "can't load object of type " + ul4._repr(name);
					result = proto();
					if (typecode === "O")
						this._endfakeloading(oldpos, result);
					result.ul4onload(this);
					typecode = this.readblackchar();
					if (typecode !== ")")
						throw "object terminator ')' for object of type '" + name + "' expected, got " + ul4._repr(typecode) + " at position " + this.pos;
					return result;
				default:
					throw "unknown typecode " + ul4._repr(typecode) + " at position " + this.pos;
			}
		}
	};


	//
	// UL4
	//

	// REs for parsing JSON
	ul4._rvalidchars = /^[\],:{}\s]*$/;
	ul4._rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
	ul4._rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
	ul4._rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

	/// Helper functions

	// Crockford style object creation
	ul4._simpleclone = function _simpleclone(obj)
	{
		function F(){};
		F.prototype = obj;
		let result = new F();
		return result;
	};

	// Crockford style object creation + prototype chain + object ids
	ul4._clone = function _clone(obj)
	{
		let result = ul4._simpleclone(obj);
		result.__prototype__ = obj;
		result.__id__ = ul4.Proto._nextid++;
		return result;
	};

	// Adds attributes from on object to another and returns it
	ul4._extend = function _extend(obj, attrs)
	{
		for (let name in attrs)
			obj[name] = attrs[name];
		return obj;
	};

	// Clone an object via ``_simpleclone`` and extend it
	ul4._simpleinherit = function _simpleinherit(baseobj, attrs)
	{
		return ul4._extend(ul4._simpleclone(baseobj), attrs);
	};

	// Clone an object via ``_clone`` and extend it
	ul4._inherit = function _inherit(baseobj, attrs)
	{
		return ul4._extend(ul4._clone(baseobj), attrs);
	};

	// Convert a map to an object
	ul4._map2object = function _map2object(obj)
	{
		if (ul4._ismap(obj))
		{
			let newobj = {};
			obj.forEach(function(value, key){
				if (typeof(key) !== "string")
					throw ul4.TypeError.create("keys must be strings");
				newobj[key] = value;
			});
			return newobj;
		}
		return obj;
	};

	// Clip a number to the range [0;max)
	ul4._bound = function _bound(value, upper)
	{
		if (value < 0)
			return 0;
		else if (value > upper)
			return upper;
		else
			return value;
	};

	// Create a pretty stacktrace from an exception
	ul4._stacktrace = function _stacktrace(exc)
	{
		let output = ul4._type(exc);
		let s = exc.toString();
		if (s)
			output += ": " + s;
		if (exc.cause)
			output += "\n\n" + ul4._stacktrace(exc.cause);
		return output;
	};

	// Call a function ``f`` with UL4 argument handling
	ul4._internal_call = function _internal_call(context, f, name, functioncontext, signature, needscontext, needsobject, args, kwargs)
	{
		let finalargs;
		if (needsobject)
		{
			if (signature === null)
			{
				if (args.length)
					throw ul4.ArgumentError.create(ul4._repr(f) + " doesn't support positional arguments!");
				finalargs = [kwargs];
			}
			else
				finalargs = [signature.bindObject(name, args, kwargs)];
		}
		else
		{
			if (signature === null)
				throw ul4.ArgumentError.create(ul4._repr(f) + " doesn't support positional arguments!");
			finalargs = signature.bindArray(name, args, kwargs);
		}
		if (needscontext)
			finalargs.unshift(context);
		return f.apply(functioncontext, finalargs);
	};

	ul4._callfunction = function _callfunction(context, f, args, kwargs)
	{
		let name = f._ul4_name || f.name;
		if (typeof(f._ul4_signature) === "undefined" || typeof(f._ul4_needsobject) === "undefined" || typeof(f._ul4_needscontext) === "undefined")
			throw ul4.TypeError.create("call", ul4._repr(f) + " is not callable by UL4");
		return ul4._internal_call(context, f, name, ul4, f._ul4_signature, f._ul4_needscontext, f._ul4_needsobject, args, kwargs);
	};

	ul4._callobject = function _callobject(context, obj, args, kwargs)
	{
		if (typeof(obj._ul4_callsignature) === "undefined" || typeof(obj._ul4_callneedsobject) === "undefined" || typeof(obj._ul4_callneedscontext) === "undefined")
			throw ul4.TypeError.create("call", ul4._repr(obj) + " is not callable by UL4");
		return ul4._internal_call(context, obj.__call__, obj.name, obj, obj._ul4_callsignature, obj._ul4_callneedscontext, obj._ul4_callneedsobject, args, kwargs);
	};

	ul4._callrender = function _callrender(context, obj, args, kwargs)
	{
		if (typeof(obj._ul4_rendersignature) === "undefined" || typeof(obj._ul4_renderneedsobject) === "undefined" || typeof(obj._ul4_renderneedscontext) === "undefined")
			throw ul4.TypeError.create("render", ul4._repr(obj) + " is not renderable by UL4");
		return ul4._internal_call(context, obj.__render__, obj.name, obj, obj._ul4_rendersignature, obj._ul4_renderneedscontext, obj._ul4_renderneedsobject, args, kwargs);
	};

	ul4._call = function _call(context, f, args, kwargs)
	{
		if (typeof(f) === "function")
			return ul4._callfunction(context, f, args, kwargs);
		else if (f && typeof(f.__call__) === "function")
			return ul4._callobject(context, f, args, kwargs);
		else
			throw ul4.TypeError.create("call", ul4._type(f) + " is not callable");
	};

	ul4._unpackvar = function _unpackvar(lvalue, value)
	{
		if (!ul4._islist(lvalue))
			return [[lvalue, value]];
		else
		{
			let newvalue = [];
			let iter = ul4._iter(value);

			for (let i = 0;;++i)
			{
				let item = iter.next();

				if (item.done)
				{
					if (i === lvalue.length)
						break;
					else
						throw ul4.ValueError.create("need " + lvalue.length + " value" + (lvalue.length === 1 ? "" : "s") + " to unpack, got " + i);
				}
				else
				{
					if (i < lvalue.length)
						newvalue = newvalue.concat(ul4._unpackvar(lvalue[i], item.value));
					else
						throw ul4.ValueError.create("too many values to unpack (expected " + lvalue.length + ")");
				}
			}
			return newvalue;
		}
	};

	ul4._formatsource = function _formatsource(out)
	{
		let finalout = [];
		let level = 0, needlf = false;
		for (let i = 0; i < out.length; ++i)
		{
			if (typeof(out[i]) === "number")
			{
				level += out[i];
				needlf = true;
			}
			else
			{
				if (needlf)
				{
					finalout.push("\n");
					for (let j = 0; j < level; ++j)
						finalout.push("\t");
					needlf = false;
				}
				finalout.push(out[i]);
			}
		}
		if (needlf)
			finalout.push("\n");
		return finalout.join("");
	};

	// Compare ``obj1`` and ``obj2`` if they have the same value
	ul4._eq = function _eq(obj1, obj2)
	{
		let numbertypes = ["boolean", "number"];

		if (obj1 && typeof(obj1.__eq__) === "function")
			return obj1.__eq__(obj2);
		else if (obj2 && typeof(obj2.__eq__) === "function")
			return obj2.__eq__(obj1);
		else if (obj1 === null)
			return obj2 === null;
		else if (numbertypes.indexOf(typeof(obj1)) != -1)
		{
			if (numbertypes.indexOf(typeof(obj2)) != -1)
				return obj1 == obj2;
			else
				return false;
		}
		else if (typeof(obj1) === "string")
		{
			if (typeof(obj2) === "string")
				return obj1 == obj2;
			else
				return false;
		}
		else if (ul4._isdate(obj1))
		{
			if (ul4._isdate(obj2))
				return obj1.getTime() == obj2.getTime();
			else
				return false;
		}
		else if (ul4._islist(obj1))
		{
			if (ul4._islist(obj2))
			{
				// Shortcut, if it's the same object
				if (obj1 === obj2)
					return true;
				if (obj1.length != obj2.length)
					return false;
				for (let i = 0; i < obj1.length; ++i)
				{
					if (!ul4._eq(obj1[i], obj2[i])) // This might lead to infinite recursion and a stackoverflow, but it does in all implementations
						return false;
				}
				return true;
			}
			else
				return false;
		}
		else if (ul4._isobject(obj1))
		{
			if (ul4._isobject(obj2))
			{
				// Shortcut, if it's the same object
				if (obj1 === obj2)
					return true;
				// Test that each attribute of ``obj1`` can also be found in ``obj2`` and has the same value
				for (let key in obj1)
				{
					if (obj2.hasOwnProperty(key))
					{
						if (!ul4._eq(obj1[key], obj2[key]))
							return false;
					}
					else
						return false;
				}
				// Test that each attribute of ``obj2`` is alos in ``obj1`` (the value has been tested before)
				for (let key in obj2)
				{
					if (!obj1.hasOwnProperty(key))
						return false;
				}
				return true;
			}
			else if (ul4._ismap(obj2))
			{
				// Test that each attribute of ``obj1`` can also be found in ``obj2`` and has the same value
				for (let key in obj1)
				{
					if (obj2.has(key))
					{
						if (!ul4._eq(obj1[key], obj2.get(key)))
							return false;
					}
					else
						return false;
				}
				// Test that each attribute of ``obj2`` is alos in ``obj1`` (the value has been tested before)
				let result = true;
				obj2.forEach(function(value, key){
					if (!obj1.hasOwnProperty(key))
						result = false;
				});
				return result;
			}
			else
				return false;
		}
		else if (ul4._ismap(obj1))
		{
			if (ul4._isobject(obj2))
			{
				// Test that each attribute of ``obj1`` can also be found in ``obj2`` and has the same value
				let result = true;
				obj1.forEach(function(value, key){
					if (result) // Skip code, if result is already ``false``
					{
						if (!obj2.hasOwnProperty(key))
							result = false;
						else if (!ul4._eq(obj1.get(key), obj2[key]))
							result = false;
					}
				});
				if (!result)
					return false;
				// Test that each attribute of ``obj2`` is alos in ``obj1`` (the value has been tested before)
				for (let key in obj2)
				{
					if (!obj1.has(key))
						return false;
				}
				return true;
			}
			else if (ul4._ismap(obj2))
			{
				// Shortcut, if it's the same object
				if (obj1 === obj2)
					return true;
				if (obj1.size != obj2.size)
					return false;
				// Test that each attribute of ``obj1`` can also be found in ``obj2`` and has the same value
				let result = true;
				obj1.forEach(function(value, key){
					if (result) // Skip code, if result is already ``false``
					{
						if (!obj2.has(key))
							result = false;
						else if (!ul4._eq(obj1.get(key), obj2.get(key)))
							result = false;
					}
				});
				return result;
			}
			else
				return false;
		}
		else if (ul4._isset(obj1))
		{
			// We don't have to test for ``ul4._Set`` as ``ul4._Set`` implements ``__eq__``
			if (ul4._isset(obj2))
			{
				// Shortcut, if it's the same object
				if (obj1 === obj2)
					return true;
				if (obj1.size != obj2.size)
					return false;
				let result = true;
				obj1.forEach(function(value){
					if (result) // Skip code, if result is already ``false``
					{
						if (!obj2.has(value))
							result = false;
					}
				});
				return result;
			}
			else
				return false;
		}
		else
			return obj1 === obj2;
	};

	// Compare ``obj1`` and ``obj2`` if they don't have the same value
	ul4._ne = function _ne(obj1, obj2)
	{
		if (obj1 && typeof(obj1.__ne__) === "function")
			return obj1.__ne__(obj2);
		else if (obj2 && typeof(obj2.__ne__) === "function")
			return obj2.__ne__(obj1);
		else
			return !ul4._eq(obj1, obj2);
	};

	ul4._unorderable = function _unorderable(operator, obj1, obj2)
	{
		throw ul4.TypeError.create(operator, "unorderable types: " + ul4._type(obj1) + " " + operator + " " + ul4._type(obj2));
	};

	// Return:
	// -1 when ``obj1 < obj2``,
	//  0 when ``obj1 == obj2``,
	//  1 when ``obj1 > obj2``,
	//  null when ``obj1`` and ``obj2`` are comparable, but neither of the previous cases holds (only for sets)
	// raise TypeError if objects are uncomparable
	// This the purpose of ``_cmp`` is to support implementation of <, <=, > and >=
	// and dicts/maps are not comparable with the operator ``_cmp`` does not support dicts/maps

	ul4._cmp = function _cmp(operator, obj1, obj2)
	{
		let numbertypes = ["boolean", "number"];

		if (numbertypes.indexOf(typeof(obj1)) != -1)
		{
			if (numbertypes.indexOf(typeof(obj2)) != -1)
				return (obj1 > obj2) - (obj1 < obj2);
		}
		else if (typeof(obj1) === "string")
		{
			if (typeof(obj2) === "string")
				return (obj1 > obj2) - (obj1 < obj2);
		}
		else if (ul4._isdate(obj1))
		{
			if (ul4._isdate(obj2))
			{
				let v1 = obj1.getTime(), v2 = obj2.getTime();
				return (v1 > v2) - (v1 < v2);
			}
		}
		else if (ul4._islist(obj1))
		{
			if (ul4._islist(obj2))
			{
				if (obj1 === obj2)
					return 0;
				for (let i = 0; i < obj1.length; ++i)
				{
					if (i >= obj2.length)
						return 1;
					let res = ul4._cmp(operator, obj1[i], obj2[i]);
					if (res)
						return res;
				}
				return obj2.length > obj1.length ? -1 : 0;
			}
		}
		else if (ul4._isset(obj1) || ul4._isul4set(obj1))
		{
			let in1only = false;
			let in2only = false;

			if (ul4._isset(obj2))
			{
				if (ul4._isset(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.has(value))
							in1only = true;
					});
					obj2.forEach(function(value){
						if (!obj1.has(value))
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.items[value])
							in1only = true;
					});
					for (let value in obj2.items)
					{
						if (!obj1.has(value))
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else if (ul4._isul4set(obj2))
			{
				if (ul4._isset(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.has(value))
						{
							in1only = true;
							break;
						}
					}
					obj2.forEach(function(value){
						if (!obj1.items[value])
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.items[value])
						{
							in1only = true;
							break;
						}
					}
					for (let value in obj2.items)
					{
						if (!obj1.items[value])
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else
				ul4._unorderable(operator, obj1, obj2);

			if (in1only)
			{
				if (in2only)
					return null;
				else
					return 1;
			}
			else
			{
				if (in2only)
					return -1;
				else
					return 0;
			}
		}
		else
			ul4._unorderable(operator, obj1, obj2);
	};

	// Return whether ``obj1 < obj2``
	ul4._lt = function _lt(obj1, obj2)
	{
		var numbertypes = ["boolean", "number"];

		if (obj1 && typeof(obj1.__lt__) === "function")
			return obj1.__lt__(obj2);
		else if (numbertypes.indexOf(typeof(obj1)) != -1)
		{
			if (numbertypes.indexOf(typeof(obj2)) != -1)
				return obj1 < obj2;
		}
		else if (typeof(obj1) === "string")
		{
			if (typeof(obj2) === "string")
				return obj1 < obj2;
		}
		else if (ul4._isdate(obj1))
		{
			if (ul4._isdate(obj2))
				return obj1.getTime() < obj2.getTime();
		}
		else if (ul4._islist(obj1))
		{
			if (ul4._islist(obj2))
			{
				if (obj1 === obj2)
					return false;
				for (let i = 0; i < obj1.length; ++i)
				{
					if (i >= obj2.length)
						return false;
					let eq = ul4._eq(obj1[i], obj2[i]);
					if (!eq)
						return ul4._lt(obj1[i], obj2[i]);
				}
				return obj1.length < obj2.length;
			}
		}
		// FIXME: Set comparison
		else if (ul4._isset(obj1))
		{
			if (ul4._isset(obj2))
			{
				if (ul4._isset(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.has(value))
							in1only = true;
					});
					obj2.forEach(function(value){
						if (!obj1.has(value))
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.items[value])
							in1only = true;
					});
					for (let value in obj2.items)
					{
						if (!obj1.has(value))
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else if (ul4._isul4set(obj2))
			{
				if (ul4._isset(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.has(value))
						{
							in1only = true;
							break;
						}
					}
					obj2.forEach(function(value){
						if (!obj1.items[value])
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.items[value])
						{
							in1only = true;
							break;
						}
					}
					for (let value in obj2.items)
					{
						if (!obj1.items[value])
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else
				ul4._unorderable(operator, obj1, obj2);

			if (in1only)
			{
				if (in2only)
					return null;
				else
					return 1;
			}
			else
			{
				if (in2only)
					return -1;
				else
					return 0;
			}
		}
		ul4._unorderable("<", obj1, obj2);
	};

	// Return whether ``obj1 <= obj2``
	ul4._le = function _le(obj1, obj2)
	{
		let numbertypes = ["boolean", "number"];

		if (obj1 && typeof(obj1.__le__) === "function")
			return obj1.__le__(obj2);
		if (numbertypes.indexOf(typeof(obj1)) != -1)
		{
			if (numbertypes.indexOf(typeof(obj2)) != -1)
				return obj1 <= obj2;
		}
		else if (typeof(obj1) === "string")
		{
			if (typeof(obj2) === "string")
				return obj1 <= obj2;
		}
		else if (ul4._isdate(obj1))
		{
			if (ul4._isdate(obj2))
				return obj1.getTime() <= obj2.getTime();
		}
		else if (ul4._islist(obj1))
		{
			if (ul4._islist(obj2))
			{
				if (obj1 === obj2)
					return true;
				for (let i = 0; i < obj1.length; ++i)
				{
					if (i >= obj2.length)
						return false;
					let eq = ul4._eq(obj1[i], obj2[i]);
					if (!eq)
						return ul4._lt(obj1[i], obj2[i]);
				}
				return obj1.length <= obj2.length;
			}
		}
		// FIXME: Set comparison
		else if (ul4._isset(obj1) || ul4._isul4set(obj1))
		{
			let in1only = false;
			let in2only = false;

			if (ul4._isset(obj2))
			{
				if (ul4._isset(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.has(value))
							in1only = true;
					});
					obj2.forEach(function(value){
						if (!obj1.has(value))
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.items[value])
							in1only = true;
					});
					for (let value in obj2.items)
					{
						if (!obj1.has(value))
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else if (ul4._isul4set(obj2))
			{
				if (ul4._isset(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.has(value))
						{
							in1only = true;
							break;
						}
					}
					obj2.forEach(function(value){
						if (!obj1.items[value])
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.items[value])
						{
							in1only = true;
							break;
						}
					}
					for (let value in obj2.items)
					{
						if (!obj1.items[value])
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else
				ul4._unorderable(operator, obj1, obj2);

			if (in1only)
			{
				if (in2only)
					return null;
				else
					return 1;
			}
			else
			{
				if (in2only)
					return -1;
				else
					return 0;
			}
		}
		ul4._unorderable("<=", obj1, obj2);
	};

	// Return whether ``obj1 > obj2``
	ul4._gt = function _gt(obj1, obj2)
	{
		let numbertypes = ["boolean", "number"];

		if (obj1 && typeof(obj1.__gt__) === "function")
			return obj1.__gt__(obj2);
		if (numbertypes.indexOf(typeof(obj1)) != -1)
		{
			if (numbertypes.indexOf(typeof(obj2)) != -1)
				return obj1 > obj2;
		}
		else if (typeof(obj1) === "string")
		{
			if (typeof(obj2) === "string")
				return obj1 > obj2;
		}
		else if (ul4._isdate(obj1))
		{
			if (ul4._isdate(obj2))
				return obj1.getTime() > obj2.getTime();
		}
		else if (ul4._islist(obj1))
		{
			if (ul4._islist(obj2))
			{
				if (obj1 === obj2)
					return false;
				for (let i = 0; i < obj1.length; ++i)
				{
					if (i >= obj2.length)
						return true;
					let eq = ul4._eq(obj1[i], obj2[i]);
					if (!eq)
						return ul4._gt(obj1[i], obj2[i]);
				}
				return obj1.length > obj2.length;
			}
		}
		// FIXME: Set comparison
		else if (ul4._isset(obj1) || ul4._isul4set(obj1))
		{
			let in1only = false;
			let in2only = false;

			if (ul4._isset(obj2))
			{
				if (ul4._isset(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.has(value))
							in1only = true;
					});
					obj2.forEach(function(value){
						if (!obj1.has(value))
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.items[value])
							in1only = true;
					});
					for (let value in obj2.items)
					{
						if (!obj1.has(value))
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else if (ul4._isul4set(obj2))
			{
				if (ul4._isset(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.has(value))
						{
							in1only = true;
							break;
						}
					}
					obj2.forEach(function(value){
						if (!obj1.items[value])
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.items[value])
						{
							in1only = true;
							break;
						}
					}
					for (let value in obj2.items)
					{
						if (!obj1.items[value])
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else
				ul4._unorderable(operator, obj1, obj2);

			if (in1only)
			{
				if (in2only)
					return null;
				else
					return 1;
			}
			else
			{
				if (in2only)
					return -1;
				else
					return 0;
			}
		}
		ul4._unorderable(">", obj1, obj2);
	};

	// Return whether ``obj1 >= obj2``
	ul4._ge = function _ge(obj1, obj2)
	{
		let numbertypes = ["boolean", "number"];

		if (obj1 && typeof(obj1.__ge__) === "function")
			return obj1.__ge__(obj2);
		else if (numbertypes.indexOf(typeof(obj1)) != -1)
		{
			if (numbertypes.indexOf(typeof(obj2)) != -1)
				return obj1 >= obj2;
		}
		else if (typeof(obj1) === "string")
		{
			if (typeof(obj2) === "string")
				return obj1 >= obj2;
		}
		else if (ul4._isdate(obj1))
		{
			if (ul4._isdate(obj2))
				return obj1.getTime() >= obj2.getTime();
		}
		else if (ul4._islist(obj1))
		{
			if (ul4._islist(obj2))
			{
				if (obj1 === obj2)
					return true;
				for (let i = 0; i < obj1.length; ++i)
				{
					if (i >= obj2.length)
						return true;
					let eq = ul4._eq(obj1[i], obj2[i]);
					if (!eq)
						return ul4._gt(obj1[i], obj2[i]);
				}
				return obj1.length >= obj2.length;
			}
		}
		// FIXME: Set comparison
		else if (ul4._isset(obj1) || ul4._isul4set(obj1))
		{
			let in1only = false;
			let in2only = false;

			if (ul4._isset(obj2))
			{
				if (ul4._isset(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.has(value))
							in1only = true;
					});
					obj2.forEach(function(value){
						if (!obj1.has(value))
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					obj1.forEach(function(value){
						if (!obj2.items[value])
							in1only = true;
					});
					for (let value in obj2.items)
					{
						if (!obj1.has(value))
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else if (ul4._isul4set(obj2))
			{
				if (ul4._isset(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.has(value))
						{
							in1only = true;
							break;
						}
					}
					obj2.forEach(function(value){
						if (!obj1.items[value])
							in2only = true;
					});
				}
				else if (ul4._isul4set(obj2))
				{
					for (let value in obj1.items)
					{
						if (!obj2.items[value])
						{
							in1only = true;
							break;
						}
					}
					for (let value in obj2.items)
					{
						if (!obj1.items[value])
						{
							in2only = true;
							break;
						}
					}
				}
			}
			else
				ul4._unorderable(operator, obj1, obj2);

			if (in1only)
			{
				if (in2only)
					return null;
				else
					return 1;
			}
			else
			{
				if (in2only)
					return -1;
				else
					return 0;
			}
		}
		ul4._unorderable(">=", obj1, obj2);
	};

	// Return an iterator for ``obj``
	ul4._iter = function _iter(obj)
	{
		if (typeof(obj) === "string" || ul4._islist(obj))
		{
			return {
				index: 0,
				next: function()
				{
					if (this.index < obj.length)
						return {value: obj[this.index++], done: false};
					else
						return {done: true};
				}
			};
		}
		else if (ul4._isiter(obj))
			return obj;
		else if (obj !== null && typeof(obj.__iter__) === "function")
			return obj.__iter__();
		else if (ul4._ismap(obj))
		{
			var keys = [];
			obj.forEach(function(value, key){
				keys.push(key);
			});
			return {
				index: 0,
				next: function()
				{
					if (this.index >= keys.length)
						return {done: true};
					return {value: keys[this.index++], done: false};
				}
			};
		}
		else if (ul4._isset(obj))
		{
			let values = [];
			obj.forEach(function(value, key){
				values.push(value);
			});
			return {
				index: 0,
				next: function()
				{
					if (this.index >= values.length)
						return {done: true};
					return {value: values[this.index++], done: false};
				}
			};
		}
		else if (ul4._isul4set(obj))
		{
			return ul4._iter(obj.items);
		}
		else if (ul4._isobject(obj))
		{
			let keys = [];
			for (let key in obj)
				keys.push(key);
			return {
				index: 0,
				next: function()
				{
					if (this.index >= keys.length)
						return {done: true};
					return {value: keys[this.index++], done: false};
				}
			};
		}
		throw ul4.TypeError.create("iter", ul4._type(obj) + " object is not iterable");
	};

	ul4._str_repr = function _str_repr(str, ascii)
	{
		let result = "";
		let squote = false, dquote = false;

		for (let i = 0; i <str.length; ++i)
		{
			let c = str[i];
			if (c == '"')
			{
				dquote = true;
				if (squote)
					break;
			}
			else if (c == "'")
			{
				squote = true;
				if (dquote)
					break;
			}
		}

		// Prefer single quotes: Only use double quotes if the string contains single quotes, but no double quotes
		let quote = (squote && !dquote) ? '"' : "'";

		for (let i = 0; i <str.length; ++i)
		{
			let c = str[i];
			switch (c)
			{
				case '"':
					result += (quote == c) ? '\\"' : c;
					break;
				case "'":
					result += (quote == c) ? "\\'" : c;
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
					let code = str.charCodeAt(i);
					let escape;
					if (code < 32)
						escape = 2;
					else if (code < 0x7f)
						escape = 0;
					else if (!ascii && !/[\u007f-\u00a0\u00ad\u0378-\u0379\u0380-\u0383\u038b\u038d\u03a2\u0530\u0557-\u0558\u0560\u0588\u058b-\u058c\u0590\u05c8-\u05cf\u05eb-\u05ef\u05f5-\u0605\u061c-\u061d\u06dd\u070e-\u070f\u074b-\u074c\u07b2-\u07bf\u07fb-\u07ff\u082e-\u082f\u083f\u085c-\u085d\u085f-\u089f\u08b5-\u08e2\u0984\u098d-\u098e\u0991-\u0992\u09a9\u09b1\u09b3-\u09b5\u09ba-\u09bb\u09c5-\u09c6\u09c9-\u09ca\u09cf-\u09d6\u09d8-\u09db\u09de\u09e4-\u09e5\u09fc-\u0a00\u0a04\u0a0b-\u0a0e\u0a11-\u0a12\u0a29\u0a31\u0a34\u0a37\u0a3a-\u0a3b\u0a3d\u0a43-\u0a46\u0a49-\u0a4a\u0a4e-\u0a50\u0a52-\u0a58\u0a5d\u0a5f-\u0a65\u0a76-\u0a80\u0a84\u0a8e\u0a92\u0aa9\u0ab1\u0ab4\u0aba-\u0abb\u0ac6\u0aca\u0ace-\u0acf\u0ad1-\u0adf\u0ae4-\u0ae5\u0af2-\u0af8\u0afa-\u0b00\u0b04\u0b0d-\u0b0e\u0b11-\u0b12\u0b29\u0b31\u0b34\u0b3a-\u0b3b\u0b45-\u0b46\u0b49-\u0b4a\u0b4e-\u0b55\u0b58-\u0b5b\u0b5e\u0b64-\u0b65\u0b78-\u0b81\u0b84\u0b8b-\u0b8d\u0b91\u0b96-\u0b98\u0b9b\u0b9d\u0ba0-\u0ba2\u0ba5-\u0ba7\u0bab-\u0bad\u0bba-\u0bbd\u0bc3-\u0bc5\u0bc9\u0bce-\u0bcf\u0bd1-\u0bd6\u0bd8-\u0be5\u0bfb-\u0bff\u0c04\u0c0d\u0c11\u0c29\u0c3a-\u0c3c\u0c45\u0c49\u0c4e-\u0c54\u0c57\u0c5b-\u0c5f\u0c64-\u0c65\u0c70-\u0c77\u0c80\u0c84\u0c8d\u0c91\u0ca9\u0cb4\u0cba-\u0cbb\u0cc5\u0cc9\u0cce-\u0cd4\u0cd7-\u0cdd\u0cdf\u0ce4-\u0ce5\u0cf0\u0cf3-\u0d00\u0d04\u0d0d\u0d11\u0d3b-\u0d3c\u0d45\u0d49\u0d4f-\u0d56\u0d58-\u0d5e\u0d64-\u0d65\u0d76-\u0d78\u0d80-\u0d81\u0d84\u0d97-\u0d99\u0db2\u0dbc\u0dbe-\u0dbf\u0dc7-\u0dc9\u0dcb-\u0dce\u0dd5\u0dd7\u0de0-\u0de5\u0df0-\u0df1\u0df5-\u0e00\u0e3b-\u0e3e\u0e5c-\u0e80\u0e83\u0e85-\u0e86\u0e89\u0e8b-\u0e8c\u0e8e-\u0e93\u0e98\u0ea0\u0ea4\u0ea6\u0ea8-\u0ea9\u0eac\u0eba\u0ebe-\u0ebf\u0ec5\u0ec7\u0ece-\u0ecf\u0eda-\u0edb\u0ee0-\u0eff\u0f48\u0f6d-\u0f70\u0f98\u0fbd\u0fcd\u0fdb-\u0fff\u10c6\u10c8-\u10cc\u10ce-\u10cf\u1249\u124e-\u124f\u1257\u1259\u125e-\u125f\u1289\u128e-\u128f\u12b1\u12b6-\u12b7\u12bf\u12c1\u12c6-\u12c7\u12d7\u1311\u1316-\u1317\u135b-\u135c\u137d-\u137f\u139a-\u139f\u13f6-\u13f7\u13fe-\u13ff\u1680\u169d-\u169f\u16f9-\u16ff\u170d\u1715-\u171f\u1737-\u173f\u1754-\u175f\u176d\u1771\u1774-\u177f\u17de-\u17df\u17ea-\u17ef\u17fa-\u17ff\u180e-\u180f\u181a-\u181f\u1878-\u187f\u18ab-\u18af\u18f6-\u18ff\u191f\u192c-\u192f\u193c-\u193f\u1941-\u1943\u196e-\u196f\u1975-\u197f\u19ac-\u19af\u19ca-\u19cf\u19db-\u19dd\u1a1c-\u1a1d\u1a5f\u1a7d-\u1a7e\u1a8a-\u1a8f\u1a9a-\u1a9f\u1aae-\u1aaf\u1abf-\u1aff\u1b4c-\u1b4f\u1b7d-\u1b7f\u1bf4-\u1bfb\u1c38-\u1c3a\u1c4a-\u1c4c\u1c80-\u1cbf\u1cc8-\u1ccf\u1cf7\u1cfa-\u1cff\u1df6-\u1dfb\u1f16-\u1f17\u1f1e-\u1f1f\u1f46-\u1f47\u1f4e-\u1f4f\u1f58\u1f5a\u1f5c\u1f5e\u1f7e-\u1f7f\u1fb5\u1fc5\u1fd4-\u1fd5\u1fdc\u1ff0-\u1ff1\u1ff5\u1fff-\u200f\u2028-\u202f\u205f-\u206f\u2072-\u2073\u208f\u209d-\u209f\u20bf-\u20cf\u20f1-\u20ff\u218c-\u218f\u23fb-\u23ff\u2427-\u243f\u244b-\u245f\u2b74-\u2b75\u2b96-\u2b97\u2bba-\u2bbc\u2bc9\u2bd2-\u2beb\u2bf0-\u2bff\u2c2f\u2c5f\u2cf4-\u2cf8\u2d26\u2d28-\u2d2c\u2d2e-\u2d2f\u2d68-\u2d6e\u2d71-\u2d7e\u2d97-\u2d9f\u2da7\u2daf\u2db7\u2dbf\u2dc7\u2dcf\u2dd7\u2ddf\u2e43-\u2e7f\u2e9a\u2ef4-\u2eff\u2fd6-\u2fef\u2ffc-\u3000\u3040\u3097-\u3098\u3100-\u3104\u312e-\u3130\u318f\u31bb-\u31bf\u31e4-\u31ef\u321f\u32ff\u4db6-\u4dbf\u9fd6-\u9fff\ua48d-\ua48f\ua4c7-\ua4cf\ua62c-\ua63f\ua6f8-\ua6ff\ua7ae-\ua7af\ua7b8-\ua7f6\ua82c-\ua82f\ua83a-\ua83f\ua878-\ua87f\ua8c5-\ua8cd\ua8da-\ua8df\ua8fe-\ua8ff\ua954-\ua95e\ua97d-\ua97f\ua9ce\ua9da-\ua9dd\ua9ff\uaa37-\uaa3f\uaa4e-\uaa4f\uaa5a-\uaa5b\uaac3-\uaada\uaaf7-\uab00\uab07-\uab08\uab0f-\uab10\uab17-\uab1f\uab27\uab2f\uab66-\uab6f\uabee-\uabef\uabfa-\uabff\ud7a4-\ud7af\ud7c7-\ud7ca\ud7fc-\uf8ff\ufa6e-\ufa6f\ufada-\ufaff\ufb07-\ufb12\ufb18-\ufb1c\ufb37\ufb3d\ufb3f\ufb42\ufb45\ufbc2-\ufbd2\ufd40-\ufd4f\ufd90-\ufd91\ufdc8-\ufdef\ufdfe-\ufdff\ufe1a-\ufe1f\ufe53\ufe67\ufe6c-\ufe6f\ufe75\ufefd-\uff00\uffbf-\uffc1\uffc8-\uffc9\uffd0-\uffd1\uffd8-\uffd9\uffdd-\uffdf\uffe7\uffef-\ufffb\ufffe-\uffff]/.test(c))
						escape = 0;
					else if (code <= 0xff)
						escape = 2;
					else if (code <= 0xffff)
						escape = 4;
					else
						escape = 8;

					if (escape === 0)
						result += c;
					else if (escape === 2)
						result += "\\x" + ul4._lpad(code.toString(16), "0", 2);
					else if (escape === 4)
						result += "\\u" + ul4._lpad(code.toString(16), "0", 4);
					else
						result += "\\U" + ul4._lpad(code.toString(16), "0", 8);
					break;
			}
		}
		return quote + result + quote;
	};

	ul4._date_repr = function _date_repr(obj, ascii)
	{
		let year = obj.getFullYear();
		let month = obj.getMonth()+1;
		let day = obj.getDate();
		let hour = obj.getHours();
		let minute = obj.getMinutes();
		let second = obj.getSeconds();
		let ms = obj.getMilliseconds();
		let result = "@(" + year + "-" + ul4._lpad(month.toString(), "0", 2) + "-" + ul4._lpad(day.toString(), "0", 2);

		if (hour || minute || second || ms)
		{
			result += "T" + ul4._lpad(hour.toString(), "0", 2) + ":" + ul4._lpad(minute.toString(), "0", 2) + ":" + ul4._lpad(second.toString(), "0", 2);
			if (ms)
				result += "." + ul4._lpad(ms.toString(), "0", 3) + "000";
		}
		result += ")";

		return result;
	};

	ul4._map_repr = function _map_repr(obj, ascii)
	{
		let v = [];
		v.push("{");

		let i = 0;
		obj.forEach(function(value, key){
			if (i++)
				v.push(", ");
			v.push(ul4._repr_internal(key, ascii));
			v.push(": ");
			v.push(ul4._repr_internal(value, ascii));
		});

		v.push("}");
		return v.join("");
	};

	ul4._list_repr = function _list_repr(obj, ascii)
	{
		let v = [];
		v.push("[");
		for (let i = 0; i < obj.length; ++i)
		{
			if (i !== 0)
				v.push(", ");
			v.push(ul4._repr_internal(obj[i], ascii));
		}
		v.push("]");
		return v.join("");
	};

	ul4._set_repr = function _set_repr(obj, ascii)
	{
		let v = [];
		v.push("{");
		if (!obj.size)
			v.push("/");
		else
		{
			let i = 0;
			obj.forEach(function(value, key){
				if (i++)
					v.push(", ");
				v.push(ul4._repr_internal(value, ascii));
			});
		}
		v.push("}");
		return v.join("");
	};

	ul4._object_repr = function _object_repr(obj, ascii)
	{
		let v = [];
		v.push("{");
		let i = 0;
		for (let key in obj)
		{
			if (!obj.hasOwnProperty(key))
				continue;
			if (i++)
				v.push(", ");
			v.push(ul4._repr_internal(key, ascii));
			v.push(": ");
			v.push(ul4._repr_internal(obj[key], ascii));
		}
		v.push("}");
		return v.join("");
	};

	ul4._repr_internal = function _repr_internal(obj, ascii)
	{
		if (obj === null)
			return "None";
		else if (obj === false)
			return "False";
		else if (obj === true)
			return "True";
		else if (typeof(obj) === "string")
			return ul4._str_repr(obj, ascii);
		else if (typeof(obj) === "number")
			return "" + obj;
		else if (typeof(obj) === "function")
			if (obj._ul4_name || obj.name)
				return "<function " + (obj._ul4_name || obj.name) + ">";
			else
				return "<anonymous function>";
		else if (ul4._isdate(obj))
			return ul4._date_repr(obj, ascii);
		else if (typeof(obj) === "undefined")
			return "<undefined>";
		else if (typeof(obj) === "object" && typeof(obj.__repr__) === "function")
			return obj.__repr__();
		else if (ul4._islist(obj))
			return ul4._list_repr(obj, ascii);
		else if (ul4._ismap(obj))
			return ul4._map_repr(obj, ascii);
		else if (ul4._isset(obj))
			return ul4._set_repr(obj, ascii);
		else if (ul4._isobject(obj))
			return ul4._object_repr(obj, ascii);
		return "?";
	};

	// Return a string representation of ``obj``: If possible this should be an object literal supported by UL4, otherwise the output should be bracketed with ``<`` and ``>``
	ul4._repr = function _repr(obj)
	{
		return ul4._repr_internal(obj, false);
	};

	ul4._ascii = function _ascii(obj)
	{
		return ul4._repr_internal(obj, true);
	};

	ul4._date_str = function _date_str(obj)
	{
		let year = obj.getFullYear();
		let month = obj.getMonth()+1;
		let day = obj.getDate();
		let hour = obj.getHours();
		let minute = obj.getMinutes();
		let second = obj.getSeconds();
		let ms = obj.getMilliseconds();

		let result = year + "-" + ul4._lpad(month.toString(), "0", 2) + "-" + ul4._lpad(day.toString(), "0", 2) + " " + ul4._lpad(hour.toString(), "0", 2) + ":" + ul4._lpad(minute.toString(), "0", 2) + ":" + ul4._lpad(second.toString(), "0", 2);
		if (ms)
			result += "." + ul4._lpad(ms.toString(), "0", 3) + "000";
		return result;
	};

	ul4._str = function _str(obj)
	{
		if (typeof(obj) === "undefined")
			return "";
		else if (obj === null)
			return "";
		else if (obj === false)
			return "False";
		else if (obj === true)
			return "True";
		else if (typeof(obj) === "string")
			return obj;
		else if (typeof(obj) === "number")
			return obj.toString();
		else if (ul4._isdate(obj))
			return ul4._date_str(obj);
		else if (ul4._islist(obj))
			return ul4._list_repr(obj);
		else if (ul4._isset(obj))
			return ul4._set_repr(obj);
		else if (ul4._ismap(obj))
			return ul4._map_repr(obj);
		else if (typeof(obj) === "object" && typeof(obj.__str__) === "function")
			return obj.__str__();
		else if (typeof(obj) === "object" && typeof(obj.__repr__) === "function")
			return obj.__repr__();
		else if (ul4._isobject(obj))
			return ul4._object_repr(obj);
		return "?";
	};

	// Convert ``obj`` to bool, according to its "truth value"
	ul4._bool = function _bool(obj)
	{
		if (typeof(obj) === "undefined" || obj === null || obj === false || obj === 0 || obj === "")
			return false;
		else
		{
			if (typeof(obj) === "object", typeof(obj.__bool__) === "function")
				return obj.__bool__();
			if (ul4._islist(obj))
				return obj.length !== 0;
			else if (ul4._ismap(obj) || ul4._isset(obj))
				return obj.size != 0;
			else if (ul4._isobject(obj))
			{
				for (var key in obj)
				{
					if (!obj.hasOwnProperty(key))
						continue;
					return true;
				}
				return false;
			}
			return true;
		}
	};

	// Convert ``obj`` to an integer (if ``base`` is given ``obj`` must be a string and ``base`` is the base for the conversion (default is 10))
	ul4._int = function _int(obj, base)
	{
		var result;
		if (base !== null)
		{
			if (typeof(obj) !== "string" || !ul4._isint(base))
				throw ul4.TypeError.create("int()", "int() requires a string and an integer");
			result = parseInt(obj, base);
			if (result.toString() == "NaN")
				throw ul4.TypeError.create("int()", "invalid literal for int()");
			return result;
		}
		else
		{
			if (typeof(obj) == "string")
			{
				result = parseInt(obj);
				if (result.toString() == "NaN")
				throw ul4.TypeError.create("int()", "invalid literal for int()");
				return result;
			}
			else if (typeof(obj) == "number")
				return Math.floor(obj);
			else if (obj === true)
				return 1;
			else if (obj === false)
				return 0;
			throw ul4.TypeError.create("int()", "int() argument must be a string or a number");
		}
	};

	// Convert ``obj`` to a float
	ul4._float = function _float(obj)
	{
		if (typeof(obj) === "string")
			return parseFloat(obj);
		else if (typeof(obj) === "number")
			return obj;
		else if (obj === true)
			return 1.0;
		else if (obj === false)
			return 0.0;
		throw ul4.TypeError.create("float()", "float() argument must be a string or a number");
	};

	// Convert ``obj`` to a list
	ul4._list = function _list(obj)
	{
		var iter = ul4._iter(obj);

		var result = [];
		for (;;)
		{
			var value = iter.next();
			if (value.done)
				return result;
			result.push(value.value);
		}
	};

	// Convert ``obj`` to a set
	ul4._set = function _set(obj)
	{
		var iter = ul4._iter(obj);

		var result = ul4on._haveset ? new Set() : ul4._Set.create();
		for (;;)
		{
			var value = iter.next();
			if (value.done)
				return result;
			result.add(value.value);
		}
	};

	// Return the length of ``sequence``
	ul4._len = function _len(sequence)
	{
		if (typeof(sequence) == "string" || ul4._islist(sequence))
			return sequence.length;
		else if (ul4._ismap(sequence) || ul4._isset(sequence))
			return sequence.size;
		else if (ul4._isobject(sequence))
		{
			var i = 0;
			for (var key in sequence)
				++i;
			return i;
		}
		throw ul4.TypeError.create("len", "object of type '" + ul4._type(sequence) + "' has no len()");
	};

	ul4._type = function _type(obj)
	{
		if (obj === null)
			return "none";
		else if (obj === false || obj === true)
			return "bool";
		else if (typeof(obj) === "undefined")
			return "undefined";
		else if (typeof(obj) === "string")
			return "str";
		else if (typeof(obj) === "number")
			return Math.round(obj) == obj ? "int" : "float";
		else if (ul4._islist(obj))
			return "list";
		else if (ul4._isset(obj))
			return "set";
		else if (ul4._isdate(obj))
			return "date";
		else if (typeof(obj.__type__) !== "undefined")
			return obj.__type__;
		else if (ul4._istimedelta(obj))
			return "timedelta";
		else if (ul4._isdict(obj))
			return "dict";
		else if (ul4._istemplate(obj))
			return "template";
		else if (ul4._isfunction(obj))
			return "function";
		return null;
	};


	// Return the attribute with the name ``attrname`` of the object ``obj``
	// If ``obj`` doesn't have such an attribute, return ``default_``
	ul4._getattr = function _getattr(obj, attrname, default_=null)
	{
		var proto = ul4.Protocol.get(obj);
		try
		{
			return proto.getattr(obj, attrname);
		}
		catch (exc)
		{
			if (ul4.AttributeError.isprotoof(exc) && exc.obj === obj)
				return default_;
			else
				throw exc;
		}
	};

	// Return wether the object ``obj`` has an attribute with the name ``attrname``
	ul4._hasattr = function _hasattr(obj, attrname)
	{
		var proto = ul4.Protocol.get(obj);
		return proto.hasattr(obj, attrname);
	};

	// Return the names of the attributes of the object ``obj`` as a set.
	ul4._dir = function _dir(obj)
	{
		var proto = ul4.Protocol.get(obj);
		return proto.dir();
	};

	// Return whether any of the items in ``iterable`` are true
	ul4._any = function _any(iterable)
	{
		if (typeof(iterable) == "string")
		{
			for (var i = 0; i < iterable.length; ++i)
			{
				if (iterable[i] !== '\x00')
					return true;
			}
			return false;
		}
		else
		{
			for (var iter = ul4._iter(iterable);;)
			{
				var item = iter.next();
				if (item.done)
					return false;
				if (ul4._bool(item.value))
					return true;
			}
		}
	};

	// Return whether all of the items in ``iterable`` are true
	ul4._all = function _all(iterable)
	{
		if (typeof(iterable) == "string")
		{
			for (var i = 0; i < iterable.length; ++i)
			{
				if (iterable[i] === '\x00')
					return false;
			}
			return true;
		}
		else
		{
			for (var iter = ul4._iter(iterable);;)
			{
				var item = iter.next();
				if (item.done)
					return true;
				if (!ul4._bool(item.value))
					return false;
			}
		}
	};

	// Check if ``obj`` is undefined
	ul4._isundefined = function _isundefined(obj)
	{
		return typeof(obj) === "undefined";
	};


	// Check if ``obj`` is *not* undefined
	ul4._isdefined = function _isdefined(obj)
	{
		return typeof(obj) !== "undefined";
	};

	// Check if ``obj`` is ``None``
	ul4._isnone = function _isnone(obj)
	{
		return obj === null;
	};

	// Check if ``obj`` is a boolean
	ul4._isbool = function _isbool(obj)
	{
		return typeof(obj) == "boolean";
	};

	// Check if ``obj`` is a int
	ul4._isint = function _isint(obj)
	{
		return (typeof(obj) == "number") && Math.round(obj) == obj;
	};

	// Check if ``obj`` is a float
	ul4._isfloat = function _isfloat(obj)
	{
		return (typeof(obj) == "number") && Math.round(obj) != obj;
	};

	// Check if ``obj`` is a string
	ul4._isstr = function _isstr(obj)
	{
		return typeof(obj) == "string";
	};

	// Check if ``obj`` is a date
	ul4._isdate = function _isdate(obj)
	{
		return Object.prototype.toString.call(obj) == "[object Date]";
	};

	// Check if ``obj`` is a color
	ul4._iscolor = function _iscolor(obj)
	{
		return (obj !== null && typeof(obj) === "object" && typeof(obj.isa) === "function" && obj.isa(ul4.Color));
	};

	// Check if ``obj`` is a timedelta object
	ul4._istimedelta = function _istimedelta(obj)
	{
		return (obj !== null && typeof(obj) === "object" && typeof(obj.isa) === "function" && obj.isa(ul4.TimeDelta));
	};

	// Check if ``obj`` is a monthdelta object
	ul4._ismonthdelta = function _ismonthdelta(obj)
	{
		return obj !== null && typeof(obj) === "object" && typeof(obj.isa) === "function" && obj.isa(ul4.MonthDelta);
	};

	// Check if ``obj`` is a template
	ul4._istemplate = function _istemplate(obj)
	{
		return Object.prototype.toString.call(obj) == "[object Object]" && (obj.__type__ === "ul4.Template" || obj.__type__ === "ul4.TemplateClosure");
	};

	// Check if ``obj`` is a function
	ul4._isfunction = function _isfunction(obj)
	{
		return typeof(obj) === "function" || (Object.prototype.toString.call(obj) == "[object Object]" && (obj.__type__ === "ul4.Template" || obj.__type__ === "ul4.TemplateClosure"));
	};

	// Check if ``obj`` is a list
	ul4._islist = function _islist(obj)
	{
		return Object.prototype.toString.call(obj) == "[object Array]";
	};

	// Check if ``obj`` is a set
	ul4._isset = function _isset(obj)
	{
		return Object.prototype.toString.call(obj) == "[object Set]";
	};

	// Check if ``obj`` is an exception (at least a UL4 exception)
	ul4._isexception = function _isexception(obj)
	{
		return obj !== null && typeof(obj) === "object" && typeof(obj.isa) === "function" && obj.isa(ul4.Error);
	};

	ul4._isul4set = function _isul4set(obj)
	{
		return obj !== null && typeof(obj) === "object" && typeof(obj.isa) === "function" && obj.isa(ul4._Set);
	};

	// Check if ``obj`` is an iterator
	ul4._isiter = function _isiter(obj)
	{
		return obj !== null && typeof(obj) === "object" && typeof(obj.next) === "function";
	};

	// Check if ``obj`` is a JS object
	ul4._isobject = function _isobject(obj)
	{
		return Object.prototype.toString.call(obj) == "[object Object]" && typeof(obj.__type__) === "undefined";
	};

	if (ul4on._havemap)
	{
		// Check if ``obj`` is a ``Map``
		ul4._ismap = function _ismap(obj)
		{
			return obj !== null && typeof(obj) === "object" && typeof(obj.__proto__) === "object" && obj.__proto__ === Map.prototype;
		};

		// Check if ``obj`` is a dict (i.e. a normal Javascript object or a ``Map``)
		ul4._isdict = function _isdict(obj)
		{
			return ul4._isobject(obj) || ul4._ismap(obj);
		};
	}
	else
	{
		ul4._ismap = function _ismap(obj)
		{
			return false;
		};

		ul4._isdict = function _isdict(obj)
		{
			return ul4._isobject(obj);
		};
	}

	// Repeat string ``str`` ``rep`` times
	ul4._str_repeat = function _str_repeat(str, rep)
	{
		let result = "";
		for (; rep>0; --rep)
			result += str;
		return result;
	};

	ul4._list_repeat = function _list_repeat(list, rep)
	{
		let result = [];
		for (; rep>0; --rep)
			for (let i = 0; i < list.length; ++i)
				result.push(list[i]);
		return result;
	};

	ul4._str_json = function _str_json(str)
	{
		let result = "";
		for (let i = 0; i < str.length; ++i)
		{
			let c = str[i];
			switch (c)
			{
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
					result += '\\u003c';
					break;
				default:
					let code = str.charCodeAt(i);
					if (code >= 32 && code < 128)
						result += c;
					else
						result += "\\u" + ul4._lpad(code.toString(16), "0", 4);
					break;
			}
		}
		return '"' + result + '"';
	};

	// Encodes ``obj`` in the Javascript Object Notation (see http://json.org/; with support for dates, colors and templates)
	ul4._asjson = function _asjson(obj)
	{
		if (obj === null)
			return "null";
		else if (typeof(obj) === "undefined")
			return "{}.undefined";
		else if (obj === false)
			return "false";
		else if (obj === true)
			return "true";
		else if (typeof(obj) === "string")
			return ul4._str_json(obj);
		else if (typeof(obj) === "number")
		{
			return "" + obj;
		}
		else if (ul4._islist(obj))
		{
			let v = [];
			v.push("[");
			for (let i = 0; i < obj.length; ++i)
			{
				if (i != 0)
					v.push(", ");
				v.push(ul4._asjson(obj[i]));
			}
			v.push("]");
			return v.join("");
		}
		else if (ul4._ismap(obj))
		{
			let v = [];
			v.push("{");
			let i = 0;
			obj.forEach(function(value, key){
				if (i++)
					v.push(", ");
				v.push(ul4._asjson(key));
				v.push(": ");
				v.push(ul4._asjson(value));
			});
			v.push("}");
			return v.join("");
		}
		else if (ul4._isobject(obj))
		{
			let v = [];
			v.push("{");
			let i = 0;
			for (let key in obj)
			{
				if (i++)
					v.push(", ");
				v.push(ul4._asjson(key));
				v.push(": ");
				v.push(ul4._asjson(obj[key]));
			}
			v.push("}");
			return v.join("");
		}
		else if (ul4._isdate(obj))
		{
			return "new Date(" + obj.getFullYear() + ", " + obj.getMonth() + ", " + obj.getDate() + ", " + obj.getHours() + ", " + obj.getMinutes() + ", " + obj.getSeconds() + ", " + obj.getMilliseconds() + ")";
		}
		else if (ul4._istimedelta(obj))
		{
			return "ul4.TimeDelta.create(" + obj.days + ", " + obj.seconds + ", " + obj.microseconds + ")";
		}
		else if (ul4._ismonthdelta(obj))
		{
			return "ul4.MonthDelta.create(" + obj.months + ")";
		}
		else if (ul4._iscolor(obj))
		{
			return "ul4.Color.create(" + obj._r + ", " + obj._g + ", " + obj._b + ", " + obj._a + ")";
		}
		else if (ul4._istemplate(obj))
		{
			return "ul4.Template.loads(" + ul4._repr(obj.dumps()) + ")";
		}
		throw ul4.TypeError.create("asjson()", "asjson() requires a serializable object");
	};

	// Decodes the string ``string`` from the Javascript Object Notation (see http://json.org/) and returns the resulting object
	ul4._fromjson = function _fromjson(string)
	{
		// The following is from jQuery's parseJSON function
		string = ul4._strip(string);
		if (root.JSON && root.JSON.parse)
			return root.JSON.parse(string);
		if (ul4._rvalidchars.test(string.replace(ul4._rvalidescape, "@").replace(ul4._rvalidtokens, "]").replace(ul4._rvalidbraces, "")))
			return (new Function("return " + string))();
		throw ul4.TypeError.create("fromjson()", "invalid JSON");
	};

	// Encodes ``obj`` in the UL4 Object Notation format
	ul4._asul4on = function _asul4on(obj)
	{
		return ul4on.dumps(obj);
	};

	// Decodes the string ``string`` from the UL4 Object Notation format and returns the resulting decoded object
	ul4._fromul4on = function _fromul4on(string)
	{
		return ul4on.loads(string);
	};

	ul4._format_date = function _format_date(obj, fmt, lang)
	{
		let translations = {
			de: {
				ms: ["Jan", "Feb", "M\u00e4r", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
				ml: ["Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
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
				cf: "%a %d %b %Y %I:%M:%S %p "
			},
			fr: {
				ms: ["janv.", "f\u00e9vr.", "mars", "avril", "mai", "juin", "juil.", "ao\u00fbt", "sept.", "oct.", "nov.", "d\u00e9c."],
				ml: ["janvier", "f\u00e9vrier", "mars", "avril", "mai", "juin", "juillet", "ao\u00fbt", "septembre", "octobre", "novembre", "d\u00e9cembre"],
				ws: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
				wl: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
				xf: "%d/%m/%Y",
				Xf: "%H:%M:%S",
				cf: "%a %d %b %Y %H:%M:%S"
			},
			es: {
				ms: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
				ml: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
				ws: ["dom", "lun", "mar", "mi\u00e9", "jue", "vie", "s\u00e1b"],
				wl: ["domingo", "lunes", "martes", "mi\u00e9rcoles", "jueves", "viernes", "s\u00e1bado"],
				xf: "%d/%m/%y",
				Xf: "%H:%M:%S",
				cf: "%a %d %b %Y %H:%M:%S"
			},
			it: {
				ms: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
				ml: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
				ws: ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
				wl: ["domenica", "luned\u00ec", "marted\u00ec", "mercoled\u00ec", "gioved\u00ec", "venerd\u00ec", "sabato"],
				xf: "%d/%m/%Y",
				Xf: "%H:%M:%S",
				cf: "%a %d %b %Y %H:%M:%S"
			},
			da: {
				ms: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
				ml: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
				ws: ["s\u00f8n", "man", "tir", "ons", "tor", "fre", "l\u00f8r"],
				wl: ["s\u00f8ndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "l\u00f8rdag"],
				xf: "%d-%m-%Y",
				Xf: "%H:%M:%S",
				cf: "%a %d %b %Y %H:%M:%S"
			},
			sv: {
				ms: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
				ml: ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
				ws: ["s\u00f6n", "m\u00e5n", "tis", "ons", "tor", "fre", "l\u00f6r"],
				wl: ["s\u00f6ndag", "m\u00e5ndag", "tisdag", "onsdag", "torsdag", "fredag", "l\u00f6rdag"],
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
				ml: ["Janeiro", "Fevereiro", "Mar\u00e7o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
				ws: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\u00e1b"],
				wl: ["Domingo", "Segunda", "Ter\u00e7a", "Quarta", "Quinta", "Sexta", "S\u00e1bado"],
				xf: "%d-%m-%Y",
				Xf: "%H:%M:%S",
				cf: "%a %d %b %Y %H:%M:%S"
			},
			cs: {
				ms: ["led", "\u00fano", "b\u0159e", "dub", "kv\u011b", "\u010den", "\u010dec", "srp", "z\u00e1\u0159", "\u0159\u00edj", "lis", "pro"],
				ml: ["leden", "\u00fanor", "b\u0159ezen", "duben", "kv\u011bten", "\u010derven", "\u010dervenec", "srpen", "z\u00e1\u0159\u00ed", "\u0159\u00edjen", "listopad", "prosinec"],
				ws: ["Ne", "Po", "\u00dat", "St", "\u010ct", "P\u00e1", "So"],
				wl: ["Ned\u011ble", "Pond\u011bl\u00ed", "\u00dater\u00fd", "St\u0159eda", "\u010ctvrtek", "P\u00e1tek", "Sobota"],
				xf: "%d.%m.%Y",
				Xf: "%H:%M:%S",
				cf: "%a\u00a0%d.\u00a0%B\u00a0%Y,\u00a0%H:%M:%S"
			},
			sk: {
				ms: ["jan", "feb", "mar", "apr", "m\u00e1j", "j\u00fan", "j\u00fal", "aug", "sep", "okt", "nov", "dec"],
				ml: ["janu\u00e1r", "febru\u00e1r", "marec", "apr\u00edl", "m\u00e1j", "j\u00fan", "j\u00fal", "august", "september", "okt\u00f3ber", "november", "december"],
				ws: ["Ne", "Po", "Ut", "St", "\u0160t", "Pi", "So"],
				wl: ["Nede\u013ea", "Pondelok", "Utorok", "Streda", "\u0160tvrtok", "Piatok", "Sobota"],
				xf: "%d.%m.%Y",
				Xf: "%H:%M:%S",
				cf: "%a\u00a0%d.\u00a0%B\u00a0%Y,\u00a0%H:%M:%S"
			},
			pl: {
				ms: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "pa\u017a", "lis", "gru"],
				ml: ["stycze\u0144", "luty", "marzec", "kwiecie\u0144", "maj", "czerwiec", "lipiec", "sierpie\u0144", "wrzesie\u0144", "pa\u017adziernik", "listopad", "grudzie\u0144"],
				ws: ["nie", "pon", "wto", "\u015bro", "czw", "pi\u0105", "sob"],
				wl: ["niedziela", "poniedzia\u0142ek", "wtorek", "\u015broda", "czwartek", "pi\u0105tek", "sobota"],
				xf: "%d.%m.%Y",
				Xf: "%H:%M:%S",
				cf: "%a, %d %b %Y, %H:%M:%S"
			},
			hr: {
				ms: ["Sij", "Vel", "O\u017eu", "Tra", "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro"],
				ml: ["Sije\u010danj", "Velja\u010da", "O\u017eujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"],
				ws: ["Ned", "Pon", "Uto", "Sri", "\u010cet", "Pet", "Sub"],
				wl: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "\u010cetvrtak", "Petak", "Subota"],
				xf: "%d.%m.%Y",
				Xf: "%H:%M:%S",
				cf: "%a %d %b %Y %H:%M:%S"
			},
			sr: {
				ms: ["\u0458\u0430\u043d", "\u0444\u0435\u0431", "\u043c\u0430\u0440", "\u0430\u043f\u0440", "\u043c\u0430\u0458", "\u0458\u0443\u043d", "\u0458\u0443\u043b", "\u0430\u0432\u0433", "\u0441\u0435\u043f", "\u043e\u043a\u0442", "\u043d\u043e\u0432", "\u0434\u0435\u0446"],
				ml: ["\u0458\u0430\u043d\u0443\u0430\u0440", "\u0444\u0435\u0431\u0440\u0443\u0430\u0440", "\u043c\u0430\u0440\u0442", "\u0430\u043f\u0440\u0438\u043b", "\u043c\u0430\u0458", "\u0458\u0443\u043d", "\u0458\u0443\u043b", "\u0430\u0432\u0433\u0443\u0441\u0442", "\u0441\u0435\u043f\u0442\u0435\u043c\u0431\u0430\u0440", "\u043e\u043a\u0442\u043e\u0431\u0430\u0440", "\u043d\u043e\u0432\u0435\u043c\u0431\u0430\u0440", "\u0434\u0435\u0446\u0435\u043c\u0431\u0430\u0440"],
				ws: ["\u043d\u0435\u0434", "\u043f\u043e\u043d", "\u0443\u0442\u043e", "\u0441\u0440\u0435", "\u0447\u0435\u0442", "\u043f\u0435\u0442", "\u0441\u0443\u0431"],
				wl: ["\u043d\u0435\u0434\u0435\u0459\u0430", "\u043f\u043e\u043d\u0435\u0434\u0435\u0459\u0430\u043a", "\u0443\u0442\u043e\u0440\u0430\u043a", "\u0441\u0440\u0435\u0434\u0430", "\u0447\u0435\u0442\u0432\u0440\u0442\u0430\u043a", "\u043f\u0435\u0442\u0430\u043a", "\u0441\u0443\u0431\u043e\u0442\u0430"],
				xf: "%d.%m.%Y.",
				Xf: "%H:%M:%S",
				cf: "%A, %d. %B %Y. %H:%M:%S"
			},
			ro: {
				ms: ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"],
				ml: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
				ws: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sb"],
				wl: ["duminic\u0103", "luni", "mar\u0163i", "miercuri", "joi", "vineri", "s\u00e2mb\u0103t\u0103"],
				xf: "%d.%m.%Y",
				Xf: "%H:%M:%S",
				cf: "%a %d %b %Y %H:%M:%S"
			},
			hu: {
				ms: ["jan", "febr", "m\u00e1rc", "\u00e1pr", "m\u00e1j", "j\u00fan", "j\u00fal", "aug", "szept", "okt", "nov", "dec"],
				ml: ["janu\u00e1r", "febru\u00e1r", "m\u00e1rcius", "\u00e1prilis", "m\u00e1jus", "j\u00fanius", "j\u00falius", "augusztus", "szeptember", "okt\u00f3ber", "november", "december"],
				ws: ["v", "h", "k", "sze", "cs", "p", "szo"],
				wl: ["vas\u00e1rnap", "h\u00e9tf\u0151", "kedd", "szerda", "cs\u00fct\u00f6rt\u00f6k", "p\u00e9ntek", "szombat"],
				xf: "%Y-%m-%d",
				Xf: "%H.%M.%S",
				cf: "%Y. %b. %d., %A, %H.%M.%S"
			},
			tr: {
				ms: ["Oca", "\u015eub", "Mar", "Nis", "May", "Haz", "Tem", "A\u011fu", "Eyl", "Eki", "Kas", "Ara"],
				ml: ["Ocak", "\u015eubat", "Mart", "Nisan", "May\u0131s", "Haziran", "Temmuz", "A\u011fustos", "Eyl\u00fcl", "Ekim", "Kas\u0131m", "Aral\u0131k"],
				ws: ["Paz", "Pzt", "Sal", "\u00c7r\u015f", "Pr\u015f", "Cum", "Cts"],
				wl: ["Pazar", "Pazartesi", "Sal\u0131", "\u00c7ar\u015famba", "Per\u015fembe", "Cuma", "Cumartesi"],
				xf: "%d-%m-%Y",
				Xf: "%H:%M:%S",
				cf: "%a %d %b %Y %H:%M:%S"
			},
			ru: {
				ms: ["\u042f\u043d\u0432", "\u0424\u0435\u0432", "\u041c\u0430\u0440", "\u0410\u043f\u0440", "\u041c\u0430\u0439", "\u0418\u044e\u043d", "\u0418\u044e\u043b", "\u0410\u0432\u0433", "\u0421\u0435\u043d", "\u041e\u043a\u0442", "\u041d\u043e\u044f", "\u0414\u0435\u043a"],
				ml: ["\u042f\u043d\u0432\u0430\u0440\u044c", "\u0424\u0435\u0432\u0440\u0430\u043b\u044c", "\u041c\u0430\u0440\u0442", "\u0410\u043f\u0440\u0435\u043b\u044c", "\u041c\u0430\u0439", "\u0418\u044e\u043d\u044c", "\u0418\u044e\u043b\u044c", "\u0410\u0432\u0433\u0443\u0441\u0442", "\u0421\u0435\u043d\u0442\u044f\u0431\u0440\u044c", "\u041e\u043a\u0442\u044f\u0431\u0440\u044c", "\u041d\u043e\u044f\u0431\u0440\u044c", "\u0414\u0435\u043a\u0430\u0431\u0440\u044c"],
				ws: ["\u0412\u0441\u043a", "\u041f\u043d\u0434", "\u0412\u0442\u0440", "\u0421\u0440\u0434", "\u0427\u0442\u0432", "\u041f\u0442\u043d", "\u0421\u0431\u0442"],
				wl: ["\u0412\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435", "\u041f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a", "\u0412\u0442\u043e\u0440\u043d\u0438\u043a", "\u0421\u0440\u0435\u0434\u0430", "\u0427\u0435\u0442\u0432\u0435\u0440\u0433", "\u041f\u044f\u0442\u043d\u0438\u0446\u0430", "\u0421\u0443\u0431\u0431\u043e\u0442\u0430"],
				xf: "%d.%m.%Y",
				Xf: "%H:%M:%S",
				cf: "%a %d %b %Y %H:%M:%S"
			},
			zh: {
				ms: [" 1\u6708", " 2\u6708", " 3\u6708", " 4\u6708", " 5\u6708", " 6\u6708", " 7\u6708", " 8\u6708", " 9\u6708", "10\u6708", "11\u6708", "12\u6708"],
				ml: ["\u4e00\u6708", "\u4e8c\u6708", "\u4e09\u6708", "\u56db\u6708", "\u4e94\u6708", "\u516d\u6708", "\u4e03\u6708", "\u516b\u6708", "\u4e5d\u6708", "\u5341\u6708", "\u5341\u4e00\u6708", "\u5341\u4e8c\u6708"],
				ws: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d"],
				wl: ["\u661f\u671f\u65e5", "\u661f\u671f\u4e00", "\u661f\u671f\u4e8c", "\u661f\u671f\u4e09", "\u661f\u671f\u56db", "\u661f\u671f\u4e94", "\u661f\u671f\u516d"],
				xf: "%Y\u5e74%b%d\u65e5",
				Xf: "%H\u65f6%M\u5206%S\u79d2",
				cf: "%Y\u5e74%b%d\u65e5 %A %H\u65f6%M\u5206%S\u79d2"
			},
			ko: {
				ms: [" 1\uc6d4", " 2\uc6d4", " 3\uc6d4", " 4\uc6d4", " 5\uc6d4", " 6\uc6d4", " 7\uc6d4", " 8\uc6d4", " 9\uc6d4", "10\uc6d4", "11\uc6d4", "12\uc6d4"],
				ml: ["1\uc6d4", "2\uc6d4", "3\uc6d4", "4\uc6d4", "5\uc6d4", "6\uc6d4", "7\uc6d4", "8\uc6d4", "9\uc6d4", "10\uc6d4", "11\uc6d4", "12\uc6d4"],
				ws: ["\uc77c", "\uc6d4", "\ud654", "\uc218", "\ubaa9", "\uae08", "\ud1a0"],
				wl: ["\uc77c\uc694\uc77c", "\uc6d4\uc694\uc77c", "\ud654\uc694\uc77c", "\uc218\uc694\uc77c", "\ubaa9\uc694\uc77c", "\uae08\uc694\uc77c", "\ud1a0\uc694\uc77c"],
				xf: "%Y\ub144 %B %d\uc77c",
				Xf: "%H\uc2dc %M\ubd84 %S\ucd08",
				cf: "%Y\ub144 %B %d\uc77c (%a) %p %I\uc2dc %M\ubd84 %S\ucd08"
			},
			ja: {
				ms: [" 1\u6708", " 2\u6708", " 3\u6708", " 4\u6708", " 5\u6708", " 6\u6708", " 7\u6708", " 8\u6708", " 9\u6708", "10\u6708", "11\u6708", "12\u6708"],
				ml: ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],
				ws: ["\u65e5", "\u6708", "\u706b", "\u6c34", "\u6728", "\u91d1", "\u571f"],
				wl: ["\u65e5\u66dc\u65e5", "\u6708\u66dc\u65e5", "\u706b\u66dc\u65e5", "\u6c34\u66dc\u65e5", "\u6728\u66dc\u65e5", "\u91d1\u66dc\u65e5", "\u571f\u66dc\u65e5"],
				xf: "%Y\u5e74%B%d\u65e5",
				Xf: "%H\u6642%M\u5206%S\u79d2",
				cf: "%Y\u5e74%B%d\u65e5 %H\u6642%M\u5206%S\u79d2"
			}
		};

		let translation = translations[lang];

		let firstday;

		let result = [];
		let inspec = false;
		for (let i = 0; i < fmt.length; ++i)
		{
			let c = fmt[i];
			if (inspec)
			{
				switch (c)
				{
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
						c = ul4._format(obj, translation.cf, lang);
						break;
					case "d":
						c = ul4._lpad(obj.getDate(), "0", 2);
						break;
					case "f":
						c = ul4._lpad(obj.getMilliseconds(), "0", 3) + "000";
						break;
					case "H":
						c = ul4._lpad(obj.getHours(), "0", 2);
						break;
					case "I":
						c = ul4._lpad(((obj.getHours()-1) % 12)+1, "0", 2);
						break;
					case "j":
						c = ul4._lpad(ul4._yearday(obj), "0", 3);
						break;
					case "m":
						c = ul4._lpad(obj.getMonth()+1, "0", 2);
						break;
					case "M":
						c = ul4._lpad(obj.getMinutes(), "0", 2);
						break;
					case "p":
						c = obj.getHours() < 12 ? "AM" : "PM";
						break;
					case "S":
						c = ul4._lpad(obj.getSeconds(), "0", 2);
						break;
					case "U":
						c = ul4._lpad(ul4._week(obj, 6), "0", 2);
						break;
					case "w":
						c = obj.getDay();
						break;
					case "W":
						c = ul4._lpad(ul4._week(obj, 0), "0", 2);
						break;
					case "x":
						c = ul4._format(obj, translation.xf, lang);
						break;
					case "X":
						c = ul4._format(obj, translation.Xf, lang);
						break;
					case "y":
						c = (obj.getFullYear() % 100).toString();
						break;
					case "Y":
						c = obj.getFullYear().toString();
						break;
					case "z":
						// UTC offset in the form +HHMM or -HHMM
						c = "";
						break;
					case "Z":
						// Time zone name
						c = "";
						break;
				}
				result.push(c);
				inspec = false;
			}
			else
			{
				if (c == "%")
					inspec = true;
				else
					result.push(c);
			}
		}
		return result.join("");
	};

	ul4._format_int = function _format_int(obj, fmt, lang)
	{
		let work = fmt;

		// Defaults
		let fill = ' ';
		let align = '>'; // '<', '>', '=' or '^'
		let sign = '-'; // '+', '-' or ' '
		let alternate = false;
		let minimumwidth = 0;
		let type = 'd'; // 'b', 'c', 'd', 'o', 'x', 'X' or 'n'

		// Determine output type
		if (/[bcdoxXn]$/.test(work))
		{
			type = work.substring(work.length-1);
			work = work.substring(0, work.length-1);
		}

		// Extract minimum width
		if (/\d+$/.test(work))
		{
			let minimumwidthStr = /\d+$/.exec(work);
			work = work.replace(/\d+$/, "");
			if (/^0/.test(minimumwidthStr))
			{
				align = '=';
				fill = '0';
			}
			minimumwidth = parseInt(minimumwidthStr);
		}

		// Alternate form?
		if (/#$/.test(work))
		{
			alternate = true;
			work = work.substring(0, work.length-1);
		}

		// Determine sign
		if (/[+ -]$/.test(work))
		{
			if (type == 'c')
				throw ul4.ValueError.create("sign not allowed for integer format type 'c'");
			sign = work.substring(work.length-1);
			work = work.substring(0, work.length-1);
		}

		// Extract fill and align char
		if (work.length >= 3)
			throw ul4.ValueError.create("illegal integer format string " + ul4._repr(fmt));
		else if (work.length == 2)
		{
			if (/[<>=^]$/.test(work))
			{
				align = work[1];
				fill = work[0];
			}
			else
				throw ul4.ValueError.create("illegal integer format string " + ul4._repr(fmt));
		}
		else if (work.length == 1)
		{
			if (/^[<>=^]$/.test(work))
				align = work;
			else
				throw ul4.ValueError.create("illegal integer format string " + ul4._repr(fmt));
		}

		// Basic number formatting
		let neg = obj < 0;

		if (neg)
			obj = -obj;

		let output;
		switch (type)
		{
			case 'b':
				output = obj.toString(2);
				break;
			case 'c':
				if (neg || obj > 65535)
					throw ul4.ValueError.create("value out of bounds for c format");
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
				// FIXME: locale formatting
				output = obj.toString();
				break;
		}

		// The rest of the formatting
		if (align === '=')
		{
			if (neg || sign !== '-')
				--minimumwidth;
			if (alternate && (type === 'b' || type === 'o' || type === 'x' || type === 'X'))
				minimumwidth -= 2;

			if (output.length < minimumwidth)
				output = ul4._str_repeat(fill, minimumwidth-output.length) + output;

			if (alternate && (type === 'b' || type === 'o' || type === 'x' || type === 'X'))
				output = "0" + type + output;

			if (neg)
				output = "-" + output;
			else if (sign != '-')
				output = sign + output;
		}
		else
		{
			if (alternate && (type == 'b' || type == 'o' || type == 'x' || type == 'X'))
				output = "0" + type + output;
			if (neg)
				output = "-" + output;
			else if (sign != '-')
				output = sign + output;
			if (output.length < minimumwidth)
			{
				if (align == '<')
					output = output + ul4._str_repeat(fill, minimumwidth-output.length);
				else if (align == '>')
					output = ul4._str_repeat(fill, minimumwidth-output.length) + output;
				else // if (align == '^')
				{
					let pad = minimumwidth - output.length;
					let padBefore = Math.floor(pad/2);
					let padAfter = pad-padBefore;
					output = ul4._str_repeat(fill, padBefore) + output + ul4._str_repeat(fill, padAfter);
				}
			}
		}
		return output;
	};

	// Format ``obj`` using the format string ``fmt`` in the language ``lang``
	ul4._format = function _format(obj, fmt, lang)
	{
		if (typeof(lang) === "undefined" || lang === null)
			lang = "en";
		else
		{
			let translations = {de: null, en: null, fr: null, es: null, it: null, da: null, sv: null, nl: null, pt: null, cs: null, sk: null, pl: null, hr: null, sr: null, ro: null, hu: null, tr: null, ru: null, zh: null, ko: null, ja: null};
			lang = lang.toLowerCase();
			if (typeof(translations[lang]) === "undefined")
			{
				lang = lang.split(/_/)[0];
				if (typeof(translations[lang]) === "undefined")
					lang = "en";
			}
		}
		if (ul4._isdate(obj))
			return ul4._format_date(obj, fmt, lang);
		else if (ul4._isint(obj))
			return ul4._format_int(obj, fmt, lang);
		else if (obj === true)
			return ul4._format_int(1, fmt, lang);
		else if (obj === false)
			return ul4._format_int(0, fmt, lang);
	};

	ul4._lpad = function _lpad(string, pad, len)
	{
		if (typeof(string) === "number")
			string = string.toString();
		while (string.length < len)
			string = pad + string;
		return string;
	};

	ul4._rpad = function _rpad(string, pad, len)
	{
		if (typeof(string) === "number")
			string = string.toString();
		while (string.length < len)
			string = string + pad;
		return string;
	};

	ul4.Proto = {
		__prototype__: null,
		__id__: 0,
		_nextid: 1,
		isa: function isa(type)
		{
			if (this === type)
				return true;
			if (this.__prototype__ === null)
				return false;
			return this.__prototype__.isa(type);
		},

		isprotoof: function isprotoof(obj)
		{
			while (true)
			{
				if (obj === null || Object.prototype.toString.call(obj) !== "[object Object]" || typeof(obj.__prototype__) === "undefined")
					return false;
				if (obj === this)
					return true;
				obj = obj.__prototype__;
			}
		},

		// equality comparison of objects defaults to identity comparison
		__eq__: function __eq__(other)
		{
			return this === other;
		},

		// To overwrite equality comparison, you only have to overwrite ``__eq__``,
		// ``__ne__`` will be synthesized from that
		__ne__: function __ne__(other)
		{
			return !this.__eq__(other);
		},

		// For other comparison operators, each method has to be implemented:
		// ``<`` calls ``__lt__``, ``<=`` calls ``__le__``, ``>`` calls ``__gt__`` and
		// ``>=`` calls ``__ge__``

		__bool__: function __bool__()
		{
			return true;
		}
	};

	ul4.Signature = ul4._inherit(
		ul4.Proto,
		{
			create: function create(...args)
			{
				let signature = ul4._clone(this);
				signature.args = [];
				signature.argNames = {};
				signature.remargs = null;
				signature.remkwargs = null;

				let nextDefault = false;
				let lastArgname = null;
				for (let i = 0; i < args.length; ++i)
				{
					let argName = args[i];
					if (nextDefault)
					{
						signature.args.push({name: lastArgname, defaultValue: argName});
						signature.argNames[lastArgname] = true;
						nextDefault = false;
					}
					else
					{
						if (argName.substr(argName.length-1) === "=")
						{
							lastArgname = argName.substr(0, argName.length-1);
							nextDefault = true;
						}
						else if (argName.substr(0, 2) === "**")
							signature.remkwargs = argName.substr(2);
						else if (argName.substr(0, 1) === "*")
							signature.remargs = argName.substr(1);
						else
						{
							signature.args.push({name: argName});
							signature.argNames[argName] = true;
						}
					}
				}
				return signature;
			},

			// Create the argument array for calling a function with this signature with the arguments available from ``args``
			bindArray: function bindArray(name, args, kwargs)
			{
				let finalargs = [];
				let decname = name !== null ? name + "() " : "";

				for (let i = 0; i < this.args.length; ++i)
				{
					let arg = this.args[i];
					if (i < args.length)
					{
						if (kwargs.hasOwnProperty(arg.name))
							throw ul4.ArgumentError.create(decname + "argument " + ul4._repr(arg.name) + " (position " + i + ") specified multiple times");
						finalargs.push(args[i]);
					}
					else
					{
						if (kwargs.hasOwnProperty(arg.name))
							finalargs.push(kwargs[arg.name]);
						else
						{
							if (arg.hasOwnProperty("defaultValue"))
								finalargs.push(arg.defaultValue);
							else
								throw ul4.ArgumentError.create("required " + decname + "argument " + ul4._repr(arg.name) + " (position " + i + ") missing");
						}
					}
				}

				// Do we accept additional positional arguments?
				if (this.remargs === null)
				{
					// No, but we have them -> complain
					if (args.length > this.args.length)
					{
						let prefix = name === null ? "expected" : name + "() expects";
						throw ul4.ArgumentError.create(prefix + " at most " + this.args.length + " positional argument" + (this.args.length != 1 ? "s" : "") + ", " + args.length + " given");
					}
				}
				else
				{
					// Put additional positional arguments in the call into the ``*`` argument (if there are none, this pushes an empty list)
					finalargs.push(args.slice(this.args.length));
				}

				// Do we accept arbitrary keyword arguments?
				if (this.remkwargs === null)
				{
					// No => complain about unknown ones
					for (let key in kwargs)
					{
						if (!this.argNames[key])
						{
							if (name === null)
								throw ul4.ArgumentError.create("an argument named " + ul4._repr(key) + " isn't supported");
							else
								throw ul4.ArgumentError.create(name + "() doesn't support an argument named " + ul4._repr(key));
						}
					}
				}
				else
				{
					// Yes => Put the unknown ones into an object and add that to the arguments array
					let remkwargs = ul4on._emptymap();
					for (let key in kwargs)
					{
						if (!this.argNames[key])
							ul4on._setmap(remkwargs, key, kwargs[key]);
					}
					finalargs.push(remkwargs);
				}

				return finalargs;
			},

			// Create the argument object for calling a function with this signature with the arguments available from ``args``
			bindObject: function bindObject(name, args, kwargs)
			{
				args = this.bindArray(name, args, kwargs);
				let argObject = {};
				let i;
				for (i = 0; i < this.args.length; ++i)
					argObject[this.args[i].name] = args[i];
				if (this.remargs !== null)
					argObject[this.remargs] = args[i++];
				if (this.remkwargs !== null)
					argObject[this.remkwargs] = args[i++];
				return argObject;
			},

			__repr__: function __repr__()
			{
				return "<Signature " + this.toString() + ">";
			},

			__str__: function __str__()
			{
				return this.toString();
			},

			toString: function toString()
			{
				let v = [];
				for (let i = 0; i < this.args.length; ++i)
				{
					let arg = this.args[i];

					if (arg.hasOwnProperty("defaultValue"))
						v.push(arg.name + "=" + ul4._repr(arg.defaultValue));
					else
						v.push(arg.name);
				}
				if (this.remargs !== null)
					v.push("*" + this.remargs);
				if (this.remkwargs !== null)
					v.push("**" + this.remkwargs);
				return "(" + v.join(", ") + ")";
			}
		}
	);

	// Adds name and signature to a function/method and makes the method callable in templates
	ul4.expose = function expose(signature, options, f)
	{
		if (typeof(f) === "undefined")
		{
			f = options;
			options = {};
		}
		if (options.name)
			f._ul4_name = options.name;
		if (ul4._islist(signature))
			signature = ul4.Signature.create.apply(ul4.Signature, signature);
		f._ul4_signature = signature;
		f._ul4_needsobject = options.needsobject || false;
		f._ul4_needscontext = options.needscontext || false;

		return f;
	};

	// Protocol objects for all builtin types
	ul4.Protocol = {
		attrs: ul4on._emptyset(),

		dir: function dir() {
			return this.attrs;
		},

		get: function get(obj)
		{
			if (ul4._isstr(obj))
				return ul4.StrProtocol;
			else if (ul4._islist(obj))
				return ul4.ListProtocol;
			else if (ul4._isset(obj))
				return ul4.SetProtocol;
			else if (ul4._ismap(obj))
				return ul4.MapProtocol;
			else if (ul4._isobject(obj))
				return ul4.ObjectProtocol;
			else if (ul4._isdate(obj))
				return ul4.DateProtocol;
			else
				return ul4.Protocol;
		},

		getattr: function getattr(obj, attrname)
		{
			if (obj === null || typeof(obj) === "undefined")
				throw ul4.AttributeError.create(obj, attrname);
			else if (typeof(obj.__getattr__) === "function")
				return obj.__getattr__(attrname);
			else if (this.attrs.has(attrname))
			{
				let attr = this[attrname];
				let realattr = function realattr(...args) {
					return attr.apply(this, [obj, ...args]);
				};
				realattr.name = attr.name;
				realattr._ul4_name = attr._ul4_name || attr.name;
				realattr._ul4_signature = attr._ul4_signature;
				realattr._ul4_needsobject = attr._ul4_needsobject;
				realattr._ul4_needscontext = attr._ul4_needscontext;
				return realattr;
			}
			else
				throw ul4.AttributeError.create(obj, attrname);
		},

		hasattr: function hasattr(obj, attrname)
		{
			if (obj === null || typeof(obj) === "undefined")
				return false;
			else if (typeof(obj.__getattr__) === "function")
			{
				try
				{
					obj.__getattr__(attrname);
					return true;
				}
				catch (exc)
				{
					if (ul4.AttributeError.isprotoof(exc) && exc.obj === object)
						return false;
					else
						throw exc;
				}
			}
			else
				return this.attrs.has(attrname);
		}
	};

	ul4.StrProtocol = ul4._inherit(ul4.Protocol, {
		name: "str",

		attrs: ul4on._makeset(
			"split",
			"rsplit",
			"splitlines",
			"strip",
			"lstrip",
			"rstrip",
			"upper",
			"lower",
			"capitalize",
			"startswith",
			"endswith",
			"replace",
			"count",
			"find",
			"rfind",
			"join"
		),

		count: ul4.expose(["sub", "start=", null, "end=", null], function count(obj, sub, start, end){
			return ul4._count(obj, sub, start, end);
		}),

		find: ul4.expose(["sub", "start=", null, "end=", null], function find(obj, sub, start, end){
			return ul4._find(obj, sub, start, end);
		}),

		rfind: ul4.expose(["sub", "start=", null, "end=", null], function rfind(obj, sub, start, end){
			return ul4._rfind(obj, sub, start, end);
		}),

		replace: ul4.expose(["old", "new", "count=", null], function replace(obj, old, new_, count){
			return ul4._replace(obj, old, new_, count);
		}),

		strip: ul4.expose(["chars=", null], function strip(obj, chars){
			return ul4._strip(obj, chars);
		}),

		lstrip: ul4.expose(["chars=", null], function lstrip(obj, chars){
			return ul4._lstrip(obj, chars);
		}),

		rstrip: ul4.expose(["chars=", null], function rstrip(obj, chars){
			return ul4._rstrip(obj, chars);
		}),

		split: ul4.expose(["sep=", null, "count=", null], function split(obj, sep, count){
			return ul4._split(obj, sep, count);
		}),

		rsplit: ul4.expose(["sep=", null, "count=", null], function rsplit(obj, sep, count){
			return ul4._rsplit(obj, sep, count);
		}),

		splitlines: ul4.expose(["keepends=", false], function splitlines(obj, keepends){
			return ul4._splitlines(obj, keepends);
		}),

		lower: ul4.expose([], function lower(obj){
			return obj.toLowerCase();
		}),

		upper: ul4.expose([], function upper(obj){
			return obj.toUpperCase();
		}),

		capitalize: ul4.expose([], function capitalize(obj){
			return ul4._capitalize(obj);
		}),

		join: ul4.expose(["iterable"], function join(obj, iterable){
			return ul4._join(obj, iterable);
		}),

		startswith: ul4.expose(["prefix"], function startswith(obj, prefix){
			return ul4._startswith(obj, prefix);
		}),

		endswith: ul4.expose(["suffix"], function endswith(obj, suffix){
			return ul4._endswith(obj, suffix);
		})
	});

	ul4.ListProtocol = ul4._inherit(ul4.Protocol, {
		name: "list",

		attrs: ul4on._makeset("append", "insert", "pop", "count", "find", "rfind"),

		append: ul4.expose(["*items"], function append(obj, items){
			return ul4._append(obj, ...items);
		}),

		insert: ul4.expose(["pos", "*items"], function insert(obj, pos, items){
			return ul4._insert(obj, pos, ...items);
		}),

		pop: ul4.expose(["pos=", -1], function pop(obj, pos){
			return ul4._pop(obj, pos);
		}),

		count: ul4.expose(["sub", "start=", null, "end=", null], function count(obj, sub, start, end){
			return ul4._count(obj, sub, start, end);
		}),

		find: ul4.expose(["sub", "start=", null, "end=", null], function find(obj, sub, start, end){
			return ul4._find(obj, sub, start, end);
		}),

		rfind: ul4.expose(["sub", "start=", null, "end=", null], function rfind(obj, sub, start, end){
			return ul4._rfind(obj, sub, start, end);
		})
	});


	ul4.MapProtocol = ul4._inherit(ul4.Protocol, {
		name: "dict",

		attrs: ul4on._makeset("get", "items", "values", "update", "clear"),

		getattr: function getattr(obj, attrname)
		{
			if (this.attrs.has(attrname))
			{
				let attr = this[attrname];
				let realattr = function realattr(...args) {
					return attr.apply(this, [obj, ...args]);
				};
				realattr.name = attr.name;
				realattr._ul4_name = attr._ul4_name || attr.name;
				realattr._ul4_signature = attr._ul4_signature;
				realattr._ul4_needsobject = attr._ul4_needsobject;
				realattr._ul4_needscontext = attr._ul4_needscontext;
				return realattr;
			}
			else
				return obj.get(attrname);
		},

		get: ul4.expose(["key", "default=", null], function get(obj, key, default_){
			return ul4._get(obj, key, default_);
		}),

		items: ul4.expose([], function items(obj){
			return ul4._items(obj);
		}),

		values: ul4.expose([], function values(obj){
			return ul4._values(obj);
		}),

		update: ul4.expose(["*other", "**kwargs"], function update(obj, other, kwargs){
			return ul4._update(obj, other, kwargs);
		}),

		clear: ul4.expose([], function clear(obj){
			return ul4._clear(obj);
		})
	});

	ul4.SetProtocol = ul4._inherit(ul4.Protocol, {
		name: "set",

		attrs: ul4on._makeset("add", "clear"),

		add: ul4.expose(["*items"], function add(obj, items){
			for (let i = 0; i < items.length; ++i)
				obj.add(items[i]);
		}),

		clear: ul4.expose([], function clear(obj){
			return ul4._clear(obj);
		})
	});

	ul4.DateProtocol = ul4._inherit(ul4.Protocol, {
		name: "date",

		attrs: ul4on._makeset("weekday", "week", "day", "month", "year", "hour", "minute", "second", "microsecond", "mimeformat", "isoformat", "yearday"),

		weekday: ul4.expose([], function weekday(obj){
			return ul4._weekday(obj);
		}),

		week: ul4.expose(["firstweekday=", null], function week(obj, firstweekday){
			return ul4._week(obj, firstweekday);
		}),

		day: ul4.expose([], function day(obj){
			return obj.getDate();
		}),

		month: ul4.expose([], function month(obj){
			return obj.getMonth()+1;
		}),

		year: ul4.expose([], function year(obj){
			return obj.getFullYear();
		}),

		hour: ul4.expose([], function hour(obj){
			return obj.getHours();
		}),

		minute: ul4.expose([], function minute(obj){
			return obj.getMinutes();
		}),

		second: ul4.expose([], function second(obj){
			return obj.getSeconds();
		}),

		microsecond: ul4.expose([], function microsecond(obj){
			return obj.getMilliseconds() * 1000;
		}),

		mimeformat: ul4.expose([], function mimeformat(obj){
			return ul4._mimeformat(obj);
		}),

		isoformat: ul4.expose([], function isoformat(obj){
			return ul4._isoformat(obj);
		}),

		yearday: ul4.expose([], function yearday(obj){
			return ul4._yearday(obj);
		})
	});

	ul4.ObjectProtocol = ul4._inherit(ul4.Protocol, {
		name: "dict",

		getattr: function getattr(obj, attrname)
		{
			let result;
			if (obj && typeof(obj.__getattr__) === "function") // test this before the generic object test
				result = obj.__getattr__(attrname);
			else
				result = obj[attrname];
			if (typeof(result) !== "function")
				return result;
			let realresult = function(...args) {
				// We can use ``apply`` here, as we know that ``obj`` is a real object.
				return result.apply(obj, args);
			};
			realresult._ul4_name = result._ul4_name || result.name;
			realresult._ul4_signature = result._ul4_signature;
			realresult._ul4_needsobject = result._ul4_needsobject;
			realresult._ul4_needscontext = result._ul4_needscontext;
			return realresult;
		}
	});

	ul4.Context = ul4._inherit(
		ul4.Proto,
		{
			create: function create(vars)
			{
				if (vars === null || typeof(vars) === "undefined")
					vars = {};
				let context = ul4._clone(this);
				context.vars = vars;
				context.indents = [];
				context._output = [];
				return context;
			},

			/* Return a clone of the ``Context``, but with a fresh empty ``vars`` objects that inherits from the previous one.
			 * This is used by the various comprehensions to avoid leaking loop variables.
			 */
			inheritvars: function inheritvars()
			{
				let context = ul4._clone(this);
				context.vars = ul4._simpleclone(this.vars);
				return context;
			},

			/* Return a clone of the ``Context`` with one additional indentation (this is used by ``RenderAST``) */
			withindent: function withindent(indent)
			{
				let context = ul4._clone(this);
				if (indent !== null)
				{
					context.indents = this.indents.slice();
					context.indents.push(indent);
				}
				return context;
			},

			/* Return a clone of the ``Context`` with the output buffer replaced (this is used by ``renders`` to collect the output in a separate buffer) */
			replaceoutput: function replaceoutput()
			{
				let context = ul4._clone(this);
				context._output = [];
				return context;
			},

			clone: function clone(vars)
			{
				return ul4._clone(this);
			},

			output: function output(value)
			{
				this._output.push(value);
			},

			getoutput: function getoutput()
			{
				return this._output.join("");
			},

			get: function get(name)
			{
				return this.vars[name];
			},

			set: function set(name, value)
			{
				this.vars[name] = value;
			}
		}
	);

	/// Exceptions

	ul4.Exception = ul4._inherit(
		ul4.Proto,
		{
			__type__: "ul4.Exception",
			"cause": null,

			create: function create(result)
			{
				let exception = ul4._clone(this);
				return exception;
			},

			__getattr__: function __getattr__(attrname)
			{
				switch (attrname)
				{
					case "cause":
						return this.cause;
					default:
						throw ul4.AttributeError.create(this, attrname);
				}
			}
		}
	);

	// Exceptions used internally by UL4 for flow control
	ul4.InternalException = ul4._inherit(ul4.Exception, {});

	// Control flow exceptions
	ul4.ReturnException = ul4._inherit(
		ul4.InternalException,
		{
			__type__: "ul4.ReturnException",

			create: function create(result)
			{
				let exception = ul4.InternalException.create.call(this);
				exception.result = result;
				return exception;
			}
		}
	);

	ul4.BreakException = ul4._inherit(
		ul4.InternalException,
		{
			__type__: "ul4.BreakException"
		}
	);

	ul4.ContinueException = ul4._inherit(
		ul4.InternalException,
		{
			__type__: "ul4.ContinueException"
		}
	);

	// Real exceptions raised by various parts of UL4
	ul4.SyntaxError = ul4._inherit(
		ul4.Exception,
		{
			__type__: "ul4.SyntaxError"
		}
	);

	ul4.LValueRequiredError = ul4._inherit(
		ul4.SyntaxError,
		{
			__type__: "ul4.LValueRequiredError",

			toString: function toString()
			{
				return "lvalue required!";
			}
		}
	);

	ul4.TypeError = ul4._inherit(
		ul4.Exception,
		{
			__type__: "ul4.TypeError",

			create: function create(operation, message)
			{
				let exception = ul4._clone(this);
				exception.operation = operation;
				exception.message = message;
				return exception;
			},
			toString: function toString()
			{
				return this.message;
			}
		}
	);

	ul4.ValueError = ul4._inherit(
		ul4.Exception,
		{
			__type__: "ul4.ValueError",

			create: function create(message)
			{
				let exception = ul4._clone(this);
				exception.message = message;
				return exception;
			},
			toString: function toString()
			{
				return this.message;
			}
		}
	);

	ul4.ArgumentError = ul4._inherit(
		ul4.Exception,
		{
			__type__: "ul4.ArgumentError",

			create: function create(message)
			{
				let exception = ul4._clone(this);
				exception.message = message;
				return exception;
			},
			toString: function toString()
			{
				return this.message;
			}
		}
	);

	ul4.IndexError = ul4._inherit(
		ul4.Exception,
		{
			__type__: "ul4.IndexError",

			create: function create(obj, index)
			{
				let exception = ul4._clone(this);
				exception.obj = obj;
				exception.index = index;
				return exception;
			},

			toString: function toString()
			{
				return "index " + this.index + " out of range for " + ul4._type(this.obj);
			}
		}
	);

	ul4.AttributeError = ul4._inherit(
		ul4.Exception,
		{
			__type__: "ul4.AttributeError",

			create: function create(obj, attrname)
			{
				let exception = ul4._clone(this);
				exception.obj = obj;
				exception.attrname = attrname;
				return exception;
			},
			toString: function toString()
			{
				return "object of type " + ul4._type(this.obj) + " has no attribute " + ul4._repr(this.attrname);
			}
		}
	);

	/// Exception that wraps other exceptions while they bubble up the stack
	ul4.LocationError = ul4._inherit(
		ul4.Exception,
		{
			__type__: "ul4.LocationError",

			create: function create(location, cause)
			{
				let exception = ul4._clone(this);
				exception.location = location;
				exception.cause = cause;
				return exception;
			},

			_templateprefix: function(template)
			{
				let out = [];
				if (template.parenttemplate !== null)
					out.push("in local template ");
				else
					out.push("in template ");
				let first = true;
				while (template != null)
				{
					if (first)
						first = false;
					else
						out.push(" in ");
					out.push(template.name !== null ? ul4._repr(template.name) : "(unnamed)");
					template = template.parenttemplate;
				}
				return out.join("");
			},

			_template: function _template()
			{
				if (ul4.Tag.isprotoof(this.location))
					return this.location.template;
				else
					return this.location.tag.template;
			},

			_outerpos: function _outerpos()
			{
				if (ul4.Tag.isprotoof(this.location))
					return this.location.pos;
				else
				{
					let tag = this.location.tag;
					if (tag === null) // A top level template as no tag
						return this.location.pos;
					else
						return tag.pos;
				}
			},

			_innerpos: function _innerpos()
			{
				return this.location.pos;
			},

			toString: function toString()
			{
				let template = this._template();
				let templateprefix = this._templateprefix(template);
				let outerpos = this._outerpos();
				let innerpos = this._innerpos();

				let prefix = template.source.substring(outerpos.start, innerpos.start);
				let code = template.source.substring(innerpos.start, innerpos.stop);
				let suffix = template.source.substring(innerpos.stop, outerpos.stop);
				prefix = ul4._repr(prefix).slice(1, -1);
				code = ul4._repr(code).slice(1, -1);
				suffix = ul4._repr(suffix).slice(1, -1);
				let text = prefix + code + suffix;
				let underline = ul4._str_repeat("\u00a0", prefix.length) + ul4._str_repeat("~", code.length);

				// find line numbers
				let lineno = 1, colno = 1;
				for (let i = 0; i < innerpos.start; ++i)
				{
					if (template.source[i] === "\n")
					{
						++lineno;
						colno = 1;
					}
					else
						++colno;
				}

				pos = "offset " + this.location.pos.start + ":" + this.location.pos.stop + "; line " + lineno + "; col " + colno;

				var message = templateprefix + ": " + pos + "\n" + text + "\n" + underline;
				if (this.cause !== null)
					message += "\n\n" + this.cause.toString();
				return message;
			},

			__getattr__: function __getattr__(attrname)
			{
				switch (attrname)
				{
					case "cause":
						return this.cause;
					case "location":
						return this.location;
					case "template":
						return this._template;
					case "outerpos":
						return this._outerpos;
					case "innerpos":
						return this._innerpos;
					default:
						throw ul4.AttributeError.create(this, attrname);
				}
			}
		}
	);


	/// Classes for the syntax tree
	ul4.AST = ul4._inherit(
		ul4.Proto,
		{
			create: function create(pos)
			{
				let ast = ul4._clone(this);
				ast.pos = pos;
				return ast;
			},
			__str__: function __str__()
			{
				let out = [];
				this._str(out);
				return ul4._formatsource(out);
			},
			__repr__: function __repr__()
			{
				let out = [];
				this._repr(out);
				return ul4._formatsource(out);
			},
			_handle_eval: function _handle_eval(context)
			{
				try
				{
					return this._eval(context);
				}
				catch (exc)
				{
					if (!ul4.InternalException.isprotoof(exc) && !ul4.LocationError.isprotoof(exc))
						throw ul4.LocationError.create(this, exc);
					throw exc;
				}
			},
			_handle_eval_set: function _handle_eval_set(context, value)
			{
				try
				{
					return this._eval_set(context, value);
				}
				catch (exc)
				{
					if (!ul4.LocationError.isprotoof(exc))
						throw ul4.LocationError.create(this, exc);
					throw exc;
				}
			},
			_eval_set: function _eval_set(context, value)
			{
				throw ul4.LValueRequiredError;
			},
			_handle_eval_modify: function _handle_eval_modify(context, operator, value)
			{
				try
				{
					return this._eval_modify(context, operator, value);
				}
				catch (exc)
				{
					if (!ul4.LocationError.isprotoof(exc))
						throw ul4.LocationError.create(this, exc);
					throw exc;
				}
			},
			_eval_modify: function _eval_modify(context, operator, value)
			{
				throw ul4.LValueRequiredError;
			},
			_repr: function _repr(out)
			{
			},
			_str: function _str(out)
			{
			},
			ul4ondump: function ul4ondump(encoder)
			{
				for (let i = 0; i < this._ul4onattrs.length; ++i)
					encoder.dump(this[this._ul4onattrs[i]]);
			},
			ul4onload: function ul4onload(decoder)
			{
				for (let i = 0; i < this._ul4onattrs.length; ++i)
					this[this._ul4onattrs[i]] = decoder.load();
			},
			__setitem__: function __setitem__(attrname, value)
			{
				throw ul4.TypeError.create("mutate", "object is immutable");
			},
			// used in ul4ondump/ul4ondump to automatically dump these attributes
			_ul4onattrs: ["pos"]
		}
	);

	ul4.TextAST = ul4._inherit(
		ul4.AST,
		{
			create: function create(template, pos)
			{
				let text = ul4.AST.create.call(this, pos);
				text.template = template;
				return text;
			},
			_ul4onattrs: ul4.AST._ul4onattrs.concat(["template"]),
			_text: function _text()
			{
				return this.template.source.substring(this.pos.start, this.pos.stop);
			},
			_eval: function _eval(context)
			{
				context.output(this._text());
			},
			_str: function _str(out)
			{
				out.push("text ");
				out.push(ul4._repr(this._text()));
			},
			_repr: function _repr(out)
			{
				out.push("<TextAST ");
				out.push(ul4._repr(this._text()));
				out.push(">");
			}
		}
	);

	ul4.IndentAST = ul4._inherit(
		ul4.TextAST,
		{
			create: function create(template, pos, text)
			{
				let indent = ul4.TextAST.create.call(this, template, pos);
				indent._maketext(text);
				return indent;
			},
			_maketext: function _maketext(text)
			{
				if (typeof(this.template) !== "undefined")
				{
					if (text === null)
						this.text = this.template.source.substring(this.pos.start, this.pos.stop);
					else
						this.text = text;
				}
				else
					this.text = null;
			},
			_text: function _text()
			{
				if (this.text === null)
					return this.template.source.substring(this.pos.start, this.pos.stop);
				else
					return this.text;
			},
			_eval: function _eval(context)
			{
				for (let i = 0; i < context.indents.length; ++i)
					context.output(context.indents[i]);
				context.output(this._text());
			},
			ul4ondump: function ul4ondump(encoder)
			{
				ul4.TextAST.ul4ondump.call(this, encoder);

				if (this.text === this.template.source.substring(this.pos.start, this.pos.stop))
					encoder.dump(null);
				else
					encoder.dump(this.text);
			},
			ul4onload: function ul4onload(decoder)
			{
				ul4.TextAST.ul4onload.call(this, decoder);
				// Recreate ``text`` attribute
				this._maketext(decoder.load());
			},
			_str: function _str(out)
			{
				out.push("indent ");
				out.push(ul4._repr(this._text()));
			},
			_repr: function _repr(out)
			{
				out.push("<IndentAST ");
				out.push(ul4._repr(this._text()));
				out.push(">");
			}
		}
	);

	ul4.LineEndAST = ul4._inherit(
		ul4.TextAST,
		{
			_str: function _str(out)
			{
				out.push("lineend ");
				out.push(ul4._repr(this._text()));
			},
			_repr: function _repr(out)
			{
				out.push("<LineEndAST ");
				out.push(ul4._repr(this._text()));
				out.push(">");
			}
		}
	);

	ul4.Tag = ul4._inherit(
		ul4.AST,
		{
			create: function create(template, tag, tagpos, codepos)
			{
				let tago = ul4.AST.create.call(this, tagpos);
				tago.template = template;
				tago.tag = tag;
				tago.codepos = codepos;
				tago._maketext();
				return tago;
			},
			_maketext: function _maketext()
			{
				if (typeof(this.template) !== "undefined")
				{
					this.text = this.template.source.substring(this.pos.start, this.pos.stop);
					this.code = this.template.source.substring(this.codepos.start, this.codepos.stop);
				}
				else
				{
					this.text = null;
					this.code = null;
				}
			},
			ul4ondump: function ul4ondump(encoder)
			{
				ul4.AST.ul4ondump.call(this, encoder);
				encoder.dump(this.template);
				encoder.dump(this.tag);
				encoder.dump(this.codepos);
			},
			ul4onload: function ul4onload(decoder)
			{
				ul4.TextAST.ul4onload.call(this, decoder);
				this.template = decoder.load();
				this.tag = decoder.load();
				this.codepos = decoder.load();
				// Recreate ``text`` attribute
				this._maketext();
			}
		}
	);

	ul4.CodeAST = ul4._inherit(
		ul4.AST,
		{
			create: function create(tag, pos)
			{
				let code = ul4.AST.create.call(this, pos);
				code.tag = tag;
				return code;
			},
			_ul4onattrs: ul4.AST._ul4onattrs.concat(["tag"]),
			_str: function _str(out)
			{
				out.push(this.tag.source.substring(this.pos.start, this.pos.stop).replace(/\r?\n/g, ' '));
			}
		}
	);

	ul4.ConstAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, value)
			{
				let constant = ul4.CodeAST.create.call(this, tag, pos);
				constant.value = value;
				return constant;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["value"]),
			_repr: function _repr(out)
			{
				out.push("<ConstAST value=");
				out.push(ul4._repr(this.value));
				out.push(">");
			},
			_eval: function _eval(context)
			{
				return this.value;
			}
		}
	);

	ul4.ItemArgBase = ul4._inherit(
		ul4.CodeAST,
		{
			_handle_eval_list: function _handle_eval_list(context, result)
			{
				try
				{
					return this._eval_list(context, result);
				}
				catch (exc)
				{
					if (!ul4.InternalException.isprotoof(exc) && !ul4.LocationError.isprotoof(exc))
						throw ul4.LocationError.create(this, exc);
					throw exc;
				}
			},
			_handle_eval_set: function _handle_eval_set(context, result)
			{
				try
				{
					return this._eval_set(context, result);
				}
				catch (exc)
				{
					if (!ul4.InternalException.isprotoof(exc) && !ul4.LocationError.isprotoof(exc))
						throw ul4.LocationError.create(this, exc);
					throw exc;
				}
			},
			_handle_eval_dict: function _handle_eval_dict(context, result)
			{
				try
				{
					return this._eval_dict(context, result);
				}
				catch (exc)
				{
					if (!ul4.InternalException.isprotoof(exc) && !ul4.LocationError.isprotoof(exc))
						throw ul4.LocationError.create(this, exc);
					throw exc;
				}
			},
			_handle_eval_call: function _handle_eval_call(context, args, kwargs)
			{
				try
				{
					return this._eval_call(context, args, kwargs);
				}
				catch (exc)
				{
					if (!ul4.InternalException.isprotoof(exc) && !ul4.LocationError.isprotoof(exc))
						throw ul4.LocationError.create(this, exc);
					throw exc;
				}
			}
		}
	);

	ul4.SeqItemAST = ul4._inherit(
		ul4.ItemArgBase,
		{
			create: function create(tag, pos, value)
			{
				let seqitem = ul4.ItemArgBase.create.call(this, tag, pos);
				seqitem.value = value;
				return seqitem;
			},
			_ul4onattrs: ul4.ItemArgBase._ul4onattrs.concat(["value"]),
			_repr: function _repr(out)
			{
				out.push("<SeqItemAST value=");
				out.push(ul4._repr(this.value));
				out.push(">");
			},
			_eval_list: function _eval_list(context, result)
			{
				let value = this.value._handle_eval(context);
				result.push(value);
			},
			_eval_set: function _eval_set(context, result)
			{
				let value = this.value._handle_eval(context);
				result.add(value);
			}
		}
	);


	ul4.UnpackSeqItemAST = ul4._inherit(
		ul4.ItemArgBase,
		{
			create: function create(tag, pos, value)
			{
				let unpackseqitem = ul4.ItemArgBase.create.call(this, tag, pos);
				unpackseqitem.value = value;
				return unpackseqitem;
			},
			_ul4onattrs: ul4.ItemArgBase._ul4onattrs.concat(["value"]),
			_repr: function _repr(out)
			{
				out.push("<UnpackSeqItemAST value=");
				out.push(ul4._repr(this.value));
				out.push(">");
			},
			_eval_list: function _eval_list(context, result)
			{
				let value = this.value._handle_eval(context);
				for (let iter = ul4._iter(value);;)
				{
					let item = iter.next();
					if (item.done)
						break;
					result.push(item.value);
				}
			},
			_eval_set: function _eval_set(context, result)
			{
				let value = this.value._handle_eval(context);
				for (let iter = ul4._iter(value);;)
				{
					let item = iter.next();
					if (item.done)
						break;
					result.add(item.value);
				}
			}
		}
	);

	ul4.DictItemAST = ul4._inherit(
		ul4.ItemArgBase,
		{
			create: function create(tag, pos, key, value)
			{
				let dictitem = ul4.ItemArgBase.create.call(this, tag, pos);
				dictitem.key = key;
				dictitem.value = value;
				return dictitem;
			},
			_ul4onattrs: ul4.ItemArgBase._ul4onattrs.concat(["key", "value"]),
			_repr: function _repr(out)
			{
				out.push("<DictItemAST key=");
				out.push(ul4._repr(this.key));
				out.push(" value=");
				out.push(ul4._repr(this.value));
				out.push(">");
			},
			_eval_dict: function _eval_dict(context, result)
			{
				let key = this.key._handle_eval(context);
				let value = this.value._handle_eval(context);
				ul4on._setmap(result, key, value);
			}
		}
	);

	ul4.UnpackDictItemAST = ul4._inherit(
		ul4.ItemArgBase,
		{
			create: function create(tag, pos, item)
			{
				let unpackdictitem = ul4.ItemArgBase.create.call(this, tag, pos);
				unpackdictitem.item = item;
				return unpackdictitem;
			},
			_ul4onattrs: ul4.ItemArgBase._ul4onattrs.concat(["item"]),
			_repr: function _repr(out)
			{
				out.push("<UnpackDictItemAST item=");
				out.push(ul4._repr(this.item));
				out.push(">");
			},
			_eval_dict: function _eval_dict(context, result)
			{
				let item = this.item._handle_eval(context);
				if (ul4._islist(item))
				{
					for (let i = 0; i < item.length; ++i)
					{
						if (!ul4._islist(item[i]) || item[i].length != 2)
							throw ul4.ArgumentError.create("** requires a list of (key, value) pairs");
						let key = item[i][0], value = item[i][1];
						ul4on._setmap(result, key, value);
					}
				}
				else if (ul4._ismap(item))
				{
					item.forEach(function(value, key){
						ul4on._setmap(result, key, value);
					});
				}
				else if (ul4._isobject(item))
				{
					for (let key in item)
						ul4on._setmap(result, key, item[key]);
				}
			}
		}
	);

	ul4.PosArgAST = ul4._inherit(
		ul4.ItemArgBase,
		{
			create: function create(tag, pos, value)
			{
				let arg = ul4.ItemArgBase.create.call(this, tag, pos);
				arg.value = value;
				return arg;
			},
			_ul4onattrs: ul4.ItemArgBase._ul4onattrs.concat(["value"]),
			_repr: function _repr(out)
			{
				out.push("<PosArgAST value=");
				this.value._repr(out);
				out.push(">");
			},
			_eval_call: function _eval_call(context, args, kwargs)
			{
				let value = this.value._handle_eval(context);
				args.push(value);
			}
		}
	);

	ul4.KeywordArgAST = ul4._inherit(
		ul4.ItemArgBase,
		{
			create: function create(tag, pos, name, value)
			{
				let arg = ul4.ItemArgBase.create.call(this, tag, pos);
				arg.name = name;
				arg.value = value;
				return arg;
			},
			_ul4onattrs: ul4.ItemArgBase._ul4onattrs.concat(["name", "value"]),
			_repr: function _repr(out)
			{
				out.push("<KeywordArgAST name=");
				out.push(ul4._repr(this.name));
				out.push(" value=");
				this.value._repr(out);
				out.push(">");
			},
			_eval_call: function _eval_call(context, args, kwargs)
			{
				if (kwargs.hasOwnProperty(this.name))
					throw ul4.ArgumentError.create("duplicate keyword argument " + this.name);
				let value = this.value._handle_eval(context);
				kwargs[this.name] = value;
			}
		}
	);

	ul4.UnpackListArgAST = ul4._inherit(
		ul4.ItemArgBase,
		{
			create: function create(tag, pos, item)
			{
				let arg = ul4.ItemArgBase.create.call(this, tag, pos);
				arg.item = item;
				return arg;
			},
			_ul4onattrs: ul4.ItemArgBase._ul4onattrs.concat(["item"]),
			_repr: function _repr(out)
			{
				out.push("<UnpackListArgAST item=");
				this.item._repr(out);
				out.push(">");
			},
			_eval_call: function _eval_call(context, args, kwargs)
			{
				let item = this.item._handle_eval(context);
				args.push(...item);
			}
		}
	);

	ul4.UnpackDictArgAST = ul4._inherit(
		ul4.ItemArgBase,
		{
			create: function create(tag, pos, item)
			{
				let arg = ul4.ItemArgBase.create.call(this, tag, pos);
				arg.item = item;
				return arg;
			},
			_ul4onattrs: ul4.ItemArgBase._ul4onattrs.concat(["item"]),
			_repr: function _repr(out)
			{
				out.push("<UnpackDictArgAST item=");
				this.item._repr(out);
				out.push(">");
			},
			_eval_call: function _eval_call(context, args, kwargs)
			{
				let item = this.item._handle_eval(context);
				if (ul4._islist(item))
				{
					for (let i = 0; i < item.length; ++i)
					{
						if (!ul4._islist(item[i]) || item[i].length != 2)
							throw ul4.ArgumentError.create("** requires a list of (key, value) pairs");
						let key = item[i][0], value = item[i][1];
						if (kwargs.hasOwnProperty(key))
							throw ul4.ArgumentError.create("duplicate keyword argument " + key);
						kwargs[key] = value;
					}
				}
				else if (ul4._ismap(item))
				{
					item.forEach(function(value, key){
						if (kwargs.hasOwnProperty(key))
							throw ul4.ArgumentError.create("duplicate keyword argument " + key);
						kwargs[key] = value;
					});
				}
				else if (ul4._isobject(item))
				{
					for (let key in item)
					{
						if (kwargs.hasOwnProperty(key))
							throw ul4.ArgumentError.create("duplicate keyword argument " + key);
						kwargs[key] = item[key];
					}
				}
			}
		}
	);

	ul4.ListAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos)
			{
				let list = ul4.CodeAST.create.call(this, tag, pos);
				list.items = [];
				return list;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["items"]),
			_repr: function _repr(out)
			{
				out.push("<ListAST");
				for (let i = 0; i < this.items.length; ++i)
				{
					out.push(" ");
					this.items[i]._repr(out);
				}
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let result = [];
				for (let i = 0; i < this.items.length; ++i)
					this.items[i]._handle_eval_list(context, result);
				return result;
			}
		}
	);

	ul4.ListCompAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, item, varname, container, condition)
			{
				let listcomp = ul4.CodeAST.create.call(this, tag, pos);
				listcomp.item = item;
				listcomp.varname = varname;
				listcomp.container = container;
				listcomp.condition = condition;
				return listcomp;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["item", "varname", "container", "condition"]),
			_repr: function _repr(out)
			{
				out.push("<ListCompAST");
				out.push(" item=");
				this.item._repr(out);
				out.push(" varname=");
				out.push(ul4._repr(this.varname));
				out.push(" container=");
				this.container._repr(out);
				if (condition !== null)
				{
					out.push(" condition=");
					this.condition._repr(out);
				}
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let container = this.container._handle_eval(context);

				let localcontext = context.inheritvars();

				let result = [];
				for (let iter = ul4._iter(container);;)
				{
					let item = iter.next();
					if (item.done)
						break;
					let varitems = ul4._unpackvar(this.varname, item.value);
					for (let i = 0; i < varitems.length; ++i)
						varitems[i][0]._handle_eval_set(localcontext, varitems[i][1]);
					if (this.condition === null || ul4._bool(this.condition._handle_eval(localcontext)))
						result.push(this.item._handle_eval(localcontext));
				}
				return result;
			}
		}
	);

	ul4.DictAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos)
			{
				let dict = ul4.CodeAST.create.call(this, tag, pos);
				dict.items = [];
				return dict;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["items"]),
			_repr: function _repr(out)
			{
				out.push("<DictAST");
				for (let i = 0; i < this.items.length; ++i)
				{
					out.push(" ");
					this.items[i][0]._repr(out);
					out.push("=");
					this.items[i][1]._repr(out);
				}
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let result = ul4on._emptymap();
				for (let i = 0; i < this.items.length; ++i)
					this.items[i]._handle_eval_dict(context, result);
				return result;
			}
		}
	);

	ul4.DictCompAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, key, value, varname, container, condition)
			{
				let listcomp = ul4.CodeAST.create.call(this, tag, pos);
				listcomp.key = key;
				listcomp.value = value;
				listcomp.varname = varname;
				listcomp.container = container;
				listcomp.condition = condition;
				return listcomp;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["key", "value", "varname", "container", "condition"]),
			_repr: function _repr(out)
			{
				out.push("<DictCompAST");
				out.push(" key=");
				this.key._repr(out);
				out.push(" value=");
				this.value._repr(out);
				out.push(" varname=");
				this.varname._repr(out);
				out.push(" container=");
				this.container._repr(out);
				if (condition !== null)
				{
					out.push(" condition=");
					this.condition._repr(out);
				}
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let container = this.container._handle_eval(context);

				let localcontext = context.inheritvars();

				let result = ul4on._emptymap();

				for (let iter = ul4._iter(container);;)
				{
					let item = iter.next();
					if (item.done)
						break;
					let varitems = ul4._unpackvar(this.varname, item.value);
					for (let i = 0; i < varitems.length; ++i)
						varitems[i][0]._handle_eval_set(localcontext, varitems[i][1]);
					if (this.condition === null || ul4._bool(this.condition._handle_eval(localcontext)))
					{
						let key = this.key._handle_eval(localcontext);
						let value = this.value._handle_eval(localcontext);
						ul4on._setmap(result, key, value);
					}
				}

				return result;
			}
		}
	);

	ul4.SetAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos)
			{
				let set = ul4.CodeAST.create.call(this, tag, pos);
				set.items = [];
				return set;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["items"]),
			_repr: function _repr(out)
			{
				out.push("<SetAST");
				for (let i = 0; i < this.items.length; ++i)
				{
					out.push(" ");
					this.items[i][0]._repr(out);
					out.push("=");
					this.items[i][1]._repr(out);
				}
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let result = ul4on._haveset ? new Set() : ul4._Set.create();

				for (let i = 0; i < this.items.length; ++i)
					this.items[i]._handle_eval_set(context, result);

				return result;
			}
		}
	);

	ul4.SetCompAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, item, varname, container, condition)
			{
				let setcomp = ul4.CodeAST.create.call(this, tag, pos);
				setcomp.item = item;
				setcomp.container = container;
				setcomp.condition = condition;
				return setcomp;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["item", "varname", "container", "condition"]),
			_repr: function _repr(out)
			{
				out.push("<SetCompAST");
				out.push(" item=");
				this.item._repr(out);
				out.push(" varname=");
				this.varname._repr(out);
				out.push(" container=");
				this.container._repr(out);
				if (condition !== null)
				{
					out.push(" condition=");
					this.condition._repr(out);
				}
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let container = this.container._handle_eval(context);

				let localcontext = context.inheritvars();

				let result = ul4on._haveset ? new Set() : ul4._Set.create();
				for (let iter = ul4._iter(container);;)
				{
					let item = iter.next();
					if (item.done)
						break;
					let varitems = ul4._unpackvar(this.varname, item.value);
					for (let i = 0; i < varitems.length; ++i)
						varitems[i][0]._handle_eval_set(localcontext, varitems[i][1]);
					if (this.condition === null || ul4._bool(this.condition._handle_eval(localcontext)))
						result.add(this.item._handle_eval(localcontext));
				}

				return result;
			}
		}
	);

	ul4.GenExprAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, item, varname, container, condition)
			{
				let genexp = ul4.CodeAST.create.call(this, tag, pos);
				genexp.item = item;
				genexp.varname = varname;
				genexp.container = container;
				genexp.condition = condition;
				return genexp;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["item", "varname", "container", "condition"]),
			_repr: function _repr(out)
			{
				out.push("<GenExprAST");
				out.push(" item=");
				this.item._repr(out);
				out.push(" varname=");
				this.varname._repr(out);
				out.push(" container=");
				this.container._repr(out);
				if (this.condition !== null)
				{
					out.push(" condition=");
					this.condition._repr(out);
				}
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let container = this.container._handle_eval(context);
				let iter = ul4._iter(container);

				let localcontext = context.inheritvars();

				let self = this;

				let result = {
					next: function(){
						while (true)
						{
							let item = iter.next();
							if (item.done)
								return item;
							let varitems = ul4._unpackvar(self.varname, item.value);
							for (let i = 0; i < varitems.length; ++i)
								varitems[i][0]._handle_eval_set(localcontext, varitems[i][1]);
							if (self.condition === null || ul4._bool(self.condition._handle_eval(localcontext)))
							{
								let value = self.item._handle_eval(localcontext);
								return {value: value, done: false};
							}
						}
					}
				};

				return result;
			}
		}
	);

	ul4.VarAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, name)
			{
				let variable = ul4.CodeAST.create.call(this, tag, pos);
				variable.name = name;
				return variable;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["name"]),
			_repr: function _repr(out)
			{
				out.push("<VarAST name=");
				out.push(ul4._repr(this.name));
				out.push(">");
			},
			_eval: function _eval(context)
			{
				return this._get(context, this.name);
			},
			_eval_set: function _eval_set(context, value)
			{
				this._set(context, this.name, value);
			},
			_eval_modify: function _eval_modify(context, operator, value)
			{
				this._modify(context, operator, this.name, value);
			},
			_get: function _get(context, name)
			{
				let result = context.get(name);
				if (typeof(result) === "undefined")
					result = ul4.functions[name];
				return result;
			},
			_set: function _set(context, name, value)
			{
				context.set(name, value);
			},
			_modify: function _modify(context, operator, name, value)
			{
				var newvalue = operator._ido(context.get(name), value);
				context.set(name, newvalue);
			}
		}
	);

	ul4.UnaryAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, obj)
			{
				let unary = ul4.CodeAST.create.call(this, tag, pos);
				unary.obj = obj;
				return unary;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["obj"]),
			_repr: function _repr(out)
			{
				out.push("<");
				out.push(this.typename);
				out.push(" obj=");
				this.obj._repr(out);
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let obj = this.obj._handle_eval(context);
				return this._do(obj);
			}
		}
	);

	// Negation
	ul4.NegAST = ul4._inherit(
		ul4.UnaryAST,
		{
			_do: function _do(obj)
			{
				if (obj !== null && typeof(obj.__neg__) === "function")
					return obj.__neg__();
				return -obj;
			}
		}
	);

	// Bitwise not
	ul4.BitNotAST = ul4._inherit(
		ul4.UnaryAST,
		{
			_do: function _do(obj)
			{
				return -obj-1;
			}
		}
	);

	// Not
	ul4.NotAST = ul4._inherit(
		ul4.UnaryAST,
		{
			_do: function _do(obj)
			{
				return !ul4._bool(obj);
			}
		}
	);

	// If expression
	ul4.IfAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, objif, objcond, objelse)
			{
				let ifexpr = ul4.CodeAST.create.call(this, tag, pos);
				ifexpr.objif = objif;
				ifexpr.objcond = objcond;
				ifexpr.objelse = objelse;
				return ifexpr;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["objif", "objcond", "objelse"]),
			_repr: function _repr(out)
			{
				out.push("<");
				out.push(this.typename);
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
			},
			_eval: function _eval(context)
			{
				let result;
				var condvalue = this.objcond._handle_eval(context);
				if (ul4._bool(condvalue))
					result = this.objif._handle_eval(context);
				else
					result = this.objelse._handle_eval(context);
				return result;
			}
		}
	);

	ul4.ReturnAST = ul4._inherit(
		ul4.UnaryAST,
		{
			_eval: function _eval(context)
			{
				let result = this.obj._handle_eval(context);
				throw ul4.ReturnException.create(result);
			},
			_str: function _str(out)
			{
				out.push("return ");
				this.obj._str(out);
			}
		}
	);

	ul4.PrintAST = ul4._inherit(
		ul4.UnaryAST,
		{
			_eval: function _eval(context)
			{
				let obj = this.obj._handle_eval(context);
				let output = ul4._str(obj);
				context.output(output);
			},
			_str: function _str(out)
			{
				out.push("print ");
				this.obj._str(out);
			}
		}
	);

	ul4.PrintXAST = ul4._inherit(
		ul4.UnaryAST,
		{
			_eval: function _eval(context)
			{
				let obj = this.obj._handle_eval(context);
				let output = ul4._xmlescape(obj);
				context.output(output);
			},
			_str: function _str(out)
			{
				out.push("printx ");
				this.obj._str(out);
			}
		}
	);

	ul4.BinaryAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, obj1, obj2)
			{
				let binary = ul4.CodeAST.create.call(this, tag, pos);
				binary.obj1 = obj1;
				binary.obj2 = obj2;
				return binary;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["obj1", "obj2"]),
			_repr: function _repr(out)
			{
				out.push("<");
				out.push(this.type);
				out.push(" obj1=");
				this.obj1._repr(out);
				out.push(" obj2=");
				this.obj2._repr(out);
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let obj1 = this.obj1._handle_eval(context);
				let obj2 = this.obj2._handle_eval(context);
				return this._do(obj1, obj2);
			}
		}
	);

	// Item access and assignment: dict[key], list[index], string[index], color[index]
	ul4.ItemAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				let result = this._get(obj1, obj2);
				return result;
			},
			_eval_set: function _eval_set(context, value)
			{
				let obj1 = this.obj1._handle_eval(context);
				let obj2 = this.obj2._handle_eval(context);
				this._set(obj1, obj2, value);
			},
			_eval_modify: function _eval_modify(context, operator, value)
			{
				let obj1 = this.obj1._handle_eval(context);
				let obj2 = this.obj2._handle_eval(context);
				this._modify(operator, obj1, obj2, value);
			},
			_get: function _get(container, key)
			{
				if (typeof(container) === "string" || ul4._islist(container))
				{
					if (ul4.slice.isprotoof(key))
					{
						let start = key.start, stop = key.stop;
						if (typeof(start) === "undefined" || start === null)
							start = 0;
						if (typeof(stop) === "undefined" || stop === null)
							stop = container.length;
						return container.slice(start, stop);
					}
					else
					{
						let orgkey = key;
						if (key < 0)
							key += container.length;
						if (key < 0 || key >= container.length)
							throw ul4.IndexError.create(container, orgkey);
						return container[key];
					}
				}
				else if (container && typeof(container.__getitem__) === "function") // objects without ``_getitem__`` don't support item access
					return container.__getitem__(key);
				else if (ul4._ismap(container))
					return container.get(key);
				else if (ul4._isobject(container))
					return container[key];
				else
					throw ul4.TypeError.create("[]", ul4._type(container) + " object is not subscriptable");
			},
			_set: function _set(container, key, value)
			{
				if (ul4._islist(container))
				{
					if (ul4.slice.isprotoof(key))
					{
						let start = key.start, stop = key.stop;
						if (start === null)
							start = 0;
						else if (start < 0)
							start += container.length;
						if (start < 0)
							start = 0;
						else if (start > container.length)
							start = container.length;
						if (stop === null)
							stop = container.length;
						else if (stop < 0)
							stop += container.length;
						if (stop < 0)
							stop = 0;
						else if (stop > container.length)
							stop = container.length;
						if (stop < start)
							stop = start;
						container.splice(start, stop-start); // Remove old element
						for (let iter = ul4._iter(value);;)
						{
							let item = iter.next();
							if (item.done)
								break;
							container.splice(start++, 0, item.value);
						}
					}
					else
					{
						let orgkey = key;
						if (key < 0)
							key += container.length;
						if (key < 0 || key >= container.length)
							throw ul4.IndexError.create(container, orgkey);
						container[key] = value;
					}
				}
				else if (container && typeof(container.__setitem__) === "function") // test this before the generic object test
					container.__setitem__(key, value);
				else if (ul4._ismap(container))
					container.set(key, value);
				else if (ul4._isobject(container))
					container[key] = value;
				else
					throw ul4.NotSubscriptableError.create(container);
			},
			_modify: function _modify(operator, container, key, value)
			{
				this._set(container, key, operator._ido(this._get(container, key), value));
			}
		}
	);

	// Identifty test operator ``is``
	ul4.IsAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				return obj1 === obj2;
			}
		}
	);

	// Inverted tdentifty test operator ``is not``
	ul4.IsNotAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				return obj1 !== obj2;
			}
		}
	);

	// Comparison operator ==
	ul4.EQAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				return ul4._eq(obj1, obj2);
			}
		}
	);

	// Comparison operator !=
	ul4.NEAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				return ul4._ne(obj1, obj2);
			}
		}
	);

	// Comparison operator <
	ul4.LTAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				return ul4._lt(obj1, obj2);
			}
		}
	);

	// Comparison operator <=
	ul4.LEAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				return ul4._le(obj1, obj2);
			}
		}
	);

	// Comparison operator >
	ul4.GTAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				return ul4._gt(obj1, obj2);
			}
		}
	);

	// Comparison operator >=
	ul4.GEAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				return ul4._ge(obj1, obj2);
			}
		}
	);

	// Containment test: string in string, obj in list, key in dict, value in rgb
	ul4.ContainsAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj, container)
			{
				if (typeof(obj) === "string" && typeof(container) === "string")
				{
					return container.indexOf(obj) !== -1;
				}
				else if (ul4._islist(container))
				{
					return container.indexOf(obj) !== -1;
				}
				else if (container && typeof(container.__contains__) === "function") // test this before the generic object test
					return container.__contains__(obj);
				else if (ul4._ismap(container) || ul4._isset(container))
					return container.has(obj);
				else if (ul4._isobject(container))
				{
					for (let key in container)
					{
						if (key === obj)
							return true;
					}
					return false;
				}
				else if (ul4._iscolor(container))
				{
					return container._r === obj || container._g === obj || container._b === obj || container._a === obj;
				}
				throw ul4.TypeError.create("in", ul4._type(container) + " object is not iterable");
			}
		}
	);

	// Inverted containment test
	ul4.NotContainsAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj, container)
			{
				return !ul4.ContainsAST._do(obj, container);
			}
		}
	);

	// Addition: num + num, string + string
	ul4.AddAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj1 && typeof(obj1.__add__) === "function")
					return obj1.__add__(obj2);
				else if (obj2 && typeof(obj2.__radd__) === "function")
					return obj2.__radd__(obj1);
				if (obj1 === null || obj2 === null)
					throw ul4.TypeError.create("+", ul4._type(this.obj1) + " + " + ul4._type(this.obj2) + " is not supported");
				if (ul4._islist(obj1) && ul4._islist(obj2))
					return [...obj1, ...obj2];
				else
					return obj1 + obj2;
			},
			_ido: function _ido(obj1, obj2)
			{
				if (ul4._islist(obj1) && ul4._islist(obj2))
				{
					ul4._append(obj1, ...obj2);
					return obj1;
				}
				else
					return this._do(obj1, obj2);
			}
		}
	);

	// Substraction: num - num
	ul4.SubAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj1 && typeof(obj1.__sub__) === "function")
					return obj1.__sub__(obj2);
				else if (obj2 && typeof(obj2.__rsub__) === "function")
					return obj2.__rsub__(obj1);
				else if (ul4._isdate(obj1) && ul4._isdate(obj2))
					return this._date_sub(obj1, obj2);
				if (obj1 === null || obj2 === null)
					throw ul4.TypeError.create("-", ul4._type(this.obj1) + " - " + ul4._type(this.obj2) + " is not supported");
				return obj1 - obj2;
			},
			_date_sub: function _date_sub(obj1, obj2)
			{
				let swap = (obj2 > obj1);

				if (swap)
				{
					let t = obj1;
					obj1 = obj2;
					obj2 = t;
				}
				// From now on obj1 is > than obj2

				let year1 = obj1.getFullYear();
				let yearday1 = ul4._yearday(obj1);
				let year2 = obj2.getFullYear();
				let yearday2 = ul4._yearday(obj2);

				let diffdays = 0;

				while (year1 > year2)
				{
					diffdays += ul4._yearday(ul4._date(year2, 12, 31));
					++year2;
				}
				diffdays += yearday1 - yearday2;

				let hours1 = obj1.getHours();
				let minutes1 = obj1.getMinutes();
				let seconds1 = obj1.getSeconds();
				let hours2 = obj2.getHours();
				let minutes2 = obj2.getMinutes();
				let seconds2 = obj2.getSeconds();

				let diffseconds = (seconds1 - seconds2) + 60 * ((minutes1 - minutes2) + 60 * (hours1 - hours2));

				let diffmilliseconds = obj1.getMilliseconds() - obj2.getMilliseconds();

				if (swap)
				{
					diffdays = -diffdays;
					diffseconds = -diffseconds;
					diffmilliseconds = -diffmilliseconds;
				}
				return ul4.TimeDelta.create(diffdays, diffseconds, 1000*diffmilliseconds);
			},
			_ido: function _ido(obj1, obj2)
			{
				return this._do(obj1, obj2);
			}
		}
	);

	// Multiplication: num * num, int * str, str * int, int * list, list * int
	ul4.MulAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj1 && typeof(obj1.__mul__) === "function")
					return obj1.__mul__(obj2);
				else if (obj2 && typeof(obj2.__rmul__) === "function")
					return obj2.__rmul__(obj1);
				if (obj1 === null || obj2 === null)
					throw ul4.TypeError.create("*", ul4._type(obj1) + " * " + ul4._type(obj2) + " not supported");
				else if (ul4._isint(obj1) || ul4._isbool(obj1))
				{
					if (typeof(obj2) === "string")
					{
						if (obj1 < 0)
							throw ul4.ValueError.create("repetition counter must be positive");
						return ul4._str_repeat(obj2, obj1);
					}
					else if (ul4._islist(obj2))
					{
						if (obj1 < 0)
							throw ul4.ValueError.create("repetition counter must be positive");
						return ul4._list_repeat(obj2, obj1);
					}
				}
				else if (ul4._isint(obj2) || ul4._isbool(obj2))
				{
					if (typeof(obj1) === "string")
					{
						if (obj2 < 0)
							throw ul4.ValueError.create("repetition counter must be positive");
						return ul4._str_repeat(obj1, obj2);
					}
					else if (ul4._islist(obj1))
					{
						if (obj2 < 0)
							throw ul4.ValueError.create("repetition counter must be positive");
						return ul4._list_repeat(obj1, obj2);
					}
				}
				return obj1 * obj2;
			},
			_ido: function _ido(obj1, obj2)
			{
				if (ul4._islist(obj1) && ul4._isint(obj2))
				{
					if (obj2 > 0)
					{
						let i = 0;
						let targetsize = obj1.length * obj2;
						while (obj1.length < targetsize)
							obj1.push(obj1[i++]);
					}
					else
						obj1.splice(0, obj1.length);
					return obj1;
				}
				else
					return this._do(obj1, obj2);
			}
		}
	);

	// Truncating division
	ul4.FloorDivAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj1 && typeof(obj1.__floordiv__) === "function")
					return obj1.__floordiv__(obj2);
				else if (obj2 && typeof(obj2.__rfloordiv__) === "function")
					return obj2.__rfloordiv__(obj1);
				if (obj1 === null || obj2 === null)
					throw ul4.TypeError.create("//", ul4._type(obj1) + " // " + ul4._type(obj2) + " not supported");
				return Math.floor(obj1 / obj2);
			},
			_ido: function _ido(obj1, obj2)
			{
				return this._do(obj1, obj2);
			}
		}
	);

	// "Real" division
	ul4.TrueDivAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj1 && typeof(obj1.__truediv__) === "function")
					return obj1.__truediv__(obj2);
				else if (obj2 && typeof(obj2.__rtruediv__) === "function")
					return obj2.__rtruediv__(obj1);
				if (obj1 === null || obj2 === null)
					throw ul4.TypeError.create("/", ul4._type(obj1) + " / " + ul4._type(obj2) + " not supported");
				return obj1 / obj2;
			},
			_ido: function _ido(obj1, obj2)
			{
				return this._do(obj1, obj2);
			}
		}
	);

	// Modulo
	ul4.ModAST = ul4._inherit(
		ul4.BinaryAST,
		{
			// (this is non-trivial, because it follows the Python semantic of ``-5 % 2`` being ``1``)
			_do: function _do(obj1, obj2)
			{
				let div = Math.floor(obj1 / obj2);
				let mod = obj1 - div * obj2;

				if (mod !== 0 && ((obj2 < 0 && mod > 0) || (obj2 > 0 && mod < 0)))
				{
					mod += obj2;
					--div;
				}
				return obj1 - div * obj2;
			},
			_ido: function _ido(obj1, obj2)
			{
				return this._do(obj1, obj2);
			}
		}
	);

	// Bitwise left shift
	ul4.ShiftLeftAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj2 === false)
					obj2 = 0;
				else if (obj2 === true)
					obj2 = 1;
				if (obj2 < 0)
					return ul4.ShiftRightAST._do(obj1, -obj2);
				if (obj1 === false)
					obj1 = 0;
				else if (obj1 === true)
					obj1 = 1;
				while (obj2--)
					obj1 *= 2;
				return obj1;
			},
			_ido: function _ido(obj1, obj2)
			{
				return this._do(obj1, obj2);
			}
		}
	);

	// Bitwise right shift
	ul4.ShiftRightAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj2 === false)
					obj2 = 0;
				else if (obj2 === true)
					obj2 = 1;
				if (obj2 < 0)
					return ul4.ShiftLeftAST._do(obj1, -obj2);
				if (obj1 === false)
					obj1 = 0;
				else if (obj1 === true)
					obj1 = 1;
				while (obj2--)
					obj1 /= 2;
				return Math.floor(obj1);
			},
			_ido: function _ido(obj1, obj2)
			{
				return this._do(obj1, obj2);
			}
		}
	);

	// Bitwise and
	ul4.BitAndAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj2 === false)
					obj2 = 0;
				else if (obj2 === true)
					obj2 = 1;
				return obj1 & obj2;
			},
			_ido: function _ido(obj1, obj2)
			{
				return this._do(obj1, obj2);
			}
		}
	);

	// Bitwise exclusive or
	ul4.BitXOrAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj2 === false)
					obj2 = 0;
				else if (obj2 === true)
					obj2 = 1;
				return obj1 ^ obj2;
			},
			_ido: function _ido(obj1, obj2)
			{
				return this._do(obj1, obj2);
			}
		}
	);

	// Bitwise or
	ul4.BitOrAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_do: function _do(obj1, obj2)
			{
				if (obj2 === false)
					obj2 = 0;
				else if (obj2 === true)
					obj2 = 1;
				return obj1 | obj2;
			},
			_ido: function _ido(obj1, obj2)
			{
				return this._do(obj1, obj2);
			}
		}
	);

	ul4.AndAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_eval: function _eval(context)
			{
				let obj1 = this.obj1._handle_eval(context);
				if (!ul4._bool(obj1))
					return obj1;
				let obj2 = this.obj2._handle_eval(context);
				return obj2;
			}
		}
	);

	ul4.OrAST = ul4._inherit(
		ul4.BinaryAST,
		{
			_eval: function _eval(context)
			{
				let obj1 = this.obj1._handle_eval(context);
				if (ul4._bool(obj1))
					return obj1;
				let obj2 = this.obj2._handle_eval(context);
				return obj2;
			}
		}
	);

	ul4.AttrAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, obj, attrname)
			{
				let attr = ul4.CodeAST.create.call(this, tag, pos);
				attr.obj = obj;
				attr.attrname = attrname;
				return attr;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["obj", "attrname"]),
			_repr: function _repr(out)
			{
				out.push("<AttrAST");
				out.push(" obj=");
				this.obj._repr(out);
				out.push(" attrname=");
				out.push(ul4._repr(this.attrname));
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let obj = this.obj._handle_eval(context);
				let result = this._get(obj, this.attrname);
				return result;
			},
			_eval_set: function _eval_set(context, value)
			{
				let obj = this.obj._handle_eval(context);
				this._set(obj, this.attrname, value);
			},
			_eval_modify: function _eval_modify(context, operator, value)
			{
				let obj = this.obj._handle_eval(context);
				this._modify(operator, obj, this.attrname, value);
			},
			_get: function _get(object, attrname)
			{
				let proto = ul4.Protocol.get(object);
				try
				{
					return proto.getattr(object, attrname);
				}
				catch (exc)
				{
					if (ul4.AttributeError.isprotoof(exc) && exc.obj === object)
						return undefined;
					else
						throw exc;
				}
			},
			_set: function _set(object, attrname, value)
			{
				if (typeof(object) === "object" && typeof(object.__setattr__) === "function")
					object.__setattr__(attrname, value);
				else if (ul4._ismap(object))
					object.set(attrname, value);
				else if (ul4._isobject(object))
					object[attrname] = value;
				else
					throw ul4.TypeError.create("set", ul4._type(object) + " object has no writable attributes");
			},
			_modify: function _modify(operator, object, attrname, value)
			{
				let oldvalue = this._get(object, attrname);
				let newvalue = operator._ido(oldvalue, value);
				this._set(object, attrname, newvalue);
			}
		}
	);

	ul4.CallAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, obj, args)
			{
				let call = ul4.CodeAST.create.call(this, tag, pos);
				call.obj = obj;
				call.args = args;
				return call;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["obj", "args"]),
			_repr: function _repr(out)
			{
				out.push("<CallAST");
				out.push(" obj=");
				this.obj._repr(out);
				for (let i = 0; i < this.args.length; ++i)
				{
					let arg = this.args[i];
					out.push(" ");
					arg._repr(out);
				}
				out.push(">");
			},
			_makeargs: function _makeargs(context)
			{
				let args = [], kwargs = {};
				for (let i = 0; i < this.args.length; ++i)
					this.args[i]._handle_eval_call(context, args, kwargs);
				return {args: args, kwargs: kwargs};
			},
			_handle_eval: function _handle_eval(context)
			{
				try
				{
					return this._eval(context);
				}
				catch (exc)
				{
					throw ul4.LocationError.create(this, exc);
				}
			},
			_eval: function _eval(context)
			{
				let obj = this.obj._handle_eval(context);
				let args = this._makeargs(context);
				let result = ul4._call(context, obj, args.args, args.kwargs);
				return result;
			}
		}
	);

	ul4.RenderAST = ul4._inherit(
		ul4.CallAST,
		{
			create: function create(tag, pos, obj, args)
			{
				let render = ul4.CallAST.create.call(this, tag, pos, obj, args);
				render.indent = null;
				return render;
			},
			_ul4onattrs: ul4.CallAST._ul4onattrs.concat(["indent"]),
			_repr: function _repr(out)
			{
				out.push("<RenderAST");
				out.push(" indent=");
				out.push(ul4._repr(this.indent));
				out.push(" obj=");
				this.obj._repr(out);
				out.push(0);
				for (let i = 0; i < this.args.length; ++i)
				{
					let name = this.args[i][0];
					let arg = this.args[i][1];
					out.push(" ");
					if (name === null)
						;
					else if (name === "*")
						out.push("*");
					else if (name === "**")
						out.push("**");
					else
						out.push(name + "=");
					arg._repr(out);
					out.push(0);
				}
				out.push(-1);
				out.push(">");
			},
			_str: function _str(out)
			{
				out.push("render ");
				out.push(this.tag.source.substring(this.pos.start, this.pos.stop).replace(/\r?\n/g, ' '));
				if (this.indent !== null)
				{
					out.push(" with indent ");
					out.push(ul4._repr(this.indent._text()));
				}
			},
			_handle_eval: function _handle_eval(context)
			{
				let localcontext = context.withindent(this.indent !== null ? this.indent._text() : null);
				let obj = this.obj._handle_eval(localcontext);
				let args = this._makeargs(localcontext);

				try
				{
					let result = ul4._callrender(localcontext, obj, args.args, args.kwargs);
					return result;
				}
				catch (exc)
				{
					throw ul4.LocationError.create(this, exc);
				}
			}
		}
	);

	// Slice object
	ul4.slice = ul4._inherit(
		ul4.Proto,
		{
			create: function create(start, stop)
			{
				let slice = ul4._clone(this);
				slice.start = start;
				slice.stop = stop;
				return slice;
			},
			__repr__: function __repr__()
			{
				return "slice(" + ul4._repr(this.start) + ", " + ul4._repr(this.stop) + ")";
			}
		}
	);


	// List/String slice
	ul4.SliceAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, index1, index2)
			{
				let slice = ul4.CodeAST.create.call(this, tag, pos);
				slice.index1 = index1;
				slice.index2 = index2;
				return slice;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["index1", "index2"]),
			_repr: function _repr(out)
			{
				out.push("<SliceAST");
				if (this.index1 !== null)
				{
					out.push(" index1=");
					this.index1._repr(out);
				}
				if (this.index2 !== null)
				{
					out.push(" index2=");
					this.index2._repr(out);
				}
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let index1 = this.index1 !== null ? this.index1._handle_eval(context) : null;
				let index2 = this.index2 !== null ? this.index2._handle_eval(context) : null;
				return ul4.slice.create(index1, index2);
			}
		}
	);


	ul4.SetVarAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos, lvalue, value)
			{
				let changevar = ul4.CodeAST.create.call(this, tag, pos);
				changevar.lvalue = lvalue;
				changevar.value = value;
				return changevar;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["lvalue", "value"]),
			_repr: function _repr(out)
			{
				out.push("<");
				out.push(this.typename);
				out.push(" lvalue=");
				out.push(ul4._repr(this.lvalue));
				out.push(" value=");
				this.value._repr(out);
				out.push(">");
			},
			_eval: function _eval(context)
			{
				let value = this.value._handle_eval(context);
				let items = ul4._unpackvar(this.lvalue, value);
				for (let i = 0; i < items.length; ++i)
				{
					let item = items[i];
					item[0]._handle_eval_set(context, item[1]);
				}
			}
		}
	);

	ul4.ModifyVarAST = ul4._inherit(
		ul4.SetVarAST,
		{
			_eval: function _eval(context)
			{
				let value = this.value._handle_eval(context);
				let items = ul4._unpackvar(this.lvalue, value);
				for (let i = 0; i < items.length; ++i)
				{
					let item = items[i];
					item[0]._handle_eval_modify(context, this._operator, item[1]);
				}
			}
		}
	);

	ul4.AddVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.AddAST });

	ul4.SubVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.SubAST });

	ul4.MulVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.MulAST });

	ul4.TrueDivVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.TrueDivAST });

	ul4.FloorDivVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.FloorDivAST });

	ul4.ModVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.ModAST });

	ul4.ShiftLeftVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.ShiftLeftAST });

	ul4.ShiftRightVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.ShiftRightAST });

	ul4.BitAndVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.BitAndAST });

	ul4.BitXOrVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.BitXOrAST });

	ul4.BitOrVarAST = ul4._inherit(ul4.ModifyVarAST, { _operator: ul4.BitOrAST });

	ul4.BlockAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos)
			{
				let block = ul4.CodeAST.create.call(this, tag, pos);
				block.endtag = null;
				block.content = [];
				return block;
			},
			_ul4onattrs: ul4.CodeAST._ul4onattrs.concat(["endtag", "content"]),
			_eval: function _eval(context)
			{
				for (let i = 0; i < this.content.length; ++i)
					this.content[i]._handle_eval(context);
			},
			_str: function _str(out)
			{
				if (this.content.length)
				{
					for (let i = 0; i < this.content.length; ++i)
					{
						this.content[i]._str(out);
						out.push(0);
					}
				}
				else
				{
					out.push("pass");
					out.push(0);
				}
			}
		}
	);

	ul4.ForBlockAST = ul4._inherit(
		ul4.BlockAST,
		{
			create: function create(tag, pos, varname, container)
			{
				let for_ = ul4.BlockAST.create.call(this, tag, pos);
				for_.varname = varname;
				for_.container = container;
				return for_;
			},
			_ul4onattrs: ul4.BlockAST._ul4onattrs.concat(["varname", "container"]),
			_repr: function _repr(out)
			{
				out.push("<ForBlockAST");
				out.push(" varname=");
				out.push(ul4._repr(this.varname));
				out.push(" container=");
				this.container._repr(out);
				out.push(">");
			},
			_str_varname: function _str_varname(out, varname)
			{
				if (ul4._islist(varname))
				{
					out.push("(");
					for (let i = 0; i < varname.length; ++i)
					{
						if (i)
							out.push(", ");
						this._str_varname(out, varname[i]);
					}
					if (varname.length == 1)
						out.push(",");
					out.push(")");
				}
				else
					varname._str(out);
			},
			_eval: function _eval(context)
			{
				let container = this.container._handle_eval(context);

				for (let iter = ul4._iter(container);;)
				{
					let value = iter.next();
					if (value.done)
						break;
					let varitems = ul4._unpackvar(this.varname, value.value);
					for (let i = 0; i < varitems.length; ++i)
						varitems[i][0]._handle_eval_set(context, varitems[i][1]);
					try
					{
						// We can't call _handle_eval() here, as this would in turn call this function again, leading to infinite recursion
						// But we don't have to, as wrapping original exception in ``Error`` has already been done by the lower levels
						ul4.BlockAST._eval.call(this, context);
					}
					catch (exc)
					{
						if (exc === ul4.BreakException)
							break;
						else if (exc === ul4.ContinueException)
							;
						else
							throw exc;
					}
				}
			},
			_str: function _str(out)
			{
				out.push("for ");
				this._str_varname(out, this.varname);
				out.push(" in ");
				this.container._str(out);
				out.push(":");
				out.push(+1);
				ul4.BlockAST._str.call(this, out);
				out.push(-1);
			}
		}
	);

	ul4.WhileBlockAST = ul4._inherit(
		ul4.BlockAST,
		{
			create: function create(tag, pos, condition)
			{
				let while_ = ul4.BlockAST.create.call(this, tag, pos);
				while_.condition = condition;
				return while_;
			},
			_ul4onattrs: ul4.BlockAST._ul4onattrs.concat(["condition"]),
			_repr: function _repr(out)
			{
				out.push("<WhileAST");
				out.push(" condition=");
				this.condition._repr(out);
				out.push(">");
			},
			_str: function _str(out)
			{
				out.push("while ");
				this.container._repr(out);
				out.push(":");
				out.push(+1);
				ul4.BlockAST._str.call(this, out);
				out.push(-1);
			},
			_eval: function _eval(context)
			{
				while (true)
				{
					let cond = this.condition._handle_eval(context);
					if (!ul4._bool(cond))
						break;
					try
					{
						// We can't call _handle_eval() here, as this would in turn call this function again, leading to infinite recursion
						// But we don't have to, as wrapping original exception in ``Error`` has already been done by the lower levels
						ul4.BlockAST._eval.call(this, context);
					}
					catch (exc)
					{
						if (exc === ul4.BreakException)
							break;
						else if (exc === ul4.ContinueException)
							;
						else
							throw exc;
					}
				}
			}
		}
	);

	ul4.BreakAST = ul4._inherit(
		ul4.CodeAST,
		{
			_eval: function _eval(context)
			{
				throw ul4.BreakException;
			},
			_str: function _str(out)
			{
				out.push("break");
				out.push(0);
			},
			_repr: function _repr(out)
			{
				out.push("<BreakAST>");
			}
		}
	);

	ul4.ContinueAST = ul4._inherit(
		ul4.CodeAST,
		{
			_eval: function _eval(context)
			{
				throw ul4.ContinueException;
			},
			_str: function _str(out)
			{
				out.push("continue");
				out.push(0);
			},
			_repr: function _repr(out)
			{
				out.push("<ContinueAST>");
			}
		}
	);

	ul4.CondBlockAST = ul4._inherit(
		ul4.BlockAST,
		{
			_eval: function _eval(context)
			{
				for (let i = 0; i < this.content.length; ++i)
				{
					let block = this.content[i];
					let execute = block._execute(context);
					if (execute)
					{
						block._handle_eval(context);
						break;
					}
				}
			}
		}
	);

	ul4.ConditionalBlockAST = ul4._inherit(
		ul4.BlockAST,
		{
			create: function create(tag, pos, condition)
			{
				let block = ul4.BlockAST.create.call(this, tag, pos);
				block.condition = condition;
				return block;
			},
			_ul4onattrs: ul4.BlockAST._ul4onattrs.concat(["condition"]),
			_repr: function _repr(out)
			{
				out.push("<");
				out.push(this.typename);
				out.push(" condition=");
				this.condition._repr(out);
				out.push(">");
			},
			_str: function _str(out)
			{
				out.push(this._strname);
				out.push(" ");
				this.condition._str(out);
				out.push(":");
				out.push(+1);
				ul4.BlockAST._str.call(this, out);
				out.push(-1);
			},
			_execute: function _execute(context)
			{
				let cond = this.condition._handle_eval(context);
				let result = ul4._bool(cond);
				return result;
			}
		}
	);

	ul4.IfBlockAST = ul4._inherit(ul4.ConditionalBlockAST, {_strname: "if"});

	ul4.ElIfBlockAST = ul4._inherit(ul4.ConditionalBlockAST, {_strname: "else if"});

	ul4.ElseBlockAST = ul4._inherit(
		ul4.BlockAST,
		{
			_repr: function _repr(out)
			{
				out.push("<ElseAST");
				out.push(">");
			},
			_str: function _str(out)
			{
				out.push("else:");
				out.push(+1);
				ul4.BlockAST._str.call(this, out);
				out.push(-1);
			},
			_execute: function _execute(context)
			{
				return true;
			}
		}
	);

	ul4.Template = ul4._inherit(
		ul4.BlockAST,
		{
			create: function create(tag, pos, source, name, whitespace, startdelim, enddelim, signature)
			{
				let template = ul4.BlockAST.create.call(this, tag, pos);
				template.source = source;
				template.name = name;
				template.whitespace = whitespace;
				template.startdelim = startdelim;
				template.enddelim = enddelim;
				template.docpos = null;
				template.signature = signature;
				template._jsfunction = null;
				template._asts = null;
				template._ul4_callsignature = signature;
				template._ul4_rendersignature = signature;
				template.parenttemplate = null;
				return template;
			},
			ul4ondump: function ul4ondump(encoder)
			{
				let signature;
				encoder.dump(ul4.version);
				encoder.dump(this.name);
				encoder.dump(this.source);
				encoder.dump(this.whitespace);
				encoder.dump(this.startdelim);
				encoder.dump(this.enddelim);
				encoder.dump(this.docpos);
				encoder.dump(this.parenttemplate);
				if (this.signature === null || ul4.SignatureAST.isprotoof(this.signature))
					signature = this.signature;
				else
				{
					signature = [];
					for (let i = 0; i < this.signature.args.length; ++i)
					{
						let arg = this.signature.args[i];
						if (typeof(arg.defaultValue) === "undefined")
							signature.push(arg.name);
						else
							signature.push(arg.name+"=", arg.defaultValue);
					}
					if (this.signature.remargs !== null)
						signature.push("*" + this.signature.remargs);
					if (this.signature.remkwargs !== null)
						signature.push("**" + this.signature.remkwargs);
				}
				encoder.dump(signature);
				ul4.BlockAST.ul4ondump.call(this, encoder);
			},
			ul4onload: function ul4onload(decoder)
			{
				let version = decoder.load();
				let signature;

				if (version === null)
					throw ul4.ValueError.create("UL4ON doesn't support templates in 'source' format in Javascript implementation");

				if (version !== ul4.version)
					throw ul4.ValueError.create("invalid version, expected " + ul4.version + ", got " + version);
				this.name = decoder.load();
				this.source = decoder.load();
				this.whitespace = decoder.load();
				this.startdelim = decoder.load();
				this.enddelim = decoder.load();
				this.docpos = decoder.load();
				this.parenttemplate = decoder.load();
				signature = decoder.load();
				if (ul4._islist(signature))
					signature = ul4.Signature.create.apply(ul4.Signature, signature);
				this.signature = signature;
				this._ul4_callsignature = signature;
				this._ul4_rendersignature = signature;
				ul4.BlockAST.ul4onload.call(this, decoder);
			},
			loads: function loads(string)
			{
				return ul4on.loads(string);
			},
			_eval: function _eval(context)
			{
				let signature = null;
				if (this.signature !== null)
					signature = this.signature._handle_eval(context);
				let closure = ul4.TemplateClosure.create(this, signature, context.vars);
				context.set(this.name, closure);
			},
			_repr: function _repr(out)
			{
				out.push("<Template");
				if (this.name !== null)
				{
					out.push(" name=");
					out.push(ul4._repr(this.name));
				}
				out.push(" whitespace=");
				out.push(ul4._repr(this.whitespace));
				if (this.startdelim !== "<?")
				{
					out.push(" startdelim=");
					out.push(ul4._repr(this.startdelim));
				}
				if (this.enddelim !== "?>")
				{
					out.push(" enddelim=");
					out.push(ul4._repr(this.enddelim));
				}
				out.push(">");
			},
			_str: function _str(out)
			{
				out.push("def ");
				out.push(this.name ? this.name : "unnamed");
				out.push(":");
				out.push(+1);
				ul4.BlockAST._str.call(this, out);
				out.push(-1);
			},
			_ul4_callneedsobject: true,
			_ul4_callneedscontext: true,
			_ul4_renderneedsobject: true,
			_ul4_renderneedscontext: true,
			_renderbound: function _renderbound(context, vars)
			{
				let localcontext = context.clone();
				localcontext.vars = vars;
				try
				{
					ul4.BlockAST._eval.call(this, localcontext);
				}
				catch (exc)
				{
					if (!ul4.ReturnException.isprotoof(exc))
						throw exc;
				}
			},
			__render__: function __render__(context, vars)
			{
				this._renderbound(context, vars);
			},
			render: function render(context, vars)
			{
				this._renderbound(context, vars);
			},
			_rendersbound: function _rendersbound(context, vars)
			{
				let localcontext = context.replaceoutput();
				this._renderbound(localcontext, vars);
				return localcontext.getoutput();
			},
			renders: function renders(vars)
			{
				vars = vars || {};
				let context = ul4.Context.create();
				if (this.signature !== null)
					vars = this.signature.bindObject(this.name, [], vars);
				return this._rendersbound(context, vars);
			},
			doc: function doc()
			{
				return this.docpos != null ? this.source.substring(this.docpos.start, this.docpos.stop) : null;
			},
			__getattr__: function __getattr__(attrname)
			{
				var self = this;
				switch (attrname)
				{
					case "tag":
						return this.tag;
					case "endtag":
						return this.endtag;
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
						return ul4.expose(this.signature, {needscontext: true, needsobject: true}, function render(context, vars){ self._renderbound(context, vars); });
					case "renders":
						return ul4.expose(this.signature, {needscontext: true, needsobject: true}, function renders(context, vars){ return self._rendersbound(context, vars); });
					default:
						throw ul4.AttributeError.create(this, attrname);
				}
			},
			_callbound: function _callbound(context, vars)
			{
				let localcontext = context.clone();
				localcontext.vars = vars;
				try
				{
					ul4.BlockAST._eval.call(this, localcontext);
				}
				catch (exc)
				{
					if (ul4.ReturnException.isprotoof(exc))
						return exc.result;
					else
						throw exc;
				}
				return null;
			},
			call: function call(vars)
			{
				vars = vars || {};
				let context = ul4.Context.create();
				if (this.signature !== null)
					vars = this.signature.bindObject(this.name, [], vars);
				return this._callbound(context, vars);
			},
			__call__: function __call__(context, vars)
			{
				return this._callbound(context, vars);
			},
			__type__: "ul4.Template" // used by ``istemplate()``
		}
	);

	ul4.SignatureAST = ul4._inherit(
		ul4.CodeAST,
		{
			create: function create(tag, pos)
			{
				let signature = ul4.CodeAST.create.call(this, tag, pos);
				signature.params = [];
				return signature;
			},
			ul4ondump: function ul4ondump(encoder)
			{
				ul4.CodeAST.ul4ondump.call(this, encoder);

				let dump = [];

				for (let i = 0; i < this.params.length; ++i)
				{
					let param = this.params[i];
					if (param[1] === null)
						dump.push(param[0]);
					else
						dump.push(param);
				}
				encoder.dump(dump);
			},
			ul4onload: function ul4onload(decoder)
			{
				ul4.AST.ul4onload.call(this, decoder);
				let dump = decoder.load();
				this.params = [];
				for (let i = 0; i < dump.length; ++i)
				{
					let param = dump[i];
					if (typeof(param) === "string")
						this.params.push([param, null]);
					else
						this.params.push(param);
				}
			},
			_eval: function _eval(context)
			{
				let args = [];
				for (let i = 0; i < this.params.length; ++i)
				{
					let param = this.params[i];
					if (param[1] === null)
						args.push(param[0]);
					else
					{
						args.push(param[0] + "=");
						args.push(param[1]._handle_eval(context));
					}
				}
				return ul4.Signature.create(...args);
			},
			_repr: function _repr(out)
			{
				out.push("<");
				out.push(this.typename);
				out.push(" params=");
				this.params._repr(out);
				out.push(">");
			}
		}
	);

	ul4.TemplateClosure = ul4._inherit(
		ul4.Proto,
		{
			create: function create(template, signature, vars)
			{
				let closure = ul4._clone(this);
				closure.template = template;
				closure.signature = signature;
				closure.vars = vars;
				closure._ul4_callsignature = signature;
				closure._ul4_rendersignature = signature;
				// Copy over the required attribute from the template
				closure.name = template.name;
				closure.tag = template.tag;
				closure.endtag = template.endtag;
				closure.source = template.source;
				closure.startdelim = template.startdelim;
				closure.enddelim = template.enddelim;
				closure.docpos = template.docpos;
				closure.content = template.content;
				return closure;
			},
			_ul4_callneedsobject: true,
			_ul4_callneedscontext: true,
			_ul4_renderneedsobject: true,
			_ul4_renderneedscontext: true,
			__render__: function __render__(context, vars)
			{
				this.template._renderbound(context, ul4._simpleinherit(this.vars, vars));
			},
			render: function render(context, vars)
			{
				this.template._renderbound(context, ul4._simpleinherit(this.vars, vars));
			},
			__call__: function __call__(context, vars)
			{
				return this.template._callbound(context, ul4._simpleinherit(this.vars, vars));
			},
			_renderbound: function _renderbound(context, vars)
			{
				this.template._renderbound(context, ul4._simpleinherit(this.vars, vars));
			},
			_rendersbound: function _rendersbound(context, vars)
			{
				return this.template._rendersbound(context, ul4._simpleinherit(this.vars, vars));
			},
			__getattr__: function __getattr__(attrname)
			{
				let self = this;
				switch (attrname)
				{
					case "render":
						return ul4.expose(this.signature, {needscontext: true, needsobject: true}, function render(context, vars){ self._renderbound(context, vars); });
					case "renders":
						return ul4.expose(this.signature, {needscontext: true, needsobject: true}, function renders(context, vars){ return self._rendersbound(context, vars); });
					case "signature":
						return this.signature;
					default:
						return this.template.__getattr__(attrname);
				}
			},
			__type__: "ul4.TemplateClosure" // used by ``istemplate()``
		}
	);

	// Create a color object from the red, green, blue and alpha values ``r``, ``g``, ``b`` and ``b``
	ul4._rgb = function _rgb(r, g, b, a)
	{
		return this.Color.create(255*r, 255*g, 255*b, 255*a);
	};

	// Convert ``obj`` to a string and escape the characters ``&``, ``<``, ``>``, ``'`` and ``"`` with their XML character/entity reference
	ul4._xmlescape = function _xmlescape(obj)
	{
		obj = ul4._str(obj);
		obj = obj.replace(/&/g, "&amp;");
		obj = obj.replace(/</g, "&lt;");
		obj = obj.replace(/>/g, "&gt;");
		obj = obj.replace(/'/g, "&#39;");
		obj = obj.replace(/"/g, "&quot;");
		return obj;
	};

	// Convert ``obj`` to a string suitable for output into a CSV file
	ul4._csv = function _csv(obj)
	{
		if (obj === null)
			return "";
		else if (typeof(obj) !== "string")
			obj = ul4._repr(obj);
		if (obj.indexOf(",") !== -1 || obj.indexOf('"') !== -1 || obj.indexOf("\n") !== -1)
			obj = '"' + obj.replace(/"/g, '""') + '"';
		return obj;
	};

	// Return a string containing one character with the codepoint ``i``
	ul4._chr = function _chr(i)
	{
		if (typeof(i) != "number")
			throw ul4.TypeError.create("chr()", "chr() requires an int");
		return String.fromCharCode(i);
	};

	// Return the codepoint for the one and only character in the string ``c``
	ul4._ord = function _ord(c)
	{
		if (typeof(c) != "string" || c.length != 1)
			throw ul4.TypeError.create("ord()", "ord() requires a string of length 1");
		return c.charCodeAt(0);
	};

	// Convert an integer to a hexadecimal string
	ul4._hex = function _hex(number)
	{
		if (typeof(number) != "number")
			throw ul4.TypeError.create("hex()", "hex() requires an int");
		if (number < 0)
			return "-0x" + number.toString(16).substr(1);
		else
			return "0x" + number.toString(16);
	};

	// Convert an integer to a octal string
	ul4._oct = function _oct(number)
	{
		if (typeof(number) != "number")
			throw ul4.TypeError.create("oct()", "oct() requires an int");
		if (number < 0)
			return "-0o" + number.toString(8).substr(1);
		else
			return "0o" + number.toString(8);
	};

	// Convert an integer to a binary string
	ul4._bin = function _bin(number)
	{
		if (typeof(number) != "number")
			throw ul4.TypeError.create("bin()", "bin() requires an int");
		if (number < 0)
			return "-0b" + number.toString(2).substr(1);
		else
			return "0b" + number.toString(2);
	};

	// Return the minimum value
	ul4._min = function _min(obj)
	{
		if (obj.length == 0)
			throw ul4.ArgumentError.create("min() requires at least 1 argument, 0 given");
		else if (obj.length == 1)
			obj = obj[0];
		let iter = ul4._iter(obj);
		let result;
		let first = true;
		while (true)
		{
			let item = iter.next();
			if (item.done)
			{
				if (first)
					throw ul4.ValueError.create("min() argument is an empty sequence!");
				return result;
			}
			if (first || (item.value < result))
				result = item.value;
			first = false;
		}
	};

	// Return the maximum value
	ul4._max = function _max(obj)
	{
		if (obj.length == 0)
			throw ul4.ArgumentError.create("max() requires at least 1 argument, 0 given");
		else if (obj.length == 1)
			obj = obj[0];
		let iter = ul4._iter(obj);
		let result;
		let first = true;
		while (true)
		{
			let item = iter.next();
			if (item.done)
			{
				if (first)
					throw ul4.ValueError.create("max() argument is an empty sequence!");
				return result;
			}
			if (first || (item.value > result))
				result = item.value;
			first = false;
		}
	};

	// Return the of the values from the iterable starting with ``start`` (default ``0``)
	ul4._sum = function _sum(iterable, start=0)
	{
		for (let iter = ul4._iter(iterable);;)
		{
			let item = iter.next();
			if (item.done)
				break;
			start += item.value;
		}
		return start;
	};

	// Return the first value produced by iterating through ``iterable`` (defaulting to ``defaultValue`` if the iterator is empty)
	ul4._first = function _first(iterable, defaultValue=null)
	{
		let item = ul4._iter(iterable).next();
		return item.done ? defaultValue : item.value;
	};

	// Return the last value produced by iterating through ``iterable`` (defaulting to ``defaultValue`` if the iterator is empty)
	ul4._last = function _last(iterable, defaultValue=null)
	{
		let value = defaultValue;

		for (let iter = ul4._iter(iterable);;)
		{
			let item = iter.next();
			if (item.done)
				break;
			value = item.value;
		}
		return value;
	};

	// Return a sorted version of ``iterable``
	ul4._sorted = function _sorted(context, iterable, key=null, reverse=false)
	{
		if (key === null)
		{
			// FIXME: stability
			let cmp = reverse ? function cmp(a, b)
			{
				return -ul4._cmp("<=>", a, b);
			} : function cmp(a, b)
			{
				return ul4._cmp("<=>", a, b);
			};
			let result = ul4._list(iterable);
			result.sort(cmp);
			return result;
		}
		else
		{
			var sort = [];

			for (var i = 0, iter = ul4._iter(iterable);;++i)
			{
				var item = iter.next();
				if (item.done)
					break;
				var keyvalue = ul4._call(context, key, [item.value], {});
				sort.push([keyvalue, i, item.value]);
			}
			cmp = function cmp(s1, s2)
			{
				let res = ul4._cmp("<=>", s1[0], s2[0]);
				if (res)
					return reverse ? -res : res;
				res = ul4._cmp(s1[1], s2[1]);
				return reverse ? -res : res;
			};

			sort.sort(cmp);

			let result = [];
			for (let i = 0; i < sort.length; ++i)
				result.push(sort[i][2]);
			return result;
		}
	};

	// Return a iterable object iterating from ``start`` upto (but not including) ``stop`` with a step size of ``step``
	ul4._range = function _range(args)
	{
		let start, stop, step;
		if (args.length < 1)
			throw ul4.ArgumentError.create("required range() argument missing");
		else if (args.length > 3)
			throw ul4.ArgumentError.create("range() expects at most 3 positional arguments, " + args.length + " given");
		else if (args.length == 1)
		{
			start = 0;
			stop = args[0];
			step = 1;
		}
		else if (args.length == 2)
		{
			start = args[0];
			stop = args[1];
			step = 1;
		}
		else if (args.length == 3)
		{
			start = args[0];
			stop = args[1];
			step = args[2];
		}
		let lower, higher;
		if (step === 0)
			throw ul4.ValueError.create("range() requires a step argument != 0");
		else if (step > 0)
		{
			lower = start;
			heigher = stop;
		}
		else
		{
			lower = stop;
			heigher = start;
		}
		let length = (lower < heigher) ? Math.floor((heigher - lower - 1)/Math.abs(step)) + 1 : 0;

		return {
			index: 0,
			next: function()
			{
				if (this.index >= length)
					return {done: true};
				return {value: start + (this.index++) * step, done: false};
			}
		};
	};

	// Return a iterable object returning a slice from the argument
	ul4._slice = function _slice(args)
	{
		let iterable, start, stop, step;
		if (args.length < 2)
			throw ul4.ArgumentError.create("required slice() argument missing");
		else if (args.length > 4)
			throw ul4.ArgumentError.create("slice() expects at most 4 positional arguments, " + args.length + " given");
		else if (args.length == 2)
		{
			iterable = args[0];
			start = 0;
			stop = args[1];
			step = 1;
		}
		else if (args.length == 3)
		{
			iterable = args[0];
			start = args[1] !== null ? args[1] : 0;
			stop = args[2];
			step = 1;
		}
		else if (args.length == 4)
		{
			iterable = args[0];
			start = args[1] !== null ? args[1] : 0;
			stop = args[2];
			step = args[3] !== null ? args[3] : 1;
		}
		if (start < 0)
			throw ul4.ValueError.create("slice() requires a start argument >= 0");
		if (stop < 0)
			throw ul4.ValueError.create("slice() requires a stop argument >= 0");
		if (step <= 0)
			throw ul4.ValueError.create("slice() requires a step argument > 0");

		let next = start, count = 0;
		let iter = ul4._iter(iterable);
		return {
			next: function() {
				let result;
				while (count < next)
				{
					result = iter.next();
					if (result.done)
						return result;
					++count;
				}
				if (stop !== null && count >= stop)
					return {done: true};
				result = iter.next();
				if (result.done)
					return result;
				++count;
				next += step;
				if (stop !== null && next > stop)
					next = stop;
				return result;
			}
		};
	};

	// ``%`` escape unsafe characters in the string ``string``
	ul4._urlquote = function _urlquote(string)
	{
		return encodeURIComponent(string);
	};

	// The inverse function of ``urlquote``
	ul4._urlunquote = function _urlunquote(string)
	{
		return decodeURIComponent(string);
	};

	// Return a reverse iterator over ``sequence``
	ul4._reversed = function _reversed(sequence)
	{
		if (typeof(sequence) != "string" && !ul4._islist(sequence)) // We don't have to materialize strings or lists
			sequence = ul4._list(sequence);
		return {
			index: sequence.length-1,
			next: function() {
				return this.index >= 0 ? {value: sequence[this.index--], done: false} : {done: true};
			}
		};
	};

	// Returns a random number in the interval ``[0;1[``
	ul4._random = function _random()
	{
		return Math.random();
	};

	// Return a randomly select item from ``range(start, stop, step)``
	ul4._randrange = function _randrange(args)
	{
		let start, stop, step;
		if (args.length < 1)
			throw ul4.ArgumentError.create("required randrange() argument missing");
		else if (args.length > 3)
			throw ul4.ArgumentError.create("randrange() expects at most 3 positional arguments, " + args.length + " given");
		else if (args.length == 1)
		{
			start = 0;
			stop = args[0];
			step = 1;
		}
		else if (args.length == 2)
		{
			start = args[0];
			stop = args[1];
			step = 1;
		}
		else if (args.length == 3)
		{
			start = args[0];
			stop = args[1];
			step = args[2];
		}
		let width = stop-start;

		let value = Math.random();

		let n;
		if (step > 0)
			n = Math.floor((width + step - 1) / step);
		else if (step < 0)
			n = Math.floor((width + step + 1) / step);
		else
			throw ul4.ValueError.create("randrange() requires a step argument != 0");
		return start + step*Math.floor(value * n);
	};

	// Return a random item/char from the list/string ``sequence``
	ul4._randchoice = function _randchoice(sequence)
	{
		let iscolor = ul4._iscolor(sequence);
		if (typeof(sequence) !== "string" && !ul4._islist(sequence) && !iscolor)
			throw ul4.TypeError.create("randchoice() requires a string or list");
		if (iscolor)
			sequence = ul4._list(sequence);
		return sequence[Math.floor(Math.random() * sequence.length)];
	};

	// Round a number ``x`` to ``digits`` decimal places (may be negative)
	ul4._round = function _round(x, digits=0)
	{
		if (digits)
		{
			let threshhold = Math.pow(10, digits);
			return Math.round(x*threshhold)/threshhold;
		}
		else
			return Math.round(x);
	};

	// Return a hex-encode MD5 hash of the argument
	// This uses the md5 function from https://github.com/blueimp/JavaScript-MD5
	if (iscommon) {
		ul4._md5 = function _md5(string)
		{
			let md5 = require('blueimp-md5');
			return md5(string);
		};
	} else {
		ul4._md5 = function _md5(string)
		{
			return md5(string);
		};
	}

	// Return an iterator over ``[index, item]`` lists from the iterable object ``iterable``. ``index`` starts at ``start`` (defaulting to 0)
	ul4._enumerate = function _enumerate(iterable, start=0)
	{
		return {
			iter: ul4._iter(iterable),
			index: start,
			next: function() {
				let item = this.iter.next();
				return item.done ? item : {value: [this.index++, item.value], done: false};
			}
		};
	};

	// Return an iterator over ``[isfirst, item]`` lists from the iterable object ``iterable`` (``isfirst`` is true for the first item, false otherwise)
	ul4._isfirst = function _isfirst(iterable)
	{
		let iter = ul4._iter(iterable);
		let isfirst = true;
		return {
			next: function() {
				let item = iter.next();
				let result = item.done ? item : {value: [isfirst, item.value], done: false};
				isfirst = false;
				return result;
			}
		};
	};

	// Return an iterator over ``[islast, item]`` lists from the iterable object ``iterable`` (``islast`` is true for the last item, false otherwise)
	ul4._islast = function _islast(iterable)
	{
		let iter = ul4._iter(iterable);
		let lastitem = iter.next();
		return {
			next: function() {
				if (lastitem.done)
					return lastitem;
				let item = iter.next();
				let result = {value: [item.done, lastitem.value], done: false};
				lastitem = item;
				return result;
			}
		};
	};

	// Return an iterator over ``[isfirst, islast, item]`` lists from the iterable object ``iterable`` (``isfirst`` is true for the first item, ``islast`` is true for the last item. Both are false otherwise)
	ul4._isfirstlast = function _isfirstlast(iterable)
	{
		let iter = ul4._iter(iterable);
		let isfirst = true;
		let lastitem = iter.next();
		return {
			next: function() {
				if (lastitem.done)
					return lastitem;
				let item = iter.next();
				let result = {value: [isfirst, item.done, lastitem.value], done: false};
				lastitem = item;
				isfirst = false;
				return result;
			}
		};
	};

	// Return an iterator over ``[index, isfirst, islast, item]`` lists from the iterable object ``iterable`` (``isfirst`` is true for the first item, ``islast`` is true for the last item. Both are false otherwise)
	ul4._enumfl = function _enumfl(iterable, start=0)
	{
		let iter = ul4._iter(iterable);
		let i = start;
		let isfirst = true;
		let lastitem = iter.next();
		return {
			next: function() {
				if (lastitem.done)
					return lastitem;
				let item = iter.next();
				let result = {value: [i++, isfirst, item.done, lastitem.value], done: false};
				lastitem = item;
				isfirst = false;
				return result;
			}
		};
	};

	// Return an iterator over lists, where the i'th list consists of all i'th items from the arguments (terminating when the shortest argument ends)
	ul4._zip = function _zip(iterables)
	{
		let result;
		if (iterables.length)
		{
			let iters = [];
			for (let i = 0; i < iterables.length; ++i)
				iters.push(ul4._iter(iterables[i]));

			return {
				next: function() {
					let items = [];
					for (let i = 0; i < iters.length; ++i)
					{
						let item = iters[i].next();
						if (item.done)
							return item;
						items.push(item.value);
					}
					return {value: items, done: false};
				}
			};
		}
		else
		{
			return {
				next: function() {
					return {done: true};
				}
			};
		}
	};

	// Return the absolute value for the number ``number``
	ul4._abs = function _abs(number)
	{
		if (number !== null && typeof(number.__abs__) === "function")
			return number.__abs__();
		return Math.abs(number);
	};

	// Return a ``Date`` object from the arguments passed in
	ul4._date = function _date(year, month, day, hour=0, minute=0, second=0, microsecond=0)
	{
		return new Date(year, month-1, day, hour, minute, second, microsecond/1000);
	};

	// Return a ``TimeDelta`` object from the arguments passed in
	ul4._timedelta = function _timedelta(days=0, seconds=0, microseconds=0)
	{
		return this.TimeDelta.create(days, seconds, microseconds);
	};

	// Return a ``MonthDelta`` object from the arguments passed in
	ul4._monthdelta = function _monthdelta(months=0)
	{
		return this.MonthDelta.create(months);
	};

	// Return a ``Color`` object from the hue, luminescence, saturation and alpha values ``h``, ``l``, ``s`` and ``a`` (i.e. using the HLS color model)
	ul4._hls = function _hls(h, l, s, a)
	{
		let _v = function(m1, m2, hue)
		{
			hue = hue % 1.0;
			if (hue < 1/6)
				return m1 + (m2-m1)*hue*6.0;
			else if (hue < 0.5)
				return m2;
			else if (hue < 2/3)
				return m1 + (m2-m1)*(2/3-hue)*6.0;
			return m1;
		};

		let m1, m2;
		if (typeof(a) === "undefined")
			a = 1;
		if (s === 0.0)
			return ul4._rgb(l, l, l, a);
		if (l <= 0.5)
			m2 = l * (1.0+s);
		else
			m2 = l+s-(l*s);
		m1 = 2.0*l - m2;
		return ul4._rgb(_v(m1, m2, h+1/3), _v(m1, m2, h), _v(m1, m2, h-1/3), a);
	};

	// Return a ``Color`` object from the hue, saturation, value and alpha values ``h``, ``s``, ``v`` and ``a`` (i.e. using the HSV color model)
	ul4._hsv = function _hsv(h, s, v, a)
	{
		if (s === 0.0)
			return ul4._rgb(v, v, v, a);
		let i = Math.floor(h*6.0);
		let f = (h*6.0) - i;
		let p = v*(1.0 - s);
		let q = v*(1.0 - s*f);
		let t = v*(1.0 - s*(1.0-f));
		switch (i%6)
		{
			case 0:
				return ul4._rgb(v, t, p, a);
			case 1:
				return ul4._rgb(q, v, p, a);
			case 2:
				return ul4._rgb(p, v, t, a);
			case 3:
				return ul4._rgb(p, q, v, a);
			case 4:
				return ul4._rgb(t, p, v, a);
			case 5:
				return ul4._rgb(v, p, q, a);
		}
	};

	// Return the item with the key ``key`` from the dict ``container``. If ``container`` doesn't have this key, return ``defaultvalue``
	ul4._get = function _get(container, key, defaultvalue)
	{
		if (ul4._ismap(container))
		{
			if (container.has(key))
				return container.get(key);
			return defaultvalue;
		}
		else if (ul4._isobject(container))
		{
			var result = container[key];
			if (typeof(result) === "undefined")
				return defaultvalue;
			return result;
		}
		throw ul4.TypeError.create("get()", "get() requires a dict");
	};

	// Return a ``Date`` object for the current time
	ul4.now = function now()
	{
		return new Date();
	};

	// Return a ``Date`` object for the current time in UTC
	ul4.utcnow = function utcnow()
	{
		var now = new Date();
		// FIXME: The timezone is wrong for the new ``Date`` object.
		return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
	};

	ul4.functions = {
		repr: ul4.expose(["obj"], {name: "repr"}, ul4._repr),
		ascii: ul4.expose(["obj"], {name: "ascii"}, ul4._ascii),
		str: ul4.expose(["obj=", ""], {name: "str"}, ul4._str),
		int: ul4.expose(["obj=", 0, "base=", null], {name: "int"}, ul4._int),
		float: ul4.expose(["obj=", 0.0], {name: "float"}, ul4._float),
		list: ul4.expose(["iterable=", []], {name: "list"}, ul4._list),
		set: ul4.expose(["iterable=", []], {name: "set"}, ul4._set),
		bool: ul4.expose(["obj=", false], {name: "bool"}, ul4._bool),
		len: ul4.expose(["sequence"], {name: "len"}, ul4._len),
		type: ul4.expose(["obj"], {name: "type"}, ul4._type),
		format: ul4.expose(["obj", "fmt", "lang=", null], {name: "format"}, ul4._format),
		any: ul4.expose(["iterable"], {name: "any"}, ul4._any),
		all: ul4.expose(["iterable"], {name: "all"}, ul4._all),
		zip: ul4.expose(["*iterables"], {name: "zip"}, ul4._zip),
		getattr: ul4.expose(["obj", "attrname", "default=", null], {name: "getattr"}, ul4._getattr),
		hasattr: ul4.expose(["obj", "attrname"], {name: "hasattr"}, ul4._hasattr),
		dir: ul4.expose(["obj"], {name: "dir"}, ul4._dir),
		isundefined: ul4.expose(["obj"], {name: "isundefined"}, ul4._isundefined),
		isdefined: ul4.expose(["obj"], {name: "isdefined"}, ul4._isdefined),
		isnone: ul4.expose(["obj"], {name: "isnone"}, ul4._isnone),
		isbool: ul4.expose(["obj"], {name: "isbool"}, ul4._isbool),
		isint: ul4.expose(["obj"], {name: "isint"}, ul4._isint),
		isfloat: ul4.expose(["obj"], {name: "isfloat"}, ul4._isfloat),
		isstr: ul4.expose(["obj"], {name: "isstr"}, ul4._isstr),
		isdate: ul4.expose(["obj"], {name: "isdate"}, ul4._isdate),
		iscolor: ul4.expose(["obj"], {name: "iscolor"}, ul4._iscolor),
		istimedelta: ul4.expose(["obj"], {name: "istimedelta"}, ul4._istimedelta),
		ismonthdelta: ul4.expose(["obj"], {name: "ismonthdelta"}, ul4._ismonthdelta),
		istemplate: ul4.expose(["obj"], {name: "istemplate"}, ul4._istemplate),
		isfunction: ul4.expose(["obj"], {name: "isfunction"}, ul4._isfunction),
		islist: ul4.expose(["obj"], {name: "islist"}, ul4._islist),
		isset: ul4.expose(["obj"], {name: "isset"}, ul4on._haveset ? ul4._isset : ul4._isul4set),
		isdict: ul4.expose(["obj"], {name: "isdict"}, ul4._isdict),
		isexception: ul4.expose(["obj"], {name: "isexception"}, ul4._isexception),
		asjson: ul4.expose(["obj"], {name: "asjson"}, ul4._asjson),
		fromjson: ul4.expose(["string"], {name: "fromjson"}, ul4._fromjson),
		asul4on: ul4.expose(["obj"], {name: "asul4on"}, ul4._asul4on),
		fromul4on: ul4.expose(["string"], {name: "fromul4on"}, ul4._fromul4on),
		now: ul4.expose([], ul4.now),
		utcnow: ul4.expose([], ul4.utcnow),
		enumerate: ul4.expose(["iterable", "start=", 0], {name: "enumerate"}, ul4._enumerate),
		isfirst: ul4.expose(["iterable"], {name: "isfirst"}, ul4._isfirst),
		islast: ul4.expose(["iterable"], {name: "islast"}, ul4._islast),
		isfirstlast: ul4.expose(["iterable"], {name: "isfirstlast"}, ul4._isfirstlast),
		enumfl: ul4.expose(["iterable", "start=", 0], {name: "enumfl"}, ul4._enumfl),
		abs: ul4.expose(["number"], {name: "abs"}, ul4._abs),
		date: ul4.expose(["year", "month", "day", "hour=", 0, "minute=", 0, "second=", 0, "microsecond=", 0], {name: "date"}, ul4._date),
		timedelta: ul4.expose(["days=", 0, "seconds=", 0, "microseconds=", 0], {name: "timedelta"}, ul4._timedelta),
		monthdelta: ul4.expose(["months=", 0], {name: "monthdelta"}, ul4._monthdelta),
		rgb: ul4.expose(["r", "g", "b", "a=", 1.0], {name: "rgb"}, ul4._rgb),
		hls: ul4.expose(["h", "l", "s", "a=", 1.0], {name: "hls"}, ul4._hls),
		hsv: ul4.expose(["h", "s", "v", "a=", 1.0], {name: "hsv"}, ul4._hsv),
		xmlescape: ul4.expose(["obj"], {name: "xmlescape"}, ul4._xmlescape),
		csv: ul4.expose(["obj"], {name: "csv"}, ul4._csv),
		chr: ul4.expose(["i"], {name: "chr"}, ul4._chr),
		ord: ul4.expose(["c"], {name: "ord"}, ul4._ord),
		hex: ul4.expose(["number"], {name: "hex"}, ul4._hex),
		oct: ul4.expose(["number"], {name: "oct"}, ul4._oct),
		bin: ul4.expose(["number"], {name: "bin"}, ul4._bin),
		min: ul4.expose(["*obj"], {name: "min"}, ul4._min),
		max: ul4.expose(["*obj"], {name: "max"}, ul4._max),
		sum: ul4.expose(["iterable", "start=", 0], {name: "sum"}, ul4._sum),
		first: ul4.expose(["iterable", "default=", null], {name: "first"}, ul4._first),
		last: ul4.expose(["iterable", "default=", null], {name: "last"}, ul4._last),
		sorted: ul4.expose(["iterable", "key=", null, "reverse=", false], {name: "sorted", needscontext: true}, ul4._sorted),
		range: ul4.expose(["*args"], {name: "range"}, ul4._range),
		slice: ul4.expose(["*args"], {name: "slice"}, ul4._slice),
		urlquote: ul4.expose(["string"], {name: "urlquote"}, ul4._urlquote),
		urlunquote: ul4.expose(["string"], {name: "urlunquote"}, ul4._urlunquote),
		reversed: ul4.expose(["sequence"], {name: "reversed"}, ul4._reversed),
		random: ul4.expose([], {name: "random"}, ul4._random),
		randrange: ul4.expose(["*args"], {name: "randrange"}, ul4._randrange),
		randchoice: ul4.expose(["sequence"], {name: "randchoice"}, ul4._randchoice),
		round: ul4.expose(["x", "digit=", 0], {name: "round"}, ul4._round),
		md5: ul4.expose(["string"], {name: "md5"}, ul4._md5)
	};

	// Functions implementing UL4 methods
	ul4._replace = function _replace(string, old, new_, count=null)
	{
		if (count === null)
			count = string.length;

		let result = [];
		while (string.length)
		{
			let pos = string.indexOf(old);
			if (pos === -1 || !count--)
			{
				result.push(string);
				break;
			}
			result.push(string.substr(0, pos));
			result.push(new_);
			string = string.substr(pos + old.length);
		}
		return result.join("");
	};

	ul4._strip = function _strip(string, chars=null)
	{
		chars = chars || " \r\n\t";
		if (typeof(chars) !== "string")
			throw ul4.TypeError.create("strip()", "strip() requires two strings");

		while (string && chars.indexOf(string[0]) >= 0)
			string = string.substr(1);
		while (string && chars.indexOf(string[string.length-1]) >= 0)
			string = string.substr(0, string.length-1);
		return string;
	};

	ul4._lstrip = function _lstrip(string, chars=null)
	{
		chars = chars || " \r\n\t";
		if (typeof(chars) !== "string")
			throw ul4.TypeError.create("lstrip()", "lstrip() requires two strings");

		while (string && chars.indexOf(string[0]) >= 0)
			string = string.substr(1);
		return string;
	};

	ul4._rstrip = function _rstrip(string, chars=null)
	{
		chars = chars || " \r\n\t";
		if (typeof(chars) !== "string")
			throw ul4.TypeError.create("rstrip()", "rstrip() requires two strings");

		while (string && chars.indexOf(string[string.length-1]) >= 0)
			string = string.substr(0, string.length-1);
		return string;
	};

	ul4._split = function _split(string, sep=null, count=null)
	{
		if (sep !== null && typeof(sep) !== "string")
			throw ul4.TypeError.create("split()", "split() requires a string");

		if (count === null)
		{
			let result = string.split(sep !== null ? sep : /[ \n\r\t]+/);
			if (sep === null)
			{
				if (result.length && !result[0].length)
					result.splice(0, 1);
				if (result.length && !result[result.length-1].length)
					result.splice(-1);
			}
			return result;
		}
		else
		{
			if (sep !== null)
			{
				let result = [];
				while (string.length)
				{
					let pos = string.indexOf(sep);
					if (pos === -1 || !count--)
					{
						result.push(string);
						break;
					}
					result.push(string.substr(0, pos));
					string = string.substr(pos + sep.length);
				}
				return result;
			}
			else
			{
				let result = [];
				while (string.length)
				{
					string = ul4._lstrip(string, null);
					let part;
					if (!count--)
						 part = string; // Take the rest of the string
					else
						part = string.split(/[ \n\r\t]+/, 1)[0];
					if (part.length)
						result.push(part);
					string = string.substr(part.length);
				}
				return result;
			}
		}
	};

	ul4._rsplit = function _rsplit(string, sep=null, count=null)
	{
		if (sep !== null && typeof(sep) !== "string")
			throw ul4.TypeError.create("rsplit()", "rsplit() requires a string as second argument");

		if (count === null)
		{
			let result = string.split(sep !== null ? sep : /[ \n\r\t]+/);
			if (sep === null)
			{
				if (result.length && !result[0].length)
					result.splice(0, 1);
				if (result.length && !result[result.length-1].length)
					result.splice(-1);
			}
			return result;
		}
		else
		{
			if (sep !== null)
			{
				let result = [];
				while (string.length)
				{
					let pos = string.lastIndexOf(sep);
					if (pos === -1 || !count--)
					{
						result.unshift(string);
						break;
					}
					result.unshift(string.substr(pos+sep.length));
					string = string.substr(0, pos);
				}
				return result;
			}
			else
			{
				let result = [];
				while (string.length)
				{
					string = ul4._rstrip(string);
					let part;
					if (!count--)
						 part = string; // Take the rest of the string
					else
					{
						part = string.split(/[ \n\r\t]+/);
						part = part[part.length-1];
					}
					if (part.length)
						result.unshift(part);
					string = string.substr(0, string.length-part.length);
				}
				return result;
			}
		}
	};

	ul4._splitlines = function _splitlines(string, keepends=false)
	{
		let pos = 0;
		let lookingAtLineEnd = function lookingAtLineEnd()
		{
			let c = string[pos];
			if (c === '\n' || c == '\u000B' || c == '\u000C' || c == '\u001C' || c == '\u001D' || c == '\u001E' || c == '\u0085' || c == '\u2028' || c == '\u2029')
				return 1;
			if (c === '\r')
			{
				if (pos == length-1)
					return 1;
				if (string[pos+1] === '\n')
					return 2;
				return 1;
			}
			return 0;
		};

		let result = [], length = string.length;

		for (pos = 0, startpos = 0;;)
		{
			if (pos >= length)
			{
				if (startpos != pos)
					result.push(string.substring(startpos));
				return result;
			}
			let lineendlen = lookingAtLineEnd();
			if (!lineendlen)
				++pos;
			else
			{
				let endpos = pos + (keepends ? lineendlen : 0);
				result.push(string.substring(startpos, endpos));
				pos += lineendlen;
				startpos = pos;
			}
		}
	};

	ul4._count = function _count(obj, sub, start=null, end=null)
	{
		if (start < 0)
			start += obj.length;
		if (start === null)
			start = 0;

		if (end < 0)
			end += obj.length;
		if (end === null)
			end = obj.length;

		let isstr = ul4._isstr(obj);

		if (isstr && !sub.length)
		{
			if (end < 0 || start > obj.length || start > end)
				return 0;
			let result = end - start + 1;
			if (result > obj.length + 1)
				result = obj.length + 1;
			return result;
		}

		start = ul4._bound(start, obj.length);
		end = ul4._bound(end, obj.length);

		let count = 0;
		if (ul4._islist(obj))
		{
			for (let i = start; i < end; ++i)
			{
				if (ul4._eq(obj[i], sub))
					++count;
			}
			return count;
		}
		else // string
		{
			let lastIndex = start;

			for (;;)
			{
				lastIndex = obj.indexOf(sub, lastIndex);
				if (lastIndex == -1)
					break;
				if (lastIndex + sub.length > end)
					break;
				++count;
				lastIndex += sub.length;
			}
			return count;
		}
	};

	ul4._find = function _find(obj, sub, start=null, end=null)
	{
		if (start < 0)
			start += obj.length;
		if (start === null)
			start = 0;
		if (end < 0)
			end += obj.length;
		if (end === null)
			end = obj.length;
		start = ul4._bound(start, obj.length);
		end = ul4._bound(end, obj.length);

		if (start !== 0 || end !== obj.length)
		{
			if (typeof(obj) == "string")
				obj = obj.substring(start, end);
			else
				obj = obj.slice(start, end);
		}
		let result = obj.indexOf(sub);
		if (result !== -1)
			result += start;
		return result;
	};

	ul4._rfind = function _rfind(obj, sub, start=null, end=null)
	{
		if (start < 0)
			start += obj.length;
		if (start === null)
			start = 0;
		if (end < 0)
			end += obj.length;
		if (end === null)
			end = obj.length;
		start = ul4._bound(start, obj.length);
		end = ul4._bound(end, obj.length);

		if (start !== 0 || end !== obj.length)
		{
			if (typeof(obj) == "string")
				obj = obj.substring(start, end);
			else
				obj = obj.slice(start, end);
		}
		let result = obj.lastIndexOf(sub);
		if (result !== -1)
			result += start;
		return result;
	};

	ul4._capitalize = function _capitalize(obj)
	{
		if (typeof(obj) != "string")
			throw ul4.TypeError.create("capitalize()", "capitalize() requires a string");

		if (obj.length)
			obj = obj[0].toUpperCase() + obj.slice(1).toLowerCase();
		return obj;
	};

	ul4._items = function _items(obj)
	{
		if (ul4._ismap(obj))
		{
			let result = [];
			obj.forEach(function(value, key){
				result.push([key, value]);
			});
			return result;
		}
		else if (ul4._isobject(obj))
		{
			let result = [];
			for (let key in obj)
				result.push([key, obj[key]]);
			return result;
		}
		throw ul4.TypeError.create("items()", "items() requires a dict");
	};

	ul4._values = function _values(obj)
	{
		if (ul4._ismap(obj))
		{
			let result = [];
			obj.forEach(function(value, key){
				result.push(value);
			});
			return result;
		}
		else if (ul4._isobject(obj))
		{
			let result = [];
			for (let key in obj)
				result.push(obj[key]);
			return result;
		}
		throw ul4.TypeError.create("values()", "values() requires a dict");
	};

	ul4._join = function _join(sep, iterable)
	{
		let resultlist = [];
		for (let iter = ul4._iter(iterable);;)
		{
			let item = iter.next();
			if (item.done)
				break;
			resultlist.push(item.value);
		}
		return resultlist.join(sep);
	};

	ul4._startswith = function _startswith(string, prefix)
	{
		if (typeof(prefix) === "string")
			return string.substr(0, prefix.length) === prefix;
		else if (ul4._islist(prefix))
		{
			for (let i = 0; i < prefix.length; ++i)
			{
				let singlepre = prefix[i];
				if (string.substr(0, singlepre.length) === singlepre)
					return true;
			}
			return false;
		}
		else
			throw ul4.TypeError.create("startswith()", "startswith() argument must be string");

	};

	ul4._endswith = function _endswith(string, suffix)
	{
		if (typeof(suffix) === "string")
			return string.substr(string.length-suffix.length) === suffix;
		else if (ul4._islist(suffix))
		{
			for (let i = 0; i < suffix.length; ++i)
			{
				let singlesuf = suffix[i];
				if (string.substr(string.length-singlesuf.length) === singlesuf)
					return true;
			}
			return false;
		}
		else
			throw ul4.TypeError.create("endswith()", "endswith() argument must be string or list of strings");

	};

	ul4._isoformat = function _isoformat(obj)
	{
		if (!ul4._isdate(obj))
			throw ul4.TypeError.create("isoformat()", "isoformat() requires a date");

		let result = obj.getFullYear() + "-" + ul4._lpad((obj.getMonth()+1).toString(), "0", 2) + "-" + ul4._lpad(obj.getDate().toString(), "0", 2);
		let hour = obj.getHours();
		let minute = obj.getMinutes();
		let second = obj.getSeconds();
		let ms = obj.getMilliseconds();
		if (hour || minute || second || ms)
		{
			result += "T" + ul4._lpad(hour.toString(), "0", 2) + ":" + ul4._lpad(minute.toString(), "0", 2) + ":" + ul4._lpad(second.toString(), "0", 2);
			if (ms)
				result += "." + ul4._lpad(ms.toString(), "0", 3) + "000";
		}
		return result;
	};

	ul4._mimeformat = function _mimeformat(obj)
	{
		let weekdayname = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		let monthname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		return weekdayname[ul4._weekday(obj)] + ", " + ul4._lpad(obj.getDate(), "0", 2) + " " + monthname[obj.getMonth()] + " " + obj.getFullYear() + " " + ul4._lpad(obj.getHours(), "0", 2) + ":" + ul4._lpad(obj.getMinutes(), "0", 2) + ":" + ul4._lpad(obj.getSeconds(), "0", 2) + " GMT";
	};

	ul4._weekday = function _weekday(obj)
	{
		let d = obj.getDay();
		return d ? d-1 : 6;
	};

	ul4._week = function _week(obj, firstweekday=null)
	{
		if (firstweekday === null)
			firstweekday = 0;
		else
			firstweekday %= 7;

		let yearday = ul4._yearday(obj)+6;
		let jan1 = new Date(obj.getFullYear(), 0, 1);
		let jan1weekday = jan1.getDay();
		if (--jan1weekday < 0)
			jan1weekday = 6;

		while (jan1weekday != firstweekday)
		{
			--yearday;
			if (++jan1weekday == 7)
				jan1weekday = 0;
		}
		return Math.floor(yearday/7);
	};

	ul4._isleap = function _isleap(obj)
	{
		return new Date(obj.getFullYear(), 1, 29).getMonth() === 1;
	};

	ul4._yearday = function _yearday(obj)
	{
		let leap = ul4._isleap(obj) ? 1 : 0;
		let day = obj.getDate();
		switch (obj.getMonth())
		{
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
	};

	ul4._append = function _append(obj, ...items)
	{
		for (let i = 0; i < items.length; ++i)
			obj.push(items[i]);
		return null;
	};

	ul4._insert = function _insert(obj, pos, ...items)
	{
		if (pos < 0)
			pos += obj.length;

		for (let i = 0; i < items.length; ++i)
			obj.splice(pos++, 0, items[i]);
		return null;
	};

	ul4._pop = function _pop(obj, pos)
	{
		if (pos < 0)
			pos += obj.length;

		let result = obj[pos];
		obj.splice(pos, 1);
		return result;
	};

	ul4._update = function _update(obj, others, kwargs)
	{
		if (!ul4._isdict(obj))
			throw ul4.TypeError.create("update()", "update() requires a dict");
		for (let i = 0; i < others.length; ++i)
		{
			let other = others[i];
			if (ul4._ismap(other))
			{
				other.forEach(function(value, key){
					ul4on._setmap(obj, key, value);
				});
			}
			else if (ul4._isobject(other))
			{
				for (let key in other)
					ul4on._setmap(obj, key, other[key]);
			}
			else if (ul4._islist(other))
			{
				for (let j = 0; j < other.length; ++j)
				{
					if (!ul4._islist(other[j]) || (other[j].length != 2))
						throw ul4.TypeError.create("update()", "update() requires a dict or a list of (key, value) pairs");
					ul4on._setmap(obj, other[j][0], other[j][1]);
				}
			}
			else
				throw ul4.TypeError.create("update()", "update() requires a dict or a list of (key, value) pairs");
		}
		kwargs.forEach(function(value, key) {
			ul4on._setmap(obj, key, value);
		});
		return null;
	};

	ul4._clear = function _clear(obj)
	{
		if (ul4._ismap(obj))
			obj.clear();
		else if (ul4._isset(obj))
			obj.clear();
		else if (ul4._isobject(obj))
		{
			for (let key in obj)
				delete obj[key];
		}
		else
			throw ul4.TypeError.create("clear()", "clear() requires a dict or set");
		return null;
	};

	ul4.Color = ul4._inherit(
		ul4.Proto,
		{
			__type__: "ul4.Color",

			create: function create(r=0, g=0, b=0, a=255)
			{
				let c = ul4._clone(this);
				c._r = r;
				c._g = g;
				c._b = b;
				c._a = a;
				return c;
			},

			__repr__: function __repr__()
			{
				let r = ul4._lpad(this._r.toString(16), "0", 2);
				let g = ul4._lpad(this._g.toString(16), "0", 2);
				let b = ul4._lpad(this._b.toString(16), "0", 2);
				let a = ul4._lpad(this._a.toString(16), "0", 2);
				if (this._a !== 0xff)
				{
					if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1] && a[0] === a[1])
						return "#" + r[0] + g[0] + b[0] + a[0];
					else
						return "#" + r + g + b + a;
				}
				else
				{
					if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1])
						return "#" + r[0] + g[0] + b[0];
					else
						return "#" + r + g + b;
				}
			},

			__str__: function __str__()
			{
				if (this._a !== 0xff)
				{
					return "rgba(" + this._r + ", " + this._g + ", " + this._b + ", " + (this._a/255) + ")";
				}
				else
				{
					let r = ul4._lpad(this._r.toString(16), "0", 2);
					let g = ul4._lpad(this._g.toString(16), "0", 2);
					let b = ul4._lpad(this._b.toString(16), "0", 2);
					let a = ul4._lpad(this._a.toString(16), "0", 2);
					if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1])
						return "#" + r[0] + g[0] + b[0];
					else
						return "#" + r + g + b;
				}
			},

			__iter__: function __iter__()
			{
				return {
					obj: this,
					index: 0,
					next: function() {
						if (this.index == 0)
						{
							++this.index;
							return {value: this.obj._r, done: false};
						}
						else if (this.index == 1)
						{
							++this.index;
							return {value: this.obj._g, done: false};
						}
						else if (this.index == 2)
						{
							++this.index;
							return {value: this.obj._b, done: false};
						}
						else if (this.index == 3)
						{
							++this.index;
							return {value: this.obj._a, done: false};
						}
						else
							return {done: true};
					}
				};
			},

			__getattr__: function __getattr__(attrname)
			{
				let self = this;
				switch (attrname)
				{
					case "r":
						return ul4.expose([], function r(){ return self._r; });
					case "g":
						return ul4.expose([], function g(){ return self._g; });
					case "b":
						return ul4.expose([], function b(){ return self._b; });
					case "a":
						return ul4.expose([], function a(){ return self._a; });
					case "lum":
						return ul4.expose([], function lum(){ return self.lum(); });
					case "hls":
						return ul4.expose([], function hls(){ return self.hls(); });
					case "hlsa":
						return ul4.expose([], function hlsa(){ return self.hlsa(); });
					case "hsv":
						return ul4.expose([], function hsv(){ return self.hsv(); });
					case "hsva":
						return ul4.expose([], function hsva(){ return self.hsva(); });
					case "witha":
						return ul4.expose(["a"], function witha(a){ return self.witha(a); });
					case "withlum":
						return ul4.expose(["lum"], function withlum(lum){ return self.withlum(lum); });
					case "abslum":
						return ul4.expose(["lum"], function abslum(lum){ return self.abslum(lum); });
					case "rellum":
						return ul4.expose(["lum"], function rellum(lum){ return self.rellum(lum); });
					default:
						throw ul4.AttributeError.create(this, attrname);
				}
			},

			__getitem__: function __getitem__(key)
			{
				let orgkey = key;
				if (key < 0)
					key += 4;
				switch (key)
				{
					case 0:
						return this._r;
					case 1:
						return this._g;
					case 2:
						return this._b;
					case 3:
						return this._a;
					default:
						return undefined;
				}
			},

			__eq__: function __eq__(other)
			{
				if (ul4._iscolor(other))
					return this._r == other._r && this._g == other._g && this._b == other._b && this._a == other._a;
				return false;
			},

			r: ul4.expose([], function r() { return this._r; }),

			g: ul4.expose([], function g() { return this._g; }),

			b: ul4.expose([], function b() { return this._b; }),

			a: ul4.expose([], function a() { return this._a; }),

			lum: ul4.expose([], function lum() {return this.hls()[1]; }),

			hls: ul4.expose([],
				function hls()
				{
					let r = this._r/255.0;
					let g = this._g/255.0;
					let b = this._b/255.0;
					let maxc = Math.max(r, g, b);
					let minc = Math.min(r, g, b);
					let h, l, s;
					let rc, gc, bc;

					l = (minc+maxc)/2.0;
					if (minc == maxc)
						return [0.0, l, 0.0];
					if (l <= 0.5)
						s = (maxc-minc) / (maxc+minc);
					else
						s = (maxc-minc) / (2.0-maxc-minc);
					rc = (maxc-r) / (maxc-minc);
					gc = (maxc-g) / (maxc-minc);
					bc = (maxc-b) / (maxc-minc);
					if (r == maxc)
						h = bc-gc;
					else if (g == maxc)
						h = 2.0+rc-bc;
					else
						h = 4.0+gc-rc;
					h = (h/6.0) % 1.0;
					return [h, l, s];
				}
			),

			hlsa: ul4.expose([],
				function hlsa()
				{
					let hls = this.hls();
					return hls.concat(this._a/255.0);
				}
			),

			hsv: ul4.expose([],
				function hsv()
				{
					let r = this._r/255.0;
					let g = this._g/255.0;
					let b = this._b/255.0;
					let maxc = Math.max(r, g, b);
					let minc = Math.min(r, g, b);
					let v = maxc;
					if (minc == maxc)
						return [0.0, 0.0, v];
					let s = (maxc-minc) / maxc;
					let rc = (maxc-r) / (maxc-minc);
					let gc = (maxc-g) / (maxc-minc);
					let bc = (maxc-b) / (maxc-minc);
					let h;
					if (r == maxc)
						h = bc-gc;
					else if (g == maxc)
						h = 2.0+rc-bc;
					else
						h = 4.0+gc-rc;
					h = (h/6.0) % 1.0;
					return [h, s, v];
				}
			),

			hsva: ul4.expose([],
				function hsva()
				{
					var hsv = this.hsv();
					return hsv.concat(this._a/255.0);
				}
			),

			witha: ul4.expose(["a"],
				function witha(a)
				{
					if (typeof(a) !== "number")
						throw ul4.TypeError.create("witha()", "witha() requires a number");
					return ul4.Color.create(this._r, this._g, this._b, a);
				}
			),

			withlum: ul4.expose(["lum"],
				function withlum(lum)
				{
					if (typeof(lum) !== "number")
						throw ul4.TypeError.create("witha()", "witha() requires a number");
					let hlsa = this.hlsa();
					return ul4._hls(hlsa[0], lum, hlsa[2], hlsa[3]);
				}
			)
		}
	);

	ul4.TimeDelta = ul4._inherit(
		ul4.Proto,
		{
			__type__: "ul4.TimeDelta",

			create: function create(days=0, seconds=0, microseconds=0)
			{
				let td = ul4._clone(this);
				let total_microseconds = Math.floor((days * 86400 + seconds)*1000000 + microseconds);

				microseconds = ul4.ModAST._do(total_microseconds, 1000000);
				let total_seconds = Math.floor(total_microseconds / 1000000);
				seconds = ul4.ModAST._do(total_seconds, 86400);
				days = Math.floor(total_seconds / 86400);
				if (seconds < 0)
				{
					seconds += 86400;
					--days;
				}

				td._microseconds = microseconds;
				td._seconds = seconds;
				td._days = days;

				return td;
			},

			__repr__: function __repr__()
			{
				if (!this._microseconds)
				{
					if (!this._seconds)
					{
						if (!this._days)
							return "timedelta()";
						return "timedelta(" + this._days + ")";
					}
					return "timedelta(" + this._days + ", " + this._seconds + ")";
				}
				return "timedelta(" + this._days + ", " + this._seconds + ", " + this._microseconds + ")";
			},

			__str__: function __str__()
			{
				let v = [];
				if (this._days)
				{
					v.push(this._days + " day");
					if (this._days !== -1 && this._days !== 1)
						v.push("s");
					v.push(", ");
				}
				let seconds = this._seconds % 60;
				let minutes = Math.floor(this._seconds / 60);
				let hours = Math.floor(minutes / 60);
				minutes = minutes % 60;

				v.push("" + hours);
				v.push(":");
				v.push(ul4._lpad(minutes.toString(), "0", 2));
				v.push(":");
				v.push(ul4._lpad(seconds.toString(), "0", 2));
				if (this._microseconds)
				{
					v.push(".");
					v.push(ul4._lpad(this._microseconds.toString(), "0", 6));
				}
				return v.join("");
			},

			__bool__: function __bool__()
			{
				return this._days !== 0 || this._seconds !== 0 || this._microseconds !== 0;
			},

			__abs__: function __abs__()
			{
				return this._days < 0 ? ul4.TimeDelta.create(-this._days, -this._seconds, -this._microseconds) : this;
			},

			__eq__: function __eq__(other)
			{
				if (ul4._istimedelta(other))
					return (this._days === other._days) && (this._seconds === other._seconds) && (this._microseconds === other._microseconds);
				return false;
			},

			__lt__: function __lt__(other)
			{
				if (ul4._istimedelta(other))
				{
					if (this._days != other._days)
						return this._days < other._days;
					if (this._seconds != other._seconds)
						return this._seconds < other._seconds;
					return this._microseconds < other._microseconds;
				}
				ul4._unorderable("<", this, other);
			},

			__le__: function __le__(other)
			{
				if (ul4._istimedelta(other))
				{
					if (this._days != other._days)
						return this._days < other._days;
					if (this._seconds != other._seconds)
						return this._seconds < other._seconds;
					return this._microseconds <= other._microseconds;
				}
				ul4._unorderable("<=", this, other);
			},

			__gt__: function __gt__(other)
			{
				if (ul4._istimedelta(other))
				{
					if (this._days != other._days)
						return this._days > other._days;
					if (this._seconds != other._seconds)
						return this._seconds > other._seconds;
					return this._microseconds > other._microseconds;
				}
				ul4._unorderable(">", this, other);
			},

			__ge__: function __ge__(other)
			{
				if (ul4._istimedelta(other))
				{
					if (this._days != other._days)
						return this._days > other._days;
					if (this._seconds != other._seconds)
						return this._seconds > other._seconds;
					return this._microseconds >= other._microseconds;
				}
				ul4._unorderable(">=", this, other);
			},

			__neg__: function __neg__()
			{
				return ul4.TimeDelta.create(-this._days, -this._seconds, -this._microseconds);
			},

			_add: function _add(date, days, seconds, microseconds)
			{
				let year = date.getFullYear();
				let month = date.getMonth();
				let day = date.getDate() + days;
				let hour = date.getHours();
				let minute = date.getMinutes();
				let second = date.getSeconds() + seconds;
				let millisecond = date.getMilliseconds() + microseconds/1000;
				return new Date(year, month, day, hour, minute, second, millisecond);
			},

			__add__: function __add__(other)
			{
				if (ul4._istimedelta(other))
					return ul4.TimeDelta.create(this._days + other._days, this._seconds + other._seconds, this._microseconds + other._microseconds);
				else if (ul4._isdate(other))
					return this._add(other, this._days, this._seconds, this._microseconds);
				throw ul4.TypeError.create("+", ul4._type(this) + " + " + ul4._type(other) + " not supported");
			},

			__radd__: function __radd__(other)
			{
				if (ul4._isdate(other))
					return this._add(other, this._days, this._seconds, this._microseconds);
				throw ul4.TypeError.create("+", ul4._type(this) + " + " + ul4._type(other) + " not supported");
			},

			__sub__: function __sub__(other)
			{
				if (ul4._istimedelta(other))
					return ul4.TimeDelta.create(this._days - other._days, this._seconds - other._seconds, this._microseconds - other._microseconds);
				throw ul4.TypeError.create("-", ul4._type(this) + " - " + ul4._type(other) + " not supported");
			},

			__rsub__: function __rsub__(other)
			{
				if (ul4._isdate(other))
					return this._add(other, -this._days, -this._seconds, -this._microseconds);
				throw ul4.TypeError.create("-", ul4._type(this) + " - " + ul4._type(other) + " not supported");
			},

			__mul__: function __mul__(other)
			{
				if (typeof(other) === "number")
				{
					return ul4.TimeDelta.create(this._days * other, this._seconds * other, this._microseconds * other);
				}
				throw ul4.TypeError.create("*", ul4._type(this) + " * " + ul4._type(other) + " not supported");
			},

			__rmul__: function __rmul__(other)
			{
				if (typeof(other) === "number")
				{
					return ul4.TimeDelta.create(this._days * other, this._seconds * other, this._microseconds * other);
				}
				throw ul4.TypeError.create("*", ul4._type(this) + " * " + ul4._type(other) + " not supported");
			},

			__truediv__: function __truediv__(other)
			{
				if (typeof(other) === "number")
				{
					return ul4.TimeDelta.create(this._days / other, this._seconds / other, this._microseconds / other);
				}
				else if (ul4._istimedelta(other))
				{
					let myValue = this._days;
					let otherValue = other._days;
					let hasSeconds = this._seconds || other._seconds;
					let hasMicroseconds = this._microseconds || other._microseconds;
					if (hasSeconds || hasMicroseconds)
					{
						myValue = myValue*86400+this._seconds;
						otherValue = otherValue*86400 + other._seconds;
						if (hasMicroseconds)
						{
							myValue = myValue * 1000000 + this._microseconds;
							otherValue = otherValue * 1000000 + other._microseconds;
						}
					}
					return myValue/otherValue;
				}
				throw ul4.TypeError.create("/", ul4._type(this) + " / " + ul4._type(other) + " not supported");
			},

			__getattr__: function __getattr__(attrname)
			{
				let self = this;
				switch (attrname)
				{
					case "days":
						return ul4.expose([], function days(){ return self._days; });
					case "seconds":
						return ul4.expose([], function seconds(){ return self._seconds; });
					case "microseconds":
						return ul4.expose([], function microseconds(){ return self._microseconds; });
					default:
						throw ul4.AttributeError.create(this, attrname);
				}
			},

			days: function days()
			{
				return this._days;
			},

			seconds: function seconds()
			{
				return this._seconds;
			},

			microseconds: function microseconds()
			{
				return this._microseconds;
			}
		}
	);

	ul4.MonthDelta = ul4._inherit(
		ul4.Proto,
		{
			__type__: "ul4.MonthDelta",

			create: function create(months=0)
			{
				let md = ul4._clone(this);
				md._months = months;
				return md;
			},

			__repr__: function __repr__()
			{
				if (!this._months)
					return "monthdelta()";
				return "monthdelta(" + this._months + ")";
			},

			__str__: function __str__()
			{
				if (this._months)
				{
					if (this._months !== -1 && this._months !== 1)
						return this._months + " months";
					return this._months + " month";
				}
				return "0 months";
			},

			__bool__: function __bool__()
			{
				return this._months !== 0;
			},

			__abs__: function __abs__()
			{
				return this._months < 0 ? ul4.MonthDelta.create(-this._months) : this;
			},

			__eq__: function __eq__(other)
			{
				if (ul4._ismonthdelta(other))
					return this._months === other._months;
				return false;
			},

			__lt__: function __lt__(other)
			{
				if (ul4._ismonthdelta(other))
					return this._months < other._months;
				ul4._unorderable("<", this, other);
			},

			__le__: function __le__(other)
			{
				if (ul4._ismonthdelta(other))
					return this._months <= other._months;
				ul4._unorderable("<=", this, other);
			},

			__gt__: function __gt__(other)
			{
				if (ul4._ismonthdelta(other))
					return this._months > other._months;
				ul4._unorderable(">", this, other);
			},

			__ge__: function __ge__(other)
			{
				if (ul4._ismonthdelta(other))
					return this._months >= other._months;
				ul4._unorderable(">=", this, other);
			},

			__neg__: function __neg__()
			{
				return ul4.MonthDelta.create(-this._months);
			},

			_add: function _add(date, months)
			{
				let year = date.getFullYear();
				let month = date.getMonth() + months;
				let day = date.getDate();
				let hour = date.getHours();
				let minute = date.getMinutes();
				let second = date.getSeconds();
				let millisecond = date.getMilliseconds();

				while (true)
				{
					// As the month might be out of bounds, we have to find out, what the real target month is
					let targetmonth = new Date(year, month, 1, hour, minute, second, millisecond).getMonth();
					let result = new Date(year, month, day, hour, minute, second, millisecond);
					if (result.getMonth() === targetmonth)
						return result;
					--day;
				}
			},

			__add__: function __add__(other)
			{
				if (ul4._ismonthdelta(other))
					return ul4.MonthDelta.create(this._months + other._months);
				else if (ul4._isdate(other))
					return this._add(other, this._months);
				throw ul4._type(this) + " + " + ul4._type(other) + " not supported";
			},

			__radd__: function __radd__(other)
			{
				if (ul4._isdate(other))
					return this._add(other, this._months);
				throw ul4._type(this) + " + " + ul4._type(other) + " not supported";
			},

			__sub__: function __sub__(other)
			{
				if (ul4._ismonthdelta(other))
					return ul4.MonthDelta.create(this._months - other._months);
				throw ul4._type(this) + " - " + ul4._type(other) + " not supported";
			},

			__rsub__: function __rsub__(other)
			{
				if (ul4._isdate(other))
					return this._add(other, -this._months);
				throw ul4._type(this) + " - " + ul4._type(other) + " not supported";
			},

			__mul__: function __mul__(other)
			{
				if (typeof(other) === "number")
					return ul4.MonthDelta.create(this._months * Math.floor(other));
				throw ul4._type(this) + " * " + ul4._type(other) + " not supported";
			},

			__rmul__: function __rmul__(other)
			{
				if (typeof(other) === "number")
					return ul4.MonthDelta.create(this._months * Math.floor(other));
				throw ul4._type(this) + " * " + ul4._type(other) + " not supported";
			},

			__floordiv__: function __floordiv__(other)
			{
				if (typeof(other) === "number")
					return ul4.MonthDelta.create(Math.floor(this._months / other));
				else if (ul4._ismonthdelta(other))
					return Math.floor(this._months / other._months);
				throw ul4._type(this) + " // " + ul4._type(other) + " not supported";
			},

			__truediv__: function __truediv__(other)
			{
				if (ul4._ismonthdelta(other))
					return this._months / other._months;
				throw ul4._type(this) + " / " + ul4._type(other) + " not supported";
			},

			__getattr__: function __getattr__(attrname)
			{
				let self = this;
				switch (attrname)
				{
					case "months":
						return ul4.expose([], function months(){ return self._months; });
					default:
						throw ul4.AttributeError.create(this, attrname);
				}
			},

			months: function months()
			{
				return this._months;
			}
		}
	);

	// When we don't have a real ``Set`` type, emulate one that supports strings
	ul4._Set = ul4._inherit(
		ul4.Proto,
		{
			__type__: "ul4._Set",

			create: function create(...items)
			{
				let set = ul4._clone(this);
				set.items = {};
				set.add(...items);
				return set;
			},

			add: function add(...items)
			{
				for (let i = 0; i < items.length; ++i)
				{
					this.items[items[i]] = true;
				}
			},

			__getattr__: function __getattr__(attrname)
			{
				let self = this;
				switch (attrname)
				{
					case "add":
						return ul4.expose(["*items"], function add(items){ self.add(...items); });
					default:
						throw ul4.AttributeError.create(this, attrname);
				}
			},

			__contains__: function __contains__(item)
			{
				return this.items[item] || false;
			},

			__bool__: function __bool__()
			{
				for (let item in this.items)
				{
					if (!this.items.hasOwnProperty(item))
						continue;
					return true;
				}
				return false;
			},

			__repr__: function __repr__()
			{
				let v = [];
				v.push("{");
				let i = 0;
				for (let item in this.items)
				{
					if (!this.items.hasOwnProperty(item))
						continue;
					if (i++)
						v.push(", ");
					v.push(ul4._repr(item));
				}
				if (!i)
					v.push("/");
				v.push("}");
				return v.join("");
			},

			__eq__: function(other)
			{
				// We'll check that everything in ``this`` is in ``other``
				// and if both have the same number of items they are equal
				if (ul4._isset(other))
				{
					let count = 0;
					for (let item in this.items)
					{
						if (!other.has(item))
							return false;
						// count the number of items we have
						++count;
					}
					return other.size == count;
				}
				else if (ul4._isul4set(other))
				{
					let count = 0;
					for (let item in this.items)
					{
						if (!other[item])
							return false;
						// count the number of items we have
						++count;
					}
					// Substract the number of items that ``other`` has
					for (let item in other.items)
						--count;
					return count == 0;
				}
				else
					return false;
			},

			__le__: function(other)
			{
				// check that ``this`` is a subset of ``other``,
				// i.e. everything in ``this`` is also in ``other``
				if (ul4._isset(other))
				{
					let count = 0;
					for (let item in this.items)
					{
						if (!other.has(item))
							return false;
					}
					return true;
				}
				else if (ul4._isul4set(other))
				{
					let count = 0;
					for (let item in this.items)
					{
						if (!other.items[item])
							return false;
					}
					return true;
				}
				else
					ul4._unorderable("<", this, other);
			},

			__ge__: function(other)
			{
				// check that ``this`` is a superset of ``other``,
				// i.e. everything in ``other`` is also in ``this``
				if (ul4._isset(other))
				{
					let result = true;
					other.forEach(function(value) {
						if (!this.items[value])
							result = false;
					});
					return result;
				}
				else if (ul4._isul4set(other))
				{
					let count = 0;
					for (let item in other.items)
					{
						if (!this.items[item])
							return false;
					}
					return true;
				}
				else
					ul4._unorderable("<=", this, other);
			}
		}
	);

	const classes = [
		"TextAST",
		"IndentAST",
		"LineEndAST",
		"Tag",
		"ConstAST",
		"SeqItemAST",
		"UnpackSeqItemAST",
		"DictItemAST",
		"UnpackDictItemAST",
		"PosArgAST",
		"KeywordArgAST",
		"UnpackListArgAST",
		"UnpackDictArgAST",
		"ListAST",
		"ListCompAST",
		"DictAST",
		"DictCompAST",
		"SetAST",
		"SetCompAST",
		"GenExprAST",
		"VarAST",
		"NotAST",
		"NegAST",
		"BitNotAST",
		"IfAST",
		"ReturnAST",
		"PrintAST",
		"PrintXAST",
		"ItemAST",
		"IsAST",
		"IsNotAST",
		"EQAST",
		"NEAST",
		"LTAST",
		"LEAST",
		"GTAST",
		"GEAST",
		"NotContainsAST",
		"ContainsAST",
		"AddAST",
		"SubAST",
		"MulAST",
		"FloorDivAST",
		"TrueDivAST",
		"ModAST",
		"ShiftLeftAST",
		"ShiftRightAST",
		"BitAndAST",
		"BitXOrAST",
		"BitOrAST",
		"AndAST",
		"OrAST",
		"SliceAST",
		"AttrAST",
		"CallAST",
		"RenderAST",
		"SetVarAST",
		"AddVarAST",
		"SubVarAST",
		"MulVarAST",
		"TrueDivVarAST",
		"FloorDivVarAST",
		"ModVarAST",
		"ShiftLeftVarAST",
		"ShiftRightVarAST",
		"BitAndVarAST",
		"BitXOrVarAST",
		"BitOrVarAST",
		"ForBlockAST",
		"WhileBlockAST",
		"BreakAST",
		"ContinueAST",
		"CondBlockAST",
		"IfBlockAST",
		"ElIfBlockAST",
		"ElseBlockAST",
		"SignatureAST",
		"Template"
	];

	for (let i = 0; i < classes.length; ++i)
	{
		let name = classes[i];
		let ul4onname = name;
		if (ul4onname.substr(ul4onname.length-3) === "AST")
			ul4onname = ul4onname.substr(0, ul4onname.length-3);
		ul4onname = ul4onname.toLowerCase();
		let object = ul4[name];
		object.typename = name;
		object.type = ul4onname;
		ul4on.register("de.livinglogic.ul4." + ul4onname, object);
	}

})();

