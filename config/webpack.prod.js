const path = require('path');

module.exports = {
  extends: require.resolve('./webpack.common'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist',
  },
  mode: 'production',
};
