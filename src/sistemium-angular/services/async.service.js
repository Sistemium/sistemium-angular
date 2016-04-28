'use strict';

(function () {

  function saAsync ($window) {

    return $window.async;

  }

  angular.module('sistemium.services')
    .service('saAsync', saAsync);

})();
