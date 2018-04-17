'use strict';

(function () {

  function PhotoHelper(IOS, Schema, $q, ConfirmModal, toastr, $window) {

    return {
      makePhoto,
      takePhoto,
      importThumbnail,
      thumbnailClick,
      pictureClick,
      getImageSrc,
      actingImageSrc,
      setupModel
    };

    function makePhoto(resourceName, data) {

      return IOS.takePhoto(resourceName, data)
        .then(res => {

          if (!angular.isObject(res)) {
            return $q.reject(res);
          }

          return Schema.model(resourceName).inject(res);

        });

    }

    function takePhoto(resourceName, data, thumbnailCache) {

      let q = IOS.takePhoto(resourceName, data);

      return q.then(res => {

        if (angular.isObject(res)) {

          importThumbnail(Schema.model(resourceName).inject(res), thumbnailCache);
          $q.resolve(res);

        } else {
          $q.reject(res);
        }

      });

    }

    function importThumbnail(picture, cache) {

      return $q((resolve, reject) => {

        if (cache[picture.id]) {
          return resolve(picture);
        }

        getImageSrc(picture, 'thumbnail')
          .then(src => {

            cache[picture.id] = src;
            resolve(picture);

          }, reject);

      });

    }

    function thumbnailClick(resourceName, pic, src, title) {

      ConfirmModal.show(_.assign(pictureClickConfig(pic, src, title, 'resized'), {
        deleteDelegate: () => Schema.model(resourceName).destroy(pic)
      }), {
        templateUrl: 'app/components/modal/PictureModal.html',
        size: 'lg'
      });

    }

    function pictureClick(pic) {

      ConfirmModal.show(
        pictureClickConfig(pic, pic.href, pic.name, 'resized'),
        {
        templateUrl: 'app/components/modal/PictureModal.html',
        size: 'lg'
      });

    }

    function pictureClickConfig(pic, src, title, size) {

      return {

        text: false,
        src: src,
        title: title,

        resolve: ctrl => {

          ctrl.busy = getImageSrc(pic, size)
            .then(src => {
              ctrl.src = src;
            }, () => {

              // console.log(err);
              ctrl.cancel();
              toastr.error('Недоступен интернет', 'Ошибка загрузки изображения');

            });

        }

      }

    }

    function getImageSrc(picture, size) {

      return IOS.supportsPictures() ? IOS.getPicture(picture.id, size)
          .then(function (data) {
            return 'data:image/jpeg;base64,' + data;
          }) : $q(function (resolve) {
          switch (size) {
            case 'resized':
              return resolve(picture.href && picture.href.replace(/(.*\/)(.*)(\..{3,4})$/, '$1smallImage$3'));
            default:
              return resolve(picture.thumbnailHref);
          }
        });

    }

    function actingImageSrc(picture, size) {

      let srcName = size === 'thumbnail' ? 'thumbnailSrc' : 'smallSrc';

      if (picture[srcName]) {
        return picture[srcName];
      }

      if ($window.location.protocol === 'file:') {
        let path = (size === 'thumbnail') ? 'thumbnailPath' : 'resizedImagePath';
        if (picture[path]) {
          return '../../../../pictures/' + picture[path];
        }
      }

      if (picture.href) {
        return picture.href.replace(/([^\/]+)(\.[^.]+$)/g, (match, name, ext) => size + ext);
      }

      return null;

    }

    function setupModel(model) {

      let computed = model.computed || (model.computed = {});

      _.assign(computed, {

        srcThumbnail  : function() {
          return actingImageSrc(this, 'thumbnail');
        },
        srcFullscreen : function() {
          return actingImageSrc(this, 'smallImage');
        }

      });

      return model;

    }

  }

  angular.module('sistemium.services')
    .service('PhotoHelper', PhotoHelper);

})();
