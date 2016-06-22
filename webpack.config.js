'use strict';

module.exports = env=> {
    return [
        require('./config/webpack-dev.config'),
        require('./config/webpack-prod.config')
    ];
};