'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();


gulp.task('scripts-reload', function() {
  return buildScripts()
    .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
  return buildScripts();
});

function buildScripts() {
    var paths = [
        path.join(conf.paths.src, '/app/**/*.js')
    ];
  return gulp.src(paths)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.size())
};
