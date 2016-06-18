'use strict';

let HtmlPlugin = require('html-webpack-plugin');
let DefinePlugin = require('webpack').DefinePlugin;
const merge = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');

module.exports = [
    merge(webpackCommon, {
        entry: {
            main: './demo/main.js'
        },
        output: {
            filename: '[name].js'
        },

        devtool: 'cheap-module-source-map',
        devServer: {
            inline: true,
            historyApiFallback: true,
            stats: 'minimal'
        },

        resolve: {
            alias: {
                'react-query-builder': __dirname + '/lib'
            }
        },

        plugins: [
            new HtmlPlugin({
                title: 'react-query-builder',
                template: './demo/index.html'
            }),
            new DefinePlugin({
                DEV: true
            })
        ]
    }),
    require('./webpack-dist.config')
];