'use strict'

angular.module('sc2App').directive 'canvasContext', (canvasService) ->
    {
        restrict: 'A'
        link: (scope, element, attrs) ->
            element.append canvasService[attrs.canvasContext].canvas
    }
