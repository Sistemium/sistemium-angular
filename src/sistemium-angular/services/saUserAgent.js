'use strict';

(function () {

  function saUserAgent() {

    const ua = new UAParser();

    var os = ua.getOS();
    var cls = os.name ? os.name.replace (' ','') : '';

    return {
      os,
      cls
    };

  }

  angular.module('sistemium.services')
    .service('saUserAgent', saUserAgent);

})();
