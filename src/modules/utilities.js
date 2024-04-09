import TWEEN from '@tweenjs/tween.js';
import { vec3 } from "gl-matrix";

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
    return new vec3.fromValues(x, z, -y);
}

//refactor this to use the new camera an not the three one
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


export { moveCameraToTarget, WGS84ToECEF };
