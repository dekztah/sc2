'use strict'
angular.module('sc2App').controller 'pageCtrl', ($scope, UserService, SoundCloudService, contentService, localStorageService, HelperService) ->

    $scope.user = UserService.userObj
    $scope.user.lastFetch = HelperService.customDate(contentService.lastFetch, 'ago')

    $scope.$on 'userStateChanged', ->
        $scope.user = UserService.userObj

    $scope.connect = ->
        soundCloudService.connect().then (data) ->
            $scope.$broadcast 'connected'

    $scope.logout = ->
        UserService.logout()
        $window.location.reload()

    localStorageService.bind($scope, 'settings.showReposts')

    $scope.controls =
        toggleReposts: ->
            $scope.settings.showReposts = !$scope.settings.showReposts
            # $scope.helpers.getNewCount()

    $scope.setTab = (tab) ->
        $scope.activeTab = tab

    $scope.getTimes = (n) ->
        new Array(n)

    $scope.setTab 'stream'
