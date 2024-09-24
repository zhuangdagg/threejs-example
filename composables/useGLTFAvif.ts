import {
    Color,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default function useGLTFAvif() {
    let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer;

    function init(dom: HTMLElement) {
        const { clientWidth: w, clientHeight: h } = dom
        scene = new Scene()
        scene.background = new Color( 0xf6eedc );

        camera = new PerspectiveCamera(45, w/h, 1, 100)
        camera.position.set(1.5, 4, 9)

        initRenderer(dom)
        orbitControls()

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/libs/draco/gltf/' );
        loader.setDRACOLoader( dracoLoader );
        loader.setPath( '/model/AVIFTest/' );
        loader.load( 'forest_house.glb', function ( gltf ) {

            scene.add( gltf.scene );

            render();

        } );
    }

    function initRenderer(dom: HTMLElement) {
        renderer = new WebGLRenderer({ antialias: true })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(dom.clientWidth, dom.clientHeight)

        dom.appendChild(renderer.domElement)
    }

    function orbitControls() {
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.addEventListener('change', render)
    }

    function render() {
        renderer.render(scene, camera)
    }

    const instance = {
        init,
    }

    return instance
}