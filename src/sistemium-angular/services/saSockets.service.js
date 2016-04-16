'use strict';

angular.module('sistemium.services')
  .service('saSockets', function ($rootScope, $q) {

    var socket = window.io({
      autoConnect: false,
      path: '/socket.io-client'
    });

    function init(app) {
      socket.io.uri = app.url.socket;
      socket.open();
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

    function jsDataSubscribe (filter) {

      var subscription = {};

      emitQ ('jsData:subscribe', filter)
        .then(function(id){
          subscription.id = id;
          subscription.filter = filter;
          subscriptions.push (subscription);
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
      jsDataSubscribe: jsDataSubscribe,

      on: function (eventName, callback) {
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
      },

      removeAllListeners: function () {
        socket.removeAllListeners();
      },

      removeListener: function (event, fn) {
        socket.removeListener(event, fn);
      }

    };

  });
