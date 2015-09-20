'use strict'
angular.module('sc2App').controller 'pageCtrl', ($scope, UserService, SoundCloudService, localStorageService) ->

    $scope.user = UserService.userObj

    $scope.$on 'userStateChanged', ->
        $scope.user = UserService.userObj

    $scope.connect = ->
        soundCloudService.connect().then (data) ->
            $scope.$broadcast 'connected'

    $scope.logout = ->
        # localStorageService.remove 'accessToken'
        # localStorageService.remove 'user'
        $window.location.reload()

    localStorageService.bind($scope, 'settings.showReposts')

    $scope.controls =
        toggleReposts: ->
            $scope.settings.showReposts = !$scope.settings.showReposts
            # $scope.helpers.getNewCount()

    $scope.getTimes = (n) ->
        new Array(n)
