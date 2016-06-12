'use strict'

angular.module('sc2App').controller 'followingsCtrl', ($scope, $document, SoundCloudService, ContentService, UserService, HelperService) ->

    $scope.content =
        followings: []

    $scope.loadData = ->
        $scope.status.loading = true

        ContentService.loadFollowings().then (content) ->
            if content.hasOwnProperty 'status'
                $scope.status =
                    loading: false
                    error: content.status + ' ' + content.statusText
            else
                $scope.content.followings = content

    $scope.$on 'ngRepeatFinished', ->
        $scope.status.loading = false

    $scope.follow = (method, index) ->
        userId = $scope.followings[index].id
        SoundCloudService.res('followings/', method, userId, {}).then (response) ->
            if response.status == 201
                $scope.followings[index].followingFlag = true
            else if response.status == 200 and method == 'delete'
                $scope.followings[index].followingFlag = false

    $scope.loadData()
