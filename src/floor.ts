import * as THREE from 'three';

export function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(200, 1);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // rotate
    return floor
}

