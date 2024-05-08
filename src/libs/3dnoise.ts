import { range } from '@motion-canvas/core';
import * as THREE from 'three';
import { PerlinNoise } from '../(unused)/Perlin';

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera();

var angle = 0;
export const updateCam = (increment: number = 0.03) => {
    angle += increment;
    const x = Math.cos(angle);
    const y = Math.cos(1);
    const z = Math.sin(angle);
    const vec = new THREE.Vector3(x, y, z).multiplyScalar(2);
    camera.position.copy(vec);
    camera.lookAt(new THREE.Vector3(0, -.3, 0));
}

const resolution = 16;
const scale = 1 / resolution;

export default function render(freq:number, map : PerlinNoise){
    for (var i = 0; i < resolution; i++) {
        for (var j = 0; j < resolution; j++) {
            const k = 0;
            const vertex = new THREE.Vector3(i, j, k).multiplyScalar(scale);
            const geoemtry = new THREE.BoxGeometry(scale, scale, scale);
            const value = map.noise(i / freq, j / freq, k / freq, 0, 1);
            const c = `${Math.floor(value * 256)}`;
            const material = new THREE.MeshBasicMaterial({ color: `rgb(${c},${c},${c})` });
            const cube = new THREE.Mesh(geoemtry, material);
            cube.position.copy(vertex.subScalar(resolution * scale / 2));
            scene.add(cube);
        }
    }

    for (var i = 0; i < resolution; i++) {
        for (var j = 0; j < resolution; j++) {
            const k = resolution - 1;
            const vertex = new THREE.Vector3(i, j, k).multiplyScalar(scale);
            const geoemtry = new THREE.BoxGeometry(scale, scale, scale);
            const value = map.noise(i / freq, j / freq, k / freq, 0, 1);
            const c = `${Math.floor(value * 256)}`;
            const material = new THREE.MeshBasicMaterial({ color: `rgb(${c},${c},${c})` });
            const cube = new THREE.Mesh(geoemtry, material);
            cube.position.copy(vertex.subScalar(resolution * scale / 2));
            scene.add(cube);
        }
    }

    for (var i = 0; i < resolution; i++) {
        for (var k = 0; k < resolution; k++) {
            const j = 0;
            const vertex = new THREE.Vector3(i, j, k).multiplyScalar(scale);
            const geoemtry = new THREE.BoxGeometry(scale, scale, scale);
            const value = map.noise(i / freq, j / freq, k / freq, 0, 1);
            const c = `${Math.floor(value * 256)}`;
            const material = new THREE.MeshBasicMaterial({ color: `rgb(${c},${c},${c})` });
            const cube = new THREE.Mesh(geoemtry, material);
            cube.position.copy(vertex.subScalar(resolution * scale / 2));
            scene.add(cube);
        }
    }

    for (var i = 1; i < resolution - 1; i++) {
        for (var k = 1; k < resolution - 1; k++) {
            const j = resolution - 1;
            const vertex = new THREE.Vector3(i, j, k).multiplyScalar(scale);
            const geoemtry = new THREE.BoxGeometry(scale, scale, scale);
            const value = map.noise(i / freq, j / freq, k / freq, 0, 1);
            const c = `${Math.floor(value * 256)}`;
            const material = new THREE.MeshBasicMaterial({ color: `rgb(${c},${c},${c})` });
            const cube = new THREE.Mesh(geoemtry, material);
            cube.position.copy(vertex.subScalar(resolution * scale / 2));
            scene.add(cube);
        }
    }

    for (var j = 0; j < resolution; j++) {
        for (var k = 0; k < resolution; k++) {
            const i = resolution - 1;
            const vertex = new THREE.Vector3(i, j, k).multiplyScalar(scale);
            const geoemtry = new THREE.BoxGeometry(scale, scale, scale);
            const value = map.noise(i / freq, j / freq, k / freq, 0, 1);
            const c = `${Math.floor(value * 256)}`;
            const material = new THREE.MeshBasicMaterial({ color: `rgb(${c},${c},${c})` });
            const cube = new THREE.Mesh(geoemtry, material);
            cube.position.copy(vertex.subScalar(resolution * scale / 2));
            scene.add(cube);
        }
    }

    for (var j = 0; j < resolution; j++) {
        for (var k = 0; k < resolution; k++) {
            const i = 0;
            const vertex = new THREE.Vector3(i, j, k).multiplyScalar(scale);
            const geoemtry = new THREE.BoxGeometry(scale, scale, scale);
            const value = map.noise(i / freq, j / freq, k / freq, 0, 1);
            const c = `${Math.floor(value * 256)}`;
            const material = new THREE.MeshBasicMaterial({ color: `rgb(${c},${c},${c})` });
            const cube = new THREE.Mesh(geoemtry, material);
            cube.position.copy(vertex.subScalar(resolution * scale / 2));
            scene.add(cube);
        }
    }
}