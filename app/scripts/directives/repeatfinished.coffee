'use strict'

angular.module('sc2App').directive 'repeatFinished', ($timeout) ->
    {
        restrict: 'A'
        link: ($scope) ->
            if $scope.$last == true
                $timeout ->
                    $scope.$emit 'ngRepeatFinished'
    }

