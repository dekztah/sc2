'use strict'
angular.module('sc2App').service 'UserService', ($localStorage, $rootScope) ->
    $localStorage.$default(
        settings:
            userObj: undefined
            lastFetch: ''
            streamFilter:
                showReposts: ''
                showSingleTrackPlaylists: ''
            theme:
                bgr: 'default'
                color: 'light'
    )

    @userObj = $localStorage.settings.userObj

    @setUser = (credentials) ->
        console.log credentials
        @userObj = $localStorage.settings.userObj = credentials
        $rootScope.$broadcast 'userStateChanged'

    @logout = ->
        delete $localStorage.settings

    return
