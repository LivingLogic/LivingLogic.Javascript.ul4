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

	// Register the object ``obj`` under the name ``name`` with the UL4ON machinery
	register: function(name, obj)
	{
		obj.ul4onname = name;
		this._registry[name] = function(){return obj.create();};
	},

	// Return a string that contains the object ``obj`` in the UL4ON serialization format
	dumps: function(obj)
	{
		var encoder = this.Encoder.create();
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
		create: function()
		{
			var encoder = ul4._clone(this);
			encoder.data = [];
			encoder._strings2index = {};
			encoder._ids2index = {};
			encoder._backrefs = 0;
			return encoder;
		},

		// Write the string ``string`` to the buffer
		write: function(string)
		{
			this.data.push(string);
		},

		// Write the number ``number`` to the buffer
		writenumber: function(number)
		{
			this.data.push("" + number);
			this.data.push("|");
		},

		// Returned the complete string written to the buffer
		finish: function()
		{
			return this.data.join("");
		},

		dump: function(obj)
		{
			if (obj === null)
				this.write("n");
			else if (typeof(obj) == "boolean")
				this.write(obj ? "bT" : "bF");
			else if (typeof(obj) == "number")
			{
				this.write((Math.round(obj) == obj) ? "i" : "f");
				this.writenumber(obj);
			}
			else if (typeof(obj) == "string")
			{
				var index = this._strings2index[obj];
				if (typeof(index) !== "undefined")
				{
					this.write("^");
					this.writenumber(index);
				}
				else
				{
					this._strings2index[obj] = this._backrefs++;
					this.write("S");
					this.writenumber(obj.length);
					this.write(obj);
				}
			}
			else if (ul4._iscolor(obj))
			{
				this.write("c");
				var r = obj.r(), g = obj.g(), b = obj.b(), a = obj.a();
				if (r < 0x10)
					this.write("0");
				this.write(r.toString(16));
				if (g < 0x10)
					this.write("0");
				this.write(g.toString(16));
				if (b < 0x10)
					this.write("0");
				this.write(b.toString(16));
				if (a < 0x10)
					this.write("0");
				this.write(a.toString(16));
			}
			else if (ul4._isdate(obj))
				this.write(ul4._format(obj, "z%Y%m%d%H%M%S%f"));
			else if (ul4._istimedelta(obj))
				this.write("t" + obj.days() + "|" + obj.seconds() + "|" + obj.microseconds() + "|");
			else if (ul4._ismonthdelta(obj))
				this.write("m" + obj.months() + "|");
			else if (typeof(obj) === "object" && typeof(obj.isa) === "function" && obj.isa(ul4.slice))
				this.write("r" + (obj.start !== null ? obj.start : "") + "|" + (obj.stop !== null ? obj.stop : "") + "|");
			else if (obj.__id__ && obj.ul4onname && obj.ul4ondump)
			{
				var index = this._ids2index[obj.__id__];
				if (typeof(index) != "undefined")
				{
					this.write("^");
					this.writenumber(index);
				}
				else
				{
					this._ids2index[obj.__id__] = this._backrefs++;
					this.write("O");
					this.dump(obj.ul4onname);
					obj.ul4ondump(this);
				}
			}
			else if (ul4._islist(obj))
			{
				this.write("l");
				for (var i in obj)
					this.dump(obj[i]);
				this.write("]");
			}
			else if (ul4._ismap(obj))
			{
				this.write("d");
				obj.forEach(function(value, key) {
					this.dump(key);
					this.dump(value);
				}, this);
				this.write("}");
			}
			else if (ul4._isdict(obj))
			{
				this.write("d");
				for (var key in obj)
				{
					this.dump(key);
					this.dump(obj[key]);
				}
				this.write("}");
			}
			else
				throw "can't handle object";
		},
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
			var value = "";
			for (;;)
			{
				var c = this.readchar();
				if (c === "|")
				{
					if (!value)
						return null;
					var result = parseFloat(value);
					if (result == NaN)
						throw "invalid number, got " + ul4._repr("value") + " at position " + this.pos;
					return result;
				}
				else
					value += c;
			}
		},

		// Load the next object from the buffer
		load: function()
		{
			var typecode = this.readchar();
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
						throw "wrong value for boolean, expected " + ul4._repr("T") + " or " + ul4._repr("F") + ", got " + ul4._repr(result) + " at position " + this.pos;
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
					var size = this.readnumber();
					result = this.read(size);
					if (typecode === "S")
						this.backrefs.push(result);
					return result;
				case "c":
				case "C":
					result = this.read(8);
					result = ul4.Color.create(parseInt(result.substring(0, 2), 16), parseInt(result.substring(2, 4), 16), parseInt(result.substring(4, 6), 16), parseInt(result.substring(6, 8), 16));
					if (typecode === "C")
						this.backrefs.push(result);
					return result;
				case "z":
				case "Z":
					result = this.read(20);
					result = new Date(parseInt(result.substring(0, 4)), parseInt(result.substring(4, 6)) - 1, parseInt(result.substring(6, 8)), parseInt(result.substring(8, 10)), parseInt(result.substring(10, 12)), parseInt(result.substring(12, 14)), parseInt(result.substring(14, 17)));
					if (typecode === "Z")
						this.backrefs.push(result);
					return result;
				case "t":
				case "T":
					result = ul4.TimeDelta.create(this.readnumber(), this.readnumber(), this.readnumber());
					if (typecode === "T")
						this.backrefs.push(result);
					return result;
				case "r":
				case "R":
					result = ul4.slice.create(this.readnumber(), this.readnumber());
					if (typecode === "R")
						this.backrefs.push(result);
					return result;
				case "m":
				case "M":
					result = ul4.MonthDelta.create(this.readnumber());
					if (typecode === "M")
						this.backrefs.push(result);
					return result;
				case "l":
				case "L":
					result = [];
					if (typecode === "L")
						this.backrefs.push(result);
					for (;;)
					{
						typecode = this.readchar();
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
						typecode = this.readchar();
						if (typecode === "}")
							return result;
						this.backup();
						var key = this.load();
						var value = this.load();
						if (ul4on._havemap)
							result.set(key, value)
						else
							result[key] = value;
					}
					return result;
				case "o":
				case "O":
					var oldpos = null;
					if (typecode === "O")
					{
						oldpos = this.backrefs.length;
						this.backrefs.push(null);
					}
					var name = this.load();
					var proto = ul4on._registry[name];
					if (typeof(proto) === "undefined")
						throw "can't load object of type " + ul4._repr(name);
					result = proto();
					if (typecode === "O")
						this.backrefs[oldpos] = result;
					result.ul4onload(this);
					return result;
				default:
					throw "unknown typecode " + ul4._repr(typecode) + " at position " + this.pos;
			}
		}
	}
}
