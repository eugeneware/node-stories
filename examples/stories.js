var story = require('../lib/story');
for (var i in story) {
	global[i] = story[i];
}

require('./stories/passing');
require('./stories/failing');
require('./stories/async_with_timeout');
require('./stories/passing_async');
require('./stories/failing_async');
