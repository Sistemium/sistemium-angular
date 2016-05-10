(function() {

  function config(toastrConfig) {

    angular.extend (toastrConfig,{
      allowHtml: true,
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      progressBar: false,
      iconClasses: {
        error: 'alert alert-danger',
        info: 'alert alert-info',
        success: 'alert alert-success',
        warning: 'alert alert-warning'
      }
    });

  }

  angular
    .module('sistemium.dependencies')
    .config(['toastrConfig', config]);

})();
