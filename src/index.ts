import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { updateBackgroundColor } from './background';
import { deathSound, music, listener } from './audio';
import { DEFAULT_OBSTACLE_VELOCITY } from './globals';
import * as wall from './wall'
import { checkBouncePadCollisions, createBouncePads } from './bouncePad'
import * as spike from './spike'
import { Player } from './player'
import { checkForObstacleCollisions, updateObjectPositions } from './object';
import { createFloor } from './floor';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light Source
let light = new THREE.PointLight(0xffffff, 100, 0, 1);
light.position.set(10, 30, 10);
scene.add(light);

camera.position.set(-10, 40, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
camera.position.y = 1;
camera.add(listener)

const clock = new THREE.Clock();

let gameStarted = false;
const startOverlay = document.getElementById("start-overlay")!;
const startButton = document.getElementById("start-button")!;
startOverlay.style.display = "block";
startButton.addEventListener("click", () => { startGame(); });

let paused = false;
const pauseOverlay = document.getElementById("pause-overlay")!;
const resumeButton = document.getElementById("resume-button")!;
resumeButton.addEventListener("click", () => { togglePause(); });

let score = 0;
let highScore = parseFloat(localStorage.getItem("highScore") || "0"); // Load high score from localStorage
const scoreElement = document.getElementById("score")!;
const highScoreElement = document.getElementById("high-score")!;
highScoreElement.textContent = highScore.toFixed(1);

let walls = wall.createWalls();
let bouncePads = createBouncePads();
let spikes = spike.createSpikes();
let floor = createFloor()
const player = new Player()
scene.add(player.Mesh);
scene.add(floor);
addObjectsToScene(walls);
addObjectsToScene(bouncePads);
addObjectsToScene(spikes);

let time = 0
function animate() {
    controls.update();
    let delta_time = clock.getDelta();
    time += delta_time;

    if (gameStarted && !paused) {
        updateObjectPositions(delta_time, [...walls, ...bouncePads, ...spikes], DEFAULT_OBSTACLE_VELOCITY)
        player.update(delta_time)
        wall.checkForWallLandings(walls, player);
        checkBouncePadCollisions(bouncePads, player)
        checkForObstacleCollisions([...walls, ...spikes], player.Mesh, resetGame)

        score += delta_time * 10;
        scoreElement.textContent = score.toFixed(1);
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore.toFixed(1);
            localStorage.setItem("highScore", highScore.toFixed(1));
        }
    } 

    scene.background = updateBackgroundColor(time);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function startGame() {
    startOverlay.style.display = "none";
    gameStarted = true;
    music.play()
    clock.start()
}

function togglePause() {
    if (paused) {
        music.play();
        clock.start();
        pauseOverlay.style.display = "none"
    } else {
        clock.stop();
        music.pause();
        pauseOverlay.style.display = "block"
    }
    paused = !paused;
}

function addObjectsToScene(objects: THREE.Mesh[]) {
    for (var i = 0; i < objects.length; i++) {
        scene.add(objects[i])
    }
}

function removeObjectsFromScene(objects: THREE.Mesh[]) {
    for (var i = 0; i < objects.length; i++) {
        scene.remove(objects[i])
    }
}

function resetGame() {
    console.log("resetting game...");
    music.stop();
    deathSound.play()
    score = 0;
    scoreElement.textContent = score.toFixed(1);
    // Cleanup old objects
    removeObjectsFromScene([...walls, ...bouncePads, ...spikes])

    walls = wall.createWalls();
    bouncePads = createBouncePads();
    spikes = spike.createSpikes();
    addObjectsToScene(walls);
    addObjectsToScene(bouncePads);
    addObjectsToScene(spikes);

    player.reset()
    startGame()
}

function onKeyPress(event: any) {
    switch (event.key) {
        case ' ':
            if (!paused) { player.jump(); }
            break;
        case 'p':
            togglePause();
        default:
            console.debug(`Key ${event.key} pressed`);
    }
}

window.addEventListener('keydown', onKeyPress);
