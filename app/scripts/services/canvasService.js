'use strict';

angular.module('sc2App').service('canvasService', function () {

    var analyserBottomCanvas = document.createElement('canvas');
    analyserBottomCanvas.width = 450;
    analyserBottomCanvas.height = 100;

    var analyserTopCanvas = document.createElement('canvas');
    analyserTopCanvas.width = 450;
    analyserTopCanvas.height = 100;

    var oscCanvas = document.createElement('canvas');
    oscCanvas.width = 450;
    oscCanvas.height = 100;

    var waveformCanvas = document.createElement('canvas');
    waveformCanvas.width = 450;
    waveformCanvas.height = 100;

    var waveformProgressCanvas = document.createElement('canvas');
    waveformProgressCanvas.width = 450;
    waveformProgressCanvas.height = 100;

    var waveformBufferCanvas = document.createElement('canvas');
    waveformBufferCanvas.width = 450;
    waveformBufferCanvas.height = 100;

    var canvases = {
        analyserBottomContext: analyserBottomCanvas.getContext('2d'),
        analyserTopContext: analyserTopCanvas.getContext('2d'),
        oscContext: oscCanvas.getContext('2d'),
        waveformContext: waveformCanvas.getContext('2d'),
        waveformProgressContext: waveformProgressCanvas.getContext('2d'),
        waveformBufferContext: waveformBufferCanvas.getContext('2d')
    };
    return canvases;
});
