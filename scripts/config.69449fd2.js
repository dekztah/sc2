(function(){"use strict";angular.module("sc2App").constant({soundcloudConfig:{apiBaseUrl:"http://api.soundcloud.com",apiKey:"88d9f158d0c568aa6ac38772e923f736",redirectUri:"http://sc2.wavetrip.org/callback.html",waveformServiceUrl:"http://wis.sndcdn.com/"}}),angular.module("sc2App").config(["localStorageServiceProvider",function(a){return a.setPrefix("sc2")}])}).call(this);