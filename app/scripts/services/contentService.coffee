'use strict'

angular.module('sc2App').service 'ContentService', ($window, StreamService, FavoritesService, FollowingsService) ->

    console.log 'init content'
    moment = $window.moment

    # temporary switch
    @streamInit = true
    @favoritesInit = true
    @followingsInit = true

    @player =
        currentTrack: undefined
        previousTrack: undefined

    @content =
        stream: StreamService.stream
        favorites: FavoritesService.favorites
        followings: FollowingsService.followings

    @loadStream = () =>
        # if @streamInit then StreamService.load()
        # @streamInit = false
        # StreamService.stream
        StreamService.load()

    @loadFavorites = () =>
        # if @favoritesInit then FavoritesService.load()
        # @favoritesInit = false
        FavoritesService.load()

    @loadFollowings = () =>
        # if @followingsInit then FollowingsService.load()
        # @followingsInit = false
        FollowingsService.load()

    return
