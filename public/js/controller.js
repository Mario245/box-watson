/* global angular */

angular.module("BluemixLightShow")

.controller("FilesController", function ($scope, $http, _, $sce) {
    $scope.files = undefined;
    $scope.filteredFiles = undefined;

    function getFiles() {
        $http.get("/api/v1/files").
        success(function(data, status, headers, config) {
            $scope.files = data;

            // Asynchronously get description for the files
            for (var i=0; i < $scope.files.length; i++) {
                $http.get("/api/v1/fileInfo/" + $scope.files[i].id + "/" + i.toString()).
                    success(function(data) {
                        $scope.files[data.iterator].description = data.description;
                    }).
                    error(function(data) {
                        $scope.error = true;
                        $scope.errorMessage = data.message;
                    });
            }

            $scope.filteredFiles = data;
            $scope.error = false;
            $scope.chunkedData = chunk($scope.files, 3);
        }).
        error(function(data, status, headers, config) {
            $scope.error = true;
            $scope.errorMessage = data.message;
        });
    }

    $scope.getPersonality = function() {
        var self = this;

        if (!this.file.personality) {
            $http.get("/api/v1/personality/" + this.file.id).
            success(function(data, status, headers, config) {
                console.log(data.tree.children[0].children[0].children);
                self.file.personality = data;
                //self.file.personalityTop5 =
            });
        }
    };

    getFiles();
    /* Asynchronously get description for the files
    for (var i=0; i < $scope.files.length; i++) {
        $http.get("/api/v1/fileInfo/" + $scope.files[i].id).
            success(function(data) {
                $scope.files[i].description = data.description;
            }).
            error(function(data) {
                $scope.error = true;
                $scope.errorMessage = data.message;
            });
    }*/

    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    };

    function chunk(arr, size) {
        var newArr = [];
        for (var i=0; i<arr.length; i+=size) {
            newArr.push(arr.slice(i, i+size));
        }
        return newArr;
    }

    $scope.$watch('file', function(filename){
        if (filename === "") {
            $scope.files = undefined;
            getFiles();
        }
        else {
            if (filename)
                filename = filename.toLowerCase();
            $scope.filteredFiles = _.filter($scope.files, function(file){
                if (file.name.toLowerCase().indexOf(filename) !== -1) {
                    return true;
                }
                else {
                    return false;
                }
            });
            $scope.chunkedData = chunk($scope.filteredFiles, 3);
        }
    });
})
.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}]);
