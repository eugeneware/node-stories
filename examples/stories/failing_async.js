events = require('events');

new Feature('A failing, async feature', function () {
    var emitter;
    Given('An event emitter', function () {
        emitter = new events.EventEmitter()
    })
    And('A timed, emitted error', function () {
        setTimeout(function () { emitter.emit('error', 'Some error description'); }, 500);
    })
    Then('This block should wait until the timer has finished and be marked as failed', function () {
        await(1).pass
        emitter.addListener('error', function (e) { failed })
    })
    And('This block should not run any earlier', function () {})
})

