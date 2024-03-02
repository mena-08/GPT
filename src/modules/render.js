//import '../modules/gui';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

import TERRAIN_MAP from '../images/16kBaseMap.jpg';
import ENVMAP from '../images/envMapMilkyWay.jpg';
import BUMP_MAP from '../images/16kElevationMap.jpg';
import SPECULAR_MAP from '../images/16kWaterMap.png';
import CLOUDS_MAP from '../images/8kFairCloudsMap2.png'
import BOUNDARIES from '../images/16kBoundariesMap2.png';

import { WGS84ToECEF, moveCameraToTarget } from './utilities';
import { EarthSphereClass } from './object';
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
controls.enablePan = false;
controls.minDistance = 5.6;
controls.maxDistance = 100;

//lighting
const directional_light = new THREE.DirectionalLight(0xffffff, 0.2);
const ambient_light = new THREE.AmbientLight(0xffffff);
directional_light.position.set(0, 10, 0);

//nice background - diagonal milkyway
const sky_sphere = new THREE.SphereGeometry(1000, 16, 16);
const milkyWay = new THREE.TextureLoader().load(ENVMAP);
milkyWay.anisotropy = 8;

const background_material = new THREE.MeshBasicMaterial({ map: milkyWay });
const background = new THREE.Mesh(sky_sphere, background_material);
background.material.side = THREE.BackSide;
background.rotation.x = - (90 - 60) * (Math.PI / 180);

//clouds
const clouds = new THREE.TextureLoader().load(CLOUDS_MAP);
const clouds_material = new THREE.MeshBasicMaterial({
    map: clouds,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1
});
const clouds_geometry = new THREE.SphereGeometry(5.0005, 64, 64);
const clouds_sphere = new THREE.Mesh(clouds_geometry, clouds_material);

//boundaries
const boundaries = new THREE.TextureLoader().load(BOUNDARIES);
const boundaries_material = new THREE.MeshBasicMaterial({
    map: boundaries,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1
});
const boundaries_geometry = new THREE.SphereGeometry(5.001, 64, 64);
const boundaries_sphere = new THREE.Mesh(boundaries_geometry, boundaries_material);

scene.add(background);
scene.add(earth_sphere.getSphere());
scene.add(directional_light);
scene.add(ambient_light);
//scene.add(clouds_sphere);
scene.add(boundaries_sphere);


eventEmitter.on('textureChange', (newTextureURL) => {
    const texture = new THREE.TextureLoader().load(newTextureURL);
    clouds_material.map = texture;
    clouds_material.needsUpdate = true;
    scene.add(clouds_sphere);
    //earth_sphere.updateTexture(newTextureURL);
});

eventEmitter.on('makeTransition', (coordinatesJSON) => {
    const geometryType = coordinatesJSON.geometry.type;
    const coordinates = coordinatesJSON.geometry.coordinates;

    if (geometryType === 'Point') {
        console.log(`Point Coordinates: ${coordinates}`);
        const point = WGS84ToECEF(coordinates[0], coordinates[1], 0);
        moveCameraToTarget(new THREE.Vector3(point.x, point.y, point.z), camera);
        const geo = new THREE.SphereGeometry(0.01, 32, 32);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const test = new THREE.Mesh(geo, mat);
        test.position.x = point.x;
        test.position.y = point.y;
        test.position.z = point.z;
        scene.add(test);

    } else if (geometryType === 'Polygon') {
        console.log(`Polygon Coordinates: ${coordinates}`);
        //return coordinates; // Returns an array of arrays of coordinates
    } else {
        console.error('Unsupported geometry type');
        //return null;
    }
});

function render(time) {
    requestAnimationFrame(render);
    TWEEN.update(time);
    // clouds_sphere.rotation.y += 0.00013;
    controls.update();
    renderer.render(scene, camera);
}

//https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?LAYERS=AIRS_L3_Clear_Sky_Outgoing_Longwave_Radiation_Daily_Day&REQUEST=GetMap&SERVICE=WMS&FORMAT=image/png&WIDTH=16200&HEIGHT=8100&VERSION=1.1.1&SRS=epsg:4326&BBOX=-180,-90,180,90&TRANSPARENT=TRUE
render();
