'use strict';
var version = '0.0.1';
var utils = require('./lib/core');

// extend utils self key
utils.version = version;
utils.extend(require('./lib/string'));
utils.extend(require('./lib/query'));
utils.extend(require('./lib/sync'));

// extend utils self module
utils.extend({
  storage: require('./lib/storage'),
  filter: require('./lib/filter'),
  dom: require('./lib/dom'),
  gps: require('./lib/gps'),
  immutableUtils: require('./lib/immutable'),
  inputFormat: require('./lib/inputFormat'),
  config: require('./lib/config'),
});

// exports
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = utils;
}
