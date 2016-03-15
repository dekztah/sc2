'use strict'

angular.module('sc2App').service 'ContentService', ($window, $localStorage, StreamService, FavoritesService, FollowingsService) ->

    console.log 'init content'
    moment = $window.moment

    # temporary switch
    @streamInit = true
    @favoritesInit = true
    @followingsInit = true

    $localStorage.$default(
        lastFetch: ''
    )

    @lastFetch = $localStorage.lastFetch
    now = moment().format('YYYY-MM-DD HH:mm:ss')

    @player =
        currentTrack: undefined
        previousTrack: undefined

    @content =
        stream: StreamService.stream

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

    #     @lastFetch = $localStorage.lastFetch = now

    return
