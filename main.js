import * as THREE from 'three';
// Safariなどでの余白対策
document.body.style.margin = '0';
document.body.style.padding = '0';
document.documentElement.style.margin = '0';
document.documentElement.style.padding = '0';
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loading-screen';
loadingScreen.textContent = 'Now Loading...';
loadingScreen.style.cssText = 'position: fixed; inset: 0; background: black; color: white; font-size: 24px; display: flex; align-items: center; justify-content: center; z-index: 9999;';
document.body.appendChild(loadingScreen);

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
      { label: '⬆ 上へ', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          camera.position.y += 1;
        } },
      { label: '⬇ 下へ', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          camera.position.y -= 1;
        } },
      { label: '◀ 左へ', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          camera.position.x -= 1;
        } },
      { label: '▶ 右へ', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          camera.position.x += 1;
        } },
      { label: '🔼 前へ', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          camera.position.z -= 1;
        } },
      { label: '🔽 後ろへ', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          camera.position.z += 1;
        } }
    ].forEach(btn => camBtnContainer.appendChild(createCamButton(btn.label, btn.action)));
  } else if (camMode === 'look') {
    [
      { label: '👁 上を向く', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          cameraTarget.y += 1;
        } },
      { label: '👁 下を向く', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          cameraTarget.y -= 1;
        } },
      { label: '👁 左を向く', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          cameraTarget.x -= 1;
        } },
      { label: '👁 右を向く', action: () => {
          followTargetName = null;
          cameraTarget.copy(cameraTarget);
          cameraTarget.x += 1;
        } }
    ].forEach(btn => camBtnContainer.appendChild(createCamButton(btn.label, btn.action)));
  }
  // スマホ向け：ボタンを再拡大
  if (window.innerWidth / window.devicePixelRatio < 500) {
    camBtnContainer.querySelectorAll('button').forEach(btn => {
      btn.style.padding = '16px 28px';
      btn.style.fontSize = '20px';
    });
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
followDistInput.type = 'range';
followDistInput.min = '0.1';
followDistInput.max = '10.0';
followDistInput.step = '0.1';
followDistInput.value = '2.5';
followDistInput.style.width = '100px';

const camToggleBtn = document.createElement('button'); // 追加
camToggleBtn.textContent = '🔀 切り替え';
camToggleBtn.style.cssText = `
  position: absolute;
  bottom: 12px;
  right: 180px;
  z-index: 100;
  padding: 14px 24px;
  font-size: 18px;
  font-weight: bold;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 6px;
`;
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
const sunLight = new THREE.PointLight(0xffffff, 5, 0); // 強度200、距離無制限（減衰なし）
sunLight.decay = 0;
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const manager = new THREE.LoadingManager(() => {
  // 全てのテクスチャ読み込み完了後に呼ばれる
  document.getElementById('loading-screen').style.display = 'none';
  animate(); // アニメーション開始
});
const textureLoader = new THREE.TextureLoader(manager);
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
const skyGeo = new THREE.SphereGeometry(600, 64, 64);
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
  { name: "水星", size: 0.2, radius: 5.8, days: 88, rotationHours: 1407.6 },
  { name: "金星", size: 0.35, radius: 10.8, days: 225, rotationHours: -5832 },
  { name: "地球", size: 0.4, radius: 15.0, days: 365, rotationHours: 24 },
  { name: "火星", size: 0.3, radius: 22.8, days: 687, rotationHours: 24.6 },
  { name: "木星", size: 0.9, radius: 77.8, days: 4333, rotationHours: 9.9 },
  { name: "土星", size: 0.8, radius: 143.4, days: 10759, rotationHours: 10.7 },
  { name: "天王星", size: 0.5, radius: 287.1, days: 30685, rotationHours: -17.2 },
  { name: "海王星", size: 0.5, radius: 449.5, days: 60190, rotationHours: 16.1 }
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
  planet.userData.baseScale = planet.scale.clone();

  if (data.name === "地球") {
    earthObject = planet;
    const moonGroup = new THREE.Object3D();
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ map: textures["月"] })
    );
    moon.userData = {
      angle: Math.random() * Math.PI * 2,
      baseOrbitRadius: 0.3,
      orbitRadius: 0.6,
      orbitSpeed: (2 * Math.PI) / 2.0
    };
    moonGroup.rotation.x = THREE.MathUtils.degToRad(5); // 月の軌道傾斜を追加
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
      new THREE.RingGeometry(0.9, 1.5, 128),
      new THREE.MeshBasicMaterial({
        map: saturnRingTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      })
    );
    saturnRing.rotation.x = Math.PI / 2;
    saturnRing.position.y = 0.02; // 土星本体と少しずらす
    planet.add(saturnRing);

  }

  orbitGroup.add(planet);
  scene.add(orbitGroup);
  planets.push({ mesh: planet, group: orbitGroup });
});

const camBtnContainer = document.createElement('div');
camBtnContainer.style.cssText = 'position: absolute; bottom: 12px; right: 12px; z-index: 100; display: flex; flex-direction: column; gap: 10px;';
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
rotationInput.type = 'range';
rotationInput.min = '0.1';
rotationInput.max = '5.0';
rotationInput.step = '0.1';
rotationInput.value = '1.0';
rotationInput.style.width = '100px';

const orbitLabel = document.createElement('label');
orbitLabel.textContent = '公転倍率';
orbitLabel.style = labelStyle;

const orbitInput = document.createElement('input');
orbitInput.type = 'range';
orbitInput.min = '0.1';
orbitInput.max = '5.0';
orbitInput.step = '0.1';
orbitInput.value = '1.0';
orbitInput.style.width = '100px';

const distanceLabel = document.createElement('label');
distanceLabel.textContent = '距離倍率';
distanceLabel.style = labelStyle;

const distanceInput = document.createElement('input');
distanceInput.type = 'range';
distanceInput.min = '0.1';
distanceInput.max = '3.0';
distanceInput.step = '0.01';
distanceInput.value = '1.0';
distanceInput.style.width = '100px';

const sizeLabel = document.createElement('label'); // 追加
sizeLabel.textContent = '大きさ倍率'; // 追加
sizeLabel.style = labelStyle; // 追加

const sizeInput = document.createElement('input');
sizeInput.type = 'range';
sizeInput.min = '0.1';
sizeInput.max = '3.0';
sizeInput.step = '0.01';
sizeInput.value = '1.0';
sizeInput.style.width = '100px';

const resetBtn = document.createElement('button');
resetBtn.textContent = 'リセット';
resetBtn.style.cssText = 'padding: 6px 12px; font-size: 14px;';

// bottomRow の作成と追加
resetBtn.addEventListener('click', () => {
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
    const inputSize = parseFloat(sizeInput.value) || 1.0;
    const baseScale = p.mesh.userData.baseScale;
    p.mesh.scale.set(
      baseScale.x * inputSize,
      baseScale.y * inputSize,
      baseScale.z * inputSize
    );

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
bottomRow.appendChild(resetBtn);
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
      if (p.mesh.userData.moon) {
        const moon = p.mesh.userData.moon.mesh;
        const baseMoonRadius = moon.userData.baseOrbitRadius || 1.0;
        moon.userData.orbitRadius = baseMoonRadius * newDist;
      }
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
    planets.forEach(p => {
      const baseScale = p.mesh.userData.baseScale;
      p.mesh.scale.set(
        baseScale.x * sizeMultiplier,
        baseScale.y * sizeMultiplier,
        baseScale.z * sizeMultiplier
      );
    });
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
        0.15,
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
// animate(); // テクスチャ読み込み完了後に実行されます

const isSmallDisplay = window.innerWidth / window.devicePixelRatio < 500;
if (isSmallDisplay) {
  // ボタンを大きく
  document.querySelectorAll('button').forEach(btn => {
    btn.style.padding = '16px 28px';
    btn.style.fontSize = '20px';
  });

  // ラベルや入力欄も大きく
  document.querySelectorAll('label, select, input[type="number"]').forEach(el => {
    el.style.fontSize = '20px';
    el.style.height = '36px';
    el.style.padding = '6px 10px';
  });

  // UI行を縦並びにする
  const topRow = document.getElementById('top-row');
  const bottomRow = document.getElementById('bottom-row');
  if (topRow) topRow.style.flexDirection = 'column';
  if (bottomRow) bottomRow.style.flexDirection = 'column';
}
if (window.innerHeight < 500 && window.innerWidth > window.innerHeight) {
  camBtnContainer.style.flexDirection = 'row';
  camBtnContainer.style.flexWrap = 'wrap';
  camBtnContainer.style.justifyContent = 'flex-end';
  camBtnContainer.style.alignItems = 'center';
  camBtnContainer.style.gap = '10px';
  camBtnContainer.style.right = '12px';
  camBtnContainer.style.bottom = '60px'; // 少し上に

  camToggleBtn.style.bottom = '12px';
  camToggleBtn.style.right = '200px';
}