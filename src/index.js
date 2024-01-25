//import all the libraries/images needed, as Parcel needs to 
// explicitly import them to use them. Helps also with the organization of it
import './modules/chat';
import './modules/render'
import './modules/audioManager'
import './modules/gui'

// check if our device is compatible with the voice recording!
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support audio recording.");
}
