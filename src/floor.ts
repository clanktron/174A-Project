import * as THREE from "three";

export function createFloor() {
  const floorGeometry = new THREE.PlaneGeometry(200, 1);
  const textureLoader = new THREE.TextureLoader();
  const floorTexture = textureLoader.load("texture_sources/floor.jpg");
  floorTexture.repeat.set(200, 1);
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // rotate
  return { floor, floorTexture };
}
