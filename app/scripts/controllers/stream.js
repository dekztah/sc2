'use strict';

angular.module('sc2App').controller('streamCtrl', function ($scope, $window, $http, soundcloudConfig, soundCloudService, localStorageService, helperService, audioContext, canvasService, animation) {

    var moment = $window.moment,
        nextPageCursor,
        streamItems = [];

    $scope.storedToken = localStorageService.get('accessToken');
    $scope.user = localStorageService.get('user');
    $scope.showReposts = true;
    $scope.stream = [];
    $scope.playerData = {
        playingIndex : null
    };
    $scope.status = {
        loading: false,
        error: false
    };

    // player and event listeners
    var player = audioContext.player;
    var onTimeupdate = function() {
        $scope.$apply(function() {
            $scope.playerData.currentTime = player.currentTime;
            $scope.playerData.currentTimeFormatted = helperService.duration(player.currentTime * 1000);
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
        if (!isNaN(values[1])) {
            data = $scope.stream[values[0]].tracks[values[1]];
        } else {
            data = $scope.stream[values[0]];
        }
        return data;
    };

    var getTrackProperties = function(item, i, parentIndex, likedIds, lastFetch) {
        var index = [];
        if (Number.isInteger(parentIndex)) {
            item.origin = item;
            index = [parentIndex, i];
        } else {
            index = [i];
        }
        return {
            index: index,
            created: helperService.customDate(item.created_at, 'MMMM DD YYYY'),
            isNew: moment(item.created_at, 'YYYY/MM/DD HH:mm:ss ZZ').isAfter(moment(lastFetch)),
            type: item.type,
            title: item.origin.title,
            scid: item.origin.id,
            duration: item.origin.duration,
            durationFormatted: helperService.duration(item.origin.duration),
            stream: item.origin.stream_url,
            waveform: item.origin.waveform_url,
            artwork: item.origin.artwork_url,
            buy: item.origin.purchase_url,
            downloadable: item.origin.downloadable,
            link: item.origin.permalink_url,
            username: item.origin.user.username,
            userlink: item.origin.user.permalink_url,
            avatar: item.origin.user.avatar_url,
            favoriteFlag: likedIds.indexOf(item.origin.id) > -1,
            description: item.origin.description ? helperService.description(item.origin.description) : false,
        };
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
        soundCloudService.getTracks({limit: 50, cursor: nextPageCursor}).then(function(stream){
            var now = moment().format('YYYY-MM-DD HH:mm:ss');
            var lastFetch = localStorageService.get('lastFetch');
            $scope.user.lastFetch = helperService.customDate(lastFetch, 'ago');
            nextPageCursor = stream.data.next_href.split('cursor=')[1];

            // get favorited tracks and flag items before publishing
            soundCloudService.like('get', '', {limit: '200'}).then(function(likes){
                var likedIds = [];
                var playlists = [];
                for (var j = 0; j < likes.data.length; j++) {
                    likedIds.push(likes.data[j].id);
                }
                for (var i = 0; i <= stream.data.collection.length - 1; i++) {
                    var item = stream.data.collection[i];
                    streamItems[i] = getTrackProperties(item, i, false, likedIds, lastFetch);

                    if (item.type === 'playlist' || item.type === 'playlist-repost') {
                        streamItems[i].tracks = [];
                        playlists.push(item.origin.id);
                    }
                }

                // and get all playlists at once
                soundCloudService.getPlaylistTracks(playlists).then(function(result){
                    for (var k = 0; k < streamItems.length; k++) {
                        var index = playlists.indexOf(streamItems[k].scid);
                        if (index > -1) {
                            for (var l = 0; l < result[index].data.length; l++) {
                                var item = result[index].data[l];
                                streamItems[k].tracks[l] = getTrackProperties(item, l, k, likedIds, lastFetch);
                            }
                        }
                    }
                    $scope.stream.push.apply($scope.stream, streamItems);
                });
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
        var trackId = favorited.scid;
        soundCloudService.like(method, trackId, {}).then(function(response){
            if (response.status === 201) {
                favorited.favoriteFlag = true;
            } else if (response.status === 200 && method === 'delete') {
                favorited.favoriteFlag = false;
            }
        });
    };

    // audio player controls
    $scope.controlAudio = {
        play: function(index) {
            $scope.playerData.currentTrack = getPlaylistOrTrackData(index);
            if (!angular.equals(index, $scope.playerData.lastPlayedIndex)) {
                var audioUrl = $scope.playerData.currentTrack.stream + '?client_id=' + soundcloudConfig.apiKey;
                $scope.playerData.lastPlayedIndex = index;
                $scope.playerData.currentTime = 0;
                $scope.playerData.buffered = 0;
                player.setAttribute('src', audioUrl);
                var png = $scope.playerData.currentTrack.waveform.split('/');
                var waveformRequestUrl = soundcloudConfig.waveformServiceUrl + png[3];
                $http.get(waveformRequestUrl).success(function(waveformData){
                    helperService.drawWaveform(waveformData.samples, canvasService.waveformContext, 'rgba(255,255,255,0.05)');
                    helperService.drawWaveform(waveformData.samples, canvasService.waveformBufferContext, 'rgba(255,255,255,0.15)');
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
                time: helperService.duration(xpos * player.duration * 1000 / event.target.clientWidth)
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
            var state;
            if (Array.isArray($scope.playerData.playingIndex) && Array.isArray(index)) {
                state = index[0] === $scope.playerData.playingIndex[0] && index[1] === $scope.playerData.playingIndex[1];
            } else {
                state = false;
            }
            return state;
        },
        toggleReposts: function() {
            $scope.showReposts = !$scope.showReposts;
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
