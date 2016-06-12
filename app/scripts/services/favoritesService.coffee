'use strict'

angular
    .module('sc2App').service 'FavoritesService', ($q, $window, HelperService, SoundCloudService, UserService) ->

        limit = 50
        offset = 0

        @favorites = []

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
            SoundCloudService.res('/favorites', 'get', '',
                limit: limit
                offset: offset
            ).then ((result) =>
                for favorite, favIndex in result.data
                    @favorites.push(@getTrackProperties(favorite, favIndex + offset, -1))
                    @favorites[favIndex].favoriteFlag = true

                offset = offset + limit
                @favorites
            )

        return
