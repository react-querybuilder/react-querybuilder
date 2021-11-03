'use strict';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'babel-loader',
        // Regenerate the regex below by running:
        // > npx are-you-es5 check . -rv
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env', '@babel/preset-typescript']
        }
      },
      {
        test: /\.s?css$/,
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
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
    fallback: {
      fs: false,
      path: false,
      util: false
    }
  },

  plugins: [new MiniCssExtractPlugin({ filename: 'query-builder.css' })]
};
