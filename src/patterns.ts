import * as THREE from 'three';
import { OBJECT_SPACING } from './globals';
import { createWall, randomWallHeight } from './wall';
import { createBouncePad } from './bouncePad';
import { createSpike } from './spike';


export type PatternItem = {
  type: 'wall' | 'bouncePad' | 'spike';
  height?: number;
};


export const pattern1: PatternItem[] = [
  { type: 'wall', height: 2.1 },
  { type: 'spike' },
  { type: 'bouncePad' },
  { type: 'wall', height: 5.4 },
  { type: 'spike' },
];


export const pattern2: PatternItem[] = [
  { type: 'spike' },
  { type: 'bouncePad' },
  { type: 'wall', height: 5.4 },
  { type: 'wall', height: 2 },
  { type: 'spike' },
];

export const pattern3: PatternItem[] = [
    { type: 'spike' },
    { type: 'spike' },
    { type: 'wall', height: 1.8 },
    { type: 'spike' },
    { type: 'spike' },
  ];


export function spawnPattern(
  objects: Map<string, THREE.Mesh[]>,
  pattern: PatternItem[],
  furthestObjectPosition: number,
  scene: THREE.Scene,
  currentVel: number
): number {
  for (let config of pattern) {
    let newObject: THREE.Mesh;
    if (config.type === 'wall') {
      newObject = createWall(furthestObjectPosition, config.height || randomWallHeight(1, 3));
    } else if (config.type === 'bouncePad') {
      newObject = createBouncePad(furthestObjectPosition);
    } else if (config.type === 'spike') {
      newObject = createSpike(furthestObjectPosition);
    } else {
      continue;
    }

    scene.add(newObject);

    if (!objects.has(config.type)) {
      objects.set(config.type, []);
    }
    objects.get(config.type)!.push(newObject);

    furthestObjectPosition += OBJECT_SPACING + (currentVel/3);
  }
  return furthestObjectPosition;
}