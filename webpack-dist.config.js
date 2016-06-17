'use strict';

let ExtractTextPlugin = require('extract-text-webpack-plugin');
let ProvidePlugin = require('webpack').ProvidePlugin;
let DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
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
        extensions: ['', '.js', '.jsx']
    },

    postcss: function () {
        return [
            require('postcss-cssnext')
        ]
    },

    plugins: [
        new ExtractTextPlugin('react-query-builder.css'),
        new ProvidePlugin({
            React: 'react'
        }),
        new DefinePlugin({
            DEV: false
        })
    ]
};