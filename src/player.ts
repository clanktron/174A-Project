import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const DEFAULT_HEIGHT = 1;
const MAX_JUMPS = 2;
const JUMP_VELOCITY = 5;
const GRAVITY = -9.8;

export class Player {
    Mesh: THREE.Mesh;
    Height: number;
    MaxJumps: number;
    JumpCounter: number;
    YVelocity: number;

  constructor() {
    const geometry = new RoundedBoxGeometry(1, DEFAULT_HEIGHT, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    this.Mesh = new THREE.Mesh(geometry, material);
    this.Mesh.position.y = DEFAULT_HEIGHT / 2;

    this.Height = DEFAULT_HEIGHT;
    this.MaxJumps = MAX_JUMPS;
    this.JumpCounter = MAX_JUMPS;
    this.YVelocity = 0;
  }

  update(deltaTime: number, gravity: number = GRAVITY) {
    this.YVelocity += gravity * deltaTime;
    this.Mesh.position.y += this.YVelocity * deltaTime;

    if (this.Mesh.position.y <= this.Height/2 && this.YVelocity <= 0) {
      this.Mesh.position.y = this.Height/2;
      this.YVelocity = 0;
      this.JumpCounter = this.MaxJumps;
    }
  }

  reset() {
    this.Mesh.position.set(0, this.Height/2, 0);
    this.YVelocity = 0;
    this.JumpCounter = this.MaxJumps;
  }

  jump() {
      if (this.JumpCounter > 0) {
          this.YVelocity = JUMP_VELOCITY;
          this.JumpCounter--;
      }
  }
}
