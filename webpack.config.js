'use strict';

module.exports = env=> {
  return [
    require(`./config/webpack-${env}.config`),
  ];
};
