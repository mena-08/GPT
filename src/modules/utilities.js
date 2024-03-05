import { Vector3 } from "three";
import TWEEN from '@tweenjs/tween.js';

function WGS84ToECEF(long, lat, alt) {
    //first convert the decimal degrees coordinates into radians
    let long_radians = long * (Math.PI / 180);
    let lat_radians = lat * (Math.PI / 180);

    let R = 5;
    let h = 0;
    let x = (R + h) * Math.cos(lat_radians) * Math.cos(long_radians);
    let y = (R + h) * Math.cos(lat_radians) * Math.sin(long_radians);
    let z = (R + h) * Math.sin(lat_radians);
    //as here the Y is up and -Z is towards us
    return new Vector3(x, z, -y);
}

function moveCameraToTarget(target_position, camera, duration = 3000) {
    let mid_point = target_position.clone().normalize().multiplyScalar(5);
    mid_point.y += 6;

    //set up the tween to move to the mid-point first
    const tweenMid = new TWEEN.Tween(camera.position)
        .to({ x: mid_point.x, y: mid_point.y, z: mid_point.z }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.lookAt(target_position);
        })
        .onComplete(() => {
            let normal_point = target_position.clone().normalize().multiplyScalar(1.03);
            //reaching the mid point
            const tweenTarget = new TWEEN.Tween(camera.position)
                .to({ x: target_position.x + normal_point.x, y: target_position.y + normal_point.y, z: target_position.z + normal_point.z }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                    camera.lookAt(target_position);
                }).start();
        });
    tweenMid.start();
}

export { moveCameraToTarget };
export { WGS84ToECEF };

// function setupBuffers(gl, program) {
//     // Set up the vertex buffer
//     const positionBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//     const positions = [
//         -1, -1,
//         1, -1,
//         -1, 1,
//         1, 0.5,
//     ];
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
//     const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
//     gl.enableVertexAttribArray(positionAttributeLocation);
//     gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
// }
