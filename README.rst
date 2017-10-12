UL4ON
=====

UL4ON is a lightweight machine-readable text-based cross-platform object
serialization format.


UL4
===

UL4 is a cross-platform templating language.


Implementations
===============

Apart from this Javascript implementation there are implementations of UL4ON
and UL4 for Python_, Java_ and PHP_.

.. _Python: https://github.com/LivingLogic/LivingLogic.Python.xist
.. _Java: https://github.com/LivingLogic/LivingLogic.Java.ul4
.. _PHP: https://github.com/LivingLogic/LivingLogic.PHP.ul4


Documentation
=============

The Python documentation contains more info on UL4_ and on UL4ON_.

.. _UL4: http://python.livinglogic.de/UL4.html
.. _UL4ON: http://python.livinglogic.de/UL4ON.html


Build instructions
==================

Install the npm packages::

	npm install

Build ``ul4.min.js``::

	npm run build


Using UL4 in your project
=========================


Clientside
----------

In your HTML include the following::

	<script src="{path}/node_modules/blueimp-md5/js/md5.min.js"></script>
	<script src="{path}/ul4.min.js"></script>

now you can use the Javascript variables ``ul4`` and ``ul4on``.


AMD
---

In your HTML include::

	<script data-main="./main" src="./require.js"></script>

In your Javascript file do::

	require(['{path}/ul4.min.js'], function (ll) {
		window.ll = ll;
	});

You need your ``node_modules`` folder in the webspace if you want to use the
``md5`` function. In the callback you can use ``ll.ul4`` and ``ll.ul4on``.


NodeJS
------

Install the ``blueimp-md5`` module (which you need, if you want to use the UL4
function ``md5``)::

	npm install --save blueimp-md5

Then you can use the following code in your Javascript files::

	const ul4 = require('{pathTo}/ul4.min').ul4;
	const ul4on = require('{pathTo}/ul4.min').ul4on;


Authors
=======

* Walter Dörwald
* Thoralf Hänsel
