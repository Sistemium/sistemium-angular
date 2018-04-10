'use strict';

(function () {

  function selectOnFocus($window, $timeout) {
    return {

      restrict: 'A',

      link: function (scope, element) {

        let focused = false;

        element.on('focus', function () {

          if (focused) {
            return;
          }

          focused = true;

          $timeout(100)
            .then(() => {
              if (!$window.getSelection().toString()) {
                // Required for mobile Safari
                this.setSelectionRange(0, this.value.length)
              }
            })

        });

        element.on('blur', function () {
          focused = false;
        });


      }

    };
  }

  angular.module('sistemium.directives')
    .directive('selectOnFocus', selectOnFocus);

})();
