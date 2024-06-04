//import all the libraries/images needed, as Parcel needs to know about them
import './modules/utilities';
import { initWebGL } from './modules/render-webgl';
import { onEnterXRClicked } from './modules/render-webxr';
import { requestMicrophoneAccess } from './modules/audio-manager';

let is_mobile = false;

function detectDevice() {
    const user_agent = navigator.userAgent || window.opera;
    const is_Android = /android/i.test(user_agent);
    const is_IOS = /iPad|iPhone|iPod/.test(user_agent) && !window.MSStream;

    if (is_Android || is_IOS) {
        is_mobile = true;
    }
}

function initialize() {
    detectDevice();
    initWebGL();
    checkMicrophoneSupport();

    if ('xr' in navigator) {
        checkVRSessions();
    } else {
        alert('WebXR is not supported for this browser.');
        requestMicrophoneAccess();
    }
}

function checkMicrophoneSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support audio recording.");
    }
    requestMicrophoneAccess();
}

function checkVRSessions() {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        const button = document.getElementById('xr-button');
        if (supported) {
            button.addEventListener('click', () => onEnterXRClicked(true));
        } else {
            button.disabled = true;
            button.style.display = 'none';
            alert('Immersive VR/AR is not supported');
        }
    });
}

document.addEventListener('DOMContentLoaded', initialize);

// https://en.wikipedia.org/wiki/Web_Map_Service

//Here's detailed how can we receive the information about it 
//GeoJSON returns -> {"type": "Point", "coordinates": [lon, lat, alt]}
//https://datatracker.ietf.org/doc/html/rfc7946#section-9


//useful repo
//https://github.com/jmcginty15/Solar-system-simulator/tree/master/static

//useful textures resource
//https://www.shadedrelief.com/natural3/pages/textures.html#anchor

//anisotropy
//https://sbcode.net/threejs/anisotropic/

//https://svs.gsfc.nasa.gov/documents/arch_4.html
//https://svs.gsfc.nasa.gov/api/30728
//https://svs.gsfc.nasa.gov/30728/

//https://sphere.ssec.wisc.edu/weathersatellites/

//This query could help us in the future to gather the maps
//https://gitc.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&request=GetMap&layers=VIIRS_SNPP_L2_Sea_Surface_Temp_Night&format=image/jpeg&transparent=true&version=1.3.0&width=1024&height=512&crs=EPSG:4326&bbox=-180,-90,180,90