(function() {
  'use strict';

  app.controller('HomeCtrl', ['$scope', 'FetchFileFactory','$location','fileUpload',
    function($scope, FetchFileFactory,$location,fileUpload) {
      $scope.uploadFile = function(){
        var file = $scope.myFile;
        console.log('file is ' );
        console.dir(file);
        var uploadUrl = $location.absUrl(); // will tell you the current path
        uploadUrl = uploadUrl.substr(0, uploadUrl.length - 2);
        uploadUrl = uploadUrl + 'upload';
        console.log(uploadUrl);
        fileUpload.uploadFileToUrl(file, uploadUrl);
    };
    $scope.fileViewer = 'Please select a file to download';
      $scope.nodeSelected = function(e, data) {
        var _l = data.node.li_attr;
        if (_l.isLeaf) {
          console.log(_l);
          var leafname= _l.id.split('\\').pop().split('/').pop();
          console.log(leafname);
          var path = $location.absUrl(); // will tell you the current path
          path = path.substr(0, path.length - 2);
          console.log(path);
          var url = path + 'download/' + leafname;
          console.log(url);
          window.open(url, 'Download');

          /*
          FetchFileFactory.fetchFile(_l.base).then(function(data) {
            var _d = data.data;
            if (typeof _d == 'object') {

              //http://stackoverflow.com/a/7220510/1015046//
              _d = JSON.stringify(_d, undefined, 2);
            }
            $scope.fileViewer = _d;
          });*/
        } else {

          //http://jimhoskins.com/2012/12/17/angularjs-and-apply.html//
          $scope.$apply(function() {
            $scope.fileViewer = 'Please select a file to download';
          });
        }
      };
    }
  ]);

}());
