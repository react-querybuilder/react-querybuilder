'use strict';

const merge = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');

module.exports = merge(webpackCommon, {
    entry: {
        index: './lib/index.js'
    },
    output: {
        filename: '[name].js'
    },

    devtool: 'cheap-module-source-map',
});