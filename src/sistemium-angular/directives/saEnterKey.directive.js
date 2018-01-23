(function () {

  angular.module('sistemium.directives')
    .directive('saEnterKey', saEnterKeyDirective);


  function saEnterKeyDirective() {

    return function (scope, element, attrs) {

      element.bind('keydown keypress', onKeyPress);

      function onKeyPress(e) {

        if (e.which === 13) {

          e.preventDefault();
          scope.$apply(() => scope.$eval(attrs.saEnterKey));

        }

      }

    };

  }

})();
