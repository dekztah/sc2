'use strict';

angular.module('sc2App').constant({
    soundcloudConfig: {
        apiBaseUrl: 'http://api.soundcloud.com',
        // apiKey: '03ef56ca3245389357addc704af72a54',
        apiKey: '14c6b266c11792a6fcf3a05c809c1196',
        // redirectUri: 'http://sc.local:9000/callback.html',
        redirectUri:'http://wavetrip.org/sc/callback.html',
        waveformServiceUrl: 'http://wis.sndcdn.com/'
    },
});
