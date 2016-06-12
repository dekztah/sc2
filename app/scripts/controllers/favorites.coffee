'use strict'

angular.module('sc2App').controller 'favoritesCtrl', ($scope, $document, SoundCloudService, ContentService, UserService, HelperService) ->

    $scope.content =
        favorites: []

    $scope.loadData = ->
        $scope.status.loading = true

        ContentService.loadFavorites().then (content) ->
            if content.hasOwnProperty 'status'
                $scope.status =
                    loading: false
                    error: content.status + ' ' + content.statusText
            else
                $scope.content.favorites = content

    $scope.$on 'ngRepeatFinished', ->
        $scope.status.loading = false

    $scope.loadData()
