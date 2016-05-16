'use strict'

angular.module('sc2App').service 'HelperService', ($window, $filter, $localStorage) ->
    moment = $window.moment
    scDateFormat = 'YYYY/MM/DD HH:mm:ss ZZ'
    urlRegex = /((("|>)?\b(https?):\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

    $localStorage.$default(
        lastFetch: ''
    )

    now = moment().format('YYYY-MM-DD HH:mm:ss')

    @lastFetch = $localStorage.lastFetch

    @duration = (duration) ->
        hours = moment.duration(duration).get('hours')
        minutes = moment.duration(duration).get('minutes')
        seconds = moment.duration(duration).get('seconds')
        if seconds / 10 < 1
            seconds = '0' + seconds
        if hours != 0
            if minutes / 10 < 1
                minutes = '0' + minutes
            hours + ':' + minutes + ':' + seconds
        else
            minutes + ':' + seconds

    @customDate = (date, format) ->
        if format == 'ago'
            moment(date).fromNow()
        else
            moment(date, scDateFormat).format format

    @description = (text) ->
        formattedDescription = text.replace(urlRegex, (url) ->
            # if description already contains html links
            if url.indexOf('"') > -1 or url.indexOf('>') > -1
                return url
            if url.indexOf('www') == 0
                url = 'http://' + url
            '<a target="_blank" href="' + url + '">' + url + '</a>'
        )
        formattedDescription.replace /\n/g, '<br>'

    @getNewCount = (stream, reposts) =>
        # @lastFetch = $localStorage.lastFetch = now
        filtered = $filter('filter')(stream, isNew: true)
        if !reposts
            $filter('filter')(filtered, repost: false).length
        else
            filtered.length

    return
