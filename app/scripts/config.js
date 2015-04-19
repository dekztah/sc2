'use strict';

angular.module('sc2App').constant({
    soundcloudConfig: {
        apiBaseUrl: 'http://api.soundcloud.com',
        apiKey: 'fdb4bfea50165446d63c898644f6c475',
        // apiKey: 'b9d11449cd4c64d461b8b5c30650cd06',
        redirectUri: 'http://sc2.local:9000/callback.html',
        // redirectUri:'http://wavetrip.org/sc2/callback.html',
        waveformServiceUrl: 'http://wis.sndcdn.com/'
    },
});
