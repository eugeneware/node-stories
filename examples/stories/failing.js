new Feature('A failing story on the example of an Array', function () {
    var assert = require("assert");

    Given('An empty Array', function () {
        a = []
    })
    When('I add some elements', function () {
        a.push(1)
        a.push(2)
        a.push(3)
        a.push(4)
    })
    And('I shift an element off the Array', function () {
        element = a.shift()
    })
    Then('I should get the first element from the Array', function () {
        assert.equal(element, 1);
    })
    And('I should have all elements left in the Array', function () {
        assert.equal(a.length, 4);
    })
})
