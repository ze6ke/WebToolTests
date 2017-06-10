const gulp = require('gulp')
const webpack = require('webpack')
const gutil = require('gutil')

gulp.task('default', (cb) => {
  webpack(require('./webpack.config.js'), (err, status) => {
    if(err) throw new gutil.PluginError(desc, err)
    console.log('all done')
    gutil.log(status.toString({}))
    cb()
  })
})
