'use strict'

angular.module('sc2App').controller 'followingsCtrl', ($scope, $document, SoundCloudService, ContentService, UserService, HelperService) ->

    $scope.content =
        followings: []

    ContentService.loadFollowings().then (content) ->
        console.log content

        $scope.content.followings.push.apply $scope.content.followings, content
