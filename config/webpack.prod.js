/* eslint-disable import/no-extraneous-dependencies */
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
  extends: require.resolve('./webpack.common'),
  mode: 'production',
  plugins: [
    new BabelMinifyPlugin(),
  ],
};
