import * as THREE from 'three';

// Color animation constraints
const HUE_MIN = 0.2;  // Adjust these values to control the hue range
const HUE_MAX = 0.8;  // (0-1 represents the full color spectrum)
const LIGHTNESS_MIN = 0.3;  // Prevent colors from getting too dark
const LIGHTNESS_MAX = 0.7;  // Prevent colors from getting too bright

// Background color
let backgroundColor = new THREE.Color();

// Generate random initial values within constraints
const initialHue = HUE_MIN + Math.random() * (HUE_MAX - HUE_MIN);
const initialLightness = LIGHTNESS_MIN + Math.random() * (LIGHTNESS_MAX - LIGHTNESS_MIN);
backgroundColor.setHSL(initialHue, 0.5, initialLightness);

// Calculate initial time based on the random hue
const hue_roc = 0.2;
const lightness_roc = 0.4;
// let time = Math.acos(2 * ((initialHue - HUE_MIN) / (HUE_MAX - HUE_MIN)) - 1) / hue_roc;


export function updateBackgroundColor(time: number): THREE.Color {
    // Background color animation with constraints
    // Map cosine output (-1 to 1) to our desired hue range
    let hue = HUE_MIN + ((Math.cos(time * hue_roc) + 1) / 2) * (HUE_MAX - HUE_MIN);
    // Map cosine output (-1 to 1) to our desired lightness range
    let lightness = LIGHTNESS_MIN + ((Math.cos(time * lightness_roc) + 1) / 2) * (LIGHTNESS_MAX - LIGHTNESS_MIN);
    return backgroundColor.setHSL(hue, 0.5, lightness);
}
