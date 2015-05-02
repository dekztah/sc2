'use strict';

angular.module('sc2App').factory('animation', function ($window, audioContext, canvasService, AdditiveBlendShader) {
    var self = this,
        spacerWidth = 30,
        barWidth = 28,
        numBars = 15,
        magnitude;

    var renderComposer, glowComposer, blendComposer;
    var THREE = $window.THREE;

    var camera, scene, webglRenderer;
    var renderPass, filmPass, hblurPass, vblurPass;
    var oscLine;

    self.requestId = null;
    var analyserData = new Uint8Array(audioContext.analyser.frequencyBinCount);
    var oscData = new Uint8Array(audioContext.osc.frequencyBinCount);

    canvasService.oscContext.lineWidth = 3;
    canvasService.oscContext.strokeStyle = '#ffffff';
    canvasService.analyserTopContext.strokeStyle = '#ffffff';
    canvasService.analyserTopContext.lineCap = 'round';
    canvasService.analyserTopContext.lineWidth = 4;

    self.x3dscope = false;

    self.animate = function() {
        self.requestId = $window.requestAnimationFrame(self.animate);
        if (self.x3dscope === true) {
            x3Dloop();
        } else {
            loop();
        }
    };

    self.killAnimation = function() {
        if (self.requestId) {
            $window.cancelAnimationFrame(self.requestId);
            self.requestId = undefined;
            // canvasService.analyserTopContext.clearRect(0, 0, 450, 100);
            // canvasService.oscContext.clearRect(0, 0, canvasService.oscContext.canvas.width, 300);
        }
    };

    var init3D = function() {

        var screenWidth = 800,
            screenHeight = 600;

        var container = document.getElementById('webGLWrapper');

        camera = new THREE.PerspectiveCamera(1, screenWidth / screenHeight, 1, 1000000);
        camera.position.z = 30000;

        scene = new THREE.Scene();

        var material = new THREE.LineBasicMaterial({
            color: 0x00ffff
        });

        var oscGeometry = new THREE.Geometry();

        for (var o = 0; o < 1024; o++) {
            oscGeometry.vertices.push(new THREE.Vector3( o*1, 0, 0 ));
        }

        oscLine = new THREE.Line(oscGeometry, material);
        scene.add(oscLine);
        oscLine.position.x = -512;
        oscLine.position.y = -100;
        scene.add(new THREE.AmbientLight(0xffffff));

        // renderer
        webglRenderer = new THREE.WebGLRenderer();
        webglRenderer.setSize(1920, 955);
        container.appendChild(webglRenderer.domElement);

        // postprocessing
        var blurriness = 3;
        var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };

        // base layer
        var renderTarget = new THREE.WebGLRenderTarget( screenWidth, screenHeight, renderTargetParameters );
        renderComposer = new THREE.EffectComposer( webglRenderer, renderTarget);
        renderPass = new THREE.RenderPass( scene, camera );
        var copyPass = new THREE.ShaderPass( THREE.CopyShader );
        var bloomPass = new THREE.BloomPass(3, 8, 2.0, 512);

        renderComposer.addPass( renderPass );
        renderComposer.addPass( copyPass );
        renderComposer.addPass( bloomPass );

        // glow layer
        hblurPass = new THREE.ShaderPass( THREE.HorizontalBlurShader );
        vblurPass = new THREE.ShaderPass( THREE.VerticalBlurShader );
        hblurPass.uniforms.h.value = blurriness/screenWidth;
        vblurPass.uniforms.v.value = blurriness/screenHeight;
        copyPass = new THREE.ShaderPass( THREE.CopyShader );
        var renderTargetGlow = new THREE.WebGLRenderTarget( screenWidth/4, screenHeight/4, renderTargetParameters );
        glowComposer = new THREE.EffectComposer( webglRenderer,renderTargetGlow);
        glowComposer.addPass( copyPass );
        glowComposer.addPass( renderPass );
        glowComposer.addPass( bloomPass );
        glowComposer.addPass( hblurPass );
        glowComposer.addPass( vblurPass );
        glowComposer.addPass( hblurPass );
        glowComposer.addPass( vblurPass );

        // blending
        blendComposer = new THREE.EffectComposer( webglRenderer );
        var blendPass = new THREE.ShaderPass( AdditiveBlendShader );
        blendPass.uniforms.tBase.value = renderComposer.renderTarget1;
        blendPass.uniforms.tAdd.value = glowComposer.renderTarget1;
        blendPass.uniforms.amount.value = 0;
        blendComposer.addPass( blendPass );

        filmPass = new THREE.ShaderPass( THREE.FilmShader );
        filmPass.uniforms.grayscale.value = 0;
        filmPass.uniforms.sIntensity.value = 0.8;
        filmPass.uniforms.sCount.value = screenHeight;

        blendComposer.addPass( filmPass );
        filmPass.renderToScreen = true;
    };

    init3D();

    var x3Dloop = function() {
        audioContext.osc.getByteTimeDomainData(oscData);

        for (var k = 0; k < 1024; k++) {
            oscLine.geometry.vertices[k].y = oscData[k];
        }
        oscLine.geometry.verticesNeedUpdate = true;

        renderComposer.render( 0.1 );
        glowComposer.render( 0.1 );
        blendComposer.render( 0.1 );
    };

    var loop = function() {

        // analyser
        canvasService.analyserTopContext.clearRect(0, 0, 450, 100);
        audioContext.analyser.getByteFrequencyData(analyserData);
        canvasService.analyserTopContext.beginPath();
        for (var i = 0; i < numBars; ++i) {
            magnitude = (analyserData[3 + i*8] / 2.56).toFixed();


            for (var y = 0; y < (magnitude / 6); ++y) {
                canvasService.analyserTopContext.moveTo((i) * spacerWidth + 2, 104 - y*6);
                canvasService.analyserTopContext.lineTo((i) * spacerWidth -2 + barWidth, 104 - y*6);
            }
        }
        canvasService.analyserTopContext.stroke();

        // oscilloscope
        canvasService.oscContext.clearRect(0, 0, canvasService.oscContext.canvas.width, 100);
        audioContext.osc.getByteTimeDomainData(oscData);
        canvasService.oscContext.beginPath();
        for (i = 0; i < canvasService.oscContext.canvas.width/2; i++) {
            canvasService.oscContext.lineTo(i*2, oscData[i]/2.56);
        }
        canvasService.oscContext.stroke();
    };

    return self;
});
