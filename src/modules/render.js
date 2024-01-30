import '../modules/gui';
import * as THREE from 'three';

import TERRAIN_MAP from '../images/10kearth.jpg';
import ENVMAP from '../images/envMapMilkyWay.jpg';
import BUMP_MAP from '../images/10kearthbump.jpg';
import SPECULAR_MAP from '../images/10kearthspecular.jpg';

import { EarthSphereClass } from './object';
import { WGS84ToECEF } from './utilities';
import { eventEmitter } from './eventEmitter';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer();
camera.position.z = 20;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const earth_sphere = new EarthSphereClass(TERRAIN_MAP, BUMP_MAP, SPECULAR_MAP);
const controls = new OrbitControls(camera, renderer.domElement);

//lighting
const directional_light = new THREE.DirectionalLight(0xffffff, 0.2);
const ambient_light = new THREE.AmbientLight(0xffffff);
directional_light.position.set(5, 3, 5);

//nice background - diagonal milkyway
const sky_sphere = new THREE.SphereGeometry(1000, 16, 16);
const milkyWay = new THREE.TextureLoader().load(ENVMAP);
milkyWay.anisotropy = 8;

const background_material = new THREE.MeshBasicMaterial({ map: milkyWay });
const background = new THREE.Mesh(sky_sphere, background_material);
background.material.side = THREE.BackSide;
background.rotation.x = - (90 - 60) * (Math.PI / 180);

// ONLY FOR TESTING COORD SYSTEM
// ----------------------------

//- RED X
const geox = new THREE.SphereGeometry(0.4, 32, 32);
const matx = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const testx = new THREE.Mesh(geox, matx);
testx.position.x = 1;
testx.position.y = 0;
testx.position.z = 0;

//- GREEN Y
const geoy = new THREE.SphereGeometry(0.4, 32, 32);
const maty = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const testy = new THREE.Mesh(geoy, maty);
testy.position.x = 0;
testy.position.y = 1;
testy.position.z = 0;

//- BLUE Z
//const geoz = new THREE.SphereGeometry( 0.4, 32, 32 ); 
const matz = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const testz = new THREE.Mesh(geoy, matz);
testz.position.x = 0;
testz.position.y = 0;
testz.position.z = 1;

const y = WGS84ToECEF(0, 0, 0);
const georoot = new THREE.SphereGeometry(0.1, 32, 32);
const matroot = new THREE.MeshBasicMaterial({ color: 0xffffff });
const testroot = new THREE.Mesh(georoot, matroot);
testroot.position.x = y.x;
testroot.position.y = y.y;
testroot.position.z = y.z;
scene.add(testx);
scene.add(testy);
scene.add(testz);
scene.add(testroot);
// ----------------------------
// ONLY FOR TESTING COORD SYSTEM

scene.add(background);
scene.add(earth_sphere.getSphere());
scene.add(directional_light);
scene.add(ambient_light);

// ONLY FOR TESTING WGS84 COORDS
// ----------------------------
const x = WGS84ToECEF(86.924831, 27.987868, 0);
const geo = new THREE.SphereGeometry(0.05, 32, 32);
const mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const test = new THREE.Mesh(geo, mat);
test.position.x = x.x;
test.position.y = x.y;
test.position.z = x.z;
scene.add(test);
// ----------------------------
// ONLY FOR TESTING WGS84 COORDS

eventEmitter.on('textureChange', (newTextureURL) => {
    earth_sphere.updateTexture(newTextureURL);
});

function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

render();
