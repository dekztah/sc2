'use strict'
angular.module('sc2App').controller 'streamCtrl', ($scope, $document, $window, $http, $q, soundcloudConfig, soundCloudService, localStorageService, helperService, audioContext, canvasService, animation, streamUrlServiceUrl, $filter) ->
    moment = $window.moment
    nextPageCursor = undefined
    $scope.storedToken = localStorageService.get('accessToken')
    $scope.user = localStorageService.get('user')
    $scope.showReposts = $scope.$eval(localStorageService.get('showReposts'))
    $scope.fsScope = false
    $scope.stream = []
    $scope.favorites = []
    $scope.followings = []
    $scope.playerData = playingIndex: null
    $scope.status =
        loading: false
        error: false
    $scope.activeStream = 'stream'
    favorites =
        ids: []
        items: []
    followings =
        ids: []
        items: []

    # player and event listeners
    player = audioContext.player

    onTimeupdate = ->
        $scope.$apply ->
            $scope.playerData.currentTime = player.currentTime
            $scope.playerData.currentTimeFormatted = helperService.duration(player.currentTime * 1000)
            if player.currentTime == player.duration
                $scope.playerData.playingIndex = null
                $scope.playerData.currentTrack.isPlaying = false
                $scope.playerData.currentTime = 0
                $scope.playerData.currentTrack = false
                animation.killAnimation()

    onCanplay = ->
        $scope.$apply ->
            $scope.playerData.duration = player.duration
            $scope.playerData.seeking = false

    onSeeking = ->
        $scope.$apply ->
            $scope.playerData.seeking = true

    onSeeked = ->
        $scope.$apply ->
            $scope.playerData.seeking = false

    onProgress = ->
        ranges = []
        i = 0
        while i < player.buffered.length
            ranges.push [
                player.buffered.start(i)
                player.buffered.end(i)
            ]
            i++
        if ranges.length
            $scope.$apply ->
                $scope.playerData.buffered = ranges[ranges.length - 1][1]

    setEventListeners = ->
        player.addEventListener 'timeupdate', onTimeupdate, false
        player.addEventListener 'canplay', onCanplay, false
        player.addEventListener 'seeking', onSeeking, false
        player.addEventListener 'seeked', onSeeked, false
        player.addEventListener 'progress', onProgress, false

    getPlaylistOrTrackData = (values) ->
        data = undefined
        if !isNaN(values[1])
            data = $scope[$scope.activeStream][values[0]].tracks[values[1]]
        else
            data = $scope[$scope.activeStream][values[0]]
        data

    getTrackProperties = (item, i, parentIndex) ->
        index = []
        if Number.isInteger(parentIndex)
            item.origin = item
            if parentIndex >= 0
                index = [
                    parentIndex
                    i
                ]
            else
                index = [ i ]
        else
            index = [ i ]
        {
            index: index
            scDate: item.created_at
            created: helperService.customDate(item.created_at, 'MMMM DD YYYY')
            type: item.type or item.kind
            repost: if item.type then item.type.indexOf('repost') > -1 else false
            title: item.origin.title
            scid: item.origin.id
            duration: item.origin.duration
            durationFormatted: helperService.duration(item.origin.duration)
            stream: item.origin.stream_url
            streamable: item.origin.streamable
            waveform: item.origin.waveform_url
            artwork: item.origin.artwork_url
            buy: item.origin.purchase_url
            downloadable: item.origin.downloadable
            link: item.origin.permalink_url
            username: item.origin.user.username
            userlink: item.origin.user.permalink_url
            avatar: item.origin.user.avatar_url
            favoriteFlag: favorites.ids.indexOf(item.origin.id) > -1
            followingFlag: followings.ids.indexOf(item.origin.user_id) > -1
            description: if item.origin.description then helperService.description(item.origin.description) else false
            favList: parentIndex < 0
        }

    # call endpoint until all resources loaded
    soundcloudGetAll = (resource, target, count) ->
        deferred = $q.defer()
        promises = []
        limit = 50
        results = []

        get = (offset) ->
            request = $q.defer()
            soundCloudService.res(resource, 'get', '',
                limit: limit
                offset: offset).then (response) ->
                request.resolve response.data
            request.promise

        i = 0
        while i < Math.ceil(count / limit)
            promises.push get(i * limit)
            i++
        $q.all(promises).then (response) ->
            `var i`
            i = 0
            while i < response.length
                j = 0
                while j < response[i].length
                    results.push response[i][j]
                    j++
                i++
            deferred.resolve results
        deferred.promise

    # soundcloud connect

    $scope.connect = ->
        soundCloudService.connect().then (data) ->
            localStorageService.set 'accessToken', data.token
            localStorageService.set 'user', data.user
            $scope.storedToken = data.token
            $scope.user = data.user
            $scope.loadData()

    $scope.logout = ->
        localStorageService.remove 'accessToken'
        localStorageService.remove 'user'
        $window.location.reload()

    $scope.loadData = ->
        $scope.status.loading = true
        now = moment().format('YYYY-MM-DD HH:mm:ss')
        lastFetch = localStorageService.get('lastFetch')
        $scope.user.lastFetch = helperService.customDate(lastFetch, 'ago')
        followingsReq = undefined
        favoritesReq = undefined
        streamReq = undefined
        streamItems = undefined
        playlists =
            ids: []
            items: []

        # load followed users and favorites
        if followings.items.length == 0
            followingsReq = soundcloudGetAll('followings', followings.items, $scope.user.followings_count).then((users) ->
                k = 0
                while k < users.length
                    followings.ids.push users[k].id
                    users[k].followingFlag = true
                    if users[k].description
                        users[k].description = helperService.description(users[k].description)
                    followings.items.push users[k]
                    k++
            )
            favoritesReq = soundcloudGetAll('favorites', favorites.items, $scope.user.public_favorites_count).then((likes) ->
                j = 0
                while j < likes.length
                    favorites.ids.push likes[j].id
                    favorites.items.push likes[j]
                    j++
            )

        # load tracks
        streamReq = soundCloudService.res('activities/tracks/affiliated', 'get', '',
            limit: 50
            cursor: nextPageCursor).then((stream) ->
            deferred = $q.defer()
            nextPageCursor = stream.data.next_href.split('cursor=')[1]
            streamItems = []
            i = 0
            while i < stream.data.collection.length
                item = stream.data.collection[i]
                streamItems.push item
                if item.type == 'playlist' or item.type == 'playlist-repost'
                    playlists.ids.push item.origin.id
                i++

            # load all tracks from all playlists
            soundCloudService.getPlaylistTracks(playlists.ids).then (results) ->
                k = 0
                while k < results.length
                    playlists.items.push results[k]
                    k++
                deferred.resolve()
            deferred.promise
        )

        # process raw data
        $q.all([
            followingsReq
            favoritesReq
            streamReq
        ]).then ->
            # stream
            l = 0
            while l < streamItems.length
                streamItems[l] = getTrackProperties(streamItems[l], l + $scope.stream.length, false)
                streamItems[l].isNew = moment(streamItems[l].scDate, 'YYYY/MM/DD HH:mm:ss ZZ').isAfter(moment(lastFetch))
                indexInPlaylists = playlists.ids.indexOf(streamItems[l].scid)
                if indexInPlaylists > -1
                    streamItems[l].tracks = []
                    m = 0
                    while m < playlists.items[indexInPlaylists].data.length
                        streamItems[l].tracks[m] = getTrackProperties(playlists.items[indexInPlaylists].data[m], m, l + $scope.stream.length)
                        m++
                l++
            streamItems[streamItems.length - 1].last = true
            $scope.stream.push.apply $scope.stream, streamItems

            # favorites & followings
            if $scope.favorites.length == 0
                n = 0
                while n < favorites.items.length
                    $scope.favorites.push getTrackProperties(favorites.items[n], n, -1)
                    n++
                $scope.followings = followings.items
            localStorageService.set 'lastFetch', now
            $scope.helpers.getNewCount()

    $scope.$on 'ngRepeatFinished', ->
        $scope.status.loading = false

    # add or remove track from your favorites
    $scope.like = (method, index) ->
        favorited = getPlaylistOrTrackData(index)
        trackId = favorited.scid
        soundCloudService.res('favorites/', method, trackId, {}).then (response) ->
            if response.status == 201
                favorited.favoriteFlag = true
            else if response.status == 200 and method == 'delete'
                favorited.favoriteFlag = false

    $scope.follow = (method, index) ->
        userId = $scope.followings[index].id
        soundCloudService.res('followings/', method, userId, {}).then (response) ->
            if response.status == 201
                $scope.followings[index].followingFlag = true
            else if response.status == 200 and method == 'delete'
                $scope.followings[index].followingFlag = false

    # audio player controls
    $scope.controlAudio =
        play: (index) ->
            if $scope.playerData.currentTrack
                $scope.playerData.currentTrack.isPlaying = false
            $scope.playerData.currentTrack = getPlaylistOrTrackData(index)

            playable = ->
                deferredHead = $q.defer()
                if !angular.equals(index, $scope.playerData.lastPlayedIndex)
                    audioUrl = $scope.playerData.currentTrack.stream.replace('https', 'http') + '?client_id=' + soundcloudConfig.apiKey
                    $scope.playerData.lastPlayedIndex = index
                    $scope.playerData.currentTime = 0
                    $scope.playerData.buffered = 0
                    player.pause()
                    # need to check if Access Control headers are present, if not use the secondary player without visualizer
                    # http://stackoverflow.com/questions/29778721/some-soundcloud-cdn-hosted-tracks-dont-have-access-control-allow-origin-header
                    $http.jsonp(streamUrlServiceUrl + '&stream=' + audioUrl).then (result) ->
                        if angular.isArray(result.data['access-control-allow-origin'])
                            $scope.status.access = false
                            player = audioContext.player
                            $scope.playerData.vis = true
                        else
                            $scope.status.access = 'Limited access to track, visualizers disabled'
                            player = audioContext.playerNoVis
                            $scope.playerData.vis = false
                        if result.data.location
                            player.setAttribute 'src', result.data.location.replace('https', 'http')
                            setEventListeners()
                            deferredHead.resolve()
                        else
                            $scope.status.access = 'Unable to access stream'
                            deferredHead.reject()
                    png = $scope.playerData.currentTrack.waveform.split('/')
                    waveformRequestUrl = soundcloudConfig.waveformServiceUrl + png[3]
                    $http.get(waveformRequestUrl).success((waveformData) ->
                        helperService.drawWaveform waveformData.samples, canvasService.waveformContext, 'rgba(255,255,255,0.05)'
                        helperService.drawWaveform waveformData.samples, canvasService.waveformBufferContext, 'rgba(255,255,255,0.15)'
                        helperService.drawWaveform waveformData.samples, canvasService.waveformProgressContext, '#ffffff'
                    ).error ->
                else
                    deferredHead.resolve()
                deferredHead.promise

            playable().then ->
                $scope.playerData.playingIndex = index
                $scope.playerData.currentTrack.isPlaying = true
                player.play()
                if !animation.requestId and !$scope.status.access
                    animation.animate()
        pause: ->
            $scope.playerData.currentTrack.isPlaying = false
            $scope.playerData.lastPlayedIndex = $scope.playerData.playingIndex
            $scope.playerData.playingIndex = null
            player.pause()
            animation.killAnimation()
        seekTo: (event) ->
            xpos = (if event.offsetX == undefined then event.layerX else event.offsetX) / event.target.offsetWidth
            player.currentTime = (xpos * player.duration).toFixed()
        seekPreview: (event) ->
            xpos = if event.offsetX == undefined then event.layerX else event.offsetX
            cursor =
                xpos: xpos
                time: helperService.duration(xpos * player.duration * 1000 / event.target.clientWidth)
            cursor
    # generic helper functions
    $scope.helpers =
        download: (url) ->
            soundcloudConfig.apiBaseUrl + '/tracks/' + url + '/download?client_id=' + soundcloudConfig.apiKey
        setVolume: (value) ->
            audioContext.gain.value = value * value / 10000
        getTimes: (n) ->
            new Array(n)
        toggleReposts: ->
            $scope.showReposts = !$scope.showReposts
            localStorageService.set 'showReposts', $scope.showReposts
            $scope.helpers.getNewCount()
        setStream: (stream) ->
            $scope.activeStream = stream
        toggleOsc: (bool) ->
            if !$scope.status.access and $scope.playerData.playingIndex and bool
                $scope.fsScope = animation.x3dscope = true
            else
                $scope.fsScope = animation.x3dscope = false
        getNewCount: ->
            filtered = $filter('filter')($scope.stream, isNew: true)
            if !$scope.showReposts
                filtered = $filter('filter')(filtered, repost: false)
            $scope.newCount = filtered.length
            if filtered.length > 0
                $document[0].title = '(' + filtered.length + ') sc2'
            else
                $document[0].title = 'sc2'

    # draw empty waveform and analyzer background
    helperService.drawAnalyzerBgr canvasService.analyserBottomContext, 15, 30, 100, 28
    helperService.drawWaveform null, canvasService.waveformContext, 'rgba(255,255,255,0.2)'

    # get tracks if user is already authenticated
    if $scope.storedToken
        soundCloudService.accessToken = $scope.storedToken
        $scope.loadData()
