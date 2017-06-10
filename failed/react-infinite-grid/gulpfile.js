const gulp = require('gulp')
const webpack = require('webpack')

gulp.task('default', (cb) => {
  webpack(require('./webpack.config.js'), (err, status) => {
    if(err) err
    console.log('all done')
    console.log(status.toString({}))
    cb()
  })
})
