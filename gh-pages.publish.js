var ghpages = require('gh-pages');

ghpages.publish('dist/demo', function (err) {
  if (err) {
    console.log('Failed to publish');
  }
});
