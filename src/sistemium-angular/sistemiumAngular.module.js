'use strict';

(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('sistemium.config', [])
    .value('sistemium.config', {
      debug: true
    });

  // Modules
  angular.module('sistemium.directives', []);
  angular.module('sistemium.filters', []);
  angular.module('sistemium.services', []);
  angular.module('sistemium.models', []);
  angular.module('sistemium.dependencies', [
    'toastr',
    'ngTable',
    'js-data',
    'ui.router.stateHelper'
  ]);
  angular.module('sistemium', [
    'sistemium.dependencies',
    'sistemium.config',
    'sistemium.directives',
    'sistemium.filters',
    'sistemium.services',
    'sistemium.models'
  ]);

})(angular);
