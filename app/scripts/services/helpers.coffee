'use strict'

angular.module('sc2App').service 'HelperService', ($window) ->
    moment = $window.moment
    scDateFormat = 'YYYY/MM/DD HH:mm:ss ZZ'
    urlRegex = /((("|>)?\b(https?):\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

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

    @drawAnalyzerBgr = (canvas, numBars, spacerWidth, spectrumHeight, barWidth) ->
        i = undefined
        z = undefined
        canvas.strokeStyle = 'rgba(255,255,255,0.07)'
        canvas.lineCap = 'round'
        canvas.lineWidth = 4
        canvas.beginPath()

        i = 0
        while i < numBars

            z = 0
            while z < 20
                canvas.moveTo i * spacerWidth + 2, 104 - (z * 6)
                canvas.lineTo i * spacerWidth - 2 + barWidth, 104 - (z * 6)
                ++z
            ++i
        canvas.stroke()

    return
