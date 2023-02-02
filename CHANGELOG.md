# Changes

## Changes in HEAD

Add support for the `e` and `f` formats for floating point numbers in `format()`.

## Changes in 1.14.0 (2022-08-04)

`TextAST` objects now store their text directly.

Template source code offsets are now stored as two integer values instead
of as a `Slice` objects.


## Changes in 1.13.1 (2022-07-08)

Fixed calling `Type.getattr()` and `Type.hasattr()` with `null`.


## Changes in 1.13.0 (2022-06-13)

Removed the attribute `__id__` for all instances of `ul4.Proto`, since a `Map`
can now be used for mapping objects to their backref index in UL4ON dumps.

Added a `repr` method to `ul4.Module`.

Detect "classes" in `repr` so that they don't get output as `<function foo>`.


## Changes in 1.12.1 (2022-03-16)

Use `Symbol.for()` to reuse symbols defined by another version of UL4.


## Changes in 1.12.0 (2022-03-10)

Added new classes `RenderOrPrintAST`, `RenderOrPrintXAST`,
`RenderXOrPrintAST`, `RenderXOrPrintXAST`.


## Changes in 1.11.1 (2022-02-11)

Fixed a bug for item access in objects.


## Changes in 1.11.0 (2021-11-17)

Updated logic for exporting the version number for Webpack compatibility.

Removed all `Protocol` classes and their use.

Implement the UL4 method `dict.keys()`.

Add color methods `withhue()` and `withsat()`.


## Changes in 1.10.3 (2021-11-03)

Passing `null` to `Type.getattr()` or `Type.hasattr()` now raises the correct
exception.


## Changes in 1.10.2 (2021-07-22)

Fixed handling of calls to undefined functions or templates. Now a call to an
undefined function will be properly terminated with an exception:

```
TypeError: <undefined> is not callable by UL4
```

## Changes in 1.10.1 (2021-07-21)

Fixed construction of UL4 stacktraces: Now the stacktrace will only consist of
the initial exception, a `LocationError` for the originating `AST` and
additional `LocationError` for each template call. Previously each AST node
added a stack frame.


## Changes in 1.10 (2021-06-15)

UL4 now supports positional-only arguments. Thy following functions use that
now:

	*	`first(iterable, /, default=None)`,
	*	`last(iterable, /, default=None)`,
	*	`isfirst(iterable, /)`,
	*	`islast(iterable, /)`,
	*	`isfirstlast(iterable, /)`,
	*	`enumfl(iterable, /)`,
	*	`monthdelta(months=0, /)`,
	*	`ul4on.dumps(obj, /, indent)`,
	*	`ul4on.loads(dump, /, registry=None)`,

`type()` now returns type objects instead of a simple string. Type objects can
be used for type testing via the new `isinstance()` function. Some type objects
can be called to create new instances of those types.

The following functions are now callable type objects instead: `bool`, `int`,
`float`, `str`, `date`, `datetime`, `timedelta`, `monthdelta`, `list`, `set`,
`dict` and `color`.

The following modules have been added to the builtin UL4 objects:

* `ul4` contains all UL4 AST classes;
* `ul4on` contains the functions `dumps()` and `loads()` and the types
  `Encoder` and `Decoder`;
* `operator` contains the type `attrgetter` and
* `math` contains the constants `e`, `pi` and `tau` as well as the functions
  `cos()`, `sin()`, `tan()`, `sqrt()` and `isclose()`.
* `color` contains the type `Color` and the functions `css` and `mix`.

Tag delimiters can now no longer be customized. They are always `<?` and `?>`.

The color method `abslum()` has been renamed to `abslight()` and `rellum()` has
been renamed to `rellight()`.

The following methods have been added to `color.Color`: `hue()`, `light()`,
`sat()`, `withhue()`, `withsat()`, `withlum()`, `ablum()`, `rellum()`,
`invert()` and `combine()`.

Always assume that the Javascript types `Map` and `Set` exist.

Use symbols for implementing UL4 poeation in classes.


## Changes in 1.9.1 (2021-01-15)

Fixed the implementation of various division operations.


## Changes in 1.9.0 (2021-01-13)

Added support for persistent objects to UL4ON.


## Changes in 1.8.0 (2020-05-05)

Undefined operands are now rejected in arithmetic operations (i.e. add,
subtract, multiply, true and floor division, and modulo).


## Changes in 1.7.0 (2020-05-05)

Added a function `report_exc` that can be used to report an exception
originating from an UL4 template on the browser console.


## Changes in 1.6.0 (2020-04-24)

The `Template` methods `renders` and `call` now have default values for the
parameters and global variables, so they can be called without any global
variables by passing only the parameter object or without parameters and global
variables by passing no arguments.


## Changes in 1.5.0 (2020-04-14)

Implement the "module" `ul4on` with the attributes `loads`, `dumps`, `Encoder`
and `Decoder`. `Encoder` and `Decoder` can be use to encode/decode an UL4ON
dump in multiple steps.


## Changes in 1.4.1 (2020-04-06)

Update dependencies.


## Changes in 1.4.0 (2019-12-12)

The source code now uses the constant `undefined` for type checks instead of
`typeof(foo) === "undefined"`.

Added support for global variables in the methods `render`, `renders` and
`call`.


## Changes in 1.3.0 (2019-11-11)

Added dictionary method `pop()`.

The function `scrypt` can't be implemented in Javascript, so a version that
throws a `NotImplementedError` exception has been added.


## Changes in 1.2.1 (2019-06-25)

Protect against renamed classes when the code gets reminified by a minifier that
changes classes names (which breaks the UL4ON type names in the UL4ON registry).


## Changes in 1.2.0 (2019-06-24)

Added attributes to UL4 AST nodes: `startpos`, `startsource`,
`startsourceprefix` and `startsourcesuffix`. Renamed `line` to `startline` and
`col` to `startcol`.

Added attributes to block AST nodes: `stoppos`, `stopline`, `stopcol`,
`stopsource`, `stopsourceprefix` and `stopsourcesuffix`.


## Changes in 1.1.1 (2020-04-06)

Update dependencies.


## Changes in 1.1.0 (2019-05-13)

The UMD version is the default version now (i.e. in `package.json/main`).


## Changes in 1.0.0 (2019-05-13)

The UL4 source is a Javascript module now. However the default babeled version
in `dist/umd/ul4.js` still uses UMD to support Node and the browser. For the
module version use `dist/esm/ul4.js`.

Building is now done with `rollup` and the md5 module is bundled directly into
UL4.


## Changes in 0.46.12 (2019-04-24)

Fixed the variable `_js_Date` (which should be a local variable).
