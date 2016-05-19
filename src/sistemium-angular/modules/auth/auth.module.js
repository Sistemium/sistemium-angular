(function () {
  'use strict';

  angular.module('sistemium.auth', [
      'authApiApp.constants',

      'sistemium.util',
      'ui.router'
    ])
    .config(function ($httpProvider) {
      $httpProvider.interceptors.push('authInterceptor');
    })
  ;
})();
