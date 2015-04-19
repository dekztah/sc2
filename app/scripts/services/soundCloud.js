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

    self.getTracks = function (params){
        params.oauth_token = self.accessToken;
        return $http.get(soundcloudConfig.apiBaseUrl + '/me/activities/tracks/affiliated', {params: params});
    };

    self.getPlaylistTracks = function(playlist){
        return $http.get(soundcloudConfig.apiBaseUrl + '/playlists/' + playlist.origin.id + '/tracks', {params: {oauth_token: self.accessToken }});
    };

    self.like = function(method, trackId) {
        return $http({
            method: method,
            url: soundcloudConfig.apiBaseUrl + '/me/favorites/' + trackId,
            params: {oauth_token: self.accessToken}
        });
    };
});
