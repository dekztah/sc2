'use strict';

angular.module('sc2App').service('soundCloudService', function ($window, $http, $q, soundcloudConfig) {
    var self = this;

    self.connect = function() {
        var connectDeferred = $q.defer(),
            SC = $window.SC,
            credentials = {};

        SC.initialize({
            client_id: soundcloudConfig.apiKey,
            redirect_uri: soundcloudConfig.redirectUri,
            scope: 'non-expiring'
        });
        SC.connect(function() {
            self.accessToken = SC.accessToken();
            credentials.token = self.accessToken;

            $http.get(soundcloudConfig.apiBaseUrl + '/me', {
                params: {oauth_token: self.accessToken}
            }).success(function(me){
                credentials.user = me;
                connectDeferred.resolve(credentials);
            });
        });

        return connectDeferred.promise;
    };

    self.getPlaylistTracks = function (playlists) {
        var playlistTracks = [];
        for (var i = 0; i < playlists.length; i++) {
            playlistTracks.push($http.get(soundcloudConfig.apiBaseUrl + '/playlists/' + playlists[i] + '/tracks', {params: {oauth_token: self.accessToken }}));
        }
        return $q.all(playlistTracks);
    };

    self.res = function(resource, method, id, params) {
        params.oauth_token = self.accessToken;
        return $http({
            method: method,
            url: soundcloudConfig.apiBaseUrl + '/me/' + resource + id,
            params: params
        });
    };
});
