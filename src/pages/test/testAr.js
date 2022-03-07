
import { useEffect, useState } from 'react'
import { ArToolkitProfile, ArToolkitContext, ArToolkitSource, ArMarkerControls } from '@ar-js-org/ar.js/three.js/build/ar-threex'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
// import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
// import Loading from '../loading'
import Loading from '../../client/components/loading'

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
      video.style.objectFit = 'cover'
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
      // patternUrl: 'https://macaoar.s3.ap-east-1.amazonaws.com/web-ar/items/cl039rsjx005909lb2ddieuod/compiled/ea0ab54789d4ee22c77ac64b151990ee-352-5051-016.patt'
      patternUrl: '/markers/patt.hiro'
    })

    /// ///////////////////////////////////////////////////////////////////////////////
    // add an object in the scene
    /// ///////////////////////////////////////////////////////////////////////////////

    const markerScene = new THREE.Scene()
    markerGroup.add(markerScene)
    // 新模型
    const loader = new GLTFLoader()
    loader.load('/models/jaychou.glb', gltf => {
      // const P = Math.PI
      // const position = item.position?.split(' ')
      // const rotation = item.rotation?.split(' ')
      // const scale = item.scale?.split(' ')
      // gltf.scene.position.set(position[0] || 0, position[1] || 0, position[2] || 0)
      gltf.scene.scale.set(0.5, 0.5, 0.5)
      markerScene.add(gltf.scene)
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
      {/* <img src='https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png' style={{ width: '400px', height: '400px' }} /> */}
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
