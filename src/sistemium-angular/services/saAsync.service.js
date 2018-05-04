'use strict';

(function () {

  function saAsync ($window,$q) {

    var asyncSeries = $window.async.series;

    $window.async = null;

    function chunkSerial (chunkSize, data, datumFn, onChunkSuccessFn, onChunkErrorFn) {

      var chunks = _.chunk(data,chunkSize);

      var series = _.map (chunks,function(chunk){

        return function (done) {

          var q = $q.all(_.map(chunk,function(datum){
            return datumFn (datum);
          }));

          q.then (function(chunk){
            if (angular.isFunction(onChunkSuccessFn)){
              onChunkSuccessFn (chunk,data.length);
            }
            done(null,chunk);
          });

          return q.catch(function (err){
            if (angular.isFunction(onChunkErrorFn)) {
              onChunkErrorFn(chunk);
            }
            done(err,chunk);
          });
        };

      });

      return $q(function(resolve,reject){
        asyncSeries(series,function(err,results) {

          if (err) {
            reject(err);
          } else {
            resolve(data,results);
          }

        });
      });
    }

    return {
      chunkSerial: chunkSerial
    };

  }

  angular.module('sistemium.services')
    .service('saAsync', ['$window', '$q', saAsync]);

})();
