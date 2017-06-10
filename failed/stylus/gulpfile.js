
// include the required packages.
var gulp = require('gulp');
var data = require('gulp-data');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');


// Get one .styl file and render
gulp.task('one', function () {
 return gulp.src('./css/one.styl')
   .pipe(stylus())
   .pipe(gulp.dest('./css/build'));
});

// Options
// Options compress
gulp.task('compress', function () {
 return gulp.src('./css/compressed.styl')
   .pipe(stylus({
     compress: true
   }))
   .pipe(gulp.dest('./css/build'));
});


// Set linenos -- includes full path, so probably not for prod
gulp.task('linenos', function () {
 return gulp.src('./css/linenos.styl')
   .pipe(stylus({linenos: true}))
   .pipe(gulp.dest('./css/build'));
});

// Include css
// Stylus has an awkward and perplexing 'include css' option
//that changes the forces static instead of dynamic linking of the included files
gulp.task('include-css', function() {
 return gulp.src('./css/*.styl')
   .pipe(stylus({
     'include css': true
   }))
   .pipe(gulp.dest('./css/build'));

});

// Inline sourcemaps
gulp.task('sourcemaps-inline', function () {
 return gulp.src('./css/sourcemaps-inline.styl')
   .pipe(sourcemaps.init())
   .pipe(stylus())
   .pipe(sourcemaps.write())
   .pipe(gulp.dest('./css/build'));
});

// External sourcemaps, probably a good thing to have in the dev version
gulp.task('sourcemaps-external', function () {
 return gulp.src('./css/sourcemaps-external.styl')
   .pipe(sourcemaps.init())
   .pipe(stylus())
   .pipe(sourcemaps.write('.'))
   .pipe(gulp.dest('./css/build'));
});

// Pass an object in raw form to be accessable in stylus
//I'm assuming this is equivalent to the with command line parameter and I don't currently have a use for it
var data = {red: '#ff0000'};
gulp.task('pass-object', function () {
 gulp.src('./css/main.styl')
   .pipe(stylus({ rawDefine: { data: data }}))
   .pipe(gulp.dest('./css/build'));
});

// Use with gulp-data
//I'm assuming this is equivalent to the with command line parameter and I don't currently have a use for it
gulp.task('gulp-data', function() {
 gulp.src('./components/**/*.styl')
   .pipe(data(function(){
     return {
       componentPath: '/' + (file.path.replace(file.base, '').replace(/\/[^\/]*$/, ''))
     };
   }))
   .pipe(stylus())
   .pipe(gulp.dest('./css/build'));
});

//use with style-lint
gulp.task('lintcss', function() {
  const gulpStylelint = require('gulp-stylelint');

  return gulp
    .src('css/build/**/*.css')
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }))
})

/* Ex:
body
 color: data.red;
*/

// Default gulp task to run
gulp.task('default', ['one', 'compress', 'linenos', 'sourcemaps-inline', 'sourcemaps-external', 'pass-object']);
