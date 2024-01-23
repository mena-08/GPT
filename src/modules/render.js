import * as THREE from 'three';
import '../modules/gui';
import imagePath2 from '../images/energy/egy-LandTemperatureDay.png';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const geometry = new THREE.SphereGeometry(5,64,64);
const texture = new THREE.TextureLoader().load(imagePath2);
//texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.minFilter = THREE.LinearMipmapLinearFilter;

const material = new THREE.MeshBasicMaterial({ map: texture});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 10;

function animate() {
	requestAnimationFrame( animate );

	//sphere.rotation.y += 0.01;
	//sphere.rotation.y += 0.01;
	controls.update();
	renderer.render( scene, camera );
}

animate();