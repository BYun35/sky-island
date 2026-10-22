import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createIslandSpec } from '../src/island-spec.js';
import { enterIslandView, rotateIslandCamera } from '../src/island-view.js';

test('STEP 0：建立有內容且座標不重疊的小島方塊地形', () => {
  const island = createIslandSpec();
  assert.ok(island.blocks.length > 0);
  const positions = island.blocks.map(({ x, y, z }) => `${x},${y},${z}`);
  assert.equal(new Set(positions).size, positions.length);
  assert.ok(island.blocks.some(({ type }) => type === 'grass'));
});

test('STEP 0：小島內部泥土層保留指定缺塊', () => {
  const island = createIslandSpec();
  assert.equal(
    island.blocks.some(({ x, y, z }) => x === -2 && y === -1 && z === 1),
    false,
  );
});

test('STEP 0：草地與木頭各面使用指定貼圖，其他方塊六面一致', () => {
  const island = createIslandSpec();
  assert.deepEqual(island.faceTextures.grass, {
    top: 'grass_top', sides: 'grass_side', bottom: 'dirt',
  });
  assert.deepEqual(island.faceTextures.log, {
    top: 'log_top', sides: 'log_side', bottom: 'log_top',
  });
  for (const [type, faces] of Object.entries(island.faceTextures)) {
    if (type === 'grass' || type === 'log') continue;
    assert.equal(faces.top, faces.sides, `${type} 側面貼圖不一致`);
    assert.equal(faces.top, faces.bottom, `${type} 底面貼圖不一致`);
  }
});

test('STEP 0：使用銳利像素過濾與範例天空色', () => {
  const island = createIslandSpec();
  assert.equal(island.textureFilter, 'nearest');
  assert.equal(island.skyColor, '#bfe0f4');
});

test('STEP 0：點擊小島後切換到島面上的第一人稱視角', () => {
  const camera = new THREE.PerspectiveCamera();
  enterIslandView(camera, new THREE.Vector3(0, 0, 0));

  assert.ok(camera.position.y >= 1.5 && camera.position.y <= 1.8);
  assert.ok(camera.position.z > 0 && camera.position.z <= 5);
  const direction = camera.getWorldDirection(new THREE.Vector3());
  assert.ok(direction.z < -0.8, '第一人稱鏡頭應朝小島中央看');
});

test('STEP 0：拖曳可環繞小島旋轉，並可完成完整 360 度旋轉', () => {
  const camera = new THREE.PerspectiveCamera();
  const center = new THREE.Vector3(0, 0, 0);
  camera.position.set(13, 11, 13);
  camera.lookAt(center);
  const start = camera.position.clone();
  const startRadius = Math.hypot(camera.position.x, camera.position.z);

  rotateIslandCamera(camera, 120, center);
  assert.ok(camera.position.distanceTo(start) > 1, '拖曳應改變環繞視角');
  assert.ok(Math.abs(Math.hypot(camera.position.x, camera.position.z) - startRadius) < 1e-9);

  rotateIslandCamera(camera, (Math.PI * 2 / 0.01) - 120, center);
  assert.ok(camera.position.distanceTo(start) < 1e-9, '累積 360 度後應回到起始方位');
});
