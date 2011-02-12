var ANSI_ESC            = String.fromCharCode(0x1B);
var ANSI_CSI            = ANSI_ESC + '[';
var ANSI_TEXT_PROP      = 'm';
var ANSI_RESET          = '0';
var ANSI_BOLD           = '1';
var ANSI_FG             = '3';
var ANSI_RED            = '1';
var ANSI_GREEN          = '2';

var Step = exports.Step = function (type, description, fn) {
    this.type        = type;
    this.description = description;
    this.fn          = fn;
    this.passed      = true;
}

Step.prototype = {
    toReport: function () {
        var ansiPrefix  = ANSI_CSI + ANSI_FG,
            ansiSuffix  = ANSI_CSI + ANSI_RESET + ANSI_TEXT_PROP;

        ansiPrefix += this.passed ? ANSI_GREEN : ANSI_RED;
        ansiPrefix += ANSI_TEXT_PROP;

        return ansiPrefix + '  ' + this.type + ' ' + this.description + ansiSuffix;
    }
}
