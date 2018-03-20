'use strict';

angular.module('sistemium.services')
  .service('saSockets', ['$rootScope', '$q', function ($rootScope, $q) {

    var socket;

    var jsDataPrefix;

    function init(app) {
      socket = window.io(app.url.socket, {
        path: '/socket.io-client'
      });
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
      if (eventName === 'connect' && socket.connected) {
        callback.apply(socket);
      }
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

      return $q((resolve, reject) => {

        emit (eventName, data, reply => {

          if (!reply) {
            resolve();
          } else if (reply.data) {
            resolve(reply.data);
          } else if (reply.error) {
            reject(reply);
          }

        });

      });


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
