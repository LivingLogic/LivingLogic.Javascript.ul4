build:
	# npm install babel-cli --save
	wget https://raw.githubusercontent.com/blueimp/JavaScript-MD5/v2.3.0/js/md5.js --quiet --output-document=md5.js
	node_modules/babel-cli/bin/babel.js ul4.js md5.js --compact=true --source-maps=true --out-file ul4.min.js
	rm md5.js
