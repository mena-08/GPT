import { Vector3 } from "three";
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

export { WGS84ToECEF };