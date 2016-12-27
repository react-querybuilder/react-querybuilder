'use strict';

let ExtractTextPlugin = require('extract-text-webpack-plugin');
let ProvidePlugin = require('webpack').ProvidePlugin;

module.exports = {
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss/,
        loader: ExtractTextPlugin.extract({
          loader: ['css-loader', 'sass-loader']
        })
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss']
  },

  plugins: [
    new ExtractTextPlugin('query-builder.css')
  ]
};
