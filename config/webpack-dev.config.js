'use strict';

let HtmlPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');
const path = require('path');

module.exports = merge(webpackCommon, {
    entry: {
        index: './src/index.js'
      },
    
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../dist'),
        libraryTarget: 'commonjs2',
    },

    externals: {
        'react': 'commonjs react',
        'react-dom': 'commonjs react-dom',
    },

    devtool: 'cheap-module-source-map',

    devServer: {
        historyApiFallback: true,
        stats: {
            maxModules: 0
        }
    },

    plugins: [
        new CopyPlugin([{
          from: './src/query-builder.scss',
        }])
      ]
});
