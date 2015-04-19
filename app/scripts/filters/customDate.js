'use strict';

angular.module('sc2App').filter('customDate', function($window) {
    var moment = $window.moment;
    var scDateFormat = 'YYYY/MM/DD HH:mm:ss ZZ';
    var formattedDate;

    return function(date, format) {

        if (format === 'ago') {
            formattedDate = moment(date, scDateFormat).fromNow();
        } else {
            formattedDate = moment(date, scDateFormat).format(format);
        }
        return formattedDate;
    };
});
