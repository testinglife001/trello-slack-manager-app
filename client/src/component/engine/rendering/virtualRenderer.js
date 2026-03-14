// /engine/rendering/virtualRenderer.js
export function getVisibleNodes(camera, quadTree) {
  const viewport = {
    x: camera.x,
    y: camera.y,
    width: camera.width / camera.zoom,
    height: camera.height / camera.zoom,
  };

  return quadTree.query(viewport);
}
