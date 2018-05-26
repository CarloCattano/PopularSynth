const nodeExternals = require('webpack-node-externals')
const path = require('path')

module.exports = [{
  entry: './src/server.js',
  externals: [nodeExternals()],
  output: {
    filename: 'server.js',
    path: path.join(__dirname, 'dist')
  },
  node: {
    __dirname: false,
    __filename: false
  },
  target: 'node',
  module: {
    rules: [{
      test: /\.(html)$/,
      use: [{
        loader: 'file-loader',
        options: {}
      }]
    }]
  },
  devtool: 'sourcemap'
}]
