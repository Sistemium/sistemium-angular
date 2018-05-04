'use strict';

(function () {

  function saAutoFocus($timeout, IOS) {

    let ios = IOS.isIos();

    return {

      restrict: 'A',

      scope: {
        saAutoFocus: '@'
      },

      link: function (_scope, _element) {

        let value = _scope.saAutoFocus;
        let element = _element[0];

        if (value === 'false' || ios){
          return;
        }

        $timeout(100)
          .then(() => {
            element.focus();
            if (value === 'select') {
              element.setSelectionRange(0, element.value.length);
            }
          });

        if (_scope.saAutoFocus !== 'true'){
          return;
        }

        _element.bind('blur', () => {
          $timeout(100)
            .then(() => element.focus());
        });

      }
    };
  }

  angular.module('sistemium.directives')
    .directive('saAutoFocus', saAutoFocus);

})();
