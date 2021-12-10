# UL4

UL4 is a cross-platform templating language.


# UL4ON

UL4ON is a lightweight machine-readable text-based cross-platform object
serialization format.


# Implementations

Apart from this Javascript implementation there are implementations of UL4
and UL4ON for [Python](https://github.com/LivingLogic/LivingLogic.Python.xist),
and [Java](https://github.com/LivingLogic/LivingLogic.Java.ul4).


# Documentation

The Python documentation contains more info on
[UL4](http://python.livinglogic.de/UL4.html) and
[UL4ON](http://python.livinglogic.de/UL4ON.html).


# Build instructions

Install the npm packages:

```bash
npm install
```

Build `dist/umd/ul4.js` and `dist/esm/ul4.js`:

```bash
npm run build
```


# Using UL4 in your project

In your HTML include the following:

```html
<script src="{path}/dist/umd/ul4.js"></script>
```

now you can use the Javascript variable `ul4`.

Or if you want to use UL4 as a module do

```html
<script type="module">
	import * as ul4 from '{path}/dist/esm/ul4.js';

	...
</script>
```

# Authors

* Walter Dörwald
* Thoralf Hänsel
