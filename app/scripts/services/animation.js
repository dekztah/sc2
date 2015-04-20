'use strict';

angular.module('sc2App').factory('animation', function ($window, audioContext, canvasService) {
    var self = this,
        spacerWidth = 30,
        barWidth = 28,
        numBars = 15,
        magnitude;

    self.requestId = null;
    var analyserData = new Uint8Array(audioContext.analyser.frequencyBinCount);
    var oscData = new Uint8Array(audioContext.osc.frequencyBinCount);

    canvasService.oscContext.lineWidth = 3;
    canvasService.oscContext.strokeStyle = 'rgba(255,255,255,0.7)';
    canvasService.analyserTopContext.strokeStyle = 'rgba(255,255,255,0.7)';
    canvasService.analyserTopContext.lineCap = 'round';
    canvasService.analyserTopContext.lineWidth = 4;

    self.animate = function() {
        self.requestId = $window.requestAnimationFrame(self.animate);
        loop();
    };

    self.killAnimation = function() {
        if (self.requestId) {
            $window.cancelAnimationFrame(self.requestId);
            self.requestId = undefined;
            // canvasService.analyserTopContext.clearRect(0, 0, 450, 100);
            // canvasService.oscContext.clearRect(0, 0, canvasService.oscContext.canvas.width, 300);
        }
    };

    var loop = function() {

        // analyser
        canvasService.analyserTopContext.clearRect(0, 0, 450, 100);
        audioContext.analyser.getByteFrequencyData(analyserData);
        canvasService.analyserTopContext.beginPath();
        for (var i = 0; i < numBars; ++i) {
            magnitude = (analyserData[3 + i*8] / 2.56).toFixed();


            for (var y = 0; y < (magnitude / 6); ++y) {
                canvasService.analyserTopContext.moveTo((i) * spacerWidth + 2, 104 - y*6);
                canvasService.analyserTopContext.lineTo((i) * spacerWidth -2 + barWidth, 104 - y*6);
            }
        }
        canvasService.analyserTopContext.stroke();

        // oscilloscope
        canvasService.oscContext.clearRect(0, 0, canvasService.oscContext.canvas.width, 100);
        audioContext.osc.getByteTimeDomainData(oscData);
        canvasService.oscContext.beginPath();
        for (i = 0; i < canvasService.oscContext.canvas.width/2; i++) {
            canvasService.oscContext.lineTo(i*2, oscData[i]/2.56);
        }
        canvasService.oscContext.stroke();
    };

    return self;
});
