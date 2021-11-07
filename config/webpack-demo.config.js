'use strict';

const HtmlPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = merge(webpackCommon, {
  mode: 'production',

  entry: {
    demo: './demo/main.tsx'
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist_demo')
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        parser: {
          amd: false
        }
      }
    ]
  },

  devtool: 'source-map',

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ]
  },

  devServer: {
    historyApiFallback: true
  },

  plugins: [
    new HtmlPlugin({
      title: 'React Query Builder Demo',
      template: './demo/index.html'
    })
  ]
});
