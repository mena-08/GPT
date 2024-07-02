import TWEEN from '@tweenjs/tween.js';
import camera from './camera';
import { vec3 } from "gl-matrix";

function WGS84ToECEF(lat, long, R) {
    //first convert the decimal degrees coordinates into radians
    let long_radians = long * (Math.PI / 180);
    let lat_radians = lat * (Math.PI / 180);

    // let R = 1;
    let h = 0;
    let x = (R + h) * Math.cos(lat_radians) * Math.cos(long_radians);
    let y = (R + h) * Math.cos(lat_radians) * Math.sin(long_radians);
    let z = (R + h) * Math.sin(lat_radians);
    //coordinates are flipped in the texture
    return new vec3.fromValues(-x, z, y);
}

//TODO: Maybe use this if we have more objects, we need to rotate the sphere and move the camera
function moveCamera(from, to, duration = 3000) {
    const initialPosition = { x: from[0], y: from[1], z: from[2] };
    const finalPosition = { x: to[0], y: to[1], z: to[2] };

    new TWEEN.Tween(initialPosition)
        .to(finalPosition, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.setPosition(initialPosition.x, initialPosition.y, initialPosition.z);
            camera.updateViewMatrix();
        })
        .start();
}

export { WGS84ToECEF, moveCamera };
