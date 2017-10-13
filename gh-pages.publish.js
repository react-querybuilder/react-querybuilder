var ghpages = require('gh-pages');
var path = require('path');

ghpages.publish('dist/demo', function (err) {
    if (err) {
        console.log('Failed to publish');
    }
});
