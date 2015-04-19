'use strict';

angular.module('sc2App').directive('canvasContext', function (canvasService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.append(canvasService[attrs.canvasContext].canvas);
        }
    };
});
