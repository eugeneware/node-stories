var util      = require('util');
var Reporter = exports.Reporter = function () {
    this.reports = [];
};

Reporter.prototype = {
    add: function (reportable) {
        this.reports.push(reportable.toReport());
    },
    show: function () {
        util.puts(this.reports.join('\n'));
    }
};
