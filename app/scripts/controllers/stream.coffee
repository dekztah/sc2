'use strict'

angular.module('sc2App').controller 'streamCtrl', ($scope, SoundCloudService, ContentService, UserService, HelperService) ->

    if ContentService.streamInit
        $scope.content =
            stream: []

    currentTrack = undefined
    previousTrack = undefined
    prevIndex = undefined

    $scope.$on 'connected', ->
        $scope.loadData()

    $scope.loadData = ->
        $scope.status.loading = true

        ContentService.loadStream().then (content) ->
            if content.hasOwnProperty 'status'
                $scope.status =
                    loading: false
                    error: content.status + ' ' + content.statusText
            else
                $scope.content.stream = content

            $scope.helpers.updateCounters()

    $scope.$on 'ngRepeatFinished', ->
        $scope.status.loading = false

    # get tracks if user is already authenticated
    if UserService.userObj && ContentService.streamInit
        $scope.loadData()
