'use strict';

let DefinePlugin = require('webpack').DefinePlugin;
const merge = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');

module.exports = merge(webpackCommon, {
    entry: {
        'react-query-builder': './lib/index.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
        library: true,
        libraryTarget: 'commonjs2'
    },
    externals: [
        'react',
        'react-dom',
    ],

    devtool: 'source-map',

    plugins: [
        new DefinePlugin({
            DEV: false
        })
    ]
});