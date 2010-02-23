var sys              = require('sys');
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
    var steps = {
        Given: function (description, fn) { queue.add(new Step('Given', description, fn)) },
        When:  function (description, fn) { queue.add(new Step('When',  description, fn)) },
        Then:  function (description, fn) { queue.add(new Step('Then',  description, fn)) },
        And:   function (description, fn) { queue.add(new Step('And',   description, fn)) },
        But:   function (description, fn) { queue.add(new Step('But',   description, fn)) }
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

