import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

console.log("✅ Solar System Viewer 起動");

// === HTMLボタン追加 ===
const followBtn = document.createElement('button');
followBtn.textContent = '🌍 地球を追う';
followBtn.style.cssText = 'position: absolute; top: 12px; left: 12px; z-index: 100;';
document.body.appendChild(followBtn);

const resetBtn = document.createElement('button');
resetBtn.textContent = '🔄 元に戻す';
resetBtn.style.cssText = 'position: absolute; top: 12px; left: 130px; z-index: 100;';
document.body.appendChild(resetBtn);

// === 基本設定 ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 25);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// リサイズ時のカメラ補正
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === 光源 ===
scene.add(new THREE.AmbientLight(0x333333, 1.2));
const sunLight = new THREE.PointLight(0xffffff, 200, 100);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// === 太陽 ===
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('textures/sun.jpg');

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 64, 64),
  new THREE.MeshStandardMaterial({
    map: sunTexture,
    emissiveMap: sunTexture,
    emissive: new THREE.Color(0xffcc33),
    emissiveIntensity: 2,
    roughness: 0.3,
    metalness: 0.8
  })
);
scene.add(sun);

// === 公転＆自転データ ===
const orbitRaw = [
  { name: "水星", color: 0xaaaaaa, size: 0.15, radius: 3, days: 88, rotationHours: 1407.6 },
  { name: "金星", color: 0xffcc66, size: 0.25, radius: 5, days: 225, rotationHours: -5832 },
  { name: "地球", color: 0x3366ff, size: 0.28, radius: 7, days: 365, rotationHours: 24 },
  { name: "火星", color: 0xff4422, size: 0.22, radius: 9, days: 687, rotationHours: 24.6 },
  { name: "木星", color: 0xffddaa, size: 0.5, radius: 15, days: 4333, rotationHours: 9.9 },
  { name: "土星", color: 0xffffcc, size: 0.45, radius: 18, days: 10759, rotationHours: 10.7 },
  { name: "天王星", color: 0x66ffff, size: 0.35, radius: 21, days: 30685, rotationHours: -17.2 },
  { name: "海王星", color: 0x3366cc, size: 0.35, radius: 24, days: 60190, rotationHours: 16.1 },
];

const earthOrbitSeconds = 30;
const dayToSec = earthOrbitSeconds / 365;
const orbitInclinations = [7, 3.4, 0, 1.8, 1.3, 2.5, 0.8, 1.8].map(d => THREE.MathUtils.degToRad(d));

const planets = [];
let earthObject = null;

orbitRaw.forEach((data, i) => {
  const orbitGroup = new THREE.Object3D();
  orbitGroup.rotation.z = orbitInclinations[i];

  const ringGeometry = new THREE.RingGeometry(data.radius - 0.02, data.radius + 0.02, 256);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  orbitGroup.add(ring);

  const orbitSpeed = (2 * Math.PI) / (data.days * dayToSec);
  const rotationSpeed = (2 * Math.PI) / ((Math.abs(data.rotationHours) * 3600) / (earthOrbitSeconds / 365));
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: data.color });
  const planet = new THREE.Mesh(geometry, material);
  planet.userData = {
    radius: data.radius,
    angle: Math.random() * Math.PI * 2,
    orbitSpeed,
    rotationSpeed: data.rotationHours < 0 ? -rotationSpeed : rotationSpeed
  };

  if (data.name === "地球") {
    earthObject = planet;
    const moonGroup = new THREE.Object3D();
    const moonOrbitRadius = 0.5;
    const moonOrbitSpeed = (2 * Math.PI) / 2.0;
    const moonGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.userData = {
      angle: Math.random() * Math.PI * 2,
      orbitRadius: moonOrbitRadius,
      orbitSpeed: moonOrbitSpeed
    };
    moonGroup.add(moon);
    planet.add(moonGroup);
    planet.userData.moon = { mesh: moon, group: moonGroup };
  }

  orbitGroup.add(planet);
  scene.add(orbitGroup);
  planets.push({ mesh: planet, group: orbitGroup });
});

// === カメラ操作 ===
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => controls.lock());

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

document.addEventListener('keydown', e => {
  if (e.code === 'KeyW') moveForward = true;
  if (e.code === 'KeyS') moveBackward = true;
  if (e.code === 'KeyA') moveLeft = true;
  if (e.code === 'KeyD') moveRight = true;
});
document.addEventListener('keyup', e => {
  if (e.code === 'KeyW') moveForward = false;
  if (e.code === 'KeyS') moveBackward = false;
  if (e.code === 'KeyA') moveLeft = false;
  if (e.code === 'KeyD') moveRight = false;
});

// === カメラ追尾切替 ===
let followEarth = false;
followBtn.addEventListener('click', () => {
  followEarth = true;
  controls.unlock();
});
resetBtn.addEventListener('click', () => {
  followEarth = false;
  camera.position.set(0, 10, 25);
  camera.lookAt(0, 0, 0);
});

// === アニメーションループ ===
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  sun.rotation.y += 0.05 * delta;

  planets.forEach(obj => {
    const p = obj.mesh;
    p.userData.angle += p.userData.orbitSpeed * delta;
    const r = p.userData.radius;
    p.position.set(Math.cos(p.userData.angle) * r, 0, Math.sin(p.userData.angle) * r);
    p.rotation.y += p.userData.rotationSpeed * delta;
    if (p.userData.moon) {
      const moon = p.userData.moon.mesh;
      moon.userData.angle += moon.userData.orbitSpeed * delta;
      moon.position.set(
        Math.cos(moon.userData.angle) * moon.userData.orbitRadius,
        0,
        Math.sin(moon.userData.angle) * moon.userData.orbitRadius
      );
    }
  });

  if (followEarth && earthObject) {
    const offset = new THREE.Vector3(2, 1.5, 2);
    const target = earthObject.getWorldPosition(new THREE.Vector3()).clone().add(offset);
    camera.position.lerp(target, 0.1);
    camera.lookAt(earthObject.getWorldPosition(new THREE.Vector3()));
  } else {
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    const speed = 0.1;
    if (controls.isLocked) {
      velocity.z = direction.z * speed;
      velocity.x = direction.x * speed;
      controls.moveRight(velocity.x);
      controls.moveForward(velocity.z);
    }
  }

  renderer.render(scene, camera);
}
animate();