//import all the libraries/images needed, as Parcel needs to 
// explicitly import them to use them. Helps also with the organization of it
import './modules/chatManager';
import './modules/render';
import './modules/audioManager';
// import './modules/gui';
// import './modules/infoManager';
import './modules/utilities';

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support audio recording.");
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