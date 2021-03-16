const path = require('path');

module.exports = {
  extends: require.resolve('./webpack.common'),
  output: {
    path: path.resolve(__dirname, '../test/dist'),
    publicPath: '/test/dist',
  },
  mode: 'development',
  devtool: 'eval-source-map',
  // watch: true,
};
