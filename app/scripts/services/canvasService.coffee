'use strict'

angular.module('sc2App').service 'CanvasService', ->
    analyserBottomCanvas = document.createElement('canvas')
    analyserBottomCanvas.width = 450
    analyserBottomCanvas.height = 100
    analyserTopCanvas = document.createElement('canvas')
    analyserTopCanvas.width = 450
    analyserTopCanvas.height = 100
    oscCanvas = document.createElement('canvas')
    oscCanvas.width = 450
    oscCanvas.height = 100
    waveformCanvas = document.createElement('canvas')
    waveformCanvas.width = 450
    waveformCanvas.height = 100
    waveformProgressCanvas = document.createElement('canvas')
    waveformProgressCanvas.width = 450
    waveformProgressCanvas.height = 100
    waveformBufferCanvas = document.createElement('canvas')
    waveformBufferCanvas.width = 450
    waveformBufferCanvas.height = 100
    canvases =
        analyserBottomContext: analyserBottomCanvas.getContext('2d')
        analyserTopContext: analyserTopCanvas.getContext('2d')
        oscContext: oscCanvas.getContext('2d')
        waveformContext: waveformCanvas.getContext('2d')
        waveformProgressContext: waveformProgressCanvas.getContext('2d')
        waveformBufferContext: waveformBufferCanvas.getContext('2d')

    @canvases = ->
        canvases

    @drawWaveform = (waveformData, canvas, color) ->
        canvas.fillStyle = color
        canvas.clearRect 0, 0, canvas.canvas.width, 100
        length = Math.floor(canvas.canvas.width / 6)
        nth = Math.floor(1800 / length)
        v = undefined
        canvas.strokeStyle = color
        canvas.lineCap = 'round'
        canvas.lineWidth = 4
        canvas.beginPath()

        i = 0
        while i < length
            if waveformData
                v = (waveformData[i * nth] * 0.7).toFixed()
            else
                v = 1
            canvas.moveTo i * 6 + 2, 50 - (0.5 * v)
            canvas.lineTo i * 6 + 2, 50 + 0.5 * v
            i++
        canvas.stroke()

    return
