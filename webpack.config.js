const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js',
  output: {
    libraryTarget: 'commonjs',
    path: __dirname,
    filename: 'dist/index.js',
  },
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.js'],
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['remove-flow-types-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
