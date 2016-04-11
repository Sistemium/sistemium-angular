(function () {

  angular.module('sistemium.directives')
    .directive('saErrorWidget', function () {

      return {

        restrict: 'AC',
        template: '<div ng-show="dm.errors.length">' +
        '<uib-alert ng-repeat="error in dm.errors" type="{{error.type}}" close="dm.closeError($index)">' +
        '{{error.msg}}</uib-alert>' +
        '</div>',
        controllerAs: 'dm',

        controller: function (saErrors) {
          var dm = this;
          dm.errors =  saErrors.errors;
          dm.closeError = function (index) {
            dm.errors.splice(index, 1);
          };
        }

      };

    });
}());
