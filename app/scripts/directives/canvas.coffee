'use strict'

angular.module('sc2App').directive 'canvasContext', (CanvasService) ->
    {
        restrict: 'A'
        link: (scope, element, attrs) ->
            element.append CanvasService.canvases()[attrs.canvasContext].canvas
    }
