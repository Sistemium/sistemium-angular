(function () {

  angular.module('sistemium.models')
    //common configuration which can be overrided in projects where sistemium-angular injected
    .config(['DSProvider', function (DSProvider) {

      angular.extend(DSProvider.defaults, {
        beforeInject: function (resource, instance) {
          if (!instance.id) {
            instance.id = uuid.v4();
          }
        },
        beforeCreate: function (resource, instance, cb) {
          if (!instance.id) {
            instance.id = uuid.v4();
          }
          cb(null, instance);
        }
      });

    }])

    //this is common configuration for http adapter, basePath
    //should be set in the project where sistemium-angular injected
    .config(['DSHttpAdapterProvider', function (DSHttpAdapterProvider) {

      angular.extend(DSHttpAdapterProvider.defaults, {

        httpConfig: {
          headers: {
            'X-Return-Post': 'true',
            'authorization': window.localStorage.getItem('authorization'),
            'X-Page-Size': 1000
          }
        },

        queryTransform: function queryTransform(resourceConfig, params) {

          var res = {};
          if (params.offset) {
            res['x-start-page:'] = Math.ceil(params.offset / params.limit);
          }
          if (params.limit) {
            res['x-page-size:'] = params.limit;
          }

          delete params.limit;
          delete params.offset;
          return angular.extend(res, params);
        }
      });
    }]);

}());
