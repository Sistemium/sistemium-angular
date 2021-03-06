(function () {

  angular.module('sistemium.services')
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

      function originalFieldsData(fields, data) {
        return _.pick(data, _.map(fields, function (field) {
          return field.key;
        }));
      }

      return {
        getConfigFieldsByKey: getConfig,
        setConfig: setConfig,
        getAll: getAll,
        getConfigKey: getConfigKey,
        originalFieldsData: originalFieldsData
      };
    })
  ;

}());
