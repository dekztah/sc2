'use strict';

angular.module('sc2App').controller('streamCtrl', function ($scope, $window, $http, $q, soundcloudConfig, soundCloudService, localStorageService, helperService, audioContext, canvasService, animation, streamUrlServiceUrl) {

    var moment = $window.moment,
        nextPageCursor,
        likedItems = [],
        likedIds = [];

    $scope.storedToken = localStorageService.get('accessToken');
    $scope.user = localStorageService.get('user');
    $scope.showReposts = $scope.$eval(localStorageService.get('showReposts'));

    $scope.fsScope = false;
    $scope.stream = [];
    $scope.likedTracks = [];
    $scope.followings = [];
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
    var setEventListeners = function() {
        player.addEventListener('timeupdate', onTimeupdate, false);
        player.addEventListener('canplay', onCanplay, false);
        player.addEventListener('seeking', onSeeking, false);
        player.addEventListener('seeked', onSeeked, false);
        player.addEventListener('progress', onProgress, false);
    };

    var getPlaylistOrTrackData = function(values, favorites) {
        var data;
        if (favorites) {
            data = $scope.likedTracks[values[0]];
        } else {
            if (!isNaN(values[1])) {
                data = $scope.stream[values[0]].tracks[values[1]];
            } else {
                data = $scope.stream[values[0]];
            }
        }
        return data;
    };

    var getTrackProperties = function(item, i, parentIndex) {
        var index = [];
        if (Number.isInteger(parentIndex)) {
            item.origin = item;
            if (parentIndex >= 0) {
                index = [parentIndex, i];
            } else {
                index = [i];
            }
        } else {
            index = [i];
        }
        return {
            index: index,
            scDate: item.created_at,
            created: helperService.customDate(item.created_at, 'MMMM DD YYYY'),
            type: item.type,
            title: item.origin.title,
            scid: item.origin.id,
            duration: item.origin.duration,
            durationFormatted: helperService.duration(item.origin.duration),
            stream: item.origin.stream_url,
            streamable: item.origin.streamable,
            waveform: item.origin.waveform_url,
            artwork: item.origin.artwork_url,
            buy: item.origin.purchase_url,
            downloadable: item.origin.downloadable,
            link: item.origin.permalink_url,
            username: item.origin.user.username,
            userlink: item.origin.user.permalink_url,
            avatar: item.origin.user.avatar_url,
            description: item.origin.description ? helperService.description(item.origin.description) : false,
            favList: (parentIndex < 0)
        };
    };

    // call endpoint until all resources loaded
    var soundcloudGetAll = function(resource, target, count) {
        var deferred = $q.defer();
        var promises = [];
        var limit = 50;
        var results = [];

        // one time only
        if (target.length === 0) {

            var get = function(offset) {
                var request = $q.defer();
                soundCloudService.res(resource, 'get', '', {limit: limit, offset: offset}).then(function(response){
                    request.resolve(response.data);
                });
                return request.promise;
            };

            for (var i = 0; i < Math.ceil(count / limit); i++) {
                promises.push(get(i*limit));
            }

            $q.all(promises).then(function(response){
                for (var i = 0; i < response.length; i++) {
                    for (var j =0; j < response[i].length; j++) {
                        results.push(response[i][j]);
                    }
                }
                deferred.resolve(results);
            });

        } else {
            deferred.resolve();
        }
        return deferred.promise;
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
        soundCloudService.res('activities/tracks/affiliated', 'get', '', {limit: 50, cursor: nextPageCursor}).then(function(stream) {
            var streamItems = [];
            var now = moment().format('YYYY-MM-DD HH:mm:ss');
            var lastFetch = localStorageService.get('lastFetch');
            var playlists = [];
            var trackIds = [];

            $scope.user.lastFetch = helperService.customDate(lastFetch, 'ago');
            nextPageCursor = stream.data.next_href.split('cursor=')[1];

            for (var i = 0; i < stream.data.collection.length; i++) {
                var item = stream.data.collection[i];

                // dont add reposts of the same track multiple times
                if (trackIds.indexOf(item.origin.id) > -1) {
                    stream.data.collection.splice(i, 1);
                    i = i-1;
                } else {
                    streamItems[i] = getTrackProperties(item, i + $scope.stream.length, false);
                    trackIds[i] = item.origin.id;
                    if (item.type === 'playlist' || item.type === 'playlist-repost') {
                        streamItems[i].tracks = [];
                        playlists.push(item.origin.id);
                    }
                }
            }
            streamItems[streamItems.length - 1].last = true;

            // and get all playlists at once
            soundCloudService.getPlaylistTracks(playlists).then(function(result){
                for (var k = 0; k < streamItems.length; k++) {
                    var index = playlists.indexOf(streamItems[k].scid);
                    if (index > -1) {
                        for (var l = 0; l < result[index].data.length; l++) {
                            var item = result[index].data[l];
                            streamItems[k].tracks[l] = getTrackProperties(item, l, k + $scope.stream.length);
                        }
                    }
                }

                // wait for favorited tracks before pushing to scope
                soundcloudGetAll('favorites', likedIds, $scope.user.public_favorites_count).then(function(likes){
                    if (likes) {
                        for (var j = 0; j < likes.length; j++) {
                            likedIds.push(likes[j].id);
                            likedItems.push(getTrackProperties(likes[j], j, -1));
                            likedItems[j].favoriteFlag = true;
                        }
                        $scope.likedTracks.push.apply($scope.likedTracks, likedItems);
                    }

                    for (var m = 0; m < streamItems.length; m++) {
                        streamItems[m].favoriteFlag = likedIds.indexOf(streamItems[m].scid) > -1;
                        streamItems[m].isNew = moment(streamItems[m].scDate, 'YYYY/MM/DD HH:mm:ss ZZ').isAfter(moment(lastFetch));

                        if (streamItems[m].tracks) {
                            for (var n = 0; n < streamItems[m].tracks.length; n++) {
                                streamItems[m].tracks[n].favoriteFlag = likedIds.indexOf(streamItems[m].tracks[n].scid) > -1;
                            }
                        }
                    }
                    $scope.stream.push.apply($scope.stream, streamItems);
                });
            });

            soundcloudGetAll('followings', $scope.followings, $scope.user.followings_count).then(function(followings){
                if (followings) {
                    for (var k = 0; k < followings.length; k++) {
                        followings[k].index = k;
                        followings[k].followingFlag = true;
                        if (followings[k].description) {
                            followings[k].description = helperService.description(followings[k].description);
                        }
                        $scope.followings.push(followings[k]);
                    }
                }
            });
            localStorageService.set('lastFetch', now);

        }, function(){
            $scope.status = {
                loading: false,
                error: true
            };
        });
    };

    $scope.$on('ngRepeatFinished', function() {
        $scope.status.loading = false;
    });

    // add or remove track from your favorites
    $scope.like = function(method, index, isFavList) {
        var favorited = getPlaylistOrTrackData(index, isFavList);
        var trackId = favorited.scid;
        soundCloudService.res('favorites/', method, trackId, {}).then(function(response){
            if (response.status === 201) {
                favorited.favoriteFlag = true;
            } else if (response.status === 200 && method === 'delete') {
                favorited.favoriteFlag = false;
            }
        });
    };

    $scope.follow = function(method, index) {
        var userId = $scope.followings[index].id;
        soundCloudService.res('followings/', method, userId, {}).then(function(response) {
            if (response.status === 201) {
                $scope.followings[index].followingFlag = true;
            } else if (response.status === 200 && method === 'delete') {
                $scope.followings[index].followingFlag = false;
            }
        });
    };

    // audio player controls
    $scope.controlAudio = {
        play: function(index, isFavList) {
            $scope.playerData.currentTrack = getPlaylistOrTrackData(index, isFavList);

            var playable = function() {
                var deferredHead = $q.defer();
                if (!angular.equals(index, $scope.playerData.lastPlayedIndex)) {
                    var audioUrl = $scope.playerData.currentTrack.stream.replace('https', 'http') + '?client_id=' + soundcloudConfig.apiKey;
                    $scope.playerData.lastPlayedIndex = index;
                    $scope.playerData.currentTime = 0;
                    $scope.playerData.buffered = 0;
                    player.pause();

                    // need to check if Access Control headers are present, if not use the secondary player without visualizer
                    // http://stackoverflow.com/questions/29778721/some-soundcloud-cdn-hosted-tracks-dont-have-access-control-allow-origin-header
                    $http.jsonp(streamUrlServiceUrl + '&stream=' + audioUrl).then(function(result){
                        if (angular.isArray(result.data['access-control-allow-origin'])) {
                            $scope.status.access = false;
                            player = audioContext.player;
                        } else {
                            $scope.status.access = 'Limited access to track, visualizers disabled';
                            player = audioContext.playerNoVis;
                        }
                        if (result.data.location) {
                            player.setAttribute('src', result.data.location.replace('https', 'http'));
                            setEventListeners();
                            deferredHead.resolve();
                        } else {
                            $scope.status.access = 'Unable to access stream';
                            deferredHead.reject();
                        }
                    });

                    var png = $scope.playerData.currentTrack.waveform.split('/');
                    var waveformRequestUrl = soundcloudConfig.waveformServiceUrl + png[3];
                    $http.get(waveformRequestUrl).success(function(waveformData){
                        helperService.drawWaveform(waveformData.samples, canvasService.waveformContext, 'rgba(255,255,255,0.05)');
                        helperService.drawWaveform(waveformData.samples, canvasService.waveformBufferContext, 'rgba(255,255,255,0.15)');
                        helperService.drawWaveform(waveformData.samples, canvasService.waveformProgressContext, '#ffffff');
                    }).error(function(){

                    });
                } else {
                    deferredHead.resolve();
                }
                return deferredHead.promise;
            };

            playable().then(function(){
                $scope.playerData.playingIndex = index;
                $scope.playerData.isFavList = isFavList;

                player.play();
                if (!animation.requestId && !$scope.status.access) {
                    animation.animate();
                }
            });
        },
        pause: function() {
            $scope.playerData.lastPlayedIndex = $scope.playerData.playingIndex;
            $scope.playerData.playingIndex = null;
            player.pause();
            animation.killAnimation();
        },
        seekTo: function(event) {
            var xpos = (event.offsetX === undefined ? event.layerX : event.offsetX) / event.target.offsetWidth;
            player.currentTime = (xpos * player.duration).toFixed();
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
        isCurrent: function(index, isFavList) {
            var state;
            if (Array.isArray($scope.playerData.playingIndex) && Array.isArray(index) && isFavList === $scope.playerData.isFavList) {
                state = index[0] === $scope.playerData.playingIndex[0] && index[1] === $scope.playerData.playingIndex[1];
            } else {
                state = false;
            }
            return state;
        },
        toggleReposts: function() {
            $scope.showReposts = !$scope.showReposts;
            localStorageService.set('showReposts', $scope.showReposts);
        },
        toggleOsc: function(bool) {
            if (!$scope.status.access && $scope.playerData.playingIndex && bool) {
                $scope.fsScope = animation.x3dscope = true;
            } else {
                $scope.fsScope = animation.x3dscope = false;
            }
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
