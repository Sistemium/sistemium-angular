'use strict';

(function () {

  angular.module('sistemium.services')
    .service('saSockets', ['$rootScope', '$q', saSockets]);


  function saSockets($rootScope, $q) {

    let socket;

    let jsDataPrefix;

    function init(app) {
      socket = window.io(app.url.socket, {
        path: '/socket.io-client'
      });
      jsDataPrefix = app.jsDataPrefix || '';
    }

    function wrappedOn(eventName, callback) {

      function wrappedCallback() {

        let args = arguments;

        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });

      }

      socket.on(eventName, wrappedCallback);

      if (eventName === 'connect' && socket.connected) {
        callback.apply(socket);
      }

      return function unSubscribe() {
        socket.removeListener(eventName, wrappedCallback);
      };

    }

    function emit(eventName, data, callback) {

      if (angular.isFunction(data) && !callback) {

        if (!socket.connected) {
          return data.apply(socket, [{
            error: 'Нет подключения к серверу'
          }]);
        }

        socket.emit(eventName, function () {

          let args = arguments;

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

          let args = arguments;

          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });

        });
      }
    }

    function emitQ(eventName, data) {

      return $q((resolve, reject) => {

        emit(eventName, data, reply => {

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

    const subscriptions = [];

    function onJsData(event, callback) {

      return wrappedOn(event, function (msg) {

        if (angular.isString(msg.resource)) {
          msg.resource = msg.resource.replace(jsDataPrefix, '');
        }

        callback(msg);

      });

    }

    function jsDataSubscribe(filter) {

      let subscription = {
        id: true,
        originalFilter: filter,
        filter: _.map(filter, function (f) {
          return jsDataPrefix + f;
        })
      };

      subscriptions.push(subscription);

      emitQ('jsData:subscribe', subscription.filter)
        .then(function (id) {
          subscription.id = id;
        });

      return function () {
        if (subscription.id) {
          emit('jsData:unsubscribe', subscription.id);
          subscriptions.splice(subscriptions.indexOf(subscription), 1);
        }
      };

    }

    $rootScope.$on('$destroy', $rootScope.$on('socket:authorized', function () {

      _.each(subscriptions, function (subscription) {
        if (subscription.id) {
          emitQ('jsData:subscribe', subscription.filter)
            .then(function (id) {
              subscription.id = id;
            });
        }
      });

    }));


    return {

      // io: socket,

      init,
      emit,
      emitQ,
      on: wrappedOn,

      jsDataSubscribe,
      onJsData: onJsData,

      removeAllListeners: () => socket.removeAllListeners(),
      removeListener: (event, fn) => socket.removeListener(event, fn)

    };

  }

})();
