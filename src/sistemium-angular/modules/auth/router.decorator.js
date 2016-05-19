'use strict';

(function() {

angular.module('sistemium.auth')
  .run(function($rootScope, $state, saAuth, sabErrorsService) {
    // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role
    $rootScope.$on('$stateChangeStart', function(event, next) {
      sabErrorsService.clear();
      if (!next.authenticate) {
        return;
      }

      if (typeof next.authenticate === 'string') {
        saAuth.hasRole(next.authenticate, _.noop).then(function (has) {
          if (has) {
            return;
          }

          event.preventDefault();
          return saAuth.isLoggedIn(_.noop).then(function (is) {
            $state.go(is ? 'main' : 'login');
          });
        });
      } else {
        saAuth.isLoggedIn(_.noop).then(function (is) {
          if (is) {
            return;
          }

          event.preventDefault();
          $state.go('main');
        });
      }
    });
  });

})();
