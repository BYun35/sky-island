export function enterIslandView(camera, islandCenter) {
  camera.position.set(islandCenter.x, islandCenter.y + 1.6, islandCenter.z + 4.5);
  camera.lookAt(islandCenter.x, islandCenter.y + 1.6, islandCenter.z);
}
