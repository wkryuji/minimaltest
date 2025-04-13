// === Three.js を使用したテクスチャ付き太陽系モデル ===
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const initialCameraPosition = new THREE.Vector3(20, 10, 25);
const initialCameraTarget = new THREE.Vector3(0, 0, 0);

// === UIボタン ===
const followBtn = document.createElement('button');
followBtn.textContent = '🌍 地球を追う';
followBtn.style.cssText = 'position: absolute; top: 12px; left: 12px; z-index: 100;';
document.body.appendChild(followBtn);

const resetBtn = document.createElement('button');
resetBtn.textContent = '🔄 元に戻す';
resetBtn.style.cssText = 'position: absolute; top: 12px; left: 130px; z-index: 100;';
document.body.appendChild(resetBtn);

let orbitSpeedMultiplier = 1.0;
let rotationSpeedMultiplier = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(initialCameraPosition);
camera.lookAt(initialCameraTarget);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x333333, 1.2));
const sunLight = new THREE.PointLight(0xffffff, 200, 100);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const textureLoader = new THREE.TextureLoader();
const textures = {
  "水星": textureLoader.load('textures/2k_mercury.jpg'),
  "金星": textureLoader.load('textures/2k_venus_surface.jpg'),
  "地球": textureLoader.load('textures/2k_earth_daymap.jpg'),
  "地球雲": textureLoader.load('textures/2k_earth_clouds.jpg'),
  "火星": textureLoader.load('textures/2k_mars.jpg'),
  "木星": textureLoader.load('textures/2k_jupiter.jpg'),
  "土星": textureLoader.load('textures/2k_saturn.jpg'),
  "天王星": textureLoader.load('textures/2k_uranus.jpg'),
  "海王星": textureLoader.load('textures/2k_neptune.jpg'),
  "月": textureLoader.load('textures/2k_moon.jpg'),
  "太陽": textureLoader.load('textures/2k_sun.jpg')
};

// 星空背景
const starsTexture = textureLoader.load('textures/8k_stars_milky_way.jpg');
const skyGeo = new THREE.SphereGeometry(300, 64, 64);
const skyMat = new THREE.MeshBasicMaterial({ map: starsTexture, side: THREE.BackSide, depthWrite: false });
scene.add(new THREE.Mesh(skyGeo, skyMat));

// 太陽
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 64, 64),
  new THREE.MeshStandardMaterial({
    map: textures["太陽"],
    emissiveMap: textures["太陽"],
    emissive: new THREE.Color(0xffcc33),
    emissiveIntensity: 2,
    roughness: 0.3,
    metalness: 0.8
  })
);
scene.add(sun);

const orbitRaw = [
  { name: "水星", size: 0.15, radius: 3, days: 88, rotationHours: 1407.6 },
  { name: "金星", size: 0.25, radius: 5, days: 225, rotationHours: -5832 },
  { name: "地球", size: 0.28, radius: 7, days: 365, rotationHours: 24 },
  { name: "火星", size: 0.22, radius: 9, days: 687, rotationHours: 24.6 },
  { name: "木星", size: 0.5, radius: 15, days: 4333, rotationHours: 9.9 },
  { name: "土星", size: 0.45, radius: 18, days: 10759, rotationHours: 10.7 },
  { name: "天王星", size: 0.35, radius: 21, days: 30685, rotationHours: -17.2 },
  { name: "海王星", size: 0.35, radius: 24, days: 60190, rotationHours: 16.1 }
];

const earthOrbitSeconds = 20;
const dayToSec = earthOrbitSeconds / 365;
const orbitInclinations = [7, 3.4, 0, 1.8, 1.3, 2.5, 0.8, 1.8].map(d => THREE.MathUtils.degToRad(d));

const planets = [];
let earthObject = null;

orbitRaw.forEach((data, i) => {
  const orbitGroup = new THREE.Object3D();
  orbitGroup.rotation.z = orbitInclinations[i];

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(data.radius - 0.02, data.radius + 0.02, 256),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
  );
  ring.rotation.x = Math.PI / 2;
  orbitGroup.add(ring);

  const orbitSpeed = (2 * Math.PI) / (data.days * dayToSec);
  const rotationSpeed = (2 * Math.PI) / ((Math.abs(data.rotationHours) * 3600) / (earthOrbitSeconds / 365));
  const texture = textures[data.name];
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 32, 32),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  planet.userData = { radius: data.radius, angle: Math.random() * Math.PI * 2, orbitSpeed, rotationSpeed };

  if (data.name === "地球") {
    earthObject = planet;
    const moonGroup = new THREE.Object3D();
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ map: textures["月"] })
    );
    moon.userData = {
      angle: Math.random() * Math.PI * 2,
      orbitRadius: 0.5,
      orbitSpeed: (2 * Math.PI) / 2.0
    };
    moonGroup.add(moon);
    planet.add(moonGroup);
    planet.userData.moon = { mesh: moon, group: moonGroup };

    // 雲レイヤー
    const cloudGeometry = new THREE.SphereGeometry(data.size * 1.01, 32, 32);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: textures["地球雲"],
      transparent: true,
      opacity: 0.8
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planet.add(clouds);
    planet.userData.clouds = clouds;
    planet.rotation.z = THREE.MathUtils.degToRad(23.4); // 地軸の傾きを反映
  }

  if (data.name === "土星") {
    const saturnRingTex = textureLoader.load('textures/2k_saturn_ring_alpha.png');
    const saturnRing = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 1.2, 128),
      new THREE.MeshBasicMaterial({ map: saturnRingTex, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    saturnRing.rotation.x = Math.PI / 2.5;
    planet.add(saturnRing);
  }

  orbitGroup.add(planet);
  scene.add(orbitGroup);
  planets.push({ mesh: planet, group: orbitGroup });
});

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

let followEarth = false;
followBtn.addEventListener('click', () => {
  followEarth = true;
  controls.unlock();
});
resetBtn.addEventListener('click', () => {
  followEarth = false;
  camera.position.copy(initialCameraPosition);
  camera.lookAt(initialCameraTarget);
});

const speedLabel = document.createElement('div');
speedLabel.style.cssText = 'position: absolute; top: 50px; left: 12px; color: white; font-size: 14px; z-index: 100;';
speedLabel.textContent = '自転: 1.0x 公転: 1.0x';
document.body.appendChild(speedLabel);

const speedUpBtn = document.createElement('button');
speedUpBtn.textContent = '⏩ スピードアップ';
speedUpBtn.style.cssText = 'position: absolute; top: 80px; left: 12px; z-index: 100;';
document.body.appendChild(speedUpBtn);

const slowDownBtn = document.createElement('button');
slowDownBtn.textContent = '⏪ スピードダウン';
slowDownBtn.style.cssText = 'position: absolute; top: 80px; left: 150px; z-index: 100;';
document.body.appendChild(slowDownBtn);

speedUpBtn.addEventListener('click', () => {
  orbitSpeedMultiplier *= 2;
  rotationSpeedMultiplier *= 2;
  speedLabel.textContent = `自転: ${rotationSpeedMultiplier.toFixed(1)}x 公転: ${orbitSpeedMultiplier.toFixed(1)}x`;
});

slowDownBtn.addEventListener('click', () => {
  orbitSpeedMultiplier /= 2;
  rotationSpeedMultiplier /= 2;
  speedLabel.textContent = `自転: ${rotationSpeedMultiplier.toFixed(1)}x 公転: ${orbitSpeedMultiplier.toFixed(1)}x`;
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  sun.rotation.y += 0.05 * delta;

  planets.forEach(({ mesh: p }) => {
    p.userData.angle += p.userData.orbitSpeed * delta * orbitSpeedMultiplier;
    const r = p.userData.radius;
    p.position.set(Math.cos(p.userData.angle) * r, 0, Math.sin(p.userData.angle) * r);
    p.rotation.y += p.userData.rotationSpeed * delta * rotationSpeedMultiplier;

    if (p.userData.moon) {
      const moon = p.userData.moon.mesh;
      moon.userData.angle += moon.userData.orbitSpeed * delta * orbitSpeedMultiplier;
      moon.position.set(
        Math.cos(moon.userData.angle) * moon.userData.orbitRadius,
        0,
        Math.sin(moon.userData.angle) * moon.userData.orbitRadius
      );
      moon.rotation.y += 0.05 * delta * rotationSpeedMultiplier;
    }

    if (p.userData.clouds) {
      p.userData.clouds.rotation.y += 0.01 * delta * rotationSpeedMultiplier;
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
    if (controls.isLocked) {
      velocity.z = direction.z * 0.1;
      velocity.x = direction.x * 0.1;
      controls.moveRight(velocity.x);
      controls.moveForward(velocity.z);
    }
  }

  renderer.render(scene, camera);
}
animate();