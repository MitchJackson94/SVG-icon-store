// Import GULP packages
var gulp = require('gulp');
var gutil = require('gulp-util');
var watch = require('gulp-watch');

// SASS
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var cleanCSS = require('gulp-clean-css');

// BrowserSync
var browserSync = require('browser-sync');

// SVG's
var Color = require("color");
var svgSymbols = require('gulp-svg-symbols');
var RecolorSvg = require("gulp-recolor-svg");



// Turn all SVG's into symbols
gulp.task('svg-symbol', function() {
    return gulp.src('assets/svg/**/*.svg')
    .pipe(svgSymbols())
    .pipe(gulp.dest('assets/sprite'));
})

// Make SVG's the right colour for background images
gulp.task("svg-recolor", function(){
    gulp.src('assets/svg/**/*.svg')
        .pipe(RecolorSvg.GenerateVariants(
            [ RecolorSvg.ColorMatcher(Color("black")) ],
            [ { suffix: "-color-white", colors: [ Color("#FFFFFF") ] },
                { suffix: "-color-black", colors: [ Color("#000000") ] },
                { suffix: "-color-grey", colors: [ Color("#CCCCCC") ] },
                { suffix: "-color-brand-primary", colors: [ Color("#00718A") ] },
                { suffix: "-color-brand-secondary", colors: [ Color("#DA9E26") ] }
            ]
        ))
        .pipe(gulp.dest("assets/sprite/backgrounds"));
});

// Enable Browser sync on gulp load
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: ''
        },
        host: "localhost"
    });
});

// Sass build
var sassBuild = function () {
    gulp.src('assets/sass/**/*.scss').pipe(sass({
        errLogToConsole: false
    }))
    .on('error', reportError)
    .pipe(gulp.dest('assets/css'))
    .pipe(browserSync.reload( { stream:true } ))
}; gulp.task('sass', sassBuild); 

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

// Watch for files
gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('assets/sass/**/*.scss', ['sass']);
  // Watch for new svg's
  gulp.watch('assets/svg/*.svg', ['svg-symbol', 'svg-color']);
  // Watch for new svg's
  gulp.watch('index.html').on('change', browserSync.reload);
});

// run 'scripts' task first, then watch for future changes
gulp.task('default', function () {
    gulp.start('sass', 'browser-sync', ['svg-symbol', 'svg-recolor'], 'watch');
});
