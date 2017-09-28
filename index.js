var h = require('virtual-dom/h');
var parse = require('./parse');

module.exports = parse.bind(this, h);
