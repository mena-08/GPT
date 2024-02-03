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

function moveCameraToTarget(targetPosition, camera, duration = 3000) {
    let midPoint = targetPosition.clone().normalize().multiplyScalar(9);
    midPoint.y += 6;

    //set up the tween to move to the mid-point first
    const tweenMid = new TWEEN.Tween(camera.position)
        .to({ x: midPoint.x, y: midPoint.y, z: midPoint.z }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.lookAt(targetPosition);
        })
        .onComplete(() => {
            let normal_point = targetPosition.clone().normalize().multiplyScalar(1.03);
            //reaching the mid point
            const tweenTarget = new TWEEN.Tween(camera.position)
                .to({ x: targetPosition.x + normal_point.x, y: targetPosition.y + normal_point.y, z: targetPosition.z + normal_point.z }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                    camera.lookAt(targetPosition);
                }).start();
        });
    tweenMid.start();
}

export { moveCameraToTarget };
export { WGS84ToECEF };