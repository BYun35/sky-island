import * as THREE from 'three';
import { createIslandSpec } from './island-spec.js';

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

const atlas = new THREE.TextureLoader().load('./sky-island-assets/atlas.png');
atlas.colorSpace = THREE.SRGBColorSpace;

const atlasCells = {
  grass_top: 0,
  grass_side: 1,
  dirt: 2,
  stone: 3,
  log_side: 4,
  log_top: 5,
  leaves: 6,
  planks: 7,
  sand: 8,
  brick: 9,
};
const tileTextures = new Map();

function tileTexture(name) {
  if (!tileTextures.has(name)) {
    const cell = atlasCells[name];
    const texture = atlas.clone();
    texture.repeat.set(0.25, 0.25);
    texture.offset.set((cell % 4) * 0.25, 1 - (Math.floor(cell / 4) + 1) * 0.25);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    tileTextures.set(name, texture);
  }
  return tileTextures.get(name);
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
for (const block of spec.blocks) {
  const geometry = geometries.get(block.type) ?? new THREE.BoxGeometry(1, 1, 1);
  geometries.set(block.type, geometry);
  const mesh = new THREE.Mesh(geometry, faceMaterials(block.type));
  mesh.position.set(block.x, block.y, block.z);
  scene.add(mesh);
}

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
