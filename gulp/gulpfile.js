const gulp = require('gulp')
const eslint = require('gulp-eslint')
const browsersynch = require('browser-sync')
const nodemon = require('gulp-nodemon')
const gutil = require('gulp-util')
const watch = require('gulp-watch')

gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
  return gulp.src(['client/*.js','!node_modules/**'])
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(eslint())
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      .pipe(eslint.failAfterError())
})

const webpack = require('webpack')

gulp.task('webpack', (cb) => {
  webpack(require('./webpack.config.js'), (err, status) => {
    if(err) throw new gutil.PluginError('webpack', err)
    gutil.log('[webpack]', status.toString({
      // output options
    }))
    cb()
  })
})

gulp.task('watch', () => {
  watch(['server.js','client/**/*','!node_modules/**'], () => {
    gulp.start(['lint', 'webpack'])
  })
  watch(['dist/public/*'], () => {
    browsersynch.reload({stream: false})
  })
})

gulp.task('default', ['lint'], function () {
    // This will only run if the lint task is successful...
})

gulp.task('launchbrowser', ['serve'], () => {
  browsersynch.init({
    reloadDebounce: 2000, //I don't think that these are both necessary
    reloadThrottle: 1000,
    proxy: 'http://localhost:8000',
    port: 8888
  })
})

gulp.task('default', ['launchbrowser'])
{
  null
}

const browserRefreshDelay = 2000//on this box 1 second doesn't always work

gulp.task('serve', ['webpack','watch'], (cb) => {
  var called = false
  return nodemon({
    script: 'dist/server/server.js',
    watch: ['dist/server/**/*.js']
  }).on('start', () => {
    if(!called) { cb()}
    called=true
  }).on('restart', () => {
    setTimeout(() => {
      browsersynch.reload({stream: false})
    }, browserRefreshDelay)
  })
})


//webpack streams

/*
var gulp = require('gulp');
var webpack = require('webpack-stream');
gulp.task('default', function() {
  return gulp.src('src/entry.js')
    .pipe(webpack())
    .pipe(gulp.dest('dist/'));
});*/
