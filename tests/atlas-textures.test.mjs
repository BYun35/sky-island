import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { loadAtlasTiles } from '../src/atlas-textures.js';

test('材質貼圖先載入完成，再建立銳利的圖集分格', async () => {
  const source = new THREE.DataTexture(new Uint8Array(64 * 64 * 4), 64, 64);
  const tiles = await loadAtlasTiles(async () => source);
  assert.ok(Object.keys(tiles).length > 0);
  for (const texture of Object.values(tiles)) {
    assert.equal(texture.image, source.image);
    assert.equal(texture.magFilter, THREE.NearestFilter);
    assert.equal(texture.minFilter, THREE.NearestFilter);
    assert.equal(texture.generateMipmaps, false);
  }
});
