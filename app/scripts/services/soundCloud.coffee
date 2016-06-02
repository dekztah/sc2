'use strict'
angular.module('sc2App').service 'SoundCloudService', ($window, $http, $q, soundcloudConfig, UserService) ->
    @connect = ->
        connectDeferred = $q.defer()
        SC = $window.SC
        credentials = {}
        SC.initialize
            client_id: soundcloudConfig.apiKey
            redirect_uri: soundcloudConfig.redirectUri
            scope: 'non-expiring'
        SC.connect ->
            credentials.token = SC.accessToken()
            $http.get(soundcloudConfig.apiBaseUrl + '/me', params: oauth_token: credentials.token).success (me) ->
                credentials.user = me
                connectDeferred.resolve credentials
                UserService.setUser credentials

        connectDeferred.promise

    @getPlaylistTracks = (playlists) ->
        playlistTracks = []

        for playlist in playlists
            playlistTracks.push $http.get(soundcloudConfig.apiBaseUrl + '/playlists/' + playlist + '/tracks', params: oauth_token: UserService.userObj.token)

        $q.all playlistTracks

    @res = (resource, method, id, params) ->
        params.oauth_token = UserService.userObj.token
        $http
            method: method
            url: soundcloudConfig.apiBaseUrl + '/me' + resource + id
            params: params

    # need to check if Access Control headers are present, if not use the secondary player without visualizer
    # http://stackoverflow.com/questions/29778721/some-soundcloud-cdn-hosted-tracks-dont-have-access-control-allow-origin-header
    @getProperStreamUrl = (trackid) ->
        streamUrl = soundcloudConfig.apiBaseUrl + '/i1/tracks/' + trackid + '/streams?client_id=' + soundcloudConfig.apiKey
        $http.get(streamUrl).then (response) ->
            canplay =
                vis: if response.data.hasOwnProperty 'http_mp3_128_url' then response.data.http_mp3_128_url.indexOf('ec-media') > -1
                url: response.data.http_mp3_128_url

    @getWaveformData = (waveformUrl) ->
        file = waveformUrl.split '/'
        waveformUrl = soundcloudConfig.waveformServiceUrl + file[3].replace 'png', 'json'
        $http.get(waveformUrl)

    @downloadUrl = (id) ->
        soundcloudConfig.apiBaseUrl + '/tracks/' + id + '/download?client_id=' + soundcloudConfig.apiKey

    return
