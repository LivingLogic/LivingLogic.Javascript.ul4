# Changes

## Changes in 1.0.0 (2019-05-13)

The UL4 source is a Javascript module now. However the default babeled version
in `dist/umd/ul4.js` still uses UMD to support Node and the browser. For the
module version use `dist/esm/ul4.js`.

Building is now done with `rollup` and the md5 module is bundled directly into
UL4.


## Changes in 0.46.12 (2019-04-24)

Fixed the variable `_js_Date` (which should be a local variable).
