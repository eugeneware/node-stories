process.mixin(require('../lib/story'));

new Feature('A passing story on the example of an Array', function () {
    Given('A promise', function () {
        promise = new process.Promise()
    })
    And('A timed emitSuccess', function () {
        setTimeout(function () { promise.emitSuccess() }, 500)
    })
    Then('This step should wait until the timer has finished', function () {
        await(1).pass
        promise.addCallback(function () {
            passed
        })
    })
    And('This step should not run any earlier', function () {
    })
})

