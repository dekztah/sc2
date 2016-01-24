'use strict'
angular.module('sc2App').controller 'pageCtrl', ($scope, $window, UserService, SoundCloudService, ContentService, $localStorage, HelperService, appVersion) ->

    $scope.user = UserService.userObj
    $scope.info = appVersion

    $localStorage.$default(
        settings:
            streamFilter:
                repost: ''
                singleTrackPlaylist: ''
            theme:
                bgr: 'default'
                color: 'light'
            autoAdvance: false
    )

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

    $scope.streamFilter = $localStorage.settings.streamFilter
    $scope.streamFilter.title = ''

    $scope.settings = $localStorage.settings

    $scope.setTab = (tab) ->
        $scope.activeTab = tab

    $scope.getTimes = (n) ->
        new Array(n)

    $scope.setTab 'stream'
