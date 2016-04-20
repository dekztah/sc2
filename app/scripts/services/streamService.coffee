'use strict'

angular
    .module('sc2App').service 'StreamService', ($q, $window, HelperService, SoundCloudService, UserService, $rootScope) ->
        streamOffset = undefined
        limit = 50
        run = 0

        @stream = []

        @playlists =
            ids: []
            items: []

        @getTrackProperties = (item, i, parentIndex) =>
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
                    isNew: moment(item.created_at, 'YYYY/MM/DD HH:mm:ss ZZ').isAfter(moment(@lastFetch))
                    scDate: item.created_at
                    created: HelperService.customDate(item.created_at, 'MMMM DD YYYY')
                    type: item.type or item.kind
                    repost: if item.type then item.type.indexOf('repost') > -1 else false
                    singleTrackPlaylist: false
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
                    # favoriteFlag: @content.likeIds.indexOf(item.origin.id) > -1
                    # followingFlag: @content.followings.hasOwnProperty(item.origin.user_id)
                    description: if item.origin.description then HelperService.description(item.origin.description) else false
                    favList: parentIndex < 0
                }
            else
                console.log item
                'mysterious unreadable track...'

        @load = () =>
            SoundCloudService.res('activities/tracks/affiliated', 'get', '',
                limit: limit
                cursor: streamOffset
            ).then ((result) =>
                streamOffset = result.data.next_href.split('cursor=')[1]

                for streamItem, streamItemIndex in result.data.collection
                    streamItem = @getTrackProperties(streamItem, streamItemIndex + run * limit, false)
                    @stream.push streamItem

                    if streamItem.type == 'playlist' or streamItem.type == 'playlist-repost'
                        @playlists.ids.push streamItem.scid

                # load all tracks from all playlists
                SoundCloudService.getPlaylistTracks(@playlists.ids).then (results) =>

                    for playlist in results
                        @playlists.items.push playlist

                    for streamItem in @stream
                        indexInPlaylists = @playlists.ids.indexOf(streamItem.scid)

                        if indexInPlaylists > -1
                            streamItem.tracks = []

                            for playlistTrack, playlistTrackIndex in @playlists.items[indexInPlaylists].data
                                playlistTrack = @getTrackProperties(playlistTrack, playlistTrackIndex, streamItem.index[0])
                                streamItem.tracks.push playlistTrack


                            if streamItem.tracks.length == 1
                                streamItem.singleTrackPlaylist = true

                    @stream[@stream.length - 1].last = true

                run++
                console.log @stream.length
                @stream

            )

        return
