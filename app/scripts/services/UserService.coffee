'use strict'
angular.module('sc2App').service 'UserService', (localStorageService, $rootScope) ->

    self.userObj = localStorageService.get('userObj')

    self.setUser = (credentials) ->
        localStorageService.set('userObj', credentials)
        self.userObj = credentials
        $rootScope.$broadcast 'userStateChanged'

    self.logout = ->
        localStorageService.remove('userObj')

    self
