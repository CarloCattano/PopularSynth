const CopyWebpackPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const path = require('path')

module.exports = [{
  entry: {
    server: './src/server.js'
  },
  externals: [nodeExternals()],
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
}, {
  performance: {
    hints: false
  },
  entry: {
    app: './src/app.js'
  },
  plugins: [
    new CopyWebpackPlugin([
      'public/scripts/jquery.min.js',
      'public/scripts/draggabilly.js',
      'public/scripts/Interface.js',
      'public/styles/examples.css'
    ])
  ],
  module: {
    rules: [{
      test: /\.(mp3)$/,
      use: [{
        loader: 'file-loader',
        options: {}
      }]
    }]
  },
  devtool: 'sourcemap'
}]
