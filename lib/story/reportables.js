var error = require('./reportables/reportable_error');
for (var i in error) {
	module.exports[i] = error[i];
}

var reportable = require('./reportables/reportable_string');
for (var i in reportable) {
	module.exports[i] = reportable[i];
}
