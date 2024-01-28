import '../modules/render';
import { Pane } from 'tweakpane';
import { eventEmitter } from './eventEmitter';

// Create the the UI panes 
const parent_pane = new Pane({
    container: document.getElementById('pane-maps-container'),
});
const folder_settings = parent_pane.addFolder({
    title: 'Settings',
});
const btn_hide = folder_settings.addButton({
    title: 'Hide',
    label: 'Information',
});

//Create the maps entries; array with two elements: the key (map name) and the value (map imagepath).
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

//Create the UI buttons with map and category names
Object.keys(map_categories).forEach(category => {
    const folder = parent_pane.addFolder({ title: category });
    map_categories[category].forEach((mapName, index) => {
        const button = folder.addButton({
            title: 'Select',
            label: mapName,
        });
        button.on('click', () => {
            handleButtonClick(mapName, index, category);

        });
    });
});

//Added a click event listener. When the button is clicked, the code inside the callback function is executed.
btn_hide.on('click', () => {
    const info_panel = document.querySelector('.info-panel').style.display
    if (info_panel === 'none' || !info_panel) {
        document.querySelector('.info-panel').style.display = 'block';
        btn_hide.title = 'Hide';
    } else {
        document.querySelector('.info-panel').style.display = 'none';
        btn_hide.title = 'Show';
    }
});

//Based on the category, selects a map from the corresponding map array and emits events for texture change and
//showing map information.
function handleButtonClick(label, index, category) {
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
    eventEmitter.emit('textureChange', selectedMap);
};
