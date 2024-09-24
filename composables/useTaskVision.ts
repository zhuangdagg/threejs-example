import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'



export default function useTaskVision() {
    const BASE_PATH = {
        vision: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',

    }
    async function initFaceLandmarker() {
        const wasmFileset = await FilesetResolver.forVisionTasks(BASE_PATH.vision)

        const faceLandmarker = await FaceLandmarker.createFromOptions(wasmFileset, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'GPU'
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: 'VIDEO', // 'IMAGE'
            numFaces: 1
        })
        return faceLandmarker
    }

    async function requestCamera(video: HTMLVideoElement) {
        if(navigator && navigator.mediaDevices) {
            await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user'}})
                .then((stream) => {
                    video.srcObject = stream;
                    video.play()
                })
                .catch(console.error)
        }
    }

    return {
        initFaceLandmarker,
        requestCamera,
        
    }
}