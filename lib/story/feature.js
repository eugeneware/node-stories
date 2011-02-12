var util              = require('util');
var Step             = require('./step').Step;
var StepQueue        = require('./step_queue').StepQueue;
var Reporter         = require('./reporter').Reporter;
var Reportables      = require('./reportables');

exports.Feature = function (feature, fn) {
    var reporter = new Reporter();
    var queue = new StepQueue(reporter);
    reporter.add(new Reportables.ReportableString('\nFeature: ' + feature + '\n'));

    //
    // Async DSL:
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
                reporter.add(new Reportables.ReportableError(arguments.callee.caller.arguments[0] || 'Unknown error.'));
                queue.next();
            }
            return this;
        },
        withTimeout: function (timeout) {
            if (queue.expected && queue.current) {
                setTimeout(function () {
                    queue.current.passed = false;
                    queue.expected       = 0;
                    reporter.add(new Reportables.ReportableError('Step timed-out after ' + timeout + ' ms.'));
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
    var steps = {};
    ['Given', 'When', 'Then', 'And', 'But'].forEach(function (step) {
        steps[step] = function (description, fn) {
            queue.add(new Step(step, description, fn));
        };
    });

    // Evaluate the Feature block.
    try { with (steps) { with (asyncHelpers) { eval(contents) } } }
    catch (e) { util.puts('Error eval()ing Feature contents.'); util.puts(e); process.exit() }

    // Run the queue on the next tick, so we return from the constructor first.
    process.nextTick(function () {
        queue.next();
    });
};

// This is totally superficial and just for aesthetic reasons.
process.addListener('exit', function () { util.puts('') });

