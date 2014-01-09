/*!

 * UL4 JavaScript Library
 * http://www.livinglogic.de/Python/ul4c/
 *
 * Copyright 2011-2013 by LivingLogic AG, Bayreuth/Germany
 * Copyright 2011-2013 by Walter Dörwald
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
var ul4 = {
	version: "27",

	// REs for parsing JSON
	_rvalidchars: /^[\],:{}\s]*$/,
	_rvalidescape: /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	_rvalidtokens: /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	_rvalidbraces: /(?:^|:|,)(?:\s*\[)+/g
};

/// Helper functions

// Crockford style object creation
ul4._simpleclone = function(obj)	
{
	function F(){};
	F.prototype = obj;
	var result = new F();
	return result;
};

// Crockford style object creation + prototype chain + object ids
ul4._clone = function(obj)
{
	var result = ul4._simpleclone(obj);
	result.__prototype__ = obj;
	result.__id__ = ul4.Proto._nextid++;
	return result;
};

// Adds attributes from on object to another and returns it
ul4._extend = function(obj, attrs)
{
	for (var name in attrs)
		obj[name] = attrs[name];
	return obj;
};

// Clone an object via ``_simpleclone`` and extend it
ul4._simpleinherit = function(baseobj, attrs)
{
	return ul4._extend(ul4._simpleclone(baseobj), attrs);
};

// Clone an object via ``_clone`` and extend it
ul4._inherit = function(baseobj, attrs)
{
	return ul4._extend(ul4._clone(baseobj), attrs);
};

// Adds name and signature to a function/method and makes the method callable in templates
ul4.expose = function(name, args, needsout, f)
{
	if (typeof(f) === "undefined")
	{
		f = needsout;
		needsout = false;
	}
	f._ul4_name = name;
	f._ul4_needsout = needsout || false;
	f._ul4_remargs = null;
	f._ul4_remkwargs = null;
	f._ul4_args = [];
	f._ul4_argnames = {};
	for (var i = 0; i < args.length; ++i)
	{
		var arg = args[i];
		var argname = arg;
		if (typeof(argname) !== "string")
			argname = argname[0];
		if (argname.substr(0, 2) == "**")
			f._ul4_remkwargs = argname.substr(2);
		else if (argname.substr(0, 1) == "*")
			f._ul4_remargs = argname.substr(1);
		else
		{
			if (typeof(arg) !== "string" && typeof(arg[1]) !== "undefined")
				f._ul4_args.push({name: argname, defaultValue: arg[1]});
			else
				f._ul4_args.push({name: argname});
			f._ul4_argnames[argname] = true;
		}
	}

	return f;
};

// Create the argument array for calling the function ``f`` with the positional arguments ``args`` and the keyword arguments ``kwargs``
ul4._makeargarray = function(f, args, kwargs)
{
	var realargs = [];
	var remargs = null;

	for (var i = 0; i < f._ul4_args.length; ++i)
	{
		var arg = f._ul4_args[i];

		if (typeof(kwargs[arg.name]) !== "undefined")
		{
			if (i < args.length)
				throw f._ul4_name + "() argument " + ul4._repr(arg.name) + " (position " + i + ") specified multiple times";
			realargs.push(kwargs[arg.name]);
		}
		else
		{
			if (i < args.length)
				realargs.push(args[i]);
			else if (typeof(arg.defaultValue) === "undefined")
				throw "required " + f._ul4_name + "() argument " + ul4._repr(arg.name) + " (position " + i + ") missing";
			else
				realargs.push(arg.defaultValue);
		}
	}

	// Do we accept additial positional arguments?
	if (f._ul4_remargs === null)
	{
		// No, but we have them -> complain
		if (args.length > f._ul4_args.length)
			throw f._ul4_name + "() expects at most " + f._ul4_args.length + " positional argument" + (f._ul4_args.length != 1 ? "s" : "") + ", " + args.length + " given";
	}
	else
	{
		// Put additional positional arguments in the call into the ``*`` argument (if there are none, this pushes an empty list)
		realargs.push(args.slice(f._ul4_args.length));
	}

	// Do we accept arbitrary keyword arguments?
	if (f._ul4_remkwargs === null)
	{
		// No => complain about unknown ones
		for (var key in kwargs)
		{
			if (!f._ul4_argnames[key])
				throw f._ul4_name + "() doesn't support an argument named " + ul4._repr(key);
		}
	}
	else
	{
		// Yes => Put the unknown ones into a dict and add that the the arguments array
		var remkwargs = {};
		for (var key in kwargs)
		{
			if (!f._ul4_argnames[key])
				remkwargs[key] = kwargs[key];
		}
		realargs.push(remkwargs);
	}
	return realargs;
}

ul4._call = function(f, out, args, kwargs)
{
	if (typeof(f) === "function")
	{
		args = ul4._makeargarray(f, args, kwargs);
		if (f._ul4_needsout)
			args = [out].concat(args);
		return f.apply(ul4, args);
	}
	else if (f && typeof(f.__call__) === "function")
	{
		args = ul4._makeargarray(f.__call__, args, kwargs);
		if (f.__call__._ul4_needsout)
			args = [out].concat(args);
		return f.__call__.apply(f, args); // Use the object as the function context.
	}
	else
		throw ul4._repr(f) + " is not callable!";
};

ul4._shape = function(value)
{
	if (!ul4._islist(value))
		return null;
	var shape = [];
	for (var i = 0; i < value.length; ++i)
		shape.push(ul4._shape(value[i]));
	return shape;
}

ul4._unpackvar = function(value, shape)
{
	if (shape === null)
		return value;
	else
	{
		var newvalue = [];
		var iter = ul4._iter(value);

		for (var i = 0;;++i)
		{
			var nextitem = iter();

			if (nextitem !== null)
			{
				if (i < shape.length)
					newvalue.push(ul4._unpackvar(nextitem[0], shape[i]));
				else
					throw "mismatched variable unpacking: " + shape.length + " varnames, >" + i + " items";
			}
			else
			{
				if (i === shape.length)
					break;
				else
					throw "mismatched variable unpacking: " + shape.length + " varnames, " + (i+1) + " items";
			}
		}
		return newvalue;
	}
};

ul4._formatsource = function(out)
{
	var finalout = [];
	var level = 0, needlf = false;
	for (var i = 0; i < out.length; ++i)
	{
		if (out[i] === null)
			needlf = true;
		else if (typeof(out[i]) === "string")
		{
			if (needlf)
			{
				finalout.push("\n");
				for (var j = 0; j < level; ++j)
					finalout.push("\t");
				needlf = false;
			}
			finalout.push(out[i]);
		}
		else
			level += out[i];
	}
	if (needlf)
		finalout.push("\n");
	return finalout.join("");
};

// Return an iterator for ``obj``
ul4._iter = function(obj)
{
	if (typeof(obj) === "string" || ul4._islist(obj))
	{
		var i = 0;
		var result = function()
		{
			return (i < obj.length) ? [obj[i++]] : null;
		};
		return ul4._markiter(result);
	}
	else if (obj !== null && typeof(obj.__isiter__) !== "undefined")
		return obj;
	else if (obj !== null && typeof(obj.__iter__) === "function")
		return obj.__iter__();
	else if (ul4._isdict(obj))
	{
		var keys = [];
		for (var key in obj)
			keys.push(key);
		var i = 0;
		var result = function()
		{
			if (i >= keys.length)
				return null;
			return [keys[i++]];
		};
		return ul4._markiter(result);
	}
	throw "'" + ul4._type(obj) + "' object is not iterable";
};

// Mark a function as an iterator
ul4._markiter = function(f)
{
	f.__isiter__ = true;
	return f;
};

ul4._str_repr = function(str)
{
	var result = "";
	for (var i = 0; i <str.length; ++i)
	{
		var c = str[i];
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
			case '"':
				result += '\\"';
				break;
			default:
				var code = str.charCodeAt(i);
				if (code >= 32 && code < 128)
					result += c;
				else
				{
					var prefix, length;
					if (code <= 0xFF)
					{
						prefix = "\\x";
						length = 2;
					}
					else if (code <= 0xFFFF)
					{
						prefix = "\\u";
						length = 4;
					}
					else
					{
						prefix = "\\U";
						length = 8;
					}
					result += prefix + ul4._lpad(code.toString(16), "0", length);
				}
				break;
		}
	}
	return '"' + result + '"';
};

ul4._date_repr = function(obj)
{
	var year = obj.getFullYear();
	var month = obj.getMonth()+1;
	var day = obj.getDate();
	var hour = obj.getHours();
	var minute = obj.getMinutes();
	var second = obj.getSeconds();
	var ms = obj.getMilliseconds();
	var result = "@(" + year + "-" + ul4._lpad(month.toString(), "0", 2) + "-" + ul4._lpad(day.toString(), "0", 2);

	if (hour || minute || second || ms)
	{
		result += "T" + ul4._lpad(hour.toString(), "0", 2) + ":" + ul4._lpad(minute.toString(), "0", 2) + ":" + ul4._lpad(second.toString(), "0", 2);
		if (ms)
			result += "." + ul4._lpad(ms.toString(), "0", 3) + "000";
	}
	result += ")";

	return result;
};

ul4._print = function(out, args)
{
	for (var i = 0; i < args.length; ++i)
	{
		if (i)
			out.push(" ");
		out.push(ul4._str(args[i]));
	}
	return null;
};

ul4._printx = function(out, args)
{
	for (var i = 0; i < args.length; ++i)
	{
		if (i)
			out.push(" ");
		out.push(ul4._xmlescape(args[i]));
	}
	return null;
};

// Return a string representation of ``obj``: This should be an object supported by UL4
ul4._repr = function(obj)
{
	if (obj === null)
		return "None";
	else if (obj === false)
		return "False";
	else if (obj === true)
		return "True";
	else if (typeof(obj) === "string")
		return ul4._str_repr(obj);
	else if (typeof(obj) === "number")
		return "" + obj;
	else if (ul4._isdate(obj))
		return ul4._date_repr(obj);
	else if (typeof(obj) === "undefined")
		return "<undefined>";
	else if (typeof(obj.__repr__) === "function")
		return obj.__repr__();
	else if (ul4._islist(obj))
	{
		var v = [];
		v.push("[");
		for (var i = 0; i < obj.length; ++i)
		{
			if (i !== 0)
				v.push(", ");
			v.push(ul4._repr(obj[i]));
		}
		v.push("]");
		return v.join("");
	}
	else if (ul4._isdict(obj))
	{
		var v = [];
		v.push("{");
		var i = 0;
		for (var key in obj)
		{
			if (!obj.hasOwnProperty(key))
				continue;
			if (i)
				v.push(", ");
			v.push(ul4._repr(key));
			v.push(": ");
			v.push(ul4._repr(obj[key]));
			++i;
		}
		v.push("}");
		return v.join("");
	}
	return "?";
};

ul4._date_str = function(obj)
{
	var year = obj.getFullYear();
	var month = obj.getMonth()+1;
	var day = obj.getDate();
	var hour = obj.getHours();
	var minute = obj.getMinutes();
	var second = obj.getSeconds();
	var ms = obj.getMilliseconds();

	var result = year + "-" + ul4._lpad(month.toString(), "0", 2) + "-" + ul4._lpad(day.toString(), "0", 2) + " " + ul4._lpad(hour.toString(), "0", 2) + ":" + ul4._lpad(minute.toString(), "0", 2) + ":" + ul4._lpad(second.toString(), "0", 2);
	if (ms)
		result += "." + ul4._lpad(ms.toString(), "0", 3) + "000";
	return result;
};

ul4._str = function(obj)
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
	{
		var v = [];
		v.push("[");
		for (var i = 0; i <obj.length; ++i)
		{
			if (i != 0)
				v.push(", ");
			v.push(ul4._repr(obj[i]));
		}
		v.push("]");
		return v.join("");
	}
	else if (typeof(obj.__str__) === "function")
	{
		return obj.__str__();
	}
	else if (ul4._isdict(obj))
	{
		var v = [];
		v.push("{");
		var i = 0;
		for (var key in obj)
		{
			if (i)
				v.push(", ");
			v.push(ul4._repr(key));
			v.push(": ");
			v.push(ul4._repr(obj[key]));
			++i;
		}
		v.push("}");
		return v.join("");
	}
	return "?";
};

// Convert ``obj`` to bool, according to its "truth value"
ul4._bool = function(obj)
{
	if (typeof(obj) === "undefined" || obj === null || obj === false || obj === 0 || obj === "")
		return false;
	else
	{
		if (typeof(obj.__bool__) === "function")
			return obj.__bool__();
		if (ul4._islist(obj))
			return obj.length !== 0;
		else if (ul4._isdict(obj))
		{
			for (var key in obj)
				return true;
			return false;
		}
		return true;
	}
};

// Convert ``obj`` to an integer (if ``base`` is given ``obj`` must be a string and ``base`` is the base for the conversion (default is 10))
ul4._int = function(obj, base)
{
	var result;
	if (base !== null)
	{
		if (typeof(obj) !== "string" || !ul4._isint(base))
			throw "int() requires a string and an integer";
		result = parseInt(obj, base);
		if (result.toString() == "NaN")
			throw "invalid literal for int()";
		return result;
	}
	else
	{
		if (typeof(obj) == "string")
		{
			result = parseInt(obj);
			if (result.toString() == "NaN")
				throw "invalid literal for int()";
			return result;
		}
		else if (typeof(obj) == "number")
			return Math.floor(obj);
		else if (obj === true)
			return 1;
		else if (obj === false)
			return 0;
		throw "int() argument must be a string or a number";
	}
};

// Convert ``obj`` to a float
ul4._float = function(obj)
{
	if (typeof(obj) === "string")
		return parseFloat(obj);
	else if (typeof(obj) === "number")
		return obj;
	else if (obj === true)
		return 1.0;
	else if (obj === false)
		return 0.0;
	throw "float() argument must be a string or a number";
};

// Convert ``obj`` to a list
ul4._list = function(obj)
{
	if (typeof(obj) == "string" || ul4._islist(obj))
	{
		var result = [];
		for (var key in obj)
			result.push(obj[key]);
		return result;
	}
	else if (ul4._iscolor(obj))
	{
		return [obj._r, obj._g, obj._b, obj._a];
	}
	else if (obj.__isiter__)
	{
		var result = [];
		while (true)
		{
			var item = obj();
			if (item === null)
				break;
			result.push(item[0]);
		}
		return result;
	}
	else if (typeof(obj.__iter__) == "function")
	{
		var iter = obj.__iter__();
		var result = [];
		while (true)
		{
			var item = iter();
			if (item === null)
				break;
			result.push(item[0]);
		}
		return result;
	}
	else if (ul4._isdict(obj))
	{
		var result = [];
		for (var key in obj)
			result.push(key);
		return result;
	}
	throw "list() requires an iterable";
};

// Return the length of ``sequence``
ul4._len = function(sequence)
{
	if (typeof(sequence) == "string" || ul4._islist(sequence))
		return sequence.length;
	else if (ul4._isdict(sequence))
	{
		var i = 0;
		for (var key in sequence)
			++i;
		return i;
	}
	throw "object of type '" + ul4._type(sequence) + "' has no len()";
};

ul4._type = function(obj)
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


// Return whether any of the items in ``iterable`` are true
ul4._any = function(iterable)
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
		var iter = ul4._iter(iterable);

		for (;;)
		{
			var item = iter();
			if (item === null)
				return false;
			if (ul4._bool(item[0]))
				return true;
		}
	}
};

// Return whether all of the items in ``iterable`` are true
ul4._all = function(iterable)
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
		var iter = ul4._iter(iterable);

		for (;;)
		{
			var item = iter();
			if (item === null)
				return true;
			if (!ul4._bool(item[0]))
				return false;
		}
	}
};

// Check if ``obj`` is undefined
ul4._isundefined = function(obj)
{
	return typeof(obj) === "undefined";
};


// Check if ``obj`` is *not* undefined
ul4._isdefined = function(obj)
{
	return typeof(obj) !== "undefined";
};

// Check if ``obj`` is ``None``
ul4._isnone = function(obj)
{
	return obj === null;
};

// Check if ``obj`` is a boolean
ul4._isbool = function(obj)
{
	return typeof(obj) == "boolean";
};

// Check if ``obj`` is a int
ul4._isint = function(obj)
{
	return (typeof(obj) == "number") && Math.round(obj) == obj;
};

// Check if ``obj`` is a float
ul4._isfloat = function(obj)
{
	return (typeof(obj) == "number") && Math.round(obj) != obj;
};

// Check if ``obj`` is a string
ul4._isstr = function(obj)
{
	return typeof(obj) == "string";
};

// Check if ``obj`` is a date
ul4._isdate = function(obj)
{
	return Object.prototype.toString.call(obj) == "[object Date]";
};

// Check if ``obj`` is a color
ul4._iscolor = function(obj)
{
	return Object.prototype.toString.call(obj) == "[object Object]" && obj.__type__ === "color";
};

// Check if ``obj`` is a timedelta object
ul4._istimedelta = function(obj)
{
	return Object.prototype.toString.call(obj) == "[object Object]" && obj.__type__ === "timedelta";
};

// Check if ``obj`` is a monthdelta object
ul4._ismonthdelta = function(obj)
{
	return Object.prototype.toString.call(obj) == "[object Object]" && obj.__type__ === "monthdelta";
};

// Check if ``obj`` is a template
ul4._istemplate = function(obj)
{
	return Object.prototype.toString.call(obj) == "[object Object]" && obj.__type__ === "template";
};

// Check if ``obj`` is a function
ul4._isfunction = function(obj)
{
	return typeof(obj) === "function" || (Object.prototype.toString.call(obj) == "[object Object]" && obj.__type__ === "template");
};

// Check if ``obj`` is a list
ul4._islist = function(obj)
{
	return Object.prototype.toString.call(obj) == "[object Array]";
};

// Check if ``obj`` is a dict
ul4._isdict = function(obj)
{
	return Object.prototype.toString.call(obj) == "[object Object]" && typeof(obj.__type__) === "undefined";
};

// Repeat string ``str`` ``rep`` times
ul4._str_repeat = function(str, rep)
{
	var result = "";
	for (; rep>0; --rep)
		result += str;
	return result;
};

ul4._list_repeat = function(list, rep)
{
	var result = [];
	for (; rep>0; --rep)
		for (var i = 0; i < list.length; ++i)
			result.push(list[i]);
	return result;
};

ul4._str_json = function(str)
{
	var result = "";
	for (var i = 0; i < str.length; ++i)
	{
		var c = str[i];
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
			default:
				var code = str.charCodeAt(i);
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
ul4._asjson = function(obj)
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
		var v = [];
		v.push("[");
		for (var i = 0; i < obj.length; ++i)
		{
			if (i != 0)
				v.push(", ");
			v.push(ul4._asjson(obj[i]));
		}
		v.push("]");
		return v.join("");
	}
	else if (ul4._isdict(obj))
	{
		var v = [];
		v.push("{");
		var i = 0;
		for (var key in obj)
		{
			if (i)
				v.push(", ");
			v.push(ul4._asjson(key));
			v.push(": ");
			v.push(ul4._asjson(obj[key]));
			++i;
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
	throw "asjson() requires a serializable object";
};

// Decodes the string ``string`` from the Javascript Object Notation (see http://json.org/) and returns the resulting object
ul4._fromjson = function(string)
{
	// The following is from jQuery's parseJSON function
	string = ul4._strip(string, null);
	if (typeof(window) !== "undefined" && window.JSON && window.JSON.parse)
		return window.JSON.parse(string);
	if (ul4._rvalidchars.test(string.replace(ul4._rvalidescape, "@").replace(ul4._rvalidtokens, "]").replace(ul4._rvalidbraces, "")))
		return (new Function("return " + string))();
	throw "invalid JSON";
};

// Encodes ``obj`` in the UL4 Object Notation format
ul4._asul4on = function(obj)
{
	return ul4on.dumps(obj);
};

// Decodes the string ``string`` from the UL4 Object Notation format and returns the resulting decoded object
ul4._fromul4on = function(string)
{
	return ul4on.loads(string);
};

ul4._format_date = function(obj, fmt, lang)
{
	var translations = {
		de: {
			ms: ["Jan", "Feb", "M\u00e4r", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
			ml: ["Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
			ws: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
			wl: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
			xf: "%d.%m.%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		en: {
			ms: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			ml: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			ws: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			wl: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			xf: "%m/%d/%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %I:%M:%S %p ",
		},
		fr: {
			ms: ["janv.", "f\u00e9vr.", "mars", "avril", "mai", "juin", "juil.", "ao\u00fbt", "sept.", "oct.", "nov.", "d\u00e9c."],
			ml: ["janvier", "f\u00e9vrier", "mars", "avril", "mai", "juin", "juillet", "ao\u00fbt", "septembre", "octobre", "novembre", "d\u00e9cembre"],
			ws: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
			wl: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
			xf: "%d/%m/%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		es: {
			ms: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
			ml: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
			ws: ["dom", "lun", "mar", "mi\u00e9", "jue", "vie", "s\u00e1b"],
			wl: ["domingo", "lunes", "martes", "mi\u00e9rcoles", "jueves", "viernes", "s\u00e1bado"],
			xf: "%d/%m/%y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		it: {
			ms: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
			ml: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
			ws: ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
			wl: ["domenica", "luned\u00ec", "marted\u00ec", "mercoled\u00ec", "gioved\u00ec", "venerd\u00ec", "sabato"],
			xf: "%d/%m/%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		da: {
			ms: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
			ml: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
			ws: ["s\u00f8n", "man", "tir", "ons", "tor", "fre", "l\u00f8r"],
			wl: ["s\u00f8ndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "l\u00f8rdag"],
			xf: "%d-%m-%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		sv: {
			ms: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
			ml: ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
			ws: ["s\u00f6n", "m\u00e5n", "tis", "ons", "tor", "fre", "l\u00f6r"],
			wl: ["s\u00f6ndag", "m\u00e5ndag", "tisdag", "onsdag", "torsdag", "fredag", "l\u00f6rdag"],
			xf: "%Y-%m-%d",
			Xf: "%H.%M.%S",
			cf: "%a %d %b %Y %H.%M.%S",
		},
		nl: {
			ms: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
			ml: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
			ws: ["zo", "ma", "di", "wo", "do", "vr", "za"],
			wl: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
			xf: "%d-%m-%y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		pt: {
			ms: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
			ml: ["Janeiro", "Fevereiro", "Mar\u00e7o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
			ws: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\u00e1b"],
			wl: ["Domingo", "Segunda", "Ter\u00e7a", "Quarta", "Quinta", "Sexta", "S\u00e1bado"],
			xf: "%d-%m-%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		cs: {
			ms: ["led", "\u00fano", "b\u0159e", "dub", "kv\u011b", "\u010den", "\u010dec", "srp", "z\u00e1\u0159", "\u0159\u00edj", "lis", "pro"],
			ml: ["leden", "\u00fanor", "b\u0159ezen", "duben", "kv\u011bten", "\u010derven", "\u010dervenec", "srpen", "z\u00e1\u0159\u00ed", "\u0159\u00edjen", "listopad", "prosinec"],
			ws: ["Ne", "Po", "\u00dat", "St", "\u010ct", "P\u00e1", "So"],
			wl: ["Ned\u011ble", "Pond\u011bl\u00ed", "\u00dater\u00fd", "St\u0159eda", "\u010ctvrtek", "P\u00e1tek", "Sobota"],
			xf: "%d.%m.%Y",
			Xf: "%H:%M:%S",
			cf: "%a\u00a0%d.\u00a0%B\u00a0%Y,\u00a0%H:%M:%S",
		},
		sk: {
			ms: ["jan", "feb", "mar", "apr", "m\u00e1j", "j\u00fan", "j\u00fal", "aug", "sep", "okt", "nov", "dec"],
			ml: ["janu\u00e1r", "febru\u00e1r", "marec", "apr\u00edl", "m\u00e1j", "j\u00fan", "j\u00fal", "august", "september", "okt\u00f3ber", "november", "december"],
			ws: ["Ne", "Po", "Ut", "St", "\u0160t", "Pi", "So"],
			wl: ["Nede\u013ea", "Pondelok", "Utorok", "Streda", "\u0160tvrtok", "Piatok", "Sobota"],
			xf: "%d.%m.%Y",
			Xf: "%H:%M:%S",
			cf: "%a\u00a0%d.\u00a0%B\u00a0%Y,\u00a0%H:%M:%S",
		},
		pl: {
			ms: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "pa\u017a", "lis", "gru"],
			ml: ["stycze\u0144", "luty", "marzec", "kwiecie\u0144", "maj", "czerwiec", "lipiec", "sierpie\u0144", "wrzesie\u0144", "pa\u017adziernik", "listopad", "grudzie\u0144"],
			ws: ["nie", "pon", "wto", "\u015bro", "czw", "pi\u0105", "sob"],
			wl: ["niedziela", "poniedzia\u0142ek", "wtorek", "\u015broda", "czwartek", "pi\u0105tek", "sobota"],
			xf: "%d.%m.%Y",
			Xf: "%H:%M:%S",
			cf: "%a, %d %b %Y, %H:%M:%S",
		},
		hr: {
			ms: ["Sij", "Vel", "O\u017eu", "Tra", "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro"],
			ml: ["Sije\u010danj", "Velja\u010da", "O\u017eujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"],
			ws: ["Ned", "Pon", "Uto", "Sri", "\u010cet", "Pet", "Sub"],
			wl: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "\u010cetvrtak", "Petak", "Subota"],
			xf: "%d.%m.%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		sr: {
			ms: ["\u0458\u0430\u043d", "\u0444\u0435\u0431", "\u043c\u0430\u0440", "\u0430\u043f\u0440", "\u043c\u0430\u0458", "\u0458\u0443\u043d", "\u0458\u0443\u043b", "\u0430\u0432\u0433", "\u0441\u0435\u043f", "\u043e\u043a\u0442", "\u043d\u043e\u0432", "\u0434\u0435\u0446"],
			ml: ["\u0458\u0430\u043d\u0443\u0430\u0440", "\u0444\u0435\u0431\u0440\u0443\u0430\u0440", "\u043c\u0430\u0440\u0442", "\u0430\u043f\u0440\u0438\u043b", "\u043c\u0430\u0458", "\u0458\u0443\u043d", "\u0458\u0443\u043b", "\u0430\u0432\u0433\u0443\u0441\u0442", "\u0441\u0435\u043f\u0442\u0435\u043c\u0431\u0430\u0440", "\u043e\u043a\u0442\u043e\u0431\u0430\u0440", "\u043d\u043e\u0432\u0435\u043c\u0431\u0430\u0440", "\u0434\u0435\u0446\u0435\u043c\u0431\u0430\u0440"],
			ws: ["\u043d\u0435\u0434", "\u043f\u043e\u043d", "\u0443\u0442\u043e", "\u0441\u0440\u0435", "\u0447\u0435\u0442", "\u043f\u0435\u0442", "\u0441\u0443\u0431"],
			wl: ["\u043d\u0435\u0434\u0435\u0459\u0430", "\u043f\u043e\u043d\u0435\u0434\u0435\u0459\u0430\u043a", "\u0443\u0442\u043e\u0440\u0430\u043a", "\u0441\u0440\u0435\u0434\u0430", "\u0447\u0435\u0442\u0432\u0440\u0442\u0430\u043a", "\u043f\u0435\u0442\u0430\u043a", "\u0441\u0443\u0431\u043e\u0442\u0430"],
			xf: "%d.%m.%Y.",
			Xf: "%H:%M:%S",
			cf: "%A, %d. %B %Y. %H:%M:%S",
		},
		ro: {
			ms: ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"],
			ml: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
			ws: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sb"],
			wl: ["duminic\u0103", "luni", "mar\u0163i", "miercuri", "joi", "vineri", "s\u00e2mb\u0103t\u0103"],
			xf: "%d.%m.%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		hu: {
			ms: ["jan", "febr", "m\u00e1rc", "\u00e1pr", "m\u00e1j", "j\u00fan", "j\u00fal", "aug", "szept", "okt", "nov", "dec"],
			ml: ["janu\u00e1r", "febru\u00e1r", "m\u00e1rcius", "\u00e1prilis", "m\u00e1jus", "j\u00fanius", "j\u00falius", "augusztus", "szeptember", "okt\u00f3ber", "november", "december"],
			ws: ["v", "h", "k", "sze", "cs", "p", "szo"],
			wl: ["vas\u00e1rnap", "h\u00e9tf\u0151", "kedd", "szerda", "cs\u00fct\u00f6rt\u00f6k", "p\u00e9ntek", "szombat"],
			xf: "%Y-%m-%d",
			Xf: "%H.%M.%S",
			cf: "%Y. %b. %d., %A, %H.%M.%S",
		},
		tr: {
			ms: ["Oca", "\u015eub", "Mar", "Nis", "May", "Haz", "Tem", "A\u011fu", "Eyl", "Eki", "Kas", "Ara"],
			ml: ["Ocak", "\u015eubat", "Mart", "Nisan", "May\u0131s", "Haziran", "Temmuz", "A\u011fustos", "Eyl\u00fcl", "Ekim", "Kas\u0131m", "Aral\u0131k"],
			ws: ["Paz", "Pzt", "Sal", "\u00c7r\u015f", "Pr\u015f", "Cum", "Cts"],
			wl: ["Pazar", "Pazartesi", "Sal\u0131", "\u00c7ar\u015famba", "Per\u015fembe", "Cuma", "Cumartesi"],
			xf: "%d-%m-%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		ru: {
			ms: ["\u042f\u043d\u0432", "\u0424\u0435\u0432", "\u041c\u0430\u0440", "\u0410\u043f\u0440", "\u041c\u0430\u0439", "\u0418\u044e\u043d", "\u0418\u044e\u043b", "\u0410\u0432\u0433", "\u0421\u0435\u043d", "\u041e\u043a\u0442", "\u041d\u043e\u044f", "\u0414\u0435\u043a"],
			ml: ["\u042f\u043d\u0432\u0430\u0440\u044c", "\u0424\u0435\u0432\u0440\u0430\u043b\u044c", "\u041c\u0430\u0440\u0442", "\u0410\u043f\u0440\u0435\u043b\u044c", "\u041c\u0430\u0439", "\u0418\u044e\u043d\u044c", "\u0418\u044e\u043b\u044c", "\u0410\u0432\u0433\u0443\u0441\u0442", "\u0421\u0435\u043d\u0442\u044f\u0431\u0440\u044c", "\u041e\u043a\u0442\u044f\u0431\u0440\u044c", "\u041d\u043e\u044f\u0431\u0440\u044c", "\u0414\u0435\u043a\u0430\u0431\u0440\u044c"],
			ws: ["\u0412\u0441\u043a", "\u041f\u043d\u0434", "\u0412\u0442\u0440", "\u0421\u0440\u0434", "\u0427\u0442\u0432", "\u041f\u0442\u043d", "\u0421\u0431\u0442"],
			wl: ["\u0412\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435", "\u041f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a", "\u0412\u0442\u043e\u0440\u043d\u0438\u043a", "\u0421\u0440\u0435\u0434\u0430", "\u0427\u0435\u0442\u0432\u0435\u0440\u0433", "\u041f\u044f\u0442\u043d\u0438\u0446\u0430", "\u0421\u0443\u0431\u0431\u043e\u0442\u0430"],
			xf: "%d.%m.%Y",
			Xf: "%H:%M:%S",
			cf: "%a %d %b %Y %H:%M:%S",
		},
		zh: {
			ms: [" 1\u6708", " 2\u6708", " 3\u6708", " 4\u6708", " 5\u6708", " 6\u6708", " 7\u6708", " 8\u6708", " 9\u6708", "10\u6708", "11\u6708", "12\u6708"],
			ml: ["\u4e00\u6708", "\u4e8c\u6708", "\u4e09\u6708", "\u56db\u6708", "\u4e94\u6708", "\u516d\u6708", "\u4e03\u6708", "\u516b\u6708", "\u4e5d\u6708", "\u5341\u6708", "\u5341\u4e00\u6708", "\u5341\u4e8c\u6708"],
			ws: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d"],
			wl: ["\u661f\u671f\u65e5", "\u661f\u671f\u4e00", "\u661f\u671f\u4e8c", "\u661f\u671f\u4e09", "\u661f\u671f\u56db", "\u661f\u671f\u4e94", "\u661f\u671f\u516d"],
			xf: "%Y\u5e74%b%d\u65e5",
			Xf: "%H\u65f6%M\u5206%S\u79d2",
			cf: "%Y\u5e74%b%d\u65e5 %A %H\u65f6%M\u5206%S\u79d2",
		},
		ko: {
			ms: [" 1\uc6d4", " 2\uc6d4", " 3\uc6d4", " 4\uc6d4", " 5\uc6d4", " 6\uc6d4", " 7\uc6d4", " 8\uc6d4", " 9\uc6d4", "10\uc6d4", "11\uc6d4", "12\uc6d4"],
			ml: ["1\uc6d4", "2\uc6d4", "3\uc6d4", "4\uc6d4", "5\uc6d4", "6\uc6d4", "7\uc6d4", "8\uc6d4", "9\uc6d4", "10\uc6d4", "11\uc6d4", "12\uc6d4"],
			ws: ["\uc77c", "\uc6d4", "\ud654", "\uc218", "\ubaa9", "\uae08", "\ud1a0"],
			wl: ["\uc77c\uc694\uc77c", "\uc6d4\uc694\uc77c", "\ud654\uc694\uc77c", "\uc218\uc694\uc77c", "\ubaa9\uc694\uc77c", "\uae08\uc694\uc77c", "\ud1a0\uc694\uc77c"],
			xf: "%Y\ub144 %B %d\uc77c",
			Xf: "%H\uc2dc %M\ubd84 %S\ucd08",
			cf: "%Y\ub144 %B %d\uc77c (%a) %p %I\uc2dc %M\ubd84 %S\ucd08",
		},
		ja: {
			ms: [" 1\u6708", " 2\u6708", " 3\u6708", " 4\u6708", " 5\u6708", " 6\u6708", " 7\u6708", " 8\u6708", " 9\u6708", "10\u6708", "11\u6708", "12\u6708"],
			ml: ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],
			ws: ["\u65e5", "\u6708", "\u706b", "\u6c34", "\u6728", "\u91d1", "\u571f"],
			wl: ["\u65e5\u66dc\u65e5", "\u6708\u66dc\u65e5", "\u706b\u66dc\u65e5", "\u6c34\u66dc\u65e5", "\u6728\u66dc\u65e5", "\u91d1\u66dc\u65e5", "\u571f\u66dc\u65e5"],
			xf: "%Y\u5e74%B%d\u65e5",
			Xf: "%H\u6642%M\u5206%S\u79d2",
			cf: "%Y\u5e74%B%d\u65e5 %H\u6642%M\u5206%S\u79d2",
		}
	};

	var translation = translations[lang];

	var firstday;

	var result = [];
	var inspec = false;
	for (var i = 0; i < fmt.length; ++i)
	{
		var c = fmt[i];
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

ul4._format_int = function(obj, fmt, lang)
{
	var work = fmt;

	// Defaults
	var fill = ' ';
	var align = '>'; // '<', '>', '=' or '^'
	var sign = '-'; // '+', '-' or ' '
	var alternate = false;
	var minimumwidth = 0;
	var type = 'd'; // 'b', 'c', 'd', 'o', 'x', 'X' or 'n'

	// Determine output type
	if (/[bcdoxXn]$/.test(work))
	{
		type = work.substring(work.length-1);
		work = work.substring(0, work.length-1);
	}

	// Extract minimum width
	if (/\d+$/.test(work))
	{
		var minimumwidthStr = /\d+$/.exec(work);
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
			throw "sign not allowed for integer format type 'c'";
		sign = work.substring(work.length-1);
		work = work.substring(0, work.length-1);
	}

	// Extract fill and align char
	if (work.length >= 3)
		throw "illegal integer format string " + ul4._repr(fmt);
	else if (work.length == 2)
	{
		if (/[<>=^]$/.test(work))
		{
			align = work[1];
			fill = work[0];
		}
		else
			throw "illegal integer format string " + ul4._repr(fmt);
	}
	else if (work.length == 1)
	{
		if (/^[<>=^]$/.test(work))
			align = work;
		else
			throw "illegal integer format string " + ul4._repr(fmt);
	}

	// Basic number formatting
	var neg = obj < 0;

	if (neg)
		obj = -obj;

	var output;
	switch (type)
	{
		case 'b':
			output = obj.toString(2);
			break;
		case 'c':
			if (neg || obj > 65535)
				throw "value out of bounds for c format";
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
				var pad = minimumwidth - output.length;
				var padBefore = Math.floor(pad/2);
				var padAfter = pad-padBefore;
				output = ul4._str_repeat(fill, padBefore) + output + ul4._str_repeat(fill, padAfter);
			}
		}
	}
	return output;
};

// Format ``obj`` using the format string ``fmt`` in the language ``lang``
ul4._format = function(obj, fmt, lang)
{
	if (typeof(lang) === "undefined" || lang === null)
		lang = "en";
	else
	{
		var translations = {de: null, en: null, fr: null, es: null, it: null, da: null, sv: null, nl: null, pt: null, cs: null, sk: null, pl: null, hr: null, sr: null, ro: null, hu: null, tr: null, ru: null, zh: null, ko: null, ja: null};
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

ul4._lpad = function(string, pad, len)
{
	if (typeof(string) === "number")
		string = string.toString();
	while (string.length < len)
		string = pad + string;
	return string;
};

ul4._rpad = function(string, pad, len)
{
	if (typeof(string) === "number")
		string = string.toString();
	while (string.length < len)
		string = string + pad;
	return string;
};

ul4._checkfuncargs = function(funcname, args, min, max)
{
	if (typeof(max) === "undefined")
		max = min;
	if (args.length < min || (max !== null && args.length > max))
	{
		if (min == max)
			throw "function " + funcname + "() requires " + min + " argument" + (min!==1 ? "s" : "") + ", " + args.length + " given";
		else if (max !== null)
			throw "function " + funcname + "() requires " + min + "-" + max + " arguments, " + args.length + " given";
		else
			throw "function " + funcname + "() requires at least " + min + " argument" + (min!==1 ? "s" : "") + ", " + args.length + " given";
	}
};

ul4._checkmethargs = function(methname, args, min, max)
{
	if (typeof(max) === "undefined")
		max = min;
	if ((args.length-1) < min || (args.length-1) > max)
	{
		if (min == max)
			throw "method " + methname + "() requires " + min + " argument" + (min!==1 ? "s" : "") + ", " + (args.length-1) + " given";
		else
			throw "method " + methname + "() requires " + min + "-" + max + " arguments, " + (args.length-1) + " given";
	}
};

ul4.Proto = {
	__prototype__: null,
	__id__: 0,
	_nextid: 1,
	isa: function(type)
	{
		if (this === type)
			return true;
		if (this.__prototype__ === null)
			return false;
		return this.__prototype__.isa(type);
	},

	// To support comparison you only have to implement ``__eq__`` and ``__lt__``

	__ne__: function(other)
	{
		return !this.__eq__(other);
	},

	__le__: function(other)
	{
		return this.__eq__(other) || this.__lt__(other);
	},

	__gt__: function(other)
	{
		return !this.__eq__(other) && !this.__lt__(other);
	},

	__ge__: function(other)
	{
		return !this.__lt__(other);
	},

	__bool__: function()
	{
		return true;
	}
};

ul4.Color = ul4._inherit(
	ul4.Proto,
	{
		__type__: "color",

		create: function(r, g, b, a)
		{
			var c = ul4._clone(this);
			c._r = typeof(r) !== "undefined" ? r : 0;
			c._g = typeof(g) !== "undefined" ? g : 0;
			c._b = typeof(b) !== "undefined" ? b : 0;
			c._a = typeof(a) !== "undefined" ? a : 255;
			return c;
		},

		__repr__: function()
		{
			var r = ul4._lpad(this._r.toString(16), "0", 2);
			var g = ul4._lpad(this._g.toString(16), "0", 2);
			var b = ul4._lpad(this._b.toString(16), "0", 2);
			var a = ul4._lpad(this._a.toString(16), "0", 2);
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

		__str__: function()
		{
			if (this._a !== 0xff)
			{
				return "rgba(" + this._r + ", " + this._g + ", " + this._b + ", " + (this._a/255) + ")";
			}
			else
			{
				var r = ul4._lpad(this._r.toString(16), "0", 2);
				var g = ul4._lpad(this._g.toString(16), "0", 2);
				var b = ul4._lpad(this._b.toString(16), "0", 2);
				var a = ul4._lpad(this._a.toString(16), "0", 2);
				if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1])
					return "#" + r[0] + g[0] + b[0];
				else
					return "#" + r + g + b;
			}
		},

		__getattr__: function(attrname)
		{
			var object = this;
			switch (attrname)
			{
				case "r":
					return ul4.expose("r", [], function(){ return object._r; });
				case "g":
					return ul4.expose("g", [], function(){ return object._g; });
				case "b":
					return ul4.expose("b", [], function(){ return object._b; });
				case "a":
					return ul4.expose("a", [], function(){ return object._a; });
				case "lum":
					return ul4.expose("lum", [], function(){ return object.lum(); });
				case "hls":
					return ul4.expose("hls", [], function(){ return object.hls(); });
				case "hlsa":
					return ul4.expose("hlsa", [], function(){ return object.hlsa(); });
				case "hsv":
					return ul4.expose("hsv", [], function(){ return object.hsv(); });
				case "hsva":
					return ul4.expose("hsva", [], function(){ return object.hsva(); });
				case "witha":
					return ul4.expose("witha", ["a"], function(a){ return object.witha(a); });
				case "withlum":
					return ul4.expose("withlum", ["lum"], function(lum){ return object.withlum(lum); });
				case "abslum":
					return ul4.expose("abslum", ["lum"], function(lum){ return object.abslum(lum); });
				case "rellum":
					return ul4.expose("rellum", ["lum"], function(lum){ return object.rellum(lum); });
				default:
					return ul4.undefined;
			}
		},

		__getitem__: function(key)
		{
			var orgkey = key;
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

		r: ul4.expose("r", [],
			function()
			{
				return this._r;
			}
		),

		g: ul4.expose("g", [],
			function()
			{
				return this._g;
			}
		),

		b: ul4.expose("b", [],
			function()
			{
				return this._b;
			}
		),

		a: ul4.expose("a", [],
			function()
			{
				return this._a;
			}
		),

		lum: ul4.expose("lum", [],
			function()
			{
				return this.hls()[1];
			}
		),

		hls: ul4.expose("hls", [],
			function()
			{
				var r = this._r/255.0;
				var g = this._g/255.0;
				var b = this._b/255.0;
				var maxc = Math.max(r, g, b);
				var minc = Math.min(r, g, b);
				var h, l, s;
				var rc, gc, bc;

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

		hlsa: ul4.expose("hlsa", [],
			function()
			{
				var hls = this.hls();
				return hls.concat(this._a/255.0);
			}
		),

		hsv: ul4.expose("hsv", [],
			function()
			{
				var r = this._r/255.0;
				var g = this._g/255.0;
				var b = this._b/255.0;
				var maxc = Math.max(r, g, b);
				var minc = Math.min(r, g, b);
				var v = maxc;
				if (minc == maxc)
					return [0.0, 0.0, v];
				var s = (maxc-minc) / maxc;
				var rc = (maxc-r) / (maxc-minc);
				var gc = (maxc-g) / (maxc-minc);
				var bc = (maxc-b) / (maxc-minc);
				var h;
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

		hsva: ul4.expose("hsva", [],
			function()
			{
				var hsv = this.hsv();
				return hsv.concat(this._a/255.0);
			}
		),

		witha: ul4.expose("witha", ["a"],
			function(a)
			{
				if (typeof(a) !== "number")
					throw "witha() requires a number";
				return ul4.Color.create(this._r, this._g, this._b, a);
			}
		),

		withlum: ul4.expose("withlum", ["lum"],
			function(lum)
			{
				if (typeof(lum) !== "number")
					throw "witha() requires a number";
				var hlsa = this.hlsa();
				return ul4._hls(hlsa[0], lum, hlsa[2], hlsa[3]);
			}
		)
	}
);

ul4.TimeDelta = ul4._inherit(
	ul4.Proto,
	{
		__type__: "timedelta",

		create: function(days, seconds, microseconds)
		{
			var td = ul4._clone(this);
			if (typeof(days) === "undefined")
				days = 0;
			if (typeof(seconds) === "undefined")
				seconds = 0;
			if (typeof(microseconds) === "undefined")
				microseconds = 0;

			var total_microseconds = Math.floor((days * 86400 + seconds)*1000000 + microseconds);

			microseconds = ul4.Mod._do(total_microseconds, 1000000);
			var total_seconds = Math.floor(total_microseconds / 1000000);
			seconds = ul4.Mod._do(total_seconds, 86400);
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

		__repr__: function()
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

		__str__: function()
		{
			var v = [];
			if (this._days)
			{
				v.push(this._days + " day");
				if (this._days !== -1 && this._days !== 1)
					v.push("s");
				v.push(", ");
			}
			var seconds = this._seconds % 60;
			var minutes = Math.floor(this._seconds / 60);
			var hours = Math.floor(minutes / 60);
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

		__bool__: function()
		{
			return this._days !== 0 || this._seconds !== 0 || this._microseconds !== 0;
		},

		__abs__: function()
		{
			return this._days < 0 ? ul4.TimeDelta.create(-this._days, -this._seconds, -this._microseconds) : this;
		},

		__eq__: function(other)
		{
			if (ul4._istimedelta(other))
				return (this._days === other._days) && (this._seconds === other._seconds) && (this._microseconds === other._microseconds);
			return false;
		},

		__lt__: function(other)
		{
			if (ul4._istimedelta(other))
			{
				if (this._days < other._days)
					return true;
				if (this._days > other._days)
					return false;
				if (this._seconds < other._seconds)
					return true;
				if (this._seconds > other._seconds)
					return false;
				return this._microseconds < other._microseconds;
			}
			throw "unorderable types: " + ul4._type(this) + "() >=< " + ul4._type(other) + "()";
		},

		__neg__: function()
		{
			return ul4.TimeDelta.create(-this._days, -this._seconds, -this._microseconds);
		},

		_add: function(date, days, seconds, microseconds)
		{
			var year = date.getFullYear();
			var month = date.getMonth();
			var day = date.getDate() + days;
			var hour = date.getHours();
			var minute = date.getMinutes();
			var second = date.getSeconds() + seconds;
			var millisecond = date.getMilliseconds() + microseconds/1000;
			return new Date(year, month, day, hour, minute, second, millisecond);
		},

		__add__: function(other)
		{
			if (ul4._istimedelta(other))
				return ul4.TimeDelta.create(this._days + other._days, this._seconds + other._seconds, this._microseconds + other._microseconds);
			else if (ul4._isdate(other))
				return this._add(other, this._days, this._seconds, this._microseconds);
			throw ul4._type(this) + " + " + ul4._type(other) + " not supported";
		},

		__radd__: function(other)
		{
			if (ul4._isdate(other))
				return this._add(other, this._days, this._seconds, this._microseconds);
			throw ul4._type(this) + " + " + ul4._type(other) + " not supported";
		},

		__sub__: function(other)
		{
			if (ul4._istimedelta(other))
				return ul4.TimeDelta.create(this._days - other._days, this._seconds - other._seconds, this._microseconds - other._microseconds);
			throw ul4._type(this) + " - " + ul4._type(other) + " not supported";
		},

		__rsub__: function(other)
		{
			if (ul4._isdate(other))
				return this._add(other, -this._days, -this._seconds, -this._microseconds);
			throw ul4._type(this) + " - " + ul4._type(other) + " not supported";
		},

		__mul__: function(other)
		{
			if (typeof(other) === "number")
			{
				return ul4.TimeDelta.create(this._days * other, this._seconds * other, this._microseconds * other);
			}
			throw ul4._type(this) + " * " + ul4._type(other) + " not supported";
		},

		__rmul__: function(other)
		{
			if (typeof(other) === "number")
			{
				return ul4.TimeDelta.create(this._days * other, this._seconds * other, this._microseconds * other);
			}
			throw ul4._type(this) + " * " + ul4._type(other) + " not supported";
		},

		__truediv__: function(other)
		{
			if (typeof(other) === "number")
			{
				return ul4.TimeDelta.create(this._days / other, this._seconds / other, this._microseconds / other);
			}
			else if (ul4._istimedelta(other))
			{
				var myValue = this._days;
				var otherValue = other._days;
				var hasSeconds = this._seconds || other._seconds;
				var hasMicroseconds = this._microseconds || other._microseconds;
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
			throw ul4._type(this) + " / " + ul4._type(other) + " not supported";
		},

		__getattr__: function(attrname)
		{
			var object = this;
			switch (attrname)
			{
				case "days":
					return ul4.expose("days", [], function(){ return object._days; });
				case "seconds":
					return ul4.expose("seconds", [], function(){ return object._seconds; });
				case "microseconds":
					return ul4.expose("microseconds", [], function(){ return object._microseconds; });
				default:
					return ul4.undefined;
			}
		},

		days: function()
		{
			return this._days;
		},

		seconds: function()
		{
			return this._seconds;
		},

		microseconds: function()
		{
			return this._microseconds;
		}
	}
);

ul4.MonthDelta = ul4._inherit(
	ul4.Proto,
	{
		__type__: "monthdelta",

		create: function(months)
		{
			var md = ul4._clone(this);
			md._months = typeof(months) !== "undefined" ? months : 0;
			return md;
		},

		__repr__: function()
		{
			if (!this._months)
				return "monthdelta()";
			return "monthdelta(" + this._months + ")";
		},

		__str__: function()
		{
			if (this._months)
			{
				if (this._months !== -1 && this._months !== 1)
					return this._months + " months";
				return this._months + " month";
			}
			return "0 months";
		},

		__bool__: function()
		{
			return this._months !== 0;
		},

		__abs__: function()
		{
			return this._months < 0 ? ul4.MonthDelta.create(-this._months) : this;
		},

		__eq__: function(other)
		{
			if (ul4._ismonthdelta(other))
				return this._months === other._months;
			return false;
		},

		__lt__: function(other)
		{
			if (ul4._ismonthdelta(other))
				return this._months < other._months;
			throw "unorderable types: " + ul4._type(this) + "() >=< " + ul4._type(other) + "()";
		},

		__neg__: function()
		{
			return ul4.MonthDelta.create(-this._months);
		},

		_add: function(date, months)
		{
			var year = date.getFullYear();
			var month = date.getMonth() + months;
			var day = date.getDate();
			var hour = date.getHours();
			var minute = date.getMinutes();
			var second = date.getSeconds();
			var millisecond = date.getMilliseconds();

			while (true)
			{
				// As the month might be out of bounds, we have to find out, what the real target month is
				var targetmonth = new Date(year, month, 1, hour, minute, second, millisecond).getMonth();
				var result = new Date(year, month, day, hour, minute, second, millisecond);
				if (result.getMonth() === targetmonth)
					return result;
				--day;
			}
		},

		__add__: function(other)
		{
			if (ul4._ismonthdelta(other))
				return ul4.MonthDelta.create(this._months + other._months);
			else if (ul4._isdate(other))
				return this._add(other, this._months);
			throw ul4._type(this) + " + " + ul4._type(other) + " not supported";
		},

		__radd__: function(other)
		{
			if (ul4._isdate(other))
				return this._add(other, this._months);
			throw ul4._type(this) + " + " + ul4._type(other) + " not supported";
		},

		__sub__: function(other)
		{
			if (ul4._ismonthdelta(other))
				return ul4.MonthDelta.create(this._months - other._months);
			throw ul4._type(this) + " - " + ul4._type(other) + " not supported";
		},

		__rsub__: function(other)
		{
			if (ul4._isdate(other))
				return this._add(other, -this._months);
			throw ul4._type(this) + " - " + ul4._type(other) + " not supported";
		},

		__mul__: function(other)
		{
			if (typeof(other) === "number")
				return ul4.MonthDelta.create(this._months * Math.floor(other));
			throw ul4._type(this) + " * " + ul4._type(other) + " not supported";
		},

		__rmul__: function(other)
		{
			if (typeof(other) === "number")
				return ul4.MonthDelta.create(this._months * Math.floor(other));
			throw ul4._type(this) + " * " + ul4._type(other) + " not supported";
		},

		__floordiv__: function(other)
		{
			if (typeof(other) === "number")
				return ul4.MonthDelta.create(Math.floor(this._months / other));
			else if (ul4._ismonthdelta(other))
				return Math.floor(this._months / other._months);
			throw ul4._type(this) + " // " + ul4._type(other) + " not supported";
		},

		__truediv__: function(other)
		{
			if (ul4._ismonthdelta(other))
				return this._months / other._months;
			throw ul4._type(this) + " / " + ul4._type(other) + " not supported";
		},

		__getattr__: function(attrname)
		{
			var object = this;
			switch (attrname)
			{
				case "months":
					return ul4.expose("months", [], function(){ return object._months; });
				default:
					return ul4.undefined;
			}
		},

		months: function()
		{
			return this._months;
		}
	}
);

ul4.Location = ul4._inherit(
	ul4.Proto,
	{
		create: function(root, source, type, starttag, endtag, startcode, endcode)
		{
			var location = ul4._clone(this);
			location.root = root;
			location.source = source;
			location.type = type;
			location.starttag = starttag;
			location.endtag = endtag;
			location.startcode = startcode;
			location.endcode = endcode;
			// Unfortunately Javascript doesn't have what other languages call properties, so we must create real attributes here
			if (typeof(source) !== "undefined")
			{
				location.tag = source.substring(starttag, endtag);
				location.code = source.substring(startcode, endcode);
			}
			else
			{
				location.tag = null;
				location.code = null;
			}
			return location;
		},
		ul4ondump: function(encoder)
		{
			encoder.dump(this.root);
			encoder.dump(this.source);
			encoder.dump(this.type);
			encoder.dump(this.starttag);
			encoder.dump(this.endtag);
			encoder.dump(this.startcode);
			encoder.dump(this.endcode);
		},
		ul4onload: function(decoder)
		{
			this.root = decoder.load();
			this.source = decoder.load();
			this.type = decoder.load();
			this.starttag = decoder.load();
			this.endtag = decoder.load();
			this.startcode = decoder.load();
			this.endcode = decoder.load();

			this.tag = this.source.substring(this.starttag, this.endtag);
			this.code = this.source.substring(this.startcode, this.endcode);
		}
	}
);

ul4.AST = ul4._inherit(
	ul4.Proto,
	{
		create: function(location, start, end)
		{
			var ast = ul4._clone(this);
			ast.location = location;
			ast.start = start;
			ast.end = end;
			return ast;
		},
		__str__: function()
		{
			var out = [];
			this._str(out);
			return ul4._formatsource(out);
		},
		__repr__: function()
		{
			var out = [];
			this._repr(out);
			return ul4._formatsource(out);
		},
		jssource: function()
		{
			var out = [];
			this._jssource(out);
			return ul4._formatsource(out);
		},
		_jssource_set: function(out, func, value)
		{
			throw "lvalue required";
		},
		_repr: function(out)
		{
		},
		_str: function(out)
		{
			out.push(this.location.source.substring(this.start, this.end).replace(/\r?\n/g, ' '));
		},
		_add2template: function(template)
		{
			template._asts[this.__id__] = this;
		},
		ul4ondump: function(encoder)
		{
			for (var i = 0; i < this._ul4onattrs.length; ++i)
				encoder.dump(this[this._ul4onattrs[i]]);
		},
		ul4onload: function(decoder)
		{
			for (var i = 0; i < this._ul4onattrs.length; ++i)
				this[this._ul4onattrs[i]] = decoder.load();
		},
		__setitem__: function(attrname, value)
		{
			throw "object is immutable";
		},
		// used in ul4ondump/ul4ondump to automatically dump these attributes
		_ul4onattrs: ["location", "start", "end"]
	}
);

ul4.Const = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, value)
		{
			var constant = ul4.AST.create.call(this, location, start, end);
			constant.value = value;
			return constant;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["value"]),
		_repr: function(out)
		{
			out.push("<Const value=");
			out.push(ul4._repr(this.value));
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push(ul4._asjson(this.value));
		}
	}
);

ul4.List = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end)
		{
			var list = ul4.AST.create.call(this, location, start, end);
			list.items = [];
			return list;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["items"]),
		_repr: function(out)
		{
			out.push("<List");
			out.push(null);
			out.push(+1);
			for (var i = 0; i < this.items.length; ++i)
			{
				this.items[i]._repr(out);
				out.push(null);
			}
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("[");
			for (var i = 0; i < this.items.length; ++i)
			{
				if (i)
					out.push(", ");
				this.items[i]._jssource(out);
			}
			out.push("]");
		}
	}
);

ul4.ListComp = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, item, varname, container, condition)
		{
			var listcomp = ul4.AST.create.call(this, location, start, end);
			listcomp.item = item;
			listcomp.varname = varname;
			listcomp.container = container;
			listcomp.condition = condition;
			return listcomp;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["item", "varname", "container", "condition"]),
		_repr: function(out)
		{
			out.push("<ListComp");
			out.push(null);
			out.push(+1);
			out.push("item=");
			this.item._repr(out);
			out.push(null);
			out.push("varname=");
			out.push(ul4._repr(this.varname));
			out.push(null);
			out.push("container=");
			this.container._repr(out);
			out.push(null);
			if (condition !== null)
			{
				out.push("condition=");
				this.condition._repr(out);
				out.push(null);
			}
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("(function(vars){vars = ul4._simpleclone(vars); var result=[];for(var iter=ul4._iter(");
			this.container._jssource(out);
			out.push(");;){var item=iter();if(item===null)break;");
			out.push("var value" + this.__id__ + " = ul4._unpackvar(item[0], ");
			out.push(ul4._asjson(ul4._shape(this.varname)));
			out.push(");");
			out.push(null);
			this._jssource_value(out, this.varname, "value" + this.__id__);
			if (this.condition !== null)
			{
				out.push("if(ul4._bool(");
				this.condition._jssource(out);
				out.push("))");
			}
			out.push("result.push(");
			this.item._jssource(out);
			out.push(");}return result;})(vars)");
		},
		_jssource_value: function(out, lvalue, value)
		{
			if (!ul4._islist(lvalue))
			{
				lvalue._jssource_set(out, "set", value);
				out.push(";");
				out.push(null);
			}
			else
			{
				for (var i = 0; i < lvalue.length; ++i)
					this._jssource_value(out, lvalue[i], value + "[" + i + "]");
			}
		}
	}
);

ul4.Dict = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end)
		{
			var dict = ul4.AST.create.call(this, location, start, end);
			dict.items = [];
			return dict;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["items"]),
		_repr: function(out)
		{
			out.push("<Dict");
			out.push(null);
			out.push(+1);
			for (var i = 0; i < this.items.length; ++i)
			{
				this.items[i][0]._repr(out);
				out.push("=");
				this.items[i][1]._repr(out);
				out.push(null);
			}
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("{");
			for (var i = 0; i < this.items.length; ++i)
			{
				if (i)
					out.push(", ");
				this.items[i][0]._jssource(out);
				out.push(": ");
				this.items[i][1]._jssource(out);
			}
			out.push("}");
		}
	}
);

ul4.DictComp = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, key, value, varname, container, condition)
		{
			var listcomp = ul4.AST.create.call(this, location, start, end);
			listcomp.key = key;
			listcomp.value = value;
			listcomp.varname = varname;
			listcomp.container = container;
			listcomp.condition = condition;
			return listcomp;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["key", "value", "varname", "container", "condition"]),
		_repr: function(out)
		{
			out.push("<DictComp");
			out.push(null);
			out.push(+1);
			out.push("key=");
			this.key._repr(out);
			out.push(null);
			out.push("value=");
			this.value._repr(out);
			out.push(null);
			out.push("varname=");
			this.varname._repr(out);
			out.push(null);
			out.push("container=");
			this.container._repr(out);
			out.push(null);
			if (condition !== null)
			{
				out.push("condition=");
				this.condition._repr(out);
				out.push(null);
			}
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("(function(vars){vars=ul4._simpleclone(vars);var result={};for(var iter=ul4._iter(");
			this.container._jssource(out);
			out.push(");;){var item=iter();if(item===null)break;");
			out.push("var value" + this.__id__ + " = ul4._unpackvar(item[0], ");
			out.push(ul4._asjson(ul4._shape(this.varname)));
			out.push(");");
			out.push(null);
			this._jssource_value(out, this.varname, "value" + this.__id__);
			if (this.condition !== null)
			{
				out.push("if(ul4._bool(");
				this.condition._jssource(out);
				out.push("))");
			}
			out.push("result[");
			this.key._jssource(out);
			out.push("]=");
			this.value._jssource(out);
			out.push(";}return result;})(vars)");
		},
		_jssource_value: function(out, lvalue, value)
		{
			if (!ul4._islist(lvalue))
			{
				lvalue._jssource_set(out, "set", value);
				out.push(";");
				out.push(null);
			}
			else
			{
				for (var i = 0; i < lvalue.length; ++i)
					this._jssource_value(out, lvalue[i], value + "[" + i + "]");
			}
		}
	}
);

ul4.GenExpr = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, item, varname, container, condition)
		{
			var genexp = ul4.AST.create.call(this, location, start, end);
			genexp.item = item;
			genexp.varname = varname;
			genexp.container = container;
			genexp.condition = condition;
			return genexp;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["item", "varname", "container", "condition"]),
		_repr: function(out)
		{
			out.push("<GenExpr");
			out.push(null);
			out.push(+1);
			out.push("item=");
			this.item._repr(out);
			out.push(null);
			out.push("varname=");
			this.varname._repr(out);
			out.push(null);
			out.push("container=");
			this.container._repr(out);
			out.push(null);
			if (condition !== null)
			{
				out.push("condition=");
				this.condition._repr(out);
				out.push(null);
			}
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("ul4._markiter(");
				out.push("(function(vars, container){");
					out.push("vars = ul4._simpleclone(vars);");
					out.push("var iter=ul4._iter(container);");
					out.push("return(function(){");
						out.push("var item;");
						out.push("for (;;)");
						out.push("{");
							out.push("item = iter();");
							out.push("if(item===null)");
								out.push("return null;");
							out.push("var value" + this.__id__ + " = ul4._unpackvar(item[0], ");
							out.push(ul4._asjson(ul4._shape(this.varname)));
							out.push(");");
							out.push(null);
							this._jssource_value(out, this.varname, "value" + this.__id__);
							if (this.condition !== null)
							{
								out.push("if(ul4._bool(");
								this.condition._jssource(out);
								out.push("))");
							}
							out.push("break;");
						out.push("}");
						out.push("return [");
						this.item._jssource(out);
						out.push("];");
					out.push("})");
				out.push("})(vars, ");
				this.container._jssource(out);
				out.push(")");
			out.push(")");
		},
		_jssource_value: function(out, lvalue, value)
		{
			if (!ul4._islist(lvalue))
			{
				lvalue._jssource_set(out, "set", value);
				out.push(";");
				out.push(null);
			}
			else
			{
				for (var i = 0; i < lvalue.length; ++i)
					this._jssource_value(out, lvalue[i], value + "[" + i + "]");
			}
		}
	}
);

ul4.Var = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, name)
		{
			var variable = ul4.AST.create.call(this, location, start, end);
			variable.name = name;
			return variable;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["name"]),
		_repr: function(out)
		{
			out.push("<Var name=");
			out.push(ul4._repr(this.name));
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("ul4.Var._get(vars, ");
			out.push(ul4._asjson(this.name));
			out.push(")");
		},
		_jssource_set: function(out, value)
		{
			out.push("ul4.Var._set(vars, ");
			out.push(ul4._asjson(this.name));
			out.push(", ");
			out.push(value);
			out.push(")");
		},
		_jssource_modify: function(out, operatorname, value)
		{
			out.push("ul4.Var._modify(ul4.");
			out.push(operatorname);
			out.push(", vars, ");
			out.push(ul4._asjson(this.name));
			out.push(", ");
			out.push(value);
			out.push(")");
		},
		_get: function(vars, name)
		{
			var result = vars[name];
			if (typeof(result) === "undefined")
				result = ul4.functions[name];
			return result;
		},
		_set: function(vars, name, value)
		{
			if (name === "self")
				throw "can't assign to self";
			vars[name] = value;
		},
		_modify: function(operator, vars, name, value)
		{
			if (name === "self")
				throw "can't assign to self";
			vars[name] = operator._ido(vars[name], value);
		}
	}
);

ul4.Unary = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, obj)
		{
			var unary = ul4.AST.create.call(this, location, start, end);
			unary.obj = obj;
			return unary;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["obj"]),
		_repr: function(out)
		{
			out.push("<");
			out.push(this.name);
			out.push(null);
			out.push(+1);
			out.push("obj=");
			this.obj._repr(out);
			out.push(null);
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("ul4.");
			out.push(this.name);
			out.push("._do(");
			this.obj._jssource(out);
			out.push(")");
		}
	}
);

// Negation
ul4.Neg = ul4._inherit(
	ul4.Unary,
	{
		_do: function(obj)
		{
			if (obj !== null && typeof(obj.__neg__) === "function")
				return obj.__neg__();
			return -obj;
		}
	}
);

// Bitwise not
ul4.BitNot = ul4._inherit(
	ul4.Unary,
	{
		_do: function(obj)
		{
			return -obj-1;
		}
	}
);

// Not
ul4.Not = ul4._inherit(
	ul4.Unary,
	{
		_do: function(obj)
		{
			return !ul4._bool(obj);
		}
	}
);

// If expression
ul4.If = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, objif, objcond, objelse)
		{
			var ifexpr = ul4.AST.create.call(this, location, start, end);
			ifexpr.objif = objif;
			ifexpr.objcond = objcond;
			ifexpr.objelse = objelse;
			return ifexpr;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["objif", "objcond", "objelse"]),
		_repr: function(out)
		{
			out.push("<");
			out.push(this.name);
			out.push(null);
			out.push(+1);
			out.push("objif=");
			this.objif._repr(out);
			out.push(null);
			out.push("objcond=");
			this.objcond._repr(out);
			out.push(null);
			out.push("objelse=");
			this.objelse._repr(out);
			out.push(null);
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("(ul4._bool(");
			this.objcond._jssource(out);
			out.push(")?(");
			this.objif._jssource(out);
			out.push("):(");
			this.objelse._jssource(out);
			out.push("))");
		}
	}
);

ul4.Text = ul4._inherit(
	ul4.AST,
	{
		text: function()
		{
			var text = this.location.code;
			if (!this.location.root.keepws)
				text = text.replace(/\r?\n\s*/g, "");
			return text;
		},
		_jssource: function(out)
		{
			out.push("out.push(");
			out.push(ul4._asjson(this.text()));
			out.push(")");
		},
		_str: function(out)
		{
			out.push("text ");
			out.push(ul4._repr(this.text()));
		},
		_repr: function(out)
		{
			out.push("<Text ");
			out.push(ul4._repr(this.text()));
			out.push(">");
		}
	}
);

ul4.Return = ul4._inherit(
	ul4.Unary,
	{
		_jssource: function(out)
		{
			out.push("return ");
			this.obj._jssource(out);
		},
		_str: function(out)
		{
			out.push("return ");
			ul4.Unary._str.call(this, out);
		}
	}
);

ul4.Print = ul4._inherit(
	ul4.Unary,
	{
		_jssource: function(out)
		{
			out.push("out.push(ul4._str(");
			this.obj._jssource(out);
			out.push("))");
		},
		_str: function(out)
		{
			out.push("print ");
			ul4.Unary._str.call(this, out);
		}
	}
);

ul4.PrintX = ul4._inherit(
	ul4.Unary,
	{
		_jssource: function(out)
		{
			out.push("out.push(ul4._xmlescape(");
			this.obj._jssource(out);
			out.push("))");
		},
		_str: function(out)
		{
			out.push("printx ");
			ul4.Unary._str.call(this, out);
		}
	}
);

ul4.Binary = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, obj1, obj2)
		{
			var binary = ul4.AST.create.call(this, location, start, end);
			binary.obj1 = obj1;
			binary.obj2 = obj2;
			return binary;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["obj1", "obj2"]),
		_repr: function(out)
		{
			out.push("<");
			out.push(this.type);
			out.push(null);
			out.push(+1);
			out.push("obj1=");
			this.obj1._repr(out);
			out.push(null);
			out.push("obj2=");
			this.obj2._repr(out);
			out.push(null);
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("ul4.");
			out.push(this.name);
			out.push("._do(");
			this.obj1._jssource(out);
			out.push(", ");
			this.obj2._jssource(out);
			out.push(")");
		}
	}
);

// Item access and assignment: dict[key], list[index], string[index], color[index]
ul4.Item = ul4._inherit(
	ul4.Binary,
	{
		_jssource: function(out)
		{
			out.push("ul4.Item._get(");
			this.obj1._jssource(out);
			out.push(", ");
			this.obj2._jssource(out);
			out.push(")");
		},
		_jssource_set: function(out, value)
		{
			out.push("ul4.Item._set(");
			this.obj1._jssource(out);
			out.push(", ");
			this.obj2._jssource(out);
			out.push(", ");
			out.push(value);
			out.push(")");
		},
		_jssource_modify: function(out, operatorname, value)
		{
			out.push("ul4.Item._modify(ul4.");
			out.push(operatorname);
			out.push(", ");
			this.obj1._jssource(out);
			out.push(", ");
			this.obj2._jssource(out);
			out.push(", ");
			out.push(value);
			out.push(")");
		},
		_get: function(container, key)
		{
			if (typeof(container) === "string" || ul4._islist(container))
			{
				var orgkey = key;
				if (key < 0)
					key += container.length;
				return container[key];
			}
			else if (container && typeof(container.__getitem__) === "function") // test this before the generic object test
				return container.__getitem__(key);
			else if (Object.prototype.toString.call(container) === "[object Object]")
				return container[key];
			else
				throw "getitem() needs a sequence or dict";
		},
		_set: function(container, key, value)
		{
			if (typeof(container) === "string" || ul4._islist(container))
			{
				var orgkey = key;
				if (key < 0)
					key += container.length;
				container[key] = value;
			}
			else if (container && typeof(container.__setitem__) === "function") // test this before the generic object test
				container.__setitem__(key, value);
			else if (Object.prototype.toString.call(container) === "[object Object]")
				container[key] = value;
			else
				throw "setitem() needs a sequence or dict";
		},
		_modify: function(operator, container, key, value)
		{
			this._set(container, key, operator._ido(this._get(container, key), value));
		}
	}
);

// Comparison operator ==
ul4.EQ = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__eq__) === "function")
			{
				if (obj2 && typeof(obj2.__eq__) === "function")
					return obj1.__eq__(obj2);
				else
					return false;
			}
			else
			{
				if (obj2 && typeof(obj2.__eq__) === "function")
					return false;
				else
					return obj1 === obj2;
			}
		}
	}
);

// Comparison operator !=
ul4.NE = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__ne__) === "function")
			{
				if (obj2 && typeof(obj2.__ne__) === "function")
					return obj1.__ne__(obj2);
				else
					return true;
			}
			else
			{
				if (obj2 && typeof(obj2.__ne__) === "function")
					return true;
				else
					return obj1 !== obj2;
			}
		}
	}
);

// Comparison operator <
ul4.LT = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__lt__) === "function")
			{
				if (obj2 && typeof(obj2.__lt__) === "function")
					return obj1.__lt__(obj2);
				else
					throw "unorderable types: " + ul4._type(obj1) + "() < " + ul4._type(obj2) + "()";
			}
			else
			{
				if (obj2 && typeof(obj2.__lt__) === "function")
					throw "unorderable types: " + ul4._type(obj1) + "() < " + ul4._type(obj2) + "()";
				else
					return obj1 < obj2;
			}
		}
	}
);

// Comparison operator <=
ul4.LE = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__le__) === "function")
			{
				if (obj2 && typeof(obj2.__le__) === "function")
					return obj1.__le__(obj2);
				else
					throw "unorderable types: " + ul4._type(obj1) + "() <= " + ul4._type(obj2) + "()";
			}
			else
			{
				if (obj2 && typeof(obj2.__lt__) === "function")
					throw "unorderable types: " + ul4._type(obj1) + "() <= " + ul4._type(obj2) + "()";
				else
					return obj1 <= obj2;
			}
		}
	}
);

// Comparison operator >
ul4.GT = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__gt__) === "function")
			{
				if (obj2 && typeof(obj2.__gt__) === "function")
					return obj1.__gt__(obj2);
				else
					throw "unorderable types: " + ul4._type(obj1) + "() > " + ul4._type(obj2) + "()";
			}
			else
			{
				if (obj2 && typeof(obj2.__lt__) === "function")
					throw "unorderable types: " + ul4._type(obj1) + "() > " + ul4._type(obj2) + "()";
				else
					return obj1 > obj2;
			}
		}
	}
);

// Comparison operator >=
ul4.GE = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__ge__) === "function")
			{
				if (obj2 && typeof(obj2.__ge__) === "function")
					return obj1.__ge__(obj2);
				else
					throw "unorderable types: " + ul4._type(obj1) + "() >= " + ul4._type(obj2) + "()";
			}
			else
			{
				if (obj2 && typeof(obj2.__lt__) === "function")
					throw "unorderable types: " + ul4._type(obj1) + "() >= " + ul4._type(obj2) + "()";
				else
					return obj1 >= obj2;
			}
		}
	}
);

// Containment test: string in string, obj in list, key in dict, value in rgb
ul4.Contains = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj, container)
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
			else if (ul4._isdict(container))
			{
				for (var key in container)
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
			throw "argument of type '" + ul4._type(container) + "' is not iterable";
		}
	}
);

// Inverted containment test
ul4.NotContains = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj, container)
		{
			return !ul4.Contains._do(obj, container);
		}
	}
);

// Addition: num + num, string + string
ul4.Add = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__add__) === "function")
				return obj1.__add__(obj2);
			else if (obj2 && typeof(obj2.__radd__) === "function")
				return obj2.__radd__(obj1);
			if (obj1 === null || obj2 === null)
				throw ul4._type(obj1) + " + " + ul4._type(obj2) + " not supported";
			if (ul4._islist(obj1) && ul4._islist(obj2))
			{
				var result = [];
				ul4._append(result, obj1);
				ul4._append(result, obj2);
				return result;
			}
			else
				return obj1 + obj2;
		},
		_ido: function(obj1, obj2)
		{
			if (ul4._islist(obj1) && ul4._islist(obj2))
			{
				ul4._append(obj1, obj2);
				return obj1;
			}
			else
				return this._do(obj1, obj2);
		}
	}
);

// Substraction: num - num
ul4.Sub = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__sub__) === "function")
				return obj1.__sub__(obj2);
			else if (obj2 && typeof(obj2.__rsub__) === "function")
				return obj2.__rsub__(obj1);
			if (obj1 === null || obj2 === null)
				throw ul4._type(obj1) + " - " + ul4._type(obj2) + " not supported";
			return obj1 - obj2;
		},
		_ido: function(obj1, obj2)
		{
			return this._do(obj1, obj2);
		}
	}
);

// Multiplication: num * num, int * str, str * int, int * list, list * int
ul4.Mul = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__mul__) === "function")
				return obj1.__mul__(obj2);
			else if (obj2 && typeof(obj2.__rmul__) === "function")
				return obj2.__rmul__(obj1);
			if (obj1 === null || obj2 === null)
				throw ul4._type(obj1) + " * " + ul4._type(obj2) + " not supported";
			else if (ul4._isint(obj1) || ul4._isbool(obj1))
			{
				if (typeof(obj2) === "string")
				{
					if (obj1 < 0)
						throw "mul() repetition counter must be positive";
					return ul4._str_repeat(obj2, obj1);
				}
				else if (ul4._islist(obj2))
				{
					if (obj1 < 0)
						throw "mul() repetition counter must be positive";
					return ul4._list_repeat(obj2, obj1);
				}
			}
			else if (ul4._isint(obj2) || ul4._isbool(obj2))
			{
				if (typeof(obj1) === "string")
				{
					if (obj2 < 0)
						throw "mul() repetition counter must be positive";
					return ul4._str_repeat(obj1, obj2);
				}
				else if (ul4._islist(obj1))
				{
					if (obj2 < 0)
						throw "mul() repetition counter must be positive";
					return ul4._list_repeat(obj1, obj2);
				}
			}
			return obj1 * obj2;
		},
		_ido: function(obj1, obj2)
		{
			if (ul4._islist(obj1) && ul4._isint(obj2))
			{
				if (obj2 > 0)
				{
					var i = 0;
					var targetsize = obj1.length * obj2;
					while (obj1.length < targetsize)
						obj1.push(obj1[i++])
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
ul4.FloorDiv = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__floordiv__) === "function")
				return obj1.__floordiv__(obj2);
			else if (obj2 && typeof(obj2.__rfloordiv__) === "function")
				return obj2.__rfloordiv__(obj1);
			if (obj1 === null || obj2 === null)
				throw ul4._type(obj1) + " // " + ul4._type(obj2) + " not supported";
			return Math.floor(obj1 / obj2);
		},
		_ido: function(obj1, obj2)
		{
			return this._do(obj1, obj2);
		}
	}
);

// "Real" division
ul4.TrueDiv = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj1 && typeof(obj1.__truediv__) === "function")
				return obj1.__truediv__(obj2);
			else if (obj2 && typeof(obj2.__rtruediv__) === "function")
				return obj2.__rtruediv__(obj1);
			if (obj1 === null || obj2 === null)
				throw ul4._type(obj1) + " / " + ul4._type(obj2) + " not supported";
			return obj1 / obj2;
		},
		_ido: function(obj1, obj2)
		{
			return this._do(obj1, obj2);
		}
	}
);

// Modulo
ul4.Mod = ul4._inherit(
	ul4.Binary,
	{
		// (this is non-trivial, because it follows the Python semantic of ``-5 % 2`` being ``1``)
		_do: function(obj1, obj2)
		{
			var div = Math.floor(obj1 / obj2);
			var mod = obj1 - div * obj2;

			if (mod !== 0 && ((obj2 < 0 && mod > 0) || (obj2 > 0 && mod < 0)))
			{
				mod += obj2;
				--div;
			}
			return obj1 - div * obj2;
		},
		_ido: function(obj1, obj2)
		{
			return this._do(obj1, obj2);
		}
	}
);

// Bitwise left shift
ul4.ShiftLeft = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj2 === false)
				obj2 = 0;
			else if (obj2 === true)
				obj2 = 1;
			if (obj2 < 0)
				return ul4.ShiftRight._do(obj1, -obj2);
			if (obj1 === false)
				obj1 = 0;
			else if (obj1 === true)
				obj1 = 1;
			while (obj2--)
				obj1 *= 2;
			return obj1;
		},
		_ido: function(obj1, obj2)
		{
			return this._do(obj1, obj2);
		}
	}
);

// Bitwise right shift
ul4.ShiftRight = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj2 === false)
				obj2 = 0;
			else if (obj2 === true)
				obj2 = 1;
			if (obj2 < 0)
				return ul4.ShiftLeft._do(obj1, -obj2);
			if (obj1 === false)
				obj1 = 0;
			else if (obj1 === true)
				obj1 = 1;
			while (obj2--)
				obj1 /= 2;
			return Math.floor(obj1);
		},
		_ido: function(obj1, obj2)
		{
			return this._do(obj1, obj2);
		}
	}
);

// Bitwise and
ul4.BitAnd = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj2 === false)
				obj2 = 0;
			else if (obj2 === true)
				obj2 = 1;
			return obj1 & obj2;
		},
		_ido: function(obj1, obj2)
		{
			return this._do(obj1, obj2);
		}
	}
);

// Bitwise exclusive or
ul4.BitXOr = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj2 === false)
				obj2 = 0;
			else if (obj2 === true)
				obj2 = 1;
			return obj1 ^ obj2;
		},
		_ido: function(obj1, obj2)
		{
			return this._do(obj1, obj2);
		}
	}
);

// Bitwise or
ul4.BitOr = ul4._inherit(
	ul4.Binary,
	{
		_do: function(obj1, obj2)
		{
			if (obj2 === false)
				obj2 = 0;
			else if (obj2 === true)
				obj2 = 1;
			return obj1 | obj2;
		},
		_ido: function(obj1, obj2)
		{
			return this._do(obj1, obj2);
		}
	}
);

ul4.And = ul4._inherit(
	ul4.Binary,
	{
		_jssource: function(out)
		{
			out.push("(function(){var obj1=");
			this.obj1._jssource(out);
			out.push("; return (!ul4._bool(obj1)) ? obj1 : ");
			this.obj2._jssource(out);
			out.push(";})()");
		}
	}
);

ul4.Or = ul4._inherit(
	ul4.Binary,
	{
		_jssource: function(out)
		{
			out.push("(function(){var obj1=");
			this.obj1._jssource(out);
			out.push("; return (ul4._bool(obj1)) ? obj1 : ");
			this.obj2._jssource(out);
			out.push(";})()");
		}
	}
);

ul4.Attr = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, obj, attrname)
		{
			var attr = ul4.AST.create.call(this, location, start, end);
			attr.obj = obj;
			attr.attrname = attrname;
			return attr;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["obj", "attrname"]),
		_repr: function(out)
		{
			out.push("<Attr");
			out.push(null);
			out.push(+1);
			out.push("obj=");
			this.obj._repr(out);
			out.push(null);
			out.push("attrname=");
			out.push(ul4._repr(this.attrname));
			out.push(null);
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("ul4.Attr._get(");
			this.obj._jssource(out);
			out.push(", ");
			out.push(ul4._asjson(this.attrname));
			out.push(")");
		},
		_jssource_set: function(out, value)
		{
			out.push("ul4.Attr._set(");
			this.obj._jssource(out);
			out.push(", ");
			out.push(ul4._asjson(this.attrname));
			out.push(", ");
			out.push(value);
			out.push(")");
		},
		_jssource_modify: function(out, operatorname, value)
		{
			out.push("ul4.Attr._modify(ul4.");
			out.push(operator);
			out.push(", ");
			this.obj._jssource(out);
			out.push(", ");
			out.push(ul4._asjson(this.attrname));
			out.push(", ");
			out.push(value);
			out.push(")");
		},
		_get: function(object, attrname)
		{
			if (typeof(object) === "string")
			{
				switch (attrname)
				{
					case "find":
						return ul4.expose("find", ["sub", ["start", null], ["end", null]], function(sub, start, end){ return ul4._find(object, sub, start, end); });
					case "rfind":
						return ul4.expose("rfind", ["sub", ["start", null], ["end", null]], function(sub, start, end){ return ul4._rfind(object, sub, start, end); });
					case "replace":
						return ul4.expose("replace", ["old", "new", ["count", null]], function(old, new_, count){ return ul4._replace(object, old, new_, count); });
					case "strip":
						return ul4.expose("strip", [["chars", null]], function(chars){ return ul4._strip(object, chars); });
					case "lstrip":
						return ul4.expose("lstrip", [["chars", null]], function(chars){ return ul4._lstrip(object, chars); });
					case "rstrip":
						return ul4.expose("rstrip", [["chars", null]], function(chars){ return ul4._rstrip(object, chars); });
					case "split":
						return ul4.expose("split", [["sep", null], ["count", null]], function(sep, count){ return ul4._split(object, sep, count); });
					case "rsplit":
						return ul4.expose("rsplit", [["sep", null], ["count", null]], function(sep, count){ return ul4._rsplit(object, sep, count); });
					case "lower":
						return ul4.expose("lower", [], function(){ return object.toLowerCase(); });
					case "upper":
						return ul4.expose("upper", [], function(){ return object.toUpperCase(); });
					case "capitalize":
						return ul4.expose("capitalize", [], function(){ return ul4._capitalize(object); });
					case "join":
						return ul4.expose("join", ["iterable"], function(iterable){ return ul4._join(object, iterable); });
					case "startswith":
						return ul4.expose("startswith", ["prefix"], function(prefix){ return ul4._startswith(object, prefix); });
					case "endswith":
						return ul4.expose("endswith", ["suffix"], function(suffix){ return ul4._endswith(object, suffix); });
					default:
						return ul4.undefined;
				}
			}
			else if (ul4._islist(object))
			{
				switch (attrname)
				{
					case "append":
						return ul4.expose("append", ["*items"], function(items){ return ul4._append(object, items); });
					case "insert":
						return ul4.expose("insert", ["pos", "*items"], function(pos, items){ return ul4._insert(object, pos, items); });
					case "pop":
						return ul4.expose("pop", [["pos", -1]], function(pos){ return ul4._pop(object, pos); });
					case "find":
						return ul4.expose("find", ["sub", ["start", null], ["end", null]], function(sub, start, end){ return ul4._find(object, sub, start, end); });
					case "rfind":
						return ul4.expose("rfind", ["sub", ["start", null], ["end", null]], function(sub, start, end){ return ul4._rfind(object, sub, start, end); });
					default:
						return ul4.undefined;
				}
			}
			else if (ul4._isdate(object))
			{
				switch (attrname)
				{
					case "weekday":
						return ul4.expose("weekday", [], function(){ return ul4._weekday(object); });
					case "week":
						return ul4.expose("week", [["firstweekday", null]], function(firstweekday){ return ul4._week(object, firstweekday); });
					case "day":
						return ul4.expose("day", [], function(){ return object.getDate(); });
					case "month":
						return ul4.expose("month", [], function(){ return object.getMonth()+1; });
					case "year":
						return ul4.expose("year", [], function(){ return object.getFullYear(); });
					case "hour":
						return ul4.expose("hour", [], function(){ return object.getHours(); });
					case "minute":
						return ul4.expose("minute", [], function(){ return object.getMinutes(); });
					case "second":
						return ul4.expose("second", [], function(){ return object.getSeconds(); });
					case "microsecond":
						return ul4.expose("microsecond", [], function(){ return object.getMilliseconds() * 1000; });
					case "mimeformat":
						return ul4.expose("mimeformat", [], function(){ return ul4._mimeformat(object); });
					case "isoformat":
						return ul4.expose("isoformat", [], function(){ return ul4._isoformat(object); });
					case "yearday":
						return ul4.expose("yearday", [], function(){ return ul4._yearday(object); });
					default:
						return ul4.undefined;
				}
			}
			else if (Object.prototype.toString.call(object) === "[object Object]")
			{
				switch (attrname)
				{
					case "get":
						return ul4.expose("get", ["key", ["default", null]], function(key, default_){ return ul4._get(object, key, default_); });
					case "items":
						return ul4.expose("items", [], function(){ return ul4._items(object); });
					case "values":
						return ul4.expose("values", [], function(){ return ul4._values(object); });
					case "update":
						return ul4.expose("update", ["*other", "**kwargs"], function(other, kwargs){ return ul4._update(object, other, kwargs); });
					default:
						if (object && typeof(object.__getattr__) === "function") // test this before the generic object test
							return object.__getattr__(attrname);
						else
							return object[attrname];
				}
			}
			throw "Attr._get() needs an object with attributes";
		},
		_set: function(object, attrname, value)
		{
			if (object && typeof(object.__setattr__) === "function")
				object.__setattr__(attrname, value);
			else
				object[attrname] = value;
		},
		_modify: function(operator, object, attrname, value)
		{
			this._set(object, attrname, operator._ido(this._get(object, attrname), value));
		}
	}
);

ul4.Call = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, obj, args, kwargs, remargs, remkwargs)
		{
			var call = ul4.AST.create.call(this, location, start, end);
			call.obj = obj;
			call.args = args;
			call.kwargs = kwargs;
			call.remargs = remargs;
			call.remkwargs = remkwargs;
			return call;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["obj", "args", "kwargs", "remargs", "remkwargs"]),
		_repr: function(out)
		{
			out.push("<Call");
			out.push(null);
			out.push(+1);
			out.push("obj=");
			this.obj._repr(out);
			out.push(null);
			for (var i = 0; i < this.args.length; ++i)
			{
				this.args[i]._repr(out);
				out.push(null);
			}
			for (var key in this.kwargs)
			{
				out.push(key);
				out.push("=");
				this.kwargs[key]._repr(out);
				out.push(null);
			}
			if (this.remargs !== null)
			{
				out.push("*");
				this.remargs._repr(out);
				out.push(null);
			}
			if (this.remkwargs !== null)
			{
				out.push("**");
				this.remkwargs._repr(out);
				out.push(null);
			}
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("ul4._call(");
			this.obj._jssource(out);
			out.push(", out, [");

			for (var i = 0; i < this.args.length; ++i)
			{
				if (i)
					out.push(", ");
				this.args[i]._jssource(out);
			}
			out.push("]");

			if (this.remargs !== null)
			{
				out.push(".concat(");
				this.remargs._jssource(out);
				out.push(")");
			}

			out.push(", ");

			if (this.remkwargs !== null)
				out.push("ul4._extend(");

			out.push("{");
			var first = true;
			for (var i = 0; i < this.kwargs.length; ++i)
			{
				if (first)
					first = false;
				else
					out.push(", ");
				out.push(ul4._asjson(this.kwargs[i][0]));
				out.push(": ");
				this.kwargs[i][1]._jssource(out);
			}
			out.push("}");
			if (this.remkwargs !== null)
			{
				out.push(", ");
				this.remkwargs._jssource(out);
				out.push(")");
			}
			out.push(")");
		}
	}
);

// List/String slicing access and assignment: string[start:stop], list[start:stop]
ul4.Slice = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, obj, index1, index2)
		{
			var getslice = ul4.AST.create.call(this, location, start, end);
			getslice.obj = obj;
			getslice.index1 = index1;
			getslice.index2 = index2;
			return getslice;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["obj", "index1", "index2"]),
		_repr: function(out)
		{
			out.push("<Slice");
			out.push(null);
			out.push(+1);
			out.push("obj=");
			this.obj1._repr(out);
			out.push(null);
			if (this.index1 !== null)
			{
				out.push("index1=");
				this.index1._repr(out);
				out.push(null);
			}
			if (this.index2 !== null)
			{
				out.push("index2=");
				this.index2._repr(out);
				out.push(null);
			}
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("ul4.Slice._get(");
			this.obj._jssource(out);
			out.push(", ");
			if (this.index1 !== null)
				this.index1._jssource(out);
			else
				out.push("null");
			out.push(", ");
			if (this.index2 !== null)
				this.index2._jssource(out);
			else
				out.push("null");
			 out.push(")");
		},
		_jssource_set: function(out, value)
		{
			out.push("ul4.Slice._set(");
			this.obj._jssource(out);
			out.push(", ");
			if (this.index1 !== null)
				this.index1._jssource(out);
			else
				out.push("null");
			out.push(", ");
			if (this.index2 !== null)
				this.index2._jssource(out);
			else
				out.push("null");
			out.push(", ");
			out.push(value);
			out.push(")");
		},
		_jssource_modify: function(out, operatorname, value)
		{
			throw "augmented slice assignment is not supported!";
		},
		_get: function(container, start, stop)
		{
			if (typeof(start) === "undefined" || start === null)
				start = 0;
			if (typeof(stop) === "undefined" || stop === null)
				stop = container.length;
			return container.slice(start, stop);
		},
		_set: function(container, start, stop, value)
		{
			if (ul4._islist(container))
			{
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
				for (var iter = ul4._iter(value);;)
				{
					var item = iter();
					if (item === null)
						break;
					container.splice(start++, 0, item[0]);
				}
			}
			else
				throw "setslice() needs a list";
		}
	}
);

ul4.SetVar = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end, lvalue, value)
		{
			var changevar = ul4.AST.create.call(this, location, start, end);
			changevar.lvalue = lvalue;
			changevar.value = value;
			return changevar;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["lvalue", "value"]),
		_repr: function(out)
		{
			out.push("<");
			out.push(this.name);
			out.push(null);
			out.push(+1);
			out.push("lvalue=");
			out.push(ul4._repr(this.lvalue));
			out.push(null);
			out.push("value=");
			this.value._repr(out);
			out.push(null);
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("var value" + this.__id__ + " = ul4._unpackvar(");
			this.value._jssource(out);
			out.push(", ");
			out.push(ul4._asjson(ul4._shape(this.lvalue)));
			out.push(");");
			out.push(null);
			this._jssource_value(out, this.lvalue, "value" + this.__id__);
		},
		_jssource_value: function(out, lvalue, value)
		{
			if (!ul4._islist(lvalue))
			{
				lvalue._jssource_set(out, value);
				out.push(";");
				out.push(null);
			}
			else
			{
				for (var i = 0; i < lvalue.length; ++i)
					this._jssource_value(out, lvalue[i], value + "[" + i + "]");
			}
		}
	}
);

ul4.ModifyVar = ul4._inherit(
	ul4.SetVar,
	{
		_jssource_value: function(out, lvalue, value)
		{
			if (!ul4._islist(lvalue))
			{
				lvalue._jssource_modify(out, this._operator, value);
				out.push(";");
				out.push(null);
			}
			else
			{
				for (var i = 0; i < lvalue.length; ++i)
					this._jssource_value(out, lvalue[i], value + "[" + i + "]");
			}
		}
});

ul4.AddVar = ul4._inherit(ul4.ModifyVar, { _operator: "Add" });

ul4.SubVar = ul4._inherit(ul4.ModifyVar, { _operator: "Sub" });

ul4.MulVar = ul4._inherit(ul4.ModifyVar, { _operator: "Mul" });

ul4.TrueDivVar = ul4._inherit(ul4.ModifyVar, { _operator: "TrueDiv" });

ul4.FloorDivVar = ul4._inherit(ul4.ModifyVar, { _operator: "FloorDiv" });

ul4.ModVar = ul4._inherit(ul4.ModifyVar, { _operator: "Mod" });

ul4.ShiftLeftVar = ul4._inherit(ul4.ModifyVar, { _operator: "ShiftLeft" });

ul4.ShiftRightVar = ul4._inherit(ul4.ModifyVar, { _operator: "ShiftRight" });

ul4.BitAndVar = ul4._inherit(ul4.ModifyVar, { _operator: "BitAnd" });

ul4.BitXOrVar = ul4._inherit(ul4.ModifyVar, { _operator: "BitXOr" });

ul4.BitOrVar = ul4._inherit(ul4.ModifyVar, { _operator: "BitOr" });

ul4.Block = ul4._inherit(
	ul4.AST,
	{
		create: function(location, start, end)
		{
			var block = ul4.AST.create.call(this, location, start, end);
			block.endlocation = null;
			block.content = [];
			return block;
		},
		_ul4onattrs: ul4.AST._ul4onattrs.concat(["endlocation", "content"]),
		_add2template: function(template)
		{
			ul4.AST._add2template.call(this, template);
			for (var i = 0; i < this.content.length; ++i)
				this.content[i]._add2template(template);
		},
		_repr: function(out)
		{
			for (var i = 0; i < this.content.length; ++i)
			{
				this.content[i]._repr(out);
				out.push(null);
			}
		},
		_jssource_content: function(out)
		{
			for (var i = 0; i < this.content.length; ++i)
			{
				this.content[i]._jssource(out);
				out.push(";");
				out.push(null);
			}
		},
		_str: function(out)
		{
			if (this.content.length)
			{
				for (var i = 0; i < this.content.length; ++i)
				{
					this.content[i]._str(out);
					out.push(null);
				}
			}
			else
			{
				out.push("pass");
				out.push(null);
			}
		}
	}
);

ul4.ForBlock = ul4._inherit(
	ul4.Block,
	{
		create: function(location, start, end, varname, container)
		{
			var for_ = ul4.Block.create.call(this, location, start, end);
			for_.varname = varname;
			for_.container = container;
			return for_;
		},
		_ul4onattrs: ul4.Block._ul4onattrs.concat(["varname", "container"]),
		_repr: function(out)
		{
			out.push("<For");
			out.push(null);
			out.push(+1);
			out.push("varname=");
			out.push(ul4._repr(this.varname));
			out.push(null);
			out.push("container=");
			this.container._repr(out);
			ul4.Block._repr.call(this, out);
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("for (var iter" + this.__id__ + " = ul4._iter(");
			this.container._jssource(out);
			out.push(");;)");
			out.push(null);
			out.push("{");
			out.push(null);
			out.push(+1);
			out.push("var item" + this.__id__ + " = iter" + this.__id__ + "();");
			out.push(null);
			out.push("if (item" + this.__id__ + " === null)");
			out.push(null);
			out.push(+1);
			out.push("break;");
			out.push(null);
			out.push(-1);
			out.push("var value" + this.__id__ + " = ul4._unpackvar(item" + this.__id__ + "[0], ");
			out.push(ul4._asjson(ul4._shape(this.varname)));
			out.push(");");
			out.push(null);
			this._jssource_value(out, this.varname, "value" + this.__id__);
			this._jssource_content(out);
			out.push(-1);
			out.push("}");
			out.push(null);
		},
		_jssource_value: function(out, lvalue, value)
		{
			if (!ul4._islist(lvalue))
			{
				lvalue._jssource_set(out, "set", value);
				out.push(";");
				out.push(null);
			}
			else
			{
				for (var i = 0; i < lvalue.length; ++i)
					this._jssource_value(out, lvalue[i], value + "[" + i + "]");
			}
		},
		_str: function(out)
		{
			out.push("for ");
			ul4.AST._str.call(this, out);
			out.push(":");
			out.push(null);
			out.push(+1);
			ul4.Block._str.call(this, out);
			out.push(-1);
		}
	}
);

ul4.Break = ul4._inherit(
	ul4.AST,
	{
		_jssource: function(out)
		{
			out.push("break");
		},
		_str: function(out)
		{
			out.push("break");
		},
		_repr: function(out)
		{
			out.push("<Break>");
		}
	}
);

ul4.Continue = ul4._inherit(
	ul4.AST,
	{
		_jssource: function(out)
		{
			out.push("continue");
		},
		_str: function(out)
		{
			out.push("continue");
		},
		_repr: function(out)
		{
			out.push("<Continue>");
		}
	}
);

ul4.CondBlock = ul4._inherit(
	ul4.Block,
	{
		_jssource: function(out)
		{
			for (var i = 0; i < this.content.length; ++i)
				this.content[i]._jssource(out);
		}
	}
);

ul4.ConditionalBlock = ul4._inherit(
	ul4.Block,
	{
		create: function(location, start, end, condition)
		{
			var block = ul4.Block.create.call(this, location, start, end);
			block.condition = condition;
			return block;
		},
		_ul4onattrs: ul4.Block._ul4onattrs.concat(["condition"]),
		_repr: function(out)
		{
			out.push("<");
			out.push(this.type);
			out.push(null);
			out.push(+1);
			out.push("condition=");
			this.condition._repr(out);
			ul4.Block._repr.call(this, out);
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push(this._sourcejs);
			out.push(" (ul4._bool(");
			this.condition._jssource(out);
			out.push("))");
			out.push(null);
			out.push("{");
			out.push(null);
			out.push(+1);
			this._jssource_content(out);
			out.push(-1);
			out.push("}");
			out.push(null);
		},
		_str: function(out)
		{
			out.push(this._sourcejs);
			out.push(" ");
			ul4.AST._str.call(this, out);
			out.push(":");
			out.push(null);
			out.push(+1);
			ul4.Block._str.call(this, out);
			out.push(-1);
		}
	}
);

ul4.IfBlock = ul4._inherit(ul4.ConditionalBlock, {_sourcejs: "if"});

ul4.ElIfBlock = ul4._inherit(ul4.ConditionalBlock, {_sourcejs: "else if"});

ul4.ElseBlock = ul4._inherit(
	ul4.Block,
	{
		_repr: function(out)
		{
			out.push("<Else");
			out.push(null);
			out.push(+1);
			ul4.Block._repr.call(this, out);
			out.push(-1);
			out.push(">");
		},
		_jssource: function(out)
		{
			out.push("else");
			out.push(null);
			out.push("{");
			out.push(null);
			out.push(+1);
			this._jssource_content(out);
			out.push(-1);
			out.push("}");
			out.push(null);
		},
		_str: function(out)
		{
			out.push("else:");
			out.push(null);
			out.push(+1);
			ul4.Block._str.call(this, out);
			out.push(-1);
		}
	}
);

ul4.Template = ul4._inherit(
	ul4.Block,
	{
		create: function(location, start, end, source, name, keepws, startdelim, enddelim)
		{
			var template = ul4.Block.create.call(this, location, start, end);
			template.source = source;
			template.name = name;
			template.keepws = keepws;
			template.startdelim = startdelim;
			template.enddelim = enddelim;
			template._jsfunction = null;
			template._asts = null;
			return template;
		},
		ul4ondump: function(encoder)
		{
			encoder.dump(ul4.version);
			encoder.dump(this.source);
			encoder.dump(this.name);
			encoder.dump(this.keepws);
			encoder.dump(this.startdelim);
			encoder.dump(this.enddelim);
			ul4.Block.ul4ondump.call(this, encoder);
		},
		ul4onload: function(decoder)
		{
			var version = decoder.load();
			if (version !== ul4.version)
				throw "invalid version, expected " + ul4.version + ", got " + version;
			this.source = decoder.load();
			this.name = decoder.load();
			this.keepws = decoder.load();
			this.startdelim = decoder.load();
			this.enddelim = decoder.load();
			ul4.Block.ul4onload.call(this, decoder);
		},
		_getast: function(id)
		{
			if (this._asts === null)
			{
				this._asts = {};
				this._add2template(this);
			}
			return this._asts[id];
		},
		loads: function(string)
		{
			return ul4on.loads(string);
		},
		_jssource: function(out)
		{
			out.push("ul4.Var._set(vars, " + ul4._asjson(this.name) + ", ul4.TemplateClosure.create(self._getast(" + this.__id__ + "), vars))");
		},
		_repr: function(out)
		{
			out.push("<Template");
			out.push(null);
			out.push(+1);
			out.push("name=");
			out.push(ul4._repr(this.name));
			out.push(null);
			out.push("keepws=");
			out.push(ul4._repr(this.keepws));
			out.push(null);
			if (this.startdelim !== "<?")
			{
				out.push("startdelim=");
				out.push(ul4._repr(this.startdelim));
				out.push(null);
			}
			if (this.enddelim !== "?>")
			{
				out.push("enddelim=");
				out.push(ul4._repr(this.enddelim));
				out.push(null);
			}
			ul4.Block._repr.call(this, out);
			out.push(-1);
			out.push(">");
		},
		_str: function(out)
		{
			out.push("def ");
			out.push(this.name ? this.name : "unnamed");
			out.push(":");
			out.push(null);
			out.push(+1);
			ul4.Block._str.call(this, out);
			out.push(-1);
		},
		_makesource: function()
		{
			var out = [];
			out.push("(function(self, out, vars)");
			out.push(null);
			out.push("{");
			out.push(null);
			out.push(+1);
			out.push("vars = ul4._simpleclone(vars);"); // variables assignments shouldn't be visible in the parent
			out.push(null);
			this._jssource_content(out);
			out.push(-1);
			out.push("})");
			out.push(null);
			return ul4._formatsource(out);
		},
		render: function(out, vars)
		{
			if (this._jsfunction === null)
				this._jsfunction = eval(this._makesource());
			this._jsfunction(this, out, vars || {});
		},
		renders: function(vars)
		{
			var out = []
			this.render(out, vars);
			return out.join("");
		},
		__getattr__: function(attrname)
		{
			var object = this;
			switch (attrname)
			{
				case "location":
					return this.location;
				case "endlocation":
					return this.endlocation;
				case "content":
					return this.content;
				case "source":
					return this.source;
				case "name":
					return this.name;
				case "keepws":
					return this.keepws;
				case "startdelim":
					return this.startdelim;
				case "enddelim":
					return this.enddelim;
				case "render":
					return ul4.expose("render", ["**vars"], true, function(out, vars){ return object.render(out, vars); });
				case "renders":
					return ul4.expose("renders", ["**vars"], function(vars){ return object.renders(vars); });
				default:
					return ul4.undefined;
			}
		},
		call: function(vars)
		{
			if (this._jsfunction === null)
				this._jsfunction = eval(this._makesource());
			var out = [];
			return this._jsfunction(this, out, vars || {});
		},
		__call__: ul4.expose(null, ["**vars"], function(vars){ return this.call(vars); }),
		__type__: "template" // used by ``istemplate()``
	}
);

ul4.TemplateClosure = ul4._inherit(
	ul4.Proto,
	{
		create: function(template, vars)
		{
			var closure = ul4._clone(this);
			closure.template = template;
			// Store a frozen copy of the current values of the parent template
			closure.vars = ul4._extend({}, vars);
			// The template (i.e. the closure) itself should be visible in the parent variables
			closure.vars[template.name] = closure;
			// Copy over the required attribute from the template
			closure.name = template.name;
			closure.location = template.location;
			closure.endlocation = template.endlocation;
			closure.source = template.source;
			closure.startdelim = template.startdelim;
			closure.enddelim = template.enddelim;
			closure.content = template.content;
			return closure;
		},
		render: function(out, vars)
		{
			this.template.render(out, ul4._simpleinherit(this.vars, vars));
		},
		renders: function(vars)
		{
			return this.template.renders(ul4._simpleinherit(this.vars, vars));
		},
		call: function(vars)
		{
			return this.template.call(ul4._simpleinherit(this.vars, vars));
		},
		__getattr__: function(attrname)
		{
			var object = this;
			switch (attrname)
			{
				case "render":
					return ul4.expose("render", ["**vars"], true, function(out, vars){ return object.render(out, vars); });
				case "renders":
					return ul4.expose("renders", ["**vars"], function(vars){ return object.renders(vars); });
				default:
					return this.template.__getattr__(attrname);
			}
		},
		__call__: ul4.expose(null, ["**vars"], function(vars){ return this.call(vars); }),
		__type__: "template" // used by ``istemplate()``
	}
);

// Create a color object from the red, green, blue and alpha values ``r``, ``g``, ``b`` and ``b``
ul4._rgb = function(r, g, b, a)
{
	return this.Color.create(255*r, 255*g, 255*b, 255*a);
};

// Convert ``obj`` to a string and escape the characters ``&``, ``<``, ``>``, ``'`` and ``"`` with their XML character/entity reference
ul4._xmlescape = function(obj)
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
ul4._csv = function(obj)
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
ul4._chr = function(i)
{
	if (typeof(i) != "number")
		throw "chr() requires an int";
	return String.fromCharCode(i);
};

// Return the codepoint for the one and only character in the string ``c``
ul4._ord = function(c)
{
	if (typeof(c) != "string" || c.length != 1)
		throw "ord() requires a string of length 1";
	return c.charCodeAt(0);
};

// Convert an integer to a hexadecimal string
ul4._hex = function(number)
{
	if (typeof(number) != "number")
		throw "hex() requires an int";
	if (number < 0)
		return "-0x" + number.toString(16).substr(1);
	else
		return "0x" + number.toString(16);
};

// Convert an integer to a octal string
ul4._oct = function(number)
{
	if (typeof(number) != "number")
		throw "oct() requires an int";
	if (number < 0)
		return "-0o" + number.toString(8).substr(1);
	else
		return "0o" + number.toString(8);
};

// Convert an integer to a binary string
ul4._bin = function(number)
{
	if (typeof(number) != "number")
		throw "bin() requires an int";
	if (number < 0)
		return "-0b" + number.toString(2).substr(1);
	else
		return "0b" + number.toString(2);
};

// Return the minimum value
ul4._min = function(obj)
{
	if (obj.length == 0)
		throw "min() requires at least 1 argument, 0 given";
	else if (obj.length == 1)
		obj = obj[0];
	var iter = ul4._iter(obj);
	var result;
	var first = true;
	while (true)
	{
		var item = iter();
		if (item === null)
		{
			if (first)
				throw "min() argument is an empty sequence!";
			return result;
		}
		if (first || (item[0] < result))
			result = item[0];
		first = false;
	}
};

// Return the maximum value
ul4._max = function(obj)
{
	if (obj.length == 0)
		throw "max() requires at least 1 argument, 0 given";
	else if (obj.length == 1)
		obj = obj[0];
	var iter = ul4._iter(obj);
	var result;
	var first = true;
	while (true)
	{
		var item = iter();
		if (item === null)
		{
			if (first)
				throw "max() argument is an empty sequence!";
			return result;
		}
		if (first || (item[0] > result))
			result = item[0];
		first = false;
	}
};

// Return the of the values from the iterable starting with ``start`` (default ``0``)
ul4._sum = function(iterable, start)
{
	if (typeof(start) === "undefined")
		start = 0;

	var iter = ul4._iter(iterable);

	while (1)
	{
		var value = iter();
		if (value === null)
			break;
		start += value[0];
	}
	return start;
};

// Return the first value produced by iterating through ``iterable`` (defaulting to ``defaultValue`` if the iterator is empty)
ul4._first = function(iterable, defaultValue)
{
	if (typeof(defaultValue) === "undefined")
		defaultValue = null;

	var iter = ul4._iter(iterable);
	var value = iter();
	return (value !== null) ? value[0] : defaultValue;
};

// Return the last value produced by iterating through ``iterable`` (defaulting to ``defaultValue`` if the iterator is empty)
ul4._last = function(iterable, defaultValue)
{
	if (typeof(defaultValue) === "undefined")
		defaultValue = null;

	var iter = ul4._iter(iterable);

	var value = defaultValue;
	while (1)
	{
		var itervalue = iter();
		if (itervalue === null)
			break;
		value = itervalue[0];
	}
	return value;
};

// Return a sorted version of ``iterable``
ul4._sorted = function(iterable)
{
	var result = ul4._list(iterable);
	result.sort();
	return result;
};

// Return a iterable object iterating from ``start`` upto (but not including) ``stop`` with a step size of ``step``
ul4._range = function(args)
{
	var start, stop, step;
	if (args.length < 1)
		throw "required range() argument missing";
	else if (args.length > 3)
		throw "range() expects at most 3 positional arguments, " + args.length + " given";
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
	var lower, higher;
	if (step === 0)
		throw "range() requires a step argument != 0";
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
	var length = (lower < heigher) ? Math.floor((heigher - lower - 1)/Math.abs(step)) + 1 : 0;

	var i = 0;
	var result = function()
	{
		if (i >= length)
			return null;
		return [start + (i++) * step];
	};
	return ul4._markiter(result);
};

// Return a iterable object returning a slice from the argument
ul4._slice = function(args)
{
	var iterable, start, stop, step;
	if (args.length < 2)
		throw "required slice() argument missing";
	else if (args.length > 4)
		throw "slice() expects at most 4 positional arguments, " + args.length + " given";
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
	var lower, higher;
	if (start < 0)
		throw "slice() requires a start argument >= 0";
	if (stop < 0)
		throw "slice() requires a stop argument >= 0";
	if (step <= 0)
		throw "slice() requires a step argument > 0";

	iterable = ul4._iter(iterable);
	var next = start, count = 0;
	var result = function()
	{
		var result;
		while (count < next)
		{
			result = iterable();
			if (result === null)
				return null;
			++count;
		}
		if (stop !== null && count >= stop)
			return null;
		result = iterable();
		if (result === null)
			return null;
		++count;
		next += step;
		if (stop !== null && next > stop)
			next = stop;
		return result;
	};
	return ul4._markiter(result);
};

// ``%`` escape unsafe characters in the string ``string``
ul4._urlquote = function(string)
{
	return encodeURIComponent(string);
};

// The inverse function of ``urlquote``
ul4._urlunquote = function(string)
{
	return decodeURIComponent(string);
};

// Return a reverse iterator over ``sequence``
ul4._reversed = function(sequence)
{
	if (typeof(sequence) != "string" && !ul4._islist(sequence)) // We don't have to materialize strings or lists
		sequence = ul4._list(sequence);
	var i = sequence.length-1;
	var result = function()
	{
		return i >= 0 ? [sequence[i--]] : null;
	};
	return ul4._markiter(result);
};

// Returns a random number in the interval ``[0;1[``
ul4._random = function()
{
	return Math.random();
};

// Return a randomly select item from ``range(start, stop, step)``
ul4._randrange = function(args)
{
	var start, stop, step;
	if (args.length < 1)
		throw "required randrange() argument missing";
	else if (args.length > 3)
		throw "randrange() expects at most 3 positional arguments, " + args.length + " given";
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
	var width = stop-start;

	var value = Math.random();

	var n;
	if (step > 0)
		n = Math.floor((width + step - 1) / step);
	else if (step < 0)
		n = Math.floor((width + step + 1) / step);
	else
		throw "randrange() requires a step argument != 0";
	return start + step*Math.floor(value * n);
};

// Return a random item/char from the list/string ``sequence``
ul4._randchoice = function(sequence)
{
	var iscolor = ul4._iscolor(sequence);
	if (typeof(sequence) !== "string" && !ul4._islist(sequence) && !iscolor)
		throw "randchoice() requires a string or list";
	if (iscolor)
		sequence = ul4._list(sequence);
	return sequence[Math.floor(Math.random() * sequence.length)];
};

// Return an iterator over ``[index, item]`` lists from the iterable object ``iterable``. ``index`` starts at ``start`` (defaulting to 0)
ul4._enumerate = function(iterable, start)
{
	if (typeof(start) === "undefined")
		start = 0;

	var iter = ul4._iter(iterable);
	var i = start;
	var result = function()
	{
		var inner = iter();
		return inner !== null ? [[i++, inner[0]]] : null;
	};
	return ul4._markiter(result);
};

// Return an iterator over ``[isfirst, item]`` lists from the iterable object ``iterable`` (``isfirst`` is true for the first item, false otherwise)
ul4._isfirst = function(iterable)
{
	var iter = ul4._iter(iterable);
	var isfirst = true;
	var result = function()
	{
		var inner = iter();
		var result = inner !== null ? [[isfirst, inner[0]]] : null;
		isfirst = false;
		return result;
	};
	return ul4._markiter(result);
};

// Return an iterator over ``[islast, item]`` lists from the iterable object ``iterable`` (``islast`` is true for the last item, false otherwise)
ul4._islast = function(iterable)
{
	var iter = ul4._iter(iterable);
	var lastitem = iter();
	var result = function()
	{
		if (lastitem === null)
			return null;
		var inner = iter();
		var result = [[inner === null, lastitem[0]]];
		lastitem = inner;
		return result;
	};
	return ul4._markiter(result);
};

// Return an iterator over ``[isfirst, islast, item]`` lists from the iterable object ``iterable`` (``isfirst`` is true for the first item, ``islast`` is true for the last item. Both are false otherwise)
ul4._isfirstlast = function(iterable)
{
	var iter = ul4._iter(iterable);
	var isfirst = true;
	var lastitem = iter();
	var result = function()
	{
		if (lastitem === null)
			return null;
		var inner = iter();
		var result = [[isfirst, inner === null, lastitem[0]]];
		lastitem = inner;
		isfirst = false;
		return result;
	};
	return ul4._markiter(result);
};

// Return an iterator over ``[index, isfirst, islast, item]`` lists from the iterable object ``iterable`` (``isfirst`` is true for the first item, ``islast`` is true for the last item. Both are false otherwise)
ul4._enumfl = function(iterable, start)
{
	var iter = ul4._iter(iterable);
	var i = start;
	var isfirst = true;
	var lastitem = iter();
	var result = function()
	{
		if (lastitem === null)
			return null;
		var inner = iter();
		var result = [[i++, isfirst, inner === null, lastitem[0]]];
		lastitem = inner;
		isfirst = false;
		return result;
	};
	return ul4._markiter(result);
};

// Return an iterator over lists, where the i'th list consists of all i'th items from the arguments (terminating when the shortest argument ends)
ul4._zip = function(iterables)
{
	var result;
	if (iterables.length)
	{
		var iters = [];
		for (var i = 0; i < iterables.length; ++i)
			iters.push(ul4._iter(iterables[i]));

		result = function()
		{
			var items = [];
			for (var i = 0; i < iters.length; ++i)
			{
				var item = iters[i]();
				if (item === null)
					return null;
				items.push(item[0]);
			}
			return [items];
		};
	}
	else
	{
		result = function()
		{
			return null;
		}
	}
	return ul4._markiter(result);
};

// Return the absolute value for the number ``number``
ul4._abs = function(number)
{
	if (number !== null && typeof(number.__abs__) === "function")
		return number.__abs__();
	return Math.abs(number);
};

// Return a ``Date`` object from the arguments passed in
ul4._date = function(year, month, day, hour, minute, second, microsecond)
{
	if (typeof(hour) === "undefined")
		hour = 0;

	if (typeof(minute) === "undefined")
		minute = 0;

	if (typeof(second) === "undefined")
		second = 0;

	if (typeof(microsecond) === "undefined")
		microsecond = 0;

	return new Date(year, month-1, day, hour, minute, second, microsecond/1000);
};

// Return a ``TimeDelta`` object from the arguments passed in
ul4._timedelta = function(days, seconds, microseconds)
{
	return this.TimeDelta.create(days, seconds, microseconds);
};

// Return a ``MonthDelta`` object from the arguments passed in
ul4._monthdelta = function(months)
{
	return this.MonthDelta.create(months);
};

// Return a ``Color`` object from the hue, luminescence, saturation and alpha values ``h``, ``l``, ``s`` and ``a`` (i.e. using the HLS color model)
ul4._hls = function(h, l, s, a)
{
	var _v = function(m1, m2, hue)
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

	var m1, m2;
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
ul4._hsv = function(h, s, v, a)
{
	if (s === 0.0)
		return ul4._rgb(v, v, v, a);
	var i = Math.floor(h*6.0);
	var f = (h*6.0) - i;
	var p = v*(1.0 - s);
	var q = v*(1.0 - s*f);
	var t = v*(1.0 - s*(1.0-f));
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
ul4._get = function(container, key, defaultvalue)
{
	if (!ul4._isdict(container))
		throw "get() requires a dict";

	var result = container[key];
	if (typeof(result) === "undefined")
		return defaultvalue;
	return result;
};

// Return a ``Date`` object for the current time
ul4._now = function()
{
	return new Date();
};

// Return a ``Date`` object for the current time in UTC
ul4._utcnow = function()
{
	var now = new Date();
	// FIXME: The timezone is wrong for the new ``Date`` object.
	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
};

ul4.functions = {
	print: ul4.expose("print", ["*args"], true, ul4._print),
	printx: ul4.expose("printx", ["*args"], true, ul4._printx),
	repr: ul4.expose("repr", ["obj"], ul4._repr),
	str: ul4.expose("str", [["obj", ""]], ul4._str),
	int: ul4.expose("int", [["obj", 0], ["base", null]], ul4._int),
	float: ul4.expose("float", [["obj", 0.0]], ul4._float),
	list: ul4.expose("list", [["iterable", []]], ul4._list),
	bool: ul4.expose("bool", [["obj", false]], ul4._bool),
	len: ul4.expose("len", ["sequence"], ul4._len),
	type: ul4.expose("type", ["obj"], ul4._type),
	format: ul4.expose("format", ["obj", "fmt", ["lang", null]], ul4._format),
	any: ul4.expose("any", ["iterable"], ul4._any),
	all: ul4.expose("all", ["iterable"], ul4._all),
	zip: ul4.expose("zip", ["*iterables"], ul4._zip),
	isundefined: ul4.expose("isundefined", ["obj"], ul4._isundefined),
	isdefined: ul4.expose("isdefined", ["obj"], ul4._isdefined),
	isnone: ul4.expose("isnone", ["obj"], ul4._isnone),
	isbool: ul4.expose("isbool", ["obj"], ul4._isbool),
	isint: ul4.expose("isint", ["obj"], ul4._isint),
	isfloat: ul4.expose("isfloat", ["obj"], ul4._isfloat),
	isstr: ul4.expose("isstr", ["obj"], ul4._isstr),
	isdate: ul4.expose("isdate", ["obj"], ul4._isdate),
	iscolor: ul4.expose("iscolor", ["obj"], ul4._iscolor),
	istimedelta: ul4.expose("istimedelta", ["obj"], ul4._istimedelta),
	ismonthdelta: ul4.expose("ismonthdelta", ["obj"], ul4._ismonthdelta),
	istemplate: ul4.expose("istemplate", ["obj"], ul4._istemplate),
	isfunction: ul4.expose("isfunction", ["obj"], ul4._isfunction),
	islist: ul4.expose("islist", ["obj"], ul4._islist),
	isdict: ul4.expose("isdict", ["obj"], ul4._isdict),
	asjson: ul4.expose("asjson", ["obj"], ul4._asjson),
	fromjson: ul4.expose("fromjson", ["string"], ul4._fromjson),
	asul4on: ul4.expose("asul4on", ["obj"], ul4._asul4on),
	fromul4on: ul4.expose("fromul4on", ["string"], ul4._fromul4on),
	now: ul4.expose("now", [], ul4._now),
	utcnow: ul4.expose("utcnow", [], ul4._utcnow),
	enumerate: ul4.expose("enumerate", ["iterable", ["start", 0]], ul4._enumerate),
	isfirst: ul4.expose("isfirst", ["iterable"], ul4._isfirst),
	islast: ul4.expose("islast", ["iterable"], ul4._islast),
	isfirstlast: ul4.expose("isfirstlast", ["iterable"], ul4._isfirstlast),
	enumfl: ul4.expose("enumfl", ["iterable", ["start", 0]], ul4._enumfl),
	abs: ul4.expose("abs", ["number"], ul4._abs),
	date: ul4.expose("date", ["year", "month", "day", ["hour", 0], ["minute", 0], ["second", 0], ["microsecond", 0]], ul4._date),
	timedelta: ul4.expose("timedelta", [["days", 0], ["seconds", 0], ["microseconds", 0]], ul4._timedelta),
	monthdelta: ul4.expose("monthdelta", [["months", 0]], ul4._monthdelta),
	rgb: ul4.expose("rgb", ["r", "g", "b", ["a", 1.0]], ul4._rgb),
	hls: ul4.expose("hls", ["h", "l", "s", ["a", 1.0]], ul4._hls),
	hsv: ul4.expose("hsv", ["h", "s", "v", ["a", 1.0]], ul4._hsv),
	xmlescape: ul4.expose("xmlescape", ["obj"], ul4._xmlescape),
	csv: ul4.expose("csv", ["obj"], ul4._csv),
	chr: ul4.expose("chr", ["i"], ul4._chr),
	ord: ul4.expose("ord", ["c"], ul4._ord),
	hex: ul4.expose("hex", ["number"], ul4._hex),
	oct: ul4.expose("oct", ["number"], ul4._oct),
	bin: ul4.expose("bin", ["number"], ul4._bin),
	min: ul4.expose("min", ["*obj"], ul4._min),
	max: ul4.expose("max", ["*obj"], ul4._max),
	sum: ul4.expose("sum", ["iterable", ["start", 0]], ul4._sum),
	first: ul4.expose("first", ["iterable", ["default", null]], ul4._first),
	last: ul4.expose("last", ["iterable", ["default", null]], ul4._last),
	sorted: ul4.expose("sorted", ["iterable"], ul4._sorted),
	range: ul4.expose("range", ["*args"], ul4._range),
	slice: ul4.expose("slice", ["*args"], ul4._slice),
	urlquote: ul4.expose("urlquote", ["string"], ul4._urlquote),
	urlunquote: ul4.expose("urlunquote", ["string"], ul4._urlunquote),
	reversed: ul4.expose("reversed", ["sequence"], ul4._reversed),
	random: ul4.expose("random", [], ul4._random),
	randrange: ul4.expose("randrange", ["*args"], ul4._randrange),
	randchoice: ul4.expose("randchoice", ["sequence"], ul4._randchoice)
};

// Functions implementing UL4 methods
ul4._replace = function(string, old, new_, count)
{
	if (count === null)
		count = string.length;

	var result = [];
	while (string.length)
	{
		var pos = string.indexOf(old);
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

ul4._strip = function(string, chars)
{
	if (chars === null)
		chars = " \r\n\t";
	else if (typeof(chars) !== "string")
		throw "strip() requires two strings";

	while (string && chars.indexOf(string[0]) >= 0)
		string = string.substr(1);
	while (string && chars.indexOf(string[string.length-1]) >= 0)
		string = string.substr(0, string.length-1);
	return string;
};

ul4._lstrip = function(string, chars)
{
	if (chars === null)
		chars = " \r\n\t";
	else if (typeof(chars) !== "string")
		throw "lstrip() requires two strings";

	while (string && chars.indexOf(string[0]) >= 0)
		string = string.substr(1);
	return string;
};

ul4._rstrip = function(string, chars)
{
	if (chars === null)
		chars = " \r\n\t";
	else if (typeof(chars) !== "string")
		throw "rstrip() requires two strings";

	while (string && chars.indexOf(string[string.length-1]) >= 0)
		string = string.substr(0, string.length-1);
	return string;
};

ul4._split = function(string, sep, count)
{
	if (sep !== null && typeof(sep) !== "string")
		throw "split() requires a string";

	if (count === null)
	{
		var result = string.split(sep !== null ? sep : /[ \n\r\t]+/);
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
			var result = [];
			while (string.length)
			{
				var pos = string.indexOf(sep);
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
			var result = [];
			while (string.length)
			{
				string = ul4._lstrip(string, null);
				var part;
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

ul4._rsplit = function(string, sep, count)
{
	if (sep !== null && typeof(sep) !== "string")
		throw "rsplit() requires a string as second argument";

	if (count === null)
	{
		var result = string.split(sep !== null ? sep : /[ \n\r\t]+/);
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
			var result = [];
			while (string.length)
			{
				var pos = string.lastIndexOf(sep);
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
			var result = [];
			while (string.length)
			{
				string = ul4._rstrip(string, null, null);
				var part;
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

ul4._find = function(obj, sub, start, end)
{
	if (start < 0)
		start += obj.length;
	if (start < 0)
		start = 0;
	if (start === null)
		start = 0;
	if (end === null)
		end = obj.length;

	if (start !== 0 || end !== obj.length)
	{
		if (typeof(obj) == "string")
			obj = obj.substring(start, end);
		else
			obj = obj.slice(start, end);
	}
	var result = obj.indexOf(sub);
	if (result !== -1)
		result += start;
	return result;
};

ul4._rfind = function(obj, sub, start, end)
{
	if (start < 0)
		start += obj.length;
	if (start < 0)
		start = 0;
	if (start === null)
		start = 0;
	if (end === null)
		end = obj.length;

	if (start !== 0 || end !== obj.length)
	{
		if (typeof(obj) == "string")
			obj = obj.substring(start, end);
		else
			obj = obj.slice(start, end);
	}
	var result = obj.lastIndexOf(sub);
	if (result !== -1)
		result += start;
	return result;
};

ul4._capitalize = function(obj)
{
	if (typeof(obj) != "string")
		throw "capitalize() requires a string";

	if (obj.length)
		obj = obj[0].toUpperCase() + obj.slice(1).toLowerCase();
	return obj;
};

ul4._items = function(obj)
{
	if (!ul4._isdict(obj))
		throw "items() requires a dict";

	var result = [];
	for (var key in obj)
		result.push([key, obj[key]]);
	return result;
};

ul4._values = function(obj)
{
	if (!ul4._isdict(obj))
		throw "values() requires a dict";

	var result = [];
	for (var key in obj)
		result.push(obj[key]);
	return result;
};

ul4._join = function(sep, iterable)
{
	var resultlist = [];
	for (var iter = ul4._iter(iterable);;)
	{
		var item = iter();
		if (item === null)
			break;
		resultlist.push(item[0]);
	}
	return resultlist.join(sep);
};

ul4._startswith = function(string, prefix)
{
	if (typeof(prefix) !== "string")
		throw "startswith() argument must be string";

	return string.substr(0, prefix.length) === prefix;
};

ul4._endswith = function(string, suffix)
{
	if (typeof(suffix) !== "string")
		throw "endswith() argument must be string";

	return string.substr(string.length-suffix.length) === suffix;
};

ul4._isoformat = function(obj)
{
	if (!ul4._isdate(obj))
		throw "isoformat() requires a date";

	var result = obj.getFullYear() + "-" + ul4._lpad((obj.getMonth()+1).toString(), "0", 2) + "-" + ul4._lpad(obj.getDate().toString(), "0", 2);
	var hour = obj.getHours();
	var minute = obj.getMinutes();
	var second = obj.getSeconds();
	var ms = obj.getMilliseconds();
	if (hour || minute || second || ms)
	{
		result += "T" + ul4._lpad(hour.toString(), "0", 2) + ":" + ul4._lpad(minute.toString(), "0", 2) + ":" + ul4._lpad(second.toString(), "0", 2);
		if (ms)
			result += "." + ul4._lpad(ms.toString(), "0", 3) + "000";
	}
	return result;
};

ul4._mimeformat = function(obj)
{
	var weekdayname = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	var monthname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	return weekdayname[ul4._weekday(obj)] + ", " + ul4._lpad(obj.getDate(), "0", 2) + " " + monthname[obj.getMonth()] + " " + obj.getFullYear() + " " + ul4._lpad(obj.getHours(), "0", 2) + ":" + ul4._lpad(obj.getMinutes(), "0", 2) + ":" + ul4._lpad(obj.getSeconds(), "0", 2) + " GMT";
};

ul4._weekday = function(obj)
{
	var d = obj.getDay();
	return d ? d-1 : 6;
};

ul4._week = function(obj, firstweekday)
{
	if (firstweekday === null)
		firstweekday = 0;
	else
		firstweekday %= 7;

	var yearday = ul4._yearday(obj)+6;
	var jan1 = new Date(obj.getFullYear(), 0, 1);
	var jan1weekday = jan1.getDay();
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

ul4._isleap = function(obj)
{
	return new Date(obj.getFullYear(), 1, 29).getMonth() === 1;
};

ul4._yearday = function(obj)
{
	var leap = ul4._isleap(obj) ? 1 : 0;
	var day = obj.getDate();
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

ul4._append = function(obj, items)
{
	for (var i = 0; i < items.length; ++i)
		obj.push(items[i]);
	return null;
};

ul4._insert = function(obj, pos, items)
{
	if (pos < 0)
		pos += obj.length;

	for (var i = 0; i < items.length; ++i)
		obj.splice(pos++, 0, items[i]);
	return null;
};

ul4._pop = function(obj, pos)
{
	if (pos < 0)
		pos += obj.length;

	var result = obj[pos];
	obj.splice(pos, 1);
	return result;
};

ul4._update = function(obj, others, kwargs)
{
	for (var i = 0; i < others.length; ++i)
	{
		var other = others[i];
		if (ul4._isdict(other))
		{
			for (var key in other)
				obj[key] = other[key];
		}
		else if (ul4._islist(other))
		{
			for (var j = 0; j < other.length; ++j)
			{
				if (!ul4._islist(other[j]) || (other[j].length != 2))
					throw "update() requires dicts or lists of (key, value) pairs";
				obj[other[j][0]] = other[j][1];
			}
		}
		else
			throw "update() requires dicts or lists of (key, value) pairs";
	}
	for (var key in kwargs)
		obj[key] = kwargs[key];
	return null;
};

(function(){
	var classes = [
		"Location",
		"Text",
		"Const",
		"List",
		"ListComp",
		"Dict",
		"DictComp",
		"GenExpr",
		"Var",
		"Not",
		"Neg",
		"BitNot",
		"If",
		"Return",
		"Print",
		"PrintX",
		"Item",
		"EQ",
		"NE",
		"LT",
		"LE",
		"GT",
		"GE",
		"NotContains",
		"Contains",
		"Add",
		"Sub",
		"Mul",
		"FloorDiv",
		"TrueDiv",
		"Mod",
		"ShiftLeft",
		"ShiftRight",
		"BitAnd",
		"BitXOr",
		"BitOr",
		"And",
		"Or",
		"Slice",
		"Attr",
		"Call",
		"SetVar",
		"AddVar",
		"SubVar",
		"MulVar",
		"TrueDivVar",
		"FloorDivVar",
		"ModVar",
		"ShiftLeftVar",
		"ShiftRightVar",
		"BitAndVar",
		"BitXOrVar",
		"BitOrVar",
		"ForBlock",
		"Break",
		"Continue",
		"CondBlock",
		"IfBlock",
		"ElIfBlock",
		"ElseBlock",
		"Template"
	];

	for (var i = 0; i < classes.length; ++i)
	{
		var name = classes[i];
		var ul4onname = name.toLowerCase();
		var object = ul4[name];
		object.name = name;
		object.type = ul4onname;
		ul4on.register("de.livinglogic.ul4." + ul4onname, object);
	}
})();
