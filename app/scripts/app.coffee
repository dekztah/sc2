'use strict'

angular.module 'sc2App', [
    'config'
    'ngStorage'
    'ngSanitize'
    'ngAnimate'
]

.config ($localStorageProvider) ->
    $localStorageProvider.setKeyPrefix 'sc2-'
