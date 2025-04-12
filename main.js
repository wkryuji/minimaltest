// CDNからThree.js本体とPointerLockControlsを読み込む
import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.157.0/examples/jsm/controls/PointerLockControls.js';

// ログ確認
console.log("Main.js loaded: Three.js と PointerLockControls をCDNから読み込みました！");

// シーンとカメラ、レンダラーの設定
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// PointerLockControlsのインスタンス作成（document.bodyにロック対象）
const controls = new PointerLockControls(camera, document.body);

// クリックでロックを開始するイベントリスナー
document.body.addEventListener('click', () => {
  controls.lock();
});

// ロックイベントとアンロックイベントのリスナーでログ出力
controls.addEventListener('lock', () => {
  console.log("Pointer is locked!");
});
controls.addEventListener('unlock', () => {
  console.log("Pointer is unlocked!");
});

// 簡単なシーン用オブジェクト（赤い立方体）を追加
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// カメラ位置
camera.position.z = 5;

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  // キューブの回転を更新
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();