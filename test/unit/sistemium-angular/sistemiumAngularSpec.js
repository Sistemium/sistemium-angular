'use strict';

describe('', function() {

  var module;
  var dependencies;
  dependencies = [];

  var hasModule = function(module) {
  return dependencies.indexOf(module) >= 0;
  };

  beforeEach(function() {

  // Get module
  module = angular.module('sistemiumAngular');
  dependencies = module.requires;
  });

  it('should load dependencies module', function() {
    expect(hasModule('sistemiumAngular.dependencies')).to.be.ok;
  });

  it('should load config module', function() {
    expect(hasModule('sistemiumAngular.config')).to.be.ok;
  });


  it('should load filters module', function() {
    expect(hasModule('sistemiumAngular.filters')).to.be.ok;
  });



  it('should load directives module', function() {
    expect(hasModule('sistemiumAngular.directives')).to.be.ok;
  });



  it('should load services module', function() {
    expect(hasModule('sistemiumAngular.services')).to.be.ok;
  });


});
