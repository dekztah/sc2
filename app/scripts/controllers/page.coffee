'use strict'
angular.module('sc2App').controller 'pageCtrl', ($scope, $rootScope, $document, $window, $state, UserService, SoundCloudService, ContentService, $localStorage, HelperService, appVersion) ->

    $scope.user = UserService.userObj
    $scope.info = appVersion

    $rootScope.status =
        loading: false
        error: false

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

    $scope.content = ContentService.content

    if $scope.user
        $scope.user.lastFetch = HelperService.customDate(HelperService.lastFetch, 'ago')

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

    getPlaylistOrTrackData = (values) ->
        data = undefined
        if !isNaN(values[1])
            data = $scope.content[$scope.activeTab][values[0]].tracks[values[1]]
        else
            data = $scope.content[$scope.activeTab][values[0]]
        data

    # generic helper functions
    $scope.helpers =
        getNewCount: ->
            $scope.newCount = HelperService.getNewCount $scope.content.stream, $scope.streamFilter.repost
            if $scope.newCount > 0
                $document[0].title = '(' + $scope.newCount + ') sc2'
            else
                $document[0].title = 'sc2'

    # audio player controls
    $scope.controlAudio =
        play: (index) ->
            ContentService.player =
                previousTrack: ContentService.player.currentTrack
                currentTrack: getPlaylistOrTrackData(index)
            $scope.$broadcast 'playTrack'
        pause: ->
            $scope.$broadcast 'pauseTrack'
        seekTo: (event) ->
            xpos = (if event.offsetX == undefined then event.layerX else event.offsetX) / event.target.offsetWidth
            $scope.$broadcast 'seekTrack', xpos
        seekPreview: (event) ->
            xpos = if event.offsetX == undefined then event.layerX else event.offsetX
            $scope.$broadcast 'seekPreview', {xpos: xpos, width: event.target.clientWidth}
