const path = require('path');

module.exports = {
  entry: {
    'content-script': path.resolve(__dirname, '../src/index.ts'),
    'install-watch': path.resolve(__dirname, '../src/core/install-watch.ts'),
  },
  // output: {
  //   path: path.resolve(__dirname, '../dist'),
  //   publicPath: '/dist',
  // },
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
          modules: false,
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
