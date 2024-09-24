import {
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    ACESFilmicToneMapping,
    Color,
    EquirectangularReflectionMapping
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export default function useGLTFLoader() {
    let camera: PerspectiveCamera,
        scene: Scene,
        renderer: WebGLRenderer
    
    function init(dom: HTMLElement) {
        const { clientWidth: w, clientHeight: h } = dom
        camera = new PerspectiveCamera(45, w/h, 0.25, 20)
        camera.position.set(-1.8, 0.6, 2.7)

        scene = new Scene()
        // scene.add(new AmbientLight(0xffffff, 10))
        // const dirLight = new DirectionalLight(0xffffff, 1)
        // dirLight.position.set(1, 1, 1)
        // scene.add(dirLight)
        // scene.background = new Color(0xcccccc)
        // scene.environment = new Color(0xcccccc)
        renderer = new WebGLRenderer({ antialias: true })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(w, h)
        renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1;

        dom.appendChild(renderer.domElement)

        selectBg()

        const loader = new GLTFLoader().setPath('/model/DamagedHelmet/glTF/')
        loader.load('DamagedHelmet.gltf', async function(gltf) {
            const model = gltf.scene
            await renderer.compileAsync(model, camera, scene)
            scene.add(model)

            render()
        })
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.addEventListener('change', render)
        controls.target.set( 0, 0, - 0.2 );

    }

    function selectBg(name: string = 'moonless_golf_1k') {
        new RGBELoader().setPath('/textures/equirectangular/')
            .load( name + '.hdr', (texture) => {
                texture.mapping = EquirectangularReflectionMapping

                scene.background = texture
                scene.environment = texture

                render()
            })
    }

    function render() {
        renderer.render(scene, camera)
    }

    const instance = {
        init, render, selectBg
    }
    return instance
}