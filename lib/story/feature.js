var sys              = require('sys');
var Step             = require('./step').Step;
var StepQueue        = require('./step_queue').StepQueue;
var Reporter         = require('./reporter').Reporter;
var ReportableString = require('./reportables/reportable_string').ReportableString;
var ReportableError  = require('./reportables/reportable_error').ReportableError;

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
    try { with (steps) { with (asyncHelpers) { eval(contents) } } }
    catch (e) { sys.puts('Error eval()ing Feature contents.'); sys.puts(e); process.exit() }

    // Run the queue on the next tick, so we return from the constructor first.
    process.nextTick(function () {
        queue.next();
    });
};

// This is totally superficial and just for aesthetic reasons.
process.addListener('exit', function () { sys.puts('') });

