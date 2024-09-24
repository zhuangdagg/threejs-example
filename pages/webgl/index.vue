<template>
    <div class="h-full p-2">
        <h1 class="p-2 text-center">WebGL Demo</h1>
        <canvas ref="canvasRef" class="mx-auto border-2 bg-slate-400" style="width: 600px; height: 600px">
            Uninstall your blowser right now, shit
        </canvas>
    </div>
</template>

<script setup lang="ts">
import vsSource from '~/assets/shaders/vertex.glsl?raw'
import fsSource from '~/assets/shaders/fragment.glsl?raw'
import { getSphereData } from './sphere.data'

const canvasRef = ref<HTMLCanvasElement>()
const webgl = useWebGL()

function initWebGL() {
    if(!canvasRef.value) return 

    const modelData = getSphereData(20, 20)
    console.log(modelData.vertex,'--vertex len')    
    webgl.getWebGLContext(canvasRef.value)
        .initShaderProgram(vsSource, fsSource)
        // .setViewport(0, 0, 600, 600)
        .initBuffers(modelData)
        .render()
}

onMounted(() => {
    initWebGL()
})
</script>