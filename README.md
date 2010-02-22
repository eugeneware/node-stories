node-stories
============

Lightweight Given/When/Then blocks with async-support for Node.js.

The basics
----------

Node-stories uses the same kind of metaprogramming most other JavaScript
testing suites are using. A silly example:

    process.mixin(require('./story'));

    new Feature('Using an Array as a queue', function () {
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
        And('I should have the remaining elements left', function () {
            assert.equal(a.length, 3);
        })
    })

Now when you run this:

    node my_feature.js

Then you should see in your terminal:

    Feature: Using an Array as a queue

      Given An empty Array
      When I add some elements
      And I shift an element off the Array
      Then I should get the first element from the Array
      And I should have the remaining elements left

Obviously, this is colorized and always displays the errors together with each
failing step.

Async DSL
---------

Node-story has a human-readable DSL for deferring evaluation of steps
until a step specifying asynchronous behavior has completed or,
optionally, timed-out. Nothing of this pollutes the global namespace and
node-stories uses some fancy accessor trickery to keep things readable:

Define how many `passes` are expected:
* `await(5).passes`
* `await(1).pass`

Optionally you can define a timeout (in milliseconds):
* `await(6).passes.withTimeout(2500)`

Emit a passed test:
* `passed`

Emit a failed test:
* `failed`

Note: `failed` will automatically display the error object passed to the
callback, eg. by `addErrback()`, and display.

Async Features
--------------

Using the async helpers, node-stories will synchronously run your features:

    new Feature('Building and saving a User', function () {
        Given('A user', function () {
            user = User.build()
        })
        When('I add an attribute', function () {
            user.name = 'John'
        })
        And('I save the user', function () {
            promise = user.save()
        })
        Then('It should save the user', function () {
            await(1).pass.withTimeout(2500)

            promise.addCallback(function () { passed })
                   .addErrback(function () { failed })
        })
        And("This step won't run until the previous one completed", function () {
            // Assert something else here.
        })
    })

More examples
-------------

Have a look into the `examples/` directory (which, before you ask, are also used for
testing node-stories).

What about deep nesting?
------------------------

Deep nesting is currently __not__ supported by node-stories. A Feature should
describe one thing in the most concise way possible and deep nesting should not
be neccessary. At least that is my style. However, if you fancy support for
nesting, feel free to fork and send me a pull request.

And what about matchers?
------------------------

Node-stories is matcher independent. You can use Node's built-in `assert`
module or the matchers of your favorite unit-test/spec suite. As long as they
throw errors on failed assertions, just like the `assert` module, everything
(the console output) should be fine.

Contributions
-------------

I wrote this so I can add some simple integration tests to some of the projects
I am currently working on. However, feature requests and contributions are of
course welcome.

License
-------

* The MIT License

Copyright (c) 2009 Tobias Svensson (tobiassvn@googlemail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

