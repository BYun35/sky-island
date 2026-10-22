import * as THREE from 'three';
import { createIslandSpec } from './island-spec.js';
import { enterIslandView, rotateIslandCamera } from './island-view.js';
import { loadAtlasTiles } from './atlas-textures.js';
import { advanceMining, cancelMining, startMining } from './mining.js';

const spec = createIslandSpec();
const scene = new THREE.Scene();
scene.background = new THREE.Color(spec.skyColor);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.querySelector('#scene').appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(13, 11, 13);
camera.lookAt(0, -0.6, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x596377, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 2.1);
sun.position.set(-7, 12, 8);
scene.add(sun);

const tileTextures = await loadAtlasTiles(() =>
  new THREE.TextureLoader().loadAsync('./sky-island-assets/atlas.png'),
);

function tileTexture(name) {
  return tileTextures[name];
}

function faceMaterials(type) {
  const faces = spec.faceTextures[type];
  const materialFor = (name) => new THREE.MeshLambertMaterial({ map: tileTexture(name) });
  return [
    materialFor(faces.sides),
    materialFor(faces.sides),
    materialFor(faces.top),
    materialFor(faces.bottom),
    materialFor(faces.sides),
    materialFor(faces.sides),
  ];
}

const geometries = new Map();
const blocks = [];
for (const block of spec.blocks) {
  const geometry = geometries.get(block.type) ?? new THREE.BoxGeometry(1, 1, 1);
  geometries.set(block.type, geometry);
  const mesh = new THREE.Mesh(geometry, faceMaterials(block.type));
  mesh.position.set(block.x, block.y, block.z);
  mesh.userData.blockType = block.type;
  blocks.push(mesh);
  scene.add(mesh);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const crackTextures = await Promise.all(
  Array.from({ length: 10 }, (_, stage) =>
    new THREE.TextureLoader().loadAsync(`./sky-island-assets/textures/16px/destroy_stage_${stage}.png`),
  ),
);
for (const texture of crackTextures) {
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
}

let miningSession = null;
let miningTarget = null;
let crackOverlay = null;
let previousFrame = null;

function removeCrackOverlay() {
  if (!crackOverlay) return;
  scene.remove(crackOverlay);
  crackOverlay.material.forEach((material) => material.dispose());
  crackOverlay = null;
}

function clearMining() {
  miningSession = cancelMining(miningSession);
  miningTarget = null;
  removeCrackOverlay();
}

function updateCrackOverlay() {
  removeCrackOverlay();
  if (!miningTarget || miningSession.crackStage === 0) return;
  const texture = crackTextures[miningSession.crackStage];
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  crackOverlay = new THREE.Mesh(
    new THREE.BoxGeometry(1.008, 1.008, 1.008),
    Array.from({ length: 6 }, () => material.clone()),
  );
  crackOverlay.position.copy(miningTarget.position);
  scene.add(crackOverlay);
}

function hitBlocks(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(blocks, false);
}

let islandClickCandidate = false;
let pointerIsDown = false;
let orbitDragStarted = false;
let pointerDownX = 0;
let lastPointerX = 0;
const islandCenter = new THREE.Vector3(0, 0, 0);

renderer.domElement.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const hits = hitBlocks(event);
  pointerIsDown = true;
  orbitDragStarted = false;
  islandClickCandidate = hits.length > 0;
  pointerDownX = event.clientX;
  lastPointerX = event.clientX;
  const miningHit = hits.find(({ object }) =>
    object.userData.blockType === 'dirt' || object.userData.blockType === 'stone');
  if (miningHit) {
    miningTarget = miningHit.object;
    miningSession = startMining(miningTarget.userData.blockType);
  }
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener('pointermove', (event) => {
  if (!pointerIsDown) return;
  const deltaX = event.clientX - lastPointerX;
  lastPointerX = event.clientX;
  if (!orbitDragStarted && Math.abs(event.clientX - pointerDownX) > 3) {
    orbitDragStarted = true;
    islandClickCandidate = false;
    clearMining();
  }
  if (orbitDragStarted) rotateIslandCamera(camera, deltaX, islandCenter);
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (event.button === 0 && islandClickCandidate && !orbitDragStarted) {
    enterIslandView(camera, islandCenter);
  }
  pointerIsDown = false;
  orbitDragStarted = false;
  islandClickCandidate = false;
  clearMining();
});
renderer.domElement.addEventListener('pointercancel', () => {
  pointerIsDown = false;
  orbitDragStarted = false;
  islandClickCandidate = false;
  clearMining();
});
renderer.domElement.addEventListener('lostpointercapture', () => {
  pointerIsDown = false;
  orbitDragStarted = false;
  islandClickCandidate = false;
  clearMining();
});
renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

function render(now) {
  const deltaMs = previousFrame === null ? 0 : now - previousFrame;
  previousFrame = now;
  if (miningSession && miningTarget) {
    miningSession = advanceMining(miningSession, deltaMs);
    updateCrackOverlay();
    if (miningSession.broken) {
      scene.remove(miningTarget);
      clearMining();
    }
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
