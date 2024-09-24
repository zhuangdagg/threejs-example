import {
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Fog, Color,
    Object3D,
    AnimationMixer,
    AnimationClip,
    AmbientLight,
    DirectionalLight,
    MeshNormalMaterial,
    Mesh,
    BoxGeometry,
    Raycaster,
    Vector2,
    Vector3,
    MeshPhongMaterial,
    TextureLoader,
    Euler,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GLTFLoader, } from 'three/addons/loaders/GLTFLoader.js'
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

// import {} from 'three/addons/helpers/r'

export default function useThreeDecal() {
    const scene = new Scene()
    scene.fog = new Fog(0x000000, 250, 1400)
    scene.background = new Color(0xcccccc) 

    scene.add(new AmbientLight(0xffffff, 1))
    const directLight = new DirectionalLight(0xffffff, 1)
    directLight.rotation.set(0, -1, 0)
    scene.add(directLight)

    const textureLoader = new TextureLoader()
    const decalDiffuse = textureLoader.load('/textures/decal/decal-diffuse.png')
    const decalNormal = textureLoader.load('/textures/decal/decal-normal.jpg')

    const renderer = new WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)

    let camera: PerspectiveCamera,
        domElement: HTMLElement,
        stats: Stats = new Stats(),
        mixer: AnimationMixer,
        last: number = 0,
        mouseHelper = new Mesh(new BoxGeometry(1, 1, 10), new MeshNormalMaterial()),
        mouse = new Vector2(),
        moved: boolean = false,
        raycaster = new Raycaster(),
        cactusMesh: any,
        interaction = {
            intersects: [],
            point: new Vector3(),
            normal: new Vector3()
        },
        decalMaterial = new MeshPhongMaterial( {
            specular: 0x444444,
            map: decalDiffuse,
            normalMap: decalNormal,
            normalScale: new Vector2( 1, 1 ),
            shininess: 30,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: - 4,
            wireframe: false
        } ),
        position = new Vector3(),
        orientation = new Euler(),
        decals = []

        scene.add(mouseHelper)
    
    function mount(dom: HTMLElement) {
        const { clientWidth: w, clientHeight: h } = dom
        domElement = dom
        camera = new PerspectiveCamera(30, w/h, 10, 200)
        camera.position.z = 100
        camera.lookAt(scene.position)

        addModel()

        renderer.setSize(w, h)
        renderer.setAnimationLoop(animate)

        dom.appendChild(renderer.domElement)
        dom.appendChild(stats.dom)

        addControls()

        domElement.addEventListener('pointermove', onPointerMove)
        domElement.addEventListener('pointerdown', (evt) => {
            moved = false
        })
        domElement.addEventListener('pointerup', (evt) => {
            if(!moved) {
                checkIntersection(evt.clientX, evt.clientY)
                if(interaction.intersects.length) {
                    shoot()
                }
            }
        })
        return instance
    }

    function addControls() {
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.addEventListener('change', () => {
            moved = true
        })
        return instance
    }

    function animate(time: number) {
        render();
        stats.update();
        mixer && mixer.update((time - last)/1000)
        last = time
    }

    function render() {
        renderer.render(scene, camera)
    }

    function add(...obj: Object3D[]) {
        scene.add(...obj)
    }

    function addModel() {
        const loader = new GLTFLoader()
        loader.load('/model/仙人掌_01.glb', (gltf) => {
            console.log({ gltf })
            gltf.scene.scale.set(4, 4, 4)
            scene.add(gltf.scene)
            cactusMesh = gltf.scene.children[5]
            mixer = new AnimationMixer(gltf.scene)
            const clip =  AnimationClip.findByName(gltf.animations, '骨架动作.001')
            const action = mixer.clipAction(clip)
            action.play()
        }, console.log, console.error)
    }

    function onPointerMove(evt: PointerEvent) {
        if(evt.isPrimary) {
            checkIntersection(evt.clientX, evt.clientY)
        }
    }

    function checkIntersection(x:number, y: number) {
        const { clientWidth: w, clientHeight: h } = domElement

        mouse.x = x / w * 2 - 1;
        mouse.y = - (y/h) * 2 + 1
        raycaster.setFromCamera( mouse, camera );

        interaction.intersects = raycaster.intersectObject(cactusMesh, false )
        if(interaction.intersects.length) {
            const { point, face } = interaction.intersects[0] as any
            const n = face!.normal.clone();
            n.transformDirection( cactusMesh.matrixWorld );
            n.multiplyScalar( 10 );
            n.add(point );
            mouseHelper.position.copy(point)
            mouseHelper.lookAt(n)
        }
    }

    function shoot() {
        position.copy(mouseHelper.position)
        orientation.copy(mouseHelper.rotation)

        const material = decalMaterial.clone()
        material.color.setHex(Math.random() * 0xffffff)

        const m = new Mesh(new DecalGeometry(cactusMesh, position, orientation, new Vector3(10, 10, 10)), material)
        m.renderOrder = decals.length

        decals.push(m)
        scene.add(m)
    }
    
    const instance = {
        mount,
        add
    }

    return instance
}