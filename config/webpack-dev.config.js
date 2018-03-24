'use strict';

let HtmlPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');
const path = require('path');

module.exports = merge(webpackCommon, {
    entry: {
        demo: './demo/main.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../dist/demo')
    },

    devtool: 'cheap-module-source-map',
    devServer: {
        historyApiFallback: true,
        stats: {
            maxModules: 0
        }
    },

    plugins: [
        new HtmlPlugin({
            title: 'react-querybuilder (DEMO)',
            template: './demo/index.html'
        })
    ]
});
