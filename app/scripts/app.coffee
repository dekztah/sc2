'use strict'

angular.module 'sc2App', [
    'config'
    'LocalStorageModule'
    'ngSanitize'
    'ngAnimate'
]

.config (localStorageServiceProvider) ->
    localStorageServiceProvider.setPrefix 'sc2'
