import {Pane} from 'tweakpane';
import '../modules/render';
import { eventEmitter } from './eventEmitter';
//1. Folder for settings/information - I can create a big panel on where I can show information to it.
//2. Folder for maps (?) images for now, later GEOTIFF, GEOJSON ETC...

const parent_pane = new Pane({
    container: document.getElementById('pane-maps-container'),
});
// Settings folder
const folder_settings = parent_pane.addFolder({
    title: 'Settings',
});
folder_settings.addButton({
    title: 'Hide',
    label: 'Information',
});

//Maps organization, import all the images for further use
const maps = {
    energyMaps: Object.entries(require('../images/energy/*.png')),
    lifeMaps: Object.entries(require('../images/life/*.png')),
    terrainMaps: Object.entries(require('../images/terrain/ter-Earth.jpg')),
    atmosphereMaps: Object.entries(require('../images/atmosphere/*.png')),
};
const map_categories = {
    Atmosphere: ['Aerosol Optical Thickness', 'Aerosol Particles Radius', 'CO2-2020', 'CO2-2023', 'Water Vapor'],
    Energy: ['Energy Albedo', 'Average Temperature DAY', 'Average Temperature NIGHT'],
    Life: ['Chlorophyll Concentration', 'Leaf Area'],
    Terrain: ['Earth Texture']
};

//select different maps when a user clicks it 
function handleButtonClick(label, index, category) {
    //console.log(`Button clicked: ${label}, Index: ${index}, Category: ${category}`);
    switch (category) {
        case 'Energy':
            selectedMap = maps.energyMaps[index][1];
            break;
        case 'Life':
            selectedMap = maps.lifeMaps[index][1];
            break;
        case 'Terrain':
            selectedMap = maps.terrainMaps[index][1];
            break;
        case 'Atmosphere':
            selectedMap = maps.atmosphereMaps[index][1];
            break;
        default:
            console.warn(`Unknown category: ${category}`);
            return;
    }
    //console.log(selectedMap);
    eventEmitter.emit('textureChange', selectedMap);
};

//create folders and buttons dynamically
Object.keys(map_categories).forEach(category => {
    const folder = parent_pane.addFolder({ title: category });
    map_categories[category].forEach((mapName, index) => {
        const button = folder.addButton({
            title: 'Select',
            label: mapName,
        });
        button.on('click', () => handleButtonClick(mapName, index, category));
    });
});
