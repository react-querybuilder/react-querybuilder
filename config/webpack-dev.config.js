'use strict';

const HtmlPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');
const path = require('path');

const pages = ['main', 'ie11'];

module.exports = merge(webpackCommon, {
  mode: 'development',

  entry: pages.reduce((prev, curr) => ({ ...prev, [curr]: `./demo/${curr}.tsx` }), {}),

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist_demo')
  },

  devtool: 'cheap-module-source-map',
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
