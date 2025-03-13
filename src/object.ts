import * as THREE from 'three';

export function updateObjectPositions(delta_time: number, objects: THREE.Mesh[], currentVelocity: number) {
    for (var i = 0; i < objects.length; i++) {
        objects[i].position.x -= currentVelocity * delta_time;
    }
}

export function collision(object: THREE.Mesh, player: THREE.Mesh): boolean {
    const box1 = new THREE.Box3().setFromObject(object);
    const box2 = new THREE.Box3().setFromObject(player);
    return box1.intersectsBox(box2);
}

export function collisions(objects: THREE.Mesh[], player: THREE.Mesh): boolean {
    for (var i = 0; i < objects.length; i++) {
        if (collision(objects[i], player)) {
            console.debug("collision detected")
            return true
        }
    }
    return false
}

export function checkForObstacleCollisions(objects: THREE.Mesh[], player: THREE.Mesh, reset: () => void) {
    if (collisions(objects, player)) {
        reset()
    }
}
