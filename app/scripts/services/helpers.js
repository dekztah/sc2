'use strict';

angular.module('sc2App').service('helperService', function () {

    this.drawWaveform = function(waveformData, canvas, color) {
        canvas.fillStyle = color;
        canvas.clearRect(0, 0, canvas.canvas.width, 100);
        var length = Math.floor(canvas.canvas.width/6),
            nth = Math.floor(1800/length),
            v;

        canvas.strokeStyle = color;
        canvas.lineCap = 'round';
        canvas.lineWidth = 4;
        canvas.beginPath();
        for (var i = 0; i < length; i++) {
            if (waveformData) {
                v = ((waveformData[i * nth]) * 0.7).toFixed();
            } else {
                v = 1;
            }
            canvas.moveTo(i * 6 +2, 50 - 0.5 * v);
            canvas.lineTo(i * 6 +2, (50 + 0.5 * v));
        }
        canvas.stroke();
    };
    this.drawAnalyzerBgr = function(canvas, numBars, spacerWidth, spectrumHeight, barWidth) {
        var i,z;
        canvas.strokeStyle = 'rgba(255,255,255,0.07)';
        canvas.lineCap = 'round';
        canvas.lineWidth = 4;
        canvas.beginPath();
        for (i = 0; i < numBars; ++i) {
            for (z = 0; z < 20; ++z) {
                canvas.moveTo((i) * spacerWidth + 2, 104 - z*6);
                canvas.lineTo((i) * spacerWidth -2 + barWidth, 104 - z*6);
            }
        }
        canvas.stroke();
    };
});
