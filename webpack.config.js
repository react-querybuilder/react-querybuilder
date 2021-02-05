'use strict';

module.exports = () => {
  return [
    require('./config/webpack-demo.config'), // For the demo
    require('./config/webpack-prod.config') // lib files
  ];
};
