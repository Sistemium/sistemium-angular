'use strict';

(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('sistemium.config', [])
    .value('sistemium.config', {
      debug: true
    });

  // Modules
  angular.module('sistemium.directives', []);
  angular.module('sistemium.filters', []);
  angular.module('sistemium.services', []);
  angular.module('sistemium.models', []);
  angular.module('sistemium.schema', []);
  angular.module('sistemium.dependencies', [
    'toastr',
    'js-data',
    'ui.router.stateHelper'
  ]);
  angular.module('sistemium', [
    'sistemium.dependencies',
    'sistemium.config',
    'sistemium.directives',
    'sistemium.filters',
    'sistemium.services',
    'sistemium.models',
    'sistemium.schema'
  ]);

})(angular);

'use strict';
(function () {
  angular.module('sistemium.schema', [])
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

            _.each(config,function (val,key){

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

'use strict';

angular.module('sistemium.util', []);

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

(function() {

  function config(toastrConfig) {

    angular.extend (toastrConfig,{
      allowHtml: true,
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      progressBar: false,
      iconClasses: {
        error: 'alert alert-danger',
        info: 'alert alert-info',
        success: 'alert alert-success',
        warning: 'alert alert-warning'
      }
    });

  }

  angular
    .module('sistemium.dependencies')
    .config(['toastrConfig', config]);

})();

(function () {

  angular.module('sistemium.directives')
    .directive('saAnimateOnChange', ['$animate', '$timeout', saAnimateOnChange]);

  function saAnimateOnChange ($animate,$timeout) {

    return {
      restrict: 'A',
      replace: true,
      link: link
    };

    function link (scope, elem, attr) {
      var cls = attr.changeClass;
      scope.$watch(attr.saAnimateOnChange, function(nv,ov) {
        if ((nv||0) !== (ov||0)) {
          $animate.addClass(elem,cls).then(function() {
            $timeout(function() {
              $animate.removeClass(elem,cls);
            });
          });
        }
      });
    }

  }

})();

(function () {

  angular.module('sistemium.directives')
    .directive('saTypeaheadClickOpen', ['$timeout', function ($timeout) {
      return {
        require: 'ngModel',
        link: function($scope, elem) {
          var triggerFunc = function() {
            var ctrl = elem.controller('ngModel'),
              prev = ctrl.$modelValue || '';
            if (prev) {
              ctrl.$setViewValue('');
              $timeout(function() {
                ctrl.$setViewValue(prev);
              });
            } else {
              ctrl.$setViewValue(' ');
            }
          };
          elem.bind('click', triggerFunc);
        }
      };
    }]);

}());

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
        async.series(series,function(err,results) {

          if (err) {
            reject(err);
          } else {
            resolve(data,results);
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

'use strict';

(function () {

  function saDebug () {

    function log (ns) {
      return window.debug (ns);
    }

    return {
      log: log
    };

  }

  angular.module('sistemium.services')
    .service('saDebug', saDebug);

})();

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

/**
 * Service to wrap generic HTTP status specified helper methods. Currently this service has
 * following methods available:
 *
 *  httpStatusService.getStatusCodeText(httpStatusCode);
 */
(function() {
  angular.module('sistemium.services')
    .factory('saHttpStatusService',
      function factory() {
        return {
          /**
           * Getter method for HTTP status message by given status code.
           *
           * @param   {Number}  statusCode  HTTP status code
           *
           * @returns {String}              Status message
           */
          getStatusCodeText: function getStatusCodeText(statusCode) {
            var output = '';
            /* jshint ignore:start */
            switch (parseInt(statusCode.toString(), 10)) {
              // 1xx Informational
              case 100:
                output = 'Continue';
                break;
              case 101:
                output = 'Switching Protocols';
                break;
              case 102:
                output = 'Processing (WebDAV; RFC 2518)';
                break;
              // 2xx Success
              case 200:
                output = 'OK';
                break;
              case 201:
                output = 'Created';
                break;
              case 202:
                output = 'Accepted';
                break;
              case 203:
                output = 'Non-Authoritative Information (since HTTP/1.1)';
                break;
              case 204:
                output = 'No Content';
                break;
              case 205:
                output = 'Reset Content';
                break;
              case 206:
                output = 'Partial Content';
                break;
              case 207:
                output = 'Multi-Status (WebDAV; RFC 4918)';
                break;
              case 208:
                output = 'Already Reported (WebDAV; RFC 5842)';
                break;
              case 226:
                output = 'IM Used (RFC 3229)';
                break;
              // 3xx Redirection
              case 300:
                output = 'Multiple Choices';
                break;
              case 301:
                output = 'Moved Permanently';
                break;
              case 302:
                output = 'Found';
                break;
              case 303:
                output = 'See Other';
                break;
              case 304:
                output = 'Not Modified';
                break;
              case 305:
                output = 'Use Proxy';
                break;
              case 306:
                output = 'Switch Proxy';
                break;
              case 307:
                output = 'Temporary Redirect';
                break;
              case 308:
                output = 'Permanent Redirect (Experimental RFC; RFC 7238)';
                break;
              // 4xx Client Error
              case 400:
                output = 'Bad Request';
                break;
              case 401:
                output = 'Unauthorized';
                break;
              case 402:
                output = 'Payment Required';
                break;
              case 403:
                output = 'Forbidden';
                break;
              case 404:
                output = 'Not Found';
                break;
              case 405:
                output = 'Method Not Allowed';
                break;
              case 406:
                output = 'Not Acceptable';
                break;
              case 407:
                output = 'Proxy Authentication Required';
                break;
              case 408:
                output = 'Request Timeout';
                break;
              case 409:
                output = 'Conflict';
                break;
              case 410:
                output = 'Gone';
                break;
              case 411:
                output = 'Length Required';
                break;
              case 412:
                output = 'Precondition Failed';
                break;
              case 413:
                output = 'Request Entity Too Large';
                break;
              case 414:
                output = 'Request-URI Too Long';
                break;
              case 415:
                output = 'Unsupported Media Type';
                break;
              case 416:
                output = 'Requested Range Not Satisfiable';
                break;
              case 417:
                output = 'Expectation Failed';
                break;
              case 418:
                output = 'I\'m a teapot (RFC 2324)';
                break;
              case 419:
                output = 'Authentication Timeout (not in RFC 2616)';
                break;
              case 420:
                output = 'Method Failure (Spring Framework) / Enhance Your Calm (Twitter)';
                break;
              case 422:
                output = 'Unprocessable Entity (WebDAV; RFC 4918)';
                break;
              case 423:
                output = 'Locked (WebDAV; RFC 4918)';
                break;
              case 424:
                output = 'Failed Dependency (WebDAV; RFC 4918)';
                break;
              case 426:
                output = 'Upgrade Required';
                break;
              case 428:
                output = 'Precondition Required (RFC 6585)';
                break;
              case 429:
                output = 'Too Many Requests (RFC 6585)';
                break;
              case 431:
                output = 'Request Header Fields Too Large (RFC 6585)';
                break;
              case 440:
                output = 'Login Timeout (Microsoft)';
                break;
              case 444:
                output = 'No Response (Nginx)';
                break;
              case 449:
                output = 'Retry With (Microsoft)';
                break;
              case 450:
                output = 'Blocked by Windows Parental Controls (Microsoft)';
                break;
              case 451:
                output = 'Unavailable For Legal Reasons (Internet draft) / Redirect (Microsoft)';
                break;
              case 494:
                output = 'Request Header Too Large (Nginx)';
                break;
              case 495:
                output = 'Cert Error (Nginx)';
                break;
              case 496:
                output = 'No Cert (Nginx)';
                break;
              case 497:
                output = 'HTTP to HTTPS (Nginx)';
                break;
              case 498:
                output = 'Token expired/invalid (Esri)';
                break;
              case 499:
                output = 'Client Closed Request (Nginx) / Token required (Esri)';
                break;
              // 5xx Server Error
              case 500:
                output = 'Internal Server Error';
                break;
              case 501:
                output = 'Not Implemented';
                break;
              case 502:
                output = 'Bad Gateway';
                break;
              case 503:
                output = 'Service Unavailable';
                break;
              case 504:
                output = 'Gateway Timeout';
                break;
              case 505:
                output = 'HTTP Version Not Supported';
                break;
              case 506:
                output = 'Variant Also Negotiates (RFC 2295)';
                break;
              case 507:
                output = 'Insufficient Storage (WebDAV; RFC 4918)';
                break;
              case 508:
                output = 'Loop Detected (WebDAV; RFC 5842)';
                break;
              case 509:
                output = 'Bandwidth Limit Exceeded (Apache bw/limited extension)';
                break;
              case 510:
                output = 'Not Extended (RFC 2774)';
                break;
              case 511:
                output = 'Network Authentication Required (RFC 6585)';
                break;
              case 520:
                output = 'Origin Error (Cloudflare)';
                break;
              case 521:
                output = 'Web server is down (Cloudflare)';
                break;
              case 522:
                output = 'Connection timed out (Cloudflare)';
                break;
              case 523:
                output = 'Proxy Declined Request (Cloudflare)';
                break;
              case 524:
                output = 'A timeout occurred (Cloudflare)';
                break;
              case 598:
                output = 'Network read timeout error (Unknown)';
                break;
              case 599:
                output = 'Network connect timeout error (Unknown)';
                break;
              default:
                output = 'Unknown HTTP status \'' + statusCode + '\', what is this?';
                break;
            }
            /* jshint ignore:end */

            return output;
          }
        };
      }
    )
  ;
}());

/**
 * Simple service to activate noty2 message to GUI. This service can be used every where in application. Generally
 * all $http queries uses this service to show specified errors to user.
 *
 * Service can be used as in following examples (assuming that you have inject this service to your controller):
 *  Message.success(message, [title], [options]);
 *  Message.error(message, [title], [options]);
 *  Message.message(message, [title], [options]);
 *
 * Feel free to be happy and code some awesome stuff!
 */
(function () {

  angular.module('sistemium.services')
    .factory('saMessageService', ['toastr', function factory(toastr) {
      var service = {};

      /**
       * Private helper function to make actual message via toastr component.
       *
       * @param   {string}  message         Message content
       * @param   {string}  title           Message title
       * @param   {{}}      options         Message specified options
       * @param   {{}}      defaultOptions  Default options for current message type
       * @param   {string}  type            Message type
       * @private
       */
      function _makeMessage(message, title, options, defaultOptions, type) {
        title = title || '';
        options = options || {};

        toastr[type](message, title, _.assign(defaultOptions, options));
      }

      /**
       * Method to generate 'success' message.
       *
       * @param   {string}  message   Message content
       * @param   {string}  [title]   Message title
       * @param   {{}}      [options] Message options
       */
      service.success = function success(message, title, options) {
        var defaultOptions = {
          timeOut: 2000
        };

        _makeMessage(message, title, options, defaultOptions, 'success');
      };

      /**
       * Method to generate 'info' message.
       *
       * @param   {string}  message   Message content
       * @param   {string}  [title]   Message title
       * @param   {{}}      [options] Message options
       */
      service.info = function error(message, title, options) {
        var defaultOptions = {
          timeout: 3000
        };

        _makeMessage(message, title, options, defaultOptions, 'info');
      };

      /**
       * Method to generate 'warning' message.
       *
       * @param   {string}  message   Message content
       * @param   {string}  [title]   Message title
       * @param   {{}}      [options] Message options
       */
      service.warning = function error(message, title, options) {
        var defaultOptions = {
          timeout: 3000
        };

        _makeMessage(message, title, options, defaultOptions, 'warning');
      };

      /**
       * Method to generate 'error' message.
       *
       * @param   {string}  message   Message content
       * @param   {string}  [title]   Message title
       * @param   {{}}      [options] Message options
       */
      service.error = function error(message, title, options) {
        var defaultOptions = {
          timeout: 4000
        };

        _makeMessage(message, title, options, defaultOptions, 'error');
      };

      return service;
    }])
  ;
}());

'use strict';

angular.module('sistemium.services')
  .service('saSockets', ['$rootScope', '$q', function ($rootScope, $q) {

    var socket = window.io({
      autoConnect: false,
      path: '/socket.io-client'
    });

    var jsDataPrefix;

    function init(app) {
      socket.io.uri = app.url.socket;
      socket.open();
      jsDataPrefix = app.jsDataPrefix || '';
    }

    function wrappedOn (eventName, callback) {
      var wrappedCallback = function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      };
      socket.on(eventName, wrappedCallback);
      return function unSubscribe() {
        socket.removeListener(eventName, wrappedCallback);
      };
    }

    function emit (eventName, data, callback) {

      if ((angular.isFunction(data)) && !callback) {
        if (!socket.connected) {
          return data.apply(socket, [{
            error: 'Нет подключения к серверу'
          }]);
        }
        socket.emit(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (data) {
              data.apply(socket, args);
            }
          });
        });
      } else {
        // if (!socket.connected) {
        //   return callback && callback.apply(socket, [{
        //     error: 'Нет подключения к серверу'
        //   }]);
        // }
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    }

    function emitQ (eventName, data) {

      var q = $q.defer();

      emit (eventName, data, function (reply) {
        if (!reply) {
          q.resolve();
        } else if (reply.data) {
          q.resolve(reply.data);
        } else if (reply.error) {
          q.reject(reply);
        }
      });

      return q.promise;
    }

    var subscriptions = [];

    function onJsData (event,callback) {

      return wrappedOn (event, function (msg) {

        if (angular.isString(msg.resource)) {
          msg.resource = msg.resource.replace(jsDataPrefix,'');
        }

        callback (msg);

      });

    }

    function jsDataSubscribe (filter) {

      var subscription = {
        id: true,
        originalFilter: filter,
        filter: _.map(filter,function (f) {
          return jsDataPrefix + f;
        })
      };

      subscriptions.push (subscription);

      emitQ ('jsData:subscribe', subscription.filter)
        .then(function(id){
          subscription.id = id;
        });

      return function () {
        if (subscription.id) {
          emit ('jsData:unsubscribe', subscription.id);
          subscriptions.splice (subscriptions.indexOf(subscription),1);
        }
      };

    }

    $rootScope.$on('$destroy', $rootScope.$on('socket:authorized',function(){

      _.each(subscriptions,function (subscription) {
        if (subscription.id) {
          emitQ('jsData:subscribe', subscription.filter)
            .then(function (id) {
              subscription.id = id;
            });
        }
      });

    }));


    return {

      io: socket,

      init: init,
      emit: emit,
      emitQ: emitQ,
      on: wrappedOn,

      jsDataSubscribe: jsDataSubscribe,
      onJsData: onJsData,

      removeAllListeners: function () {
        socket.removeAllListeners();
      },

      removeListener: function (event, fn) {
        socket.removeListener(event, fn);
      }

    };

  }]);

'use strict';

(function () {

  /**
   * The Util service is for thin, globally reusable, utility functions
   */
  function UtilService($window) {
    var Util = {
      /**
       * Return a callback or noop function
       *
       * @param  {Function|*} cb - a 'potential' function
       * @return {Function}
       */
      safeCb: function (cb) {
        return (angular.isFunction(cb)) ? cb : angular.noop;
      },

      /**
       * Parse a given url with the use of an anchor element
       *
       * @param  {String} url - the url to parse
       * @return {Object}     - the parsed url, anchor element
       */
      urlParse: function (url) {
        var a = document.createElement('a');
        a.href = url;

        // Special treatment for IE, see http://stackoverflow.com/a/13405933 for details
        if (a.host === '') {
          a.href = a.href;
        }

        return a;
      },

      /**
       * Test whether or not a given url is same origin
       *
       * @param  {String}           url       - url to test
       * @param  {String|String[]}  [origins] - additional origins to test against
       * @return {Boolean}                    - true if url is same origin
       */
      isSameOrigin: function (url, origins) {
        url = Util.urlParse(url);
        origins = (origins && [].concat(origins)) || [];
        origins = origins.map(Util.urlParse);
        origins.push($window.location);
        origins = origins.filter(function (o) {
          return url.hostname === o.hostname &&
            url.port === o.port &&
            url.protocol === o.protocol;
        });
        return (origins.length >= 1);
      }
    };

    return Util;
  }

  angular.module('sistemium.util')
    .factory('Util', UtilService);

})();
