'use strict';

const HtmlPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

const pages = ['main', 'ie11'];

module.exports = merge(webpackCommon, {
  mode: 'production',

  entry: pages.reduce((prev, curr) => ({ ...prev, [curr]: `./demo/${curr}.tsx` }), {}),

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

  plugins: pages.map(
    (p) =>
      new HtmlPlugin({
        template: `./demo/${p.replace('main', 'index')}.html`,
        filename: `${p.replace('main', 'index')}.html`,
        chunks: [p]
      })
  )
});
