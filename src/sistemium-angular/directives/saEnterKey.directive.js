(function () {

  angular.module('sistemium.directives')
    .directive('saEnterKey', saEnterKeyDirective);


  function saEnterKeyDirective() {

    return function (scope, element, attrs) {

      element.bind('keydown keypress', onKeyPress);

      function onKeyPress($event) {

        if ($event.which === 13) {

          $event.preventDefault();
          scope.$applyAsync(() => {
            scope.$eval(attrs.saEnterKey, {$event, $element: element[0]});
          });

        }

      }

    };

  }

})();
