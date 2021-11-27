// eslint-disable-next-line @typescript-eslint/no-var-requires
var ghpages = require('gh-pages');

ghpages.publish('packages/demo/dist', function (err) {
  if (err) {
    console.log('Failed to publish');
  }
});
