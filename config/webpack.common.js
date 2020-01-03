const path = require('path');

module.exports = {
  entry: {
    'content-script': path.resolve(__dirname, '../src/core/index.ts'),
    // 'install-watch': path.resolve(__dirname, '../src/install-watch.js'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
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
