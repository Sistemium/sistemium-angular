(function () {
  'use strict';

  angular.module('sistemium.auth', [
      //'sistemium.constants',
      'sistemium.schema',
      'sistemium.util',
      'ui.router',
      'LocalStorageModule',
      'sistemium.auth.services',
      'sistemium.auth.models'
    ])
    .config(function ($httpProvider) {
      $httpProvider.interceptors.push('saAuthInterceptor');
    })
  ;
})();
