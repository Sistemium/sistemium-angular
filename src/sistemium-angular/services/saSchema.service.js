angular.module('sistemium.services')
  .service('saSchema', ['DS', '$q', function (DS, $q) {

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

          res [trueName] = function () {
            return aggregate (trueName) [trueType] (owner[items]);
          };

        });

        return res;
      };

    };

    return function (config) {

      var models = {};

      return {

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

          resource.getCount = function (params) {
            return config.getCount.apply(this,params);
          };

          resource.findAllWithRelations = function (params, options) {

            return function (relations) {

              return $q(function (resolve, reject) {

                resource.findAll(params, options).then(function (results) {

                  return $q.all(_.map(results, function (item) {
                      return resource.loadRelations(item, relations);
                    }))
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

  }]);
