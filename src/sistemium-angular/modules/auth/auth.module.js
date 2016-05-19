(function () {
  'use strict';

  angular.module('sistemium.auth', [
      'authApiApp.constants',
      'sistemium.schema',
      'sistemium.util',
      'ui.router'
    ])
    .config(function ($httpProvider) {
      $httpProvider.interceptors.push('saAuthInterceptor');
    })
  ;
})();
