'use strict';

(function () {

  function IOS($window, $q, $timeout) {

    const CHECKIN = 'checkin';
    const CALLBACK = 'iosPhotoCallback';
    const deb = $window.debug('stg:IOS');

    const me = {
      getRoles
    };

    const messages = {};

    let ClientData;
    let id = 0;


    function isIos() {
      return !!$window.webkit;
    }

    function getDevicePlatform() {
      if (isIos() && ClientData) {
        return ClientData.findAll()
          .then(function (data) {
            return _.get(_.first(data), 'devicePlatform') || 'Unknown';
          });
      } else {
        return $q.reject('ClientData not set');
      }
    }

    function handler(name) {

      return $window.webkit.messageHandlers[name] || {
        postMessage: function (options) {

          if (name === 'roles') {
            $window[options.callback]([{
              account: {
                name: 'Error'
              },
              roles: {
                picker: true
              }
            }], options);
          } else {
            throw new Error(`IOS handler undefined call to: "${name}"`);
          }

        }
      };

    }

    function message(handlerName, cfg) {

      return $q(function (resolve, reject) {
        let requestId = ++id;

        const msg = angular.extend({
          callback: CALLBACK,
          requestId: requestId,
          options: {
            requestId: requestId
          }
        }, cfg);

        messages[requestId] = {resolve: resolve, reject: reject, msg: msg};

        handler(handlerName).postMessage(msg);

        if (cfg && cfg.timeout) {
          $timeout(function () {
            delete messages[requestId];
            reject({error: handlerName + ' request timeout'});
          }, cfg.timeout);
        }

      });

    }

    $window[CALLBACK] = function (res, req) {

      const msg = messages[req.requestId];

      if (msg) {
        if (angular.isArray(res)) {
          $timeout(function () {
            deb('resolve', req, res);
            msg.resolve(res[0]);
          });
        } else {
          $timeout(function () {
            deb('reject', req, res);
            msg.reject(res || 'Response is not array');
          });
        }
        delete messages[req.requestId];
      }

    };

    function sendToCameraRoll(image) {

      return message('sendToCameraRoll', {
        imageID: image.id,
        imageURL: image.href
      });

    }

    function loadImage(image) {

      return message('loadImage', {
        imageID: image.id
      });

    }

    function getPicture(id, size) {
      return message('getPicture', {
        id: id,
        size: size || 'thumbnail'
      });
    }

    function takePhoto(entity, data) {
      return message('takePhoto', {
        entityName: entity,
        data: data
      });
    }

    function copyToClipboard(text) {
      return message('copyToClipboard', {
        text:text
      });
    }

    function checkIn(accuracy, data, timeout) {

      return message(CHECKIN, {
        accuracy: accuracy,
        data: data,
        timeout: timeout || 20000
      });

    }

    function getRoles() {
      return message('roles');
    }

    function init(config) {
      ClientData = _.get(config, 'ClientData');
      return me;
    }

    return {

      init,
      isIos,
      handler,
      checkIn,
      takePhoto,
      getPicture,
      getDevicePlatform,
      getRoles,
      sendToCameraRoll,
      loadImage,
      copyToClipboard
    };

  }

  angular.module('sistemium.services')
    .service('IOS', IOS);

})();
