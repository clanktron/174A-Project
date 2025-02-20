import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Background color
let backgroundColor = new THREE.Color(0x000000);
scene.background = backgroundColor;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.set(0, 5, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);

camera.position.y = 1;

let hue = 0;
let lightness = 0;
let time = 0;

function animate() {
    controls.update();

    time += 0.02; // Adjust speed of movement
    cube.position.x = Math.sin(time) * 9; // Moves between -3 and 3

    hue += 0.003; // speed of change
    lightness += 0.001; // speed of change
    if (hue > 1) hue = 0; // Reset after full cycle
    backgroundColor.setHSL(hue, 0.5, lightness);
    scene.background = backgroundColor;

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
