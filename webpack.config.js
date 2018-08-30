'use strict';

module.exports = env => {

    const config = {
        prod: require('./config/webpack-prod.config'), // lib files,

        dev: require('./config/webpack-dev.config')
    };

    return config[env];
};
