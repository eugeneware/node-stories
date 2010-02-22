var ReportableString = exports.ReportableString = function (string) {
    this.string = string;
};

ReportableString.prototype = {
    toReport: function () {
        return this.string;
    }
};
