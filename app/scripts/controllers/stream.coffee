'use strict'
angular.module('sc2App').controller 'streamCtrl', ($scope, $document, SoundCloudService, $filter, ContentService, UserService) ->

    $scope.status =
        loading: false
        error: false

    $scope.content =
        stream: []

    currentTrack = undefined
    previousTrack = undefined
    prevIndex = undefined

    getPlaylistOrTrackData = (values) ->
        data = undefined
        if !isNaN(values[1])
            data = $scope.content[$scope.activeTab][values[0]].tracks[values[1]]
        else
            data = $scope.content[$scope.activeTab][values[0]]
        data

    $scope.$on 'connected', ->
        $scope.loadData()

    $scope.loadData = ->
        $scope.status.loading = true

        ContentService.loadContent().then (content) ->
            if content.hasOwnProperty 'status'
                $scope.status =
                    loading: false
                    error: true
            else
                $scope.content.stream.push.apply $scope.content.stream, content.stream
                $scope.content.followings = content.followings
                $scope.content.favorites = content.favorites

                $scope.helpers.getNewCount()

    $scope.$on 'ngRepeatFinished', ->
        $scope.status.loading = false

    # add or remove track from your favorites
    $scope.like = (method, index) ->
        favorited = getPlaylistOrTrackData(index)
        trackId = favorited.scid
        SoundCloudService.res('favorites/', method, trackId, {}).then (response) ->
            if response.status == 201
                favorited.favoriteFlag = true
            else if response.status == 200 and method == 'delete'
                favorited.favoriteFlag = false

    $scope.follow = (method, index) ->
        userId = $scope.followings[index].id
        SoundCloudService.res('followings/', method, userId, {}).then (response) ->
            if response.status == 201
                $scope.followings[index].followingFlag = true
            else if response.status == 200 and method == 'delete'
                $scope.followings[index].followingFlag = false

    # audio player controls
    $scope.controlAudio =
        play: (index) ->
            replay = angular.equals(prevIndex, index)
            prevIndex = index
            currentTrack = getPlaylistOrTrackData(index)
            currentTrack.isPlaying = true
            $scope.$broadcast 'playTrack', {current: currentTrack, previous: previousTrack, replay: replay}
            previousTrack = currentTrack
        pause: ->
            currentTrack.isPlaying = false
            $scope.$broadcast 'pauseTrack'
        seekTo: (event) ->
            xpos = (if event.offsetX == undefined then event.layerX else event.offsetX) / event.target.offsetWidth
            $scope.$broadcast 'seekTrack', xpos
        seekPreview: (event) ->
            xpos = if event.offsetX == undefined then event.layerX else event.offsetX
            $scope.$broadcast 'seekPreview', {xpos: xpos, width: event.target.clientWidth}

    # generic helper functions
    $scope.helpers =
        getNewCount: ->
            filtered = $filter('filter')($scope.content.stream, isNew: true)
            if !$scope.showReposts
                filtered = $filter('filter')(filtered, repost: false)
            $scope.newCount = filtered.length
            if filtered.length > 0
                $document[0].title = '(' + filtered.length + ') sc2'
            else
                $document[0].title = 'sc2'

    # get tracks if user is already authenticated
    if UserService.userObj
        $scope.loadData()
