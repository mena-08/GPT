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
    const speed = 2.0; // Units per second
    camera.position[0] += cameraMovement.right * speed * deltaTime;
    camera.position[2] += cameraMovement.forward * speed * deltaTime;

    camera.updateViewMatrix();
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

function updateCameraOrbit(deltaTime) {
    const orbitSpeed = 0.2; // Adjust as needed

    // Assume a spherical coordinate system for the camera position
    let radius = Math.sqrt(camera.position[0] ** 2 + camera.position[1] ** 2 + camera.position[2] ** 2);
    let theta = Math.atan2(camera.position[0], camera.position[2]); // Azimuth
    let phi = Math.acos(camera.position[1] / radius); // Polar angle

    // Adjust theta and phi based on mouse movement
    theta -= mouseDelta.x * deltaTime * orbitSpeed;
    phi -= mouseDelta.y * deltaTime * orbitSpeed;

    // Clamp phi to avoid flipping at the poles
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

    // Convert spherical coordinates back to Cartesian for the camera position
    camera.position[0] = radius * Math.sin(phi) * Math.sin(theta);
    camera.position[1] = radius * Math.cos(phi);
    camera.position[2] = radius * Math.sin(phi) * Math.cos(theta);

    // Reset mouse delta after updating
    mouseDelta.x = 0;
    mouseDelta.y = 0;

    // Update the camera's view matrix
    camera.updateViewMatrix();
}

export { updateCameraPosition, updateCameraOrbit};
