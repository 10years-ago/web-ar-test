import React, { useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
import Loading from '../loading'

const MindARViewer = ({ item }) => {
  const [loadingNum, setLoadingNum] = useState(0)
  const sceneRef = useRef(null)
  useEffect(() => {
    require('mind-ar/dist/mindar-image-three.prod.js')
    require('mind-ar')
    if (sceneRef?.current) {
      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.querySelector('#container'),
        imageTargetSrc: item.markerCompiled
      })
      // ！！！！！！一定，切記這個模型的處理和顯示必須只能執行一次，如果放在useEffect外的話，會發生異常的抖動
      const THREE = window.MINDAR.IMAGE.THREE
      const { renderer, scene, camera } = mindarThree
      const anchor = mindarThree.addAnchor(0)

      // 讓gltf模型擁有顏色
      renderer.alpha = true
      renderer.physicalCorrectLights = true
      renderer.premultipliedAlpha = true
      renderer.antialias = true
      renderer.logarithmicDepthBuffer = true
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.gammaOutput = true
      renderer.physicallyCorrectLights = true

      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.top = '0px'
      renderer.domElement.style.right = '0px'

      const environment = new RoomEnvironment()
      const pmremGenerator = new THREE.PMREMGenerator(renderer)
      scene.environment = pmremGenerator.fromScene(environment).texture

      // 這個mindAR貌似不支持three的透視相機，
      // mindarThree.camera.far = 20
      // mindarThree.camera.near = 0.1

      const loader = new GLTFLoader()
      loader.load(item.model, gltf => {
        const P = Math.PI
        const position = item.position?.split(' ')
        const rotation = item.rotation?.split(' ')
        const scale = item.scale?.split(' ')
        gltf.scene.position.set(position[0] || 0, position[1] || 0, position[2] || 0)
        // 這裡x軸要加90度才能和arjs保持一致
        gltf.scene.rotation.set(
          (rotation[0] ? (parseInt(rotation[0]) / 180) * P : 0) + (P / 2),
          rotation[1] ? (parseInt(rotation[1]) / 180) * P : 0,
          rotation[2] ? (parseInt(rotation[2]) / 180) * P : 0
        )
        gltf.scene.rotation.set(parseInt(rotation[0] || 0) + 1.35, rotation[1] || 0, rotation[2] || 0)
        gltf.scene.scale.set(scale[0] || 0, scale[1] || 0, scale[2] || 0)
        anchor.group.add(gltf.scene)
      },
      (xhr) => {
        if (loadingNum !== parseInt(xhr.loaded / xhr.total * 100)) {
          setLoadingNum(parseInt(xhr.loaded / xhr.total * 100))
        }
      }
      )
      mindarThree.start()

      // 調整顯示區域，適應移動端
      const video = document.getElementsByTagName('video')
      video[0].style.right = '0px'
      renderer.setAnimationLoop(() => {
        video[0].style.left = 'unset'
        renderer.render(scene, camera)
      })
    }
  }, [sceneRef])
  return (
    <>
      <div
        id='container' ref={sceneRef}
        style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}
      />
      {
        loadingNum < 100 && (
          <Loading
            isfull
            loadingStyle='opacity-80 bg-neutral-500 absolute top-0'
            textStyle='text-5xl'
            text={`${loadingNum}%...`}
          />
        )
        }
    </>
  )
}

export default MindARViewer
