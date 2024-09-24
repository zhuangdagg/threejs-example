import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

import useTaskVision from './useTaskVision';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';

export default function useMorphFaceWebcam() {
    const blendshapesMap = {
        // '_neutral': '',
        'browDownLeft': 'browDown_L',
        'browDownRight': 'browDown_R',
        'browInnerUp': 'browInnerUp',
        'browOuterUpLeft': 'browOuterUp_L',
        'browOuterUpRight': 'browOuterUp_R',
        'cheekPuff': 'cheekPuff',
        'cheekSquintLeft': 'cheekSquint_L',
        'cheekSquintRight': 'cheekSquint_R',
        'eyeBlinkLeft': 'eyeBlink_L',
        'eyeBlinkRight': 'eyeBlink_R',
        'eyeLookDownLeft': 'eyeLookDown_L',
        'eyeLookDownRight': 'eyeLookDown_R',
        'eyeLookInLeft': 'eyeLookIn_L',
        'eyeLookInRight': 'eyeLookIn_R',
        'eyeLookOutLeft': 'eyeLookOut_L',
        'eyeLookOutRight': 'eyeLookOut_R',
        'eyeLookUpLeft': 'eyeLookUp_L',
        'eyeLookUpRight': 'eyeLookUp_R',
        'eyeSquintLeft': 'eyeSquint_L',
        'eyeSquintRight': 'eyeSquint_R',
        'eyeWideLeft': 'eyeWide_L',
        'eyeWideRight': 'eyeWide_R',
        'jawForward': 'jawForward',
        'jawLeft': 'jawLeft',
        'jawOpen': 'jawOpen',
        'jawRight': 'jawRight',
        'mouthClose': 'mouthClose',
        'mouthDimpleLeft': 'mouthDimple_L',
        'mouthDimpleRight': 'mouthDimple_R',
        'mouthFrownLeft': 'mouthFrown_L',
        'mouthFrownRight': 'mouthFrown_R',
        'mouthFunnel': 'mouthFunnel',
        'mouthLeft': 'mouthLeft',
        'mouthLowerDownLeft': 'mouthLowerDown_L',
        'mouthLowerDownRight': 'mouthLowerDown_R',
        'mouthPressLeft': 'mouthPress_L',
        'mouthPressRight': 'mouthPress_R',
        'mouthPucker': 'mouthPucker',
        'mouthRight': 'mouthRight',
        'mouthRollLower': 'mouthRollLower',
        'mouthRollUpper': 'mouthRollUpper',
        'mouthShrugLower': 'mouthShrugLower',
        'mouthShrugUpper': 'mouthShrugUpper',
        'mouthSmileLeft': 'mouthSmile_L',
        'mouthSmileRight': 'mouthSmile_R',
        'mouthStretchLeft': 'mouthStretch_L',
        'mouthStretchRight': 'mouthStretch_R',
        'mouthUpperUpLeft': 'mouthUpperUp_L',
        'mouthUpperUpRight': 'mouthUpperUp_R',
        'noseSneerLeft': 'noseSneer_L',
        'noseSneerRight': 'noseSneer_R',
        // '': 'tongueOut'
    };

    let scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer

    let face: THREE.Object3D, eyeL: THREE.Object3D, eyeR: THREE.Object3D;
	const eyeRotationLimit = THREE.MathUtils.degToRad( 30 );

    const transform = new THREE.Object3D();

    let video: HTMLVideoElement;

    const taskVision = useTaskVision()

    let faceLandmarker: FaceLandmarker

    function init(dom: HTMLElement, videoDom: HTMLVideoElement) {

        video = videoDom
        const { clientWidth: w, clientHeight: h } = dom

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( w, h );
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        dom.appendChild( renderer.domElement );

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.z = 5;

        scene = new THREE.Scene();
        scene.scale.x = - 1;

        const environment = new RoomEnvironment();
        const pmremGenerator = new THREE.PMREMGenerator( renderer );

        scene.background = new THREE.Color( 0x666666 );
        scene.environment = pmremGenerator.fromScene( environment ).texture;

        const controls = new OrbitControls( camera, renderer.domElement );

        loadFace()
    }

    function loadFace() {
        const ktx2Loader = new KTX2Loader()
            .setTranscoderPath( 'jsm/libs/basis/' )
            .detectSupport( renderer );

        new GLTFLoader()
            .setKTX2Loader( ktx2Loader )
            .setMeshoptDecoder( MeshoptDecoder )
            .load( '/model/gltf/facecap.glb', async( gltf ) => {

                const mesh = gltf.scene.children[ 0 ];
                scene.add( mesh );

                const head: any = mesh.getObjectByName( 'mesh_2' )!;
                head.material = new THREE.MeshNormalMaterial();

                face = mesh.getObjectByName( 'mesh_2' )!;
                eyeL = mesh.getObjectByName( 'eyeLeft' )!;
                eyeR = mesh.getObjectByName( 'eyeRight' )!;


                faceLandmarker = await taskVision.initFaceLandmarker()
                await taskVision.requestCamera(video!)
                renderer.setAnimationLoop(animate)
            } );
    }

    function setVideo(dom: HTMLVideoElement) {
        video = dom
    }

    function animate() {
        if ( video.readyState >= HTMLMediaElement.HAVE_METADATA ) {

            const results = faceLandmarker.detectForVideo( video, Date.now() );

            if ( results.facialTransformationMatrixes.length > 0 ) {

                const facialTransformationMatrixes = results.facialTransformationMatrixes[ 0 ].data;

                transform.matrix.fromArray( facialTransformationMatrixes );
                transform.matrix.decompose( transform.position, transform.quaternion, transform.scale );

                const object = scene.getObjectByName( 'grp_transform' )!;

                object.position.x = transform.position.x;
                object.position.y = transform.position.z + 40;
                object.position.z = - transform.position.y;

                object.rotation.x = transform.rotation.x;
                object.rotation.y = transform.rotation.z;
                object.rotation.z = - transform.rotation.y;

            }

            if ( results.faceBlendshapes.length > 0 ) {
    
                const faceBlendshapes = results.faceBlendshapes[ 0 ].categories;
    
                // Morph values does not exist on the eye meshes, so we map the eyes blendshape score into rotation values
                const eyeScore = {
                    leftHorizontal: 0,
                    rightHorizontal: 0,
                    leftVertical: 0,
                    rightVertical: 0,
                      };

                for ( const blendshape of faceBlendshapes ) {

                    const categoryName = blendshape.categoryName;
                    const score = blendshape.score;

                    const index = face.morphTargetDictionary[ blendshapesMap[ categoryName ] ];

                    if ( index !== undefined ) {

                        face.morphTargetInfluences[ index ] = score;

                    }

                    // There are two blendshape for movement on each axis (up/down , in/out)
                    // Add one and subtract the other to get the final score in -1 to 1 range
                    switch ( categoryName ) {

                        case 'eyeLookInLeft':
                            eyeScore.leftHorizontal += score;
                            break;
                        case 'eyeLookOutLeft':
                            eyeScore.leftHorizontal -= score;
                            break;
                        case 'eyeLookInRight':
                            eyeScore.rightHorizontal -= score;
                            break;
                        case 'eyeLookOutRight':
                            eyeScore.rightHorizontal += score;
                            break;
                        case 'eyeLookUpLeft':
                            eyeScore.leftVertical -= score;
                            break;
                        case 'eyeLookDownLeft':
                            eyeScore.leftVertical += score;
                            break;
                        case 'eyeLookUpRight':
                            eyeScore.rightVertical -= score;
                            break;
                        case 'eyeLookDownRight':
                            eyeScore.rightVertical += score;
                            break;

                    }

                }

                eyeL.rotation.z = eyeScore.leftHorizontal * eyeRotationLimit;
                eyeR.rotation.z = eyeScore.rightHorizontal * eyeRotationLimit;
                eyeL.rotation.x = eyeScore.leftVertical * eyeRotationLimit;
                eyeR.rotation.x = eyeScore.rightVertical * eyeRotationLimit;
    
            }

        }

        // videomesh.scale.x = video.videoWidth / 100;
        // videomesh.scale.y = video.videoHeight / 100;

        renderer.render( scene, camera );

        // controls.update();
    }

    return {
        init,
        setVideo
    }
}