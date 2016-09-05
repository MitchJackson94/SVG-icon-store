var gulp = require('gulp');
var gutil = require('gulp-util');
var watch = require('gulp-watch');

var sass = require('gulp-sass');
var notify = require('gulp-notify');
var cleanCSS = require('gulp-clean-css');

var browserSync = require('browser-sync');


gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: '_site'
        },
        host: "localhost"
    });
});

// Sass build
var sassBuild = function () {
    gulp.src('sass/**/*.scss').pipe(sass({
        errLogToConsole: false
    }))
    .on('error', reportError)
    .pipe(cleanCSS())
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload( { stream:true } ))
};

// Compile sass
gulp.task('sass', sassBuild);

// Error report sass
var reportError = function (error) {
    var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

    notify({
        title: 'Task Failed [' + error.plugin + ']',
        message: lineNumber + 'See console.',
        sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);

    gutil.beep(); // Beep 'sosumi' again

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.white.bgRed;

    report += chalk('TASK:') + ' [' + error.plugin + ']\n';
    report += chalk('PROB:') + ' ' + error.message + '\n';
    if (error.lineNumber) { report += chalk('LINE:') + ' ' + error.lineNumber + '\n'; }
    if (error.fileName)   { report += chalk('FILE:') + ' ' + error.fileName + '\n'; }
    console.error(report);

    // Prevent the 'watch' task from stopping
    this.emit('end');
}

gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('sass/**/*.scss', ['sass']);
});

// run 'scripts' task first, then watch for future changes
gulp.task('default', function () {
    gulp.start('sass', 'browser-sync', 'watch');
});
