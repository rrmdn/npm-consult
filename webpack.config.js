const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js',
  output: {
    libraryTarget: 'commonjs',
    path: __dirname,
    filename: 'dist/index.js',
  },
  target: 'node',
  externals: [
    nodeExternals(),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        use: ['remove-flow-types-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
