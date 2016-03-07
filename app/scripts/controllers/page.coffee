'use strict'
angular.module('sc2App').controller 'pageCtrl', ($scope, $window, $state, UserService, SoundCloudService, ContentService, $localStorage, HelperService, appVersion) ->

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

    $scope.nav = (tab) ->
        $scope.activeTab = tab
        $state.go tab, {},
            reload: false

    $scope.$on '$stateChangeSuccess', ->
        $scope.activeTab = $state.current.url.replace('/', '') #temporary

    $scope.getTimes = (n) ->
        new Array(n)

