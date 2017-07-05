build:
	# npm install babel-cli --save
	# npm install --save-dev babel-plugin-transform-async-to-generator
	# npm install --save-dev babel-plugin-transform-object-rest-spread
	# npm install --save-dev babel-plugin-syntax-object-rest-spread
	# npm install --save-dev babel-plugin-transform-es2015-spread
	# npm install --save-dev babel-plugin-transform-es2015-parameters
	wget https://raw.githubusercontent.com/blueimp/JavaScript-MD5/v2.3.0/js/md5.js --quiet --output-document=md5.js
	node_modules/babel-cli/bin/babel.js ul4.js md5.js --compact=true --source-maps=true --out-file ul4.min.js
	rm md5.js
