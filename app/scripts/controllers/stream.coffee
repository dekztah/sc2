'use strict'
angular.module('sc2App').controller 'streamCtrl', ($scope, $document, $window, $http, $q, soundcloudConfig, SoundCloudService, localStorageService, HelperService, audioContext, CanvasService, streamUrlServiceUrl, $filter, contentService, UserService) ->
    moment = $window.moment
    $scope.fsScope = false
    $scope.playerData = playingIndex: null
    $scope.status =
        loading: false
        error: false
    $scope.activeStream = 'stream'
    $scope.content =
        stream: []

    getPlaylistOrTrackData = (values) ->
        data = undefined
        if !isNaN(values[1])
            data = $scope.content[$scope.activeStream][values[0]].tracks[values[1]]
        else
            data = $scope.content[$scope.activeStream][values[0]]
        data

    $scope.$on 'connected', ->
        $scope.loadData()

    $scope.loadData = ->
        $scope.status.loading = true
        now = moment().format('YYYY-MM-DD HH:mm:ss')
        # lastFetch = localStorageService.get('lastFetch')
        # $scope.user.lastFetch = helperService.customDate(lastFetch, 'ago')

        contentService.loadContent().then (content) ->
            $scope.content.stream.push.apply $scope.content.stream, content.stream

        #     localStorageService.set 'lastFetch', now
            $scope.helpers.getNewCount()

    $scope.$on 'ngRepeatFinished', ->
        $scope.status.loading = false

    # add or remove track from your favorites
    $scope.like = (method, index) ->
        favorited = getPlaylistOrTrackData(index)
        trackId = favorited.scid
        soundCloudService.res('favorites/', method, trackId, {}).then (response) ->
            if response.status == 201
                favorited.favoriteFlag = true
            else if response.status == 200 and method == 'delete'
                favorited.favoriteFlag = false

    $scope.follow = (method, index) ->
        userId = $scope.followings[index].id
        soundCloudService.res('followings/', method, userId, {}).then (response) ->
            if response.status == 201
                $scope.followings[index].followingFlag = true
            else if response.status == 200 and method == 'delete'
                $scope.followings[index].followingFlag = false

    # audio player controls
    $scope.controlAudio =
        play: (index) ->
            currentTrack = getPlaylistOrTrackData(index)
            currentTrack.isPlaying = true
            $scope.$emit 'playTrack', currentTrack
        pause: (index) ->
            currentTrack = getPlaylistOrTrackData(index)
            currentTrack.isPlaying = false
            $scope.$emit 'pauseTrack'
        seekTo: (event) ->
            xpos = (if event.offsetX == undefined then event.layerX else event.offsetX) / event.target.offsetWidth
            $scope.$emit 'seekTrack', (xpos * player.duration).toFixed()
        seekPreview: (event) ->
            xpos = if event.offsetX == undefined then event.layerX else event.offsetX
            cursor =
                xpos: xpos
                time: HelperService.duration(xpos * player.duration * 1000 / event.target.clientWidth)
            cursor

    # generic helper functions
    $scope.helpers =
        download: (url) ->
            soundcloudConfig.apiBaseUrl + '/tracks/' + url + '/download?client_id=' + soundcloudConfig.apiKey
        setVolume: (value) ->
            audioContext.gain.value = value * value / 10000
        getTimes: (n) ->
            new Array(n)
        setStream: (stream) ->
            $scope.activeStream = stream
        toggleOsc: (bool) ->
            if !$scope.status.access and $scope.playerData.playingIndex and bool
                $scope.fsScope = animation.x3dscope = true
            else
                $scope.fsScope = animation.x3dscope = false
        getNewCount: ->
            filtered = $filter('filter')($scope.content.stream, isNew: true)
            if !$scope.showReposts
                filtered = $filter('filter')(filtered, repost: false)
            $scope.newCount = filtered.length
            if filtered.length > 0
                $document[0].title = '(' + filtered.length + ') sc2'
            else
                $document[0].title = 'sc2'

    # draw empty waveform and analyzer background
    # HelperService.drawAnalyzerBgr CanvasService.analyserBottomContext, 15, 30, 100, 28
    CanvasService.drawWaveform null, CanvasService.canvases().waveformContext, 'rgba(255,255,255,0.2)'

    # get tracks if user is already authenticated
    if UserService.userObj
        $scope.loadData()
