// Import all the libraries/images needed, as Parcel needs to 
// explicitly import them to use them. Helps also with the organization of it
import './modules/chat';
import './modules/render'
import './modules/audioManager'
//import './modules/gui'


// add the voice recording stuff
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support audio recording.");
}




// import * as THREE from 'three';

// // Create the objects of our scene
// const scene = new THREE.Scene();
// const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer();

// // Set up the renderer
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Lighting
// const light = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(light);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(20, 20, 20);
// scene.add(directionalLight);

// // Create and add a red cube
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const cube = new THREE.Mesh(geometry, material);
// cube.position.set(0, 0, 0);
// scene.add(cube);


//add the objects to our scene
// const earthSphere = new SphereObject();
// const earth = earthSphere.getMesh();
// const moonSphere = new SphereObject();
// moonSphere.setTexture("images/moonTexture.jpg");
// const moon = moonSphere.getMesh();
// moon.scale.set(0.3,0.3,0.3);
// moon.position.y = 8;
// moon.position.x = 8;
// scene.add(earth);

// // var italy = latLongToCartesian(40, -12.6, 5);
// // const cubeInstance = new CubeObject(italy);
// // const cube = cubeInstance.getMesh();
// // scene.add(cube);

// //animate - main function from our animation stuff
// //---------------------
// function animate() {
//     requestAnimationFrame(animate);
//     moon.rotation.y -= 0.002;
//     moon.rotation.z += 0.003;
//     camera2.updateTransition();
//     renderer.render(scene, camera2.Camera);
// }
// animate();
// //---------------------


// //camera manipulation
// //---------------------
// let isDragging = false;
// let previousMousePosition = {
//     x: 0,
//     y: 0
// };

// document.addEventListener('mousedown', function(e) {
//     isDragging = true;
// });

// document.addEventListener('mouseup', function(e) {
//     isDragging = false;
// });

// document.addEventListener('mousemove', function(e) {
//     if (isDragging) {
//         const deltaMove = {
//             x: e.offsetX - previousMousePosition.x,
//             y: e.offsetY - previousMousePosition.y
//         };

//         handleRotation(camera2,deltaMove);
//     }
//     previousMousePosition = {
//         x: e.offsetX,
//         y: e.offsetY
//     };
// });
// //---------------------

//resize our window
//---------------------
// window.addEventListener('resize', () => {
//     camera2.aspect = window.innerWidth / window.innerHeight;
//     camera2.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// });
// //---------------------
