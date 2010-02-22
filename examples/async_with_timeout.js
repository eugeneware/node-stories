process.mixin(require('../lib/story'));

new Feature('A feature that will timeout', function () {
    Given('A promise that never emits a success', function () {
        promise = new process.Promise()
    })
    Then('This step should timeout after the given delay', function () {
        await(1).pass.withTimeout(500);
    })
    And('This step should not run any earlier', function () {
    })
})

