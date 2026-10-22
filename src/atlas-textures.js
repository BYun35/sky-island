import * as THREE from 'three';

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

export async function loadAtlasTiles(loadAtlas) {
  const atlas = await loadAtlas();
  if (!atlas?.image) {
    throw new Error('Atlas texture must be loaded before creating tile textures');
  }

  atlas.colorSpace = THREE.SRGBColorSpace;
  const tiles = {};
  for (const [name, cell] of Object.entries(atlasCells)) {
    const texture = atlas.clone();
    texture.repeat.set(0.25, 0.25);
    texture.offset.set((cell % 4) * 0.25, 1 - (Math.floor(cell / 4) + 1) * 0.25);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    tiles[name] = texture;
  }
  return tiles;
}
