'use strict';

/* Filters */
var appFilters= angular.module('appFilters', []);
appControllers.filter('capitalize', function() {
 return function(input, scope) {
 if (input!=null)
 //input = input.toLowerCase();
 return input.substring(0,1).toUpperCase()+input.substring(1);
 }
});