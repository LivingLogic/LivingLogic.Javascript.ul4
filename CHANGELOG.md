# Changes

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
