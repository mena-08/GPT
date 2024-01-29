//import all the libraries/images needed, as Parcel needs to 
// explicitly import them to use them. Helps also with the organization of it
import './modules/chatManager';
import './modules/render';
import './modules/audioManager';
import './modules/gui';
import './modules/infoManager'

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support audio recording.");
}

// https://en.wikipedia.org/wiki/Web_Map_Service