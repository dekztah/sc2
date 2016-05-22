'use strict'

angular
    .module('sc2App').service 'StreamService', ($q, $window, HelperService, SoundCloudService, UserService, $rootScope) ->
        streamOffset = undefined
        limit = 50
        streamLength = 0

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
                    isNew: moment(item.created_at, 'YYYY/MM/DD HH:mm:ss ZZ').isAfter(moment(HelperService.lastFetch))
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
                    favoriteFlag: item.user_favorite
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
                    streamItem = @getTrackProperties(streamItem, streamItemIndex + streamLength, false)
                    @stream.push streamItem

                    if streamItem.type == 'playlist' or streamItem.type == 'playlist-repost'
                        @playlists.ids.push streamItem.scid

                # "Because of the complexity of our systems, we cannot guarantee an exact number of items returned for each request." -LOL
                # https://github.com/soundcloud/soundcloud-ruby/issues/49#issuecomment-197956472 ... and no its not just ruby specific, the whole js api does that too...
                streamLength += result.data.collection.length

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

                @stream

            )

        return
