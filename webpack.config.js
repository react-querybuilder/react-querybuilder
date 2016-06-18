'use strict';

let HtmlPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let ProvidePlugin = require('webpack').ProvidePlugin;
let DefinePlugin = require('webpack').DefinePlugin;

module.exports = [
    {
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

        module: {
            loaders: [
                {
                    test: /\.(js|jsx)$/, loader: 'babel',
                    exclude: /node_modules/,
                    query: {
                        presets: ['es2015', 'react']
                    }
                },

                {
                    test: /\.css/,
                    loader: ExtractTextPlugin.extract('css!postcss')
                }
            ],
        },
        resolve: {
            extensions: ['', '.js', '.jsx'],
            alias: {
                'react-query-builder': __dirname + '/lib'
            }
        },

        postcss: function () {
            return [
                require('postcss-cssnext')
            ]
        },

        plugins: [
            new HtmlPlugin({
                title: 'react-query-builder',
                template: './demo/index.html'
            }),
            new ExtractTextPlugin('main.css'),
            new ProvidePlugin({
                React: 'react'
            }),
            new DefinePlugin({
                DEV: true
            })
        ]
    },
    require('./webpack-dist.config')
];