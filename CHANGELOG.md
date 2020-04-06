# Changes

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
