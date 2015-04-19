'use strict';

angular.module('sc2App').filter('duration', function($window) {
    var moment = $window.moment;

    return function(duration) {

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
});
