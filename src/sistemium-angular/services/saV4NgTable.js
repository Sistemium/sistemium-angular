'use strict';

angular.module('sistemiumAngular.services')
  .service('v4NgTable', function (NgTableParams) {

    var lastFindAllParams = {},
      lastFindAllData = [],
      totalCount = 0
    ;

    function ngTableToV4Params(params) {

      var result = {
        'x-page-size:': params && params.count() || 12,
        'x-start-page:': params && params.page() || 1
      };

      if (params && params.sorting()) {
        var sortBy = _.reduce(params.sorting(), function (res, dir, field) {
          return res + ',' + (dir === 'desc' ? '-' : '') + field;
        }, '').substr(1);
        if (sortBy) {
          result['x-order-by:'] = sortBy;
        }
      }

      return result;

    }

    function getData (ctrl,model) {

      return function ($defer, params) {

        var v4Params = ngTableToV4Params(params);
        var needCount = !totalCount ||
            _.get(v4Params, 'searchFor:') !== _.get(lastFindAllParams, 'searchFor:')
          ;
        var countPromise;
        var setPage;

        if (needCount) {
          countPromise = model.getCount(_.pick(v4Params, ['searchFor:', 'searchFields:'])).then(function (res) {
            ctrl.ngTableParams.total(totalCount = res);
            if (res < (params.page() - 1) * params.count()) {
              v4Params['x-start-page:'] = 1;
              setPage = 1;
            }
            return v4Params;
          });
          countPromise.catch(function (res) {
            //ctrl.processServerError(res);
            $defer.reject();
          });
        }

        var dataPromiseOrNothing = function () {
          var p = v4Params;
          if (!_.matches(p)(ctrl.lastFindAllParams) || !_.matches(ctrl.lastFindAllParams)(p)) {
            return model.findAll(p, {bypassCache: true})
              .then(function (data) {
                if (setPage) {
                  params.page(setPage);
                }
                lastFindAllParams = p;
                lastFindAllData = data;
                $defer.resolve(lastFindAllData);
              }, function () {
                $defer.reject();
              });
          } else {
            if (setPage) {
              params.page(setPage);
            }
            $defer.resolve(lastFindAllData);
          }
        };

        if (countPromise) {
          ctrl.busy = countPromise.then(dataPromiseOrNothing);
        } else {
          ctrl.busy = dataPromiseOrNothing(v4Params);
        }

      };

    }

    return {

      setup: function (ctrl, model) {

        var counts = !ctrl.ngTable.noPages && (ctrl.ngTable.counts || [12, 25, 50, 100]);
        var count = ctrl.ngTable.count || 12;

        if (counts.indexOf(count) < 0) {
          counts.push(count);
          counts = _.sortBy(counts);
        }

        ctrl.ngTableParams = new NgTableParams(angular.extend({
          page: 1,
          count: count,
          clearData: function () {
            lastFindAllData = [];
          }
        }, ctrl.ngTable), {
          filterDelay: 0,
          dataset: lastFindAllData,
          counts: counts,
          getData: getData (ctrl,model)
        });

        return ctrl.ngTableParams;
      },

      ngTableToV4Params: ngTableToV4Params

    };

  });
