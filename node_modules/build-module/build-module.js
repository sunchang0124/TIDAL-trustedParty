'use strict';

var browserify = require('browserify');
var fs = require('fs');

var api = {
  bundle: function (options) {
    if (!options) {
      options = {};
    }

    var b = browserify(options.root, options.bundleOptions);

    if (Array.isArray(options.transforms)) {
      options.transforms.forEach(function (t) {
        b.transform({
          sourcemap: options.bundleOptions.debug,
          compress: true,
          mangle: true,
          global: true
        }, t);
      });
    }

    b.bundle().pipe(fs.createWriteStream(options.output));
  }
};


module.exports = {
  bundle: function (options) {
    api.bundle(options);
  }
};