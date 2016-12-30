// native dependencies
const proc = require('child_process')

// third-party dependencies
const gulp = require('gulp');
const electron = require('electron-prebuilt');
const gulpFind = require('gulp-find');
const gulpConcat = require('gulp-concat');

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

gulp.task('find-translations', function () {
  return gulp.src('lib/**/*')
    .pipe(gulpFind(/_t\((.+)\)/g))
    .pipe(gulpConcat('translations.txt'))
    .pipe(gulp.dest('.'));
});













// EXPERIMENTAL
const through = require('through2');
const PluginError = require('gulp-util').PluginError;
const File = require('vinyl');
const path = require('path');

// consts
const PLUGIN_NAME = 'gulp-prepare-i18n';


gulp.task('prepare-i18n', function () {

  function prepareI18n(file, options) {

    var latestFile;
    var translations = [];

    function bufferContents(file, encoding, cb) {
      if (file.isNull()) {
        // nothing to do
        return cb();
      }

      if (file.isStream()) {
        // file.contents is a Stream - https://nodejs.org/api/stream.html
        this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));

        // or, if you can handle Streams:
        //file.contents = file.contents.pipe(...
        //return cb(null, file);
      } else if (file.isBuffer()) {
        // file.contents is a Buffer - https://nodejs.org/api/buffer.html
        // this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));


        var fileTranslations = file.contents.toString().match(/_t\((.+)\)/g);

        if (fileTranslations) {
          translations = translations.concat(fileTranslations);
        }

        latestFile = file;

        return cb();

        // or, if you can handle Buffers:
        //file.contents = ...
        //return cb(null, file);
      }
    }

    function endStream(cb) {
      // no files passed in, no file goes out
      if (!latestFile) {
        cb();
        return;
      }

      var translationsFile;

      // if file opt was a file path
      // clone everything from the latest file
      if (typeof file === 'string') {
        translationsFile = latestFile.clone({contents: false});
        translationsFile.path = path.join(latestFile.base, file);
      } else {
        translationsFile = new File(file);
      }

      translationsFile.contents = new Buffer(JSON.stringify(translations, null, '  '));

      this.push(translationsFile);
      cb();
    }

    return through.obj(bufferContents, endStream);
  }

  return gulp.src('lib/**/*')
    .pipe(prepareI18n('translations.json'))
    .pipe(gulp.dest('tmp'));
});
