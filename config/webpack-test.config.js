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

    externals: {
        'cheerio': 'window',
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
    },

    devtool: 'cheap-module-source-map',


});