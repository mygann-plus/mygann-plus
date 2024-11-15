const path = require('path');

module.exports = {
  entry: {
    'content-script': path.resolve(__dirname, '../src/index.ts'),
    'install-watch': path.resolve(__dirname, '../src/core/install-watch.ts'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js', // Outputs as content-script.js, install-watch.js
    publicPath: '/dist',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts'],
    alias: {
      '~': path.resolve(__dirname, '../src'),
    },
  },
};
