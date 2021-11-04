var ghpages = require('gh-pages');

ghpages.publish('dist_demo', function (err) {
  if (err) {
    console.log('Failed to publish');
  }
});
