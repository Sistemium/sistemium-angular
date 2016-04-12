'use strict';

describe('', function () {

  var module, dependenciesModule;
  var dependencies, moduleDependencies;
  dependencies = [];


  var hasModule = function (module) {
    return dependencies.indexOf(module) >= 0;
  };

  var hasDepModule = function (module) {
    return moduleDependencies.indexOf(module) >= 0;
  };

  beforeEach(function () {

    // Get module
    module = angular.module('sistemium');
    dependencies = module.requires;
  });

  before(function () {

    dependenciesModule = angular.module('sistemium.dependencies');
    moduleDependencies = dependenciesModule.requires;
  });

  it('should load dependencies module', function () {
    expect(hasModule('sistemium.dependencies')).to.be.ok;
  });

  it('should load injected dependencies', function () {
    expect(hasDepModule('toastr')).to.be.ok;
    expect(hasDepModule('ngTable')).to.be.ok;
    expect(hasDepModule('js-data')).to.be.ok;
  });

  it('should load config module', function () {
    expect(hasModule('sistemium.config')).to.be.ok;
  });


  it('should load filters module', function () {
    expect(hasModule('sistemium.filters')).to.be.ok;
  });


  it('should load directives module', function () {
    expect(hasModule('sistemium.directives')).to.be.ok;
  });


  it('should load services module', function () {
    expect(hasModule('sistemium.services')).to.be.ok;
  });

  it('should load models module', function () {
    expect(hasModule('sistemium.models')).to.be.ok;
  })

});
