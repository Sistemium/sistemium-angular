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
  module = angular.module('sistemium');
  dependencies = module.requires;
  });

  it('should load dependencies module', function() {
    expect(hasModule('sistemium.dependencies')).to.be.ok;
  });

  it('should load config module', function() {
    expect(hasModule('sistemium.config')).to.be.ok;
  });


  it('should load filters module', function() {
    expect(hasModule('sistemium.filters')).to.be.ok;
  });



  it('should load directives module', function() {
    expect(hasModule('sistemium.directives')).to.be.ok;
  });



  it('should load services module', function() {
    expect(hasModule('sistemium.services')).to.be.ok;
  });


});
