const path = require('path');
const { merge } = require('webpack-merge'); // eslint-disable-line import/no-extraneous-dependencies
const common = require('./webpack.common');

module.exports = merge(common, {
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist',
  },
  mode: 'production',
});
