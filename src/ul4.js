/*!
 * UL4/UL4ON JavaScript Library
 * http://www.livinglogic.de/Python/ul4c/
 * http://www.livinglogic.de/Python/ul4on/
 *
 * Copyright 2011-2021 by LivingLogic AG, Bayreuth/Germany
 * Copyright 2011-2021 by Walter Dörwald
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

// Version of this Javascript package
import packageInfo from '../package.json';

export const version = packageInfo.version;

// Version of the UL4 API
// I.e. this version should be compatible with the Python and Java
// implementations that support the same API version.
export const api_version = "51";


/// Symbols for interfaces implemented in UL4

export let symbols = {
	// Convert an object to a string via UL4s `str()` function
	str: Symbol.for("ul4.str"),
	// Return a unambiguous string representation of the object via UL4s `repr()` function
	repr: Symbol.for("ul4.repr"),
	// Convert an object to a boolean value via UL4s `bool()` function
	bool: Symbol.for("ul4.bool"),
	// Implementing this interface makes an object callable in UL4
	call: Symbol.for("ul4.call"),
	// Implementing this interface makes an object renderable in UL4
	render: Symbol.for("ul4.render"),
	// Test whether an object is contained in this object via UL4s `in` operator
	contains: Symbol.for("ul4.contains"),
	// Compare two objects for equality via UL4s `==` operator
	eq: Symbol.for("ul4.eq"),
	// Compare two objects for inequality via UL4s `!=` operator
	ne: Symbol.for("ul4.ne"),
	// Compare two objects for "less then" via UL4s `<` operator
	lt: Symbol.for("ul4.lt"),
	// Compare two objects for "less then or equal" via UL4s `<=` operator
	le: Symbol.for("ul4.le"),
	// Compare two objects for "greater then" via UL4s `>` operator
	gt: Symbol.for("ul4.gt"),
	// Compare two objects for "greater then or equal" via UL4s `>=` operator
	ge: Symbol.for("ul4.ge"),
	// Negate an object via UL4s unary `-` operator
	neg: Symbol.for("ul4.neg"),
	// Return the absolute value of an object via UL4s `abs()` function
	abs: Symbol.for("ul4.abs"),
	// Add two objects via UL4s `+` operator (as a method of the left operand)
	add: Symbol.for("ul4.add"),
	// Add two objects via UL4s `+` operator (as a method of the right operand)
	radd: Symbol.for("ul4.radd"),
	// Subtract two objects via UL4s `-` operator (as a method of the left operand)
	sub: Symbol.for("ul4.sub"),
	// Subtract two objects via UL4s `-` operator (as a method of the right operand)
	rsub: Symbol.for("ul4.rsub"),
	// Multiply two objects via UL4s `*` operator (as a method of the left operand)
	mul: Symbol.for("ul4.mul"),
	// Multiply two objects via UL4s `*` operator (as a method of the right operand)
	rmul: Symbol.for("ul4.rmul"),
	// Divide two objects via UL4s `/` operator (as a method of the left operand)
	truediv: Symbol.for("ul4.truediv"),
	// Divide two objects via UL4s `/` operator (as a method of the right operand)
	rtruediv: Symbol.for("ul4.rtruediv"),
	// Divide two objects via UL4s `//` operator (as a method of the left operand)
	floordiv: Symbol.for("ul4.floordiv"),
	// Divide two objects via UL4s `//` operator (as a method of the right operand)
	rfloordiv: Symbol.for("ul4.rfloordiv"),
	// Get an attribute of an object via UL4
	getattr: Symbol.for("ul4.getattr"),
	// Set an attribute of an object via UL4
	setattr: Symbol.for("ul4.setattr"),
	// Get an item of a container object via UL4s `[]` operator
	getitem: Symbol.for("ul4.getitem"),
	// Set an item of a container object via UL4 UL4s `[] =` operator
	setitem: Symbol.for("ul4.setitem"),
	// Return the UL4 type of an object
	type: Symbol.for("ul4.type"),
};


// Adds name and signature to a function/method and makes the method callable by UL4
export function expose(f, signature, options)
{
	options = options || {};
	if (options.name)
		f._ul4_name = options.name;
	// This is the `_islist` function, inlined here because of order problems.
	if (Object.prototype.toString.call(signature) === "[object Array]")
		signature = new Signature(...signature);
	f._ul4_signature = signature;
	f._ul4_needsobject = options.needsobject || false;
	f._ul4_needscontext = options.needscontext || false;
	return f;
};


// This is outside of `Proto` on purpose
// This way reactive frameworks like `Vue.js` don't get to see it
// and complain about mutating render functions when those create new objects.
let _nextid = 1;

///
/// Base class for all our classes.
/// This implements support for proper UL4ON serialization:
/// As Javascript has no way to look up an object by its identity, we need to
/// give each instance a unique identifier ourselves.
///
export class Proto
{
	constructor()
	{
		this.__id__ = _nextid++;
	}

	// equality comparison of objects defaults to identity comparison
	[symbols.eq](other)
	{
		return this === other;
	}

	// To overwrite equality comparison, you only have to overwrite `[symbols.eq]`,
	// `[symbols.ne]` will be synthesized from that
	[symbols.ne](other)
	{
		return !this[symbols.eq](other);
	}

	// For other comparison operators, each method has to be implemented:
	// `<` calls `[symbols.lt]`, `<=` calls `[symbols.le]`, `>` calls `[symbols.gt]` and
	// `>=` calls `[symbols.ge]`

	[symbols.bool]()
	{
		return true;
	}
};


///
/// The signature of a callable (i.e. which arguments it takes, their default, etc.)
///
export class Signature extends Proto
{
	constructor(...params)
	{
		super();
		this.paramsByPos = [];
		this.paramsByName = {};
		this.countpos = 0;
		this.countposdef = 0;
		this.countposkw = 0;
		this.countposkwdef = 0;
		this.countkw = 0;
		this.countkwdef = 0;
		this.varpos = null;
		this.varkw = null;

		let state = 0;
		let name = null;
		let type = null;
		for (let value of params)
		{
			if (state == 0)
			{
				name = value;
				state = 1;
			}
			else if (state == 1)
			{
				type = value;
				if (type.endsWith("="))
					state = 2;
				else
				{
					this.add(name, type, null);
					state = 0;
				}
			}
			else
			{
				this.add(name, type, value);
				state = 0;
			}
		}
	}

	// Add a parameter
	add(name, type, defaultValue)
	{
		let pos = this.paramsByPos.length;
		if (this.varpos !== null)
			++pos;
		if (this.varkw !== null)
			++pos;
		let param = {name: name, pos: pos, type: type, defaultValue: defaultValue};
		switch (type)
		{
			case "p":
				if (this.countposdef > 0 || this.countposkwdef > 0 || this.countkwdef > 0)
					throw new ParameterError("parameter without default after parameter with default");
				else if (this.countposkw > 0 || this.countposkwdef > 0)
					throw new ParameterError("positional-only parameter after positional/keyword parameter");
				else if (this.countkw > 0 || this.countkwdef > 0)
					throw new ParameterError("positional-only parameter after keyword-only parameter");
				else if (this.varpos !== null)
					throw new ParameterError("positional-only parameter after * parameter");
				else if (this.varkw !== null)
					throw new ParameterError("positional-only parameter after ** parameter");
				this.paramsByPos.push(param);
				this.paramsByName[name] = param;
				++this.countpos;
				break;
			case "p=":
				if (this.countposkw > 0 || this.countposkwdef > 0)
					throw new ParameterError("positional-only parameter after positional/keyword parameter");
				else if (this.countkw > 0 || this.countkwdef > 0)
					throw new ParameterError("positional-only parameter after keyword-only parameter");
				else if (this.varpos !== null)
					throw new ParameterError("positional-only parameter after * parameter");
				else if (this.varkw !== null)
					throw new ParameterError("positional-only parameter after ** parameter");
				this.paramsByPos.push(param);
				this.paramsByName[name] = param;
				++this.countposdef;
				break;
			case "pk":
				if (this.countposdef > 0 || this.countposkwdef > 0 || this.countkwdef > 0)
					throw new ParameterError("parameter without default after parameter with default");
				else if (this.countkw > 0 || this.countkwdef > 0)
					throw new ParameterError("positional/keyword parameter after keyword-only parameter");
				else if (this.varpos !== null)
					throw new ParameterError("positional/keyword parameter after * parameter");
				else if (this.varkw !== null)
					throw new ParameterError("positional/keyword parameter after ** parameter");
				this.paramsByPos.push(param);
				this.paramsByName[name] = param;
				++this.countposkw;
				break;
			case "pk=":
				if (this.countkw > 0 || this.countkwdef > 0)
					throw new ParameterError("positional/keyword parameter after keyword-only parameter");
				else if (this.varpos !== null)
					throw new ParameterError("positional/keyword parameter after * parameter");
				else if (this.varkw !== null)
					throw new ParameterError("positional/keyword parameter after ** parameter");
				this.paramsByPos.push(param);
				this.paramsByName[name] = param;
				++this.countposkwdef;
				break;
			case "k":
				if (this.countposdef > 0 || this.countposkwdef > 0 || this.countkwdef > 0)
					throw new ParameterError("parameter without default after parameter with default");
				else if (this.varpos !== null)
					throw new ParameterError("keyword-only parameter after * parameter");
				else if (this.varkw !== null)
					throw new ParameterError("keyword-only parameter after ** parameter");
				this.paramsByPos.push(param);
				this.paramsByName[name] = param;
				++this.countkw;
				break;
			case "k=":
				if (this.varpos !== null)
					throw new ParameterError("keyword-only parameter after * parameter");
				else if (this.varkw !== null)
					throw new ParameterError("keyword-only parameter after ** parameter");
				this.paramsByPos.push(param);
				this.paramsByName[name] = param;
				++this.countkwdef;
				break;
			case "*":
				if (this.varpos !== null)
					throw new ParameterError("* parameter specified twice!");
				else if (this.varkw !== null)
					throw new ParameterError("* parameter can come after ** parameter!");
				this.varpos = param;
				break;
			case "**":
				if (this.varkw !== null)
					throw new ParameterError("** parameter specified twice!");
				this.varkw = param;
				break;
		}
	}

	// Create the argument array for calling a function with this signature with the arguments available from `args`
	bindArray(name, args, kwargs)
	{
		let decname = name !== null ? name + "() " : "";

		let varpos = this.varpos != null ? [] : null;
		let varkw = this.varkw != null ? new Map() : null;

		let count = this.countpos + this.countposdef + this.countposkw + this.countposkwdef + this.countkw + this.countkwdef;
		let finalargs = Array(count).fill(null);
		let haveValues = Array(count).fill(false);

		// Handle psotional arguments
		if (args !== null)
		{
			let i = 0;
			for (let arg of args)
			{
				let param = this.paramsByPos[i];
				if (param !== undefined && param.type.indexOf("p") >= 0)
				{
					finalargs[i] = arg;
					haveValues[i] = true;
				}
				else
				{
					if (varpos !== null)
						varpos.push(arg);
					else
					{
						let count_nodef = this.countpos + this.countposkw;
						let count_def = this.countposdef + this.countposkwdef;
						if (count_def == 0)
							throw new ArgumentError(name + "() takes exactly " + count_nodef + " positional argument" + (count_nodef != 1 ? "s" : "") + ", " + args.length + " given");
						else
							throw new ArgumentError(name + "() takes at most " + (count_nodef + count_def) + " positional argument" + ((count_nodef + count_def) != 1 ? "s" : "") + ", " + args.length + " given");
					}
				}
				++i;
			}
		}

		// Handle keyword arguments
		if (kwargs !== null)
		{
			for (let [argname, argvalue] of Object.entries(kwargs))
			{
				let param = this.paramsByName[argname];

				if (param !== undefined && param.type.indexOf("k") >= 0)
				{
					if (haveValues[param.pos])
						throw new ArgumentError("Duplicate keyword argument " + _repr(argname) + " for " + name + "()");
					finalargs[param.pos] = argvalue;
					haveValues[param.pos] = true;
				}
				else
				{
					if (varkw !== null)
					{
						if (varkw.has(argname))
							throw new ArgumentError("Duplicate keyword argument " + _repr(argname) + " for " + name + "()");
						varkw.set(argname, argvalue);
					}
					else
						throw new ArgumentError(name + "() doesn't support an argument named " + _repr(argname));
				}
			}
		}

		// Fill in default values and check that every parameter has a value
		let i = 0;
		for (let param of this.paramsByPos)
		{
			if (!haveValues[i])
			{
				if (param.type.endsWith("="))
				{
					finalargs[i] = param.defaultValue;
					haveValues[i] = true;
				}
				else
					throw new ArgumentError("Required " + name + "() argument " + param.name + " (position " + param.pos + ") missing");
			}
			++i;
		}

		// Set variable parameters
		if (varpos !== null)
			finalargs.push(varpos);
		if (varkw !== null)
			finalargs.push(varkw);

		return finalargs;
	}

	// Create the argument object for calling a function with this signature with the arguments available from `args`
	bindObject(name, args, kwargs)
	{
		args = this.bindArray(name, args, kwargs);
		let argObject = {};
		let i = 0;
		for (let param of this.paramsByPos)
			argObject[param.name] = args[i++];
		if (this.varpos !== null)
			argObject[this.varpos.name] = args[i++];
		if (this.varkw !== null)
			argObject[this.varkw.name] = args[i++];
		return argObject;
	}

	[symbols.repr]()
	{
		return "<Signature " + this.toString() + ">";
	}

	[symbols.str]()
	{
		return this.toString();
	}

	_appendParam(buffer, lasttype, param)
	{
		let sep;
		if (lasttype === null)
			sep = ["k", "k="].includes(param.type) ? "*, " : "";
		else if (["pk", "pk="].includes(lasttype))
			sep = ["k", "k="].includes(param.type) ? ", *, " : ", ";
		else if (["p", "p="].includes(lasttype))
		{
			if (["pk", "pk="].includes(param.type))
				sep = ", /, ";
			else if (["k", "k="].includes(param.type))
				sep = ", /, *, ";
			else
				sep = ", ";
		}
		else
			sep = ", ";
		lasttype = param.type;
		buffer.push(sep);
		if (["*", "**"].includes(param.type))
			buffer.push(param.type);
		buffer.push(param.name);
		if (param.type.endsWith("="))
		{
			buffer.push("=", _repr(param.defaultValue));
		}
	}

	toString()
	{
		let v = [];
		let lasttype = null;
		for (let param of this.paramsByPos)
		{
			this._appendParam(v, lasttype, param);
			lasttype = param.type;
		}
		if (this.varpos !== null)
		{
			this._appendParam(v, lasttype, this.varpos);
			lasttype = this.varpos.type;
		}
		if (this.varkw !== null)
		{
			this._appendParam(v, lasttype, this.varkw);
			lasttype = this.varkw.type;
		}
		return "(" + v.join("") + ")";
	}
};


///
/// Base class for type objects of all types
/// Must be defined first, as it's used by many classes
///
export class Type
{
	constructor(module, name, doc)
	{
		this.module = module;
		this.name = name;
		this.doc = doc;
		this._constructor = constructor;
	}

	[symbols.getattr](attrname)
	{
		switch (attrname)
		{
			case "__module__":
				return this.module;
			case "__name__":
				return this.name;
			case "__doc__":
				return this.doc;
			default:
				throw new AttributeError(this, attrname);
		}
	}

	[symbols.repr]()
	{
		return this.toString();
	}

	toString()
	{
		return "<type " + this.fullname() + ">";
	}

	fullname()
	{
		if (this.module === null)
			return this.name;
		else
			return this.module + "." + this.name;
	}

	dir()
	{
		return this.attrs;
	}

	getattr(obj, attrname)
	{
		if (typeof(obj) === "object" && typeof(obj[symbols.getattr]) === "function")
			return obj[symbols.getattr](attrname);
		else if (this.attrs.has(attrname))
		{
			let attr = this[attrname];
			let realattr = function realattr(...args) {
				return attr.apply(this, [obj, ...args]);
			};
			// Unfortunately we can't set `realattr.name`;
			realattr._ul4_name = attr._ul4_name || attr.name;
			realattr._ul4_signature = attr._ul4_signature;
			realattr._ul4_needsobject = attr._ul4_needsobject;
			realattr._ul4_needscontext = attr._ul4_needscontext;
			return realattr;
		}
		else
			throw new AttributeError(obj, attrname);
	}

	hasattr(obj, attrname)
	{
		if (typeof(obj) === "object" && typeof(obj[symbols.getattr]) === "function")
		{
			try
			{
				obj[symbols.getattr](attrname);
				return true;
			}
			catch (exc)
			{
				if (exc instanceof AttributeError && exc.obj === object)
					return false;
				else
					throw exc;
			}
		}
		else
			return this.attrs.has(attrname);
	}
};

Type.prototype.attrs = new Set();


///
/// UL4ON
///

const _registry = {};

// Register the constructor function `f` under the name `name` with the UL4ON machinery
export function register(name, f)
{
	f.prototype.ul4onname = name;
	_registry[name] = f;
};

// Return a string that contains the object `obj` in the UL4ON serialization format
export function dumps(obj, indent=null)
{
	let encoder = new Encoder(indent);
	let output = [];
	encoder.dump(obj, output);
	return output.join("");
};

// Load an object from the string `dump`.
// `dump` must contain the object in the UL4ON serialization format
// `registry` may be null or a dictionary mapping type names to constructor functions
export function loads(dump, registry=null)
{
	let decoder = new Decoder(registry);
	return decoder.loads(dump);
};

export class EncoderType extends Type
{
	[symbols.call](indent=null)
	{
		return new Encoder(indent);
	}

	instancecheck(obj)
	{
		return obj instanceof Encoder;
	}
};

expose(EncoderType.prototype, ["indent", "pk=", null], {name: "Encoder"});

let encodertype = new EncoderType("ul4on", "Encoder", "An UL4ON encoder");

// Helper class for encoding
export class Encoder
{
	// Create a new Encoder object
	constructor(indent=null)
	{
		this.indent = indent;
		this.output = null;
		this._level = 0;
		this._strings2index = {};
		this._ids2index = {};
		this._backrefs = 0;
	}

	[symbols.type]()
	{
		return encodertype;
	}

	_line(line, ...args)
	{
		if (this.indent !== null)
		{
			for (let i = 0; i < this._level; ++i)
				this.output.push(this.indent);
		}
		else
		{
			if (this.output.length)
				this.output.push(" ");
		}
		this.output.push(line);

		if (args.length)
		{
			let oldindent = this.indent;
			this.indent = null;
			for (let arg of args)
				this.dump(arg);
			this.indent = oldindent;
		}

		if (this.indent !== null)
			this.output.push("\n");
	}

	dumps(obj)
	{
		let output = [];
		this.dump(obj, output);
		return output.join("");
	}

	dump(obj, output=null)
	{
		if (output !== null)
		{
			this._level = 0;
			this.output = output;
		}
		if (obj === null)
			this._line("n");
		else if (typeof(obj) === "boolean")
			this._line(obj ? "bT" : "bF");
		else if (typeof(obj) === "number")
		{
			let type = (Math.round(obj) == obj) ? "i" : "f";
			this._line(type + obj);
		}
		else if (typeof(obj) === "string")
		{
			let index = this._strings2index[obj];
			if (index !== undefined)
			{
				this._line("^" + index);
			}
			else
			{
				this._strings2index[obj] = this._backrefs++;
				let dump = _str_repr(obj).replace("<", "\\x3c");
				this._line("S" + dump);
			}
		}
		else if (_iscolor(obj))
			this._line("c", obj.r(), obj.g(), obj.b(), obj.a());
		else if (_isdate(obj))
			this._line("x", obj.year(), obj.month(), obj.day());
		else if (_isdatetime(obj))
			this._line("z", obj.getFullYear(), obj.getMonth()+1, obj.getDate(), obj.getHours(), obj.getMinutes(), obj.getSeconds(), obj.getMilliseconds() * 1000);
		else if (_istimedelta(obj))
			this._line("t", obj.days(), obj.seconds(), obj.microseconds());
		else if (_ismonthdelta(obj))
			this._line("m", obj.months());
		else if (obj instanceof slice)
			this._line("r", obj.start, obj.stop);
		else if (obj.ul4onname && obj.ul4ondump)
		{
			if (obj.__id__)
			{
				let index = this._ids2index[obj.__id__];
				if (index !== undefined)
				{
					this._line("^" + index);
					return;
				}
				this._ids2index[obj.__id__] = this._backrefs++;
			}
			if (obj.ul4onid)
				this._line("P", obj.ul4onname, obj.ul4onid);
			else
				this._line("O", obj.ul4onname);
			++this._level;
			obj.ul4ondump(this);
			--this._level;
			this._line(")");
		}
		else if (_islist(obj))
		{
			this._line("l");
			++this._level;
			for (let item of obj)
				this.dump(item);
			--this._level;
			this._line("]");
		}
		else if (_ismap(obj))
		{
			this._line("e");
			++this._level;
			for (let [key, value] of obj)
			{
				this.dump(key);
				this.dump(value);
			}
			--this._level;
			this._line("}");
		}
		else if (_isdict(obj))
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
		else if (_isset(obj))
		{
			this._line("y");
			++this._level;
			for (let value of obj)
				this.dump(value);
			--this._level;
			this._line("}");
		}
		else
			throw new ValueError("can't create UL4ON dump of object " + _repr(obj));
		if (output !== null)
		{
			this.output = null;
		}
	}

	[symbols.getattr](attrname)
	{
		let self = this;
		switch (attrname)
		{
			case "dumps":
				let dumps = this.dumps.bind(this);
				expose(dumps, ["obj", "pk"]);
				return dumps;
			default:
				throw new ul4.AttributeError(this, attrname);
		}
	}
};

export class DecoderType extends Type
{
	[symbols.call]()
	{
		return new Decoder();
	}

	instancecheck(obj)
	{
		return obj instanceof Decoder;
	}
};

expose(DecoderType.prototype, [], {name: "Decoder"});

let decodertype = new DecoderType("ul4on", "Decoder", "An UL4ON decoder");

// Helper class for decoding
export class Decoder
{
	// Creates a new decoder for reading an UL4ON dump
	constructor(registry)
	{
		this.input = null;
		this.pos = 0;
		this.backrefs = [];
		this.registry = registry === undefined ? null : registry;
		this.persistent_objects = {};
		this.stack = null; // Use for informative error messages
	}

	[symbols.type]()
	{
		return decodertype;
	}

	// Read a character from the buffer
	readchar()
	{
		if (this.pos >= this.input.length)
			throw new ValueError("UL4 decoder at EOF");
		return this.input.charAt(this.pos++);
	}

	// Read a character from the buffer (return null on eof)
	readcharoreof()
	{
		if (this.pos >= this.input.length)
			return null;
		return this.input.charAt(this.pos++);
	}

	// Read next not-whitespace character from the buffer
	readblackchar()
	{
		let re_white = /\s/;

		for (;;)
		{
			if (this.pos >= this.input.length)
				throw new ValueError("UL4 decoder at EOF at position " + this.pos + " with path " + this.stack.join("/"));
			let c = this.input.charAt(this.pos++);
			if (!c.match(re_white))
				return c;
		}
	}

	// Read `size` characters from the buffer
	read(size)
	{
		if (this.pos+size > this.input.length)
			size = this.input.length-this.pos;
		let result = this.input.substring(this.pos, this.pos+size);
		this.pos += size;
		return result;
	}

	// "unread" one character
	backup()
	{
		--this.pos;
	}

	// Read a number from the buffer
	readnumber()
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
					throw new ValueError("invalid number, got " + _repr("value") + " at position " + this.pos + " with path " + this.stack.join("/"));
				return result;
			}
		}
	}

	_beginfakeloading()
	{
		let oldpos = this.backrefs.length;
		this.backrefs.push(null);
		return oldpos;
	}

	_endfakeloading(oldpos, value)
	{
		this.backrefs[oldpos] = value;
	}

	_readescape(escapechar, length)
	{
		let chars = this.read(length);
		if (chars.length != length)
			throw new ValueError("broken escape " + _repr("\\" + escapechar + chars) + " at position " + this.pos + " with path " + this.stack.join("/"));
		let codepoint = parseInt(chars, 16);
		if (isNaN(codepoint))
			throw new ValueError("broken escape " + _repr("\\" + escapechar + chars) + " at position " + this.pos + " with path " + this.stack.join("/"));
		return String.fromCharCode(codepoint);
	}

	reset()
	{
		this.pos = 0;
		this.stack = [];
		this.backrefs = []
	}

	loads(dump)
	{
		return this.load(dump);
	}

	// Load the next object from the buffer
	load(input=null)
	{
		if (input !== null)
		{
			this.input = input;
			this.pos = 0;
			this.stack = [];
		}
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
				result = null;
				break;
			case "b":
			case "B":
				result = this.readchar();
				if (result === "T")
					result = true;
				else if (result === "F")
					result = false;
				else
					throw new ValueError("wrong value for boolean, expected 'T' or 'F', got " + _repr(result) + " at position " + this.pos + " with path " + this.stack.join("/"));
				if (typecode === "B")
					this.backrefs.push(result);
				break;
			case "i":
			case "I":
			case "f":
			case "F":
				result = this.readnumber();
				if (typecode === "I" || typecode === "F")
					this.backrefs.push(result);
				break;
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
				break;
			case "c":
			case "C":
				result = new Color();
				if (typecode === "C")
					this.backrefs.push(result);
				result._r = this.load();
				result._g = this.load();
				result._b = this.load();
				result._a = this.load();
				break;
			case "x":
			case "X":
			{
				let year = this.load();
				let month = this.load();
				let day = this.load();
				result = new Date_(year, month, day);
				if (typecode === "X")
					this.backrefs.push(result);
				break;
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
				result.setMilliseconds(this.load()/1000);
				if (typecode === "Z")
					this.backrefs.push(result);
				break;
			case "t":
			case "T":
				result = new TimeDelta();
				result._days = this.load();
				result._seconds = this.load();
				result._microseconds = this.load();
				if (typecode === "T")
					this.backrefs.push(result);
				break;
			case "r":
			case "R":
				result = new slice();
				if (typecode === "R")
					this.backrefs.push(result);
				result.start = this.load();
				result.stop = this.load();
				break;
			case "m":
			case "M":
				result = new MonthDelta();
				if (typecode === "M")
					this.backrefs.push(result);
				result._months = this.load();
				break;
			case "l":
			case "L":
				this.stack.push("list");
				result = [];
				if (typecode === "L")
					this.backrefs.push(result);
				for (;;)
				{
					typecode = this.readblackchar();
					if (typecode === "]")
						break;
					this.backup();
					result.push(this.load());
				}
				this.stack.pop();
				break;
			case "d":
			case "D":
			case "e":
			case "E":
				result = new Map();
				this.stack.push(typecode === "d" || typecode === "D" ? "dict" : "odict");
				if (typecode === "D" || typecode === "E")
					this.backrefs.push(result);
				for (;;)
				{
					typecode = this.readblackchar();
					if (typecode === "}")
						break;
					this.backup();
					let key = this.load();
					let value = this.load();
					result.set(key, value);
				}
				this.stack.pop();
				break;
			case "y":
			case "Y":
				this.stack.push("set");
				result = new Set();
				if (typecode === "Y")
					this.backrefs.push(result);
				for (;;)
				{
					typecode = this.readblackchar();
					if (typecode === "}")
						break;
					this.backup();
					result.add(this.load());
				}
				this.stack.pop();
				break;
			case "o":
			case "O":
			{
				let oldpos;
				if (typecode === "O")
					oldpos = this._beginfakeloading();
				let name = this.load();
				this.stack.push(name);
				let constructor;
				if (this.registry !== null)
				{
					constructor = this.registry[name];
					if (constructor === undefined)
						constructor = _registry[name];
				}
				else
					constructor = _registry[name];
				if (constructor === undefined)
					throw new ValueError("can't load object of type " + _repr(name) + " at position " + this.pos + " with path " + this.stack.join("/"));
				result = new constructor();
				if (typecode === "O")
					this._endfakeloading(oldpos, result);
				result.ul4onload(this);
				typecode = this.readblackchar();
				if (typecode !== ")")
					throw new ValueError("object terminator ')' for object of type '" + name + "' expected, got " + _repr(typecode) + " at position " + this.pos + " with path " + this.stack.join("/"));
				this.stack.pop();
				break;
			}
			case "p":
			case "P":
			{
				let oldpos;
				if (typecode === "P")
					oldpos = this._beginfakeloading();
				let name = this.load();
				let id = this.load();
				this.stack.push(name);
				let key = name + "=" + id;
				result = this.persistent_objects[key];
				if (result === undefined)
				{
					let constructor;
					if (this.registry !== null)
					{
						constructor = this.registry[name];
						if (constructor === undefined)
							constructor = _registry[name];
					}
					else
						constructor = _registry[name];
					if (constructor === undefined)
						throw new ValueError("can't load object of type " + _repr(name) + " with id " + _repr(id) + " at position " + this.pos + " with path " + this.stack.join("/"));
					result = new constructor(id);
					this.persistent_objects[key] = result;
				}
				if (typecode === "P")
					this._endfakeloading(oldpos, result);
				result.ul4onload(this);
				typecode = this.readblackchar();
				if (typecode !== ")")
					throw new ValueError("object terminator ')' for object of type " + _repr(name) + " with id " + _repr(id) + " expected, got " + _repr(typecode) + " at position " + this.pos + " with path " + this.stack.join("/"));
				this.stack.pop();
				break;
			}
			default:
				throw new ValueError("unknown typecode " + _repr(typecode) + " at position " + this.pos + " with path " + this.stack.join("/"));
		}
		if (input !== null)
		{
			this.input = null;
			this.pos = 0;
			this.stack = null;
		}
		return result;
	}

	// Return an iterator for loading the content of a object
	loadcontent()
	{
		let self = this;
		return {
			next: function()
			{
				let typecode = self.readblackchar();
				// Always "unread" the typecode even at the end
				// so that at the end of a call to ul4onload()
				// the next input is the "end of object" marker
				// no matter whether ul4onload() uses loadcontent() or not.
				self.backup();
				if (typecode == ")")
					return {done: true};
				else
					return {done: false, value: self.load()};
			}
		};
	}

	[symbols.getattr](attrname)
	{
		switch (attrname)
		{
			case "loads":
				let loads = this.loads.bind(this);
				expose(loads, ["dump", "p"]);
				return loads;
			default:
				throw new ul4.AttributeError(this, attrname);
		}
	}
};


///
/// UL4
///

// REs for parsing JSON
const _rvalidchars = /^[\],:{}\s]*$/;
const _rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
const _rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
const _rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

/// Helper functions

// Convert a map to an object
export function _map2object(obj)
{
	if (_ismap(obj))
	{
		let newobj = {};
		for (let [key, value] of obj)
		{
			if (typeof(key) !== "string")
				throw new TypeError("keys must be strings");
			newobj[key] = value;
		}
		return newobj;
	}
	return obj;
};

// Clip a number to the range [0;max]
export function _bound(value, upper)
{
	if (value < 0)
		return 0;
	else if (value > upper)
		return upper;
	else
		return value;
};

// Create a pretty stacktrace from an exception
export function _stacktrace(exc)
{
	let output = (exc instanceof Exception ? exc.constructor.name + ": " : "") + exc.toString();
	if (exc.context)
		output = _stacktrace(exc.context) + "\n\n" + output;
	return output;
};

// Call a function `f` with UL4 argument handling
export function _internal_call(context, f, name, functioncontext, signature, needscontext, needsobject, args, kwargs)
{
	let finalargs;
	if (needsobject)
	{
		if (signature === null)
		{
			if (args.length)
				throw new ArgumentError(_repr(f) + " doesn't support positional arguments!");
			finalargs = [kwargs];
		}
		else
			finalargs = [signature.bindObject(name, args, kwargs)];
	}
	else
	{
		if (signature === null)
			throw new ArgumentError(_repr(f) + " doesn't support positional arguments!");
		finalargs = signature.bindArray(name, args, kwargs);
	}
	if (needscontext)
		finalargs.unshift(context);
	return f.apply(functioncontext, finalargs);
};

export function _function_is_callable(f)
{
	if (!f || f._ul4_signature === undefined || f._ul4_needsobject === undefined || f._ul4_needscontext === undefined)
		return false;
	else
		return true;
}

export function _object_is_callable(obj)
{
	if (!_function_is_callable(obj) || typeof(obj[symbols.call]) !== "function")
		return false;
	else
		return true;
}

export function _object_is_renderable(obj)
{
	if (!_function_is_callable(obj) || typeof(obj[symbols.render]) !== "function")
		return false;
	else
		return true;
}

export function _callfunction(context, f, args, kwargs)
{
	if (!_function_is_callable(f))
		throw new TypeError(_repr(f) + " is not callable by UL4");
	let name = f._ul4_name || f.name;
	return _internal_call(context, f, name, null, f._ul4_signature, f._ul4_needscontext, f._ul4_needsobject, args, kwargs);
};

export function _callobject(context, obj, args, kwargs)
{
	if (!_object_is_callable(obj))
		throw new TypeError(_repr(obj) + " is not callable by UL4");
	return _internal_call(context, obj[symbols.call], obj.name, obj, obj._ul4_signature, obj._ul4_needscontext, obj._ul4_needsobject, args, kwargs);
};

export function _callrender(context, obj, args, kwargs)
{
	if (!_object_is_renderable(obj))
		throw new TypeError(_repr(obj) + " is not renderable by UL4");
	return _internal_call(context, obj[symbols.render], obj.name, obj, obj._ul4_signature, obj._ul4_needscontext, obj._ul4_needsobject, args, kwargs);
};

export function _call(context, f, args, kwargs)
{
	if (typeof(f) === "function")
		return _callfunction(context, f, args, kwargs);
	else if (f && typeof(f[symbols.call]) === "function")
		return _callobject(context, f, args, kwargs);
	else
		throw new TypeError(_type(f).fullname() + " is not callable");
};

export function _unpackvar(lvalue, value)
{
	if (!_islist(lvalue))
		return [[lvalue, value]];
	else
	{
		let newvalue = [];
		let iter = _iter(value);

		for (let i = 0;;++i)
		{
			let item = iter.next();

			if (item.done)
			{
				if (i === lvalue.length)
					break;
				else
					throw new ValueError("need " + lvalue.length + " value" + (lvalue.length === 1 ? "" : "s") + " to unpack, got " + i);
			}
			else
			{
				if (i < lvalue.length)
					newvalue = newvalue.concat(_unpackvar(lvalue[i], item.value));
				else
					throw new ValueError("too many values to unpack (expected " + lvalue.length + ")");
			}
		}
		return newvalue;
	}
};

export function _formatsource(out)
{
	let finalout = [];
	let level = 0, needlf = false;
	for (let part of out)
	{
		if (typeof(part) === "number")
		{
			level += part;
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
			finalout.push(part);
		}
	}
	if (needlf)
		finalout.push("\n");
	return finalout.join("");
};

// Return a prefix of a location in source code
function _sourceprefix(source, pos)
{
	let outerstartpos = pos;
	let innerstartpos = outerstartpos;

	let maxprefix = 40;
	let preprefix = "\u2026";
	while (maxprefix > 0)
	{
		// We arrived at the start of the source code
		if (outerstartpos === 0)
		{
			preprefix = "";
			break;
		}
		// We arrived at the start of the line
		if (source.charAt(outerstartpos-1) === "\n")
		{
			preprefix = "";
			break;
		}
		--maxprefix;
		--outerstartpos;
	}
	return preprefix + source.substring(outerstartpos, innerstartpos);
}

// Return a suffix of a location in source code
function _sourcesuffix(source, pos)
{
	let outerstoppos = pos;
	let innerstoppos = outerstoppos;

	let maxsuffix = 40;
	let postsuffix = "\u2026";
	while (maxsuffix > 0)
	{
		// We arrived at the ed of the source code
		if (outerstoppos >= source.length)
		{
			postsuffix = "";
			break;
		}
		// We arrived at the end of the line
		if (source.charAt(outerstoppos) === "\n")
		{
			postsuffix = "";
			break;
		}
		--maxsuffix;
		++outerstoppos;
	}
	return source.substring(innerstoppos, outerstoppos) + postsuffix;
}

// Return line and column number of a location in source code
function _lineColFromPos(source, pos)
{
	let line = 1
	let col = 1;
	let stop = pos;
	for (let i = 0; i < stop; ++i)
	{
		if (source[i] === "\n")
		{
			++line;
			col = 1;
		}
		else
			++col;
	}
	return [line, col];
}

// Compare `obj1` and `obj2` if they have the same value
export function _eq(obj1, obj2)
{
	let numbertypes = ["boolean", "number"];

	if (obj1 && typeof(obj1[symbols.eq]) === "function")
		return obj1[symbols.eq](obj2);
	else if (obj2 && typeof(obj2[symbols.eq]) === "function")
		return obj2[symbols.eq](obj1);
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
	else if (_isdatetime(obj1))
	{
		if (_isdatetime(obj2))
			return obj1.getTime() == obj2.getTime();
		else
			return false;
	}
	else if (_islist(obj1))
	{
		if (_islist(obj2))
		{
			// Shortcut, if it's the same object
			if (obj1 === obj2)
				return true;
			if (obj1.length != obj2.length)
				return false;
			for (let i = 0; i < obj1.length; ++i)
			{
				if (!_eq(obj1[i], obj2[i])) // This might lead to infinite recursion and a stackoverflow, but it does in all implementations
					return false;
			}
			return true;
		}
		else
			return false;
	}
	else if (_isobject(obj1))
	{
		if (_isobject(obj2))
		{
			// Shortcut, if it's the same object
			if (obj1 === obj2)
				return true;
			// Test that each attribute of `obj1` can also be found in `obj2` and has the same value
			for (let key in obj1)
			{
				if (obj2.hasOwnProperty(key))
				{
					if (!_eq(obj1[key], obj2[key]))
						return false;
				}
				else
					return false;
			}
			// Test that each attribute of `obj2` is also in `obj1` (the value has been tested before)
			for (let key in obj2)
			{
				if (!obj1.hasOwnProperty(key))
					return false;
			}
			return true;
		}
		else if (_ismap(obj2))
		{
			// Test that each attribute of `obj1` can also be found in `obj2` and has the same value
			for (let key in obj1)
			{
				if (obj2.has(key))
				{
					if (!_eq(obj1[key], obj2.get(key)))
						return false;
				}
				else
					return false;
			}
			// Test that each attribute of `obj2` is also in `obj1` (the value has been tested before)
			for (let [ket, value] of obj2)
			{
				if (!obj1.hasOwnProperty(key))
					return false;
			}
			return true;
		}
		else
			return false;
	}
	else if (_ismap(obj1))
	{
		if (_isobject(obj2))
		{
			// Test that each attribute of `obj1` can also be found in `obj2` and has the same value
			for (let [key, value] of obj1)
			{
				if (!obj2.hasOwnProperty(key))
					return false;
				else if (!_eq(obj1.get(key), obj2[key]))
					return false;
			}
			// Test that each attribute of `obj2` is also in `obj1` (the value has been tested before)
			for (let key in obj2)
			{
				if (!obj1.has(key))
					return false;
			}
			return true;
		}
		else if (_ismap(obj2))
		{
			// Shortcut, if it's the same object
			if (obj1 === obj2)
				return true;
			if (obj1.size != obj2.size)
				return false;
			let result = true;
			// Test that each attribute of `obj1` can also be found in `obj2` and has the same value
			for (let [key, value] of obj1)
			{
				if (!obj2.has(key))
					result = false;
				else if (!_eq(obj1.get(key), obj2.get(key)))
					result = false;
			}
			return result;
		}
		else
			return false;
	}
	else if (_isset(obj1))
	{
		if (_isset(obj2))
		{
			// Shortcut, if it's the same object
			if (obj1 === obj2)
				return true;
			if (obj1.size != obj2.size)
				return false;
			let result = true;
			for (let value of obj1)
			{
				if (!obj2.has(value))
					result = false;
			}
			return result;
		}
		else
			return false;
	}
	else
		return obj1 === obj2;
};

// Compare `obj1` and `obj2` if they don't have the same value
export function _ne(obj1, obj2)
{
	if (obj1 && typeof(obj1[symbols.ne]) === "function")
		return obj1[symbols.ne](obj2);
	else if (obj2 && typeof(obj2[symbols.ne]) === "function")
		return obj2[symbols.ne](obj1);
	else
		return !_eq(obj1, obj2);
};

export function _unorderable(operator, obj1, obj2)
{
	throw new TypeError("unorderable types: " + _type(obj1).fullname() + " " + operator + " " + _type(obj2).fullname());
};

// Return:
// -1 when `obj1 < obj2`,
//  0 when `obj1 == obj2`,
//  1 when `obj1 > obj2`,
//  null when `obj1` and `obj2` are comparable, but neither of the previous cases holds (only for sets)
// raise TypeError if objects are uncomparable
// This the purpose of `_cmp` is to support implementation of <, <=, > and >=
// and dicts/maps are not comparable with the operator `_cmp` does not support dicts/maps

export function _cmp(operator, obj1, obj2)
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
	else if (_isdatetime(obj1))
	{
		if (_isdatetime(obj2))
		{
			let v1 = obj1.getTime(), v2 = obj2.getTime();
			return (v1 > v2) - (v1 < v2);
		}
	}
	else if (_islist(obj1))
	{
		if (_islist(obj2))
		{
			if (obj1 === obj2)
				return 0;
			for (let i = 0; i < obj1.length; ++i)
			{
				if (i >= obj2.length)
					return 1;
				let res = _cmp(operator, obj1[i], obj2[i]);
				if (res)
					return res;
			}
			return obj2.length > obj1.length ? -1 : 0;
		}
	}
	else if (_isset(obj1))
	{
		if (_isset(obj2))
		{
			let in1only = false;
			let in2only = false;

			for (let iter = _iter(obj1);;)
			{
				let item = iter.next();
				if (item.done)
					break;
				if (!obj2.has(item.value))
				{
					in1only = true;
					break;
				}
			}
			for (let iter = _iter(obj2);;)
			{
				let item = iter.next();
				if (item.done)
					break;
				if (!obj1.has(item.value))
				{
					in2only = true;
					break;
				}
			}

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
	}
	return _unorderable(operator, obj1, obj2);
};

// Return whether `obj1 < obj2`
export function _lt(obj1, obj2)
{
	let numbertypes = ["boolean", "number"];

	if (obj1 && typeof(obj1[symbols.lt]) === "function")
		return obj1[symbols.lt](obj2);
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
	else if (_isdatetime(obj1))
	{
		if (_isdatetime(obj2))
			return obj1.getTime() < obj2.getTime();
	}
	else if (_islist(obj1))
	{
		if (_islist(obj2))
		{
			if (obj1 === obj2)
				return false;
			for (let i = 0; i < obj1.length; ++i)
			{
				if (i >= obj2.length)
					return false;
				let eq = _eq(obj1[i], obj2[i]);
				if (!eq)
					return _lt(obj1[i], obj2[i]);
			}
			return obj1.length < obj2.length;
		}
	}
	// FIXME: Set comparison
	else if (_isset(obj1))
	{
		if (_isset(obj2))
		{
			for (let key in obj1)
			{
				if (!obj2.has(obj1[key]))
					in1only = true;
			}
			for (let key in obj2)
			{
				if (!obj1.has(obj2[key]))
					in2only = true;
			}
		}
		else
			_unorderable(operator, obj1, obj2);

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
	_unorderable("<", obj1, obj2);
};

// Return whether `obj1 <= obj2`
export function _le(obj1, obj2)
{
	let numbertypes = ["boolean", "number"];

	if (obj1 && typeof(obj1[symbols.le]) === "function")
		return obj1[symbols.le](obj2);
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
	else if (_isdatetime(obj1))
	{
		if (_isdatetime(obj2))
			return obj1.getTime() <= obj2.getTime();
	}
	else if (_islist(obj1))
	{
		if (_islist(obj2))
		{
			if (obj1 === obj2)
				return true;
			for (let i = 0; i < obj1.length; ++i)
			{
				if (i >= obj2.length)
					return false;
				let eq = _eq(obj1[i], obj2[i]);
				if (!eq)
					return _lt(obj1[i], obj2[i]);
			}
			return obj1.length <= obj2.length;
		}
	}
	// FIXME: Set comparison
	else if (_isset(obj1))
	{
		let in1only = false;
		let in2only = false;

		if (_isset(obj2))
		{
			if (_isset(obj2))
			{
				for (let value of obj1)
				{
					if (!obj2.has(value))
						in1only = true;
				}
				for (let value of obj2)
				{
					if (!obj1.has(value))
						in2only = true;
				}
			}
			else
				_unorderable(operator, obj1, obj2);
		}
		else
			_unorderable(operator, obj1, obj2);

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
	_unorderable("<=", obj1, obj2);
};

// Return whether `obj1 > obj2`
export function _gt(obj1, obj2)
{
	let numbertypes = ["boolean", "number"];

	if (obj1 && typeof(obj1[symbols.gt]) === "function")
		return obj1[symbols.gt](obj2);
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
	else if (_isdatetime(obj1))
	{
		if (_isdatetime(obj2))
			return obj1.getTime() > obj2.getTime();
	}
	else if (_islist(obj1))
	{
		if (_islist(obj2))
		{
			if (obj1 === obj2)
				return false;
			for (let i = 0; i < obj1.length; ++i)
			{
				if (i >= obj2.length)
					return true;
				let eq = _eq(obj1[i], obj2[i]);
				if (!eq)
					return _gt(obj1[i], obj2[i]);
			}
			return obj1.length > obj2.length;
		}
	}
	// FIXME: Set comparison
	else if (_isset(obj1))
	{
		let in1only = false;
		let in2only = false;

		if (_isset(obj2))
		{
			if (_isset(obj2))
			{
				for (let value of obj1)
				{
					if (!obj2.has(value))
						in1only = true;
				}
				for (let value of obj2)
				{
					if (!obj1.has(value))
						in2only = true;
				}
			}
			else
				_unorderable(operator, obj1, obj2);
		}
		else
			_unorderable(operator, obj1, obj2);

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
	_unorderable(">", obj1, obj2);
};

// Return whether `obj1 >= obj2`
export function _ge(obj1, obj2)
{
	let numbertypes = ["boolean", "number"];

	if (obj1 && typeof(obj1[symbols.ge]) === "function")
		return obj1[symbols.ge](obj2);
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
	else if (_isdatetime(obj1))
	{
		if (_isdatetime(obj2))
			return obj1.getTime() >= obj2.getTime();
	}
	else if (_islist(obj1))
	{
		if (_islist(obj2))
		{
			if (obj1 === obj2)
				return true;
			for (let i = 0; i < obj1.length; ++i)
			{
				if (i >= obj2.length)
					return true;
				let eq = _eq(obj1[i], obj2[i]);
				if (!eq)
					return _gt(obj1[i], obj2[i]);
			}
			return obj1.length >= obj2.length;
		}
	}
	// FIXME: Set comparison
	else if (_isset(obj1))
	{
		let in1only = false;
		let in2only = false;

		if (_isset(obj2))
		{
			if (_isset(obj2))
			{
				for (let value of obj1)
				{
					if (!obj2.has(value))
						in1only = true;
				}
				for (let value of obj2)
				{
					if (!obj1.has(value))
						in2only = true;
				}
			}
			else
				_unorderable(operator, obj1, obj2);
		}
		else
			_unorderable(operator, obj1, obj2);

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
	_unorderable(">=", obj1, obj2);
};

// Return an iterator for `obj`
export function _iter(obj)
{
	if (typeof(obj) === "string" || _islist(obj))
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
	else if (_isiter(obj))
		return obj;
	else if (_ismap(obj))
	{
		let keys = [];
		for (let [key, value] of obj)
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
	else if (_isset(obj))
	{
		let values = [];
		for (let item of obj)
			values.push(item);
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
	else if (_isobject(obj))
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
	// Check for an iterator implementation last, as otherwise, we'd get an item iterator for maps
	else if (obj !== null && typeof(obj[Symbol.iterator]) === "function")
		return obj[Symbol.iterator]();
	throw new TypeError(_type(obj).fullname() + " object is not iterable");
};

function _str_repr(str, ascii)
{
	let result = "";
	let squote = false, dquote = false;

	for (let c of str)
	{
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

	for (let c of str)
	{
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
				let code = c.charCodeAt(0);
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
					result += "\\x" + _lpad(code.toString(16), "0", 2);
				else if (escape === 4)
					result += "\\u" + _lpad(code.toString(16), "0", 4);
				else
					result += "\\U" + _lpad(code.toString(16), "0", 8);
				break;
		}
	}
	return quote + result + quote;
};

function _date_repr(obj, ascii)
{
	let year = obj._date.getFullYear();
	let month = obj._date.getMonth()+1;
	let day = obj._date.getDate();
	let result = "@(" + year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2) + ")";
	return result;
};

function _datetime_repr(obj, ascii)
{
	let year = obj.getFullYear();
	let month = obj.getMonth()+1;
	let day = obj.getDate();
	let hour = obj.getHours();
	let minute = obj.getMinutes();
	let second = obj.getSeconds();
	let ms = obj.getMilliseconds();
	let result = "@(" + year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2) + "T";

	if (hour || minute || second || ms)
	{
		result += _lpad(hour.toString(), "0", 2) + ":" + _lpad(minute.toString(), "0", 2);
		if (second || ms)
		{
			result += ":" + _lpad(second.toString(), "0", 2);
			if (ms)
				result += "." + _lpad(ms.toString(), "0", 3) + "000";
		}
	}
	result += ")";

	return result;
};

function _map_repr(obj, ascii)
{
	let v = [];
	v.push("{");

	let i = 0;
	for (let [key, value] of obj)
	{
		if (i++)
			v.push(", ");
		v.push(_repr_internal(key, ascii), ": ", _repr_internal(value, ascii));
	}

	v.push("}");
	return v.join("");
};

function _list_repr(obj, ascii)
{
	let v = [];
	v.push("[");
	let first = true;
	for (let item of obj)
	{
		if (first)
			first = false;
		else
			v.push(", ");
		v.push(_repr_internal(item, ascii));
	}
	v.push("]");
	return v.join("");
};

function _set_repr(obj, ascii)
{
	let v = [];
	v.push("{");
	if (!obj.size)
		v.push("/");
	else
	{
		let i = 0;
		for (let value of obj)
		{
			if (i++)
				v.push(", ");
			v.push(_repr_internal(value, ascii));
		}
	}
	v.push("}");
	return v.join("");
};

function _object_repr(obj, ascii)
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
		v.push(_repr_internal(key, ascii), ": ", _repr_internal(obj[key], ascii));
	}
	v.push("}");
	return v.join("");
};

function _repr_internal(obj, ascii)
{
	if (obj === null)
		return "None";
	else if (obj === undefined)
		return "<undefined>";
	else if (obj === false)
		return "False";
	else if (obj === true)
		return "True";
	else if (typeof(obj) === "string")
		return _str_repr(obj, ascii);
	else if (typeof(obj) === "number")
		return "" + obj;
	else if (typeof(obj) === "function")
		if (obj._ul4_name || obj.name)
			return "<function " + (obj._ul4_name || obj.name) + ">";
		else
			return "<anonymous function>";
	else if (_isdate(obj))
		return _date_repr(obj, ascii);
	else if (_isdatetime(obj))
		return _datetime_repr(obj, ascii);
	else if (typeof(obj) === "object" && typeof(obj[symbols.repr]) === "function")
		return obj[symbols.repr]();
	else if (_islist(obj))
		return _list_repr(obj, ascii);
	else if (_ismap(obj))
		return _map_repr(obj, ascii);
	else if (_isset(obj))
		return _set_repr(obj, ascii);
	else if (_isobject(obj))
		return _object_repr(obj, ascii);
	return "?";
};

// Return a string representation of `obj`: If possible this should be an object literal supported by UL4, otherwise the output should be bracketed with `<` and `>`
export function _repr(obj)
{
	return _repr_internal(obj, false);
};

export function _ascii(obj)
{
	return _repr_internal(obj, true);
};

function _date_str(obj)
{
	let year = obj._date.getFullYear();
	let month = obj._date.getMonth()+1;
	let day = obj._date.getDate();

	return year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2);
};

function _datetime_str(obj)
{
	let year = obj.getFullYear();
	let month = obj.getMonth()+1;
	let day = obj.getDate();
	let hour = obj.getHours();
	let minute = obj.getMinutes();
	let second = obj.getSeconds();
	let ms = obj.getMilliseconds();

	let result = year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2) + " " + _lpad(hour.toString(), "0", 2) + ":" + _lpad(minute.toString(), "0", 2);
	if (second || ms)
	{
		result += ":" + _lpad(second.toString(), "0", 2);
		if (ms)
			result += "." + _lpad(ms.toString(), "0", 3) + "000";
	}
	return result;
};

// Convert `obj` to a string
export function _str(obj="")
{
	return strtype[symbols.call](obj);
}

// Convert `obj` to bool, according to its "truth value"
export function _bool(obj)
{
	return booltype[symbols.call](obj);
};

// Convert `obj` to an integer (if `base` is given `obj` must be a string and `base` is the base for the conversion (default is 10))
export function _int(obj=0, base=null)
{
	return inttype[symbols.call](obj, base);
};

// Convert `obj` to a float
export function _float(obj)
{
	return floattype[symbols.call](obj);
};

// Convert `obj` to a list
export function _list(obj)
{
	return listtype[symbols.call](obj);
};

// Convert `obj` to a set
export function _set(obj=[])
{
	return settype[symbols.call](obj);
};

// Return the length of `sequence`
export function _len(sequence)
{
	if (typeof(sequence) === "string" || _islist(sequence))
		return sequence.length;
	else if (_ismap(sequence) || _isset(sequence))
		return sequence.size;
	else if (_isobject(sequence))
	{
		let i = 0;
		for (let key in sequence)
			++i;
		return i;
	}
	throw new TypeError("object of type '" + _type(sequence).fullname() + "' has no len()");
};

export let constructors2types = new Map();

function _maketype(constructor)
{
	let type = new GenericType(constructor);
	constructors2types.set(constructor, type);
	return type;
}

export function _type(obj)
{
	if (obj === null)
		return nonetype;
	else if (obj === undefined)
		return undefinedtype;
	else if (typeof(obj[symbols.type]) === "function")
		return obj[symbols.type]();
	else if (_isbool(obj))
		return booltype;
	else if (_isint(obj))
		return inttype;
	else if (_isfloat(obj))
		return floattype;
	else if (_isstr(obj))
		return strtype;
	else if (_islist(obj))
		return listtype;
	else if (_isset(obj))
		return settype;
	else if (_isdict(obj)) // These are both `Map`s and "foreign" objects, i.e. ones that don't inherit from `Proto`
		return dicttype;
	else if (_isdatetime(obj))
		return datetimetype;
	// Don't use `_isfunction()` here as this would return `true` for templates
	else if (typeof(obj) === "function")
		return functiontype;
	else
	{
		let constructor = obj.constructor;
		let type = constructors2types.get(constructor);
		if (type === undefined)
			type = _maketype(constructor);
		return type;
	}
};

// (this is non-trivial, because it follows the Python semantic of `-5 % 2` being `1`)
export function _mod(obj1, obj2)
{
	if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined)
		throw new TypeError(_type(obj1).fullname() + " % " + _type(obj2).fullname() + " is not supported");

	let div = Math.floor(obj1 / obj2);
	let mod = obj1 - div * obj2;

	if (mod !== 0 && ((obj2 < 0 && mod > 0) || (obj2 > 0 && mod < 0)))
	{
		mod += obj2;
		--div;
	}
	return obj1 - div * obj2;
};

// Return the attribute with the name `attrname` of the object `obj`
// If `obj` doesn't have such an attribute, return `default_`
export function _getattr(obj, attrname, default_=null)
{
	try
	{
		let type = _type(obj);
		return type.getattr(obj, attrname);
	}
	catch (exc)
	{
		if (exc instanceof AttributeError && exc.obj === obj)
			return default_;
		else
			throw exc;
	}
};

// Return whether the object `obj` has an attribute with the name `attrname`
export function _hasattr(obj, attrname)
{
	return _type(obj).hasattr(obj, attrname);
};

// Return the names of the attributes of the object `obj` as a set.
export function _dir(obj)
{
	return _type(obj).dir();
};

// Return whether any of the items in `iterable` are true
export function _any(iterable)
{
	if (typeof(iterable) === "string")
	{
		for (let c of iterable)
		{
			if (c !== '\x00')
				return true;
		}
		return false;
	}
	else
	{
		for (let iter = _iter(iterable);;)
		{
			let item = iter.next();
			if (item.done)
				return false;
			if (_bool(item.value))
				return true;
		}
	}
};

// Return whether all of the items in `iterable` are true
export function _all(iterable)
{
	if (typeof(iterable) === "string")
	{
		for (let c of iterable)
		{
			if (c === '\x00')
				return false;
		}
		return true;
	}
	else
	{
		for (let iter = _iter(iterable);;)
		{
			let item = iter.next();
			if (item.done)
				return true;
			if (!_bool(item.value))
				return false;
		}
	}
};

// Check if `obj` is undefined
export function _isundefined(obj)
{
	return obj === undefined;
};


// Check if `obj` is *not* undefined
export function _isdefined(obj)
{
	return obj !== undefined;
};

// Check if `obj` is `None`
export function _isnone(obj)
{
	return nonetype.instancecheck(obj);
};

// Check if `obj` is a boolean
export function _isbool(obj)
{
	return booltype.instancecheck(obj);
};

// Check if `obj` is a int
export function _isint(obj)
{
	return inttype.instancecheck(obj);
};

// Check if `obj` is a float
export function _isfloat(obj)
{
	return floattype.instancecheck(obj);
};

// Check if `obj` is a string
export function _isstr(obj)
{
	return strtype.instancecheck(obj);
};

// Check if `obj` is a datetime
export function _isdatetime(obj)
{
	return datetimetype.instancecheck(obj);
};

export function _isdate(obj)
{
	return datetype.instancecheck(obj);
};

// Check if `obj` is a color
export function _iscolor(obj)
{
	return colortype.instancecheck(obj);
};

// Check if `obj` is a timedelta object
export function _istimedelta(obj)
{
	return timedeltatype.instancecheck(obj);
};

// Check if `obj` is a monthdelta object
export function _ismonthdelta(obj)
{
	return monthdeltatype.instancecheck(obj);
};

// Check if `obj` is a template (either a normal one or a locally defined)
export function _istemplate(obj)
{
	return obj !== null && (obj instanceof Template) || (obj instanceof TemplateClosure);
};

// Check if `obj` is a function
export function _isfunction(obj)
{
	return functiontype.instancecheck(obj);
};

// Check if `obj` is a list
export function _islist(obj)
{
	return listtype.instancecheck(obj);
};

// Check if `obj` is a set
export function _isset(obj)
{
	return settype.instancecheck(obj);
};

// Check if `obj` is an exception (at least a UL4 exception)
export function _isexception(obj)
{
	return (obj instanceof Exception);
};

// Check if `obj` is an iterator
export function _isiter(obj)
{
	return obj !== null && typeof(obj) === "object" && typeof(obj.next) === "function";
};

// Check if `obj` is a JS object
export function _isobject(obj)
{
	return dicttype._isobject(obj);
};

// Check if `obj` is a `Map`
export function _ismap(obj)
{
	return dicttype._ismap(obj);
};

// Check if `obj` is a dict (i.e. a normal Javascript object or a `Map`)
export function _isdict(obj)
{
	return dicttype.instancecheck(obj);
};

// Check if `obj` is an instance of `type`
export function _isinstance(obj, type)
{
	return type.instancecheck(obj);
};

// Repeat string `str` `rep` times
export function _str_repeat(str, rep)
{
	let result = "";
	for (; rep>0; --rep)
		result += str;
	return result;
};

export function _list_repeat(list, rep)
{
	let result = [];
	for (; rep>0; --rep)
		for (let item of list)
			result.push(item);
	return result;
};

function _str_json(str)
{
	let result = "";
	for (let c of str)
	{
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
				let code = c.charCodeAt(0);
				if (code >= 32 && code < 128)
					result += c;
				else
					result += "\\u" + _lpad(code.toString(16), "0", 4);
				break;
		}
	}
	return '"' + result + '"';
};

// Encodes `obj` in the Javascript Object Notation (see http://json.org/; with support for dates, colors and templates)
export function _asjson(obj)
{
	if (obj === null)
		return "null";
	else if (obj === undefined)
		return "undefined";
	else if (obj === false)
		return "false";
	else if (obj === true)
		return "true";
	else if (typeof(obj) === "string")
		return _str_json(obj);
	else if (typeof(obj) === "number")
	{
		return "" + obj;
	}
	else if (_islist(obj))
	{
		let v = [];
		v.push("[");
		let first = true;
		for (let item of obj)
		{
			if (first)
				first = false;
			else
				v.push(", ");
			v.push(_asjson(item));
		}
		v.push("]");
		return v.join("");
	}
	else if (_ismap(obj))
	{
		let v = [];
		v.push("{");
		let first = true;
		for (let [key, value] of obj)
		{
			if (first)
				first = false;
			else
				v.push(", ");
			v.push(_asjson(key), ": ", _asjson(value));
		}
		v.push("}");
		return v.join("");
	}
	else if (_isobject(obj))
	{
		let v = [];
		v.push("{");
		let first = true;
		for (let key in obj)
		{
			if (first)
				first = false;
			else
				v.push(", ");
			v.push(_asjson(key), ": ", _asjson(obj[key]));
		}
		v.push("}");
		return v.join("");
	}
	else if (_isdate(obj))
	{
		return "new ul4.Date_(" + obj._date.getFullYear() + ", " + (obj._date.getMonth()+1) + ", " + obj._date.getDate() + ")";
	}
	else if (_isdatetime(obj))
	{
		return "new Date(" + obj.getFullYear() + ", " + obj.getMonth() + ", " + obj.getDate() + ", " + obj.getHours() + ", " + obj.getMinutes() + ", " + obj.getSeconds() + ", " + obj.getMilliseconds() + ")";
	}
	else if (_istimedelta(obj))
	{
		return "new ul4.TimeDelta(" + obj._days + ", " + obj._seconds + ", " + obj._microseconds + ")";
	}
	else if (_ismonthdelta(obj))
	{
		return "new ul4.MonthDelta(" + obj._months + ")";
	}
	else if (_iscolor(obj))
	{
		return "new ul4.Color(" + obj._r + ", " + obj._g + ", " + obj._b + ", " + obj._a + ")";
	}
	else if (_istemplate(obj))
	{
		return "ul4.Template.loads(" + _repr(obj.dumps()) + ")";
	}
	throw new TypeError("asjson() requires a serializable object");
};

// Decodes the string `string` from the Javascript Object Notation (see http://json.org/) and returns the resulting object
export function _fromjson(string)
{
	// The following is from jQuery's parseJSON function
	string = strtype.strip(string);
	if (JSON && JSON.parse)
		return JSON.parse(string);
	if (_rvalidchars.test(string.replace(_rvalidescape, "@").replace(_rvalidtokens, "]").replace(_rvalidbraces, "")))
		return (new Function("return " + string))();
	throw new TypeError("invalid JSON");
};

// Encodes `obj` in the UL4 Object Notation format
export function _asul4on(obj, indent=null)
{
	return dumps(obj, indent);
};

// Decodes the string `string` from the UL4 Object Notation format and returns the resulting decoded object
export function _fromul4on(string)
{
	return loads(string);
};

function _format_datetime(obj, fmt, lang)
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
			cf: "%a %d %b %Y %I:%M:%S %p"
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

	let result = [];
	let inspec = false;
	for (let c of fmt)
	{
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
					c = _lpad(((obj.getHours()-1) % 12)+1, "0", 2);
					break;
				case "j":
					c = _lpad(datetimetype.yearday(obj), "0", 3);
					break;
				case "m":
					c = _lpad(obj.getMonth()+1, "0", 2);
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

function _format_int(obj, fmt, lang)
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
			throw new ValueError("sign not allowed for integer format type 'c'");
		sign = work.substring(work.length-1);
		work = work.substring(0, work.length-1);
	}

	// Extract fill and align char
	if (work.length >= 3)
		throw new ValueError("illegal integer format string " + _repr(fmt));
	else if (work.length == 2)
	{
		if (/[<>=^]$/.test(work))
		{
			align = work[1];
			fill = work[0];
		}
		else
			throw new ValueError("illegal integer format string " + _repr(fmt));
	}
	else if (work.length == 1)
	{
		if (/^[<>=^]$/.test(work))
			align = work;
		else
			throw new ValueError("illegal integer format string " + _repr(fmt));
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
				throw new ValueError("value out of bounds for c format");
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
			output = _str_repeat(fill, minimumwidth-output.length) + output;

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
				output = output + _str_repeat(fill, minimumwidth-output.length);
			else if (align == '>')
				output = _str_repeat(fill, minimumwidth-output.length) + output;
			else // if (align == '^')
			{
				let pad = minimumwidth - output.length;
				let padBefore = Math.floor(pad/2);
				let padAfter = pad-padBefore;
				output = _str_repeat(fill, padBefore) + output + _str_repeat(fill, padAfter);
			}
		}
	}
	return output;
};

// Format `obj` using the format string `fmt` in the language `lang`
export function _format(obj, fmt, lang)
{
	if (lang === undefined || lang === null)
		lang = "en";
	else
	{
		let translations = {de: null, en: null, fr: null, es: null, it: null, da: null, sv: null, nl: null, pt: null, cs: null, sk: null, pl: null, hr: null, sr: null, ro: null, hu: null, tr: null, ru: null, zh: null, ko: null, ja: null};
		lang = lang.toLowerCase();
		if (translations[lang] === undefined)
		{
			lang = lang.split(/_/)[0];
			if (translations[lang] === undefined)
				lang = "en";
		}
	}
	if (_isdate(obj))
		return _format_datetime(obj._date, fmt, lang);
	if (_isdatetime(obj))
		return _format_datetime(obj, fmt, lang);
	else if (_isint(obj))
		return _format_int(obj, fmt, lang);
	else if (obj === true)
		return _format_int(1, fmt, lang);
	else if (obj === false)
		return _format_int(0, fmt, lang);
};

export function _lpad(string, pad, len)
{
	if (typeof(string) === "number")
		string = string.toString();
	while (string.length < len)
		string = pad + string;
	return string;
};

export function _rpad(string, pad, len)
{
	if (typeof(string) === "number")
		string = string.toString();
	while (string.length < len)
		string = string + pad;
	return string;
};


// Clone an object and extend it
export function _extend(baseobj, attrs)
{
	return Object.assign(Object.create(baseobj), attrs);
};


class NoneType extends Type
{
	instancecheck(obj)
	{
		return obj === null;
	}
};

export let nonetype = new NoneType(null, "None", "The constant `None`.");


class UndefinedType extends Type
{
	instancecheck(obj)
	{
		return obj === undefined;
	}
};

export let undefinedtype = new UndefinedType(null, "undefined", "An undefined variable or object attribute.");


class BoolType extends Type
{
	// Convert `obj` to bool, according to its "truth value"
	[symbols.call](obj=false)
	{
		if (obj === undefined || obj === null || obj === false || obj === 0 || obj === "")
			return false;
		else if (typeof(obj) === "object" && typeof(obj[symbols.bool]) === "function")
			return obj[symbols.bool]();
		else if (_islist(obj))
			return obj.length !== 0;
		else if (_ismap(obj) || _isset(obj))
			return obj.size != 0;
		else if (_isobject(obj))
		{
			for (let key in obj)
			{
				if (!obj.hasOwnProperty(key))
					continue;
				return true;
			}
			return false;
		}
		return true;
	}

	instancecheck(obj)
	{
		return typeof(obj) === "boolean";
	}
};

expose(BoolType.prototype, ["obj", "p=", false], {name: "bool"});

export let booltype = new BoolType(null, "bool", "An boolean value");


class IntType extends Type
{
	// Convert `obj` to an integer (if `base` is given `obj` must be a string and `base` is the base for the conversion (default is 10))
	[symbols.call](obj=0, base=null)
	{
		let result;
		if (base !== null)
		{
			if (typeof(obj) !== "string" || !_isint(base))
				throw new TypeError("int() requires a string and an integer");
			result = parseInt(obj, base);
			if (result.toString() == "NaN")
				throw new TypeError("invalid literal for int()");
			return result;
		}
		else
		{
			if (typeof(obj) === "string")
			{
				result = parseInt(obj);
				if (result.toString() == "NaN")
					throw new TypeError("invalid literal for int()");
				return result;
			}
			else if (typeof(obj) === "number")
				return Math.floor(obj);
			else if (obj === true)
				return 1;
			else if (obj === false)
				return 0;
			throw new TypeError("int() argument must be a string or a number");
		}
	}

	instancecheck(obj)
	{
		return (typeof(obj) === "number") && Math.round(obj) == obj;
	}
};

expose(IntType.prototype, ["obj", "p=", 0, "base", "pk=", null], {name: "int"});

export let inttype = new IntType(null, "int", "An integer");


class FloatType extends Type
{
	// Convert `obj` to a float
	[symbols.call](obj=0.0)
	{
		if (typeof(obj) === "string")
			return parseFloat(obj);
		else if (typeof(obj) === "number")
			return obj;
		else if (obj === true)
			return 1.0;
		else if (obj === false)
			return 0.0;
		throw new TypeError("float() argument must be a string or a number");
	}

	instancecheck(obj)
	{
		return (typeof(obj) === "number") && Math.round(obj) != obj;
	}
};

expose(FloatType.prototype, ["obj", "p=", 0.0], {name: "float"});

export let floattype = new FloatType(null, "float", "A floating point number");


export class StrType extends Type
{
	[symbols.call](obj="")
	{
		if (obj === undefined)
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
		else if (_isdate(obj))
			return _date_str(obj);
		else if (_isdatetime(obj))
			return _datetime_str(obj);
		else if (_islist(obj))
			return _list_repr(obj);
		else if (_isset(obj))
			return _set_repr(obj);
		else if (_ismap(obj))
			return _map_repr(obj);
		else if (typeof(obj) === "object" && typeof(obj[symbols.str]) === "function")
			return obj[symbols.str]();
		else if (typeof(obj) === "object" && typeof(obj[symbols.repr]) === "function")
			return obj[symbols.repr]();
		else if (_isobject(obj))
			return _object_repr(obj);
		else
			return _repr(obj);
	}

	instancecheck(obj)
	{
		return typeof(obj) === "string";
	}

	count(obj, sub, start=null, end=null)
	{
		return _count(obj, sub, start, end);
	}

	find(obj, sub, start=null, end=null)
	{
		return _find(obj, sub, start, end);
	}

	rfind(obj, sub, start=null, end=null)
	{
		return _rfind(obj, sub, start, end);
	}

	replace(obj, old, new_, count=null)
	{
		if (count === null)
			count = obj.length;

		let result = [];
		while (obj.length)
		{
			let pos = obj.indexOf(old);
			if (pos === -1 || !count--)
			{
				result.push(obj);
				break;
			}
			result.push(obj.substr(0, pos), new_);
			obj = obj.substr(pos + old.length);
		}
		return result.join("");
	}

	strip(obj, chars=null)
	{
		chars = chars || " \r\n\t";
		if (typeof(chars) !== "string")
			throw new TypeError("strip() requires a string argument");

		while (obj && chars.indexOf(obj[0]) >= 0)
			obj = obj.substr(1);
		while (obj && chars.indexOf(obj[obj.length-1]) >= 0)
			obj = obj.substr(0, obj.length-1);
		return obj;
	}

	lstrip(obj, chars=null)
	{
		chars = chars || " \r\n\t";
		if (typeof(chars) !== "string")
			throw new TypeError("lstrip() requires a string argument");

		while (obj && chars.indexOf(obj[0]) >= 0)
			obj = obj.substr(1);
		return obj;
	}

	rstrip(obj, chars=null)
	{
		chars = chars || " \r\n\t";
		if (typeof(chars) !== "string")
			throw new TypeError("rstrip() requires a string argument");

		while (obj && chars.indexOf(obj[obj.length-1]) >= 0)
			obj = obj.substr(0, obj.length-1);
		return obj;
	}

	split(obj, sep=null, maxsplit=null)
	{
		if (sep !== null && typeof(sep) !== "string")
			throw new TypeError("split() requires a string");

		if (maxsplit === null)
		{
			let result = obj.split(sep !== null ? sep : /[ \n\r\t]+/);
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
				while (obj.length)
				{
					let pos = obj.indexOf(sep);
					if (pos === -1 || !maxsplit--)
					{
						result.push(obj);
						break;
					}
					result.push(obj.substr(0, pos));
					obj = obj.substr(pos + sep.length);
				}
				return result;
			}
			else
			{
				let result = [];
				while (obj.length)
				{
					obj = strtype.lstrip(obj, null);
					let part;
					if (!maxsplit--)
						 part = obj; // Take the rest of the string
					else
						part = obj.split(/[ \n\r\t]+/, 1)[0];
					if (part.length)
						result.push(part);
					obj = obj.substr(part.length);
				}
				return result;
			}
		}
	}

	rsplit(obj, sep=null, maxsplit=null)
	{
		if (sep !== null && typeof(sep) !== "string")
			throw new TypeError("rsplit() requires a string as second argument");

		if (maxsplit === null)
		{
			let result = obj.split(sep !== null ? sep : /[ \n\r\t]+/);
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
				while (obj.length)
				{
					let pos = obj.lastIndexOf(sep);
					if (pos === -1 || !maxsplit--)
					{
						result.unshift(obj);
						break;
					}
					result.unshift(obj.substr(pos+sep.length));
					obj = obj.substr(0, pos);
				}
				return result;
			}
			else
			{
				let result = [];
				while (obj.length)
				{
					obj = strtype.rstrip(obj);
					let part;
					if (!maxsplit--)
						 part = obj; // Take the rest of the string
					else
					{
						part = obj.split(/[ \n\r\t]+/);
						part = part[part.length-1];
					}
					if (part.length)
						result.unshift(part);
					obj = obj.substr(0, obj.length-part.length);
				}
				return result;
			}
		}
	}

	splitlines(obj, keepends=false)
	{
		let pos = 0;
		let startpos;
		let lookingAtLineEnd = function lookingAtLineEnd()
		{
			let c = obj[pos];
			if (c === '\n' || c == '\u000B' || c == '\u000C' || c == '\u001C' || c == '\u001D' || c == '\u001E' || c == '\u0085' || c == '\u2028' || c == '\u2029')
				return 1;
			if (c === '\r')
			{
				if (pos == length-1)
					return 1;
				if (obj[pos+1] === '\n')
					return 2;
				return 1;
			}
			return 0;
		};

		let result = [], length = obj.length;

		for (pos = 0, startpos = 0;;)
		{
			if (pos >= length)
			{
				if (startpos != pos)
					result.push(obj.substring(startpos));
				return result;
			}
			let lineendlen = lookingAtLineEnd();
			if (!lineendlen)
				++pos;
			else
			{
				let endpos = pos + (keepends ? lineendlen : 0);
				result.push(obj.substring(startpos, endpos));
				pos += lineendlen;
				startpos = pos;
			}
		}
	}

	lower(obj)
	{
		return obj.toLowerCase();
	}

	upper(obj)
	{
		return obj.toUpperCase();
	}

	capitalize(obj)
	{
		if (obj.length)
			obj = obj[0].toUpperCase() + obj.slice(1).toLowerCase();
		return obj;
	}

	join(obj, iterable)
	{
		let resultlist = [];
		for (let iter = _iter(iterable);;)
		{
			let item = iter.next();
			if (item.done)
				break;
			resultlist.push(item.value);
		}
		return resultlist.join(obj);
	}

	startswith(obj, prefix)
	{
		if (typeof(prefix) === "string")
			return obj.substr(0, prefix.length) === prefix;
		else if (_islist(prefix))
		{
			for (let singlepre of prefix)
			{
				if (obj.substr(0, singlepre.length) === singlepre)
					return true;
			}
			return false;
		}
		else
			throw new TypeError("startswith() argument must be string");
	}

	endswith(obj, suffix)
	{
		if (typeof(suffix) === "string")
			return obj.substr(obj.length-suffix.length) === suffix;
		else if (_islist(suffix))
		{
			for (let singlesuf of suffix)
			{
				if (obj.substr(obj.length-singlesuf.length) === singlesuf)
					return true;
			}
			return false;
		}
		else
			throw new TypeError("endswith() argument must be string or list of strings");
	}
};

StrType.prototype.attrs = new Set([
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
]);

expose(StrType.prototype.count, ["sub", "p", "start", "p=", null, "end", "p=", null]);
expose(StrType.prototype.find, ["sub", "p", "start", "p=", null, "end", "p=", null]);
expose(StrType.prototype.rfind, ["sub", "p", "start", "p=", null, "end", "p=", null]);
expose(StrType.prototype.replace, ["old", "p", "new", "p", "count", "p=", null]);
expose(StrType.prototype.strip, ["chars", "p=", null]);
expose(StrType.prototype.lstrip, ["chars", "p=", null]);
expose(StrType.prototype.rstrip, ["chars", "p=", null]);
expose(StrType.prototype.split, ["sep", "pk=", null, "maxsplit", "pk=", null]);
expose(StrType.prototype.rsplit, ["sep", "pk=", null, "maxsplit", "pk=", null]);
expose(StrType.prototype.splitlines, ["keepends", "pk=", false]);
expose(StrType.prototype.lower, []);
expose(StrType.prototype.upper, []);
expose(StrType.prototype.capitalize, []);
expose(StrType.prototype.join, ["iterable", "p"]);
expose(StrType.prototype.startswith, ["prefix", "p"]);
expose(StrType.prototype.endswith, ["suffix", "p"]);
expose(StrType.prototype, ["obj", "p=", ""], {name: "str"});

export let strtype = new StrType(null, "str", "A string.");


export class ListType extends Type
{
	// Convert `obj` to a list
	[symbols.call](obj)
	{
		let iter = _iter(obj);

		let result = [];
		for (;;)
		{
			let value = iter.next();
			if (value.done)
				return result;
			result.push(value.value);
		}
	}

	instancecheck(obj)
	{
		return Object.prototype.toString.call(obj) === "[object Array]";
	}

	append(obj, items)
	{
		for (let item of items)
			obj.push(item);
		return null;
	}

	insert(obj, pos, items)
	{
		if (pos < 0)
			pos += obj.length;

		for (let item of items)
			obj.splice(pos++, 0, item);
		return null;
	}

	pop(obj, pos)
	{
		if (pos < 0)
			pos += obj.length;

		let result = obj[pos];
		obj.splice(pos, 1);
		return result;
	}

	count(obj, sub, start=null, end=null)
	{
		return _count(obj, sub, start, end);
	}

	find(obj, sub, start=null, end=null)
	{
		return _find(obj, sub, start, end);
	}

	rfind(obj, sub, start=null, end=null)
	{
		return _rfind(obj, sub, start, end);
	}
};

ListType.prototype.attrs = new Set([
	"append",
	"insert",
	"pop",
	"count",
	"find",
	"rfind"
]);

expose(ListType.prototype.append, ["items", "*"]);
expose(ListType.prototype.insert, ["pos", "p", "items", "*"]);
expose(ListType.prototype.pop, ["pos", "p=", -1]);
expose(ListType.prototype.count, ["sub", "p", "start", "p=", null, "end", "p=", null]);
expose(ListType.prototype.find, ["sub", "p", "start", "p=", null, "end", "p=", null]);
expose(ListType.prototype.rfind, ["sub", "p", "start", "p=", null, "end", "p=", null]);
expose(ListType.prototype, ["iterable", "p=", []], {name: "list"});

export let listtype = new ListType(null, "list", "A list.");


class DictType extends Type
{
	[symbols.call](args, kwargs)
	{
		let result = new Map();
		this.update(result, args, kwargs);
		return result;
	}

	_ismap(obj)
	{
		return obj !== null && typeof(obj) === "object" && typeof(obj.__proto__) === "object" && obj.__proto__ === Map.prototype;
	}

	_isobject(obj)
	{
		return Object.prototype.toString.call(obj) === "[object Object]" && !(obj instanceof Proto);
	}

	instancecheck(obj)
	{
		return dicttype._ismap(obj) || dicttype._isobject(obj);
	}

	getattr(obj, attrname)
	{
		if (_ismap(obj))
		{
			if (this.attrs.has(attrname))
			{
				let attr = this[attrname];
				let realattr = function realattr(...args) {
					return attr.apply(this, [obj, ...args]);
				};
				// Unfortunately we can't set `realattr.name`;
				realattr._ul4_name = attr._ul4_name || attr.name;
				realattr._ul4_signature = attr._ul4_signature;
				realattr._ul4_needsobject = attr._ul4_needsobject;
				realattr._ul4_needscontext = attr._ul4_needscontext;
				return realattr;
			}
			else
				return obj.get(attrname);
		}
		else
		{
		let result;
		if (obj && typeof(obj[symbols.getattr]) === "function") // test this before the generic object test
			result = obj[symbols.getattr](attrname);
		else
			result = obj[attrname];
		if (typeof(result) !== "function")
			return result;
		let realresult = function(...args) {
			// We can use `apply` here, as we know that `obj` is a real object.
			return result.apply(obj, args);
		};
		realresult._ul4_name = result._ul4_name || result.name;
		realresult._ul4_signature = result._ul4_signature;
		realresult._ul4_needsobject = result._ul4_needsobject;
		realresult._ul4_needscontext = result._ul4_needscontext;
		return realresult;
		}
	}

	get(obj, key, default_=null)
	{
		if (_ismap(obj))
		{
			if (obj.has(key))
				return obj.get(key);
			return default_;
		}
		else
		{
			let result = obj[key];
			if (result === undefined && !obj.hasOwnProperty(key))
				return default_;
			return result;
		}
	}

	keys(obj)
	{
		let result = [];
		if (_ismap(obj))
		{
			for (let [key, value] of obj)
				result.push(key);
		}
		else
		{
			for (let key in obj)
				result.push(key);
		}
		return _iter(result);
	}

	items(obj)
	{
		let result = [];
		if (_ismap(obj))
		{
			for (let [key, value] of obj)
				result.push([key, value]);
		}
		else
		{
			for (let key in obj)
				result.push([key, obj[key]]);
		}
		return _iter(result);
	}

	values(obj)
	{
		let result = [];
		if (_ismap(obj))
		{
			for (let [key, value] of obj)
				result.push(value);
		}
		else
		{
			for (let key in obj)
				result.push(obj[key]);
		}
		return _iter(result);
	}

	_set(obj, key, value)
	{
		if (_ismap(obj))
			obj.set(key, value);
		else
			obj[key] = value;
	}

	update(obj, others, kwargs)
	{
		for (let other of others)
		{
			if (_ismap(other))
			{
				for (let [key, value] of other)
					dicttype._set(obj, key, value);
			}
			else if (_isobject(other))
			{
				for (let key in other)
					dicttype._set(obj, key, other[key]);
			}
			else if (_islist(other))
			{
				for (let item of other)
				{
					if (!_islist(item) || (item.length != 2))
						throw new TypeError("update() requires a dict or a list of (key, value) pairs");
					dicttype._set(obj, item[0], item[1]);
				}
			}
			else
				throw new TypeError("update() requires a dict or a list of (key, value) pairs");
		}
		for (let [key, value] of kwargs)
			dicttype._set(obj, key, value);
		return null;
	}

	clear(obj)
	{
		if (_ismap(obj))
			obj.clear();
		else
		{
			for (let key in obj)
				delete obj[key];
		}
		return null;
	}

	pop(obj, key, default_=Object)
	{
		if (_ismap(obj))
		{
			if (obj.has(key))
			{
				let result = obj.get(key);
				obj.delete(key);
				return result;
			}
		}
		else
		{
			for (let [key, value] of Object.entries(obj))
			{
				delete obj[key];
				return value;
			}
		}
		if (default_ === Object)
			throw new KeyError(obj, key);
		else
			return default_;
	}
};

DictType.prototype.attrs = new Set(["get", "keys", "items", "values", "update", "clear", "pop"]);

expose(DictType.prototype, ["args", "*", "kwargs", "**"], {name: "dict"});

expose(DictType.prototype.get, ["key", "p", "default", "p=", null]);
expose(DictType.prototype.keys, []);
expose(DictType.prototype.items, []);
expose(DictType.prototype.values, []);
expose(DictType.prototype.update, ["others", "*", "kwargs", "**"]);
expose(DictType.prototype.clear, []);
expose(DictType.prototype.pop, ["key", "p", "default", "p=", Object]);

export let dicttype = new DictType(null, "dict", "An object that maps keys to values.");


export class SetType extends Type
{
	// Convert `obj` to a set
	[symbols.call](obj=[])
	{
		let iter = _iter(obj);

		let result = new Set();
		for (;;)
		{
			let value = iter.next();
			if (value.done)
				return result;
			result.add(value.value);
		}
	}

	instancecheck(obj)
	{
		return Object.prototype.toString.call(obj) === "[object Set]";
	}

	add(obj, items)
	{
		for (let item of items)
			obj.add(item);
	}

	clear(obj)
	{
		obj.clear();
		return null;
	}
};

SetType.prototype.attrs = new Set(["add", "clear"]);

expose(SetType.prototype.add, ["items", "*"]);
expose(SetType.prototype.clear, []);
expose(SetType.prototype, ["iterable", "p=", []], {name: "set"});

export let settype = new SetType(null, "set", "A set.");


export class DateType extends Type
{
	// Return a `Date` object from the arguments passed in
	[symbols.call](year, month, day)
	{
		return new Date_(year, month, day);
	}

	instancecheck(obj)
	{
		return (obj instanceof Date_);
	}

	weekday(obj)
	{
		return datetimetype.weekday(obj._date);
	}

	calendar(obj, firstweekday=0, mindaysinfirstweek=4)
	{
		return datetimetype.calendar(obj._date, firstweekday, mindaysinfirstweek);
	}

	week(obj, firstweekday=0, mindaysinfirstweek=4)
	{
		return datetimetype.calendar(obj._date, firstweekday, mindaysinfirstweek)[1];
	}

	day(obj)
	{
		return obj._date.getDate();
	}

	month(obj)
	{
		return obj._date.getMonth()+1;
	}

	year(obj)
	{
		return obj._date.getFullYear();
	}

	date(obj)
	{
		return obj;
	}

	mimeformat(obj)
	{
		let weekdayname = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		let monthname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let d = obj._date;

		return weekdayname[datetimetype.weekday(d)] + ", " + _lpad(d.getDate(), "0", 2) + " " + monthname[d.getMonth()] + " " + d.getFullYear();
	}

	isoformat(obj)
	{
		let d = obj._date;
		return d.getFullYear() + "-" + _lpad((d.getMonth()+1).toString(), "0", 2) + "-" + _lpad(d.getDate().toString(), "0", 2);
	}

	yearday(obj)
	{
		return datetimetype.yearday(obj._date);
	}
};

DateType.prototype.attrs = new Set([
	"weekday",
	"week",
	"calendar",
	"day",
	"month",
	"year",
	"date",
	"mimeformat",
	"isoformat",
	"yearday"
]);

expose(DateType.prototype.weekday, []);
expose(DateType.prototype.calendar, ["firstweekday", "pk=", 0, "mindaysinfirstweek", "pk=", 4]);
expose(DateType.prototype.week, ["firstweekday", "pk=", 0, "mindaysinfirstweek", "pk=", 4]);
expose(DateType.prototype.day, []);
expose(DateType.prototype.month, []);
expose(DateType.prototype.year, []);
expose(DateType.prototype.date, []);
expose(DateType.prototype.mimeformat, []);
expose(DateType.prototype.isoformat, []);
expose(DateType.prototype.yearday, []);
expose(DateType.prototype, ["year", "pk", "month", "pk", "day", "pk"], {name: "date"});

export let datetype = new DateType(null, "date", "A date");


export class DateTimeType extends Type
{
	[symbols.call](year, month, day, hour=0, minute=0, second=0, microsecond=0)
	{
		return new Date(year, month-1, day, hour, minute, second, microsecond/1000);
	}

	instancecheck(obj)
	{
		return Object.prototype.toString.call(obj) == "[object Date]";
	}

	weekday(obj)
	{
		let d = obj.getDay();
		return d ? d-1 : 6;
	}

	calendar(obj, firstweekday=0, mindaysinfirstweek=4)
	{
		// Normalize parameters
		firstweekday = _mod(firstweekday, 7);
		if (mindaysinfirstweek < 1)
			mindaysinfirstweek = 1;
		else if (mindaysinfirstweek > 7)
			mindaysinfirstweek = 7;

		// `obj` might be in the first week of the next year, or last week of
		// the previous year, so we might have to try those too.
		for (let offset = +1; offset >= -1; --offset)
		{
			let year = obj.getFullYear() + offset;
			// `refdate` will always be in week 1
			let refDate = new Date(year, 0, mindaysinfirstweek);
			// Go back to the start of `refdate`s week (i.e. day 1 of week 1)
			let weekDayDiff = _mod(this.weekday(refDate) - firstweekday, 7);
			let weekStartYear = refDate.getFullYear();
			let weekStartMonth = refDate.getMonth();
			let weekStartDay = refDate.getDate() - weekDayDiff;
			let weekStart = new Date(weekStartYear, weekStartMonth, weekStartDay);
			// Is our date `obj` at or after day 1 of week 1?
			if (obj.getTime() >= weekStart.getTime())
			{
				let diff = SubAST.prototype._do(obj, weekStart);
				// Add 1, because the first week is week 1, not week 0
				let week = Math.floor(diff.days()/7) + 1;
				return [year, week, this.weekday(obj)];
			}
		}
	}

	week(obj, firstweekday=0, mindaysinfirstweek=4)
	{
		return this.calendar(obj, firstweekday, mindaysinfirstweek)[1];
	}

	day(obj)
	{
		return obj.getDate();
	}

	month(obj)
	{
		return obj.getMonth()+1;
	}

	year(obj)
	{
		return obj.getFullYear();
	}

	hour(obj)
	{
		return obj.getHours();
	}

	minute(obj)
	{
		return obj.getMinutes();
	}

	second(obj)
	{
		return obj.getSeconds();
	}

	microsecond(obj)
	{
		return obj.getMilliseconds() * 1000;
	}

	date(obj)
	{
		return new Date_(datetimetype.year(obj), datetimetype.month(obj), datetimetype.day(obj));
	}

	mimeformat(obj)
	{
		let weekdayname = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		let monthname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		return weekdayname[datetimetype.weekday(obj)] + ", " + _lpad(obj.getDate(), "0", 2) + " " + monthname[obj.getMonth()] + " " + obj.getFullYear() + " " + _lpad(obj.getHours(), "0", 2) + ":" + _lpad(obj.getMinutes(), "0", 2) + ":" + _lpad(obj.getSeconds(), "0", 2) + " GMT";
	}

	isoformat(obj)
	{
		let year = obj.getFullYear();
		let month = obj.getMonth()+1;
		let day = obj.getDate();
		let hour = obj.getHours();
		let minute = obj.getMinutes();
		let second = obj.getSeconds();
		let ms = obj.getMilliseconds();
		let result = year + "-" + _lpad(month.toString(), "0", 2) + "-" + _lpad(day.toString(), "0", 2) + "T" + _lpad(hour.toString(), "0", 2) + ":" + _lpad(minute.toString(), "0", 2) + ":" + _lpad(second.toString(), "0", 2);
		if (ms)
			result += "." + _lpad(ms.toString(), "0", 3) + "000";
		return result;
	}

	yearday(obj)
	{
		let leap = _isleap(obj) ? 1 : 0;
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
	}
};

DateTimeType.prototype.attrs = new Set([
	"weekday",
	"week",
	"calendar",
	"day",
	"month",
	"year",
	"hour",
	"minute",
	"second",
	"microsecond",
	"date",
	"mimeformat",
	"isoformat",
	"yearday"
]);

expose(DateTimeType.prototype.weekday, []);
expose(DateTimeType.prototype.calendar, ["firstweekday", "pk=", 0, "mindaysinfirstweek", "pk=", 4]);
expose(DateTimeType.prototype.week, ["firstweekday", "pk=", 0, "mindaysinfirstweek", "pk=", 4]);
expose(DateTimeType.prototype.day, []);
expose(DateTimeType.prototype.month, []);
expose(DateTimeType.prototype.year, []);
expose(DateTimeType.prototype.hour, []);
expose(DateTimeType.prototype.minute, []);
expose(DateTimeType.prototype.second, []);
expose(DateTimeType.prototype.microsecond, []);
expose(DateTimeType.prototype.date, []);
expose(DateTimeType.prototype.mimeformat, []);
expose(DateTimeType.prototype.isoformat, []);
expose(DateTimeType.prototype.yearday, []);
expose(DateTimeType.prototype, ["year", "pk", "month", "pk", "day", "pk", "hour", "pk=", 0, "minute", "pk=", 0, "second", "pk=", 0, "microsecond", "pk=", 0], {name: "datetime"});

export let datetimetype = new DateTimeType(null, "datetime", "A datetime");


export class FunctionType extends Type
{
	instancecheck(obj)
	{
		return typeof(obj) === "function" || _istemplate(obj);
	}
};

export let functiontype = new FunctionType(null, "function", "A callable function");


export class GenericType extends Type
{
	constructor(constructor)
	{
		super(constructor.classmodule || null, constructor.classname || constructor.name, constructor.classdoc || null);
		this._constructor = constructor;
	}

	getattr(obj, attrname)
	{
		if (typeof(obj[symbols.getattr]) === "function")
			return obj[symbols.getattr](attrname);
		else
			throw new AttributeError(obj, attrname);
	}

	hasattr(obj, attrname)
	{
		if (typeof(obj[symbols.getattr]) === "function")
		{
			try
			{
				obj[symbols.getattr](attrname);
				return true;
			}
			catch (exc)
			{
				if (exc instanceof AttributeError && exc.obj === object)
					return false;
				else
					throw exc;
			}
		}
		else
			return false;
	}

	instancecheck(obj)
	{
		return obj instanceof this._constructor;
	}
}


export class Context
{
	constructor(vars=null, globals=null)
	{
		this.vars = vars || {};
		this.globals = _extend(builtins, globals || {});
		this.indents = [];
		this.escapes = [];
		this._output = [];
	}

	/* Return a clone of the `Context`, but with a fresh empty `vars` objects that inherits from the previous one.
	 * This is used by the various comprehensions to avoid leaking loop variables.
	 */
	inheritvars()
	{
		let context = Object.create(this);
		context.vars = Object.create(this.vars);
		return context;
	}

	/* Return a clone of the `Context` with one additional indentation (this is used by `RenderAST`) */
	withindent(indent)
	{
		let context = Object.create(this);
		if (indent !== null)
		{
			context.indents = this.indents.slice();
			context.indents.push(indent);
		}
		return context;
	}

	/* Return a clone of the `Context` with the output buffer replaced (this is used by `renders` to collect the output in a separate buffer) */
	replaceoutput()
	{
		let context = Object.create(this);
		context._output = [];
		return context;
	}

	replacevars(vars)
	{
		let context = Object.create(this);
		context.vars = vars;
		return context;
	}

	output(value)
	{
		for (let escape of this.escapes)
			value = escape(value);
		this._output.push(value);
	}

	getoutput()
	{
		return this._output.join("");
	}

	get(name)
	{
		let result = this.vars[name];
		if (result === undefined)
			result = this.globals[name];
		return result;
	}

	set(name, value)
	{
		this.vars[name] = value;
	}
};

/// Exceptions

// Note that extending `Error` doesn't work, so we do it the "clasr" way
export function Exception(message, fileName, lineNumber)
{
	let instance = new Error(message, fileName, lineNumber);
	if (Object.setPrototypeOf)
		Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
	else
		instance.__proto__ = this;
	instance.__id__ = _nextid++;
	instance.context = null;
	return instance;
};

Exception.prototype = Object.create(Error.prototype, {
	constructor: {
		value: Error,
		enumerable: false,
		writable: true,
		configurable: true
	}
});

if (Object.setPrototypeOf)
	Object.setPrototypeOf(Exception, Error);
else
	Exception.__proto__ = Error;

Exception.prototype[symbols.getattr] = function getattr(attrname)
{
	switch (attrname)
	{
		case "context":
			return this.context;
		default:
			throw new AttributeError(this, attrname);
	}
};

// Exceptions used internally by UL4 for flow control
export class InternalException extends Exception
{
};

// Control flow exceptions
export class ReturnException extends InternalException
{
	constructor(result)
	{
		super("return");
		this.result = result;
	}
};

export class BreakException extends InternalException
{
	constructor()
	{
		super("break");
	}
};

export class ContinueException extends InternalException
{
	constructor()
	{
		super("continue");
	}
};

// Real exceptions raised by various parts of UL4
export class SyntaxError extends Exception
{
};

export class LValueRequiredError extends SyntaxError
{
	constructor()
	{
		super("lvalue required");
	}
};

export class TypeError extends Exception
{
};

export class ValueError extends Exception
{
};

export class ArgumentError extends Exception
{
};

export class ParameterError extends Exception
{
};

export class NotSubscriptableError extends Exception
{
	constructor(obj)
	{
		super("Object of type " + _type(obj).fullname() + " is not subscriptable");
		this.obj = obj;
	}

	toString()
	{
		return "Object of type " + _type(this.obj).fullname() + " is not subscriptable";
	}
};

export class ZeroDivisionError extends Exception
{
	constructor()
	{
		super("division by zero");
	}
};

export class IndexError extends Exception
{
	constructor(obj, index)
	{
		super("index " + _repr(index) + " out of range");
		this.obj = obj;
		this.index = index;
	}

	toString()
	{
		return "index " + this.index + " out of range for " + _type(this.obj).fullname();
	}
};

export class AttributeError extends Exception
{
	constructor(obj, attrname)
	{
		super("object of type " + _type(obj).fullname() + " has no attribute " + _repr(attrname));
		this.obj = obj;
		this.attrname = attrname;
	}
};

export class KeyError extends Exception
{
	constructor(obj, key)
	{
		super("key "  + _repr(key) + " not found in object of type " + _type(obj).fullname());
		this.obj = obj;
		this.key = key;
	}
};

export class NotImplementedError extends Exception
{
};

/// Exception that wraps other exceptions while they bubble up the stack
export class LocationError extends Exception
{
	constructor(location)
	{
		super("nested exception in " + _repr(location));
		this.location = location;
	}

	_templateprefix()
	{
		let template = this.location.template;
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
			out.push(template.name ? _repr(template.name) : "(unnamed)");
			template = template.parenttemplate;
		}
		return out.join("");
	}

	toString()
	{
		let template = this.location.template;
		let templateprefix = this._templateprefix();

		let prefix = this.location.startsourceprefix;
		let code = this.location.startsource;
		let suffix = this.location.startsourcesuffix;
		prefix = _repr(prefix).slice(1, -1);
		code = _repr(code).slice(1, -1);
		suffix = _repr(suffix).slice(1, -1);

		let text = prefix + code + suffix;
		let underline = _str_repeat("\u00a0", prefix.length) + _str_repeat("~", code.length);

		let pos = "offset " + this.location.pos.start + ":" + this.location.pos.stop + "; line " + this.location.startline + "; col " + this.location.startcol;

		let message = templateprefix + ": " + pos + "\n" + text + "\n" + underline;
		return message;
	}

	[symbols.getattr](attrname)
	{
		switch (attrname)
		{
			case "context":
				return this.context;
			case "location":
				return this.location;
			default:
				throw new AttributeError(this, attrname);
		}
	}
};

/// Classes for the syntax tree
export class AST extends Proto
{
	static classmodule = "ul4";
	static classdoc = "Base class for all UL4 syntax tree nodes.";

	constructor(template, startpos, stoppos=null)
	{
		super();
		this.template = template;
		this.startpos = startpos;
		this._startline = null;
		this._startcol = null;
		this.stoppos = stoppos;
		this._stopline = null;
		this._stopcol = null;
	}

	get startline()
	{
		if (this._startline === null)
			[this._startline, this._startcol] = _lineColFromPos(this.template._source, this.startpos.start);
		return this._startline;
	}

	get startcol()
	{
		if (this._startcol === null)
			[this._startline, this._startcol] = _lineColFromPos(this.template._source, this.startpos.start);
		return this._startcol;
	}

	get startsource()
	{
		return this.startpos.of(this.template._source);
	}

	get startsourceprefix()
	{
		return _sourceprefix(this.template._source, this.startpos.start);
	}

	get startsourcesuffix()
	{
		return _sourcesuffix(this.template._source, this.startpos.stop);
	}

	get fullsource()
	{
		return this.template._source;
	}

	get pos()
	{
		if (this.stoppos === null)
			return this.startpos;
		else
			return new slice(this.startpos.start, this.stoppos.stop);
	}

	get source()
	{
		return this.pos.of(this.template._source);
	}

	get sourceprefix()
	{
		return _sourceprefix(this.template._source, this.pos.start);
	}

	get sourcesuffix()
	{
		return _sourcesuffix(this.template._source, this.pos.stop);
	}

	get stopline()
	{
		if (this._stopline === null)
			[this._stopline, this._stopcol] = _lineColFromPos(this.template._source, this.stoppos.stop);
		return this._stopline;
	}

	get stopcol()
	{
		if (this._stopcol === null)
			[this._stopline, this._stopcol] = _lineColFromPos(this.template._source, this.stoppos.stop);
		return this._stopcol;
	}

	get stopsource()
	{
		return this.stoppos != null ? this.stoppos.of(this.template._source) : null;
	}

	get stopsourceprefix()
	{
		return this.stoppos != null ? _sourceprefix(this.template._source, this.stoppos.start) : null;
	}

	get stopsourcesuffix()
	{
		return this.stoppos != null ? _sourcesuffix(this.template._source, this.stoppos.stop) : null;
	}

	[symbols.getattr](attrname)
	{
		if (
			attrname === "type" ||
			attrname === "startpos" ||
			attrname === "startline" ||
			attrname === "startcol" ||
			attrname === "startsource" ||
			attrname === "startsourceprefix" ||
			attrname === "startsourcesuffix" ||
			attrname === "pos" ||
			attrname === "source" ||
			attrname === "sourceprefix" ||
			attrname === "sourcesuffix" ||
			attrname === "fullsource"
		)
			return this[attrname];
		else if (this._ul4onattrs.indexOf(attrname) >= 0)
			return this[attrname];
		throw new AttributeError(this, attrname);
	}

	[symbols.setitem](attrname, value)
	{
		throw new TypeError("object is immutable");
	}

	[symbols.str]()
	{
		let out = [];
		this._str(out);
		return _formatsource(out);
	}

	[symbols.repr]()
	{
		let out = [];
		this._repr(out);
		return _formatsource(out);
	}

	_decorate_exception(exc)
	{
		while (exc.context !== undefined && exc.context !== null)
			exc = exc.context;
		exc.context = new LocationError(this);
	}

	_handle_eval(context)
	{
		try
		{
			return this._eval(context);
		}
		catch (exc)
		{
			if (!exc.context)
				this._decorate_exception(exc);
			throw exc;
		}
	}

	_handle_eval_set(context, value)
	{
		try
		{
			return this._eval_set(context, value);
		}
		catch (exc)
		{
			if (!(exc instanceof LocationError))
				this._decorate_exception(exc);
			throw exc;
		}
	}

	_eval_set(context, value)
	{
		throw new LValueRequiredError();
	}

	_handle_eval_modify(context, operator, value)
	{
		try
		{
			return this._eval_modify(context, operator, value);
		}
		catch (exc)
		{
			if (!(exc instanceof LocationError))
				this._decorate_exception(exc);
			throw exc;
		}
	}

	_eval_modify(context, operator, value)
	{
		throw new LValueRequiredError();
	}

	_repr(out)
	{
	}

	_str(out)
	{
		out.push(this.source.replace(/\r?\n/g, ' '));
	}

	ul4ondump(encoder)
	{
		for (let attrname of this._ul4onattrs)
			encoder.dump(this[attrname]);
	}

	ul4onload(decoder)
	{
		for (let attrname of this._ul4onattrs)
			this[attrname] = decoder.load();
	}
};

// used in ul4ondump/ul4ondump to automatically dump these attributes
AST.prototype._ul4onattrs = ["template", "startpos"];

export class TextAST extends AST
{
	static classdoc = "AST node for literal text (i.e. the stuff between tags).";

	constructor(template, pos)
	{
		super(template, pos);
	}

	get text()
	{
		return this.source;
	}

	_eval(context)
	{
		context.output(this.text);
	}

	_str(out)
	{
		out.push("text ", _repr(this.text));
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " ", _repr(this.text), ">");
	}
};

export class IndentAST extends TextAST
{
	static classdoc = "AST node for literal text that is an indentation at the start of the line.";

	constructor(template, pos, text)
	{
		super(template, pos);
		this._text = text;
	}

	get text()
	{
		if (this.template !== undefined)
			return this._text === null ? this.source : this._text;
		else
			return null;
	}

	_eval(context)
	{
		for (let indent of context.indents)
			context.output(indent);
		context.output(this.text);
	}

	ul4ondump(encoder)
	{
		super.ul4ondump(encoder);

		if (this._text === this.source)
			encoder.dump(null);
		else
			encoder.dump(this._text);
	}

	ul4onload(decoder)
	{
		super.ul4onload(decoder);
		this._text = decoder.load();
	}

	_str(out)
	{
		out.push("indent ", _repr(this.text));
	}
};

export class LineEndAST extends TextAST
{
	static classdoc = "AST node for literal text that is the end of a line.";

	_str(out)
	{
		out.push("lineend ", _repr(this.text));
	}
};

export class CodeAST extends AST
{
	static classdoc = "The base class of all AST nodes that are not literal text.";
};

export class ConstAST extends CodeAST
{
	static classdoc = "AST node for a constant value.";

	constructor(template, pos, value)
	{
		super(template, pos);
		this.value = value;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " ", _repr(this.value), ">");
	}

	_eval(context)
	{
		return this.value;
	}
};

ConstAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["value"]);

export class ItemArgBase extends CodeAST
{
	_handle_eval_list(context, result)
	{
		try
		{
			return this._eval_list(context, result);
		}
		catch (exc)
		{
			if (!(exc instanceof InternalException) && !(exc instanceof LocationError))
				this._decorate_exception(exc);
			throw exc;
		}
	}

	_handle_eval_set(context, result)
	{
		try
		{
			return this._eval_set(context, result);
		}
		catch (exc)
		{
			if (!(exc instanceof InternalException) && !(exc instanceof LocationError))
				this._decorate_exception(exc);
			throw exc;
		}
	}

	_handle_eval_dict(context, result)
	{
		try
		{
			return this._eval_dict(context, result);
		}
		catch (exc)
		{
			if (!(exc instanceof InternalException) && !(exc instanceof LocationError))
				this._decorate_exception(exc);
			throw exc;
		}
	}

	_handle_eval_call(context, args, kwargs)
	{
		try
		{
			return this._eval_call(context, args, kwargs);
		}
		catch (exc)
		{
			if (!(exc instanceof InternalException) && !(exc instanceof LocationError))
				this._decorate_exception(exc);
			throw exc;
		}
	}
};

export class SeqItemAST extends ItemArgBase
{
	static classdoc = "AST node for an item in a list/set \"literal\" (e.g. ``{x, y}`` or ``[x, y]``)";

	constructor(template, pos, value)
	{
		super(template, pos);
		this.value = value;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " value=", _repr(this.value), ">");
	}

	_eval_list(context, result)
	{
		let value = this.value._handle_eval(context);
		result.push(value);
	}

	_eval_set(context, result)
	{
		let value = this.value._handle_eval(context);
		result.add(value);
	}
};

SeqItemAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["value"]);

export class UnpackSeqItemAST extends ItemArgBase
{
	static classdoc = "AST node for an ``*`` unpacking expression in a list/set \"literal\"\n(e.g. the ``y`` in ``{x, *y}`` or ``[x, *y]``)";

	constructor(template, pos, value)
	{
		super(template, pos);
		this.value = value;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " value=", _repr(this.value), ">");
	}

	_eval_list(context, result)
	{
		let value = this.value._handle_eval(context);
		for (let iter = _iter(value);;)
		{
			let item = iter.next();
			if (item.done)
				break;
			result.push(item.value);
		}
	}

	_eval_set(context, result)
	{
		let value = this.value._handle_eval(context);
		for (let iter = _iter(value);;)
		{
			let item = iter.next();
			if (item.done)
				break;
			result.add(item.value);
		}
	}
};

UnpackSeqItemAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["value"]);

export class DictItemAST extends ItemArgBase
{
	static classdoc = "AST node for a dictionary entry in a dict expression (:class:`DictAST`).";

	constructor(template, pos, key, value)
	{
		super(template, pos);
		this.key = key;
		this.value = value;
	}

	_repr(out)
	{
		out.push(
			"<",
			this.constructor.name,
			" key=",
			_repr(this.key),
			" value=",
			_repr(this.value),
			">"
		);
	}

	_eval_dict(context, result)
	{
		let key = this.key._handle_eval(context);
		let value = this.value._handle_eval(context);
		result.set(key, value);
	}
};

DictItemAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["key", "value"]);

export class UnpackDictItemAST extends ItemArgBase
{
	static classdoc = "AST node for ``**`` unpacking expressions in dict \"literal\"\n(e.g. the ``**u`` in ``{k: v, **u}``).";

	constructor(template, pos, item)
	{
		super(template, pos);
		this.item = item;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " item=", _repr(this.item), ">");
	}

	_eval_dict(context, result)
	{
		let item = this.item._handle_eval(context);
		if (_isiter(item))
		{
			for (;;)
			{
				let subitem = item.next();
				if (subitem.done)
					break;
				if (!_islist(subitem.value) || subitem.value.length != 2)
					throw new ArgumentError("** requires an iterable of (key, value) pairs");
				result.set(subitem.value[0], subitem.value[1]);
			}
		}
		else if (_islist(item))
		{
			for (let subitem of item)
			{
				if (!_islist(subitem) || subitem.length != 2)
					throw new ArgumentError("** requires a list of (key, value) pairs");
				result.set(subitem[0], subitem[1]);
			}
		}
		else if (_ismap(item))
		{
			for (let [key, value] of item)
				result.set(key, value);
		}
		else if (_isobject(item))
		{
			for (let key in item)
				result.set(key, item[key]);
		}
	}
};

UnpackDictItemAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["item"]);

export class PositionalArgumentAST extends ItemArgBase
{
	static classdoc = "AST node for a positional argument. (e.g. the ``x`` in ``f(x)``).";

	constructor(template, pos, value)
	{
		super(template, pos);
		this.value = value;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " value=", _repr(this.value), ">");
	}

	_eval_call(context, args, kwargs)
	{
		let value = this.value._handle_eval(context);
		args.push(value);
	}
};

PositionalArgumentAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["value"]);

export class KeywordArgumentAST extends ItemArgBase
{
	static classdoc = "AST node for a keyword argument in a :class:`CallAST` (e.g. the ``x=y``\nin the function call ``f(x=y)``).";

	constructor(template, pos, name, value)
	{
		super(template, pos);
		this.name = name;
		this.value = value;
	}

	_repr(out)
	{
		out.push(
			"<",
			this.constructor.name,
			" name=",
			_repr(this.name),
			" value=",
			_repr(this.value),
			">"
		);
	}

	_eval_call(context, args, kwargs)
	{
		if (kwargs.hasOwnProperty(this.name))
			throw new ArgumentError("duplicate keyword argument " + this.name);
		let value = this.value._handle_eval(context);
		kwargs[this.name] = value;
	}
};

KeywordArgumentAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["name", "value"]);

export class UnpackListArgumentAST extends ItemArgBase
{
	static classdoc = "AST node for an ``*`` unpacking expressions in a :class:`CallAST`\n(e.g. the ``*x`` in ``f(*x)``).";

	constructor(template, pos, item)
	{
		super(template, pos);
		this.item = item;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " item=", _repr(this.item), ">");
	}

	_eval_call(context, args, kwargs)
	{
		let item = this.item._handle_eval(context);
		args.push(...item);
	}
};

UnpackListArgumentAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["item"]);

export class UnpackDictArgumentAST extends ItemArgBase
{
	static classdoc = "AST node for an ``**`` unpacking expressions in a :class:`CallAST`\n(e.g. the ``**x`` in ``f(**x)``).";

	constructor(template, pos, item)
	{
		super(template, pos);
		this.item = item;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " item=", _repr(this.item), ">");
	}

	_eval_call(context, args, kwargs)
	{
		let item = this.item._handle_eval(context);
		if (_islist(item))
		{
			for (let subitem of item)
			{
				if (!_islist(subitem) || subitem.length != 2)
					throw new ArgumentError("** requires a list of (key, value) pairs");
				let [key, value] = subitem;
				if (kwargs.hasOwnProperty(key))
					throw new ArgumentError("duplicate keyword argument " + key);
				kwargs[key] = value;
			}
		}
		else if (_ismap(item))
		{
			for (let [key, value] of item)
			{
				if (kwargs.hasOwnProperty(key))
					throw new ArgumentError("duplicate keyword argument " + key);
				kwargs[key] = value;
			}
		}
		else if (_isobject(item))
		{
			for (let key in item)
			{
				if (kwargs.hasOwnProperty(key))
					throw new ArgumentError("duplicate keyword argument " + key);
				kwargs[key] = item[key];
			}
		}
	}
};

UnpackDictArgumentAST.prototype._ul4onattrs = ItemArgBase.prototype._ul4onattrs.concat(["item"]);

export class ListAST extends CodeAST
{
	static classdoc = "AST node for creating a list object (e.g. ``[x, y, *z]``).";

	constructor(template, pos)
	{
		super(template, pos);
		this.items = [];
	}

	_repr(out)
	{
		out.push("<", this.constructor.name);
		for (let item of this.items)
		{
			out.push(" ");
			item._repr(out);
		}
		out.push(">");
	}

	_eval(context)
	{
		let result = [];
		for (let item of this.items)
			item._handle_eval_list(context, result);
		return result;
	}
};

ListAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["items"]);

export class ListComprehensionAST extends CodeAST
{
	static classdoc = "AST node for a list comprehension (e.g. ``[v for (a, b) in w if c]``.";

	constructor(template, pos, item, varname, container, condition)
	{
		super(template, pos);
		this.item = item;
		this.varname = varname;
		this.container = container;
		this.condition = condition;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " item=");
		this.item._repr(out);
		out.push(" varname=", _repr(this.varname), " container=");
		this.container._repr(out);
		if (this.condition !== null)
		{
			out.push(" condition=");
			this.condition._repr(out);
		}
		out.push(">");
	}

	_eval(context)
	{
		let container = this.container._handle_eval(context);

		let localcontext = context.inheritvars();

		let result = [];
		for (let iter = _iter(container);;)
		{
			let item = iter.next();
			if (item.done)
				break;
			let varitems = _unpackvar(this.varname, item.value);
			for (let [lvalue, value] of varitems)
				lvalue._handle_eval_set(localcontext, value);
			if (this.condition === null || _bool(this.condition._handle_eval(localcontext)))
				result.push(this.item._handle_eval(localcontext));
		}
		return result;
	}
};

ListComprehensionAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["item", "varname", "container", "condition"]);

export class SetAST extends CodeAST
{
	static classdoc = "AST node for creating a set object (e.g. ``{x, y, *z}``.";

	constructor(template, pos)
	{
		super(template, pos);
		this.items = [];
	}

	_repr(out)
	{
		out.push("<", this.constructor.name);
		for (let item of this.items)
		{
			out.push(" ");
			item._repr(out);
		}
		out.push(">");
	}

	_eval(context)
	{
		let result = new Set();

		for (let item of this.items)
			item._handle_eval_set(context, result);

		return result;
	}
};

SetAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["items"]);

export class SetComprehensionAST extends CodeAST
{
	static classdoc = "AST node for a set comprehension (e.g. ``{v for (a, b) in w if c}``.";

	constructor(template, pos, item, varname, container, condition)
	{
		super(template, pos);
		this.item = item;
		this.varname = varname;
		this.container = container;
		this.condition = condition;
	}

	[symbols.getattr](attrname)
	{
		switch (attrname)
		{
			case "item":
				return this.item;
			case "varname":
				return this.varname;
			case "container":
				return this.container;
			case "condition":
				return this.condition;
			default:
				return super[symbols.getattr](attrname);
		}
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " item=");
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
	}

	_eval(context)
	{
		let container = this.container._handle_eval(context);

		let localcontext = context.inheritvars();

		let result = new Set();
		for (let iter = _iter(container);;)
		{
			let item = iter.next();
			if (item.done)
				break;
			let varitems = _unpackvar(this.varname, item.value);
			for (let [lvalue, value] of varitems)
				lvalue._handle_eval_set(localcontext, value);
			if (this.condition === null || _bool(this.condition._handle_eval(localcontext)))
				result.add(this.item._handle_eval(localcontext));
		}

		return result;
	}
};

SetComprehensionAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["item", "varname", "container", "condition"]);

export class DictAST extends CodeAST
{
	static classdoc = "AST node for creating a dict object (e.g. `{k: v, **u}`.";

	constructor(template, pos)
	{
		super(template, pos);
		this.items = [];
	}

	[symbols.getattr](attrname)
	{
		switch (attrname)
		{
			case "items":
				return this.items;
			default:
				return super[symbols.getattr](attrname);
		}
	}

	_repr(out)
	{
		out.push("<", this.constructor.name);
		for (let item of this.items)
		{
			out.push(" ");
			item._repr(out);
		}
		out.push(">");
	}

	_eval(context)
	{
		let result = new Map();
		for (let item of this.items)
			item._handle_eval_dict(context, result);
		return result;
	}
};

DictAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["items"]);

export class DictComprehensionAST extends CodeAST
{
	static classdoc = "AST node for a dictionary comprehension (e.g. ``{k: v for (a, b) in w if c}``.";

	constructor(template, pos, key, value, varname, container, condition)
	{
		super(template, pos);
		this.key = key;
		this.value = value;
		this.varname = varname;
		this.container = container;
		this.condition = condition;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " key=");
		this.key._repr(out);
		out.push(" value=");
		this.value._repr(out);
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
	}

	_eval(context)
	{
		let container = this.container._handle_eval(context);

		let localcontext = context.inheritvars();

		let result = new Map();

		for (let iter = _iter(container);;)
		{
			let item = iter.next();
			if (item.done)
				break;
			let varitems = _unpackvar(this.varname, item.value);
			for (let [lvalue, value] of varitems)
				lvalue._handle_eval_set(localcontext, value);
			if (this.condition === null || _bool(this.condition._handle_eval(localcontext)))
			{
				let key = this.key._handle_eval(localcontext);
				let value = this.value._handle_eval(localcontext);
				result.set(key, value);
			}
		}

		return result;
	}
};

DictComprehensionAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["key", "value", "varname", "container", "condition"]);

export class GeneratorExpressionAST extends CodeAST
{
	static classdoc = "AST node for a generator expression (e.g. ``(x for (a, b) in w if c)``).";

	constructor(template, pos, item, varname, container, condition)
	{
		super(template, pos);
		this.item = item;
		this.varname = varname;
		this.container = container;
		this.condition = condition;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " item=");
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
	}

	_eval(context)
	{
		let container = this.container._handle_eval(context);
		let iter = _iter(container);

		let localcontext = context.inheritvars();

		let self = this;

		let result = {
			next: function(){
				while (true)
				{
					let item = iter.next();
					if (item.done)
						return item;
					let varitems = _unpackvar(self.varname, item.value);
					for (let [lvalue, value] of varitems)
						lvalue._handle_eval_set(localcontext, value);
					if (self.condition === null || _bool(self.condition._handle_eval(localcontext)))
					{
						let value = self.item._handle_eval(localcontext);
						return {value: value, done: false};
					}
				}
			}
		};

		return result;
	}
};

GeneratorExpressionAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["item", "varname", "container", "condition"]);

export class VarAST extends CodeAST
{
	static classdoc = "AST node for getting a variable.";

	constructor(template, pos, name)
	{
		super(template, pos);
		this.name = name;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " name=", _repr(this.name), ">");
	}

	_eval(context)
	{
		return this._get(context, this.name);
	}

	_eval_set(context, value)
	{
		this._set(context, this.name, value);
	}

	_eval_modify(context, operator, value)
	{
		this._modify(context, operator, this.name, value);
	}

	_get(context, name)
	{
		return context.get(name);
	}

	_set(context, name, value)
	{
		context.set(name, value);
	}

	_modify(context, operator, name, value)
	{
		let newvalue = operator._ido(context.get(name), value);
		context.set(name, newvalue);
	}
};

VarAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["name"]);

export class UnaryAST extends CodeAST
{
	static classdoc = "Base class for all AST nodes implementing unary expressions\n(i.e. operators with one operand).";

	constructor(template, pos, obj)
	{
		super(template, pos);
		this.obj = obj;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " obj=");
		this.obj._repr(out);
		out.push(">");
	}

	_eval(context)
	{
		let obj = this.obj._handle_eval(context);
		return this._do(obj);
	}
};

UnaryAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["obj"]);

// Negation
export class NegAST extends UnaryAST
{
	static classdoc = "AST node for a unary negation expression (e.g. ``-x``).";

	_do(obj)
	{
		if (obj !== null && typeof(obj[symbols.neg]) === "function")
			return obj[symbols.neg]();
		return -obj;
	}
};

// Bitwise not
export class BitNotAST extends UnaryAST
{
	static classdoc = "AST node for a bitwise unary \"not\" expression that returns its operand\nwith its bits inverted (e.g. ``~x``).";

	_do(obj)
	{
		return -obj-1;
	}
};

// Not
export class NotAST extends UnaryAST
{
	static classdoc = "AST node for a unary \"not\" expression (e.g. ``not x``).";

	_do(obj)
	{
		return !_bool(obj);
	}
};

// If expression
export class IfAST extends CodeAST
{
	static classdoc = "AST node for the ternary inline ``if/else`` operator (e.g. ``x if y else z``).";

	constructor(template, pos, objif, objcond, objelse)
	{
		super(template, pos);
		this.objif = objif;
		this.objcond = objcond;
		this.objelse = objelse;
	}

	_repr(out)
	{
		out.push(
			"<",
			this.constructor.name,
			+1,
			"objif="
		);
		this.objif._repr(out);
		out.push(0, "objcond=");
		this.objcond._repr(out);
		out.push(0, "objelse=");
		this.objelse._repr(out);
		out.push(-1, ">");
	}

	_eval(context)
	{
		let result;
		let condvalue = this.objcond._handle_eval(context);
		if (_bool(condvalue))
			result = this.objif._handle_eval(context);
		else
			result = this.objelse._handle_eval(context);
		return result;
	}
};

IfAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["objif", "objcond", "objelse"]);

export class ReturnAST extends UnaryAST
{
	static classdoc = "AST node for a ``<?return?>`` tag (e.g. ``<?return x?>``).";

	_eval(context)
	{
		let result = this.obj._handle_eval(context);
		throw new ReturnException(result);
	}

	_str(out)
	{
		out.push("return ");
		this.obj._str(out);
	}
};

export class PrintAST extends UnaryAST
{
	static classdoc = "AST node for a ``<?print?>`` tag (e.g. ``<?print x?>``).";

	_eval(context)
	{
		let obj = this.obj._handle_eval(context);
		let output = _str(obj);
		context.output(output);
	}

	_str(out)
	{
		out.push("print ");
		this.obj._str(out);
	}
};

export class PrintXAST extends UnaryAST
{
	static classdoc = "AST node for a ``<?printx?>`` tag (e.g. ``<?printx x?>``).";

	_eval(context)
	{
		let obj = this.obj._handle_eval(context);
		let output = _xmlescape(obj);
		context.output(output);
	}

	_str(out)
	{
		out.push("printx ");
		this.obj._str(out);
	}
};

export class BinaryAST extends CodeAST
{
	static classdoc = "Base class for all UL4 AST nodes implementing binary expressions\n(i.e. operators with two operands).";

	constructor(template, pos, obj1, obj2)
	{
		super(template, pos);
		this.obj1 = obj1;
		this.obj2 = obj2;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " obj1=");
		this.obj1._repr(out);
		out.push(" obj2=");
		this.obj2._repr(out);
		out.push(">");
	}

	_eval(context)
	{
		let obj1 = this.obj1._handle_eval(context);
		let obj2 = this.obj2._handle_eval(context);
		return this._do(obj1, obj2);
	}
};

BinaryAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["obj1", "obj2"]);

// Item access and assignment (`x[y]`): dict[key], list[index], string[index], color[index]
export class ItemAST extends BinaryAST
{
	static classdoc = "AST node for subscripting expression (e.g. ``x[y]``).";

	_do(obj1, obj2)
	{
		let result = this._get(obj1, obj2);
		return result;
	}

	_eval_set(context, value)
	{
		let obj1 = this.obj1._handle_eval(context);
		let obj2 = this.obj2._handle_eval(context);
		this._set(obj1, obj2, value);
	}

	_eval_modify(context, operator, value)
	{
		let obj1 = this.obj1._handle_eval(context);
		let obj2 = this.obj2._handle_eval(context);
		this._modify(operator, obj1, obj2, value);
	}

	_get(container, key)
	{
		if (typeof(container) === "string" || _islist(container))
		{
			if (key instanceof slice)
			{
				let start = key.start, stop = key.stop;
				if (start === undefined || start === null)
					start = 0;
				if (stop === undefined || stop === null)
					stop = container.length;
				return container.slice(start, stop);
			}
			else
			{
				let orgkey = key;
				if (key < 0)
					key += container.length;
				if (key < 0 || key >= container.length)
					throw new IndexError(container, orgkey);
				return container[key];
			}
		}
		else if (container && typeof(container[symbols.getitem]) === "function") // objects without `_getitem__` don't support item access
			return container[symbols.getitem](key);
		else if (_ismap(container))
			return container.get(key);
		else if (_isobject(container))
			return container[key];
		else
			throw new TypeError(_type(container).fullname() + " object is not subscriptable");
	}

	_set(container, key, value)
	{
		if (_islist(container))
		{
			if (key instanceof slice)
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
				for (let iter = _iter(value);;)
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
					throw new IndexError(container, orgkey);
				container[key] = value;
			}
		}
		else if (container && typeof(container[symbols.setitem]) === "function") // test this before the generic object test
			container[symbols.setitem](key, value);
		else if (_ismap(container))
			container.set(key, value);
		else if (_isobject(container))
			container[key] = value;
		else
			throw new NotSubscriptableError(container);
	}

	_modify(operator, container, key, value)
	{
		this._set(container, key, operator._ido(this._get(container, key), value));
	}
};

// Identifty test operator (`x is y`)
export class IsAST extends BinaryAST
{
	static classdoc = "AST node for a binary ``is`` comparison expression (e.g. ``x is y``).";

	_do(obj1, obj2)
	{
		return obj1 === obj2;
	}
};

// Inverted identity test operator (`x is not y`)
export class IsNotAST extends BinaryAST
{
	static classdoc = "AST node for a binary ``is not`` comparison expression (e.g. ``x is not y``).";

	_do(obj1, obj2)
	{
		return obj1 !== obj2;
	}
};

// Comparison operator (`x == y`)
export class EQAST extends BinaryAST
{
	static classdoc = "AST node for the binary equality comparison (e.g. ``x == y``.";

	_do(obj1, obj2)
	{
		return _eq(obj1, obj2);
	}
};

// Comparison operator (`x != y`)
export class NEAST extends BinaryAST
{
	static classdoc = "AST node for a binary inequality comparison (e.g. ``x != y``).";

	_do(obj1, obj2)
	{
		return _ne(obj1, obj2);
	}
};

// Comparison operator (`x < y`)
export class LTAST extends BinaryAST
{
	static classdoc = "AST node for the binary \"less than\" comparison (e.g. ``x < y``).";

	_do(obj1, obj2)
	{
		return _lt(obj1, obj2);
	}
};

// Comparison operator (`x <= y`)
export class LEAST extends BinaryAST
{
	static classdoc = "AST node for the binary \"less than or equal\" comparison (e.g. ``x <= y``).";

	_do(obj1, obj2)
	{
		return _le(obj1, obj2);
	}
};

// Comparison operator (`x > y`)
export class GTAST extends BinaryAST
{
	static classdoc = "AST node for the binary \"greater than\" comparison (e.g. ``x > y``).";

	_do(obj1, obj2)
	{
		return _gt(obj1, obj2);
	}
};

// Comparison operator (`x >= y`)
export class GEAST extends BinaryAST
{
	static classdoc = "AST node for the binary \"greater than or equal\" comparison (e.g. ``x >= y``).";

	_do(obj1, obj2)
	{
		return _ge(obj1, obj2);
	}
};

// Containment test (`x in y`): string in string, obj in list, key in dict, value in rgb
export class ContainsAST extends BinaryAST
{
	static classdoc = "AST node for the binary containment testing operator (e.g. ``x in y``).";

	_do(obj, container)
	{
		if (typeof(obj) === "string" && typeof(container) === "string")
		{
			return container.indexOf(obj) !== -1;
		}
		else if (_islist(container))
		{
			return container.indexOf(obj) !== -1;
		}
		else if (container && typeof(container[symbols.contains]) === "function") // test this before the generic object test
			return container[symbols.contains](obj);
		else if (_ismap(container) || _isset(container))
			return container.has(obj);
		else if (_isobject(container))
		{
			for (let key in container)
			{
				if (key === obj)
					return true;
			}
			return false;
		}
		else if (_iscolor(container))
		{
			return container._r === obj || container._g === obj || container._b === obj || container._a === obj;
		}
		throw new TypeError(_type(container).fullname() + " object is not iterable");
	}
};

// Inverted containment test (`x not in y`)
export class NotContainsAST extends BinaryAST
{
	static classdoc = "AST node for an inverted containment testing expression (e.g. ``x not in y``).";

	_do(obj, container)
	{
		return !ContainsAST.prototype._do(obj, container);
	}
};

// Addition (`x + y`): num + num, string + string
export class AddAST extends BinaryAST
{
	static classdoc = "AST node for a binary addition expression (e.g. ``x + y``).";

	_do(obj1, obj2)
	{
		if (obj1 && typeof(obj1[symbols.add]) === "function")
			return obj1[symbols.add](obj2);
		else if (obj2 && typeof(obj2[symbols.radd]) === "function")
			return obj2[symbols.radd](obj1);
		if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined)
			throw new TypeError(_type(obj1).fullname() + " + " + _type(obj2).fullname() + " is not supported");
		if (_islist(obj1) && _islist(obj2))
			return [...obj1, ...obj2];
		else
			return obj1 + obj2;
	}

	_ido(obj1, obj2)
	{
		if (_islist(obj1) && _islist(obj2))
		{
			listtype.append(obj1, obj2);
			return obj1;
		}
		else
			return this._do(obj1, obj2);
	}
};

// Substraction (`x - y`): num - num
export class SubAST extends BinaryAST
{
	static classdoc = "AST node for the binary subtraction expression (e.g. ``x - y``).";

	_do(obj1, obj2)
	{
		if (obj1 && typeof(obj1[symbols.sub]) === "function")
			return obj1[symbols.sub](obj2);
		else if (obj2 && typeof(obj2[symbols.rsub]) === "function")
			return obj2[symbols.rsub](obj1);
		else if (_isdate(obj1) && _isdate(obj2))
			return this._date_sub(obj1, obj2);
		else if (_isdatetime(obj1) && _isdatetime(obj2))
			return this._datetime_sub(obj1, obj2);
		if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined)
			throw new TypeError(_type(obj1).fullname() + " - " + _type(obj2).fullname() + " is not supported");
		return obj1 - obj2;
	}

	_date_sub(obj1, obj2)
	{
		return this._datetime_sub(obj1._date, obj2._date);
	}

	_datetime_sub(obj1, obj2)
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
		let yearday1 = datetimetype.yearday(obj1);
		let year2 = obj2.getFullYear();
		let yearday2 = datetimetype.yearday(obj2);

		let diffdays = 0;

		while (year1 > year2)
		{
			diffdays += datetype.yearday(_date(year2, 12, 31));
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
		return new TimeDelta(diffdays, diffseconds, 1000*diffmilliseconds);
	}

	_ido(obj1, obj2)
	{
		return this._do(obj1, obj2);
	}
};


// Multiplication (`x * y`): num * num, int * str, str * int, int * list, list * int
export class MulAST extends BinaryAST
{
	static classdoc = "AST node for the binary multiplication expression (e.g. ``x * y``).";

	_do(obj1, obj2)
	{
		if (obj1 && typeof(obj1[symbols.mul]) === "function")
			return obj1[symbols.mul](obj2);
		else if (obj2 && typeof(obj2[symbols.rmul]) === "function")
			return obj2[symbols.rmul](obj1);
		if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined)
			throw new TypeError(obj1 + " * " + obj2 + " not supported");
		else if (_isint(obj1) || _isbool(obj1))
		{
			if (typeof(obj2) === "string")
			{
				if (obj1 < 0)
					throw new ValueError("repetition counter must be positive");
				return _str_repeat(obj2, obj1);
			}
			else if (_islist(obj2))
			{
				if (obj1 < 0)
					throw new ValueError("repetition counter must be positive");
				return _list_repeat(obj2, obj1);
			}
		}
		else if (_isint(obj2) || _isbool(obj2))
		{
			if (typeof(obj1) === "string")
			{
				if (obj2 < 0)
					throw new ValueError("repetition counter must be positive");
				return _str_repeat(obj1, obj2);
			}
			else if (_islist(obj1))
			{
				if (obj2 < 0)
					throw new ValueError("repetition counter must be positive");
				return _list_repeat(obj1, obj2);
			}
		}
		return obj1 * obj2;
	}

	_ido(obj1, obj2)
	{
		if (_islist(obj1) && _isint(obj2))
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
};

// Truncating division (`x // y`)
export class FloorDivAST extends BinaryAST
{
	static classdoc = "AST node for a binary truncating division expression (e.g. ``x // y``).";

	_do(obj1, obj2)
	{
		if (obj1 && typeof(obj1[symbols.floordiv]) === "function")
			return obj1[symbols.floordiv](obj2);
		else if (obj2 && typeof(obj2[symbols.rfloordiv]) === "function")
			return obj2[symbols.rfloordiv](obj1);
		if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined)
			throw new TypeError(_type(obj1).fullname() + " // " + _type(obj2).fullname() + " not supported");
		else if ((typeof(obj1) === "number" || typeof(obj1) === "boolean") && (typeof(obj2) === "number" || typeof(obj2) === "boolean") && obj2 == 0)
			throw new ZeroDivisionError();
		return Math.floor(obj1 / obj2);
	}

	_ido(obj1, obj2)
	{
		return this._do(obj1, obj2);
	}
};

// "Real" division (`x / y`)
export class TrueDivAST extends BinaryAST
{
	static classdoc = "AST node for a binary true division expression (e.g. ``x / y``).";

	_do(obj1, obj2)
	{
		if (obj1 && typeof(obj1[symbols.truediv]) === "function")
			return obj1[symbols.truediv](obj2);
		else if (obj2 && typeof(obj2[symbols.rtruediv]) === "function")
			return obj2[symbols.rtruediv](obj1);
		if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined)
			throw new TypeError(_type(obj1).fullname() + " / " + _type(obj2).fullname() + " not supported");
		else if ((typeof(obj1) === "number" || typeof(obj1) === "boolean") && (typeof(obj2) === "number" || typeof(obj2) === "boolean") && obj2 == 0)
			throw new ZeroDivisionError();
		return obj1 / obj2;
	}

	_ido(obj1, obj2)
	{
		return this._do(obj1, obj2);
	}
};

// Modulo (`x % y`)
export class ModAST extends BinaryAST
{
	static classdoc = "AST node for a binary modulo expression (e.g. ``x % y``).";

	_do(obj1, obj2)
	{
		return _mod(obj1, obj2);
	}

	_ido(obj1, obj2)
	{
		return this._do(obj1, obj2);
	}
};

// Bitwise left shift (`x << y`)
export class ShiftLeftAST extends BinaryAST
{
	static classdoc = "AST node for a bitwise left shift expression (e.g. ``x << y``).";

	_do(obj1, obj2)
	{
		if (obj2 === false)
			obj2 = 0;
		else if (obj2 === true)
			obj2 = 1;
		if (obj2 < 0)
			return ShiftRightAST.prototype._do(obj1, -obj2);
		if (obj1 === false)
			obj1 = 0;
		else if (obj1 === true)
			obj1 = 1;
		while (obj2--)
			obj1 *= 2;
		return obj1;
	}

	_ido(obj1, obj2)
	{
		return this._do(obj1, obj2);
	}
};

// Bitwise right shift (`x >> y`)
export class ShiftRightAST extends BinaryAST
{
	static classdoc = "AST node for a bitwise right shift expression (e.g. ``x >> y``).";

	_do(obj1, obj2)
	{
		if (obj2 === false)
			obj2 = 0;
		else if (obj2 === true)
			obj2 = 1;
		if (obj2 < 0)
			return ShiftLeftAST.prototype._do(obj1, -obj2);
		if (obj1 === false)
			obj1 = 0;
		else if (obj1 === true)
			obj1 = 1;
		while (obj2--)
			obj1 /= 2;
		return Math.floor(obj1);
	}

	_ido(obj1, obj2)
	{
		return this._do(obj1, obj2);
	}
};

// Bitwise and (`x & y`)
export class BitAndAST extends BinaryAST
{
	static classdoc = "AST node for a binary bitwise \"and\" expression (e.g ``x & y``).";

	_do(obj1, obj2)
	{
		if (obj2 === false)
			obj2 = 0;
		else if (obj2 === true)
			obj2 = 1;
		return obj1 & obj2;
	}

	_ido(obj1, obj2)
	{
		return this._do(obj1, obj2);
	}
};

// Bitwise exclusive or (`x ^ y`)
export class BitXOrAST extends BinaryAST
{
	static classdoc = "AST node for the binary bitwise \"exclusive or\" expression (e.g. ``x ^ y``).";

	_do(obj1, obj2)
	{
		if (obj2 === false)
			obj2 = 0;
		else if (obj2 === true)
			obj2 = 1;
		return obj1 ^ obj2;
	}

	_ido(obj1, obj2)
	{
		return this._do(obj1, obj2);
	}
};

// Bitwise or (`x | y`)
export class BitOrAST extends BinaryAST
{
	static classdoc = "AST node for a binary bitwise \"or\" expression (e.g. ``x | y``).";

	_do(obj1, obj2)
	{
		if (obj2 === false)
			obj2 = 0;
		else if (obj2 === true)
			obj2 = 1;
		return obj1 | obj2;
	}

	_ido(obj1, obj2)
	{
		return this._do(obj1, obj2);
	}
};

// Boolean logical and (`x and y`)
export class AndAST extends BinaryAST
{
	static classdoc = "AST node for the binary \"and\" expression (i.e. ``x and y``).";

	_eval(context)
	{
		let obj1 = this.obj1._handle_eval(context);
		if (!_bool(obj1))
			return obj1;
		let obj2 = this.obj2._handle_eval(context);
		return obj2;
	}
};

// Boolean logical or (`x or y`)
export class OrAST extends BinaryAST
{
	static classdoc = "AST node for a binary \"or\" expression (e.g. ``x or y``).";

	_eval(context)
	{
		let obj1 = this.obj1._handle_eval(context);
		if (_bool(obj1))
			return obj1;
		let obj2 = this.obj2._handle_eval(context);
		return obj2;
	}
};

// Attribute access (`x.y`)
export class AttrAST extends CodeAST
{
	static classdoc = "AST node for an expression that gets or sets an attribute of an object.\n(e.g. ``x.y``).";

	constructor(template, pos, obj, attrname)
	{
		super(template, pos);
		this.obj = obj;
		this.attrname = attrname;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " obj=");
		this.obj._repr(out);
		out.push(" attrname=", _repr(this.attrname), ">");
	}

	_eval(context)
	{
		let obj = this.obj._handle_eval(context);
		let result = this._get(obj, this.attrname);
		return result;
	}

	_eval_set(context, value)
	{
		let obj = this.obj._handle_eval(context);
		this._set(obj, this.attrname, value);
	}

	_eval_modify(context, operator, value)
	{
		let obj = this.obj._handle_eval(context);
		this._modify(operator, obj, this.attrname, value);
	}

	_get(object, attrname)
	{
		let type = _type(object);
		try
		{
			return type.getattr(object, attrname);
		}
		catch (exc)
		{
			if (exc instanceof AttributeError && exc.obj === object)
				return undefined;
			else
				throw exc;
		}
	}

	_set(object, attrname, value)
	{
		if (typeof(object) === "object" && typeof(object[symbols.setattr]) === "function")
			object[symbols.setattr](attrname, value);
		else if (_ismap(object))
			object.set(attrname, value);
		else if (_isobject(object))
			object[attrname] = value;
		else
			throw new TypeError(_type(object).fullname() + " object has no writable attributes");
	}

	_modify(operator, object, attrname, value)
	{
		let oldvalue = this._get(object, attrname);
		let newvalue = operator._ido(oldvalue, value);
		this._set(object, attrname, newvalue);
	}
};

AttrAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["obj", "attrname"]);

// Function call (`x(y, z)`)
export class CallAST extends CodeAST
{
	static classdoc = "AST node for calling an object (e.g. ``f(x, y)``).";

	constructor(template, pos, obj, args)
	{
		super(template, pos);
		this.obj = obj;
		this.args = args;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " obj=");
		this.obj._repr(out);
		for (let arg of this.args)
		{
			out.push(" ");
			arg._repr(out);
		}
		out.push(">");
	}

	_makeargs(context)
	{
		let args = [], kwargs = {};
		for (let arg of this.args)
			arg._handle_eval_call(context, args, kwargs);
		return [args, kwargs];
	}

	_handle_eval(context)
	{
		try
		{
			return this._eval(context);
		}
		catch (exc)
		{
			this._decorate_exception(exc);
			throw exc;
		}
	}

	_eval(context)
	{
		let obj = this.obj._handle_eval(context);
		let [args, kwargs] = this._makeargs(context);
		let result = _call(context, obj, args, kwargs);
		return result;
	}
};

CallAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["obj", "args"]);


export class RenderAST extends CallAST
{
	static classdoc = "AST node for rendering a template (e.g. ``<?render t(x)?>``.";

	constructor(template, pos, obj, args)
	{
		super(template, pos, obj, args);
		this.indent = null;
	}

	_repr(out)
	{
		out.push(
			"<",
			this.constructor.name,
			" indent=",
			_repr(this.indent.text),
			" obj="
		);
		this.obj._repr(out);
		out.push(0);
		for (let arg of this.args)
		{
			out.push(" ");
			arg._repr(out);
			out.push(0);
		}
		out.push(-1, ">");
	}

	_str(out)
	{
		out.push("render ", this.source.replace(/\r?\n/g, ' '));
		if (this.indent !== null)
		{
			out.push(" with indent ", _repr(this.indent.text));
		}
	}

	_render_object(context, obj, args, kwargs)
	{
		return _callrender(context, obj, args, kwargs);
	}

	_renderx_object(context, obj, args, kwargs)
	{
		context.escapes.push(_xmlescape);

		let result = null;
		try
		{
			result = _callrender(context, obj, args, kwargs);
		}
		finally
		{
			context.escapes.splice(context.escapes.length-1, 1);
		}
		return result;
	}

	_real_render_object(context, obj, args, kwargs)
	{
		this._render_object(context, obj, args, kwargs);
	}

	_print_object(context, obj, args, kwargs)
	{
		let output = _str(obj);
		context.output(output);
	}

	_printx_object(context, obj)
	{
		let output = _xmlescape(obj);
		context.output(output);
	}

	_dont_print_object(context, obj)
	{
		throw new TypeError(_repr(obj) + " is not renderable by UL4");
	}

	_real_print_object(context, obj)
	{
		this._dont_print_object(context, obj);
	}

	_handle_eval(context)
	{
		let localcontext = context.withindent(this.indent !== null ? this.indent.text : null);
		let obj = this.obj._handle_eval(localcontext);
		// If the object turns out to not be renderable we nonetheless evaluate the arguments
		let [args, kwargs] = this._makeargs(localcontext);
		this._handle_additional_arguments(localcontext, args, kwargs);

		try
		{
			if (_object_is_renderable(obj))
			{
				this._real_render_object(localcontext, obj, args, kwargs);
			}
			else
			{
				this._real_print_object(localcontext, obj);
			}
			return null;
		}
		catch (exc)
		{
			this._decorate_exception(exc);
			throw exc;
		}
	}

	_handle_additional_arguments(context, args)
	{
	}
};

RenderAST.prototype._ul4onattrs = CallAST.prototype._ul4onattrs.concat(["indent"]);


export class RenderXAST extends RenderAST
{
	static classdoc = "AST node for rendering a template and XML-escaping the output\n(e.g. ``<?renderx t(x)?>``.";

	_real_render_object(context, obj, args, kwargs)
	{
		this._renderx_object(context, obj, args, kwargs);
	}
};


export class RenderOrPrintAST extends RenderAST
{
	static classdoc = "AST node for rendering a template or printing an object.";

	_real_print_object(context, obj)
	{
		this._print_object(context, obj);
	}
};


export class RenderOrPrintXAST extends RenderAST
{
	static classdoc = "AST node for rendering a template or printing an object\n(e.g. ``<?render_or_printx t(x)?>``.";

	_real_print_object(context, obj)
	{
		this._printx_object(context, obj);
	}
};


export class RenderXOrPrintAST extends RenderAST
{
	static classdoc = "AST node for rendering a template or printing an object\n(e.g. ``<?renderx_or_print t(x)?>``.";

	_real_render_object(context, obj, args, kwargs)
	{
		this._renderx_object(context, obj, args, kwargs);
	}

	_real_print_object(context, obj)
	{
		this._print_object(context, obj);
	}
};


export class RenderXOrPrintXAST extends RenderAST
{
	static classdoc = "AST node for rendering a template or printing an object\n(e.g. ``<?renderx_or_printx t(x)?>``.";

	_real_render_object(context, obj, args, kwargs)
	{
		this._renderx_object(context, obj, args, kwargs);
	}

	_real_print_object(context, obj)
	{
		this._printx_object(context, obj);
	}
};


export class RenderBlockAST extends RenderAST
{
	static classdoc = "AST node for rendering a template via a ``<?renderblock?>`` block and\npassing the content of the block as one additional keyword argument named\n``content``.";

	_repr(out)
	{
		out.push("<", this.constructor.name, +1, "obj=");
		this.obj._repr(out);
		for (let arg of this.args)
		{
			out.push(0);
			arg._repr(out);
		}
		out.push(0, "content=");
		this.content._repr(out);
		out.push(-1, ">");
	}

	_handle_additional_arguments(context, args, kwargs)
	{
		if (kwargs.hasOwnProperty("content"))
			throw new ArgumentError("duplicate keyword argument content");
		let closure = new TemplateClosure(this.content, this.content.signature, context.vars);
		kwargs.content = closure;
	}

	[symbols.getattr](attrname)
	{
		if (
			attrname === "stoppos" ||
			attrname === "stopsource" ||
			attrname === "stopsourceprefix" ||
			attrname === "stopsourcesuffix"
		)
			return this[attrname];
		else
			return super[symbols.getattr](attrname);
	}
};

RenderBlockAST.prototype._ul4onattrs = RenderAST.prototype._ul4onattrs.concat(["stoppos", "content"]);


export class RenderBlocksAST extends RenderAST
{
	static classdoc = "AST node for rendering a template and passing additional arguments via\nnested variable definitions, e.g.::";

	_repr(out)
	{
		out.push("<", this.constructor.name, +1, "obj=");
		this.obj._repr(out);
		for (let arg of this.args)
		{
			out.push(0);
			arg._repr(out);
		}
		for (let item of this.content)
		{
			out.push(0);
			item._repr(out);
		}
		out.push(-1, ">");
	}

	_handle_additional_arguments(context, args, kwargs)
	{
		let localcontext = context.inheritvars();
		BlockAST.prototype._eval.call(this, localcontext);

		for (let key in localcontext.vars)
		{
			if (localcontext.vars.hasOwnProperty(key))
			{
				if (key in kwargs)
					throw new ArgumentError("duplicate keyword argument " + key);
				kwargs[key] = localcontext.get(key);
			}
		}
	}

	[symbols.getattr](attrname)
	{
		if (
			attrname === "stoppos" ||
			attrname === "stopsource" ||
			attrname === "stopsourceprefix" ||
			attrname === "stopsourcesuffix"
		)
			return this[attrname];
		else
			return super[symbols.getattr](attrname);
	}
};

RenderBlocksAST.prototype._ul4onattrs = RenderAST.prototype._ul4onattrs.concat(["stoppos", "content"]);


// Slice object
export class slice extends Proto
{
	constructor(start, stop)
	{
		super();
		this.start = start;
		this.stop = stop;
	}

	[symbols.type]()
	{
		return this.type;
	}

	of(string)
	{
		let start = this.start || 0;
		let stop = this.stop === null ? string.length : this.stop;
		return string.slice(start, stop);
	}

	[symbols.repr]()
	{
		return "slice(" + _repr(this.start) + ", " + _repr(this.stop) + ", None)";
	}

	[symbols.getattr](attrname)
	{
		switch (attrname)
		{
			case "start":
				return this.start;
			case "stop":
				return this.stop;
			default:
				throw new AttributeError(this, attrname);
		}
	}
};

slice.prototype.type = new Type(null, "slice", "A slice specification.");


// List/String slice (`x[y:z]`)
export class SliceAST extends CodeAST
{
	static classdoc = "AST node for creating a slice object (used in ``obj[index1:index2]``).";

	constructor(template, pos, index1, index2)
	{
		super(template, pos);
		this.index1 = index1;
		this.index2 = index2;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name);
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
	}

	_eval(context)
	{
		let index1 = this.index1 !== null ? this.index1._handle_eval(context) : null;
		let index2 = this.index2 !== null ? this.index2._handle_eval(context) : null;
		return new slice(index1, index2);
	}
};

SliceAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["index1", "index2"]);

export class ChangeVarAST extends CodeAST
{
	static classdoc = "Base class for all AST nodes that are assignment operators, i.e. that\nset or modify a variable/attribute or item.";

	constructor(template, pos, lvalue, value)
	{
		super(template, pos);
		this.lvalue = lvalue;
		this.value = value;
	}

	_repr(out)
	{
		out.push(
			"<",
			this.constructor.name,
			" lvalue=",
			_repr(this.lvalue),
			" value="
		);
		this.value._repr(out);
		out.push(">");
	}
};

ChangeVarAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["lvalue", "value"]);

export class SetVarAST extends ChangeVarAST
{
	static classdoc = "AST node for setting a variable, attribute or item to a value (e.g.\n``x = y``).";

	_eval(context)
	{
		let value = this.value._handle_eval(context);
		let items = _unpackvar(this.lvalue, value);
		for (let [lvalue, value] of items)
			lvalue._handle_eval_set(context, value);
	}
};

export class ModifyVarAST extends ChangeVarAST
{
	_eval(context)
	{
		let value = this.value._handle_eval(context);
		let items = _unpackvar(this.lvalue, value);
		for (let [lvalue, value] of items)
			lvalue._handle_eval_modify(context, this._operator, value);
	}
};

export class AddVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that adds a value to a\nvariable (e.g. ``x += y``).";
};

AddVarAST.prototype._operator = AddAST.prototype;

export class SubVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that subtracts a value from\na variable/attribute/item. (e.g. ``x -= y``).";
};

SubVarAST.prototype._operator = SubAST.prototype;

export class MulVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that assigns the result\nof a multiplication to its left operand. (e.g. ``x *= y``).";
};

MulVarAST.prototype._operator = MulAST.prototype;

export class TrueDivVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that assigns the result\nof a truncation division to its left operand. (e.g. ``x //= y``).";
};

TrueDivVarAST.prototype._operator = TrueDivAST.prototype;

export class FloorDivVarAST extends ModifyVarAST
{
	static classdoc = "AST node for augmented assignment expression that divides a variable by a\nvalue, truncating to an integer value (e.g. ``x //= y``).";
};

FloorDivVarAST.prototype._operator = FloorDivAST.prototype;

export class ModVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that assigns the result\nof a modulo expression to its left operand. (e.g. ``x %= y``).";
};

ModVarAST.prototype._operator = ModAST.prototype;

export class ShiftLeftVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that assigns the result\nof a \"shift left\" expression to its left operand. (e.g. ``x <<= y``).";
};

ShiftLeftVarAST.prototype._operator = ShiftLeftAST.prototype;

export class ShiftRightVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that assigns the result\nof a \"shift right\" expression to its left operand. (e.g. ``x >>= y``).";
};

ShiftRightVarAST.prototype._operator = ShiftRightAST.prototype;

export class BitAndVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that assigns the result\nof a binary bitwise \"and\" expression to its left operand.\n(e.g. ``x &= y``).";
};

BitAndVarAST.prototype._operator = BitAndAST.prototype;

export class BitXOrVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that assigns the result\nof a binary bitwise \"exclusive or\" expression to its left operand.\n(e.g. ``x ^= y``).";
};

BitXOrVarAST.prototype._operator = BitXOrAST.prototype;

export class BitOrVarAST extends ModifyVarAST
{
	static classdoc = "AST node for an augmented assignment expression that assigns the result\nof a binary bitwise \"or\" expression to its left operand.\n(e.g. ``x |= y``).";
};

BitOrVarAST.prototype._operator = BitOrAST.prototype;

export class BlockAST extends CodeAST
{
	static classdoc = "Base class for all AST nodes that are blocks.";

	constructor(template, startpos, stoppos)
	{
		super(template, startpos, stoppos);
		this.content = [];
	}

	_eval(context)
	{
		for (let item of this.content)
			item._handle_eval(context);
	}

	_str(out)
	{
		if (this.content.length)
		{
			for (let item of this.content)
			{
				item._str(out);
				out.push(0);
			}
		}
		else
		{
			out.push("pass", 0);
		}
	}

	[symbols.getattr](attrname)
	{
		if (
			attrname === "stoppos" ||
			attrname === "stopsource" ||
			attrname === "stopsourceprefix" ||
			attrname === "stopsourcesuffix"
		)
			return this[attrname];
		else
			return super[symbols.getattr](attrname);
	}
};

BlockAST.prototype._ul4onattrs = CodeAST.prototype._ul4onattrs.concat(["stoppos", "content"]);

export class ForBlockAST extends BlockAST
{
	static classdoc = "AST node for a ``<?for?>`` loop.";

	constructor(template, pos, varname, container)
	{
		super(template, pos);
		this.varname = varname;
		this.container = container;
	}

	_repr(out)
	{
		out.push(
			"<",
			this.constructor.name,
			" varname=",
			_repr(this.varname),
			" container="
		);
		this.container._repr(out);
		out.push(">");
	}

	_str_varname(out, varname)
	{
		if (_islist(varname))
		{
			out.push("(");
			let first = truel
			for (let subname of varname)
			{
				if (first)
					first = false;
				else
					out.push(", ");
				this._str_varname(out, subname);
			}
			if (varname.length == 1)
				out.push(",");
			out.push(")");
		}
		else
			varname._str(out);
	}

	_eval(context)
	{
		let container = this.container._handle_eval(context);

		for (let iter = _iter(container);;)
		{
			let value = iter.next();
			if (value.done)
				break;
			let varitems = _unpackvar(this.varname, value.value);
			for (let [lvalue, value] of varitems)
				lvalue._handle_eval_set(context, value);
			try
			{
				// We can't call _handle_eval() here, as this would in turn call
				// this function again, leading to infinite recursion. But we
				// don't have to, as wrapping the original exception in `Error`
				// has already been done by the lower levels.
				super._eval(context);
			}
			catch (exc)
			{
				if (exc instanceof BreakException)
					break;
				else if (exc instanceof ContinueException)
					;
				else
					throw exc;
			}
		}
	}

	_str(out)
	{
		out.push("for ");
		this._str_varname(out, this.varname);
		out.push(" in ");
		this.container._str(out);
		out.push(":", +1);
		BlockAST.prototype._str.call(this, out);
		out.push(-1);
	}
};

ForBlockAST.prototype._ul4onattrs = BlockAST.prototype._ul4onattrs.concat(["varname", "container"]);

export class WhileBlockAST extends BlockAST
{
	static classdoc = "AST node for a ``<?while?>`` loop.";

	constructor(template, pos, condition)
	{
		super(template, pos);
		this.condition = condition;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " condition=");
		this.condition._repr(out);
		out.push(">");
	}

	_str(out)
	{
		out.push("while ");
		this.condition._repr(out);
		out.push(":", +1);
		BlockAST.prototype._str.call(this, out);
		out.push(-1);
	}

	_eval(context)
	{
		while (true)
		{
			let cond = this.condition._handle_eval(context);
			if (!_bool(cond))
				break;
			try
			{
				// We can't call _handle_eval() here, as this would in turn call
				// this function again, leading to infinite recursion. But we
				// don't have to, as wrapping the original exception in `Error`
				// has already been done by the lower levels.
				super._eval(context);
			}
			catch (exc)
			{
				if (exc instanceof BreakException)
					break;
				else if (exc instanceof ContinueException)
					;
				else
					throw exc;
			}
		}
	}
};

WhileBlockAST.prototype._ul4onattrs = BlockAST.prototype._ul4onattrs.concat(["condition"]);

export class BreakAST extends CodeAST
{
	static classdoc = "AST node for a ``<?break?>`` tag inside a ``<?for?>`` loop.";

	_eval(context)
	{
		throw new BreakException();
	}

	_str(out)
	{
		out.push("break", 0);
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, ">");
	}
};

export class ContinueAST extends CodeAST
{
	static classdoc = "AST node for a ``<?continue?>`` tag inside a ``<?for?>`` block.";

	_eval(context)
	{
		throw new ContinueException();
	}

	_str(out)
	{
		out.push("continue", 0);
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, ">");
	}
};

export class ConditionalBlocksAST extends BlockAST
{
	static classdoc = "AST node for a conditional ``<?if?>/<?elif?>/<?else?>`` block.";

	_eval(context)
	{
		for (let block of this.content)
		{
			let execute = block._execute(context);
			if (execute)
			{
				block._handle_eval(context);
				break;
			}
		}
	}
};

export class ConditionalBlockAST extends  BlockAST
{
	constructor(template, pos, condition)
	{
		super(template, pos);
		this.condition = condition;
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " condition=");
		this.condition._repr(out);
		out.push(">");
	}

	_str(out)
	{
		out.push(this._strname, " ");
		this.condition._str(out);
		out.push(":", +1);
		BlockAST.prototype._str.call(this, out);
		out.push(-1);
	}

	_execute(context)
	{
		let cond = this.condition._handle_eval(context);
		let result = _bool(cond);
		return result;
	}
};

ConditionalBlockAST.prototype._ul4onattrs = BlockAST.prototype._ul4onattrs.concat(["condition"]);

export class IfBlockAST extends ConditionalBlockAST
{
	static classdoc = "AST node for an ``<?if?>`` block in an ``<?if?>/<?elif?>/<?else?>`` block.";
};

IfBlockAST.prototype._strname = "if";

export class ElIfBlockAST extends ConditionalBlockAST
{
	static classdoc = "AST node for an ``<?elif?>`` block.";
};

ElIfBlockAST.prototype._strname = "else if";

export class ElseBlockAST extends BlockAST
{
	static classdoc = "AST node for an ``<?else?>`` block.";

	_repr(out)
	{
		out.push("<", this.constructor.name, ">");
	}

	_str(out)
	{
		out.push("else:", +1);
		BlockAST.prototype._str.call(this, out);
		out.push(-1);
	}

	_execute(context)
	{
		return true;
	}
};


export class Template extends BlockAST
{
	static classdoc = "An UL4 template";

	constructor(template, pos, source, name, whitespace, signature)
	{
		super(template, pos);
		this._source = source;
		this.name = name;
		this.whitespace = whitespace;
		this.docpos = null;
		this.signature = signature;
		this._asts = null;
		this._ul4_signature = signature;
		this.parenttemplate = null;
	}

	[symbols.getattr](attrname)
	{
		let self = this;
		switch (attrname)
		{
			case "content":
				return this.content;
			case "source":
				return this.source;
			case "name":
				return this.name;
			case "whitespace":
				return this.whitespace;
			case "doc":
				return this.doc();
			case "signature":
				return this.signature;
			case "parenttemplate":
				return this.parenttemplate;
			case "render":
				let render = function render(context, vars){ self._renderbound(context, vars); };
				expose(render, this.signature, {needscontext: true, needsobject: true});
				return render;
			case "renders":
				let renders = function renders(context, vars){ return self._rendersbound(context, vars); };
				expose(renders, this.signature, {needscontext: true, needsobject: true});
				return renders;
			default:
				return super[symbols.getattr](attrname);
		}
	}

	ul4ondump(encoder)
	{
		let signature;
		encoder.dump(api_version);
		encoder.dump(this.name);
		encoder.dump(this._source);
		encoder.dump(this.whitespace);
		encoder.dump(this.docpos);
		encoder.dump(this.parenttemplate);
		if (this.signature === null || this.signature instanceof SignatureAST)
			signature = this.signature;
		else
		{
			signature = [];
			for (let param of this.signature.params)
			{
				signature.push(param.name, param.type);
				if (param.type.endsWith("="))
					signature.push(param.defaultValue);
			}
		}
		encoder.dump(signature);
		super.ul4ondump(encoder);
	}

	ul4onload(decoder)
	{
		let loaded_api_version = decoder.load();
		let signature;

		if (loaded_api_version === null)
			throw new ValueError("UL4ON doesn't support templates in 'source' format in Javascript implementation");

		if (loaded_api_version !== api_version)
			throw new ValueError("invalid version, expected " + api_version + ", got " + loaded_api_version);

		this.name = decoder.load();
		this._source = decoder.load();
		this.whitespace = decoder.load();
		this.docpos = decoder.load();
		this.parenttemplate = decoder.load();
		signature = decoder.load();
		if (_islist(signature))
			signature = new Signature(...signature);
		this.signature = signature;
		this._ul4_signature = signature;
		super.ul4onload(decoder);
	}

	loads(string)
	{
		return loads(string);
	}

	_eval(context)
	{
		let signature = null;
		if (this.signature !== null)
			signature = this.signature._handle_eval(context);
		let closure = new TemplateClosure(this, signature, context.vars);
		context.set(this.name, closure);
	}

	_repr(out)
	{
		out.push("<", this.constructor.name);
		if (this.name !== null)
			out.push(" name=", _repr(this.name));
		out.push(" whitespace=", _repr(this.whitespace), ">");
	}

	_str(out)
	{
		out.push(
			"def ",
			this.name ? this.name : "unnamed",
			":",
			+1
		);
		BlockAST.prototype._str.call(this, out);
		out.push(-1);
	}

	_renderbound(context, vars)
	{
		let localcontext = context.replacevars(vars);
		try
		{
			BlockAST.prototype._eval.call(this, localcontext);
		}
		catch (exc)
		{
			if (!(exc instanceof ReturnException))
				throw exc;
		}
	}

	[symbols.render](context, vars)
	{
		this._renderbound(context, vars);
	}

	render(context, vars)
	{
		this._renderbound(context, vars);
	}

	_rendersbound(context, vars)
	{
		let localcontext = context.replaceoutput();
		this._renderbound(localcontext, vars);
		return localcontext.getoutput();
	}

	renders(vars=null, globals=null)
	{
		let context = new Context({}, globals);
		vars = vars || {};
		if (this.signature !== null)
			vars = this.signature.bindObject(this.name, [], vars);
		return this._rendersbound(context, vars);
	}

	doc()
	{
		return this.docpos != null ? this.docpos.of(this._source) : null;
	}

	_callbound(context, vars)
	{
		let localcontext = context.replacevars(vars);
		try
		{
			BlockAST.prototype._eval.call(this, localcontext);
		}
		catch (exc)
		{
			if (exc instanceof ReturnException)
				return exc.result;
			else
				throw exc;
		}
		return null;
	}

	call(vars=null, globals=null)
	{
		let context = new Context({}, globals);
		vars = vars || {};
		if (this.signature !== null)
			vars = this.signature.bindObject(this.name, [], vars);
		return this._callbound(context, vars);
	}

	[symbols.call](context, vars)
	{
		return this._callbound(context, vars);
	}

	ul4type()
	{
		return "template";
	}
};

Template.prototype._ul4_needsobject = true;
Template.prototype._ul4_needscontext = true;

export class SignatureAST extends CodeAST
{
	static classdoc = "AST node for the signature of a locally defined subtemplate.";

	constructor(template, pos)
	{
		super(template, pos);
		this.params = [];
	}

	ul4ondump(encoder)
	{
		super.ul4ondump(encoder);

		let dump = [];

		for (let param of this.params)
		{
			dump.push(param[0], param[1]);
			if (param[1].endsWith("="))
				dump.push(param[2]);
		}
		encoder.dump(dump);
	}

	ul4onload(decoder)
	{
		super.ul4onload(decoder);
		let dump = decoder.load();
		this.params = [];
		let name;
		let type;
		let state = 0;
		for (let param of dump)
		{
			if (state == 0)
			{
				name = param;
				state = 1;
			}
			else if (state == 1)
			{
				type = param;
				if (type.endsWith("="))
					state = 2;
				else
				{
					this.params.push({name: name, type: type, defaultValue: null});
					state = 0;
				}
			}
			else
			{
				this.params.push({name: name, type: type, defaultValue: param});
				state = 0;
			}
		}
	}

	_eval(context)
	{
		let args = [];
		for (let param of this.params)
		{
			args.push(param.name, param.type);
			if (param.type.endsWith("="))
				args.push(param.defaultValue._handle_eval(context));
		}
		return new Signature(...args);
	}

	_repr(out)
	{
		out.push("<", this.constructor.name, " params=");
		this.params._repr(out);
		out.push(">");
	}
};

export class TemplateClosure extends Proto
{
	static classmodule = "ul4";
	static classdoc = "A locally defined UL4 template";

	constructor(template, signature, vars)
	{
		super();
		this.template = template;
		this.signature = signature;
		this.vars = vars;
		this._ul4_signature = signature;
		// Copy over the required attribute from the template
		this.name = template.name;
		this.tag = template.tag;
		this.endtag = template.endtag;
		this._source = template._source;
		this.docpos = template.docpos;
		this.content = template.content;
	}

	[symbols.render](context, vars)
	{
		this.template._renderbound(context, _extend(this.vars, vars));
	}

	render(context, vars)
	{
		this.template._renderbound(context, _extend(this.vars, vars));
	}

	[symbols.call](context, vars)
	{
		return this.template._callbound(context, _extend(this.vars, vars));
	}

	_renderbound(context, vars)
	{
		this.template._renderbound(context, _extend(this.vars, vars));
	}

	_rendersbound(context, vars)
	{
		return this.template._rendersbound(context, _extend(this.vars, vars));
	}

	[symbols.getattr](attrname)
	{
		let self = this;
		switch (attrname)
		{
			case "render":
				let render = function render(context, vars){ self._renderbound(context, vars); };
				expose(render, this.signature, {needscontext: true, needsobject: true});
				return render;
			case "renders":
				let renders = function renders(context, vars){ return self._rendersbound(context, vars); };
				expose(renders, this.signature, {needscontext: true, needsobject: true});
				return renders;
			case "signature":
				return this.signature;
			default:
				return this.template[symbols.getattr](attrname);
		}
	}

	ul4type()
	{
		return "template";
	}
};

TemplateClosure.prototype._ul4_needsobject = true;
TemplateClosure.prototype._ul4_needscontext = true;

// Create a color object from the red, green, blue and alpha values
// `r`, `g`, `b` and `b`
export function _rgb(r, g, b, a)
{
	return new Color(255*r, 255*g, 255*b, 255*a);
};

// Convert `obj` to a string and escape the characters `&`, `<`, `>`,
// `'` and `"` with their XML character/entity reference
export function _xmlescape(obj)
{
	obj = _str(obj);
	obj = obj.replace(/&/g, "&amp;");
	obj = obj.replace(/</g, "&lt;");
	obj = obj.replace(/>/g, "&gt;");
	obj = obj.replace(/'/g, "&#39;");
	obj = obj.replace(/"/g, "&quot;");
	return obj;
};

// Convert `obj` to a string suitable for output into a CSV file
export function _csv(obj)
{
	if (obj === null)
		return "";
	else if (typeof(obj) !== "string")
		obj = _repr(obj);
	if (obj.indexOf(",") !== -1 || obj.indexOf('"') !== -1 || obj.indexOf("\n") !== -1)
		obj = '"' + obj.replace(/"/g, '""') + '"';
	return obj;
};

// Return a string containing one character with the codepoint `i`
export function _chr(i)
{
	if (typeof(i) !== "number")
		throw new TypeError("chr() requires an int");
	return String.fromCharCode(i);
};

// Return the codepoint for the one and only character in the string `c`
export function _ord(c)
{
	if (typeof(c) !== "string" || c.length != 1)
		throw new TypeError("ord() requires a string of length 1");
	return c.charCodeAt(0);
};

// Convert an integer to a hexadecimal string
export function _hex(number)
{
	if (typeof(number) !== "number")
		throw new TypeError("hex() requires an int");
	if (number < 0)
		return "-0x" + number.toString(16).substr(1);
	else
		return "0x" + number.toString(16);
};

// Convert an integer to a octal string
export function _oct(number)
{
	if (typeof(number) !== "number")
		throw new TypeError("oct() requires an int");
	if (number < 0)
		return "-0o" + number.toString(8).substr(1);
	else
		return "0o" + number.toString(8);
};

// Convert an integer to a binary string
export function _bin(number)
{
	if (typeof(number) !== "number")
		throw new TypeError("bin() requires an int");
	if (number < 0)
		return "-0b" + number.toString(2).substr(1);
	else
		return "0b" + number.toString(2);
};

// Return the minimum value
export function _min(context, defaultValue=Object, key=null, args=[])
{
	if (args.length == 0)
		throw new ArgumentError("min() requires at least 1 argument, 0 given");
	else if (args.length == 1)
		args = args[0];
	let iter = _iter(args);
	let result;
	let minvalue;
	let first = true;
	while (true)
	{
		let item = iter.next();
		if (item.done)
		{
			if (first)
			{
				if (defaultValue === Object)
					throw new ValueError("min() argument is an empty sequence!");
				return defaultValue;
			}
			return result;
		}
		let testvalue = item.value;
		if (key !== null)
			testvalue = _call(context, key, [testvalue], {});
		if (first || (testvalue < minvalue))
		{
			result = item.value;
			minvalue = testvalue;
		}
		first = false;
	}
};

// Return the maximum value
export function _max(context, defaultValue=Object, key=null, args=[])
{
	if (args.length == 0)
		throw new ArgumentError("max() requires at least 1 argument, 0 given");
	else if (args.length == 1)
		args = args[0];
	let iter = _iter(args);
	let result;
	let minvalue;
	let first = true;
	while (true)
	{
		let item = iter.next();
		if (item.done)
		{
			if (first)
			{
				if (defaultValue === Object)
					throw new ValueError("max() argument is an empty sequence!");
				return defaultValue;
			}
			return result;
		}
		let testvalue = item.value;
		if (key !== null)
			testvalue = _call(context, key, [testvalue], {});
		if (first || (testvalue > minvalue))
		{
			result = item.value;
			minvalue = testvalue;
		}
		first = false;
	}
};

// Return the of the values from the iterable starting with `start` (default `0`)
export function _sum(iterable, start=0)
{
	for (let iter = _iter(iterable);;)
	{
		let item = iter.next();
		if (item.done)
			break;
		start += item.value;
	}
	return start;
};

// Return the first value produced by iterating through `iterable`
// (defaulting to `defaultValue` if the iterator is empty)
export function _first(iterable, defaultValue=null)
{
	let item = _iter(iterable).next();
	return item.done ? defaultValue : item.value;
};

// Return the last value produced by iterating through `iterable`
// (defaulting to `defaultValue` if the iterator is empty)
export function _last(iterable, defaultValue=null)
{
	let value = defaultValue;

	for (let iter = _iter(iterable);;)
	{
		let item = iter.next();
		if (item.done)
			break;
		value = item.value;
	}
	return value;
};

// Return a sorted version of `iterable`
export function _sorted(context, iterable, key=null, reverse=false)
{
	if (key === null)
	{
		// FIXME: stability
		let cmp = reverse ? function cmp(a, b)
		{
			return -_cmp("<=>", a, b);
		} : function cmp(a, b)
		{
			return _cmp("<=>", a, b);
		};
		let result = _list(iterable);
		result.sort(cmp);
		return result;
	}
	else
	{
		let sort = [];

		for (let i = 0, iter = _iter(iterable);;++i)
		{
			let item = iter.next();
			if (item.done)
				break;
			let keyvalue = _call(context, key, [item.value], {});
			// For a stable sorting we have to use the negative index if
			// reverse sorting is specified
			sort.push([keyvalue, reverse ? -i : i, item.value]);
		}
		function cmp(s1, s2)
		{
			let res = _cmp("<=>", s1[0], s2[0]);
			if (res)
				return reverse ? -res : res;
			res = _cmp("<=>", s1[1], s2[1]);
			return reverse ? -res : res;
		};

		sort.sort(cmp);

		let result = [];
		for (let item of sort)
			result.push(item[2]);
		return result;
	}
};

// Return a iterable object iterating from `start` up to (but not including)
// `stop` with a step size of `step`
export function _range(start, stop=Object, step=Object)
{
	if (step === Object)
		step = 1;
	if (stop === Object)
	{
		stop = start;
		start = 0;
	}
	let lower, higher;
	if (step === 0)
		throw new ValueError("range() requires a step argument != 0");
	else if (step > 0)
	{
		lower = start;
		higher = stop;
	}
	else
	{
		lower = stop;
		higher = start;
	}
	let length = (lower < higher) ? Math.floor((higher - lower - 1)/Math.abs(step)) + 1 : 0;

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
export function _slice(iterable, start, stop=Object, step=Object)
{
	if (step === Object)
		step = 1;
	if (stop === Object)
	{
		stop = start;
		start = 0;
	}
	if (start < 0)
		throw new ValueError("slice() requires a start argument >= 0");
	if (stop < 0)
		throw new ValueError("slice() requires a stop argument >= 0");
	if (step <= 0)
		throw new ValueError("slice() requires a step argument > 0");

	let next = start, count = 0;
	let iter = _iter(iterable);
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

// `%` escape unsafe characters in the string `string`
export function _urlquote(string)
{
	return encodeURIComponent(string);
};

// The inverse function of `urlquote`
export function _urlunquote(string)
{
	return decodeURIComponent(string);
};

// Return a reverse iterator over `sequence`
export function _reversed(sequence)
{
	if (typeof(sequence) !== "string" && !_islist(sequence)) // We don't have to materialize strings or lists
		sequence = _list(sequence);
	return {
		index: sequence.length-1,
		next: function() {
			return this.index >= 0 ? {value: sequence[this.index--], done: false} : {done: true};
		}
	};
};

// Returns a random number in the interval `[0;1[`
export function _random()
{
	return Math.random();
};

// Return a randomly select item from `range(start, stop, step)`
export function _randrange(start, stop=Object, step=Object)
{
	if (step === Object)
		step = 1;
	if (stop === Object)
	{
		stop = start;
		start = 0;
	}
	let width = stop-start;

	let value = Math.random();

	let n;
	if (step > 0)
		n = Math.floor((width + step - 1) / step);
	else if (step < 0)
		n = Math.floor((width + step + 1) / step);
	else
		throw new ValueError("randrange() requires a step argument != 0");
	return start + step*Math.floor(value * n);
};

// Return a random item/char from the list/string `sequence`
export function _randchoice(sequence)
{
	let iscolor = _iscolor(sequence);
	if (typeof(sequence) !== "string" && !_islist(sequence) && !iscolor)
		throw new TypeError("randchoice() requires a string or list");
	if (iscolor)
		sequence = _list(sequence);
	return sequence[Math.floor(Math.random() * sequence.length)];
};

// Round a number `x` to `digits` decimal places (may be negative)
export function _round(x, digits=0)
{
	if (digits)
	{
		let threshold = Math.pow(10, digits);
		return Math.round(x*threshold)/threshold;
	}
	else
		return Math.round(x);
};

// Round a number `x` down to `digits` decimal places (may be negative)
export function _floor(x, digits=0)
{
	if (digits)
	{
		let threshold = Math.pow(10, digits);
		return Math.floor(x*threshold)/threshold;
	}
	else
		return Math.floor(x);
};

// Round a number `x` up to `digits` decimal places (may be negative)
export function _ceil(x, digits=0)
{
	if (digits)
	{
		let threshold = Math.pow(10, digits);
		return Math.ceil(x*threshold)/threshold;
	}
	else
		return Math.ceil(x);
};

// Return a hex-encode MD5 hash of the argument
// This uses the md5 function from https://github.com/blueimp/JavaScript-MD5
import md5 from 'blueimp-md5';

export function _md5(string)
{
	return md5(string);
}

export function _scrypt(string, salt)
{
	throw new NotImplementedError("scrypt() is not implemented");
}

export function _css(value, defaultValue)
{
	if (value.startsWith("#"))
	{
		if (value.length == 4)
		{
			return new Color(
				17 * parseInt(value[1], 16),
				17 * parseInt(value[2], 16),
				17 * parseInt(value[3], 16)
			);
		}
		else if (value.length == 5)
		{
			return new Color(
				17 * parseInt(value[1], 16),
				17 * parseInt(value[2], 16),
				17 * parseInt(value[3], 16),
				17 * parseInt(value[4], 16)
			);
		}
		else if (value.length == 7)
		{
			return new Color(
				parseInt(value.substring(1, 3), 16),
				parseInt(value.substring(3, 5), 16),
				parseInt(value.substring(5, 7), 16)
			);
		}
		else if (value.length == 9)
		{
			return new Color(
				parseInt(value.substring(1, 3), 16),
				parseInt(value.substring(3, 5), 16),
				parseInt(value.substring(5, 7), 16),
				parseInt(value.substring(7, 9), 16)
			);
		}
	}
	else if (value.startsWith("rgb(") && value.endsWith(")"))
	{
		let parts = value.slice(4, -1).split(",");
		if (parts.length == 3)
		{
			for (let i = 0; i < 3; ++i)
			{
				let part = parts[i];
				if (part.endsWith("%"))
					parts[i] = parseInt(part.slice(0, -1), "10")*255/100;
				else
					parts[i] = parseInt(part, "10");
			}
			return new Color(...parts);
		}
	}
	else if (value.startsWith("rgba(") && value.endsWith(")"))
	{
		let parts = value.slice(5, -1).split(",");
		if (parts.length == 4)
		{
			for (let i = 0; i < 4; ++i)
			{
				let part = parts[i];
				if (part.endsWith("%"))
					parts[i] = parseInt(part.slice(0, -1), "10")*255/100;
				else if (i == 3)
					parts[i] = parseFloat(part)*255;
				else
					parts[i] = parseInt(part, "10");
			}
			return new Color(...parts);
		}
	}
	else
	{
		let color = Color.cssColors[value];
		if (color !== undefined)
			return color;
	}
	if (defaultValue === undefined)
		throw new ValueError("css() can't interpret " + _repr(value) + " as a CSS color value");
	else
		return defaultValue;
}

export function _mix(values)
{
	let r = 0.0;
	let g = 0.0;
	let b = 0.0;
	let a = 0.0;
	let weight = 1.0;
	let sumweights = 0.0;

	for (let value of values)
	{
		if (value instanceof Color)
		{
			sumweights += weight;
			r += weight * value._r;
			g += weight * value._g;
			b += weight * value._b;
			a += weight * (255-value._a);
		}
		else if (typeof(value) === "number")
		{
			weight = value;
		}
		else
			throw new ArgumentError("color.mix() arguments msut be numbers or colors, not " + _type(value).fullname());
	}
	if (sumweights == 0.0)
		throw new ValueError("at least one of the arguments must be a color and at least one of the weights must be >0");

	return new Color(r/sumweights, g/sumweights, b/sumweights, 255-a/sumweights);
}

// Return an iterator over `[index, item]` lists from the iterable object
// `iterable`. `index` starts at `start` (defaulting to 0).
export function _enumerate(iterable, start=0)
{
	return {
		iter: _iter(iterable),
		index: start,
		next: function() {
			let item = this.iter.next();
			return item.done ? item : {value: [this.index++, item.value], done: false};
		}
	};
};

// Return an iterator over `[isfirst, item]` lists from the iterable object
// `iterable` (`isfirst` is true for the first item, false otherwise).
export function _isfirst(iterable)
{
	let iter = _iter(iterable);
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

// Return an iterator over `[islast, item]` lists from the iterable object
// `iterable` (`islast` is true for the last item, false otherwise).
export function _islast(iterable)
{
	let iter = _iter(iterable);
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

// Return an iterator over `[isfirst, islast, item]` lists from the iterable
// object `iterable` (`isfirst` is true for the first item, `islast`
// is true for the last item. Both are false otherwise).
export function _isfirstlast(iterable)
{
	let iter = _iter(iterable);
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

// Return an iterator over `[index, isfirst, islast, item]` lists from the
// iterable object `iterable` (`isfirst` is true for the first item,
// `islast` is true for the last item. Both are false otherwise).
export function _enumfl(iterable, start=0)
{
	let iter = _iter(iterable);
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

// Return an iterator over lists, where the i'th list consists of all i'th
// items from the arguments (terminating when the shortest argument ends).
export function _zip(iterables)
{
	let result;
	if (iterables.length)
	{
		let iters = [];
		for (let iterable of iterables)
			iters.push(_iter(iterable));

		return {
			next: function() {
				let items = [];
				for (let iter of iters)
				{
					let item = iter.next();
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

// Return the absolute value for the number `number`.
export function _abs(number)
{
	if (number !== null && typeof(number[symbols.abs]) === "function")
		return number[symbols.abs]();
	return Math.abs(number);
};

// Return a `Date` object from the arguments passed in.
export function _date(year, month, day)
{
	return datetype[symbols.call](year, month, day);
};

export function _datetime(year, month, day, hour=0, minute=0, second=0, microsecond=0)
{
	return datetimetype[symbols.call](year, month, day, hour, minute, second, microsecond);
};

// Return a `TimeDelta` object from the arguments passed in.
export function _timedelta(days=0, seconds=0, microseconds=0)
{
	return TimeDelta.type[symbols.call](days, seconds, microseconds);
};

// Return a `MonthDelta` object from the arguments passed in.
export function _monthdelta(months=0)
{
	return MonthDelta.type[symbols.call](months);
};

// Return a `Color` object from the hue, luminescence, saturation and
// alpha values `h`, `l`, `s` and `a` (i.e. using the HLS color model).
export function _hls(h, l, s, a)
{
	let _v = function _v(m1, m2, hue)
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
	if (a === undefined)
		a = 1;
	if (s === 0.0)
		return _rgb(l, l, l, a);
	if (l <= 0.5)
		m2 = l * (1.0+s);
	else
		m2 = l+s-(l*s);
	m1 = 2.0*l - m2;
	return _rgb(_v(m1, m2, h+1/3), _v(m1, m2, h), _v(m1, m2, h-1/3), a);
};

// Return a `Color` object from the hue, saturation, value and alpha values
// `h`, `s`, `v` and `a` (i.e. using the HSV color model).
export function _hsv(h, s, v, a)
{
	if (s === 0.0)
		return _rgb(v, v, v, a);
	let i = Math.floor(h*6.0);
	let f = (h*6.0) - i;
	let p = v*(1.0 - s);
	let q = v*(1.0 - s*f);
	let t = v*(1.0 - s*(1.0-f));
	switch (i%6)
	{
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
};

// Return the item with the key `key` from the dict `container`.
// If `container` doesn't have this key, return `defaultvalue`.
export function _get(container, key, defaultvalue)
{
	if (_ismap(container))
	{
		if (container.has(key))
			return container.get(key);
		return defaultvalue;
	}
	else if (_isobject(container))
	{
		let result = container[key];
		if (result === undefined)
			return defaultvalue;
		return result;
	}
	throw new TypeError("get() requires a dict");
};

// Return a `Date` object for the current time.
export function now()
{
	return new Date();
};

// Return a `Date` object for the current time in UTC.
export function utcnow()
{
	let now = new Date();
	// FIXME: The timezone is wrong for the new `Date` object.
	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
};

// Return an `Date` object for today.
export function today()
{
	let now = new Date();
	return new Date_(now.getFullYear(), now.getMonth()+1, now.getDate());
};

export class Module
{
	constructor(name, doc, content={})
	{
		this.__name__ = name;
		this.__doc__ = doc;
		for (let [key, value] of Object.entries(content))
			this[key] = value;
	}

	[symbols.getattr](attrname)
	{
		if (this.hasOwnProperty(attrname))
			return this[attrname];
		throw new ul4.AttributeError(this, attrname);
	}
};

function _ul4on_loads(dump)
{
	return loads(dump);
};

expose(_ul4on_loads, ["dump", "p"], {name: "loads"});

function _ul4on_dumps(obj, indent=null)
{
	return dumps(obj, indent);
};

expose(_ul4on_dumps, ["obj", "p", "indent", "pk=", null], {name: "dumps"});

function isclose(a, b, rel_tol=1e-9, abs_tol=0.0)
{
	if (a === b)
		return true;

	if (a === Infinity || a === -Infinity || b === Infinity || b === -Infinity)
		return false;

	let diff = Math.abs(b - a);

	if (diff <= Math.abs(rel_tol * a))
		return true;
	if (diff <= Math.abs(rel_tol * b))
		return true;
	if (diff <= abs_tol)
		return true;
	return false;
}

expose(Math.cos, ["x", "p"]);
expose(Math.sin, ["x", "p"]);
expose(Math.tan, ["x", "p"]);
expose(Math.sqrt, ["x", "p"]);
expose(isclose, ["a", "pk", "b", "pk", "rel_tol", "k=", 1e-9, "abs_tol", "k=", 0.0]);


export class AttrGetterType extends Type
{
	[symbols.call](attrs)
	{
		return new AttrGetter(attrs);
	}

	instancecheck(obj)
	{
		return obj instanceof AttrGetter;
	}
};

expose(AttrGetterType.prototype, ["attrs", "*"], {name: "attrgetter"});

let attrgettertype = new AttrGetterType("operator", "attrgetter", "A callable object that fetches the given attribute(s) from its operand.");

export class AttrGetter
{
	// Create a new AttrGetter object
	constructor(attrs)
	{
		this.attrs = attrs;
	}

	[symbols.type]()
	{
		return attrgettertype;
	}

	_getone(obj, attrnames)
	{
		for (let attrname of attrnames.split("."))
		{
			let type = _type(obj);
			obj = type.getattr(obj, attrname);
		}
		return obj;
	}

	[symbols.call](obj)
	{
		if (this.attrs.length === 1)
			return this._getone(obj, this.attrs[0])
		else
		{
			let result = [];
			for (let attrnames of this.attrs)
				result.push(this._getone(obj, attrnames));
			return result;
		}
	}
};

expose(AttrGetter.prototype, ["obj", "p"], {name: "attrgetter"});


export function _attrgetter(attrnames)
{
	function getone(obj, dottedname)
	{
		let result = obj;
		for (let name of dottedname.split("."))
			result = AttrAST.prototype._get(result, name);
		return result;
	}

	function get(obj)
	{
		if (attrnames.length === 1)
			return getone(obj, attrnames[0]);
		else
		{
			let result = [];
			for (let dottedattrname of attrnames)
				result.push(getone(obj, dottedattrname));
			return result;
		}
	}
	expose(get, ["obj", "p"]);
	return get;
}

expose(_attrgetter, ["attrs", "*"]);

expose(_repr, ["obj", "p"], {name: "repr"});
expose(_ascii, ["obj", "p"], {name: "ascii"});
expose(_len, ["sequence", "p"], {name: "len"});
expose(_type, ["obj", "p"], {name: "type"});
expose(_format, ["obj", "pk", "fmt", "pk", "lang", "pk=", null], {name: "format"});
expose(_any, ["iterable", "p"], {name: "any"});
expose(_all, ["iterable", "p"], {name: "all"});
expose(_zip, ["iterables", "*"], {name: "zip"});
expose(_getattr, ["obj", "p", "attrname", "p", "default", "p=", null], {name: "getattr"});
expose(_hasattr, ["obj", "p", "attrname", "p"], {name: "hasattr"});
expose(_dir, ["obj", "p"], {name: "dir"});
expose(_isundefined, ["obj", "p"], {name: "isundefined"});
expose(_isdefined, ["obj", "p"], {name: "isdefined"});
expose(_isnone, ["obj", "p"], {name: "isnone"});
expose(_isbool, ["obj", "p"], {name: "isbool"});
expose(_isint, ["obj", "p"], {name: "isint"});
expose(_isfloat, ["obj", "p"], {name: "isfloat"});
expose(_isstr, ["obj", "p"], {name: "isstr"});
expose(_isdate, ["obj", "p"], {name: "isdate"});
expose(_isdatetime, ["obj", "p"], {name: "isdatetime"});
expose(_iscolor, ["obj", "p"], {name: "iscolor"});
expose(_istimedelta, ["obj", "p"], {name: "istimedelta"});
expose(_ismonthdelta, ["obj", "p"], {name: "ismonthdelta"});
expose(_istemplate, ["obj", "p"], {name: "istemplate"});
expose(_isfunction, ["obj", "p"], {name: "isfunction"});
expose(_islist, ["obj", "p"], {name: "islist"});
expose(_isset, ["obj", "p"], {name: "isset"});
expose(_isdict, ["obj", "p"], {name: "isdict"});
expose(_isexception, ["obj", "p"], {name: "isexception"});
expose(_isinstance, ["obj", "p", "type", "p"], {name: "isinstance"});
expose(_asjson, ["obj", "p"], {name: "asjson"});
expose(_fromjson, ["string", "p"], {name: "fromjson"});
expose(_asul4on, ["obj", "p", "indent", "pk=",null], {name: "asul4on"});
expose(_fromul4on, ["dump", "p"], {name: "fromul4on"});
expose(now, []);
expose(utcnow, []);
expose(today, []);
expose(_enumerate, ["iterable", "pk", "start", "pk=", 0], {name: "enumerate"});
expose(_isfirst, ["iterable", "p"], {name: "isfirst"});
expose(_islast, ["iterable", "p"], {name: "islast"});
expose(_isfirstlast, ["iterable", "p"], {name: "isfirstlast"});
expose(_enumfl, ["iterable", "p", "start", "pk=", 0], {name: "enumfl"});
expose(_abs, ["number", "p"], {name: "abs"});
expose(_rgb, ["r", "pk", "g", "pk", "b", "pk", "a", "pk=", 1.0], {name: "rgb"});
expose(_hls, ["h", "pk", "l", "pk", "s", "pk", "a", "pk=", 1.0], {name: "hls"});
expose(_hsv, ["h", "pk", "s", "pk", "v", "pk", "a", "pk=", 1.0], {name: "hsv"});
expose(_xmlescape, ["obj", "p"], {name: "xmlescape"});
expose(_csv, ["obj", "p"], {name: "csv"});
expose(_chr, ["i", "p"], {name: "chr"});
expose(_ord, ["c", "p"], {name: "ord"});
expose(_hex, ["number", "p"], {name: "hex"});
expose(_oct, ["number", "p"], {name: "oct"});
expose(_bin, ["number", "p"], {name: "bin"});
expose(_min, ["default", "k=", Object, "key", "k=", null, "args", "*"], {name: "min", needscontext: true});
expose(_max, ["default", "k=", Object, "key", "k=", null, "args", "*"], {name: "max", needscontext: true});
expose(_sum, ["iterable", "p", "start", "pk=", 0], {name: "sum"});
expose(_first, ["iterable", "p", "default", "pk=", null], {name: "first"});
expose(_last, ["iterable", "p", "default", "pk=", null], {name: "last"});
expose(_sorted, ["iterable", "p", "key", "pk=", null, "reverse", "pk=", false], {name: "sorted", needscontext: true});
expose(_range, ["start", "p", "stop", "p=", Object, "step", "p=", Object], {name: "range"});
expose(_slice, ["iterable", "p", "start", "p", "stop", "p=", Object, "step", "p=", Object], {name: "slice"});
expose(_urlquote, ["string", "pk"], {name: "urlquote"});
expose(_urlunquote, ["string", "pk"], {name: "urlunquote"});
expose(_reversed, ["sequence", "p"], {name: "reversed"});
expose(_random, [], {name: "random"});
expose(_randrange, ["start", "p", "stop", "p=", Object, "step", "p=", Object], {name: "randrange"});
expose(_randchoice, ["seq", "pk"], {name: "randchoice"});
expose(_round, ["x", "p", "digits", "pk=", 0], {name: "round"});
expose(_floor, ["x", "p", "digits", "pk=", 0], {name: "floor"});
expose(_ceil, ["x", "p", "digits", "pk=", 0], {name: "ceil"});
expose(_md5, ["string", "p"], {name: "md5"});
expose(_scrypt, ["string", "p", "salt", "pk"], {name: "scrypt"});
expose(_css, ["value", "p", "default", "p=", undefined], {name: "css"});
expose(_mix, ["values", "*"], {name: "mix"});

// Functions implementing UL4 methods
export function _count(obj, sub, start=null, end=null)
{
	if (start < 0)
		start += obj.length;
	if (start === null)
		start = 0;

	if (end < 0)
		end += obj.length;
	if (end === null)
		end = obj.length;

	let isstr = _isstr(obj);

	if (isstr && !sub.length)
	{
		if (end < 0 || start > obj.length || start > end)
			return 0;
		let result = end - start + 1;
		if (result > obj.length + 1)
			result = obj.length + 1;
		return result;
	}

	start = _bound(start, obj.length);
	end = _bound(end, obj.length);

	let count = 0;
	if (_islist(obj))
	{
		for (let i = start; i < end; ++i)
		{
			if (_eq(obj[i], sub))
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

export function _find(obj, sub, start=null, end=null)
{
	if (start < 0)
		start += obj.length;
	if (start === null)
		start = 0;
	if (end < 0)
		end += obj.length;
	if (end === null)
		end = obj.length;
	start = _bound(start, obj.length);
	end = _bound(end, obj.length);

	if (start !== 0 || end !== obj.length)
	{
		if (typeof(obj) === "string")
			obj = obj.substring(start, end);
		else
			obj = obj.slice(start, end);
	}
	let result = obj.indexOf(sub);
	if (result !== -1)
		result += start;
	return result;
};

export function _rfind(obj, sub, start=null, end=null)
{
	if (start < 0)
		start += obj.length;
	if (start === null)
		start = 0;
	if (end < 0)
		end += obj.length;
	if (end === null)
		end = obj.length;
	start = _bound(start, obj.length);
	end = _bound(end, obj.length);

	if (start !== 0 || end !== obj.length)
	{
		if (typeof(obj) === "string")
			obj = obj.substring(start, end);
		else
			obj = obj.slice(start, end);
	}
	let result = obj.lastIndexOf(sub);
	if (result !== -1)
		result += start;
	return result;
};

export function _week4format(obj, firstweekday=null)
{
	if (firstweekday === null)
		firstweekday = 0;
	else
		firstweekday %= 7;

	let yearday = datetimetype.yearday(obj)+6;
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

export function _isleap(obj)
{
	return new Date(obj.getFullYear(), 1, 29).getMonth() === 1;
};

export class ColorType extends Type
{
	[symbols.call](r=0, g=0, b=0, a=255)
	{
		return new Color(r, g, b, a);
	}

	instancecheck(obj)
	{
		return obj instanceof Color;
	}
};

expose(ColorType.prototype, ["r", "pk=", 0, "g", "pk=", 0, "b", "pk=", 0, "a", "pk=", 255], {name: "color"});

ColorType.prototype.attrs = new Set([
	"a",
	"abslight",
	"abslum",
	"b",
	"combine",
	"g",
	"hls",
	"hlsa",
	"hsv",
	"hsva",
	"hue",
	"invert",
	"light",
	"lum",
	"r",
	"rellight",
	"rellum",
	"sat",
	"witha",
	"withhue",
	"withlight",
	"withlum",
	"withsat"
]);

let colortype = new ColorType("color", "Color", "An RGBA color (with 8-bit red, green, blue and alpha values).");

export class Color extends Proto
{
	constructor(r=0, g=0, b=0, a=255)
	{
		super();
		this._r = _bound(_round(r), 255);
		this._g = _bound(_round(g), 255);
		this._b = _bound(_round(b), 255);
		this._a = _bound(_round(a), 255);
	}

	[symbols.type]()
	{
		return colortype;
	}

	[symbols.repr]()
	{
		let r = _lpad(this._r.toString(16), "0", 2);
		let g = _lpad(this._g.toString(16), "0", 2);
		let b = _lpad(this._b.toString(16), "0", 2);
		let a = _lpad(this._a.toString(16), "0", 2);
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
	}

	[symbols.str]()
	{
		if (this._a !== 0xff)
		{
			return "rgba(" + this._r + ", " + this._g + ", " + this._b + ", " + (this._a/255) + ")";
		}
		else
		{
			let r = _lpad(this._r.toString(16), "0", 2);
			let g = _lpad(this._g.toString(16), "0", 2);
			let b = _lpad(this._b.toString(16), "0", 2);
			if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1])
				return "#" + r[0] + g[0] + b[0];
			else
				return "#" + r + g + b;
		}
	}

	[Symbol.iterator]()
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
	}

	[symbols.getattr](attrname)
	{
		let self = this;
		switch (attrname)
		{
			case "r":
				let r = function r(){ return self._r; };
				expose(r, []);
				return r;
			case "g":
				let g = function g(){ return self._g; };
				expose(g, []);
				return g;
			case "b":
				let b = function b(){ return self._b; };
				expose(b, []);
				return b;
			case "a":
				let a = function a(){ return self._a; };
				expose(a, []);
				return a;
			case "hue":
				return expose(this.hue.bind(this), []);
			case "light":
				return expose(this.light.bind(this), []);
			case "sat":
				return expose(this.sat.bind(this), []);
			case "lum":
				return expose(this.lum.bind(this), []);
			case "hls":
				return expose(this.hls.bind(this), []);
			case "hlsa":
				return expose(this.hlsa.bind(this), []);
			case "hsv":
				return expose(this.hsv.bind(this), []);
			case "hsva":
				return expose(this.hsva.bind(this), []);
			case "withhue":
				return expose(this.withhue.bind(this), ["hue", "pk"]);
			case "witha":
				return expose(this.witha.bind(this), ["a", "pk"]);
			case "withlight":
				return expose(this.withlight.bind(this), ["light", "pk"]);
			case "abslight":
				return expose(this.abslight.bind(this), ["f", "pk"]);
			case "rellight":
				return expose(this.rellight.bind(this), ["f", "pk"]);
			case "withsat":
				return expose(this.withsat.bind(this), ["sat", "pk"]);
			case "withlum":
				return expose(this.withlum.bind(this), ["lum", "pk"]);
			case "abslum":
				return expose(this.abslum.bind(this), ["f", "pk"]);
			case "rellum":
				return expose(this.rellum.bind(this), ["f", "pk"]);
			case "invert":
				return expose(this.invert.bind(this), ["f", "pk=", 1.0]);
			case "combine":
				return expose(this.combine.bind(this), ["r", "pk=", null, "g", "pk=", null, "b", "pk=", null, "a", "pk=", null]);
			default:
				throw new AttributeError(this, attrname);
		}
	}

	[symbols.getitem](key)
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
				throw new IndexError(this, orgkey);
		}
	}

	[symbols.eq](other)
	{
		if (other instanceof Color)
			return this._r == other._r && this._g == other._g && this._b == other._b && this._a == other._a;
		return false;
	}

	r()
	{
			return this._r;
	}

	g()
	{
		return this._g;
	}

	b()
	{
		return this._b;
	}

	a()
	{
		return this._a;
	}

	hue()
	{
		return this.hls()[0];
	}

	light()
	{
		return this.hls()[1];
	}

	sat()
	{
		return this.hls()[2];
	}

	lum()
	{
		return (0.2126 * this._r + 0.7152 * this._g + 0.0722 * this._b)/255;
	}

	hls()
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

	hlsa()
	{
		let hls = this.hls();
		return hls.concat(this._a/255.0);
	}

	hsv()
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

	hsva()
	{
		let hsv = this.hsv();
		return hsv.concat(this._a/255.0);
	}

	withhue(hue)
	{
		if (typeof(hue) !== "number")
			throw new TypeError("withhue() requires a number");
		let hlsa = this.hlsa();
		return _hls(hue, hlsa[1], hlsa[2], hlsa[3]);
	}

	witha(a)
	{
		if (typeof(a) !== "number")
			throw new TypeError("witha() requires a number");
		return new Color(this._r, this._g, this._b, a);
	}

	_interpolate(lower, upper, factor)
	{
		return factor*upper + (1-factor) * lower
	}

	withlight(light)
	{
		if (typeof(light) !== "number")
			throw new TypeError("withlight() requires a number");
		let hlsa = this.hlsa();
		return _hls(hlsa[0], light, hlsa[2], hlsa[3]);
	}

	abslight(f)
	{
		if (typeof(f) !== "number")
			throw new TypeError("abslight() requires a number");
		let hlsa = this.hlsa();
		return _hls(hlsa[0], hlsa[1] + f, hlsa[2], hlsa[3]);
	}

	rellight(f)
	{
		if (typeof(f) !== "number")
			throw new TypeError("rellum() requires a number");
		let hlsa = this.hlsa();
		let light = hlsa[1];
		if (f > 0)
			light += (1-light)*f;
		else if (f < 0)
			light += light*f;
		return _hls(hlsa[0], light, hlsa[2], hlsa[3]);
	}

	withsat(sat)
	{
		if (typeof(sat) !== "number")
			throw new TypeError("withsat() requires a number");
		let hlsa = this.hlsa();
		return _hls(hlsa[0], hlsa[1], sat, hlsa[3]);
	}

	withlum(lum)
	{
		if (typeof(lum) !== "number")
			throw new TypeError("withlum() requires a number");

		let lum_old = this.lum();
		if (lum_old == 0.0 || lum_old == 1.0)
		{
			let v = lum*255;
			return new Color(v, v, v, this._a);
		}
		else if (lum > lum_old)
		{
			let f = (lum-lum_old)/(1-lum_old);
			return new Color(
				this._interpolate(this._r, 255, f),
				this._interpolate(this._g, 255, f),
				this._interpolate(this._b, 255, f),
				this._a,
			);
		}
		else if (lum < lum_old)
		{
			let f = lum/lum_old;
			return new Color(
				this._interpolate(0, this._r, f),
				this._interpolate(0, this._g, f),
				this._interpolate(0, this._b, f),
				this._a,
			)
		}
		else
			return this;
	}

	abslum(f)
	{
		if (typeof(f) !== "number")
			throw new TypeError("abslum() requires a number");
		return this.withlum(this.lum() + f);
	}

	rellum(f)
	{
		if (typeof(f) !== "number")
			throw new TypeError("rellum() requires a number");
		let lum = this.lum();
		if (f > 0)
			lum += (1-lum)*f;
		else if (f < 0)
			lum += lum*f;
		return this.withlum(lum);
	}

	invert(f=1.0)
	{
		if (typeof(f) !== "number")
			throw new TypeError("invert() requires a number");
		let invf = 1 - f;
		return new Color(
			invf * this._r + f * (255 - this._r),
			invf * this._g + f * (255 - this._g),
			invf * this._b + f * (255 - this._b),
			this._a
		);
	}

	combine(r=null, g=null, b=null, a=null)
	{
		return new Color(
			r != null ? r : this._r,
			g != null ? g : this._g,
			b != null ? b : this._b,
			a != null ? a : this._a
		);
	}

	ul4type()
	{
		return "color";
	}

	static maroon = new Color(0x80, 0x00, 0x00);
	static red = new Color(0xff, 0x00, 0x00);
	static orange = new Color(0xff, 0xa5, 0x00);
	static yellow = new Color(0xff, 0xff, 0x00);
	static olive = new Color(0x80, 0x80, 0x00);
	static purple = new Color(0x80, 0x00, 0x80);
	static fuchsia = new Color(0xff, 0x00, 0xff);
	static white = new Color(0xff, 0xff, 0xff);
	static lime = new Color(0x00, 0xff, 0x00);
	static green = new Color(0x00, 0x80, 0x00);
	static navy = new Color(0x00, 0x00, 0x80);
	static blue = new Color(0x00, 0x00, 0xff);
	static aqua = new Color(0x00, 0xff, 0xff);
	static teal = new Color(0x00, 0x80, 0x80);
	static black = new Color(0x00, 0x00, 0x00);
	static silver = new Color(0xc0, 0xc0, 0xc0);
	static gray = new Color(0x80, 0x80, 0x80);
	// Aliases
	static magenta = Color.purple;
	static cyan = Color.aqua;

	static cssColors = {
		"maroon": Color.maroon,
		"red": Color.red,
		"orange": Color.orange,
		"yellow": Color.yellow,
		"olive": Color.olive,
		"purple": Color.purple,
		"fuchsia": Color.fuchsia,
		"white": Color.white,
		"lime": Color.lime,
		"green": Color.green,
		"navy": Color.navy,
		"blue": Color.blue,
		"aqua": Color.aqua,
		"teal": Color.teal,
		"black": Color.black,
		"silver": Color.silver,
		"gray": Color.gray,
		"magenta": Color.magenta,
		"cyan": Color.cyan
	};
};

expose(Color.prototype.r, []);
expose(Color.prototype.g, []);
expose(Color.prototype.b, []);
expose(Color.prototype.a, []);
expose(Color.prototype.hue, []);
expose(Color.prototype.lum, []);
expose(Color.prototype.sat, []);
expose(Color.prototype.hls, []);
expose(Color.prototype.hlsa, []);
expose(Color.prototype.hsv, []);
expose(Color.prototype.hsva, []);
expose(Color.prototype.withhue, ["hue", "pk"]);
expose(Color.prototype.withlight, ["light", "pk"]);
expose(Color.prototype.abslight, ["f", "pk"]);
expose(Color.prototype.rellight, ["f", "pk"]);
expose(Color.prototype.withsat, ["sat", "pk"]);
expose(Color.prototype.witha, ["a", "pk"]);
expose(Color.prototype.withlum, ["lum", "pk"]);
expose(Color.prototype.abslum, ["f", "pk"]);
expose(Color.prototype.rellum, ["f", "pk"]);
expose(Color.prototype.invert, ["f", "pk=", 1.0]);
expose(Color.prototype.combine, ["r", "pk=", null, "g", "pk=", null, "b", "pk=", null, "a", "pk=", null]);


export class Date_ extends Proto
{
	constructor(year, month, day)
	{
		super();
		this._date = new Date(year, month-1, day);
	}

	[symbols.type]()
	{
		return datetype;
	}

	[symbols.repr]()
	{
		return '@(' + this[symbols.str]() + ")";
	}

	[symbols.str]()
	{
		return _lpad(this._date.getFullYear(), "0", 4) + "-" + _lpad(this._date.getMonth()+1, "0", 2) + "-" + _lpad(this._date.getDate(), "0", 2);
	}

	[symbols.eq](other)
	{
		if (other instanceof Date_)
			return this._date.getTime() === other._date.getTime();
		return false;
	}

	[symbols.lt](other)
	{
		if (other instanceof Date_)
			return this._date < other._date;
		_unorderable("<", this, other);
	}

	[symbols.le](other)
	{
		if (other instanceof Date_)
			return this._date <= other._date;
		_unorderable("<=", this, other);
	}

	[symbols.gt](other)
	{
		if (other instanceof Date_)
			return this._date > other._date;
		_unorderable(">", this, other);
	}

	[symbols.ge](other)
	{
		if (other instanceof Date_)
			return this._date >= other._date;
		_unorderable(">=", this, other);
	}

	year()
	{
		return this._date.getFullYear();
	}

	month()
	{
		return this._date.getMonth()+1;
	}

	day()
	{
		return this._date.getDate();
	}

	ul4type()
	{
		return "date";
	}
};


export class TimeDeltaType extends Type
{
	[symbols.call](days=0, seconds=0, microseconds=0)
	{
		return new TimeDelta(days, seconds, microseconds);
	}

	instancecheck(obj)
	{
		return obj instanceof TimeDelta;
	}
}

expose(TimeDeltaType.prototype, ["days", "pk=", 0, "seconds", "pk=", 0, "microseconds", "pk=", 0], {name: "timedelta"});

export let timedeltatype = new TimeDeltaType(null, "timedelta", "A time span (days/seconds/microseconds).");

export class TimeDelta extends Proto
{
	constructor(days=0, seconds=0, microseconds=0)
	{
		super();
		let total_microseconds = Math.floor((days * 86400 + seconds)*1000000 + microseconds);

		microseconds = ModAST.prototype._do(total_microseconds, 1000000);
		let total_seconds = Math.floor(total_microseconds / 1000000);
		seconds = ModAST.prototype._do(total_seconds, 86400);
		days = Math.floor(total_seconds / 86400);
		if (seconds < 0)
		{
			seconds += 86400;
			--days;
		}

		this._microseconds = microseconds;
		this._seconds = seconds;
		this._days = days;
	}

	[symbols.type]()
	{
		return timedeltatype;
	}

	total_seconds()
	{
		return this._days * 24 * 60 * 60 + this._seconds;
	}

	[symbols.repr]()
	{
		let v = [], first = true;
		v.push("timedelta(");
		if (this._days)
		{
			v.push("days=" + this._days);
			first = false;
		}
		if (this._seconds)
		{
			if (!first)
				v.push(", ");
			v.push("seconds=" + this._seconds);
			first = false;
		}
		if (this._microseconds)
		{
			if (!first)
				v.push(", ");
			v.push("microseconds=" + this._microseconds);
		}
		v.push(")");
		return v.join("");
	}

	[symbols.str]()
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

		v.push(
			"" + hours,
			":",
			_lpad(minutes.toString(), "0", 2),
			":",
			_lpad(seconds.toString(), "0", 2)
		);
		if (this._microseconds)
			v.push(".", _lpad(this._microseconds.toString(), "0", 6));
		return v.join("");
	}

	[symbols.bool]()
	{
		return this._days !== 0 || this._seconds !== 0 || this._microseconds !== 0;
	}

	[symbols.abs]()
	{
		return this._days < 0 ? new TimeDelta(-this._days, -this._seconds, -this._microseconds) : this;
	}

	[symbols.eq](other)
	{
		if (other instanceof TimeDelta)
			return (this._days === other._days) && (this._seconds === other._seconds) && (this._microseconds === other._microseconds);
		return false;
	}

	[symbols.lt](other)
	{
		if (other instanceof TimeDelta)
		{
			if (this._days != other._days)
				return this._days < other._days;
			if (this._seconds != other._seconds)
				return this._seconds < other._seconds;
			return this._microseconds < other._microseconds;
		}
		_unorderable("<", this, other);
	}

	[symbols.le](other)
	{
		if (other instanceof TimeDelta)
		{
			if (this._days != other._days)
				return this._days < other._days;
			if (this._seconds != other._seconds)
				return this._seconds < other._seconds;
			return this._microseconds <= other._microseconds;
		}
		_unorderable("<=", this, other);
	}

	[symbols.gt](other)
	{
		if (other instanceof TimeDelta)
		{
			if (this._days != other._days)
				return this._days > other._days;
			if (this._seconds != other._seconds)
				return this._seconds > other._seconds;
			return this._microseconds > other._microseconds;
		}
		_unorderable(">", this, other);
	}

	[symbols.ge](other)
	{
		if (other instanceof TimeDelta)
		{
			if (this._days != other._days)
				return this._days > other._days;
			if (this._seconds != other._seconds)
				return this._seconds > other._seconds;
			return this._microseconds >= other._microseconds;
		}
		_unorderable(">=", this, other);
	}

	[symbols.neg]()
	{
		return new TimeDelta(-this._days, -this._seconds, -this._microseconds);
	}

	_adddate(date, days)
	{
		let year = date._date.getFullYear();
		let month = date._date.getMonth();
		let day = date._date.getDate() + days;
		return new Date(year, month, day);
	}

	_adddatetime(date, days, seconds, microseconds)
	{
		let year = date.getFullYear();
		let month = date.getMonth();
		let day = date.getDate() + days;
		let hour = date.getHours();
		let minute = date.getMinutes();
		let second = date.getSeconds() + seconds;
		let millisecond = date.getMilliseconds() + microseconds/1000;
		return new Date(year, month, day, hour, minute, second, millisecond);
	}

	[symbols.add](other)
	{
		if (other instanceof TimeDelta)
			return new TimeDelta(this._days + other._days, this._seconds + other._seconds, this._microseconds + other._microseconds);
		else if (_isdate(other))
			return this._adddate(other, this._days);
		else if (_isdatetime(other))
			return this._adddatetime(other, this._days, this._seconds, this._microseconds);
		throw new TypeError(_type(this).fullname() + " + " + _type(other).fullname() + " not supported");
	}

	[symbols.radd](other)
	{
		if (_isdate(other))
			return this._adddate(other, this._days);
		else if (_isdatetime(other))
			return this._adddatetime(other, this._days, this._seconds, this._microseconds);
		throw new TypeError(_type(this).fullname() + " + " + _type(other).fullname() + " not supported");
	}

	[symbols.sub](other)
	{
		if (other instanceof TimeDelta)
			return new TimeDelta(this._days - other._days, this._seconds - other._seconds, this._microseconds - other._microseconds);
		throw new TypeError(_type(this).fullname() + " - " + _type(other).fullname() + " not supported");
	}

	[symbols.rsub](other)
	{
		if (_isdate(other))
			return this._adddate(other, -this._days);
		else if (_isdatetime(other))
			return this._adddatetime(other, -this._days, -this._seconds, -this._microseconds);
		throw new TypeError(_type(this).fullname() + " - " + _type(other).fullname() + " not supported");
	}

	[symbols.mul](other)
	{
		if (typeof(other) === "number")
			return new TimeDelta(this._days * other, this._seconds * other, this._microseconds * other);
		throw new TypeError(_type(this).fullname() + " * " + _type(other).fullname() + " not supported");
	}

	[symbols.rmul](other)
	{
		if (typeof(other) === "number")
			return new TimeDelta(this._days * other, this._seconds * other, this._microseconds * other);
		throw new TypeError(_type(this).fullname() + " * " + _type(other).fullname() + " not supported");
	}

	[symbols.truediv](other)
	{
		if (typeof(other) === "number" || typeof(other) === "boolean")
		{
			if (other == 0)
				throw new ZeroDivisionError();
			return new TimeDelta(this._days / other, this._seconds / other, this._microseconds / other);
		}
		else if (other instanceof TimeDelta)
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
			if (otherValue == 0)
				throw new ZeroDivisionError();
			return myValue/otherValue;
		}
		throw new TypeError(_type(this).fullname() + " / " + _type(other).fullname() + " not supported");
	}

	[symbols.floordiv](other)
	{
		if (typeof(other) === "number" || typeof(other) === "boolean")
		{
			if (other == 0)
				throw new ZeroDivisionError();
			if (_isint(other))
			{
				return new TimeDelta(this._days / other, this._seconds / other, this._microseconds / other);
			}
		}
		else if (other instanceof TimeDelta)
		{
			let result = this[symbols.truediv](other);
			return Math.floor(result);
		}
	}

	[symbols.getattr](attrname)
	{
		let self = this;
		switch (attrname)
		{
			case "days":
				let days = function days(){ return self._days; };
				expose(days, []);
				return days;
			case "seconds":
				let seconds = function seconds(){ return self._seconds; };
				expose(seconds, []);
				return seconds;
			case "microseconds":
				let microseconds = function microseconds(){ return self._microseconds; };
				expose(microseconds, []);
				return microseconds;
			default:
				throw new AttributeError(this, attrname);
		}
	}

	days()
	{
		return this._days;
	}

	seconds()
	{
		return this._seconds;
	}

	microseconds()
	{
		return this._microseconds;
	}

	ul4type()
	{
		return "timedelta";
	}
};


export class MonthDeltaType extends Type
{
	// Return a `MonthDelta` object from the arguments passed in
	[symbols.call](months=0)
	{
		return new MonthDelta(months);
	}

	instancecheck(obj)
	{
		return obj instanceof MonthDelta;
	}
}

export let monthdeltatype = new MonthDeltaType(null, "monthdelta", "A time span of a number of months.");

expose(MonthDeltaType.prototype, ["months", "p=", 0], {name: "monthdelta"});

export class MonthDelta extends Proto
{
	static classname = "monthdelta";
	static classdoc = "A time span of a number of months.";

	constructor(months=0)
	{
		super();
		this._months = months;
	}

	[symbols.type]()
	{
		return monthdeltatype;
	}

	[symbols.repr]()
	{
		if (!this._months)
			return "monthdelta()";
		return "monthdelta(" + this._months + ")";
	}

	[symbols.str]()
	{
		if (this._months)
		{
			if (this._months !== -1 && this._months !== 1)
				return this._months + " months";
			return this._months + " month";
		}
		return "0 months";
	}

	toString()
	{
		return this[symbols.str]();
	}

	[symbols.bool]()
	{
		return this._months !== 0;
	}

	[symbols.abs]()
	{
		return this._months < 0 ? new MonthDelta(-this._months) : this;
	}

	[symbols.eq](other)
	{
		if (other instanceof MonthDelta)
			return this._months === other._months;
		return false;
	}

	[symbols.lt](other)
	{
		if (other instanceof MonthDelta)
			return this._months < other._months;
		_unorderable("<", this, other);
	}

	[symbols.le](other)
	{
		if (other instanceof MonthDelta)
			return this._months <= other._months;
		_unorderable("<=", this, other);
	}

	[symbols.gt](other)
	{
		if (other instanceof MonthDelta)
			return this._months > other._months;
		_unorderable(">", this, other);
	}

	[symbols.ge](other)
	{
		if (other instanceof MonthDelta)
			return this._months >= other._months;
		_unorderable(">=", this, other);
	}

	[symbols.neg]()
	{
		return new MonthDelta(-this._months);
	}

	_adddate(date, months)
	{
		let result = this._adddatetime(date._date, months);
		return new Date_(result.getFullYear(), result.getMonth()+1, result.getDate());
	}

	_adddatetime(date, months)
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
			// As the month might be out of bounds, we have to find out what the real target month is
			let targetmonth = new Date(year, month, 1, hour, minute, second, millisecond).getMonth();
			let result = new Date(year, month, day, hour, minute, second, millisecond);
			if (result.getMonth() === targetmonth)
				return result;
			--day;
		}
	}

	[symbols.add](other)
	{
		if (_ismonthdelta(other))
			return new MonthDelta(this._months + other._months);
		else if (_isdate(other))
			return this._adddate(other, this._months);
		else if (_isdatetime(other))
			return this._adddatetime(other, this._months);
		throw new ArgumentError(_type(this).fullname() + " + " + _type(other).fullname() + " not supported");
	}

	[symbols.radd](other)
	{
		if (_isdate(other))
			return this._adddate(other, this._months);
		else if (_isdatetime(other))
			return this._adddatetime(other, this._months);
		throw new ArgumentError(_type(this).fullname() + " + " + _type(other).fullname() + " not supported");
	}

	[symbols.sub](other)
	{
		if (_ismonthdelta(other))
			return new MonthDelta(this._months - other._months);
		throw new ArgumentError(_type(this).fullname() + " - " + _type(other).fullname() + " not supported");
	}

	[symbols.rsub](other)
	{
		if (_isdate(other))
			return this._adddate(other, -this._months);
		else if (_isdatetime(other))
			return this._adddatetime(other, -this._months);
		throw new ArgumentError(_type(this).fullname() + " - " + _type(other).fullname() + " not supported");
	}

	[symbols.mul](other)
	{
		if (typeof(other) === "number" || typeof(other) === "boolean")
			return new MonthDelta(this._months * Math.floor(other));
		throw new ArgumentError(_type(this).fullname() + " * " + _type(other).fullname() + " not supported");
	}

	[symbols.rmul](other)
	{
		if (typeof(other) === "number" || typeof(other) === "boolean")
			return new MonthDelta(this._months * Math.floor(other));
		throw new ArgumentError(_type(this).fullname() + " * " + _type(other).fullname() + " not supported");
	}

	[symbols.truediv](other)
	{
		if (_ismonthdelta(other))
			return this._months / other._months;
		throw new ArgumentError(_type(this).fullname() + " / " + _type(other).fullname() + " not supported");
	}

	[symbols.floordiv](other)
	{
		if (typeof(other) === "number" || typeof(other) === "boolean")
		{
			if (other == 0)
				throw new ZeroDivisionError();
			if (_isint(other))
				return new MonthDelta(Math.floor(this._months / other));
		}
		else if (_ismonthdelta(other))
		{
			if (other._months == 0)
				throw new ZeroDivisionError();
			return Math.floor(this._months / other._months);
		}
		throw new ArgumentError(_type(this).fullname() + " // " + _type(other).fullname() + " not supported");
	}

	[symbols.getattr](attrname)
	{
		let self = this;
		switch (attrname)
		{
			case "months":
				let months = function months(){ return self._months; };
				expose(months, []);
				return months;
			default:
				throw new AttributeError(this, attrname);
		}
	}

	months()
	{
		return this._months;
	}
};


export const _math = new Module(
	"math",
	"Math related functions and constants",
	{
		pi: Math.PI,
		e: Math.E,
		tau: 2 * Math.PI,
		cos: Math.cos,
		sin: Math.sin,
		tan: Math.tan,
		sqrt: Math.sqrt,
		isclose: isclose
	}
);


export const _operator = new Module(
	"operator",
	"Various operators as functions",
	{
		attrgetter: attrgettertype
	}
);


export const _ul4 = new Module(
	"ul4",
	"UL4 - A templating language",
	{
		AST: _maketype(AST),
		TextAST: _maketype(TextAST),
		IndentAST: _maketype(IndentAST),
		LineEndAST: _maketype(LineEndAST),
		CodeAST: _maketype(CodeAST),
		ConstAST: _maketype(ConstAST),
		SeqItemAST: _maketype(SeqItemAST),
		UnpackSeqItemAST: _maketype(UnpackSeqItemAST),
		ListAST: _maketype(ListAST),
		ListComprehensionAST: _maketype(ListComprehensionAST),
		SetAST: _maketype(SetAST),
		SetComprehensionAST: _maketype(SetComprehensionAST),
		DictItemAST: _maketype(DictItemAST),
		UnpackDictItemAST: _maketype(UnpackDictItemAST),
		DictAST: _maketype(DictAST),
		DictComprehensionAST: _maketype(DictComprehensionAST),
		GeneratorExpressionAST: _maketype(GeneratorExpressionAST),
		VarAST: _maketype(VarAST),
		BlockAST: _maketype(BlockAST),
		ConditionalBlocksAST: _maketype(ConditionalBlocksAST),
		IfBlockAST: _maketype(IfBlockAST),
		ElIfBlockAST: _maketype(ElIfBlockAST),
		ElseBlockAST: _maketype(ElseBlockAST),
		ForBlockAST: _maketype(ForBlockAST),
		WhileBlockAST: _maketype(WhileBlockAST),
		BreakAST: _maketype(BreakAST),
		ContinueAST: _maketype(ContinueAST),
		AttrAST: _maketype(AttrAST),
		SliceAST: _maketype(SliceAST),
		UnaryAST: _maketype(UnaryAST),
		NotAST: _maketype(NotAST),
		IfAST: _maketype(IfAST),
		NegAST: _maketype(NegAST),
		BitNotAST: _maketype(BitNotAST),
		PrintAST: _maketype(PrintAST),
		PrintXAST: _maketype(PrintXAST),
		ReturnAST: _maketype(ReturnAST),
		BinaryAST: _maketype(BinaryAST),
		ItemAST: _maketype(ItemAST),
		ShiftLeftAST: _maketype(ShiftLeftAST),
		ShiftRightAST: _maketype(ShiftRightAST),
		BitAndAST: _maketype(BitAndAST),
		BitXOrAST: _maketype(BitXOrAST),
		BitOrAST: _maketype(BitOrAST),
		IsAST: _maketype(IsAST),
		IsNotAST: _maketype(IsNotAST),
		EQAST: _maketype(EQAST),
		NEAST: _maketype(NEAST),
		LTAST: _maketype(LTAST),
		LEAST: _maketype(LEAST),
		GTAST: _maketype(GTAST),
		GEAST: _maketype(GEAST),
		ContainsAST: _maketype(ContainsAST),
		NotContainsAST: _maketype(NotContainsAST),
		AddAST: _maketype(AddAST),
		SubAST: _maketype(SubAST),
		MulAST: _maketype(MulAST),
		FloorDivAST: _maketype(FloorDivAST),
		TrueDivAST: _maketype(TrueDivAST),
		OrAST: _maketype(OrAST),
		AndAST: _maketype(AndAST),
		ModAST: _maketype(ModAST),
		ChangeVarAST: _maketype(ChangeVarAST),
		SetVarAST: _maketype(SetVarAST),
		AddVarAST: _maketype(AddVarAST),
		SubVarAST: _maketype(SubVarAST),
		MulVarAST: _maketype(MulVarAST),
		FloorDivVarAST: _maketype(FloorDivVarAST),
		TrueDivVarAST: _maketype(TrueDivVarAST),
		ModVarAST: _maketype(ModVarAST),
		ShiftLeftVarAST: _maketype(ShiftLeftVarAST),
		ShiftRightVarAST: _maketype(ShiftRightVarAST),
		BitAndVarAST: _maketype(BitAndVarAST),
		BitXOrVarAST: _maketype(BitXOrVarAST),
		BitOrVarAST: _maketype(BitOrVarAST),
		PositionalArgumentAST: _maketype(PositionalArgumentAST),
		KeywordArgumentAST: _maketype(KeywordArgumentAST),
		UnpackListArgumentAST: _maketype(UnpackListArgumentAST),
		UnpackDictArgumentAST: _maketype(UnpackDictArgumentAST),
		CallAST: _maketype(CallAST),
		RenderAST: _maketype(RenderAST),
		RenderXAST: _maketype(RenderXAST),
		RenderOrPrintAST: _maketype(RenderOrPrintAST),
		RenderOrPrintXAST: _maketype(RenderOrPrintXAST),
		RenderXOrPrintAST: _maketype(RenderXOrPrintAST),
		RenderXOrPrintXAST: _maketype(RenderXOrPrintXAST),
		RenderBlockAST: _maketype(RenderBlockAST),
		RenderBlocksAST: _maketype(RenderBlocksAST),
		SignatureAST: _maketype(SignatureAST),
		Template: _maketype(Template),
		TemplateClosure: _maketype(TemplateClosure),
	}
);


export const _ul4on = new Module(
	"ul4on",
	"Object serialization",
	{
		loads: _ul4on_loads,
		dumps: _ul4on_dumps,
		Encoder: encodertype,
		Decoder: decodertype
	}
);


export const _color = new Module(
	"color",
	"Types and functions for handling RGBA colors",
	{
		Color: colortype,
		css: _css,
		mix: _mix
	}
);


export let builtins = {
	repr: _repr,
	ascii: _ascii,
	str: strtype,
	int: inttype,
	float: floattype,
	list: listtype,
	set: settype,
	dict: dicttype,
	bool: booltype,
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
	isset: _isset,
	isdict: _isdict,
	isexception: _isexception,
	isinstance: _isinstance,
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
	date: datetype,
	datetime: datetimetype,
	timedelta: timedeltatype,
	monthdelta: monthdeltatype,
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
	floor: _floor,
	ceil: _ceil,
	md5: _md5,
	scrypt: _scrypt,
	ul4on: _ul4on,
	ul4: _ul4,
	math: _math,
	operator: _operator,
	color: _color
};


const constructors = [
	[TextAST, "text"],
	[IndentAST, "indent"],
	[LineEndAST, "lineend"],
	[ConstAST, "const"],
	[SeqItemAST, "seqitem"],
	[UnpackSeqItemAST, "unpackseqitem"],
	[DictItemAST, "dictitem"],
	[UnpackDictItemAST, "unpackdictitem"],
	[PositionalArgumentAST, "posarg"],
	[KeywordArgumentAST, "keywordarg"],
	[UnpackListArgumentAST, "unpacklistarg"],
	[UnpackDictArgumentAST, "unpackdictarg"],
	[ListAST, "list"],
	[ListComprehensionAST, "listcomp"],
	[DictAST, "dict"],
	[DictComprehensionAST, "dictcomp"],
	[SetAST, "set"],
	[SetComprehensionAST, "setcomp"],
	[GeneratorExpressionAST, "genexpr"],
	[VarAST, "var"],
	[NotAST, "not"],
	[NegAST, "neg"],
	[BitNotAST, "bitnot"],
	[IfAST, "if"],
	[ReturnAST, "return"],
	[PrintAST, "print"],
	[PrintXAST, "printx"],
	[ItemAST, "item"],
	[IsAST, "is"],
	[IsNotAST, "isnot"],
	[EQAST, "eq"],
	[NEAST, "ne"],
	[LTAST, "lt"],
	[LEAST, "le"],
	[GTAST, "gt"],
	[GEAST, "ge"],
	[NotContainsAST, "notcontains"],
	[ContainsAST, "contains"],
	[AddAST, "add"],
	[SubAST, "sub"],
	[MulAST, "mul"],
	[FloorDivAST, "floordiv"],
	[TrueDivAST, "truediv"],
	[ModAST, "mod"],
	[ShiftLeftAST, "shiftleft"],
	[ShiftRightAST, "shiftright"],
	[BitAndAST, "bitand"],
	[BitXOrAST, "bitxor"],
	[BitOrAST, "bitor"],
	[AndAST, "and"],
	[OrAST, "or"],
	[SliceAST, "slice"],
	[AttrAST, "attr"],
	[CallAST, "call"],
	[RenderAST, "render"],
	[RenderXAST, "renderx"],
	[RenderOrPrintAST, "render_or_print"],
	[RenderOrPrintXAST, "render_or_printx"],
	[RenderXOrPrintAST, "renderx_or_print"],
	[RenderXOrPrintXAST, "renderx_or_printx"],
	[RenderBlockAST, "renderblock"],
	[RenderBlocksAST, "renderblocks"],
	[SetVarAST, "setvar"],
	[AddVarAST, "addvar"],
	[SubVarAST, "subvar"],
	[MulVarAST, "mulvar"],
	[TrueDivVarAST, "truedivvar"],
	[FloorDivVarAST, "floordivvar"],
	[ModVarAST, "modvar"],
	[ShiftLeftVarAST, "shiftleftvar"],
	[ShiftRightVarAST, "shiftrightvar"],
	[BitAndVarAST, "bitandvar"],
	[BitXOrVarAST, "bitxorvar"],
	[BitOrVarAST, "bitorvar"],
	[ForBlockAST, "forblock"],
	[WhileBlockAST, "whileblock"],
	[BreakAST, "break"],
	[ContinueAST, "continue"],
	[ConditionalBlocksAST, "condblock"],
	[IfBlockAST, "ifblock"],
	[ElIfBlockAST, "elifblock"],
	[ElseBlockAST, "elseblock"],
	[SignatureAST, "signature"],
	[Template, "template"],
];

for (let [constructor, name] of constructors)
{
	constructor.prototype.type = name;
	register("de.livinglogic.ul4." + name, constructor);
}

// Report an exception `exc` originating from an UL4 on the browser console.
export function report_exc(exc)
{
	let original_exc = exc;
	if (console && console.error)
	{
		let errors = [];
		for (;;)
		{
			errors.unshift(exc);
			if (exc.context !== undefined && exc.context !== null)
				exc = exc.context;
			else
				break;
		}

		let texts = [];
		let args = [];

		function text(s)
		{
			texts.push(s);
		}

		function css(text, style)
		{
			texts.push("%c", text, "%c");
			args.push(style, "");
		}

		function em(s)
		{
			css(s, "font-weight: bold");
		}

		function focus(s)
		{
			css(s, "border-bottom: 2px solid #b22");
		}

		for (let exc of errors)
		{
			if (texts.length)
				text("\n\n");

			if (exc instanceof ul4.LocationError)
			{
				let template = exc.location.template;
				if (template.parenttemplate !== null)
					text("in local template ");
				else
					text("in template ");
				let first = true;
				while (template != null)
				{
					if (first)
						first = false;
					else
						text(" in ");
					em(template.name ? _repr(template.name) : "(unnamed)");
					template = template.parenttemplate;
				}
				text(" offset ");
				em(exc.location.pos.start + "");
				text(":");
				em(exc.location.pos.stop + "");
				text("; line ");
				em(exc.location.startline + "");
				text("; column ");
				em(exc.location.startcol + "");
				text("\n");
				text(exc.location.startsourceprefix);
				focus(exc.location.startsource);
				text(exc.location.startsourcesuffix);
			}
			else
			{
				em(exc.constructor.name);
				text(": ");
				text(exc.message);
			}
		}
		console.error(texts.join(""), ...args);
	}
};