'use strict';

const HtmlPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');
const path = require('path');

module.exports = merge(webpackCommon, {
  mode: 'development',
  entry: {
    demo: './demo/main.tsx'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist/demo')
  },

  devtool: 'cheap-module-source-map',
  devServer: {
    historyApiFallback: true
  },

  plugins: [
    new HtmlPlugin({
      title: 'react-querybuilder (DEMO)',
      template: './demo/index.html'
    })
  ]
});
