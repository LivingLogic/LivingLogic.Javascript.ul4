/*!
 * UL4ON JavaScript Library
 * http://www.livinglogic.de/Python/ul4on/
 *
 * Copyright 2012-2014 by LivingLogic AG, Bayreuth/Germany
 * Copyright 2012-2014 by Walter Dörwald
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
var ul4on = {
	_registry: {},

	_havemap: (typeof(Map) === "function" && typeof(Map.prototype.forEach) === "function"),

	_havemapconstructor: (function(){
		var works = false;
		try
		{
			if (new Map([[1, 2]]).size == 1)
				return true;
		}
		catch (error)
		{
		}
		return false;
	})(),

	_haveset: (typeof(Set) === "function" && typeof(Set.prototype.forEach) === "function"),

	_havesetconstructor: (function(){
		var works = false;
		try
		{
			if (new Set([[1, 2]]).size == 1)
				return true;
		}
		catch (error)
		{
		}
		return false;
	})(),

	// Function used for making maps, when the Map constructor doesn't work
	_makemap: function()
	{
		var map = new Map();

		for (var i = 0; i < arguments.length; ++i)
		{
			var argument = arguments[i];
			map.set(argument[0], argument[1]);
		}
		return map;
	},

	// Function used for making sets, when the Set constructor doesn't work
	_makeset: function()
	{
		var set = this._haveset ? new Set() : ul4._Set.create();

		for (var i = 0; i < arguments.length; ++i)
		{
			set.add(arguments[i]);
		}
		return set;
	},

	// Register the object ``obj`` under the name ``name`` with the UL4ON machinery
	register: function(name, obj)
	{
		obj.ul4onname = name;
		this._registry[name] = function(){return obj.create();};
	},

	// Return a string that contains the object ``obj`` in the UL4ON serialization format
	dumps: function(obj, indent)
	{
		var encoder = this.Encoder.create(indent);
		encoder.dump(obj);
		return encoder.finish();
	},

	// Load an object from the string ``data``. ``data`` must contain the object in the UL4ON serialization format
	loads: function(data)
	{
		var decoder = this.Decoder.create(data);
		return decoder.load();
	},

	// Helper "class" for encoding
	Encoder: {
		// Create a new Encoder object
		create: function(indent)
		{
			var encoder = ul4._clone(this);
			encoder.indent = indent || null;
			encoder.data = [];
			encoder._level = 0;
			encoder._strings2index = {};
			encoder._ids2index = {};
			encoder._backrefs = 0;
			return encoder;
		},

		_line: function(line)
		{
			var i, oldindent;

			if (this.indent !== null)
			{
				for (i = 0; i < this._level; ++i)
					this.data.push(this.indent);
			}
			else
			{
				if (this.data.length)
					this.data.push(" ");
			}
			this.data.push(line);

			if (arguments.length > 1)
			{
				oldindent = this.indent;
				this.indent = null;
				for (i = 1; i < arguments.length; ++i)
					this.dump(arguments[i]);
				this.indent = oldindent;
			}

			if (this.indent !== null)
				this.data.push("\n");
		},

		// Returned the complete string written to the buffer
		finish: function()
		{
			return this.data.join("");
		},

		dump: function(obj)
		{
			if (obj === null)
				this._line("n");
			else if (typeof(obj) == "boolean")
				this._line(obj ? "bT" : "bF");
			else if (typeof(obj) == "number")
			{
				var type = (Math.round(obj) == obj) ? "i" : "f";
				this._line(type + obj);
			}
			else if (typeof(obj) == "string")
			{
				var index = this._strings2index[obj];
				if (typeof(index) !== "undefined")
				{
					this._line("^" + index);
				}
				else
				{
					this._strings2index[obj] = this._backrefs++;
					this._line("S" + ul4._str_repr(obj));
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
			else if (obj.__id__ && obj.ul4onname && obj.ul4ondump)
			{
				var index = this._ids2index[obj.__id__];
				if (typeof(index) != "undefined")
				{
					this._line("^" + index);
				}
				else
				{
					this._ids2index[obj.__id__] = this._backrefs++;
					this._line("O", obj.ul4onname);
					++this._level;
					obj.ul4ondump(this);
					--this._level;
					this._line(")");
				}
			}
			else if (ul4._islist(obj))
			{
				this._line("l");
				++this._level;
				for (var i in obj)
					this.dump(obj[i]);
				--this._level;
				this._line("]");
			}
			else if (ul4._ismap(obj))
			{
				this._line("d");
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
				for (var key in obj)
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
	},

	// Helper "class" for decoding
	Decoder: {
		// Creates a new decoder for reading from the string ``data``
		create: function(data)
		{
			var decoder = ul4._clone(this);
			decoder.data = data;
			decoder.pos = 0;
			decoder.backrefs = [];
			return decoder;
		},

		// Read a character from the buffer
		readchar: function()
		{
			if (this.pos >= this.data.length)
				throw "UL4 decoder at EOF";
			return this.data.charAt(this.pos++);
		},

		// Read a character from the buffer (return null on eof)
		readcharoreof: function()
		{
			if (this.pos >= this.data.length)
				return null;
			return this.data.charAt(this.pos++);
		},

		// Read next not-whitespace character from the buffer
		readblackchar: function()
		{
			var re_white = /\s/;

			for (;;)
			{
			if (this.pos >= this.data.length)
				throw "UL4 decoder at EOF";
				var c = this.data.charAt(this.pos++);
				if (!c.match(re_white))
					return c;
			}
		},

		// Read ``size`` characters from the buffer
		read: function(size)
		{
			if (this.pos+size > this.length)
				size = this.length-this.pos;
			var result = this.data.substring(this.pos, this.pos+size);
			this.pos += size;
			return result;
		},

		// "unread" one character
		backup: function()
		{
			--this.pos;
		},

		// Read a number from the buffer
		readnumber: function()
		{
			var re_digits = /[-+0123456789.eE]/, value = "";
			for (;;)
			{
				var c = this.readcharoreof();
				if (c !== null && c.match(re_digits))
					value += c;
				else
				{
					var result = parseFloat(value);
					if (result == NaN)
						throw "invalid number, got " + ul4._repr("value") + " at position " + this.pos;
					return result;
				}
			}
		},

		_beginfakeloading: function()
		{
			var oldpos = this.backrefs.length;
			this.backrefs.push(null);
			return oldpos;
		},

		_endfakeloading: function(oldpos, value)
		{
			this.backrefs[oldpos] = value;
		},

		_readescape: function(escapechar, length)
		{
			var chars = this.read(length);
			if (chars.length != length)
				throw "broken escape " + ul4._repr("\\" + escapechar + chars) + " at position " + this.pos;
			var codepoint = parseInt(chars, 16);
			if (isNaN(codepoint))
				throw "broken escape " + ul4._repr("\\" + escapechar + chars) + " at position " + this.pos;
			return String.fromCharCode(codepoint);
		},

		// Load the next object from the buffer
		load: function()
		{
			var typecode = this.readblackchar();
			var result;
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
					var delimiter = this.readblackchar();
					for (;;)
					{
						var c = this.readchar();
						if (c == delimiter)
							break;
						if (c == "\\")
						{
							var c2 = this.readchar();
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
					result = ul4on._havemap ? new Map() : {};
					if (typecode === "D")
						this.backrefs.push(result);
					for (;;)
					{
						typecode = this.readblackchar();
						if (typecode === "}")
							return result;
						this.backup();
						var key = this.load();
						var value = this.load();
						if (ul4on._havemap)
							result.set(key, value);
						else
							result[key] = value;
					}
					return result;
				case "y":
				case "Y":
					result = ul4on._haveset ? new Set() : ul4._Set.create();
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
					var oldpos;
					if (typecode === "O")
						oldpos = this._beginfakeloading();
					var name = this.load();
					var proto = ul4on._registry[name];
					if (typeof(proto) === "undefined")
						throw "can't load object of type " + ul4._repr(name);
					result = proto();
					if (typecode === "O")
						this._endfakeloading(oldpos, result);
					result.ul4onload(this);
					typecode = this.readblackchar();
					if (typecode !== ")")
						throw "object terminator ')' expected, got " + ul4._repr(typecode) + " at position " + this.pos;
					return result;
				default:
					throw "unknown typecode " + ul4._repr(typecode) + " at position " + this.pos;
			}
		}
	}
}
