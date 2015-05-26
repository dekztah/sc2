'use strict';

angular.module('sc2App').directive('repeatFinished', function ($timeout) {
    return {
        restrict: 'A',
        link: function($scope) {
            if ($scope.$last === true) {
                $timeout(function () {
                    $scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
});
