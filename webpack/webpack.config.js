path = require('path')

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'packed.js'
  }
}
