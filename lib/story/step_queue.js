var Reportables     = require('./reportables');
//
// Every Step object created by the step definitions in the Feature
// block will be enqueued in this queue.
//
// When the Feature constructor evaluated the fn block, it will run
// the queue by calling queue.next(), which will recursively shift
// and call enqueued items.
//

var StepQueue = exports.StepQueue = function (reporter) {
    this.q         = [];
    // Expected passed/failed statements before processing the next
    // item in the queue.
    this._expected = 0;
    // The currently processed step.
    this.current   = null;
    // The reporter object to be used.
    this.reporter  = reporter;
}

StepQueue.prototype = {
    get expected() { return this._expected },
    set expected(value) {
        // If this is the last expected pass or fail, report the current step.
        if (value === 0) this.reporter.add(this.current);
        this._expected = value;
    },
    // Adds an item to the queue.
    add: function (item) { this.q.push(item) },
    // Runs the next job, unless we expect passes.
    next: function () {
        if (this.expected === 0 && this.q.length > 0) {
            this.current = this.q.shift();
            try {
                this.current.fn.call();
                // If we expect more passes to be emitted, don't report the
                // current step yet.
                if (!this.expected) this.reporter.add(this.current);
            } catch (e) {
                this.current.passed = false;
                this.reporter.add(this.current);
                this.reporter.add(new Reportables.ReportableError(e));
            }
            return this.next();
        } else if (this.expected == 0) {
            this.reporter.show();
        }
        return this;
    }
};


