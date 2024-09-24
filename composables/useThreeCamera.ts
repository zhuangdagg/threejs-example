import * as t from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'

export default function useThreeCamera() {
    const scene = new t.Scene()
    const renderer = new t.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    
    let camera: t.PerspectiveCamera, 
        cameraHelper: t.CameraHelper,
        domElement: HTMLElement, 

        stats: Stats,
        outCamera: t.PerspectiveCamera;

    // 添加一些物体
    const mesh = [
        new t.Mesh(
            new t.SphereGeometry(20, 16, 8),
            new t.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
        ),
        new t.Mesh(
            new t.SphereGeometry(5, 16, 8),
            new t.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
        ),
    ]
    mesh[1].position.y = 50
    scene.add(
        ...mesh
    )

    function mount(dom: HTMLElement) {
        const { clientWidth: w, clientHeight: h } = dom
        domElement = dom
        camera = new t.PerspectiveCamera(30, w/(2*h), 50, 200)
        camera.position.z = 100
        camera.lookAt(scene.position)
        cameraHelper = new t.CameraHelper(camera)

        outCamera = new t.PerspectiveCamera(40, w/(2*h), 1, 1000)
        outCamera.position.z = 500
        outCamera.lookAt(camera.position)
        scene.add(camera, cameraHelper, outCamera)

        renderer.setSize(w, h)
        renderer.setScissorTest(true)
        dom.appendChild(renderer.domElement)

        stats = new Stats();
		dom.appendChild( stats.dom );
        renderer.setAnimationLoop( animate );
        return instance
    }

    function addControls() {
        const controls = new OrbitControls(camera, renderer.domElement)
        // controls.addEventListener('change', render)
        // new OrbitControls(outCamera, renderer.domElement)

        return instance
    }

    function animate() {

        render();
        stats.update();

    }



    function render() {
        const { clientWidth: w, clientHeight: h } = domElement
        cameraHelper.visible = false;
        renderer.setClearColor(0x000000, 1)
        renderer.setScissor(0, 0, w/2, h)
        renderer.setViewport(0, 0, w/2, h)
        renderer.render(scene, camera)


        cameraHelper.visible = true;
        renderer.setClearColor(0x000011, 1)
        renderer.setScissor(w/2, 0, w / 2, h)
        renderer.setViewport(w/2, 0, w/ 2, h)

        renderer.render(scene, outCamera)
    }

    const instance = {
        mount,
        render,
        addControls
    }

    return instance
}