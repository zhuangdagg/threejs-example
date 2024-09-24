import { 
    Scene, PerspectiveCamera, WebGLRenderer, Fog,
    BoxGeometry, MeshBasicMaterial, Mesh, Line, LineBasicMaterial,
    MeshPhongMaterial,
    BufferGeometry, Vector3, DirectionalLight, PointLight,
    SphereGeometry, MeshPhysicalMaterial,
    Color,
    AnimationMixer, AnimationClip
} from 'three'

import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader, } from 'three/addons/loaders/GLTFLoader.js'

export default function useThreeDemo(dom: HTMLDivElement) {
    const [result, error] = useShared().isWebGL2Available()
    if(!result) {
        dom.appendChild(error!)
        throw('useThreeDemo error:' + error)
    }
    const scene = new Scene(),
          camera = new PerspectiveCamera(30, dom.clientWidth/dom.clientHeight, 1, 1000),
          renderer = new WebGLRenderer({ antialias: true }) // 抗锯齿打开

    scene.fog = new Fog(0x000000, 250, 1400)
    scene.background = new Color(0xcccccc)     
    renderer.setSize(dom.clientWidth, dom.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    dom.appendChild(renderer.domElement)

    const cube = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshPhongMaterial({ color: 0x00666604 })
    )

    const lineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(-100, 0, 0),
        new Vector3(0, 0, 0),
        new Vector3(0, -5, 100),
    ])
    const line = new Line(
        lineGeometry,
        new LineBasicMaterial({ color: 0xee0000, opacity: 0 })
    )

    // 光源
    const dirLight = new DirectionalLight(0xffffff, 1)
    dirLight.position.set(0, 0, 1).normalize()

    const pointLight = new PointLight(0x004400, 4.5, 0, 0)
    pointLight.position.set(-50, 50, 50)
    pointLight.lookAt(cube.position)
    scene.add(
        dirLight, pointLight,
        // cube, 
        line,
        
    )

    camera.position.z = 100
    cube.rotation.x += 0.5
    cube.rotation.y += 0.5

    cube.scale.set(20, 20, 20)

    addSphere(scene)

    addModel(scene)

    // const gl = renderer.getContext()
    // const maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
    // console.log({ maxVertexAttributes })  // 16

    // font
    loadFont().then((font) => {
        const textGeo = new TextGeometry('Fucking World', {
            font,
            size: 24,
            depth: 2,
            curveSegments: 10,

            bevelThickness: 2,
            bevelSize: 1.5,
            bevelEnabled: true
        })

        // 计算text包围盒
        textGeo.computeBoundingBox()
        const centerOffset = - 0.5 * (textGeo.boundingBox?.max?.x || 0 - (textGeo.boundingBox?.min?.x || 0))

        const materials = [
            new MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
            new MeshPhongMaterial( { color: 0xffffff } ) // side
        ];

        const textMesh = new Mesh(textGeo, materials)

        textMesh.position.set(centerOffset, 0, 30)
        textMesh.rotation.y += Math.PI / 4

        scene.add(textMesh)

        console.log(scene)
        render()
    })

    // controls
    const controls = new OrbitControls(camera, renderer.domElement)

    controls.minDistance = 50
    controls.maxDistance = 100

    let lastTime: number = 0

    
    function render() {
        requestAnimationFrame(render)
        renderer.render(scene, camera)
        
    }

    return {
        render
    }
}

function loadFont() {
    const loader = new FontLoader()
    return new Promise<Font>((resolve, reject) => {
        loader.load('/fonts/optimer_bold.typeface.json', resolve, console.log, reject)
    }) 
}

function addSphere(scene: Scene) {
    const geometry = new SphereGeometry(1, 16, 16)
    for(let x = 0; x <= 10; x++)
        for(let y = 0; y <= 10; y++) {
            const material = new MeshPhysicalMaterial({
                roughness: x / 10,
                metalness: y / 10,
                color: 0xffffff,
            })
            const sphere = new Mesh(geometry, material)
            sphere.position.set(3*(x-5) + 20, 3*(y-5), -15)
            // sphere.matrixAutoUpdate = false
            // sphere.updateMatrix()
            scene.add(sphere)
        }
}

function addModel(scene: Scene) {
    const loader = new GLTFLoader()
    loader.load('/model/仙人掌_01.glb', (gltf) => {
        console.log({ gltf })
        gltf.scene.scale.set(4, 4, 4)
        scene.add(gltf.scene)

        const mixer = new AnimationMixer(gltf.scene)
        const clip =  AnimationClip.findByName(gltf.animations, '骨架动作.001')
        const action = mixer.clipAction(clip)
        action.play()
        loop(mixer)
    }, console.log, console.error)
}

function loop(mixer: AnimationMixer) {
    let last = 0
    const _loop = (time: number = 0) => {
        requestAnimationFrame(_loop)

        mixer.update((time - last)/ 2000)
        last = time
    }
    _loop()
}