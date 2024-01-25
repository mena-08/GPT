import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../modules/gui';
import { SphereClass } from './object';
import { eventEmitter } from './eventEmitter';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const initialTextureURL = 'http://localhost:1234/atm-WaterVapor.6bba7507.png?1706182746121';
const mySphere = new SphereClass(initialTextureURL);
scene.add(mySphere.getSphere()); 
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 20;

eventEmitter.on('textureChange', (newTextureURL) => {
	mySphere.updateTexture(newTextureURL);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();