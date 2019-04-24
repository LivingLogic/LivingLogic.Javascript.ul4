# UL4

UL4 is a cross-platform templating language.


# UL4ON

UL4ON is a lightweight machine-readable text-based cross-platform object
serialization format.


# Implementations

Apart from this Javascript implementation there are implementations of UL4
and UL4ON for [Python](https://github.com/LivingLogic/LivingLogic.Python.xist),
[Java](https://github.com/LivingLogic/LivingLogic.Java.ul4) and
[PHP](https://github.com/LivingLogic/LivingLogic.PHP.ul4).


# Documentation

The Python documentation contains more info on
[UL4](http://python.livinglogic.de/UL4.html) and
[UL4ON](http://python.livinglogic.de/UL4ON.html).


# Build instructions

Install the npm packages:

```
npm install
```

Build `dist/ul4.js`:

```
npm run build
```


# Using UL4 in your project

In your HTML include the following:

```html
<script src="{path}/node_modules/blueimp-md5/js/md5.min.js"></script>
<script src="{path}/dist/ul4.js"></script>
```

now you can use the Javascript variable `ul4`.


# Changes

## Changes 0.46.12

Fixed the variable `_js_Date` (which should be a local variable).


# Authors

* Walter Dörwald
* Thoralf Hänsel
