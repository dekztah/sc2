'use strict'

angular.module('sc2App').directive 'theme', (localStorageService) ->
    {
        restrict: 'A'
        link: ($scope) ->
            $scope.theme = localStorageService.get('theme') or
                bgr: 'default'
                color: 'light'

            $scope.toggleThemeChanger = ->
                $scope.themeChanger = !$scope.themeChanger

            $scope.changeTheme = (theme, scheme) ->
                if scheme
                    $scope.theme.color = theme
                else
                    $scope.theme.bgr = theme
                localStorageService.set 'theme', $scope.theme
    }
