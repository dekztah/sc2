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

    $urlRouterProvider.otherwise '/'

    $stateProvider
        .state 'main',
            url: '/'
            views:
                'sidebar':
                    templateUrl: 'views/sidebar.html'
                'main':
                    templateUrl: 'views/main.html'

        .state 'main.stream',
            url: '/stream'
            views:
                'content':
                    controller: 'streamCtrl'
                    templateUrl: 'views/stream.html'

        .state 'main.favorites',
            url: '/favorites'
            views:
                'content':
                    controller: 'favoritesCtrl'
                    templateUrl: 'views/favorites.html'

        .state 'main.followings',
            url: '/followings'
            views:
                'content':
                    controller: 'followingsCtrl'
                    templateUrl: 'views/followings.html'

# https://github.com/angular-ui/ui-router/issues/679
# lol workaround
.run [
    '$state'
    ($state) ->
        return
    ]
