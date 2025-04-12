// ✅ Import Map に対応した読み込み
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

console.log("✅ PointerLockControls 読み込み成功！");

// Three.js の最小構成
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 🔧 PointerLockControls 設定
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => {
  controls.lock();
});

controls.addEventListener('lock', () => {
  console.log("🔓 Pointer is locked");
});
controls.addEventListener('unlock', () => {
  console.log("🔒 Pointer is unlocked");
});

// 🎲 表示用の立方体
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(cube);

camera.position.z = 5;

// 🎬 アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();