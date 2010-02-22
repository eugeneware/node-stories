var ERROR_INDENT = '    ';
var ReportableError = exports.ReportableError = function (error) {
    this.error = error;
};

ReportableError.prototype = {
    toReport: function () {
        return ERROR_INDENT + (this.error.message || this.error);
    }
};

