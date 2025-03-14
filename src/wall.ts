import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Player } from './player';

const INITIAL_WALL_COUNT = 3;

export function randomWallHeight(minHeight: number, maxHeight: number) {
    return Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
}

export function createWall(startingPosition: number, height: number) {
    var height = height
    var startingPosition = startingPosition;
    const geometry = new RoundedBoxGeometry(1, height, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0xBC4A3C })
    const wall = new THREE.Mesh(geometry, material);
    wall.position.y = height / 2;
    wall.position.x = startingPosition;
    return wall
}


export function createWalls(): THREE.Mesh[] {
    var walls = []
    var startingXPosition = 26
    for (var i = 0; i < INITIAL_WALL_COUNT; i++) {
        startingXPosition = startingXPosition + 30
        const wall = createWall(startingXPosition, randomWallHeight(2, 5))
        walls.push(wall)
    }
    return walls
}

export function landedOnWall(wall: THREE.Mesh, player: Player) {
    const wallBox = new THREE.Box3().setFromObject(wall);
    const playerBox = new THREE.Box3().setFromObject(player.Mesh);
    // Ensure player is above wall when intersecting
    return wallBox.intersectsBox(playerBox) && player.Mesh.position.y - player.Height/2 > (wall.position.y * 2);
}

export function checkForWallLandings(walls: THREE.Mesh[], player: Player) {
    for (var i = 0; i < walls.length; i++) {
        if (landedOnWall(walls[i], player)) {
            // console.debug("landed on wall")
            player.YVelocity = 0;
            player.JumpCounter = player.MaxJumps;
            player.Mesh.position.y = (walls[i].position.y * 2) + player.Height + 0.001;
        }
    }
}
