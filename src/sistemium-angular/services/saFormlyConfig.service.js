'use strict';

(function () {

  angular.module('sistemiumAngular.services')
    .factory('saFormlyConfigService', function () {
      var formlyConfig = {};

      function getConfig(key) {
        if (formlyConfig.hasOwnProperty(key)) {
          return formlyConfig[key];
        } else {
          throw new Error('No such key ' + key + ' in formlyConfig...');
        }
      }

      function setConfig(key, cfg) {
        formlyConfig[key] = cfg;
      }

      function getAll() {
        return formlyConfig;
      }

      function getConfigKey(cfg, key) {
        return _.find(cfg, function (obj) {
          return obj.key === key;
        });
      }

      return {
        getConfigFieldsByKey: getConfig,
        setConfig: setConfig,
        getAll: getAll,
        getConfigKey: getConfigKey
      };
    })
  ;

}());
