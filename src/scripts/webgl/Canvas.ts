import * as THREE from 'three'
import { three } from './core/Three'
import fragmentShader from './shader/fragmentShader.glsl'
import vertexShader from './shader/vertexShader.glsl'

export class Canvas {
  private screen!: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>

  constructor(canvas: HTMLCanvasElement) {
    this.init(canvas)
    this.screen = this.createScreen()
    this.addEvents()
    three.animation(this.anime)
  }

  private init(canvas: HTMLCanvasElement) {
    three.setup(canvas)
    three.scene.background = new THREE.Color('#000')
    three.camera.position.z = 4

    three.controls.dampingFactor = 0.1
    three.controls.enableDamping = true
    three.controls.enablePan = false

    const axes = new THREE.AxesHelper(0.5)
    three.scene.add(axes)
  }

  private createScreen() {
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        uCameraPosition: { value: three.camera.position },
        uProjectionMatrixInverse: { value: three.camera.projectionMatrixInverse },
        uViewMatrixInverse: { value: three.camera.matrixWorld },
        uAspect: { value: three.size.aspect },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    three.scene.add(mesh)
    return mesh
  }

  private addEvents() {
    three.addEventListener('resize', () => {
      this.screen.material.uniforms.uAspect.value = three.size.aspect
    })
  }

  private anime = () => {
    three.controls.update()

    const unifroms = this.screen.material.uniforms
    unifroms.uProjectionMatrixInverse.value = three.camera.projectionMatrixInverse
    unifroms.uCameraPosition.value = three.camera.position
    unifroms.uViewMatrixInverse.value = three.camera.matrixWorld
    unifroms.uTime.value += three.time.delta

    three.render()
  }

  dispose() {
    three.dispose()
  }
}
