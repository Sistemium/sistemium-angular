(function (ng) {
  'use strict';
  ng.module('sistemium.auth.models')
    .run(function (Schema, appConfig) {
      Schema.register({
        name: 'saAccount',
        basePath: appConfig.apiUrl,
        relations: {
          hasMany: {
            providerAccount: {
              localField: 'providers',
              foreignKey: 'accountId'
            }
          }
        }
      });
    })
  ;

})(angular);
