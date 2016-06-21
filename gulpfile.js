// native dependencies
const proc = require('child_process')

// third-party dependencies
const gulp = require('gulp');
const electron = require('electron-prebuilt');

gulp.task('demo', () => {
  // spawn electron 
  var child = proc.spawn(electron, ['demo/main.js']);
});
