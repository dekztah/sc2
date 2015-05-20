'use strict';

angular.module('sc2App').factory('audioContext', function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var ac = new window.AudioContext(),
        player = document.getElementById('player'),
        playerNoVis = document.getElementById('playerNoVis');

    var analyser = ac.createAnalyser();
    analyser.smoothingTimeConstant = 0.6;
    analyser.fftSize = 256;

    var osc = ac.createAnalyser();
    osc.smoothingTimeConstant = 0.3;
    osc.fftSize = 2048;

    var gainControl = ac.createGain();

    var source = ac.createMediaElementSource(player);
    source.connect(gainControl);
    gainControl.connect(osc);
    gainControl.connect(analyser);
    gainControl.connect(ac.destination);

    var audioEnv = {
        player: player,
        playerNoVis: playerNoVis,
        analyser: analyser,
        osc: osc,
        gain: gainControl.gain
    };

    return audioEnv;
});
