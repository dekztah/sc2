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

    @loadStream = () =>
        if @streamInit then StreamService.load()
        @streamInit = false

    @loadFavorites = () =>
        if @favoritesInit then FavoritesService.load()
        @favoritesInit = false

    @loadFollowings = () =>
        if @followingsInit then FollowingsService.load()
        @followingsInit = false

    #     @lastFetch = $localStorage.lastFetch = now

    return
