import * as THREE from 'three';

const initialCameraPosition = new THREE.Vector3(20, 10, 25);
const initialCameraTarget = new THREE.Vector3(0, 0, 0);
let cameraTarget = new THREE.Vector3(0, 0, 0);
let followTargetName = null; // 追加
let camMode = 'move'; // 追加
let sizeMultiplier = 1.0; // 追加
function createCamButton(label, onClick) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.style.cssText = 'padding: 10px 16px; font-size: 16px;';
  btn.addEventListener('click', onClick);
  return btn;
}

function createCameraUI() { // 追加
  camBtnContainer.innerHTML = '';
  if (camMode === 'move') {
    [
      { label: '⬆ 上へ', action: () => { camera.position.y += 1; } },
      { label: '⬇ 下へ', action: () => { camera.position.y -= 1; } },
      { label: '◀ 左へ', action: () => { camera.position.x -= 1; } },
      { label: '▶ 右へ', action: () => { camera.position.x += 1; } },
      { label: '🔼 前へ', action: () => { camera.position.z -= 1; } },
      { label: '🔽 後ろへ', action: () => { camera.position.z += 1; } }
    ].forEach(btn => camBtnContainer.appendChild(createCamButton(btn.label, btn.action)));
  } else if (camMode === 'look') {
    [
      { label: '👁 上を向く', action: () => { cameraTarget.y += 1; } },
      { label: '👁 下を向く', action: () => { cameraTarget.y -= 1; } },
      { label: '👁 左を向く', action: () => { cameraTarget.x -= 1; } },
      { label: '👁 右を向く', action: () => { cameraTarget.x += 1; } }
    ].forEach(btn => camBtnContainer.appendChild(createCamButton(btn.label, btn.action)));
  }
}

// === UIボタン ===
let followDistance = 2.5;
const labelStyle = 'margin-right: 6px; color: white; font-size: 14px;';
const inputStyle = 'width: 60px; margin-right: 10px;';
const followSelect = document.createElement('select');
followSelect.style.cssText = 'margin-right: 10px;';
const followOptions = ['元に戻す', '水星', '金星', '地球', '火星', '木星', '土星', '天王星', '海王星'];
followOptions.forEach(name => {
  const option = document.createElement('option');
  option.value = name === '元に戻す' ? '' : name;
  option.textContent = name === '元に戻す' ? '🔄 元に戻す' : `🔭 ${name}を追う`;
  followSelect.appendChild(option);
});
followSelect.addEventListener('change', () => {
  followTargetName = followSelect.value || null;
  if (!followTargetName) {
    camera.position.copy(initialCameraPosition);
    cameraTarget.copy(initialCameraTarget);
  }
});

const followLabel = document.createElement('label');
followLabel.textContent = 'カメラ：';
followLabel.style.cssText = 'color: white; font-size: 14px; margin-right: 6px;';

const followDistLabel = document.createElement('label');
followDistLabel.textContent = '追尾距離';
followDistLabel.style = labelStyle;

const followDistInput = document.createElement('input');
followDistInput.type = 'number';
followDistInput.step = '0.1';
followDistInput.value = followDistance.toString();
followDistInput.style = inputStyle;

const camToggleBtn = document.createElement('button'); // 追加
camToggleBtn.textContent = '🔀 切り替え';
camToggleBtn.style.cssText = 'position: absolute; bottom: 12px; left: 160px; z-index: 100;';
camToggleBtn.addEventListener('click', () => {
  camMode = camMode === 'move' ? 'look' : 'move';
  createCameraUI();
});
document.body.appendChild(camToggleBtn); // 追加

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
  { name: "水星", size: 0.6, radius: 3, days: 88, rotationHours: 1407.6 },
  { name: "金星", size: 1.0, radius: 5, days: 225, rotationHours: -5832 },
  { name: "地球", size: 1.12, radius: 7, days: 365, rotationHours: 24 },
  { name: "火星", size: 0.88, radius: 9, days: 687, rotationHours: 24.6 },
  { name: "木星", size: 2.0, radius: 15, days: 4333, rotationHours: 9.9 },
  { name: "土星", size: 1.8, radius: 18, days: 10759, rotationHours: 10.7 },
  { name: "天王星", size: 1.4, radius: 21, days: 30685, rotationHours: -17.2 },
  { name: "海王星", size: 1.4, radius: 24, days: 60190, rotationHours: 16.1 }
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
  planet.name = data.name; // New line added
  planet.userData = {
    name: data.name,
    radius: data.radius,
    baseRadius: data.radius,
    angle: Math.random() * Math.PI * 2,
    orbitSpeed,
    rotationSpeed
  };

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

const camBtnContainer = document.createElement('div');
camBtnContainer.style.cssText = 'position: absolute; bottom: 12px; left: 12px; z-index: 100; display: flex; flex-direction: column; gap: 10px;';
document.body.appendChild(camBtnContainer);
createCameraUI();

// Removed duplicate definitions of labelStyle and inputStyle
const controlContainer = document.createElement('div');
controlContainer.style.cssText = 'position: absolute; top: 50px; left: 12px; z-index: 100; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 6px;'; // Modified
document.body.appendChild(controlContainer);

// すでに追加されている topRow / bottomRow を削除（再実行対策）
const existingTopRow = document.querySelector('#top-row');
if (existingTopRow) existingTopRow.remove();
const existingBottomRow = document.querySelector('#bottom-row');
if (existingBottomRow) existingBottomRow.remove();

// topRow の作成と追加
const topRow = document.createElement('div');
topRow.id = 'top-row';
topRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; align-items: center;';
topRow.appendChild(followLabel);
topRow.appendChild(followSelect);
topRow.appendChild(followDistLabel);
topRow.appendChild(followDistInput);
controlContainer.appendChild(topRow);

// Move the definitions of rotationLabel, rotationInput, orbitLabel, orbitInput, distanceLabel, distanceInput, sizeLabel, sizeInput, and applyBtn before their usage in bottomRow.appendChild(...).
const rotationLabel = document.createElement('label');
rotationLabel.textContent = '自転倍率';
rotationLabel.style = labelStyle;

const rotationInput = document.createElement('input');
rotationInput.type = 'number';
rotationInput.step = '0.1';
rotationInput.value = rotationSpeedMultiplier.toString();
rotationInput.style = inputStyle;

const orbitLabel = document.createElement('label');
orbitLabel.textContent = '公転倍率';
orbitLabel.style = labelStyle;

const orbitInput = document.createElement('input');
orbitInput.type = 'number';
orbitInput.step = '0.1';
orbitInput.value = orbitSpeedMultiplier.toString();
orbitInput.style = inputStyle;

const distanceLabel = document.createElement('label');
distanceLabel.textContent = '距離倍率';
distanceLabel.style = labelStyle;

const distanceInput = document.createElement('input');
distanceInput.type = 'number';
distanceInput.step = '0.1';
distanceInput.value = '1.0';
distanceInput.style = inputStyle;

const sizeLabel = document.createElement('label'); // 追加
sizeLabel.textContent = '大きさ倍率'; // 追加
sizeLabel.style = labelStyle; // 追加

const sizeInput = document.createElement('input'); // 追加
sizeInput.type = 'number'; // 追加
sizeInput.step = '0.1'; // 追加
sizeInput.value = '1.0'; // 追加
sizeInput.style = inputStyle; // 追加

const applyBtn = document.createElement('button');
applyBtn.textContent = 'リセット';
applyBtn.style.cssText = 'padding: 6px 12px; font-size: 14px;';

// bottomRow の作成と追加
applyBtn.addEventListener('click', () => {
  rotationSpeedMultiplier = 1.0;
  orbitSpeedMultiplier = 1.0;
  followDistance = 2.5;
  // Removed setting sizeMultiplier here to set it after resetting the input field

  rotationInput.value = '1.0';
  orbitInput.value = '1.0';
  followDistInput.value = '2.5';
  sizeInput.value = '1.0';
  sizeMultiplier = 1.0;

  planets.forEach(p => {
    // reset distance
    const angle = p.mesh.userData.angle;
    const baseRadius = p.mesh.userData.baseRadius;
    const newRadius = baseRadius;
    p.mesh.userData.radius = newRadius;
    const x = Math.cos(angle) * newRadius;
    const z = Math.sin(angle) * newRadius;
    p.mesh.position.set(x, 0, z);

    // reset size
    const baseSize = orbitRaw.find(d => d.name === p.mesh.userData.name)?.size || 1.0;
    p.mesh.scale.setScalar(baseSize);

    // reset ring
    const ringMesh = p.group.children[0];
    if (ringMesh.geometry instanceof THREE.RingGeometry) {
      const innerRadius = newRadius - 0.02;
      const outerRadius = newRadius + 0.02;
      ringMesh.geometry.dispose();
      ringMesh.geometry = new THREE.RingGeometry(innerRadius, outerRadius, 256);
    }
  });
});
const bottomRow = document.createElement('div');
bottomRow.id = 'bottom-row';
bottomRow.style.cssText = 'display: flex; gap: 8px; align-items: center;';
bottomRow.appendChild(rotationLabel);
bottomRow.appendChild(rotationInput);
bottomRow.appendChild(orbitLabel);
bottomRow.appendChild(orbitInput);
bottomRow.appendChild(distanceLabel);
bottomRow.appendChild(distanceInput);
bottomRow.appendChild(sizeLabel); // 追加
bottomRow.appendChild(sizeInput); // 追加
bottomRow.appendChild(applyBtn);
controlContainer.appendChild(bottomRow);

followDistInput.addEventListener('input', () => {
  const val = parseFloat(followDistInput.value);
  if (!isNaN(val)) followDistance = val;
});

rotationInput.addEventListener('input', () => { // 追加
  const val = parseFloat(rotationInput.value);
  if (!isNaN(val)) rotationSpeedMultiplier = val;
});
orbitInput.addEventListener('input', () => { // 追加
  const val = parseFloat(orbitInput.value);
  if (!isNaN(val)) orbitSpeedMultiplier = val;
});
distanceInput.addEventListener('input', () => { // 追加
  const newDist = parseFloat(distanceInput.value);
  if (!isNaN(newDist)) {
    planets.forEach(p => {
      const angle = p.mesh.userData.angle;
      const baseRadius = p.mesh.userData.baseRadius;
      const newRadius = baseRadius * newDist;
      p.mesh.userData.radius = newRadius;
      const x = Math.cos(angle) * newRadius;
      const z = Math.sin(angle) * newRadius;
      p.mesh.position.set(x, 0, z);

      const ringMesh = p.group.children[0];
      if (ringMesh.geometry instanceof THREE.RingGeometry) {
        const innerRadius = newRadius - 0.02;
        const outerRadius = newRadius + 0.02;
        ringMesh.geometry.dispose();
        ringMesh.geometry = new THREE.RingGeometry(innerRadius, outerRadius, 256);
      }
    });
  }
});
sizeInput.addEventListener('input', () => { // 追加
  const newSize = parseFloat(sizeInput.value); // 追加
  if (!isNaN(newSize)) { // 追加
    sizeMultiplier = newSize; // 追加
    planets.forEach(p => { // 追加
      const baseSize = orbitRaw.find(d => d.name === p.mesh.userData.name)?.size || 1.0; // 追加
      p.mesh.scale.setScalar(baseSize * sizeMultiplier); // 追加
    }); // 追加
  } // 追加
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

  if (followTargetName) {
    const found = planets.find(p => p.mesh.userData.name === followTargetName);
    if (found) {
      const targetPlanet = found.mesh;
      const planetPos = targetPlanet.getWorldPosition(new THREE.Vector3());
      const offset = new THREE.Vector3(followDistance, followDistance * 0.75, followDistance);
      const cameraPos = planetPos.clone().add(offset);
      camera.position.lerp(cameraPos, 0.1);

      // カメラ注視点を太陽方向に少しずらすが、惑星の位置が見えなくならないようにする
      const sunPos = sun.getWorldPosition(new THREE.Vector3());
      const directionToSun = sunPos.clone().sub(planetPos).normalize();
      const adjustedLookAt = planetPos.clone().add(directionToSun.multiplyScalar(1.0)); // 惑星から太陽方向に1ユニット
      cameraTarget.lerp(adjustedLookAt, 0.1);
    }
  }

  camera.lookAt(cameraTarget);

  renderer.render(scene, camera);
}
animate();

const isSmallDisplay = window.innerWidth / window.devicePixelRatio < 500;
if (isSmallDisplay) {
  document.querySelectorAll('button').forEach(btn => {
    btn.style.padding = '14px 24px';
    btn.style.fontSize = '18px';
  });
}