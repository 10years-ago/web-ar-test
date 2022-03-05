
import { useEffect, useState } from 'react'
import { ArToolkitProfile, ArToolkitContext, ArToolkitSource, ArMarkerControls } from '@ar-js-org/ar.js/three.js/build/ar-threex'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
// import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import Loading from '../loading'

export default function Arjs ({ item }) {
  const [loadingNum, setLoadingNum] = useState(0)
  useEffect(() => {
    // global.THREE = window.THREE = THREE
    ArToolkitContext.baseURL = './'
    // init renderer
    const renderer = new THREE.WebGLRenderer({
      // antialias: true,
      alpha: true,
      physicalCorrectLights: true,
      premultipliedAlpha: true,
      antialias: true,
      logarithmicDepthBuffer: true,
      toneMapping: 1
    })
    // renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    // renderer.setPixelRatio( 2 );
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.right = '0px'
    const dom = document.querySelector('#container')
    dom.appendChild(renderer.domElement)
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.gammaOutput = true
    renderer.physicallyCorrectLights = true

    // array of functions for the rendering loop
    const onRenderFcts = []

    // 這是總場景，最大的那個場景
    const scene = new THREE.Scene()
    const environment = new RoomEnvironment()
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(environment).texture
    // var ambient = new THREE.AmbientLight(0x404040) // 环境光
    // // ambient.position.set(0, 100, 100)
    // scene.add(ambient)
    // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
    // hemiLight.position.set(0, 100, 0)
    // scene.add(hemiLight)
    // const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    // dirLight.position.set(0, 100, 100)
    // scene.add(dirLight)

    // const PointLight = new THREE.PointLight(0xffffff, 0x444444, 0.6)
    // PointLight.position.set(0, 100, 0)
    // scene.add(PointLight)

    // const SpotLight = new THREE.SpotLight(0xffffff, 0x444444, 0.6)
    // SpotLight.position.set(0, 100, 0)
    // scene.add(SpotLight)

    /// ///////////////////////////////////////////////////////////////////////////////
    // Initialize a basic camera
    /// ///////////////////////////////////////////////////////////////////////////////

    // Create a camera
    // const camera = new THREE.Camera()
    // const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 4000)
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20)
    // const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    // camera.position.set(-0.75, 0.7, 1.25)
    scene.add(camera)

    const artoolkitProfile = new ArToolkitProfile()
    artoolkitProfile.sourceWebcam()

    const arToolkitSource = new ArToolkitSource(artoolkitProfile.sourceParameters)

    arToolkitSource.init(function onReady () {
      setTimeout(() => {
        onResize()
      }, 2000)
    })

    // handle resize
    window.addEventListener('resize', function () {
      onResize()
    })
    function onResize () {
      const video = document.getElementById('arjs-video')
      video.style.right = '0px'
      video.style.left = 'unset'
      arToolkitSource.onResizeElement()
      arToolkitSource.copyElementSizeTo(renderer.domElement)
      if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
      }
    }

    /// /////////////////////////////////////////////////////////////////////////////
    //          initialize arToolkitContext
    /// /////////////////////////////////////////////////////////////////////////////

    // create atToolkitContext
    var arToolkitContext = new ArToolkitContext({
      // 我也不知道為什麼這個arjs一定要這個玩意，arToolkitContext
      cameraParametersUrl: '/camera_para.dat',
      detectionMode: 'mono'
    })

    // initialize it
    arToolkitContext.init(function onCompleted () {
    // copy projection matrix to camera
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
    })

    // update artoolkit on every frame
    onRenderFcts.push(function () {
      if (arToolkitSource.ready === false) return

      arToolkitContext.update(arToolkitSource.domElement)
    })

    /// /////////////////////////////////////////////////////////////////////////////
    //          Create a ArMarkerControls
    /// /////////////////////////////////////////////////////////////////////////////

    // 這裡存放marker掃描後出現的場景
    const markerGroup = new THREE.Group()
    scene.add(markerGroup)

    const markerControls = new ArMarkerControls(arToolkitContext, markerGroup, {
      type: 'pattern',
      patternUrl: item.markerCompiled
      // patternUrl: '/patt.hiro'
    })

    /// ///////////////////////////////////////////////////////////////////////////////
    // add an object in the scene
    /// ///////////////////////////////////////////////////////////////////////////////

    const markerScene = new THREE.Scene()
    markerGroup.add(markerScene)
    // 新模型
    const loader = new GLTFLoader()
    loader.load(item.model, gltf => {
      const P = Math.PI
      const position = item.position?.split(' ')
      const rotation = item.rotation?.split(' ')
      const scale = item.scale?.split(' ')
      gltf.scene.position.set(position[0] || 0, position[1] || 0, position[2] || 0)
      gltf.scene.rotation.set(
        rotation[0] ? (parseInt(rotation[0]) / 180) * P : 0,
        rotation[1] ? (parseInt(rotation[1]) / 180) * P : 0,
        rotation[2] ? (parseInt(rotation[2]) / 180) * P : 0
      )
      gltf.scene.scale.set(scale[0] || 0, scale[1] || 0, scale[2] || 0)
      markerScene.add(gltf.scene)
      // 啟動gui加速，加載一些複雜的素材
      // gltf.scene.traverse(function (child) {
      //   console.log(child.name) ↓↓↓↓↓↓↓
      // })
      // const object = gltf.scene.getObjectByName('SheenChair_fabric') // 這裡放上面的child.name
      // console.log(object)
      // const gui = new GUI()
      // gui.add(object.material, 'sheen', 0, 1)
      // gui.open()
    },
    (xhr) => {
      if (loadingNum !== parseInt(xhr.loaded / xhr.total * 100)) {
        setLoadingNum(parseInt(xhr.loaded / xhr.total * 100))
      }
    }
    )
    /// ///////////////////////////////////////////////////////////////////////////////
    //  render the whole thing on the page
    /// ///////////////////////////////////////////////////////////////////////////////
    onRenderFcts.push(function () {
      renderer.render(scene, camera)
    })

    // run the rendering loop
    let lastTimeMsec = null
    requestAnimationFrame(function animate (nowMsec) {
    // keep looping
      requestAnimationFrame(animate)
      // measure time
      lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
      const deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
      lastTimeMsec = nowMsec
      // call each update function
      onRenderFcts.forEach(function (onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)
      })
    })
  }, [])

  return (
    <>
      <div
        id='container'
      />
      {
        loadingNum < 100 && (
          <Loading
            isfull
            loadingStyle='opacity-80 bg-neutral-500'
            textStyle='text-5xl'
            text={`${loadingNum}%...`}
          />
        )
      }
      <style>
        {
        `
          body {
            overflow:hidden;
            height:unset
          }
        `
      }
      </style>
    </>
  )
}
