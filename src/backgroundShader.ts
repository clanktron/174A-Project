import * as THREE from 'three';

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

function animate() {
    uniforms.u_time.value += 0.01;

    // uniforms.u_audio.value = bass / 256.0; // Normalize

    // Render background shader first
    // renderer.render(backgroundScene, backgroundCamera);
}

