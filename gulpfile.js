// native dependencies
const proc = require('child_process')

// third-party dependencies
const gulp = require('gulp');
const electron = require('electron-prebuilt');

// test
const istanbul = require('gulp-istanbul');
// We'll use mocha in this example, but any test framework will work
const mocha = require('gulp-mocha');

gulp.task('demo', () => {
  // spawn electron 
  var child = proc.spawn(electron, ['demo/main.js']);
});

gulp.task('pre-test', function () {
  return gulp.src(['lib/model/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src(['test/**/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
    .on('error', (err) => {
      this.emit('error', err);
    });
});