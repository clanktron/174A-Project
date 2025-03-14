import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { updateBackgroundColor } from './background';
import { deathSound, music, listener } from './audio';
import { DEFAULT_OBSTACLE_VELOCITY, OBJECT_SPACING, OBJECT_SPAWN_START, OBJECT_SPAWN_LIMIT } from './globals';
import { createWall, randomWallHeight, checkForWallLandings } from './wall';
import { checkBouncePadCollisions, createBouncePad } from './bouncePad';
import * as spike from './spike';
import { Player } from './player';
import { checkForObstacleCollisions, updateObjectPositions, removeOffscreenObjects } from './object';
import { createFloor } from './floor';
import { spawnPattern, pattern1, pattern2, pattern3 } from './patterns';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(-10, 40, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
camera.position.y = 1;
camera.add(listener);

let light = new THREE.PointLight(0xffffff, 100, 0, 1);
light.position.set(10, 30, 10);
scene.add(light);

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
const speedElement = document.getElementById("currentVelocity")!;

let objects: Map<string, THREE.Mesh[]> = new Map();
const { floor, floorTexture } = createFloor();
const player = new Player();
scene.add(player.Mesh);
scene.add(floor);

function spawnObjects(objects: Map<string, THREE.Mesh[]>) {
    if (furthestSpawnPosition < OBJECT_SPAWN_START) {
        furthestSpawnPosition = OBJECT_SPAWN_START;
    }
}

function spawnSinglePattern(currentVelocity: number){
    if (Math.random() < 0.34) {
        furthestSpawnPosition = spawnPattern(objects, pattern1, furthestSpawnPosition, scene, currentVelocity);
      } else {
        if (Math.random() < 0.5) {
            furthestSpawnPosition = spawnPattern(objects, pattern2, furthestSpawnPosition, scene, currentVelocity);
        }else{
            furthestSpawnPosition = spawnPattern(objects, pattern3, furthestSpawnPosition, scene, currentVelocity);
        }
      }
}

let furthestObjectPosition = 0
let currentVelocity = DEFAULT_OBSTACLE_VELOCITY
let timeElapsed = 0
let furthestSpawnPosition = 0
let timeSinceLastSpawn = 0

function animate() {
    controls.update();
    let delta_time = clock.getDelta();
    timeElapsed += delta_time;

    // More pronounced camera panning effect
    const panX = Math.sin(timeElapsed * 0.15) * 6;  // Increased side-to-side sway
    const panY = Math.sin(timeElapsed * 0.1) * 3;   // More noticeable vertical movement
    const panZ = Math.cos(timeElapsed * 0.12) * 6;  // Stronger forward-backward drift

    // Update camera position while keeping it looking at the obstacles
    camera.position.set(-10 + panX, 4 + panY, 12 + panZ);

    if (gameStarted && !paused) {
        currentVelocity += 0.0005;
        floorTexture.offset.x += currentVelocity * delta_time;
        timeSinceLastSpawn += delta_time;
        if (timeSinceLastSpawn >= 1.3) {
            spawnSinglePattern(currentVelocity);
            timeSinceLastSpawn = 0;
        }
        spawnObjects(objects);
        objects.forEach((meshes, _) => {
            removeOffscreenObjects(meshes, scene);
            furthestObjectPosition = updateObjectPositions(delta_time, meshes, currentVelocity);
        });
        player.update(delta_time);
        checkBouncePadCollisions(objects.get("bouncePad") ?? [], player);
        checkForWallLandings(objects.get("wall") ?? [], player)
        checkForObstacleCollisions(
            [...(objects.get("spike") ?? []), ...(objects.get("wall") ?? [])], 
            player.Mesh, 
            resetGame
        );

        speedElement.textContent = currentVelocity.toFixed(1);
        score += delta_time * 10;
        scoreElement.textContent = score.toFixed(1);
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore.toFixed(1);
            localStorage.setItem("highScore", highScore.toFixed(1));
        }
    }
    scene.background = updateBackgroundColor(score / 100);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function startGame() {
    startOverlay.style.display = "none";
    gameStarted = true;
    music.play();
    clock.start();
}

function togglePause() {
    if (gameStarted) {
        if (paused) {
            music.play();
            clock.start();
            pauseOverlay.style.display = "none";
        } else {
            clock.stop();
            music.pause();
            pauseOverlay.style.display = "block";
        }
        paused = !paused;
    }
}

function resetGame() {
    console.log("resetting game...");
    music.stop();
    deathSound.stop();
    deathSound.play();
    pauseOverlay.style.display = "none";
    score = 0;
    scoreElement.textContent = score.toFixed(1);
    objects.forEach((meshes, _) => {
        meshes.forEach((mesh, _) => {
           scene.remove(mesh)
        });
    });
    objects = new Map();
    furthestObjectPosition = 0;
    furthestSpawnPosition = 0;
    currentVelocity = DEFAULT_OBSTACLE_VELOCITY
    player.reset();
    startGame();
}

window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        if (!paused) player.jump();
        if (!gameStarted) startGame()
    } else if (event.key === 'p') {
        togglePause();
    } else if (event.key === 'r') {
        resetGame();
    }
});
