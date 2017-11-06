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
    let requestIdCounter = 0;

    const messageHandlers = _.get($window, 'stmAndroid') || _.get($window, 'webkit.messageHandlers');

    function isIos() {
      return !!$window.webkit || !!$window.stmAndroid;
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

      if (messageHandlers && messageHandlers[name] && messageHandlers[name].postMessage){

        return messageHandlers[name];

      }

      if (messageHandlers[name]){

        return {
          postMessage: function (options) {

            let jsonOptions = options ? JSON.stringify(options) : undefined;

            messageHandlers[name](jsonOptions)

          }}

      }

      return {
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

        requestIdCounter = requestIdCounter + 2;

        let requestId = requestIdCounter;

        const msg = _.assign({
          requestId,
          callback: CALLBACK,
          options: {requestId}
        }, cfg);

        messages[requestId] = {resolve: resolve, reject: reject, msg: msg};

        handler(handlerName).postMessage(msg);

        if (cfg && cfg.timeout) {
          $timeout(cfg.timeout)
            .then(() => {
              delete messages[requestId];
              reject({error: handlerName + ' request timeout'});
            });
        }

      });

    }

    function messageCallback(res, req) {

      const msg = messages[req.requestId];

      if (!msg) {
        return;
      }

      let {status} = req;

      if (!status) {
        status = _.isArray(res) ? 'resolve' : 'reject';
      }

      deb(status, req, res);

      if (status === 'resolve') {
        res = _.isArray(res) ? _.first(res) : res;
      }

      msg[status](res);

      delete messages[req.requestId];

    }


    $window[CALLBACK] = messageCallback;


    function iosCallback(status, data, req) {

      req.status = status;

      return messageCallback(data, req);

    }


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

    function saveImage(entityName, data, imageData) {
      return message('saveImage', {
        entityName,
        data,
        imageData
      });
    }

    function copyToClipboard(text) {
      return message('copyToClipboard', {
        text: text
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
      saveImage,
      copyToClipboard,

      iosCallback

    };

  }

  angular.module('sistemium.services')
    .service('IOS', IOS);

})();
