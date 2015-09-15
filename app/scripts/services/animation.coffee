'use strict'
angular.module('sc2App').factory 'animation', ($window, audioContext, canvasService, AdditiveBlendShader) ->
    self = this
    spacerWidth = 30
    barWidth = 28
    numBars = 15
    magnitude = undefined
    renderComposer = undefined
    glowComposer = undefined
    blendComposer = undefined
    THREE = $window.THREE
    camera = undefined
    scene = undefined
    webglRenderer = undefined
    renderPass = undefined
    filmPass = undefined
    hblurPass = undefined
    vblurPass = undefined
    oscLine = undefined
    self.requestId = null
    analyserData = new Uint8Array(audioContext.analyser.frequencyBinCount)
    oscData = new Uint8Array(audioContext.osc.frequencyBinCount)
    canvasService.oscContext.lineWidth = 3
    canvasService.oscContext.strokeStyle = '#ffffff'
    canvasService.analyserTopContext.strokeStyle = '#ffffff'
    canvasService.analyserTopContext.lineCap = 'round'
    canvasService.analyserTopContext.lineWidth = 4
    self.x3dscope = false

    self.animate = ->
        self.requestId = $window.requestAnimationFrame(self.animate)
        if self.x3dscope == true
            x3Dloop()
        else
            animLoop()

    self.killAnimation = ->
        if self.requestId
            $window.cancelAnimationFrame self.requestId
            self.requestId = undefined
            # canvasService.analyserTopContext.clearRect(0, 0, 450, 100);
            # canvasService.oscContext.clearRect(0, 0, canvasService.oscContext.canvas.width, 300);

    init3D = ->
        screenWidth = 800
        screenHeight = 600
        container = document.getElementById('webGLWrapper')
        camera = new (THREE.PerspectiveCamera)(1, screenWidth / screenHeight, 1, 1000000)
        camera.position.z = 30000
        scene = new (THREE.Scene)
        material = new (THREE.LineBasicMaterial)(color: 0x00ffff)
        oscGeometry = new (THREE.Geometry)

        o = 0
        while o < 1024
            oscGeometry.vertices.push new (THREE.Vector3)(o * 1, 0, 0)
            o++
        oscLine = new (THREE.Line)(oscGeometry, material)
        scene.add oscLine
        oscLine.position.x = -512
        oscLine.position.y = -100
        scene.add new (THREE.AmbientLight)(0xffffff)
        # renderer
        webglRenderer = new (THREE.WebGLRenderer)
        webglRenderer.setSize 1920, 955
        container.appendChild webglRenderer.domElement
        # postprocessing
        blurriness = 3
        renderTargetParameters =
            minFilter: THREE.LinearFilter
            magFilter: THREE.LinearFilter
            format: THREE.RGBFormat
            stencilBufer: false
        # base layer
        renderTarget = new (THREE.WebGLRenderTarget)(screenWidth, screenHeight, renderTargetParameters)
        renderComposer = new (THREE.EffectComposer)(webglRenderer, renderTarget)
        renderPass = new (THREE.RenderPass)(scene, camera)
        copyPass = new (THREE.ShaderPass)(THREE.CopyShader)
        bloomPass = new (THREE.BloomPass)(3, 8, 2.0, 512)
        renderComposer.addPass renderPass
        renderComposer.addPass copyPass
        renderComposer.addPass bloomPass
        # glow layer
        hblurPass = new (THREE.ShaderPass)(THREE.HorizontalBlurShader)
        vblurPass = new (THREE.ShaderPass)(THREE.VerticalBlurShader)
        hblurPass.uniforms.h.value = blurriness / screenWidth
        vblurPass.uniforms.v.value = blurriness / screenHeight
        copyPass = new (THREE.ShaderPass)(THREE.CopyShader)
        renderTargetGlow = new (THREE.WebGLRenderTarget)(screenWidth / 4, screenHeight / 4, renderTargetParameters)
        glowComposer = new (THREE.EffectComposer)(webglRenderer, renderTargetGlow)
        glowComposer.addPass copyPass
        glowComposer.addPass renderPass
        glowComposer.addPass bloomPass
        glowComposer.addPass hblurPass
        glowComposer.addPass vblurPass
        glowComposer.addPass hblurPass
        glowComposer.addPass vblurPass
        # blending
        blendComposer = new (THREE.EffectComposer)(webglRenderer)
        blendPass = new (THREE.ShaderPass)(AdditiveBlendShader)
        blendPass.uniforms.tBase.value = renderComposer.renderTarget1
        blendPass.uniforms.tAdd.value = glowComposer.renderTarget1
        blendPass.uniforms.amount.value = 0
        blendComposer.addPass blendPass
        filmPass = new (THREE.ShaderPass)(THREE.FilmShader)
        filmPass.uniforms.grayscale.value = 0
        filmPass.uniforms.sIntensity.value = 0.8
        filmPass.uniforms.sCount.value = screenHeight
        blendComposer.addPass filmPass
        filmPass.renderToScreen = true

    init3D()

    x3Dloop = ->
        audioContext.osc.getByteTimeDomainData oscData
        k = 0
        while k < 1024
            oscLine.geometry.vertices[k].y = oscData[k]
            k++
        oscLine.geometry.verticesNeedUpdate = true
        renderComposer.render 0.1
        glowComposer.render 0.1
        blendComposer.render 0.1

    animLoop = ->
        # analyser
        canvasService.analyserTopContext.clearRect 0, 0, 450, 100
        audioContext.analyser.getByteFrequencyData analyserData
        canvasService.analyserTopContext.beginPath()

        i = 0
        while i < numBars
            magnitude = (analyserData[3 + i * 8] / 2.56).toFixed()

            y = 0
            while y < magnitude / 6
                canvasService.analyserTopContext.moveTo i * spacerWidth + 2, 104 - (y * 6)
                canvasService.analyserTopContext.lineTo i * spacerWidth - 2 + barWidth, 104 - (y * 6)
                ++y
            ++i
        canvasService.analyserTopContext.stroke()
        # oscilloscope
        canvasService.oscContext.clearRect 0, 0, canvasService.oscContext.canvas.width, 100
        audioContext.osc.getByteTimeDomainData oscData
        canvasService.oscContext.beginPath()

        i = 0
        while i < canvasService.oscContext.canvas.width / 2
            canvasService.oscContext.lineTo i * 2, oscData[i] / 2.56
            i++
        canvasService.oscContext.stroke()

    self
