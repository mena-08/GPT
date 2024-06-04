// import '../modules/render';
// import { Pane } from 'tweakpane';
// import { eventEmitter } from './event-emitter';
// import { sendToAPI } from './chat-manager';

// //GUI configuration to hide it or not
// let GUI = false;


// //Create the maps entries; array with two elements: the key (map name) and the value (map imagepath).
// const maps = {
//     energyMaps: Object.entries(require('../images/energy/*.png')),
//     lifeMaps: Object.entries(require('../images/life/*.png')),
//     atmosphereMaps: Object.entries(require('../images/atmosphere/*.png')),
//     terrainMaps: Object.entries(require('../images/terrain/ter-Earth.jpg')),
//     coralMaps: Object.entries(require('../images/corals/*.png')),
// };
// const map_categories = {
//     Atmosphere: ['Aerosol Optical Thickness', 'Aerosol Particles Radius', 'Cloud Fraction', 'CO2-2020', 'CO2-2023', 'Rainfall', 'Solar Insolation','Water Vapor'],
//     Energy: ['Energy Albedo', 'Average Temperature DAY', 'Average Temperature NIGHT'],
//     Life: ['Chlorophyll Concentration', 'Land Cover','Leaf Area', 'Topography'],
//     Corals: ['Bleaching', 'Heating weeks', 'Hotspots', 'Sea Surface Anomaly', 'Sea Surface Temperature']
//     //Terrain: ['Earth Texture']
// };

// if (GUI){
//     // Create the the UI panes 
//     const parent_pane = new Pane({
//         container: document.getElementById('pane-maps-container'),
//     });
//     const folder_settings = parent_pane.addFolder({
//         title: 'Settings',
//     });
//     const btn_hide = folder_settings.addButton({
//         title: 'Hide',
//         label: 'Information',
//     });

//     //Create the UI buttons with map and category names
//     Object.keys(map_categories).forEach(category => {
//         const folder = parent_pane.addFolder({ title: category });
//         map_categories[category].forEach((mapName, index) => {
//             const button = folder.addButton({
//                 title: 'Select',
//                 label: mapName,
//             });
//             button.on('click', () => {
//                 handleButtonClick(mapName, index, category);
//                 //document.getElementById('map-title-info').innerHTML = mapName;
//                 document.getElementById('map-info').innerHTML = "Loading map information...";
//                 sendToAPI(`Please give me information about a map of ${mapName} from the Earth? It belongs to the category of ${category} \n Please answer in a short paragraph and only the information relevant to the map. Please exclude any introduction words like, "sure!", "certainly!", etc. The information is meant for kids of 8 years. Also, don't include the quote characters.`);
//             });
//         });
//     });

//     //Added a click event listener. When the button is clicked, the code inside the callback function is executed.
//     btn_hide.on('click', () => {
//         const info_panel = document.querySelector('.info-panel').style.display
//         if (info_panel === 'none' || !info_panel) {
//             document.querySelector('.info-panel').style.display = 'block';
//             btn_hide.title = 'Hide';
//         } else {
//             document.querySelector('.info-panel').style.display = 'none';
//             btn_hide.title = 'Show';
//         }
//     });

//     //Based on the category, selects a map from the corresponding map array and emits events for texture change and
//     //showing map information.
//     function handleButtonClick(label, index, category) {
//         switch (category) {
//             case 'Energy':
//                 selectedMap = maps.energyMaps[index][1];
//                 break;
//             case 'Life':
//                 selectedMap = maps.lifeMaps[index][1];
//                 break;
//             case 'Terrain':
//                 selectedMap = maps.terrainMaps[index][1];
//                 break;
//             case 'Atmosphere':
//                 selectedMap = maps.atmosphereMaps[index][1];
//                 break;
//             case 'Corals':
//                 selectedMap = maps.coralMaps[index][1];
//                 break;
//             default:
//                 console.warn(`Unknown category: ${category}`);
//                 return;
//         }
//         eventEmitter.emit('textureChange', selectedMap);
//     };
// }
