new Feature('A passing, async feature', function () {
    var emitter;
    Given('An event emitter', function () {
        emitter = new process.EventEmitter()
    })
    And('A timed emitSuccess', function () {
        setTimeout(function () { emitter.emit('success') }, 1500)
    })
    Then('This step should wait until the timer has finished', function () {
        await(1).pass
        emitter.addListener('success', function () {
            passed
        })
    })
    And('This step should not run any earlier', function () {
    })
})

