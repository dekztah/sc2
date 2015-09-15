'use strict'
angular.module('sc2App').service 'soundCloudService', ($window, $http, $q, soundcloudConfig) ->
    self = this

    self.connect = ->
        connectDeferred = $q.defer()
        SC = $window.SC
        credentials = {}
        SC.initialize
            client_id: soundcloudConfig.apiKey
            redirect_uri: soundcloudConfig.redirectUri
            scope: 'non-expiring'
        SC.connect ->
            self.accessToken = SC.accessToken()
            credentials.token = self.accessToken
            $http.get(soundcloudConfig.apiBaseUrl + '/me', params: oauth_token: self.accessToken).success (me) ->
                credentials.user = me
                connectDeferred.resolve credentials

        connectDeferred.promise

    self.getPlaylistTracks = (playlists) ->
        playlistTracks = []

        i = 0
        while i < playlists.length
            playlistTracks.push $http.get(soundcloudConfig.apiBaseUrl + '/playlists/' + playlists[i] + '/tracks', params: oauth_token: self.accessToken)
            i++
        $q.all playlistTracks

    self.res = (resource, method, id, params) ->
        params.oauth_token = self.accessToken
        $http
            method: method
            url: soundcloudConfig.apiBaseUrl + '/me/' + resource + id
            params: params

    return
