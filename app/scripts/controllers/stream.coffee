'use strict'

angular.module('sc2App').controller 'streamCtrl', ($scope, $rootScope, $document, SoundCloudService, ContentService, UserService, HelperService) ->

    console.log 'streamCtrl init'

    $rootScope.status =
        loading: false
        error: false

    $scope.content =
        stream: []

    currentTrack = undefined
    previousTrack = undefined
    prevIndex = undefined

    $scope.$on 'connected', ->
        $scope.loadData()

    $scope.loadData = ->
        console.log 'fetching stream data'
        $scope.status.loading = true

        ContentService.loadStream().then (content) ->
            if content.hasOwnProperty 'status'
                $scope.status =
                    loading: false
                    error: content.status + ' ' + content.statusText
            else
                $scope.content.stream.push.apply $scope.content.stream, content

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



    # generic helper functions
    $scope.helpers =
        getNewCount: ->
            $scope.newCount = HelperService.getNewCount $scope.content.stream, $scope.streamFilter.repost
            if $scope.newCount > 0
                $document[0].title = '(' + $scope.newCount + ') sc2'
            else
                $document[0].title = 'sc2'

    # get tracks if user is already authenticated
    if UserService.userObj
        $scope.loadData()
