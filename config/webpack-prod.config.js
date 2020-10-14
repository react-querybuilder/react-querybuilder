'use strict';

const merge = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = merge(webpackCommon, {
  mode: 'production',
  entry: {
    index: './index.js'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
    libraryTarget: 'commonjs2'
  },
  externals: {
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom',
    moment: 'moment',
  },
  devtool: 'cheap-module-source-map',
  // devtool: 'none',

  plugins: [
    new CopyPlugin([
      {
        from: './src/query-builder.scss'
      }
    ])
  ]
});
