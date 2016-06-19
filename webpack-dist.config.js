'use strict';

let DefinePlugin = require('webpack').DefinePlugin;
const merge = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(webpackCommon, {
    entry: {
        'index': './lib/index.js'
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
        new CopyPlugin([
            {
                from: './lib/query-builder.scss',
            }
        ]),
        new DefinePlugin({
            DEV: false
        })
    ]
});