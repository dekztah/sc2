'use strict'

angular.module 'sc2App', [
    'config'
    'ngStorage'
    'ngSanitize'
    'ngAnimate'
    'ui.router'
]

.config ($localStorageProvider, $stateProvider, $locationProvider, $urlRouterProvider) ->
    # $locationProvider.html5Mode true
    # $locationProvider.hashPrefix '!'

    $localStorageProvider.setKeyPrefix 'sc2-'

    $urlRouterProvider.otherwise '/stream'

    $stateProvider.state('stream',
        url: '/stream'
        templateUrl: 'views/stream.html')
    .state('favorites',
        url: '/favorites'
        templateUrl: 'views/favorites.html')
    .state('followings',
        url: '/followings'
        templateUrl: 'views/followings.html')

# https://github.com/angular-ui/ui-router/issues/679
# lol workaround
.run [
    '$state'
    ($state) ->
        return
    ]
