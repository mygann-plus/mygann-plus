const path = require('path');

module.exports = {
  entry: {
    'content-script': path.resolve(__dirname, '../src/index.js'),
    'install-watch': path.resolve(__dirname, '../src/install-watch.js'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
        options: {
          modules: true,
        },
      },
      {
        test: /\.png|\.jpe?g$/,
        loader: 'file-loader',
        options: {
          outputPath: '/assets',
        },
      },
    ],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '../src'),
    },
  },
};
