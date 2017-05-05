/*eslint-disable no-console */
'use strict';
require('babel-register');

var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    gulpPlugins = require('gulp-load-plugins')(),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream');

var isWatching = false;
var shouldExitOnError = true;

var paths = {
  vendor: './node_modules/',
  entries: [
    {in: './public/src/js/app.js', out: 'app.js'}
  ],
  src: {
    scripts: ['./public/src/js/**/*.js'],
    styles: './public/src/styles/',
    base: './public/src/'
  },
  build: {
    base: './public/',
    styles: './public/css/',
    scripts: './public/js/'
  },
  dev: {
    base: './public/src',
    styles: './public/src/css/',
    scripts: './public/src/js/',
  }
};

var ext = {
  styles: '{less,css,scss,sass}',
  scripts: '{js,jsx}',
  images: '{gif,png,jpg,jpeg,ico,bmp,svg,pdf,tiff,webm}',
  fonts: '{eot,svg,ttf,woff,woff2,otf}'
};

process.on('exit', function() {
  if (gulp.fail && !isWatching) {
    process.exit(1);
  }
});

var handleErrors = function(err) {
  var args = Array.prototype.slice.call(arguments);
  gulpPlugins.notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>',
    time: 1
  }).apply(this, args);
  if(this && this.emit){
    this.emit('end'); // Keep gulp from hanging on this task
  } else {
    console.warn('handleErrors called outside of the context of a Stream');
  }
  if(shouldExitOnError) {
    process.exit(1);
  }
};

var buildScript = function(file, out) {
  const browserify = require('browserify');
  const watchify = require('watchify');

  var props = isWatching ? watchify.args : {};

  props.entries = [file];

  // watchify() if watch requested, otherwise run browserify() once
  var b = browserify(file, {
    cache: {},
    packageCache: {},
    debug: true
  });

  if(isWatching){
    b.plugin(watchify, {
      ignoreWatch: true // this ignore node_modules for watching, makes rebundling faster
    });
  }

  function rebundle() {
    var bundle = b.bundle();
    // If we are watchings, we want to alert on failed build, otherwise
    // we want the whole process to exit with a failed exit code
    // if(isWatching){
    //   bundle = bundle.on('error', handleErrors);
    // }
    bundle.on('error', handleErrors);

    return bundle
      .pipe(source(out))
      .pipe(gulp.dest(paths.build.scripts))
      .pipe(gulpPlugins.notify('JS bundled: <%= file.relative %>'))
  }

  function onChange() {
    gulpPlugins.util.log('Rebundling');
    // run lint, then rebundle
    runSequence('lint');
    rebundle();
  }

  // listen for an update and run rebundle
  b.on('update', function(files) {
    files.forEach(function(file) {
      gulpPlugins.util.log('Change in: ' + file);
    });
    onChange();
  });

  // listen for an update and run rebundle
  b.on('log', function(message) {
    gulpPlugins.util.log(message);
  });

  // run it once the first time buildScript is called
  return rebundle();
};

gulp.task('styles', function() {
  return gulp.src([
    paths.src.styles + 'app.less'
  ])
    .pipe(gulpPlugins.sourcemaps.init())
    .pipe(gulpPlugins.concat({
      path: paths.src.styles + 'app.less'
    }))
    .pipe(gulpPlugins.plumber({
      errorHandler: handleErrors
    }))
    .pipe(gulpPlugins.less())
    .pipe(gulpPlugins.sourcemaps.write())
    .pipe(gulpPlugins.postcss([
      require('autoprefixer')({
        browsers: [
          'last 10 Firefox versions',
          'last 10 ChromeAndroid versions',
          'last 6 Android versions',
          'iOS >= 7',
          'Explorer > 8',
          'last 10 Chrome versions',
          'last 3 Safari versions'
        ]
      })
    ]))
    .pipe(gulpPlugins.flatten())
    .pipe(gulp.dest(paths.dev.styles))
    .pipe(gulpPlugins.cssnano())
    .pipe(gulpPlugins.rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.build.styles));
});

gulp.task('scripts', ['lint'], function(done) {
  var i = 0;
  var checkFinished = () => {
    if(i === paths.entries.length){
      done();
    }
  };

  paths.entries.forEach(entry => {
    buildScript(entry.in, entry.out)
      .on('end', () => {
        i++;
        checkFinished();
      });
  });

  checkFinished();

});

gulp.task('lint', function(){
  return gulp.src(paths.src.scripts)
    .pipe(gulpPlugins.plumber())
    .pipe(gulpPlugins.changedInPlace({
      firstPass: true
    }))
    .pipe(gulpPlugins.eslint())
    .pipe(gulpPlugins.eslint.format())
    .on('data', function(file) {
      if(file.eslint.messages && file.eslint.messages.length){
        gulp.fail = true;
      }
    })
    .pipe(gulpPlugins.if(shouldExitOnError, gulpPlugins.eslint.failAfterError()))
    .on('error', handleErrors);
});

gulp.task('default', ['styles'], () => {
  shouldExitOnError = false;
  isWatching = true;
  runSequence('scripts');
  gulp.watch(paths.src.styles + '**/*.' + ext.styles, ['styles']);
});
