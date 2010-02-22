var sys      = require('sys');
var Reporter = exports.Reporter = function () {
    this.reports = [];
};

Reporter.prototype = {
    add: function (reportable) {
        this.reports.push(reportable.toReport());
    },
    show: function () {
        sys.puts(this.reports.join('\n'));
    }
};
