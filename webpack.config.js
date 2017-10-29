const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './index.js',
  output: {
    libraryTarget: 'commonjs',
    path: __dirname,
    filename: 'dist/index.js',
  },
  target: 'node',
  externals: [nodeExternals()],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
