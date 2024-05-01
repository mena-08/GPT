import camera from "./camera";

let cameraMovement = {
    forward: 0,
    right: 0,
    left:0,
    back:0
};

let isMouseDown = false;
let lastMouseX = null;
let lastMouseY = null;
const mouseDelta = { x: 0, y: 0 };

document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('mousemove', onMouseMove, false);


document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'ArrowUp':    cameraMovement.forward = 1; break;
        case 'ArrowDown':  cameraMovement.forward = -1; break;
        case 'ArrowLeft':  cameraMovement.right = -1; break;
        case 'ArrowRight': cameraMovement.right = 1; break;
    }
});

document.addEventListener('keyup', function(event) {
    switch(event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            cameraMovement.forward = 0;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            cameraMovement.right = 0;
            break;
    }
});

function updateCameraPosition(deltaTime) {
    const speed = 2.0;
    camera.position[0] += cameraMovement.right * speed * deltaTime;
    camera.position[2] += cameraMovement.forward * speed * deltaTime;

    //camera.updateViewMatrix();
}
function onMouseDown(event) {
    isMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function onMouseUp() {
    isMouseDown = false;
}

function onMouseMove(event) {
    if (!isMouseDown) {
        return;
    }

    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;

    mouseDelta.x += deltaX;
    mouseDelta.y += deltaY;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

document.addEventListener('wheel', onWheel, false);

function onWheel(event) {
    const zoomSpeed = 0.1;

    //calculate the zoom direction based on the wheel delta
    const zoomDirection = event.deltaY > 0 ? -1 : 1;

    //calculate the vector from the camera to its target
    let cameraDirection = [
        camera.target[0] - camera.position[0],
        camera.target[1] - camera.position[1],
        camera.target[2] - camera.position[2]
    ];

    //normalize the direction vector
    const length = Math.sqrt(cameraDirection[0] * cameraDirection[0] + 
                             cameraDirection[1] * cameraDirection[1] + 
                             cameraDirection[2] * cameraDirection[2]);
    cameraDirection = [
        cameraDirection[0] / length,
        cameraDirection[1] / length,
        cameraDirection[2] / length
    ];

    //uppdate the camera position based on the zoom direction and speed
    camera.position[0] += cameraDirection[0] * zoomSpeed * zoomDirection;
    camera.position[1] += cameraDirection[1] * zoomSpeed * zoomDirection;
    camera.position[2] += cameraDirection[2] * zoomSpeed * zoomDirection;

    //update the camera view matrix
    camera.updateViewMatrix();
}


function updateCameraOrbit(deltaTime) {
    const orbitSpeed = 0.2;

    //spherical coordinates of the camera position
    let radius = Math.sqrt(camera.position[0] ** 2 + camera.position[1] ** 2 + camera.position[2] ** 2);
    let theta = Math.atan2(camera.position[0], camera.position[2]); // Azimuthal angle
    let phi = Math.acos(camera.position[1] / radius); // Polar angle

    theta -= mouseDelta.x * deltaTime * orbitSpeed;
    phi -= mouseDelta.y * deltaTime * orbitSpeed;

    //clamp phi to avoid flipping at the poles
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

    //spherical to xyz coordinates
    camera.position[0] = radius * Math.sin(phi) * Math.sin(theta);
    camera.position[1] = radius * Math.cos(phi);
    camera.position[2] = radius * Math.sin(phi) * Math.cos(theta);

    mouseDelta.x = 0;
    mouseDelta.y = 0;
    //camera.updateViewMatrix();
}

export { updateCameraPosition, updateCameraOrbit};
