import {Pane} from 'tweakpane';

// 1. Folder for settings
// 2. Folder for maps (?) images for now, later GEOTIFF, GEOJSON ETC...

//folder for the maps options
const folder_pane = new Pane({
    container: document.getElementById('pane-maps-container'),
});

// Settings folder
const folder_settings = folder_pane.addFolder({
    title: 'Settings',
});
folder_settings.addButton({
    title: 'Hide',
    label: 'Information',
});

//Maps options folder
// const folder_maps = folder_pane.addFolder({
//     title: 'Maps',
// });

const map_categories = {
    Atmosphere: ['Aerosol Optic', 'Aerosol Particles', 'CO2', 'CO2 - 2020', 'Water Vapor'],
    Energy: ['Average Temperature DAY', 'Average Temperature NIGHT', 'Lights Albedo'],
    Life: ['Chlorophyll Concentration', 'Leaf Area'],
    Terrain: ['Earth Texture']
};

const handleButtonClick = (label, index, category) => {
    console.log(`Button clicked: ${label}, Index: ${index}, Category: ${category}`);
};

//create folders and buttons dynamically
Object.keys(map_categories).forEach(category => {
    const folder = folder_pane.addFolder({ title: category });
    
    map_categories[category].forEach((mapName, index) => {
        const button = folder.addButton({
            title: 'Select',
            label: mapName,
        });
        button.on('click', () => handleButtonClick(mapName, index, category));
    });
});
