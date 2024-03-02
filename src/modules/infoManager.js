import { eventEmitter } from './eventEmitter';

//probably take a screenshot and ask the information from it 
// ASK SOMETHING LIKE THIS TO FILL THE INFORMATION PANEL
// Can you give me information about a map of Aerosol Optical Thickness from the Earth? 
// Please search the information from this page as the map also comes from that website:
// https://neo.gsfc.nasa.gov/
// Finally, give me 3 different answers: one for kids, another one for teenagers, and lastly for adults.

//TODO: this can help in the meantime but it can be further improved for any loading gif whatever something appealing

eventEmitter.on('change', () => {
    //document.getElementById('map-info').innerHTML = 'Loading map information...';
});
