import * as THREE from 'three';

const INITIAL_SPIKE_COUNT = 35;

const height = 0.4

function createSpike(xPosition: number) {
    const geometry = new THREE.ConeGeometry(0.5, 0.75, 10, 1, false, Math.PI/4);
    const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    const spike = new THREE.Mesh(geometry, material);
    spike.position.y = height;
    spike.position.x = xPosition;
    return spike;
}

export function createSpikes() {
    var spikes = []
    var xPosition = 33
    for (var i = 0; i < INITIAL_SPIKE_COUNT; i++) {
        xPosition = xPosition + 9
        const newSpike = createSpike(xPosition)
        spikes.push(newSpike)
    }
    return spikes
}
