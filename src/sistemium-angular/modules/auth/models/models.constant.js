(function (ng) {
  'use strict';
  ng.module('sistemium.auth.models')
    .constant('appConfig', {
      apiUrl: 'http://localhost:9080/api/'
    })
  ;

})(angular);
