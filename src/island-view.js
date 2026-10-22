const UP_AXIS = { x: 0, y: 1, z: 0 };
const RADIANS_PER_PIXEL = 0.01;

export function enterIslandView(camera, islandCenter) {
  camera.position.set(islandCenter.x, islandCenter.y + 1.6, islandCenter.z + 4.5);
  camera.lookAt(islandCenter.x, islandCenter.y + 1.6, islandCenter.z);
}

export function rotateIslandCamera(camera, deltaX, islandCenter) {
  const offset = camera.position.clone().sub(islandCenter);
  offset.applyAxisAngle(UP_AXIS, -deltaX * RADIANS_PER_PIXEL);
  camera.position.copy(islandCenter).add(offset);
  camera.lookAt(islandCenter);
}
