import * as THREE from 'three';

const width = 2
const depth = .5

export function createFloor() {
    const floorGeometry = new THREE.BoxGeometry(200, width, depth); // Add thickness (0.5 in this case)
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load('/textures/floor.jpg');
    floorTexture.repeat.set(200, 1);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to lay flat
    floor.position.y = -depth/2
    return { floor, floorTexture };
}
