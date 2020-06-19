'use strict';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        // Regenerate the regex below by running:
        // > npx are-you-es5 check . -rv
        exclude: /[\\/]node_modules[\\/](?!(nanoid)[\\/])/,
        options: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.scss/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss']
  },

  plugins: [new MiniCssExtractPlugin({ filename: 'query-builder.css' })],

  stats: {
    maxModules: 0
  }
};
