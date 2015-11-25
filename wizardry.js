var ramda = require('./lib/ramda');
var bootstrap = require('./lib/bootstrap.js');
var core = require('./lib/core.js');
var enonic = require('./lib/enonic.js');
var html = require('./lib/html.js');

exports.pipe = ramda.pipe;
exports.core = core;
exports.bootstrap = bootstrap;
exports.html = html;
exports.enonic = enonic;

exports.tag = html.tag;
exports.asHtml = core.asHtml;