'use strict'
angular.module('sc2App').controller 'pageCtrl', ($scope, $window, UserService, SoundCloudService, ContentService, localStorageService, HelperService, appVersion) ->

    $scope.user = UserService.userObj
    $scope.info = appVersion

    if $scope.user
        $scope.user.lastFetch = HelperService.customDate(ContentService.lastFetch, 'ago')

    $scope.$on 'userStateChanged', ->
        $scope.user = UserService.userObj

    $scope.connect = ->
        SoundCloudService.connect().then (data) ->
            $scope.$broadcast 'connected'

    $scope.logout = ->
        UserService.logout()
        $window.location.reload()

    $scope.streamFilter =
        title: ''
        repost: ''
        singleTrackPlaylist: ''

    # localStorageService.bind($scope, 'streamFilter.repost')
    # localStorageService.bind($scope, 'streamFilter.singleTrackPlaylist')

    $scope.setTab = (tab) ->
        $scope.activeTab = tab

    $scope.getTimes = (n) ->
        new Array(n)

    $scope.setTab 'stream'
