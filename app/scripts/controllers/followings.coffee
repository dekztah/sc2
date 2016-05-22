'use strict'

angular.module('sc2App').controller 'followingsCtrl', ($scope, $document, SoundCloudService, ContentService, UserService, HelperService) ->

    $scope.content =
        followings: []

    ContentService.loadFollowings().then (content) ->
        $scope.content.followings.push.apply $scope.content.followings, content

    $scope.follow = (method, index) ->
        userId = $scope.followings[index].id
        SoundCloudService.res('followings/', method, userId, {}).then (response) ->
            if response.status == 201
                $scope.followings[index].followingFlag = true
            else if response.status == 200 and method == 'delete'
                $scope.followings[index].followingFlag = false
