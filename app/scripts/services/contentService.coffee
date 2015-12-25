'use strict'
angular.module('sc2App').service 'ContentService', ($q, $window, SoundCloudService, HelperService, UserService, $localStorage) ->
    moment = $window.moment
    streamOffset = undefined
    limit = 50
    run = 0

    @lastFetch = lastFetch = $localStorage.settings.lastFetch
    now = moment().format('YYYY-MM-DD HH:mm:ss')

    @loadContent = () ->

        content =
            playlists:
                ids: []
                items: []
            favorites: []
            followings: {}
            stream: []
            likeIds: []

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
            if item.origin
                {
                    index: index
                    isNew: moment(item.created_at, 'YYYY/MM/DD HH:mm:ss ZZ').isAfter(moment(lastFetch))
                    scDate: item.created_at
                    created: HelperService.customDate(item.created_at, 'MMMM DD YYYY')
                    type: item.type or item.kind
                    repost: if item.type then item.type.indexOf('repost') > -1 else false
                    title: item.origin.title
                    scid: item.origin.id
                    duration: item.origin.duration
                    durationFormatted: HelperService.duration(item.origin.duration)
                    stream: item.origin.stream_url
                    streamable: item.origin.streamable
                    waveform: item.origin.waveform_url
                    artwork: item.origin.artwork_url
                    buy: item.origin.purchase_url
                    downloadlink: if item.origin.downloadable then SoundCloudService.downloadUrl(item.origin.id) else false
                    link: item.origin.permalink_url
                    username: item.origin.user.username
                    userlink: item.origin.user.permalink_url
                    avatar: item.origin.user.avatar_url
                    favoriteFlag: content.likeIds.indexOf(item.origin.id) > -1
                    followingFlag: content.followings.hasOwnProperty(item.origin.user_id)
                    description: if item.origin.description then HelperService.description(item.origin.description) else false
                    favList: parentIndex < 0
                }
            else
                console.log item
                'mysterious undreadable track...'

        # repeated load ...
        soundcloudGetAll = (resource, count) ->
            deferred = $q.defer()
            promises = []
            results = []

            get = (offset) ->
                request = $q.defer()
                SoundCloudService.res(resource, 'get', '',
                    limit: limit
                    offset: offset
                ).then (response) ->
                    request.resolve response.data
                request.promise

            for i in [0...Math.ceil(count / limit)]
                promises.push get(i * limit)

            $q.all(promises).then((responses) ->
                for response in responses
                    for data in response
                        results.push data
                deferred.resolve results
            )
            deferred.promise

        if angular.equals(content.followings, {})
            followingsReq = soundcloudGetAll('followings.json', UserService.userObj.user.followings_count).then (users) ->

                for user in users
                    if user.description
                        user.description = HelperService.description(user.description)
                    user.followingFlag = true
                    content.followings[user.id] = user

            favoritesReq = soundcloudGetAll('favorites', UserService.userObj.user.public_favorites_count).then (likes) ->

                for like, likeIndex in likes
                    content.likeIds.push(like.id)
                    content.favorites.push(getTrackProperties(like, likeIndex, -1))
                    content.favorites[likeIndex].favoriteFlag = true

        streamReq = SoundCloudService.res('activities/tracks/affiliated', 'get', '',
            limit: limit
            cursor: streamOffset)

        $q.all([
            followingsReq
            favoritesReq
            streamReq
        ]).then ((result) ->
            stream = result[2]
            streamOffset = stream.data.next_href.split('cursor=')[1]
            content.stream = []

            for streamItem, streamItemIndex in stream.data.collection
                streamItem = getTrackProperties(streamItem, streamItemIndex + run * limit, false)
                content.stream.push streamItem

                if streamItem.type == 'playlist' or streamItem.type == 'playlist-repost'
                    content.playlists.ids.push streamItem.scid

            # load all tracks from all playlists
            SoundCloudService.getPlaylistTracks(content.playlists.ids).then (results) ->

                for playlist in results
                    content.playlists.items.push playlist

                for streamItem in content.stream
                    indexInPlaylists = content.playlists.ids.indexOf(streamItem.scid)

                    if indexInPlaylists > -1
                        streamItem.tracks = []

                        for playlistTrack, playlistTrackIndex in content.playlists.items[indexInPlaylists].data
                            playlistTrack = getTrackProperties(playlistTrack, playlistTrackIndex, streamItem.index[0])
                            streamItem.tracks.push playlistTrack

                        if streamItem.tracks.length == 1
                            streamItem.singleTrackPlaylist = true

                content.stream[content.stream.length - 1].last = true

            run++
            $localStorage.settings.lastFetch = now
            content
        ), (reason) ->
            reason

    return
