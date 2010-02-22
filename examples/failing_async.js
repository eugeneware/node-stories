process.mixin(require('../lib/story'));

new Feature('A failing, async feature', function () {
    Given('A promise', function () {
        promise = new process.Promise()
    })
    And('A timed emitError', function () {
        setTimeout(function () { promise.emitError('The error reason') }, 500)
    })
    Then('This block should wait until the timer has finished and be marked as failed', function () {
        await(1).pass
        promise.addErrback(function (e) { failed })
    })
    And('This block should not run any earlier', function () {})
})

