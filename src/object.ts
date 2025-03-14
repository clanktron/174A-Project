import * as THREE from 'three';
import { OBJECT_REMOVAL_DISTANCE, OBJECT_SPACING, OBJECT_SPAWN_DISTANCE } from './globals';
import { Player } from './player';
import { createWall, randomWallHeight } from './wall';
import { createBouncePad } from './bouncePad';
import { createSpike } from './spike';

export function updateObjectPositions(delta_time: number, objects: THREE.Mesh[], currentVelocity: number) {
    var furthestObjectPosition = 0
    for (var i = 0; i < objects.length; i++) {
        objects[i].position.x -= currentVelocity * delta_time;
        if (objects[i].position.x > furthestObjectPosition) {
            furthestObjectPosition = objects[i].position.x
        }
    }
    return furthestObjectPosition
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

export function addObjectsToScene(objects: THREE.Mesh[], scene: THREE.Scene) {
    for (var i = 0; i < objects.length; i++) {
        scene.add(objects[i])
    }
}

export function removeObjectsFromScene(objects: THREE.Mesh[], scene: THREE.Scene) {
    for (let i = objects.length - 1; i >= 0; i--) {
        scene.remove(objects[i]);
        objects.splice(i, 1);
    }
}

export function removeOffscreenObjects(objects: THREE.Mesh[], scene: THREE.Scene): THREE.Mesh[] {
    return objects.filter((obj) => {
        if (obj.position.x < OBJECT_REMOVAL_DISTANCE) {
            scene.remove(obj);
            return false;
        }
        return true;
    });
}

