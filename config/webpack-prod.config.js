'use strict';

const { merge } = require('webpack-merge');
const webpackCommon = require('./webpack-common.config');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = merge(webpackCommon, {
  mode: 'production',

  entry: {
    index: './src/index.ts'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
    libraryTarget: 'commonjs2'
  },

  module: {
    rules: [
      {
        parser: {
          amd: false
        }
      }
    ]
  },

  externals: {
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom'
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ]
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './src/query-builder.scss'
        }
      ]
    })
  ]
});
