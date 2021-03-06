'use strict'

angular.module('sc2App').factory 'audioContext', ->

    window.AudioContext = window.AudioContext or window.webkitAudioContext
    ac = new (window.AudioContext)
    player = document.createElement('audio')
    player.crossOrigin = 'anonymous'
    playerNoVis = document.createElement('audio')
    analyser = ac.createAnalyser()
    analyser.smoothingTimeConstant = 0.6
    analyser.fftSize = 256
    osc = ac.createAnalyser()
    osc.smoothingTimeConstant = 0.3
    osc.fftSize = 2048
    gainControl = ac.createGain()
    source = ac.createMediaElementSource(player)
    source.connect gainControl
    gainControl.connect osc
    gainControl.connect analyser
    gainControl.connect ac.destination
    audioEnv =
        player: player
        playerNoVis: playerNoVis
        analyser: analyser
        osc: osc
        gain: gainControl.gain
    audioEnv
