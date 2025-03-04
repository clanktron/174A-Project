import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Background color
let backgroundColor = new THREE.Color();
scene.background = backgroundColor;

// Light Source
let light = new THREE.PointLight(0xffffff, 100, 0, 1);
light.position.set(10, 30, 10);
scene.add(light);

// Color animation constraints
const HUE_MIN = 0.2;  // Adjust these values to control the hue range
const HUE_MAX = 0.8;  // (0-1 represents the full color spectrum)
const LIGHTNESS_MIN = 0.3;  // Prevent colors from getting too dark
const LIGHTNESS_MAX = 0.7;  // Prevent colors from getting too bright

// Generate random initial values within constraints
const initialHue = HUE_MIN + Math.random() * (HUE_MAX - HUE_MIN);
const initialLightness = LIGHTNESS_MIN + Math.random() * (LIGHTNESS_MAX - LIGHTNESS_MIN);
backgroundColor.setHSL(initialHue, 0.5, initialLightness);

// Calculate initial time based on the random hue
const hue_roc = 0.2;
const lightness_roc = 0.4;
let time = Math.acos(2 * ((initialHue - HUE_MIN) / (HUE_MAX - HUE_MIN)) - 1) / hue_roc;

const wallCount = 11
const bouncePadCount = 16

// Player object
let player_height = 0.5;
const geometry = new THREE.BoxGeometry(1, 1, 1);
//const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
const player = new THREE.Mesh(geometry, material);
player.position.y = player_height;
scene.add(player);

camera.position.set(-10, 40, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
camera.position.y = 1;

const clock = new THREE.Clock();

let max_jumps = 2;
let jump_counter = max_jumps;
let y_velocity = 0;
const gravity = -9.8;
let default_obstacle_velocity = 10;

let walls = createWalls(wallCount);
let bouncePads = createBouncePads(bouncePadCount);
let floor = createFloor();
scene.add(floor);
addObjectsToScene(walls);
addObjectsToScene(bouncePads);

function animate() {
    controls.update();
    let delta_time = clock.getDelta();
    time += delta_time;
    updatePlayer(delta_time);
    updateBouncePads(delta_time, bouncePads);
    updateWallPositions(delta_time, walls);
    checkForWallCollisions(walls);
    checkForWallLandings(walls);

    // Background color animation with constraints
    // Map cosine output (-1 to 1) to our desired hue range
    let hue = HUE_MIN + ((Math.cos(time * hue_roc) + 1) / 2) * (HUE_MAX - HUE_MIN);
    // Map cosine output (-1 to 1) to our desired lightness range
    let lightness = LIGHTNESS_MIN + ((Math.cos(time * lightness_roc) + 1) / 2) * (LIGHTNESS_MAX - LIGHTNESS_MIN);

    backgroundColor.setHSL(hue, 0.5, lightness);
    scene.background = backgroundColor;

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function jump() {
    var jump_velocity = 5;
    if (jump_counter > 0) {
        y_velocity = jump_velocity;
        jump_counter--;
    }
}

function updatePlayer(delta_time: number) {
    y_velocity += gravity * delta_time;
    player.position.y += y_velocity * delta_time;
    if ((player.position.y <= player_height) && (y_velocity <= 0)) {
        player.position.y = player_height;
        y_velocity = 0;
        jump_counter = max_jumps;
    }
}

function addObjectsToScene(objects: THREE.Mesh[]) {
    for (var i = 0; i < objects.length; i++) {
        scene.add(objects[i])
    }
}

function createBouncePad(xPosition: number) {
    var height = 0.2;
    const geometry = new THREE.BoxGeometry(1, 0.4, 1);
    //const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const bouncePad = new THREE.Mesh(geometry, material);
    bouncePad.position.y = height
    bouncePad.position.x = xPosition
    return bouncePad
}

function createBouncePads(count: number) {
    var bouncePads = []
    var xPosition = 20
    for (var i = 0; i < count; i++) {
        xPosition = xPosition + 19
        const newBouncePad = createBouncePad(xPosition)
        bouncePads.push(newBouncePad)
    }
    return bouncePads
}

function randomWallHeight(minHeight: number, maxHeight: number) {
    return Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
}

function createWall(startingPosition: number, height: number) {
    var height = height
    var startingPosition = startingPosition;
    const geometry = new THREE.BoxGeometry(1, height, 1);
    //const material = new THREE.MeshBasicMaterial({ color: 0xBC4A3C });
    const material = new THREE.MeshPhongMaterial({ color: 0xBC4A3C })
    const wall = new THREE.Mesh(geometry, material);
    wall.position.y = height / 2;
    wall.position.x = startingPosition;
    return wall
}

function createWalls(count: number): THREE.Mesh[] {
    var walls = []
    var startingXPosition = 26
    for (var i = 0; i < count; i++) {
        startingXPosition = startingXPosition + 30
        const wall = createWall(startingXPosition, randomWallHeight(2, 5))
        walls.push(wall)
    }
    return walls
}

function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(200, 1);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // rotate 
    return floor
}

function updateBouncePadPositions(delta_time: number, bouncePads: THREE.Mesh[]) {
    for (var i = 0; i < bouncePads.length; i++) {
        bouncePads[i].position.x -= default_obstacle_velocity * delta_time;
    }
}

function updateBouncePads(delta_time: number, bouncePads: THREE.Mesh[]) {
    updateBouncePadPositions(delta_time, bouncePads)
    checkBouncePadCollisions(bouncePads)
}

function checkBouncePadCollisions(bouncePads: THREE.Mesh[]) {
    for (var i = 0; i < bouncePads.length; i++) {
        if ((bouncePads[i].position.x <= 1) && (bouncePads[i].position.x >= -1) && (player.position.y <= 0.7)) {
            y_velocity = 10;
            jump_counter = max_jumps;
        }
    }
}

function updateWallPositions(delta_time: number, walls: THREE.Mesh[]) {
    for (var i = 0; i < walls.length; i++) {
        walls[i].position.x -= default_obstacle_velocity * delta_time;
    }
}

function landedOnWall(wall: THREE.Mesh) {
    return (wall.position.x <= 1) && (wall.position.x >= -1) && (player.position.y <= (wall.position.y * 2) + player_height)
}

function checkForWallLandings(walls: THREE.Mesh[]) {
    for (var i = 0; i < walls.length; i++) {
        if (landedOnWall(walls[i])) {
            console.debug("landed on wall")
            y_velocity = 0;
            jump_counter = max_jumps;
            player.position.y = (walls[i].position.y * 2) + player_height;
        }
    }
}

function wallCollision(wall: THREE.Mesh) {
    return (wall.position.x <= 1) && (wall.position.x >= -1) && (player.position.y <= (wall.position.y * 2))
}

function checkForWallCollisions(walls: THREE.Mesh[]) {
    for (var i = 0; i < walls.length; i++) {
        if (wallCollision(walls[i])) {
            resetGame()
        }
    }
}

function resetGame() {
    console.log("resetting game...");
    // Remove old walls and bounce pads
    for (let i = 0; i < walls.length; i++) {
        scene.remove(walls[i]);
    }
    for (let i = 0; i < bouncePads.length; i++) {
        scene.remove(bouncePads[i]);
    }
    // Create new walls and bounce pads
    walls = createWalls(wallCount);
    bouncePads = createBouncePads(bouncePadCount);
    addObjectsToScene(walls);
    addObjectsToScene(bouncePads);
    // Reset player position
    player.position.set(0, player_height, 0);
    y_velocity = 0;
    jump_counter = max_jumps;
}

function onKeyPress(event: any) {
    switch (event.key) {
        case ' ':
            jump();
            break;
        default:
            console.debug(`Key ${event.key} pressed`);
    }
}

window.addEventListener('keydown', onKeyPress);
