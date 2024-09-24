<template>
    <div class="h-full p-4 overflow-hidden">
        <video ref="videoRef" class="h-3/5 border-2 absolute top-full">
            <div>不支持视频播放</div>
        </video>
        <div ref="canvasRef" class="h-full border-2"></div>
    </div>
</template>

<script setup lang="ts">
import useMorphFaceWebcam from '~/composables/useMorphFaceWebcam';


const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLElement>()

onMounted(async() => {
    // const taskVision = useTaskVision()
    // const faceLandmarker = await taskVision.initFaceLandmarker()
    // await taskVision.requestCamera(videoRef.value!)
    // setTimeout(() => {
    //     if(videoRef.value && videoRef.value.readyState >= HTMLMediaElement.HAVE_METADATA) {
    //         const result = faceLandmarker.detectForVideo(videoRef.value, Date.now())
    //         console.log(result)
    //     }
        
    // }, 10_000)

    const demo = useMorphFaceWebcam()
    demo.init(canvasRef.value!, videoRef.value!)
    
})
</script>