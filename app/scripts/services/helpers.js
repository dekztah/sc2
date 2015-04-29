'use strict';

angular.module('sc2App').service('helperService', function ($window) {
    var moment = $window.moment,
        scDateFormat = 'YYYY/MM/DD HH:mm:ss ZZ',
        urlRegex =/((("|>)?\b(https?):\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

    this.duration = function(duration) {
        var hours = moment.duration(duration).get('hours');
        var minutes = moment.duration(duration).get('minutes');
        var seconds = moment.duration(duration).get('seconds');
        if ((seconds / 10) < 1) {
            seconds = '0' + seconds;
        }
        if (hours !== 0) {
            if ((minutes /10) < 1) {
                minutes = '0' + minutes;
            }
            return hours + ':' + minutes + ':' + seconds;
        }
        else {
            return minutes + ':' + seconds;
        }
    };

    this.customDate = function(date, format) {
        if (format === 'ago') {
            return moment(date).fromNow();
        } else {
            return moment(date, scDateFormat).format(format);
        }
    };

    this.description = function(text) {
        var formattedDescription = text.replace(urlRegex, function(url) {
            // if description already contains html links
            if (url.indexOf('"') > -1 || url.indexOf('>') > -1) {
                return url;
            }
            if (url.indexOf('www') === 0) {
                url = 'http://' + url;
            }
            return '<a target="_blank" href="' + url + '">' + url + '</a>';
        });
        return formattedDescription.replace(/\n/g, '<br>');
    };

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
