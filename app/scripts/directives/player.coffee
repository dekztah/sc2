'use strict'

angular.module('sc2App').directive 'player', (audioContext, HelperService, CanvasService, SoundCloudService) ->
    {
        restrict: 'A'
        link: (scope, element, attrs) ->
            pl1 = element[0].children[0]
            pl2 = element[0].children[1]
            audioContext.register pl1.id, pl1
            audioContext.register pl2.id, pl2

            player = audioContext.player

            onTimeupdate = ->
                scope.$apply ->
                    scope.playerData.currentTime = player.currentTime
                    scope.playerData.currentTimeFormatted = HelperService.duration(player.currentTime * 1000)
                    if player.currentTime == player.duration
                        scope.playerData.playingIndex = null
                        scope.playerData.currentTrack.isPlaying = false
                        scope.playerData.currentTime = 0
                        scope.playerData.currentTrack = false
                        animation.killAnimation()

            onCanplay = ->
                scope.$apply ->
                    scope.playerData.duration = player.duration
                    scope.playerData.seeking = false

            onSeeking = ->
                scope.$apply ->
                    scope.playerData.seeking = true

            onSeeked = ->
                scope.$apply ->
                    scope.playerData.seeking = false

            onProgress = ->
                ranges = []
                for range in player.buffered
                    ranges.push [
                        player.buffered.start(range)
                        player.buffered.end(range)
                    ]

                if ranges.length
                    scope.$apply ->
                        scope.playerData.buffered = ranges[ranges.length - 1][1]

            setEventListeners = ->
                player.addEventListener 'timeupdate', onTimeupdate, false
                player.addEventListener 'canplay', onCanplay, false
                player.addEventListener 'seeking', onSeeking, false
                player.addEventListener 'seeked', onSeeked, false
                player.addEventListener 'progress', onProgress, false

            scope.$on 'playTrack', (evt, data) ->
                SoundCloudService.checkHeaders(data.stream).then (response) ->
                    console.log response
                    if !response.vis
                        player = audioContext.playerNoVis
                    else
                        player = audioContext.player

                    player.src = response.url
                    player.play()
                    if !animation.requestId
                        animation.animate()

                SoundCloudService.getWaveformData(data.waveform).then (response) ->
                    # make it 1
                    CanvasService.drawWaveform response.data.samples, CanvasService.canvases().waveformContext, 'rgba(255,255,255,0.05)'
                    CanvasService.drawWaveform response.data.samples, CanvasService.canvases().waveformBufferContext, 'rgba(255,255,255,0.15)'
                    CanvasService.drawWaveform response.data.samples, CanvasService.canvases().waveformProgressContext, '#ffffff'


            scope.$on 'pauseTrack', ->
                player.pause()
                animation.killAnimation()

            scope.$on 'seekTrack', (evt, data) ->
                player.currentTime = data
    }
