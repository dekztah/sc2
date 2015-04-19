'use strict';

angular.module('sc2App').directive('scroller', function ($document, $window) {
    return {
        link: function(scope, element) {
            $document.bind('scroll', function(){
                if ($window.scrollY > 0) {
                    element.addClass('scrolled');
                } else {
                    element.removeClass('scrolled');
                }
            });
        }
    };
});
