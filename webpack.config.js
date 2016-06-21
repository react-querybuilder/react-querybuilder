'use strict';

let HtmlPlugin = require('html-webpack-plugin');
let DefinePlugin = require('webpack').DefinePlugin;
const merge = require('webpack-merge');
const webpackCommon = require('./config/webpack-common.config');

module.exports = env=> {
    return [
        merge(webpackCommon, {
            entry: {
                demo: './demo/main.js'
            },
            output: {
                filename: '[name].bundle.js',
                path: __dirname + '/dist/demo'
            },

            devtool: 'cheap-module-source-map',
            devServer: {
                inline: true,
                historyApiFallback: true,
                stats: 'minimal'
            },

            plugins: [
                new HtmlPlugin({
                    title: 'react-querybuilder (DEMO)',
                    template: './demo/index.html'
                }),
                new DefinePlugin({
                    ENV: env
                })
            ]
        }),
        require('./config/webpack-dist.config')
    ]
};