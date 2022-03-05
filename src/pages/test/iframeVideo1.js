
import { useEffect } from 'react'
import { ArToolkitProfile, ArToolkitContext, ArToolkitSource, ArMarkerControls } from '@ar-js-org/ar.js/three.js/build/ar-threex'
import * as THREE from 'three'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

const Element = function (id, x, y, z, ry) {
  const div = document.createElement('div')
  div.style.width = '480px'
  div.style.height = '360px'
  div.style.backgroundColor = '#000'
  // div.innerHTML = '1133121323'
  const iframe = document.createElement('iframe')
  iframe.style.width = '480px'
  iframe.style.height = '360px'
  iframe.style.border = '0px'
  iframe.src = ['https://www.youtube.com/embed/', id, '?rel=0'].join('')
  div.appendChild(iframe)
  const object = new CSS3DObject(div)
  object.position.set(x, y, z)
  object.rotation.y = ry
  // 一開始要默認不顯示，否則會在未掃描的時候直接顯示在畫面中
  object.visible = true
  return object
}

export default function Arjs ({ item }) {
  // const [loadingNum, setLoadingNum] = useState(0)
  useEffect(() => {
    // global.THREE = window.THREE = THREE
    ArToolkitContext.baseURL = './'
    // init renderer
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000)
    camera.position.set(500, 350, 750)
    const container = document.querySelector('#container')
    const renderer = new CSS3DRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = 0
    renderer.domElement.style.right = '0px'
    container.appendChild(renderer.domElement)

    const onRenderFcts = []

    // 這是總場景，最大的那個場景
    const scene = new THREE.Scene()

    // markerGroup.add(group)
    // scene.add(markerGroup)
    const controls = new TrackballControls(camera, renderer.domElement)
    controls.rotateSpeed = 4
    window.addEventListener('resize', onWindowResize, false)
    const blocker = document.getElementById('blocker')
    blocker.style.display = 'none'
    document.addEventListener('mousedown', function () { blocker.style.display = '' })
    document.addEventListener('mouseup', function () { blocker.style.display = 'none' })

    function onWindowResize () {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

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
    const markerGroup = new THREE.Group()
    scene.add(markerGroup)
    console.log(scene)
    // scene.rotation.set(1.56, 0, 0)
    scene.position.set(0, -100, 0)

    const markerControls = new ArMarkerControls(arToolkitContext, markerGroup, {
      type: 'pattern',
      patternUrl: '/markers/patt.hiro'
      // patternUrl: '/patt.hiro'
    })

    /// ///////////////////////////////////////////////////////////////////////////////
    // add an object in the scene
    /// ///////////////////////////////////////////////////////////////////////////////

    // const markerScene = new THREE.Scene()
    // markerGroup.add(markerScene)
    markerGroup.add(new Element('xBOqwRRj82A', 0, 0, 240, 0))
    markerGroup.add(new Element('x4q86IjJFag', 240, 0, 0, Math.PI / 2))
    markerGroup.add(new Element('JhngfOK_2-0', 0, 0, -240, Math.PI))
    markerGroup.add(new Element('Grg3461lAPg', -240, 0, 0, -Math.PI / 2))
    // 暴力監聽markerGroup是否在顯示狀態
    // setInterval(() => {
    //   if (markerGroup.visible !== markerGroup.children[0].visible) {
    //     markerGroup.children.forEach(function (object, item) { object.visible = markerGroup.visible })
    //   }
    // }, 1000)
    // 新模型
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
        style={{ top: '0px', left: '0px', width: '100%', height: '100%' }}
      />
      <div id='blocker' />
    </>
  )
}
