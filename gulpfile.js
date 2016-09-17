'use strict';

require('sistemium-gulp')
  .config({
    ngModule: 'sistemium',
    tasks: 'lib_tasks',
    concat: 'sistemium-angular.js'
  })
  .lib(require('gulp'));
