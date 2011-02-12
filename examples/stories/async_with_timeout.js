var events = require('events');
new Feature('A feature that will timeout', function () {
    var emitter;
    Given('A promise that never emits a success', function () {
        emitter = new events.EventEmitter();
    })
    Then('This step should timeout after the given delay', function () {
        await(1).pass.withTimeout(500);
    })
    And('This step should not run any earlier', function () {
    })
})

