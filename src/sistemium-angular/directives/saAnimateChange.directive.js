(function () {

  angular.module('sistemium.directives')
    .directive('saAnimateOnChange', ['$animate', '$timeout', saAnimateOnChange]);

  function saAnimateOnChange ($animate,$timeout) {

    return {
      restrict: 'A',
      replace: true,
      link: link
    };

    function link (scope, elem, attr) {
      var cls = attr.changeClass;
      scope.$watch(attr.saAnimateOnChange, function(nv,ov) {
        if ((nv||0) !== (ov||0)) {
          $animate.addClass(elem,cls).then(function() {
            $timeout(function() {
              $animate.removeClass(elem,cls);
            });
          });
        }
      });
    }

  }

})();
