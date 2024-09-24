
import { VSMShadowMap, AnimationMixer, Clock, Color, 
    DirectionalLight, Fog, HemisphereLight, InstancedMesh, 
    Mesh, PerspectiveCamera, Scene, WebGLRenderer, PlaneGeometry, 
    MeshStandardMaterial, Matrix4,
    Raycaster,
    Vector2,
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default function useInstancedMeshDemo() {

    let scene: Scene,
        camera: PerspectiveCamera,
        renderer: WebGLRenderer,
        dummy: Mesh,
        dummyPos: any[] = new Array(100),
        instancedMesh: InstancedMesh,
        mixer: AnimationMixer,
        clock = new Clock(true),
        step = 1,
        raycaster = new Raycaster(),
        mouse = new Vector2(1, 1)
    
    const offset = 1000;
    const timeOffsets = new Float32Array(1024)
    timeOffsets.forEach((_, i, arr) => {
        arr[i] = Math.random() * 3
    })
        

    function init(dom: HTMLElement) {
        const { clientWidth: w, clientHeight: h } = dom
        scene = new Scene()
        scene.background = new Color(0x99ddff)
        scene.fog = new Fog(0x99ddff, 5000, 10000)

        setLight()
        loadHouse()

        camera = new PerspectiveCamera(45, w/h, 100, 10000)
        camera.position.set( 3000, 1500, 3000 );
        camera.lookAt( 0, 0, 0 );

        scene.add(camera)
        // ground
        const ground = new Mesh(
            new PlaneGeometry( 10000, 10000 ),
            new MeshStandardMaterial( { color: 0x669933, depthWrite: true } )
        );

        ground.rotation.x = - Math.PI / 2;

        ground.receiveShadow = true;
        scene.add( ground );

        renderer = new WebGLRenderer()
        renderer.setSize(w, h)
        dom.appendChild(renderer.domElement)
        renderer.setAnimationLoop(render)
        renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = VSMShadowMap;

        

        
        // new OrbitControls(camera, renderer.domElement)
        dom.addEventListener('mousemove', (evt) => {
            evt.preventDefault();
            mouse.x = (evt.clientX / dom.clientWidth)*2 - 1
            mouse.y = -(evt.clientY / dom.clientHeight)*2 + 1
        })

    }

    function render() {
        const time = clock.getElapsedTime();
        
        // const r = 3000;
        // camera.position.set( Math.sin( time / 10 ) * r, 1500 + 1000 * Math.cos( time / 5 ), Math.cos( time / 10 ) * r );
        // camera.lookAt( 0, 0, 0 );
        if ( instancedMesh ) {
            raycaster.setFromCamera(mouse, camera)
            const intersection = raycaster.intersectObject( instancedMesh );

            for ( let i = 0; i < 100; i ++ ) {

                mixer.setTime( time + timeOffsets[ i ] );
                instancedMesh.setMorphAt( i, dummy );
                // const x = dummy.position.x += (1 - Math.random() * 2)
                // dummy.updateMatrix();
                const random = (i%2 ? 1 : -1) * 1
                const [x, y, z] = dummyPos[i]
                dummyPos[i] = [x+random, 0, z]
                instancedMesh.setMatrixAt(i, new Matrix4().setPosition(...dummyPos[i]))
            }
            if(intersection.length > 0) {
                const instanceId = intersection[ 0 ].instanceId;
                let color = new Color();
                instancedMesh.getColorAt(instanceId!, color)

                if(!color.equals(new Color(0x000000))) {
                    color.set(0x000000)
                    instancedMesh.setColorAt( instanceId!, color);
                    instancedMesh.instanceColor!.needsUpdate = true;

                    renderer.domElement.setAttribute('style', 'cursor:pointer')
                }  
            } else {
                renderer.domElement.setAttribute('style', 'cursor:default')
            }
            
            instancedMesh.instanceMatrix.needsUpdate = true
            instancedMesh.morphTexture!.needsUpdate = true;

        }
        renderer.render(scene, camera)
    }

    function setLight() {
        const light = new DirectionalLight( 0xffffff, 1 );

        light.position.set( 200, 1000, 50 );

        light.castShadow = true;

        light.shadow.camera.left = - 5000;
        light.shadow.camera.right = 5000;
        light.shadow.camera.top = 5000;
        light.shadow.camera.bottom = - 5000;
        light.shadow.camera.far = 2000;

        light.shadow.bias = - 0.01;

        light.shadow.camera.updateProjectionMatrix();

        const hemi = new HemisphereLight( 0x99DDFF, 0x669933, 1 / 3 );

        scene.add(light, hemi)
    }

    function loadHouse() {
        const loader = new GLTFLoader()
        loader.load('/model/gltf/Horse.glb', (glb) => {
            dummy = glb.scene.children[0] as any
            instancedMesh = new InstancedMesh( dummy.geometry, dummy.material, 100 );

			instancedMesh.castShadow = true;


            for ( let x = 0, i = 0; x < 10; x ++ ) {

                for ( let y = 0; y < 10; y ++ ) {
                    dummyPos[i] = [offset - 300 * x + 200 * Math.random(), 0, offset - 300 * y]
                    dummy.position.set( ...dummyPos[i] );

                    dummy.updateMatrix();

                    instancedMesh.setMatrixAt( i, dummy.matrix );

                    instancedMesh.setColorAt( i, new Color( `hsl(${Math.random() * 360}, 50%, 66%)` ) );

                    i ++;
    
                }

    
            }

            scene.add( instancedMesh );

            mixer = new AnimationMixer( glb.scene );

            const action = mixer.clipAction( glb.animations[ 0 ] );

            action.play();
        })
    }

    const instance = {
        init,
    }
    return instance
}