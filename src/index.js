//import all the libraries/images needed, as Parcel needs to know about them
import './modules/chatManager';
import { animate, render } from './modules/render';
//import './modules/audioManager';
import './modules/utilities';
import {init} from './modules/renderWebGL';
import {onEnterXRClicked} from './modules/renderWebXR';

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support audio recording.");
}
if ('xr' in navigator) {
    init();
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
            const button = document.getElementById('xr-button'); // Change 'xr-button' to 'button'
            button.innerText = 'Enter VR'; 
            //document.body.appendChild(button); 
            button.addEventListener('click', onEnterXRClicked);
        } else {
            alert('Immersive VR is not supported');
        }
    });
} else {
    alert('WebXR is not supported');
}


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

//
//https://svs.gsfc.nasa.gov/documents/arch_4.html
//https://svs.gsfc.nasa.gov/api/30728
//https://svs.gsfc.nasa.gov/30728/

//This query could help us in the future to gather the maps
//https://gitc.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&request=GetMap&layers=VIIRS_SNPP_L2_Sea_Surface_Temp_Night&format=image/jpeg&transparent=true&version=1.3.0&width=1024&height=512&crs=EPSG:4326&bbox=-180,-90,180,90