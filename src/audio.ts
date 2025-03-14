import * as THREE from "three";

const backgroundAudioFile =
  "audio_sources/Geometry Dash - Fingerdash (Song).mp3";
const deathAudioFile = "audio_sources/Geometry Dash - Death Sound.mp3";

export const listener = new THREE.AudioListener();

export const music = new THREE.Audio(listener);
export const deathSound = new THREE.Audio(listener);

const musicLoader = new THREE.AudioLoader();
const deathSoundLoader = new THREE.AudioLoader();

musicLoader.load(backgroundAudioFile, (buffer) => {
  music.setBuffer(buffer);
  music.setLoop(true);
  music.setVolume(0.5);
});

deathSoundLoader.load(deathAudioFile, (buffer) => {
  deathSound.setBuffer(buffer);
  deathSound.setLoop(false);
  deathSound.setVolume(0.5);
});

// Music Analyzer for external access
export const musicAnalyzer = new THREE.AudioAnalyser(music, 32);
export function getMusicBass(): number {
  // Get frequency data from analyser
  const data = musicAnalyzer.getFrequencyData();
  // Emphasize bass frequencies (lower part of spectrum)
  return data.slice(0, 10).reduce((sum, val) => sum + val, 0) / 10;
}
