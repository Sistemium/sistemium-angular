'use strict';
(function () {
  angular.module('sistemium.services')
    .service('saSchema', function (DS, $q, saAsync) {

      var chunkSize = 6;

      var aggregate = function (field) {

        return {

          sumFn: function (items) {
            return _.reduce(items, function (sum, item) {
              return sum + (_.result(item,field) || 0);
            }, 0);
          },

          sum: function (items) {
            return _.reduce(items, function (sum, item) {
              return sum + (_.get(item,field) || 0);
            }, 0);
          },

          custom: function (items, fn, starter) {
            return _.reduce(items, function (res, item) {
              return fn (res, _.result(item,field));
            },starter);
          }

        };

      };

      var aggregator = function (names, type) {

        return function (owner, items) {

          var res = {};

          _.each(names, function (name) {

            var trueName = name.name || name;
            var trueType = name.type || type;

            _.set(res, trueName, function () {
              return aggregate (trueName) [trueType] (owner[items]);
            });

          });

          return res;
        };

      };

      return function (config) {

        var models = {};

        return {

          config: config,

          register: function (def) {

            var resource = (models [def.name] = DS.defineResource(def));

            function mapper (type){
              return function (val, key){
                return {
                  name: angular.isString(val) ? val: key,
                  type: type
                };
              };
            }

            var agg = _.map (def.methods, mapper('sumFn'));

            Array.prototype.push.apply (agg, _.map (def.aggregables, mapper('sum')));

            resource.agg = aggregator (agg);

            _.each(config,function (val,key){

              if (resource[key]) return;

              if (angular.isFunction(val)) {
                resource [key] = function () {
                  return val.apply (resource, arguments);
                };
              } else {
                resource [key] = val;
              }

            });

            resource.findAllWithRelations = function (params, options) {

              return function (relations, onProgress, onError, relOptions) {

                return $q(function (resolve, reject) {

                  resource.findAll(params, options).then(function (results) {

                    function loadChunked (positions) {
                      return saAsync.chunkSerial (chunkSize, positions, function(position){
                          return resource.loadRelations(position,relations,relOptions);
                        }, onProgress || _.noop, onError || _.noop)
                        .then(resolve,reject);
                    }

                    return loadChunked(results)
                      .then(resolve,reject);

                  }).catch(reject);

                });

              };
            };

            return resource;
          },

          models: function () {
            return models;
          },

          model: function (name) {
            return models [name];
          },

          aggregate: aggregate

        };
      };

    });
  })()
;
