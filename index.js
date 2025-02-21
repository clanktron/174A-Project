import * as THREE from 'three';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Background color
let backgroundColor = new THREE.Color(0x000000);
scene.background = backgroundColor;

// Player object 
let player_height = 0.5;
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(geometry, material);
player.position.y = player_height;
scene.add(player);

// First Bounce Pad object
let bouncePad_height = 0.2;
let bouncePad_1_starting_x_pos = 20;
const bp_geometry = new THREE.BoxGeometry(1, 0.4, 1);
const bp_material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const bouncePad_1 = new THREE.Mesh(bp_geometry, bp_material);
bouncePad_1.position.y = bouncePad_height;
bouncePad_1.position.x = bouncePad_1_starting_x_pos;
scene.add(bouncePad_1);

// Second Bounce Pad object
let bouncePad_2_starting_x_pos = 39;
const bouncePad_2 = new THREE.Mesh(bp_geometry, bp_material);
bouncePad_2.position.y = bouncePad_height;
bouncePad_2.position.x = bouncePad_2_starting_x_pos;
scene.add(bouncePad_2);


// Third Bounce Pad object
let bouncePad_3_starting_x_pos = 49;
const bouncePad_3 = new THREE.Mesh(bp_geometry, bp_material);
bouncePad_3.position.y = bouncePad_height;
bouncePad_3.position.x = bouncePad_3_starting_x_pos;
scene.add(bouncePad_3);


// Floor
// const floorGeometry = new THREE.PlaneGeometry(200, 1);
// const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
// const floor = new THREE.Mesh(floorGeometry, floorMaterial);
// floor.rotation.x = -Math.PI / 2; // rotate 
// scene.add(floor);

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);


camera.position.set(0, 5, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);

camera.position.y = 1;

let hue = 0;
let lightness = 0;

let time = 0;
const clock = new THREE.Clock();

function animate() {
    controls.update();
    let delta_time = clock.getDelta();
    time += delta_time;

    updatePlayer(delta_time);
    updateBouncePads(delta_time);

    // rate of change for hue and lightness
    let hue_roc = 0.05;
    let lightness_roc = 0.2;

    // Use a sine wave to smoothly oscillate hue and lightness
    hue = (Math.cos(time * hue_roc) + 1) / 2;  // Oscillates between 0 and 1
    lightness = (Math.cos(time * lightness_roc) + 1.25) / 2;

    backgroundColor.setHSL(hue, 0.5, lightness);
    scene.background = backgroundColor;

    renderer.render(scene, camera);
}

let jump_velocity = 5;
let max_jumps = 2;
let jump_counter = max_jumps;
let y_velocity = 0;
const gravity = -9.8;

let default_obstacle_velocity = 5;

function jump() {
    if (jump_counter > 0) { // if player has 1 or 2 (both) jumps left
        y_velocity += jump_velocity;
        jump_counter--;
    } 
}

function updatePlayer(delta_time) {
    y_velocity += gravity * delta_time;
    player.position.y += y_velocity * delta_time;

    if ((player.position.y <= player_height) && (y_velocity <= 0)) {
        player.position.y = player_height;
        y_velocity = 0;
        jump_counter = max_jumps;
    }
}


function updateBouncePads(delta_time) {
    bouncePad_1.position.x -= default_obstacle_velocity * delta_time;
    bouncePad_2.position.x -= default_obstacle_velocity * delta_time;
    bouncePad_3.position.x -= default_obstacle_velocity * delta_time;

    if ((bouncePad_1.position.x <= 1) && (bouncePad_1.position.x >= -1) && (player.position.y <= 0.7)) {
        y_velocity = 10;
        jump_counter = max_jumps;
    }
    if ((bouncePad_2.position.x <= 1) && (bouncePad_2.position.x >= -1) && (player.position.y <= 0.7)) {
        y_velocity = 10;
        jump_counter = max_jumps;
    }
    if ((bouncePad_3.position.x <= 1) && (bouncePad_3.position.x >= -1) && (player.position.y <= 0.7)) {
        y_velocity = 10;
        jump_counter = max_jumps;
    }
}

window.addEventListener('keydown', onKeyPress);
// Function to handle keypress
function onKeyPress(event) {
    switch (event.key) {
        case ' ': // Note we only do this if space is pressed.
            jump();
            break;
        default:
            console.log(`Key ${event.key} pressed`);
    }
}

renderer.setAnimationLoop(animate);
