angular.module('sistemium.services')
  .service('saSchema', function (DS) {

    var models = {};

    var aggregate = function (field) {

      return {

        sumFn: function (items) {
          return _.reduce(items, function (sum, item) {
            return sum + item [field]();
          }, 0);
        },

        sum: function (items) {
          return _.reduce(items, function (sum, item) {
            return sum + item [field];
          }, 0);
        },

        custom: function (items, fn, starter) {
          return _.reduce(items, function (res, item) {
            return fn (res, item [field] ());
          },starter);
        }

      };

    };

    var aggregator = function (names, type) {

      return function (owner, items) {

        var res = {};

        _.each(names, function (name) {

          res [name] = function () {
            return aggregate(name) [type] (owner[items]);
          };

        });

        return res;
      };

    };

    var schema = {

      register: function (def) {

        var resource = (models [def.name] = DS.defineResource(def));

        if (def.methods) {
          resource.agg = aggregator (Object.keys(def.methods), 'sumFn');
        }

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

    return schema;

  });
