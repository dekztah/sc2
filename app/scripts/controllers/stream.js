'use strict';

angular.module('sc2App').controller('streamCtrl', function ($scope, $window, $http, soundcloudConfig, soundCloudService, localStorageService, helperService, audioContext, canvasService, animation) {

    var moment = $window.moment,
        nextPageCursor;

    $scope.storedToken = localStorageService.get('accessToken');
    $scope.user = localStorageService.get('user');
    $scope.stream = [];
    $scope.playerData = {};
    $scope.status = {
        loading: false,
        error: false
    };

    // player and event listeners
    var player = audioContext.player;
    var onTimeupdate = function() {
        $scope.$apply(function() {
            $scope.playerData.currentTime = player.currentTime;
            if (player.currentTime === player.duration) {
                $scope.playerData.playingIndex = null;
                $scope.playerData.currentTime = 0;
                $scope.playerData.currentTrack = false;
                animation.killAnimation();
            }
        });
    };
    var onCanplay = function() {
        $scope.$apply(function() {
            $scope.playerData.duration = player.duration;
            $scope.playerData.seeking = false;
        });
    };
    var onSeeking = function() {
        $scope.$apply(function() {
            $scope.playerData.seeking = true;
        });
    };
    var onSeeked = function() {
        $scope.$apply(function() {
            $scope.playerData.seeking = false;
        });
    };
    var onProgress = function() {
        var ranges = [];
        for(var i = 0; i < player.buffered.length; i ++) {
            ranges.push([
                player.buffered.start(i),
                player.buffered.end(i)
            ]);
        }
        if (ranges.length) {
            $scope.$apply(function(){
                $scope.playerData.buffered = ranges[ranges.length-1][1];
            });
        }
    };

    player.addEventListener('timeupdate', onTimeupdate, false);
    player.addEventListener('canplay', onCanplay, false);
    player.addEventListener('seeking', onSeeking, false);
    player.addEventListener('seeked', onSeeked, false);
    player.addEventListener('progress', onProgress, false);

    var getPlaylistOrTrackData = function(values) {
        var data;
        if (values[0] !== null) {
            data = $scope.stream[values[1]].tracks[values[0]];
        } else {
            data = $scope.stream[values[1]];
        }
        return data;
    };

    var getPlaylistTracks = function(playlist) {
        soundCloudService.getPlaylistTracks(playlist).then(function(result){
            var tracks = [];
            for (var i = 0; i < result.data.length; i++) {
                tracks[i] = {
                    origin: result.data[i],
                    created_at: result.data[i].created_at
                };
            }
            playlist.tracks = tracks;
        });
    };

    // soundcloud connect
    $scope.connect = function() {
        soundCloudService.connect().then(function(data){
            localStorageService.set('accessToken', data.token);
            localStorageService.set('user', data.user);
            $scope.storedToken = data.token;
            $scope.user = data.user;
            $scope.getTracks();
        });
    };

    $scope.logout = function() {
        localStorageService.remove('accessToken');
        localStorageService.remove('user');
        $window.location.reload();
    };

    $scope.getTracks = function(){
        $scope.status.loading = true;
        if (nextPageCursor) {
            // $scope.stream.push({'type' : 'separator'});
        }
        soundCloudService.getTracks({limit: 50, cursor: nextPageCursor}).then(function(stream){
            var now = moment().format('YYYY-MM-DD HH:mm:ss');
            var lastFetch = localStorageService.get('lastFetch');
            $scope.user.lastFetch = lastFetch;
            nextPageCursor = stream.data.next_href.split('cursor=')[1];

            // get favorited tracks and flag items before publishing
            soundCloudService.like('get', '').then(function(likes){
                var likedIds = [];
                for (var j = 0; j < likes.data.length; j++) {
                    likedIds.push(likes.data[j].id);
                }
                for (var i = 0; i <= stream.data.collection.length - 1; i++) {
                    var item = stream.data.collection[i];
                    item.origin.favoriteFlag = likedIds.indexOf(item.origin.id) > -1;
                    if (item.type === 'playlist' || item.type === 'playlist-repost') {
                        getPlaylistTracks(item);
                    }
                    if (moment(item.created_at, 'YYYY/MM/DD HH:mm:ss ZZ').isAfter(moment(lastFetch))) {
                        item.isNew = true;
                    }
                    item.index = i;
                    $scope.stream.push(item);
                }
            });

            localStorageService.set('lastFetch', now);
            $scope.status.loading = false;
        }, function(){
            $scope.status = {
                loading: false,
                error: true
            };
        });
    };

    // add or remove track from your favorites
    $scope.like = function(method, index) {
        var favorited = getPlaylistOrTrackData(index);
        var trackId = favorited.origin.id;
        soundCloudService.like(method, trackId).then(function(response){
            if (response.status === 201) {
                favorited.origin.favoriteFlag = true;
            } else if (response.status === 200 && method === 'delete') {
                favorited.origin.favoriteFlag = false;
            }
        });
    };

    // audio player controls
    $scope.controlAudio = {
        play: function(index) {
            $scope.playerData.currentTrack = getPlaylistOrTrackData(index);
            if (!angular.equals(index, $scope.playerData.lastPlayedIndex)) {
                var audioUrl = $scope.playerData.currentTrack.origin.stream_url + '?client_id=' + soundcloudConfig.apiKey;
                $scope.playerData.lastPlayedIndex = index;
                $scope.playerData.currentTime = 0;
                $scope.playerData.buffered = 0;
                player.setAttribute('src', audioUrl);
                if ($scope.playerData.currentTrack.origin.user.avatar_url) {
                    $scope.background = $scope.playerData.currentTrack.origin.user.avatar_url.replace('large', 't500x500');
                }
                var png = $scope.playerData.currentTrack.origin.waveform_url.split('/');
                var waveformRequestUrl = soundcloudConfig.waveformServiceUrl + png[3];
                $http.get(waveformRequestUrl).success(function(waveformData){
                    helperService.drawWaveform(waveformData.samples, canvasService.waveformContext, 'rgba(255,255,255,0.05)');
                    helperService.drawWaveform(waveformData.samples, canvasService.waveformBufferContext, 'rgba(255,255,255,0.15)');
                    // helperService.drawWaveform(waveformData.samples, canvasService.waveformProgressContext, '#00ffff');
                    helperService.drawWaveform(waveformData.samples, canvasService.waveformProgressContext, '#ffffff');
                }).error(function(){

                });
            }
            $scope.playerData.playingIndex = index;
            player.play();

            if (!animation.requestId) {
                animation.animate();
            }
        },
        pause: function() {
            $scope.playerData.lastPlayedIndex = $scope.playerData.playingIndex;
            $scope.playerData.playingIndex = null;
            player.pause();
            animation.killAnimation();
        },
        seekTo: function(event) {
            var xpos = (event.offsetX === undefined ? event.layerX : event.offsetX) / event.target.offsetWidth;
            player.currentTime = (xpos * player.duration);
        },
        seekPreview: function(event) {
            var xpos = (event.offsetX === undefined ? event.layerX : event.offsetX);
            var cursor = {
                xpos: xpos,
                time: (xpos * player.duration * 1000 / event.target.clientWidth)
            };
            return cursor;
        }
    };

    // generic helper functions
    $scope.helpers = {
        download: function(url) {
            return soundcloudConfig.apiBaseUrl + '/tracks/' + url +'/download?client_id=' + soundcloudConfig.apiKey;
        },
        setVolume: function(value) {
            audioContext.gain.value = ((value * value) / 10000);
        },
        getTimes: function(n) {
            return new Array(n);
        },
        isCurrent: function(index) {
            return angular.equals(index, $scope.playerData.playingIndex);
        }
    };

    // draw empty waveform and analyzer background
    helperService.drawAnalyzerBgr(canvasService.analyserBottomContext, 15, 30, 100, 28);
    helperService.drawWaveform(null, canvasService.waveformContext, 'rgba(255,255,255,0.2)');

    // get tracks if user is already authenticated
    if ($scope.storedToken) {
        soundCloudService.accessToken = $scope.storedToken;
        $scope.getTracks();
    }
});
