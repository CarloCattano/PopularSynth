const CopyWebpackPlugin = require('copy-webpack-plugin')
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
  entry: './src/app.js',
  output: {
    filename: 'app.js',
    path: path.join(__dirname, 'dist')
  },
  devtool: 'sourcemap'
}]
