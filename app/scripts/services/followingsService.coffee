'use strict'

angular
    .module('sc2App').service 'FollowingsService', ($q, $window, HelperService, SoundCloudService, UserService) ->

        offset = undefined
        limit = 50

        @followings = []

        @load = () =>
            SoundCloudService.res('/followings', 'get', '',
                limit: limit
                cursor: offset
            ).then ((result) =>
                offset = result.data.next_href?.split('cursor=')[1] or offset

                for user in result.data.collection
                    if user.description
                        user.description = HelperService.description(user.description)
                    user.followingFlag = true
                    @followings.push user

                @followings
            )

        return
