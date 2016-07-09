(function() {
  'use strict';

  window.app = angular.module('fileBrowserApp', ['ngRoute', 'jsTree.directive']).
  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/', {
        templateUrl: '../partials/home.html',
        controller: 'HomeCtrl'
      }).
      otherwise({
        redirectTo: '/home'
      });
    }
  ]);
  //chttp://jsfiddle.net/JeJenny/ZG9re/
  window.app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

window.app.service('fileUpload', ['$http', function ($http) {
  this.uploadFileToUrl = function(file, uploadUrl){
      var fd = new FormData();
      fd.append('file', file);
      $http.post(uploadUrl, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
      })
      .success(function(){
          window.location.reload();
      })
      .error(function(err){
        console.log(err);
      });
  }
}]);

}());
