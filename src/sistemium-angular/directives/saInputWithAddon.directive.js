(function () {

  angular.module('sistemium')
    .directive('saInputWithAddon', function () {
      return {

        restrict: 'AC',
        template: '' +
        '<div class="input-group">' +
        '<div class="input-group-btn" uib-dropdown is-open="vm.isOpen">' +
        '<button class="button btn btn-default" type="button" uib-dropdown-toggle>{{saSelectModel[saLabelProp]}} ' +
        '<span class="caret"></span>' +
        '</button>' +
        '<ul class="dropdown-menu">' +
        '<li ng-repeat="item in saSelectOptions">' +
        '<a href="" ng-click="vm.setActiveItem(item)">{{item[saLabelProp]}}</a>' +
        '</li>' +
        '</ul>' +
        '<input class="form-control" ng-model="saInputModel" type="number" ng-required="required"/>',
        replace: true,
        scope: {
          saSelectModel: '=',
          saInputModel: '=',
          saLabelProp: '@',
          saValueProp: '@',
          saSelectOptions: '=',
          required: '@'
        },

        controller: function ($scope) {

          var vm = this;
          vm.setActiveItem = function (item) {
            $scope.saSelectModel = item;
          };

        },
        controllerAs: 'vm'

      };
    })
  ;

})();
