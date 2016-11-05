const path = require('path');
const webpack = require('webpack');

var extractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: __dirname + '/scripts/index.js',
  output: {
    path: __dirname + '/build',
    filename: '[name].js',
  },
  plugins: [
    new extractTextPlugin('[name].css')
  ],
  devtool: 'eval-source-map',
  debug: true,
  module: {
    loaders:[
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: 'es2015'
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: extractTextPlugin.extract('style-loader','css-loader!autoprefixer-loader!sass-loader')
      }, 
      {
        test: /\.css$/,
        loader: extractTextPlugin.extract('style-loader', 'css-loader')
      }
    ]
  },
  resolve: {
    root: path.resolve(__dirname),
    extensions: ['', '.js', '.json', '.coffee'],
  }
};
