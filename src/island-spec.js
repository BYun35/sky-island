export const createIslandSpec = () => {
  const blocks = [];
  const layers = [
    { y: 0, radius: 5, type: 'grass' },
    { y: -1, radius: 4, type: 'dirt' },
    { y: -2, radius: 3, type: 'dirt' },
    { y: -3, radius: 2, type: 'stone' },
  ];

  for (const { y, radius, type } of layers) {
    for (let x = -radius; x <= radius; x += 1) {
      for (let z = -radius; z <= radius; z += 1) {
        if (x * x + z * z <= radius * radius) {
          blocks.push({ x, y, z, type });
        }
      }
    }
  }

  return {
    skyColor: '#bfe0f4',
    textureFilter: 'nearest',
    blocks,
    faceTextures: {
      grass: { top: 'grass_top', sides: 'grass_side', bottom: 'dirt' },
      log: { top: 'log_top', sides: 'log_side', bottom: 'log_top' },
      dirt: { top: 'dirt', sides: 'dirt', bottom: 'dirt' },
      stone: { top: 'stone', sides: 'stone', bottom: 'stone' },
      leaves: { top: 'leaves', sides: 'leaves', bottom: 'leaves' },
      planks: { top: 'planks', sides: 'planks', bottom: 'planks' },
      sand: { top: 'sand', sides: 'sand', bottom: 'sand' },
      brick: { top: 'brick', sides: 'brick', bottom: 'brick' },
    },
  };
};
