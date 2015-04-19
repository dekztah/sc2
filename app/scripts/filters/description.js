'use strict';

angular.module('sc2App').filter('description', function() {
    var urlRegex =/((\b(https?):\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
        formattedDescription;

    return function(description) {

        if (description) {
            formattedDescription = description.replace(/\n/g, '<br>').replace(urlRegex, function(url) {
                if (url.indexOf('www') === 0) {
                    url = 'http://' + url;
                }
                return '<a target="_blank" href="' + url + '">' + url + '</a>';
            });
        }
        return formattedDescription;
    };
});
