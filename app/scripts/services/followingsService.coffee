'use strict'

angular
    .module('sc2App').service 'FollowingsService', ($q, $window, HelperService, SoundCloudService, UserService) ->

        limit = 50
        offset = 0

        @followings = []

        @load = () =>
            SoundCloudService.res('/followings', 'get', '',
                limit: limit
                offset: offset
            ).then ((result) =>
                console.log result

                for user in result.data.collection
                    if user.description
                        user.description = HelperService.description(user.description)
                    user.followingFlag = true
                    @followings.push user

                offset = offset + limit
                @followings
            )

        return
