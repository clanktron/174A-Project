import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Audio Listener (attached to camera)
const listener = new THREE.AudioListener();
camera.add(listener);

const uniforms = {
    u_time: { value: 0.0 },
    u_audio: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};

const backgroundShaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float u_time;
        uniform float u_audio;
        uniform vec2 u_resolution;

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            uv -= 0.5;
            uv.x *= u_resolution.x / u_resolution.y; 

            float intensity = u_audio;
            
            // Pulsating effect
            float pulse = sin(u_time * 5.0 + intensity * 10.0) * 0.5 + 0.5;

            // Circular wave distortion
            float dist = length(uv);
            float wave = sin(dist * 10.0 - u_time * 3.0) * 0.1;
            uv += uv * wave * intensity;

            // Color shifting
            vec3 color = vec3(0.5 + 0.5 * sin(u_time + uv.x * 5.0), 
                              0.5 + 0.5 * sin(u_time + uv.y * 5.0), 
                              0.5 + 0.5 * cos(u_time));

            color += pulse * 0.3; // Brighten with pulse

            gl_FragColor = vec4(color, 1.0);
        }
    `,
    depthWrite: false, // Prevent depth issues
});

const backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backgroundShaderMaterial);
const backgroundScene = new THREE.Scene();
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
backgroundScene.add(backgroundMesh);

// Light Source
let light = new THREE.PointLight(0xffffff, 100, 0, 1);
light.position.set(10, 30, 10);
scene.add(light);

// Color animation constraints
const HUE_MIN = 0.2;  // Adjust these values to control the hue range
const HUE_MAX = 0.8;  // (0-1 represents the full color spectrum)
const LIGHTNESS_MIN = 0.3;  // Prevent colors from getting too dark
const LIGHTNESS_MAX = 0.7;  // Prevent colors from getting too bright

// Background color
let backgroundColor = new THREE.Color();
scene.background = backgroundColor;

// Generate random initial values within constraints
const initialHue = HUE_MIN + Math.random() * (HUE_MAX - HUE_MIN);
const initialLightness = LIGHTNESS_MIN + Math.random() * (LIGHTNESS_MAX - LIGHTNESS_MIN);
backgroundColor.setHSL(initialHue, 0.5, initialLightness);

// Calculate initial time based on the random hue
const hue_roc = 0.2;
const lightness_roc = 0.4;
let time = Math.acos(2 * ((initialHue - HUE_MIN) / (HUE_MAX - HUE_MIN)) - 1) / hue_roc;

const wallCount = 11;
const bouncePadCount = 16;
const spikeCount = 35;

// Player object
let player_height = 0.5;
const geometry = new RoundedBoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
const player = new THREE.Mesh(geometry, material);
player.position.y = player_height;
scene.add(player);

camera.position.set(-10, 40, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
camera.position.y = 1;

const clock = new THREE.Clock();

// Global sound sources
const music = new THREE.Audio(listener);
const musicLoader = new THREE.AudioLoader();
musicLoader.load('audio_sources/Geometry Dash - Fingerdash (Song).mp3', function( buffer ) {
	music.setBuffer( buffer );
	music.setLoop( true );
	music.setVolume( 0.5 );
});
const musicAnalyzer = new THREE.AudioAnalyser(music, 32)

const deathSound = new THREE.Audio(listener);
const deathSoundLoader = new THREE.AudioLoader();
deathSoundLoader.load('audio_sources/Geometry Dash - Death Sound.mp3', function( buffer ) {
	deathSound.setBuffer( buffer );
	deathSound.setLoop( false );
	deathSound.setVolume( 0.5 );
});

let max_jumps = 2;
let jump_counter = max_jumps;
let y_velocity = 0;
const gravity = -9.8;
let default_obstacle_velocity = 10;

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

let walls = createWalls(wallCount);
let bouncePads = createBouncePads(bouncePadCount);
let spikes = createSpikes(spikeCount);
let floor = createFloor();
scene.add(floor);
addObjectsToScene(walls);
addObjectsToScene(bouncePads);
addObjectsToScene(spikes);
music.play();

function animate() {
    controls.update();
    let delta_time = clock.getDelta();
    time += delta_time;

    if (gameStarted && !paused) {
        clock.start();
        if (!music.isPlaying) music.play();

        updatePlayer(delta_time);
        updateBouncePads(delta_time, bouncePads);
        updateSpikes(delta_time, spikes);
        updateWallPositions(delta_time, walls);
        checkForWallCollisions(walls);
        checkForWallLandings(walls);

        score += delta_time * 10;
        scoreElement.textContent = score.toFixed(1);
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore.toFixed(1);
            localStorage.setItem("highScore", highScore.toFixed(1));
        }
    } else {
        clock.stop();
        music.pause()
    }
    
    // Background color animation with constraints
    // Map cosine output (-1 to 1) to our desired hue range
    let hue = HUE_MIN + ((Math.cos(time * hue_roc) + 1) / 2) * (HUE_MAX - HUE_MIN);
    // Map cosine output (-1 to 1) to our desired lightness range
    let lightness = LIGHTNESS_MIN + ((Math.cos(time * lightness_roc) + 1) / 2) * (LIGHTNESS_MAX - LIGHTNESS_MIN);

    backgroundColor.setHSL(hue, 0.5, lightness);
    scene.background = backgroundColor;

    uniforms.u_time.value += 0.01;

    // Get frequency data from analyser
    const data = musicAnalyzer.getFrequencyData();
    // Emphasize bass frequencies (lower part of spectrum)
    let bass = data.slice(0, 10).reduce((sum, val) => sum + val, 0) / 10;
    uniforms.u_audio.value = bass / 256.0; // Normalize

    // Render background shader first
    renderer.render(backgroundScene, backgroundCamera);

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

function startGame() {
    startOverlay.style.display = "none";
    gameStarted = true;
    if (!music.isPlaying) music.play(0.5);
}

function togglePause() {
    paused = !paused;
    pauseOverlay.style.display = paused ? "block" : "none";
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
    const geometry = new RoundedBoxGeometry(1, 0.4, 1);
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

function createSpike(xPosition: number) {
    var height = 0.4;
    const geometry = new THREE.ConeGeometry(0.5, 0.75, 10, 1, false, Math.PI/4);
    const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    const spike = new THREE.Mesh(geometry, material);
    spike.position.y = height;
    spike.position.x = xPosition;
    return spike;
}

function createSpikes(count: number) {
    var spikes = []
    var xPosition = 33
    for (var i = 0; i < count; i++) {
        xPosition = xPosition + 9
        const newSpike = createSpike(xPosition)
        spikes.push(newSpike)
    }
    return spikes
}

function randomWallHeight(minHeight: number, maxHeight: number) {
    return Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
}

function createWall(startingPosition: number, height: number) {
    var height = height
    var startingPosition = startingPosition;
    const geometry = new RoundedBoxGeometry(1, height, 1);
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

function checkBouncePadCollisions(bouncePads: THREE.Mesh[]) {
    for (var i = 0; i < bouncePads.length; i++) {
        if ((bouncePads[i].position.x <= 1) && (bouncePads[i].position.x >= -1) && (player.position.y <= 0.7)) {
            y_velocity = 10;
            jump_counter = max_jumps;
        }
    }
}

function updateBouncePads(delta_time: number, bouncePads: THREE.Mesh[]) {
    updateBouncePadPositions(delta_time, bouncePads)
    checkBouncePadCollisions(bouncePads)
}

function updateSpikePositions(delta_time: number, spikes: THREE.Mesh[]) {
    for (var i = 0; i < spikes.length; i++) {
        spikes[i].position.x -= default_obstacle_velocity * delta_time;
    }
}

function checkSpikeCollisions(spikes: THREE.Mesh[]) {
    for (var i = 0; i < spikes.length; i++) {
        if ((spikes[i].position.x <= 1) && (spikes[i].position.x >= -1) && (player.position.y <= 0.75)) {
            resetGame();
        }
    }
}

function updateSpikes(delta_time: number, spikes: THREE.Mesh[]) {
    updateSpikePositions(delta_time, spikes);
    checkSpikeCollisions(spikes);
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
    music.stop();
    deathSound.play();
    console.log("resetting game...");

    // Set score to 0
    score = 0;
    scoreElement.textContent = score.toFixed(1);

    // Remove old walls, bounce pads, and spikes
    for (let i = 0; i < walls.length; i++) {
        scene.remove(walls[i]);
    }
    for (let i = 0; i < bouncePads.length; i++) {
        scene.remove(bouncePads[i]);
    }
    for (let i = 0; i < spikes.length; i++) {
        scene.remove(spikes[i]);
    }
    // Create new walls and bounce pads
    walls = createWalls(wallCount);
    bouncePads = createBouncePads(bouncePadCount);
    spikes = createSpikes(spikeCount);
    addObjectsToScene(walls);
    addObjectsToScene(bouncePads);
    addObjectsToScene(spikes);
    // Reset player position
    player.position.set(0, player_height, 0);
    y_velocity = 0;
    jump_counter = max_jumps;
    // Restart music
    music.play(0.5);
}

function onKeyPress(event: any) {
    switch (event.key) {
        case ' ':
            if (!paused) { jump(); }
            break;
        case 'p':
            togglePause();
        default:
            console.debug(`Key ${event.key} pressed`);
    }
}

window.addEventListener('keydown', onKeyPress);
