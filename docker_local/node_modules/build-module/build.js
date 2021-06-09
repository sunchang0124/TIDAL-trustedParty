'use strict';

var build = require('./build-module');
build.bundle({	
	root: './build-module.js',
	output: './build-module.bundle.js',
	bundleOptions: {
		debug: true
	}
});