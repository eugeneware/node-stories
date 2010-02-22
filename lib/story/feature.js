var sys   = require('sys');
var Step  = require('./step').Step;

function logError(e) {
    sys.puts('    ' + (e.message || e));
}

//
// Every Step object created by the step definitions in the Feature
// block will be enqueued in this queue.
//
// When the Feature constructor evaluated the fn block, it will run
// the queue by calling queue.next(), which will recursively shift
// and call enqueued items.
//
function StepQueue() {
    this.q         = [];
    // Expected passed/failed statements before processing the next
    // item in the queue.
    this._expected = 0;
    // The currently processed step.
    this.current   = null;
}

StepQueue.prototype = {
    get expected() { return this._expected },
    set expected(value) {
        // If this is the last expected pass or fail, display the steps'
        // output
        if (value === 0) this.current.log();
        this._expected = value;
    },
    // Adds an item to the queue.
    add: function (item) { this.q.push(item) },
    // Runs the next job, unless we expect passes.
    next: function () {
        if (this.expected === 0 && this.q.length !== 0) {
            this.current = this.q.shift();
            try {
                this.current.fn.call();
                // If we expect more passes to be emitted, don't display
                // the current steps' output.
                if (!this.expected) this.current.log();
            } catch (e) {
                this.current.passed = false;
                this.current.log();
                logError(e);
            }
            return this.next();
        }
        return this;
    }
};

exports.Feature = function (feature, fn) {
    sys.puts('\nFeature: ' + feature + '\n');

    var queue = new StepQueue();

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
        awaited: 0,
        await: function (awaited) {
            this.awaited = awaited;
            return this;
        },
        get passes() {
            queue.expected = this.awaited;
            this.awaited   = 0;
            return this;
        },
        get pass() { return this.passes },
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
                logError(arguments.callee.caller.arguments[0] || 'Unknown error.');
                queue.next();
            }
            return this;
        },
        withTimeout: function (timeout) {
            if (queue.expected && queue.current) {
                setTimeout(function () {
                    queue.current.passed = false;
                    queue.expected       = 0;
                    logError('Step timed-out after ' + timeout + ' ms.');
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
    try { with (steps) { with (asyncHelpers) { eval(contents) } } }
    catch (e) { sys.puts(e); process.exit() }

    // Run the queue.
    queue.next();
};

// This is totally superficial and just for aesthetic reasons.
process.addListener('exit', function () { sys.puts('') });

