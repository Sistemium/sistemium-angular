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
  angular.module('sistemiumAngular.directives', []);
  angular.module('sistemiumAngular.filters', []);
  angular.module('sistemiumAngular.services', []);
  angular.module('sistemiumAngular.dependencies', [
    'ui.bootstrap',
    'ngTable',
    'toastr'
  ]);
  angular.module('sistemiumAngular',
    [
      'sistemiumAngular.dependencies',
      'sistemiumAngular.config',
      'sistemiumAngular.directives',
      'sistemiumAngular.filters',
      'sistemiumAngular.services'
    ]);

})(angular);
