'use strict'
angular.module('sc2App').controller 'pageCtrl', ($scope, $window, UserService, SoundCloudService, ContentService, localStorageService, HelperService) ->

    $scope.user = UserService.userObj
    $scope.user.lastFetch = HelperService.customDate(ContentService.lastFetch, 'ago')

    $scope.$on 'userStateChanged', ->
        $scope.user = UserService.userObj

    $scope.connect = ->
        SoundCloudService.connect().then (data) ->
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
