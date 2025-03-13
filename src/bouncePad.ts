import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { collisions } from './object';
import { Player } from './player';

const INITIAL_PAD_COUNT = 11;

const height = 0.2

export function createBouncePad(xPosition: number) {
    const geometry = new RoundedBoxGeometry(1, 0.4, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const bouncePad = new THREE.Mesh(geometry, material);
    bouncePad.position.y = height
    bouncePad.position.x = xPosition
    return bouncePad
}

export function createBouncePads() {
    var bouncePads = []
    var xPosition = 20
    for (var i = 0; i < INITIAL_PAD_COUNT; i++) {
        xPosition = xPosition + 19
        const newBouncePad = createBouncePad(xPosition)
        bouncePads.push(newBouncePad)
    }
    return bouncePads
}

export function checkBouncePadCollisions(bouncePads: THREE.Mesh[], player: Player) {
    if (collisions(bouncePads, player.Mesh)) {
        console.debug("player is now bouncing")
        player.YVelocity = 10;
        player.JumpCounter = player.MaxJumps
    }
}
