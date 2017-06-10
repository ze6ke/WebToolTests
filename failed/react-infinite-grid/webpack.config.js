const path=require('path')
const common=require('./webpack.config.common.js')

module.exports = Object.assign({}, common,{
  devtool: '#source-map',
  entry: './client/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/public'),
    sourceMapFilename: 'bundle.map'
  },
  plugins: [
    ]
})
