'use strict';

(function () {

  function saDebug () {

    function log (ns) {
      return window.debug (ns);
    }

    return {
      log: log
    };

  }

  angular.module('sistemium.services')
    .service('saDebug', saDebug);

})();
