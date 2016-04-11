'use strict';

(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('sistemiumAngular.config', [])
    .value('sistemiumAngular.config', {
      debug: true
    });

  // Modules
  angular.module('sistemiumAngular.dependencies', [
    'ui.bootstrap'
  ]);
  angular.module('sistemiumAngular.directives', []);
  angular.module('sistemiumAngular.filters', []);
  angular.module('sistemiumAngular.services', []);
  angular.module('sistemiumAngular',
    [
      'sistemiumAngular.dependencies',
      'sistemiumAngular.config',
      'sistemiumAngular.directives',
      'sistemiumAngular.filters',
      'sistemiumAngular.services'
    ]);

})(angular);

(function () {

  angular.module('sistemiumAngular.services')
    .service('saErrors', function () {

      var errors = [];

      var msg = {
        unknown: function (lang) {
          switch (lang || 'en') {

            case 'en':
              return 'Unknown error';
            case 'ru':
              return 'Неизвестная ошибка';

          }
        }
      };

      function parseError(e, lang) {

        var data = e && e.data && e.data.length > 0 && e.data ||
            [e]
          ;

        data.forEach (function (errObj) {
          errors.push({
            type: 'danger',
            msg: errObj.message || errObj || msg.unknown(lang)
          });
        });

      }

      function addError(error) {
        parseError(error);
      }

      function clearErrors() {
        errors.splice(0, errors.length);
      }

      return {

        addError: addError,
        clear: clearErrors,
        errors: errors,

        ru: {
          add: function (error) {
            parseError(error, 'ru');
          }
        }

      };
    })
  ;

}());

(function () {

  angular.module('sistemiumAngular.directives')
    .directive('saErrorWidget', function () {

      return {

        restrict: 'AC',
        template: '<div ng-show="dm.errors.length">' +
        '<uib-alert ng-repeat="error in dm.errors" type="{{error.type}}" close="dm.closeError($index)">' +
        '{{error.msg}}</uib-alert>' +
        '</div>',
        controllerAs: 'dm',

        controller: function (Errors) {
          var dm = this;
          dm.errors =  Errors.errors;
          dm.closeError = function (index) {
            dm.errors.splice(index, 1);
          };
        }

      };

    });
}());
