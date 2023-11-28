// Creeatr the objects of our scene
const scene = new THREE.Scene();
const camera2 = new Camera();
const renderer = new THREE.WebGLRenderer();
camera2.setPositionZ(20);


//set up the renderer
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//for zooming
const canvas = renderer.domElement;
canvas.addEventListener('wheel', handleZoom);

//add the light the scene
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(20, 20, 20); 
scene.add(directionalLight);


//add the objects to our scene
const earthSphere = new SphereObject();
const earth = earthSphere.getMesh();
const moonSphere = new SphereObject();
moonSphere.setTexture("moonTexture.jpg");
const moon = moonSphere.getMesh();
moon.scale.set(0.3,0.3,0.3);
moon.position.y = 8;
moon.position.x = 8;

scene.add(earth);
//[1.9378, 1.1552, 4.462]
var argentina = latLongToCartesian(40, -12.6, 5);
const cubeInstance = new CubeObject(argentina);
const cube = cubeInstance.getMesh();
scene.add(cube);

//animate - main function from our animation stuff
//---------------------
function animate() {
    requestAnimationFrame(animate);
    moon.rotation.y -= 0.002;
    moon.rotation.z += 0.003;
    camera2.updateTransition();
    renderer.render(scene, camera2.Camera);
}
animate();
//---------------------


//camera manipulation
//---------------------
let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

document.addEventListener('mousedown', function(e) {
    isDragging = true;
});

document.addEventListener('mouseup', function(e) {
    isDragging = false;
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        const deltaMove = {
            x: e.offsetX - previousMousePosition.x,
            y: e.offsetY - previousMousePosition.y
        };

        handleRotation(camera2,deltaMove);
    }
    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
});
//---------------------

//resize our window
//---------------------
window.addEventListener('resize', () => {
    camera2.aspect = window.innerWidth / window.innerHeight;
    camera2.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
//---------------------
