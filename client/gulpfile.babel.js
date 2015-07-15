import autoprefixer from 'gulp-autoprefixer';
import babelify from 'babelify';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import concat from 'gulp-concat';
import connectFallback from 'connect-history-api-fallback';
import envify from 'envify/custom';
import gulp from 'gulp';
import minifyCss from 'gulp-minify-css';
import nib from 'nib';
import reactify from 'reactify';
import stylus from 'gulp-stylus';
import uglify from 'gulp-uglify';
import vinylBuffer from 'vinyl-buffer';
import vinylSource from 'vinyl-source-stream';
import watchify from 'watchify';


let bundler = browserify('./src/js/app.js', watchify.args)
  .transform(babelify.configure({
    optional: ['runtime', 'es7.asyncFunctions']
  }))
  .transform(envify({
    API_ROOT: process.env.SHERLOCKED_API_ROOT ||
              'http://sherlocked.dev.mozaws.net/api/',
    CAPTURE_ROOT: process.env.SHERLOCKED_CAPTURE_ROOT ||
                  'http://sherlocked.dev.mozaws.net/',
    MEDIA_ROOT: process.env.SHERLOCKED_MEDIA_ROOT ||
                'http://sherlocked.dev.mozaws.net/'
  }))
  .transform(reactify);


gulp.task('css', () => {
  gulp
    .src(['./src/css/*.styl', './src/css/lib/*.css'])
    .pipe(stylus({compress: true, use: [nib()]}))
    .pipe(autoprefixer())
    .pipe(concat('bundle.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('src/build'))
    .pipe(browserSync.stream());
});


function jsBundle(bundler) {
  let bundle = bundler
    .bundle()
    .on('error', function(err) {
      console.log(err.message);
      console.log(err.codeFrame);
      this.emit('end');
    })
    .pipe(vinylSource('bundle.js'));

  if (process.env.NODE_ENV == 'production') {
    bundle = bundle
      .pipe(vinylBuffer())
      .pipe(uglify());
  }

  return bundle.pipe(gulp.dest('src/build'));
}


gulp.task('js', () => {
  return jsBundle(bundler);
});


gulp.task('serve', () => {
  browserSync.init({
    index: 'src/index.html',
    middleware: [connectFallback()],
    notify: false,
    open: false,
    server: 'src/',
    port: process.env.SHERLOCKED_CLIENT_PORT || 2118
  });
});

gulp.task('watch', () => {
  bundler = watchify(bundler);

  bundler.on('update', () => {
    jsBundle(bundler);
  });
  bundler.on('log', console.log);

  gulp.watch('./src/css/**/*.styl', ['css']);
});


gulp.task('build', ['css', 'js']);
gulp.task('default', ['css', 'js', 'serve', 'watch']);