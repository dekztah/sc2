'use strict'

angular.module('sc2App').constant
    soundcloudConfig:
        apiBaseUrl: 'http://api.soundcloud.com'
        # apiKey: 'fdb4bfea50165446d63c898644f6c475'
        apiKey: '88d9f158d0c568aa6ac38772e923f736'
        # redirectUri: 'http://sc2.local:9000/callback.html'
        redirectUri: 'http://sc2.wavetrip.org/callback.html'
        waveformServiceUrl: 'http://wis.sndcdn.com/'

angular.module('sc2App').config (localStorageServiceProvider) ->
    localStorageServiceProvider.setPrefix 'sc2'
