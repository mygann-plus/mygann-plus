const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv(),
  ],
  entry: {
    'content-script': path.resolve(__dirname, '../src/index.ts'),
    'install-watch': path.resolve(__dirname, '../src/core/install-watch.ts'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
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
    extensions: ['.js', '.ts', '.tsx'],
  },
};
