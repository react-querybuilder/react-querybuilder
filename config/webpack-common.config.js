'use strict';

let ExtractTextPlugin = require('extract-text-webpack-plugin');
let ProvidePlugin = require('webpack').ProvidePlugin;

module.exports = {
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/, loader: 'babel',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015-webpack', 'react']
                }
            },

            {
                test: /\.scss/,
                loader: ExtractTextPlugin.extract('css!sass')
            }
        ],
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.scss']
    },

    plugins: [
        new ExtractTextPlugin('query-builder.css'),
        new ProvidePlugin({
            React: 'react'
        })
    ]
};