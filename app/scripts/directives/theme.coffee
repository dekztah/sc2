'use strict'

angular.module('sc2App').directive 'theme', ($localStorage) ->
    {
        restrict: 'A'
        link: ($scope) ->
            $scope.theme = $localStorage.settings.theme

            $scope.toggleThemeChanger = ->
                $scope.themeChanger = !$scope.themeChanger

            $scope.changeTheme = (theme, scheme) ->
                if scheme
                    $scope.theme.color = theme
                else
                    $scope.theme.bgr = theme
    }
