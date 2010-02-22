var sys              = require('sys');
var Step             = require('./step').Step;
var Reporter         = require('./reporter').Reporter;
var ReportableString = require('./reportables/reportable_string').ReportableString;
var ReportableError  = require('./reportables/reportable_error').ReportableError;

//
// Every Step object created by the step definitions in the Feature
// block will be enqueued in this queue.
//
// When the Feature constructor evaluated the fn block, it will run
// the queue by calling queue.next(), which will recursively shift
// and call enqueued items.
//
function StepQueue(reporter) {
    this.q         = [];
    // Expected passed/failed statements before processing the next
    // item in the queue.
    this._expected = 0;
    // The currently processed step.
    this.current   = null;
    this.reporter  = reporter;
}

StepQueue.prototype = {
    get expected() { return this._expected },
    set expected(value) {
        // If this is the last expected pass or fail, display the steps'
        // output
        //if (value === 0) this.current.log();
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
                // If we expect more passes to be emitted, don't display
                // the current steps' output.
                if (!this.expected) this.reporter.add(this.current);
            } catch (e) {
                this.current.passed = false;
                this.reporter.add(this.current);
                this.reporter.add(new ReportableError(e));
            }
            return this.next();
        } else if (this.expected == 0) {
            this.reporter.show();
        }
        return this;
    }
};

exports.Feature = function (feature, fn) {
    var reporter = new Reporter();
    var queue = new StepQueue(reporter);
    reporter.add(new ReportableString('\nFeature: ' + feature + '\n'));

    //
    // Async DSL:
    // ----------
    //
    // Node-story has a human-readable DSL for deferring evaluation of steps
    // until a step specifying asynchronous behavior has completed or,
    // optionally, timed-out.
    //
    // Define how many `passes` are expected:
    // - `await(5).passes`
    // - `await(1).pass`
    //
    // Optionally you can define a timeout (in milliseconds):
    // - `await(6).passes.withTimeout(2500)`
    //
    // Emit a passed test (without invocation parentheses):
    // - `passed`
    //
    // Emit a failed test (without invocation parentheses):
    // - `failed`
    //
    // `failed` will automatically display the error object passed to the
    // callback, eg. by `addErrback()`, and display.
    //

    var asyncHelpers = {
        await: function (awaited) {
            queue.expected = awaited;
            return this;
        },
        get passes() { return this },
        get pass()   { return this },
        get passed() {
            if (queue.expected && queue.current) {
                queue.expected--;
                queue.next();
            }
            return this;
        },
        get failed() {
            if (queue.expected && queue.current) {
                queue.current.passed = false;
                queue.expected--;
                reporter.add(new ReportableError(arguments.callee.caller.arguments[0] || 'Unknown error.'));
                queue.next();
            }
            return this;
        },
        withTimeout: function (timeout) {
            if (queue.expected && queue.current) {
                setTimeout(function () {
                    queue.current.passed = false;
                    queue.expected       = 0;
                    reporter.add(new ReportableError('Step timed-out after ' + timeout + ' ms.'));
                    queue.next();
                }, timeout);
            }
            return this;
        }
    };

    // The contents of the Feature block.
    var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1],
        current, output;

    // Available step definitions.
    var steps = {
        Given: function (description, fn) { queue.add(new Step('Given', description, fn)) },
        When:  function (description, fn) { queue.add(new Step('When',  description, fn)) },
        Then:  function (description, fn) { queue.add(new Step('Then',  description, fn)) },
        And:   function (description, fn) { queue.add(new Step('And',   description, fn)) }
    };

    // Evaluate the Feature block.
    /*try {*/ with (steps) { with (asyncHelpers) { eval(contents) } } //}
    //catch (e) { sys.puts(e); process.exit() }

    // Run the queue on the next tick, so we return from the constructor first.
    process.nextTick(function () {
        queue.next();
    });
};

// This is totally superficial and just for aesthetic reasons.
process.addListener('exit', function () { sys.puts('') });

