'use strict';

let ExtractTextPlugin = require('extract-text-webpack-plugin');
let ProvidePlugin = require('webpack').ProvidePlugin;

module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader', 'sass-loader']
                })
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss']
    },

    plugins: [
        new ExtractTextPlugin('query-builder.css')
    ],

    stats: {
        maxModules: 0
    }
};
