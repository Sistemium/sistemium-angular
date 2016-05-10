'use strict';

(function () {

  function saAsync ($window,$q) {

    var async = $window.async;

    function chunkSerial (chunkSize, data, datumFn, onChunkSuccessFn, onChunkErrorFn) {

      var chunks = _.chunk(data,chunkSize);

      var series = _.map (chunks,function(chunk){

        return function (done) {

          var q = $q.all(_.map(chunk,function(datum){
            return datumFn (datum);
          }));

          q.then (function(chunk){
            onChunkSuccessFn (chunk);
            done(null,chunk);
          });

          return q.catch(function (err){
            onChunkErrorFn (chunk);
            done(err,chunk);
          });
        };

      });

      return $q(function(resolve,reject){
        async.series(series,function(err,results) {

          if (err) {
            reject(err);
          } else {
            resolve(results);
          }

        });
      });
    }

    return angular.extend (async,{
      chunkSerial: chunkSerial
    });

  }

  angular.module('sistemium.services')
    .service('saAsync', ['$window', '$q', saAsync]);

})();
