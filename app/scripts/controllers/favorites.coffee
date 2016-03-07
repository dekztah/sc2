'use strict'

angular.module('sc2App').controller 'favoritesCtrl', ($scope, $document, SoundCloudService, ContentService, UserService, HelperService) ->

    $scope.content =
        favorites: []

    ContentService.loadFavorites().then (content) ->
        console.log content

        $scope.content.favorites.push.apply $scope.content.favorites, content
