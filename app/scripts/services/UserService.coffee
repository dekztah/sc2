'use strict'
angular.module('sc2App').service 'UserService', ($localStorage, $rootScope) ->

    $localStorage.$default(
        userObj: undefined
    )

    @userObj = $localStorage.userObj

    @setUser = (credentials) ->
        console.log credentials
        @userObj = $localStorage.userObj = credentials
        $rootScope.$broadcast 'userStateChanged'

    @logout = ->
        $localStorage.$reset()

    return
