// const path = require('path');

module.exports = {
  entry: {
    index: './base.js',
  },
  output: {
    filename: 'index.js',
    path: __dirname,
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  // devServer: {
  //   contentBase: path.join(__dirname, 'dist'),
  //   compress: true,
  //   watchContentBase: true,
  // },
};
